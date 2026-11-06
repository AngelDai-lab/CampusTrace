const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, '..', 'campus-trace.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    timestamp TEXT,
    category TEXT NOT NULL,
    mood TEXT NOT NULL,
    text TEXT NOT NULL,
    has_image INTEGER NOT NULL DEFAULT 0,
    image TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT 'daily',
    tags TEXT NOT NULL DEFAULT '[]',
    check_in TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_records_user_date ON records (user_id, date, time);

  -- 知识库文档元数据（切片内容存在 Chroma，这里只存归属与状态）
  CREATE TABLE IF NOT EXISTS kb_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT '',
    size INTEGER NOT NULL DEFAULT 0,
    chunk_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ready',
    error TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_kb_documents_user ON kb_documents (user_id, created_at DESC);
`);

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

function mapRecord(row) {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    timestamp: row.timestamp,
    category: row.category,
    mood: row.mood,
    text: row.text,
    hasImage: !!row.has_image,
    image: row.image,
    type: row.type,
    tags: safeParse(row.tags, []),
    checkIn: safeParse(row.check_in, { isCheckIn: false, topic: 'default' })
  };
}

// ---------- 用户 ----------
function createUser(username, passwordHash) {
  const info = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
  return Number(info.lastInsertRowid);
}

function findUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

function findUserById(id) {
  return db.prepare('SELECT id, username, is_admin FROM users WHERE id = ?').get(id);
}

// 更新用户密码哈希
function updatePassword(userId, passwordHash) {
  const info = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
  return info.changes;
}

// ---------- 用户管理 ----------
// 列出所有用户（含记录数、知识文档数），不返回密码哈希
function listAllUsers() {
  return db
    .prepare(`
      SELECT u.id, u.username, u.created_at,
        (SELECT COUNT(*) FROM records r WHERE r.user_id = u.id) AS record_count,
        (SELECT COUNT(*) FROM kb_documents k WHERE k.user_id = u.id) AS kb_doc_count
      FROM users u
      ORDER BY u.id ASC
    `)
    .all();
}

// 删除用户（级联删除 sessions / records / kb_documents，由外键 ON DELETE CASCADE 处理）
function deleteUser(userId) {
  const info = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  return info.changes;
}

// 获取某用户所有记录的图片路径（用于清理孤儿图片文件）
function listUserRecordImages(userId) {
  return db
    .prepare("SELECT image FROM records WHERE user_id = ? AND image != '' AND image IS NOT NULL")
    .all(userId)
    .map((r) => r.image);
}

// 获取某用户所有知识文档的文件名（用于清理 kb_uploads 文件）
function listUserKbFilenames(userId) {
  return db
    .prepare('SELECT filename FROM kb_documents WHERE user_id = ?')
    .all(userId)
    .map((r) => r.filename);
}

// ---------- 会话 ----------
function createSession(token, userId, expiresAt) {
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);
}

function findSession(token) {
  return db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
}

function deleteSession(token) {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

function deleteExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
}

// 删除某用户除当前 token 外的所有会话（改密码后强制其他设备下线）
function deleteOtherSessions(userId, currentToken) {
  db.prepare('DELETE FROM sessions WHERE user_id = ? AND token != ?').run(userId, currentToken);
}

// ---------- 记录 ----------
function listRecords(userId) {
  return db
    .prepare('SELECT * FROM records WHERE user_id = ? ORDER BY date ASC, time ASC, id ASC')
    .all(userId)
    .map(mapRecord);
}

function insertRecord(userId, record) {
  const info = db
    .prepare(
      `INSERT INTO records (user_id, date, time, timestamp, category, mood, text, has_image, image, type, tags, check_in)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      userId,
      record.date,
      record.time,
      record.timestamp,
      record.category,
      record.mood,
      record.text,
      record.hasImage ? 1 : 0,
      record.image,
      record.type,
      JSON.stringify(record.tags),
      JSON.stringify(record.checkIn)
    );
  const row = db.prepare('SELECT * FROM records WHERE id = ?').get(Number(info.lastInsertRowid));
  return mapRecord(row);
}

function deleteRecord(userId, recordId) {
  const info = db.prepare('DELETE FROM records WHERE id = ? AND user_id = ?').run(recordId, userId);
  return info.changes;
}

// ---------- 知识库文档 ----------
function mapKbDoc(row) {
  return {
    id: row.id,
    userId: row.user_id,
    filename: row.filename,
    originalName: row.original_name,
    mimeType: row.mime_type,
    size: row.size,
    chunkCount: row.chunk_count,
    status: row.status,
    error: row.error,
    createdAt: row.created_at
  };
}

function createKbDocument({ userId, filename, originalName, mimeType, size, chunkCount, status, error }) {
  const info = db
    .prepare(
      `INSERT INTO kb_documents (user_id, filename, original_name, mime_type, size, chunk_count, status, error)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(userId, filename, originalName, mimeType || '', size || 0, chunkCount || 0, status || 'ready', error || '');
  const row = db.prepare('SELECT * FROM kb_documents WHERE id = ?').get(Number(info.lastInsertRowid));
  return mapKbDoc(row);
}

function listKbDocuments(userId) {
  return db
    .prepare('SELECT * FROM kb_documents WHERE user_id = ? ORDER BY created_at DESC, id DESC')
    .all(userId)
    .map(mapKbDoc);
}

function findKbDocument(userId, docId) {
  const row = db.prepare('SELECT * FROM kb_documents WHERE id = ? AND user_id = ?').get(docId, userId);
  return row ? mapKbDoc(row) : null;
}

function updateKbDocumentStatus(docId, { status, chunkCount, error }) {
  db.prepare(
    `UPDATE kb_documents SET status = ?, chunk_count = ?, error = ? WHERE id = ?`
  ).run(status || 'ready', chunkCount || 0, error || '', docId);
}

function deleteKbDocument(userId, docId) {
  const info = db.prepare('DELETE FROM kb_documents WHERE id = ? AND user_id = ?').run(docId, userId);
  return info.changes;
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
  updatePassword,
  listAllUsers,
  deleteUser,
  listUserRecordImages,
  listUserKbFilenames,
  createSession,
  findSession,
  deleteSession,
  deleteExpiredSessions,
  deleteOtherSessions,
  listRecords,
  insertRecord,
  deleteRecord,
  createKbDocument,
  listKbDocuments,
  findKbDocument,
  updateKbDocumentStatus,
  deleteKbDocument
};
