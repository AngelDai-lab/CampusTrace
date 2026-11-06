require('dotenv').config();

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const db = require('./db');
const rag = require('./rag');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const UPLOAD_DIR = path.join(ROOT_DIR, 'uploads');
const KB_UPLOAD_DIR = path.join(ROOT_DIR, 'kb_uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(KB_UPLOAD_DIR, { recursive: true });

const app = express();
app.use(express.json({ limit: '1mb' }));

const CATEGORIES = ['学习', '生活', '活动', '碎碎念'];
const MOODS = ['开心', '平静', '难过', '焦虑', '专注'];
const SESSION_DAYS = 7;

// ---------- 密码与登录态 ----------
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  db.createSession(token, userId, expiresAt);
  return token;
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return res.status(401).json({ error: '请先登录' });
  }
  const session = db.findSession(token);
  if (!session) {
    return res.status(401).json({ error: '登录已失效，请重新登录' });
  }
  if (session.expires_at < Date.now()) {
    db.deleteSession(token);
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
  req.userId = session.user_id;
  req.token = token;
  const user = db.findUserById(session.user_id);
  req.isAdmin = !!(user && user.is_admin);
  next();
}

// 仅管理员可访问
function adminRequired(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ error: '权限不足，仅管理员可执行此操作' });
  }
  next();
}

// ---------- 鉴权接口 ----------
app.post('/api/auth/register', (req, res) => {
  const username = String((req.body && req.body.username) || '').trim();
  const password = String((req.body && req.body.password) || '');

  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: '用户名长度需在 2-20 个字符之间' });
  }
  if (password.length < 6 || password.length > 50) {
    return res.status(400).json({ error: '密码长度需在 6-50 个字符之间' });
  }
  if (db.findUserByUsername(username)) {
    return res.status(409).json({ error: '用户名已被注册' });
  }

  const userId = db.createUser(username, hashPassword(password));
  db.deleteExpiredSessions();
  const token = createSession(userId);
  res.status(201).json({ token, user: { id: userId, username, isAdmin: false } });
});

app.post('/api/auth/login', (req, res) => {
  const username = String((req.body && req.body.username) || '').trim();
  const password = String((req.body && req.body.password) || '');

  const user = db.findUserByUsername(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  db.deleteExpiredSessions();
  const token = createSession(user.id);
  res.json({ token, user: { id: user.id, username: user.username, isAdmin: !!user.is_admin } });
});

app.get('/api/auth/me', authRequired, (req, res) => {
  const user = db.findUserById(req.userId);
  if (!user) return res.status(401).json({ error: '用户不存在' });
  res.json({ user: { id: user.id, username: user.username, isAdmin: !!user.is_admin } });
});

app.post('/api/auth/logout', authRequired, (req, res) => {
  db.deleteSession(req.token);
  res.status(204).end();
});

// 修改密码：需验证旧密码，成功后清除其他会话（保留当前）
app.put('/api/auth/password', authRequired, (req, res) => {
  const oldPwd = String((req.body && req.body.oldPassword) || '');
  const newPwd = String((req.body && req.body.newPassword) || '');

  if (!oldPwd) return res.status(400).json({ error: '请输入旧密码' });
  if (newPwd.length < 6 || newPwd.length > 50) {
    return res.status(400).json({ error: '新密码长度需在 6-50 个字符之间' });
  }
  if (oldPwd === newPwd) {
    return res.status(400).json({ error: '新密码不能与旧密码相同' });
  }

  const user = db.findUserById(req.userId);
  if (!user) return res.status(401).json({ error: '用户不存在' });

  // findUserById 不返回 password_hash，需重新查
  const full = db.findUserByUsername(user.username);
  if (!full || !verifyPassword(oldPwd, full.password_hash)) {
    return res.status(400).json({ error: '旧密码错误' });
  }

  db.updatePassword(req.userId, hashPassword(newPwd));

  // 清除该用户除当前会话外的所有会话，强制其他设备重新登录
  db.deleteOtherSessions(req.userId, req.token);

  res.json({ message: '密码修改成功' });
});

// ---------- 记录接口 ----------
function validateRecord(body) {
  const date = String(body.date || '');
  const time = String(body.time || '');
  const category = String(body.category || '');
  const mood = String(body.mood || '');
  const text = String(body.text || '').trim();
  const type = body.type === 'milestone' ? 'milestone' : 'daily';
  const image = String(body.image || '');

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: '日期格式不正确' };
  if (!/^\d{2}:\d{2}$/.test(time)) return { error: '时间格式不正确' };
  if (!CATEGORIES.includes(category)) return { error: '分类不合法' };
  if (!MOODS.includes(mood)) return { error: '心情不合法' };
  if (!text) return { error: '记录内容不能为空' };
  if (text.length > 5000) return { error: '记录内容过长' };
  if (image && !/^\/uploads\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|gif|webp|bmp)$/.test(image)) {
    return { error: '图片地址不合法' };
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag) => typeof tag === 'string').slice(0, 10)
    : [];
  const checkIn =
    body.checkIn && typeof body.checkIn === 'object'
      ? { isCheckIn: !!body.checkIn.isCheckIn, topic: String(body.checkIn.topic || 'default') }
      : { isCheckIn: false, topic: 'default' };

  return {
    success: true,
    record: {
      date,
      time,
      timestamp: String(body.timestamp || new Date().toISOString()),
      category,
      mood,
      text,
      hasImage: !!image,
      image,
      type,
      tags,
      checkIn
    }
  };
}

app.get('/api/records', authRequired, (req, res) => {
  res.json(db.listRecords(req.userId));
});

app.post('/api/records', authRequired, (req, res) => {
  const result = validateRecord(req.body || {});
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json(db.insertRecord(req.userId, result.record));
});

app.delete('/api/records/:id', authRequired, (req, res) => {
  const recordId = Number(req.params.id);
  if (!Number.isInteger(recordId) || recordId <= 0) {
    return res.status(400).json({ error: '记录 ID 不合法' });
  }
  const changes = db.deleteRecord(req.userId, recordId);
  if (!changes) return res.status(404).json({ error: '记录不存在' });
  res.status(204).end();
});

// ---------- 图片上传 ----------
const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/bmp': '.bmp'
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + (EXT_BY_MIME[file.mimetype] || ''))
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (EXT_BY_MIME[file.mimetype]) cb(null, true);
    else cb(new Error('只支持 JPG、PNG、GIF、WEBP、BMP 格式的图片'));
  }
});

app.post('/api/uploads', authRequired, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: '没有收到图片文件' });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

// ---------- 知识库 RAG ----------
const KB_EXT_BY_MIME = {
  'text/plain': '.txt',
  'text/markdown': '.md',
  'text/csv': '.csv',
  'application/pdf': '.pdf',
  'application/x-pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
};
const KB_ALLOWED_EXTS = ['.txt', '.md', '.csv', '.pdf', '.docx'];

const kbUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, KB_UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = KB_EXT_BY_MIME[file.mimetype] || path.extname(file.originalname);
      cb(null, crypto.randomBytes(16).toString('hex') + ext);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // MIME 命中直接放行；否则按扩展名兜底（Windows 部分浏览器 MIME 不准）
    if (KB_EXT_BY_MIME[file.mimetype]) return cb(null, true);
    const ext = path.extname(file.originalname).toLowerCase();
    if (KB_ALLOWED_EXTS.includes(ext)) return cb(null, true);
    cb(new Error('只支持 TXT、MD、CSV、PDF、DOCX 格式的文档'));
  }
});

// 上传文档 -> 解析 -> 分块 -> 向量化 -> 存入 Chroma（切片绑定 user_id）
app.post('/api/kb/documents', authRequired, (req, res) => {
  kbUpload.single('document')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: '没有收到文档文件' });

    // multer 从 multipart header 解析 filename 时默认用 latin-1，中文文件名会乱码
    // 需把 latin-1 字节按 UTF-8 重新解码
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    const doc = db.createKbDocument({
      userId: req.userId,
      filename: req.file.filename,
      originalName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      chunkCount: 0,
      status: 'processing'
    });

    try {
      const { chunkCount } = await rag.ingestDocument({
        userId: req.userId,
        docId: doc.id,
        docName: originalName,
        filePath: req.file.path,
        mimeType: req.file.mimetype
      });
      db.updateKbDocumentStatus(doc.id, { status: 'ready', chunkCount });
      res.status(201).json(db.findKbDocument(req.userId, doc.id));
    } catch (e) {
      // 解析/向量化失败也保留记录（status=error），便于用户查看原因并删除
      db.updateKbDocumentStatus(doc.id, { status: 'error', error: e.message });
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      res.status(200).json(db.findKbDocument(req.userId, doc.id));
    }
  });
});

// 列出当前用户的知识库文档
app.get('/api/kb/documents', authRequired, (req, res) => {
  res.json(db.listKbDocuments(req.userId));
});

// 删除文档（DB 记录 + Chroma 切片 + 本地文件）
app.delete('/api/kb/documents/:id', authRequired, async (req, res) => {
  const docId = Number(req.params.id);
  if (!Number.isInteger(docId) || docId <= 0) {
    return res.status(400).json({ error: '文档 ID 不合法' });
  }
  const doc = db.findKbDocument(req.userId, docId);
  if (!doc) return res.status(404).json({ error: '文档不存在' });

  try {
    await rag.deleteDocumentChunks({ userId: req.userId, docId });
  } catch (e) {
    // Chroma 删除失败不阻塞本地记录清理，但返回提示
    console.error('Chroma 切片删除失败：', e.message);
  }

  const filePath = path.join(KB_UPLOAD_DIR, doc.filename);
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}

  db.deleteKbDocument(req.userId, docId);
  res.status(204).end();
});

// 知识库问答：检索 -> LLM 生成 -> 返回答案 + 引用
app.post('/api/kb/ask', authRequired, async (req, res) => {
  const question = String((req.body && req.body.question) || '').trim();
  if (!question) return res.status(400).json({ error: '问题不能为空' });
  if (question.length > 1000) return res.status(400).json({ error: '问题过长' });

  try {
    const result = await rag.ask({ userId: req.userId, question });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 知识库健康检查（Chroma 连通性）
app.get('/api/kb/health', authRequired, async (req, res) => {
  const h = await rag.healthCheck();
  res.json(h);
});

// ---------- 用户管理 ----------
// 列出所有用户（含记录数、知识文档数、注册时间），不返回密码
app.get('/api/admin/users', authRequired, adminRequired, (req, res) => {
  const users = db.listAllUsers().map((u) => ({
    id: u.id,
    username: u.username,
    createdAt: u.created_at,
    recordCount: u.record_count,
    kbDocCount: u.kb_doc_count
  }));
  res.json(users);
});

// 删除用户：级联清理 Chroma 切片 + 上传的图片/文档文件 + 数据库记录
app.delete('/api/admin/users/:id', authRequired, adminRequired, async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ error: '用户 ID 不合法' });
  }
  if (targetId === req.userId) {
    return res.status(400).json({ error: '不能删除当前登录的用户' });
  }
  const target = db.findUserById(targetId);
  if (!target) return res.status(404).json({ error: '用户不存在' });

  // 1. 清理 Chroma 中该用户的所有切片
  try {
    await rag.deleteUserChunks({ userId: targetId });
  } catch (e) {
    console.error('Chroma 用户切片清理失败：', e.message);
  }

  // 2. 清理该用户上传的知识文档文件
  try {
    const kbFiles = db.listUserKbFilenames(targetId);
    kbFiles.forEach((fn) => {
      const p = path.join(KB_UPLOAD_DIR, fn);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
  } catch (e) {
    console.error('知识文档文件清理失败：', e.message);
  }

  // 3. 清理该用户记录中引用的图片文件
  try {
    const images = db.listUserRecordImages(targetId);
    images.forEach((imgUrl) => {
      // imgUrl 形如 /uploads/xxx.png，提取文件名
      const fn = path.basename(imgUrl);
      const p = path.join(UPLOAD_DIR, fn);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
  } catch (e) {
    console.error('记录图片清理失败：', e.message);
  }

  // 4. 删除用户（级联删除 sessions / records / kb_documents）
  db.deleteUser(targetId);
  res.status(204).end();
});

// ---------- 静态资源 ----------
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));
app.use(express.static(PUBLIC_DIR));

app.use('/api', (req, res) => res.status(404).json({ error: '接口不存在' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`Campus Trace 已启动：http://localhost:${PORT}`);
});
