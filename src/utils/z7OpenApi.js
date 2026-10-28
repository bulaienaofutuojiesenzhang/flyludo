/**
 * App 直连 z7 Open API（X-App-Key / X-App-Secret）
 */
import z7Cfg from '../config/z7OpenApi';

function joinUrl(path) {
  const base = String(z7Cfg.baseUrl || '').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function authHeaders(extra = {}) {
  return {
    'X-App-Key': z7Cfg.appKey,
    'X-App-Secret': z7Cfg.appSecret,
    Accept: 'application/json',
    ...extra,
  };
}

/**
 * JSON POST
 * @returns {Promise<{code:number, message?:string, data?:any}>}
 */
export async function z7Post(path, body, timeoutMs = 60000) {
  const url = joinUrl(path);
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl
    ? setTimeout(() => ctrl.abort(), timeoutMs)
    : null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body || {}),
      signal: ctrl ? ctrl.signal : undefined,
    });
    const raw = await res.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch (_) {
      throw new Error(`z7 响应解析失败(${res.status})`);
    }
    return data || { code: res.status, message: '空响应' };
  } catch (e) {
    if (e?.name === 'AbortError') {
      throw new Error('z7 请求超时');
    }
    throw e;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * multipart 上传到 z7 /uploadR2Img
 * @param {FormData} formData
 * @returns {Promise<string>} 公网 URL
 */
export async function z7Upload(formData, timeoutMs = 120000) {
  const url = joinUrl('/uploadR2Img');
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl
    ? setTimeout(() => ctrl.abort(), timeoutMs)
    : null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders(), // 不要手动设 multipart Content-Type，让 RN 带 boundary
      body: formData,
      signal: ctrl ? ctrl.signal : undefined,
    });
    const raw = await res.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch (_) {
      throw new Error(`上传响应解析失败(${res.status})`);
    }
    if (data && Number(data.code) === 200 && data.data) {
      if (typeof data.data === 'string') return data.data;
      if (data.data.url) return String(data.data.url);
    }
    throw new Error((data && (data.message || data.msg)) || '素材上传失败');
  } catch (e) {
    if (e?.name === 'AbortError') {
      throw new Error('上传超时');
    }
    throw e;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function pickTaskId(data) {
  if (!data) return '';
  return String(data.taskId || data.task_id || '').trim();
}

export default { z7Post, z7Upload, pickTaskId };
