// ============================================================
// Campus Trace —— 知识库 RAG 模块
// 职责：文档解析 -> 分块 -> Embedding -> Chroma 存储/检索 -> LLM 生成
// 设计原则：
//   1. 多租户隔离：所有切片带 user_id 元数据，检索时强制 where 过滤
//   2. 溯源拒答：LLM 只基于召回片段作答，无依据时固定回复“文档中没有该信息”
//   3. 可观测：返回引用片段（含文档名、chunk 序号、距离分）
// ============================================================

const fs = require('fs');
const path = require('path');

// ---------- 配置（全部走环境变量，便于部署切换） ----------
const CFG = {
  chromaUrl: process.env.CHROMA_URL || 'http://localhost:8000',
  collectionName: process.env.CHROMA_COLLECTION || 'campus_trace_kb',

  llmBaseUrl: process.env.LLM_BASE_URL || 'https://api.siliconflow.cn/v1',
  llmApiKey: process.env.LLM_API_KEY || '',
  llmModel: process.env.LLM_MODEL || 'deepseek-ai/DeepSeek-V3',

  // Embedding 默认与 LLM 共用一套 base/key（硅基流动同时提供两种接口）
  embeddingBaseUrl: process.env.EMBEDDING_BASE_URL || process.env.LLM_BASE_URL || 'https://api.siliconflow.cn/v1',
  embeddingApiKey: process.env.EMBEDDING_API_KEY || process.env.LLM_API_KEY || '',
  embeddingModel: process.env.EMBEDDING_MODEL || 'BAAI/bge-m3',

  chunkSize: Number(process.env.RAG_CHUNK_SIZE) || 500,
  chunkOverlap: Number(process.env.RAG_CHUNK_OVERLAP) || 80,
  topK: Number(process.env.RAG_TOP_K) || 5,
  // Chroma 默认 L2 距离（越小越相关）。最佳切片距离超过该值则视为“无相关信息”，直接拒答
  scoreThreshold: Number(process.env.RAG_SCORE_THRESHOLD) || 1.5,
  // LLM 单次请求超时（毫秒）
  llmTimeout: Number(process.env.LLM_TIMEOUT_MS) || 30000
};

// ---------- 懒加载重依赖（启动时不强制加载，降低冷启动开销） ----------
let _chromaClient = null;
let _collectionPromise = null;

function getChromaClient() {
  if (_chromaClient) return _chromaClient;
  const { ChromaClient } = require('chromadb');
  _chromaClient = new ChromaClient({ path: CFG.chromaUrl });
  return _chromaClient;
}

// 自定义 Embedding Function：调用 OpenAI 兼容的 /embeddings 接口
const embeddingFunction = {
  name: 'openai-compatible-embedding',
  async generate(texts) {
    if (!texts || !texts.length) return [];
    if (!CFG.embeddingApiKey) {
      throw new Error('未配置 EMBEDDING_API_KEY，无法生成向量');
    }
    // 单次最多提交一批，避免超长请求体
    const BATCH = 32;
    const out = [];
    for (let i = 0; i < texts.length; i += BATCH) {
      const batch = texts.slice(i, i + BATCH);
      const resp = await fetch(`${CFG.embeddingBaseUrl.replace(/\/$/, '')}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CFG.embeddingApiKey}`
        },
        body: JSON.stringify({ model: CFG.embeddingModel, input: batch })
      });
      if (!resp.ok) {
        const msg = await resp.text().catch(() => '');
        throw new Error(`Embedding 接口失败 (${resp.status}): ${msg.slice(0, 300)}`);
      }
      const data = await resp.json();
      const embs = (data.data || []).map((d) => d.embedding);
      out.push(...embs);
    }
    return out;
  }
};

async function getCollection() {
  if (_collectionPromise) return _collectionPromise;
  _collectionPromise = (async () => {
    const client = getChromaClient();
    return await client.getOrCreateCollection({
      name: CFG.collectionName,
      embeddingFunction,
      // 默认 L2 距离；如需 cosine 可在此改 metadata
      metadata: { 'hnsw:space': 'l2' }
    });
  })();
  return _collectionPromise;
}

// ---------- 文档解析 ----------
async function parseDocument(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  if (mime === 'text/plain' || ext === '.txt' || ext === '.md' || ext === '.csv') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  if (mime === 'application/pdf' || ext === '.pdf') {
    // pdf-parse v2 API：PDFParse 类 + load() + getText()
    const { PDFParse } = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    await parser.load();
    const result = await parser.getText();
    return (result && result.text) || '';
  }

  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === '.docx'
  ) {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  }

  // 兜底：按文本读（部分 .doc / 纯文本文件可抢救）
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    throw new Error(`不支持的文档格式：${mime || ext}`);
  }
}

// ---------- 分块：递归按段落 -> 句子 -> 字符切分，带 overlap ----------
function chunkText(text, chunkSize = CFG.chunkSize, overlap = CFG.chunkOverlap) {
  if (!text) return [];
  const cleaned = text.replace(/\r\n/g, '\n').replace(/\f/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  if (!cleaned) return [];

  const chunks = [];
  let buffer = '';

  const flush = (s) => {
    if (s) chunks.push(s);
  };

  for (const para of cleaned.split(/\n\n+/)) {
    if ((buffer + '\n\n' + para).length <= chunkSize) {
      buffer = buffer ? buffer + '\n\n' + para : para;
    } else {
      flush(buffer);
      buffer = '';
      if (para.length <= chunkSize) {
        buffer = para;
      } else {
        // 段落过长：按中文/英文句子切分
        const sentences = para.match(/[^。！？!?]+[。！？!?]?\s*/g) || [para];
        let sentBuf = '';
        for (const s of sentences) {
          if ((sentBuf + s).length <= chunkSize) {
            sentBuf += s;
          } else {
            flush(sentBuf);
            sentBuf = '';
            if (s.length > chunkSize) {
              // 单句仍超长：硬切
              for (let i = 0; i < s.length; i += chunkSize - overlap) {
                chunks.push(s.slice(i, i + chunkSize));
              }
            } else {
              sentBuf = s;
            }
          }
        }
        buffer = sentBuf;
      }
    }
  }
  flush(buffer);

  // 相邻块拼接尾部 overlap，保留上下文连贯性
  if (overlap > 0) {
    for (let i = 1; i < chunks.length; i++) {
      const tail = chunks[i - 1].slice(-overlap);
      chunks[i] = tail + chunks[i];
    }
  }
  return chunks.filter((c) => c.trim().length > 0);
}

// ---------- 写入：解析 -> 分块 -> 向量化 -> 存入 Chroma ----------
async function ingestDocument({ userId, docId, docName, filePath, mimeType }) {
  const text = await parseDocument(filePath, mimeType);
  const chunks = chunkText(text);
  if (!chunks.length) {
    return { chunkCount: 0, charCount: 0 };
  }

  const collection = await getCollection();
  const ids = chunks.map((_, i) => `u${userId}_d${docId}_c${i}`);
  const metadatas = chunks.map((_, i) => ({
    user_id: String(userId),
    doc_id: String(docId),
    doc_name: docName,
    chunk_index: i
  }));

  await collection.add({ ids, documents: chunks, metadatas });
  return { chunkCount: chunks.length, charCount: text.length };
}

// ---------- 检索：仅在当前用户的切片内召回 ----------
async function retrieveChunks({ userId, question, k = CFG.topK }) {
  const collection = await getCollection();
  const result = await collection.query({
    queryTexts: [question],
    nResults: k,
    where: { user_id: String(userId) }
  });

  const ids = (result.ids && result.ids[0]) || [];
  const documents = (result.documents && result.documents[0]) || [];
  const metadatas = (result.metadatas && result.metadatas[0]) || [];
  const distances = (result.distances && result.distances[0]) || [];

  return ids.map((id, i) => ({
    id,
    text: documents[i] || '',
    metadata: metadatas[i] || {},
    distance: typeof distances[i] === 'number' ? distances[i] : null
  }));
}

// ---------- LLM 生成：强制基于上下文 + 引用 + 拒答 ----------
const SYSTEM_PROMPT = `你是 Campus Trace 校园迹忆的知识库助手，专门帮助大学生从自己上传的政策文档（保研通知、奖学金文件、培养方案等）中查找规则。

【严格规则】
1. 只能依据下面提供的“参考片段”回答，禁止使用你的预训练知识或编造内容。
2. 回答时必须在相关句子末尾用 [文档名] 标注引用来源。
3. 如果参考片段中没有与问题相关的信息，必须且只能回复：文档中没有该信息
4. 保持回答简洁、条理清晰，优先分点列出条件、数值、期限等关键信息。
5. 不要提及“参考片段”“上下文”等字眼，直接给出结论。`;

function buildUserMessage(question, chunks) {
  const context = chunks
    .map((c, i) => {
      const name = (c.metadata && c.metadata.doc_name) || '未知文档';
      return `【片段${i + 1} · 来源：${name}】\n${c.text}`;
    })
    .join('\n\n');
  return `参考片段：\n${context}\n\n用户问题：${question}`;
}

async function callLLM(messages) {
  if (!CFG.llmApiKey) {
    throw new Error('未配置 LLM_API_KEY，无法调用大模型');
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CFG.llmTimeout);
  try {
    const resp = await fetch(`${CFG.llmBaseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CFG.llmApiKey}`
      },
      body: JSON.stringify({
        model: CFG.llmModel,
        messages,
        temperature: 0,
        stream: false
      }),
      signal: ctrl.signal
    });
    if (!resp.ok) {
      const msg = await resp.text().catch(() => '');
      throw new Error(`LLM 接口失败 (${resp.status}): ${msg.slice(0, 300)}`);
    }
    const data = await resp.json();
    return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
  } finally {
    clearTimeout(timer);
  }
}

// ---------- 端到端问答 ----------
async function ask({ userId, question }) {
  const q = String(question || '').trim();
  if (!q) throw new Error('问题不能为空');

  // 1. 检索（仅当前用户）
  let chunks = [];
  try {
    chunks = await retrieveChunks({ userId, question: q });
  } catch (err) {
    // Chroma 未启动等情况
    throw new Error(`知识库检索失败：${err.message}`);
  }

  // 2. 无召回 / 召回质量过低 -> 直接拒答，不调用 LLM
  if (!chunks.length) {
    return { answer: '文档中没有该信息', citations: [] };
  }
  const bestDistance = chunks[0].distance;
  if (typeof bestDistance === 'number' && bestDistance > CFG.scoreThreshold) {
    return { answer: '文档中没有该信息', citations: [] };
  }

  // 3. 调用 LLM
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserMessage(q, chunks) }
  ];
  const answer = await callLLM(messages);

  // 4. 整理引用（去重，按文档名聚合）
  const citationMap = new Map();
  for (const c of chunks) {
    const name = (c.metadata && c.metadata.doc_name) || '未知文档';
    if (!citationMap.has(name)) {
      citationMap.set(name, { docName: name, snippets: [] });
    }
    citationMap.get(name).snippets.push({
      chunkIndex: c.metadata.chunk_index,
      text: c.text,
      distance: c.distance
    });
  }
  const citations = Array.from(citationMap.values());

  return { answer: answer.trim() || '文档中没有该信息', citations };
}

// ---------- 删除某文档的全部切片 ----------
async function deleteDocumentChunks({ userId, docId }) {
  const collection = await getCollection();
  // Chroma 的 where 只能有一个顶层操作符，多条件需用 $and 组合
  await collection.delete({
    where: { $and: [{ doc_id: String(docId) }, { user_id: String(userId) }] }
  });
}

// 删除某用户在 Chroma 中的所有切片（删除用户时调用）
async function deleteUserChunks({ userId }) {
  const collection = await getCollection();
  await collection.delete({ where: { user_id: String(userId) } });
}

// ---------- 健康检查 ----------
async function healthCheck() {
  try {
    const client = getChromaClient();
    await client.heartbeat();
    return { ok: true, chroma: CFG.chromaUrl };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = {
  CFG,
  ingestDocument,
  retrieveChunks,
  ask,
  deleteDocumentChunks,
  deleteUserChunks,
  healthCheck
};
