// =============================================
// Campus Trace 校园迹忆 —— 登录状态与 API 封装
// =============================================

const TOKEN_KEY = 'campusTraceToken';
let authMode = 'login';

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// 统一请求封装：自动携带 token，401 时回到登录页
async function apiFetch(path, options = {}) {
  const headers = Object.assign({}, options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(path, Object.assign({}, options, { headers }));

  if (response.status === 401) {
    clearToken();
    showAuth('登录已失效，请重新登录');
    throw new Error('请先登录');
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error((data && data.error) || '请求失败');
  }
  return data;
}

function showAuth(message) {
  const overlay = document.getElementById('authOverlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  const errorEl = document.getElementById('authError');
  if (errorEl) errorEl.textContent = message || '';
  const usernameInput = document.getElementById('authUsername');
  if (usernameInput) setTimeout(() => usernameInput.focus(), 50);
}

function hideAuth() {
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.style.display = 'none';
}

function setCurrentUser(username, isAdmin) {
  const el = document.getElementById('currentUser');
  if (el) el.textContent = username || '未登录';
  if (typeof isAdmin !== 'undefined') {
    localStorage.setItem('ct_is_admin', isAdmin ? '1' : '0');
  }
}

function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });
  const submitBtn = document.getElementById('authSubmit');
  if (submitBtn) {
    submitBtn.innerHTML =
      mode === 'login'
        ? '<i class="fas fa-sign-in-alt me-1"></i>登录'
        : '<i class="fas fa-user-plus me-1"></i>注册';
  }
  const passwordInput = document.getElementById('authPassword');
  if (passwordInput) {
    passwordInput.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  }
  const errorEl = document.getElementById('authError');
  if (errorEl) errorEl.textContent = '';
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const usernameInput = document.getElementById('authUsername');
  const passwordInput = document.getElementById('authPassword');
  const errorEl = document.getElementById('authError');
  const submitBtn = document.getElementById('authSubmit');

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (username.length < 2 || username.length > 20) {
    errorEl.textContent = '用户名长度需在 2-20 个字符之间';
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = '密码至少需要 6 位';
    return;
  }

  const originalHtml = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.textContent = authMode === 'login' ? '登录中...' : '注册中...';
  errorEl.textContent = '';

  try {
    const response = await fetch(`/api/auth/${authMode === 'login' ? 'login' : 'register'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || '请求失败');

    setToken(data.token);
    setCurrentUser(data.user.username, data.user.isAdmin);
    hideAuth();
    await init();
  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHtml;
  }
}

async function logout() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch (err) {
    // 退出失败也直接清除本地登录态
  }
  clearToken();
  location.reload();
}

async function bootstrapAuth() {
  if (!getToken()) {
    setAuthMode('login');
    showAuth();
    return;
  }
  try {
    const data = await apiFetch('/api/auth/me');
    setCurrentUser(data.user.username, data.user.isAdmin);
    hideAuth();
    await init();
  } catch (err) {
    clearToken();
    setAuthMode('login');
    showAuth('登录已失效，请重新登录');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('authForm');
  if (form) form.addEventListener('submit', handleAuthSubmit);

  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.addEventListener('click', () => setAuthMode(tab.dataset.mode));
  });

  bootstrapAuth();
});
