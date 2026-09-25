import Config from '../config/index';
import AsyncStorage from './AsyncStorage';

/**
 * AI 素材上传到 tongcheng BFF：POST /ai-proxy/upload
 * 复用 HttpFrom 的 FormData 模式，JWT 与 HttpPost 一致（Bearer）
 */
export async function uploadAiFile(asset, options = {}) {
  const isVideo = !!options.isVideo;
  const jwToken = await AsyncStorage.getItem('jwToken');
  const testUrl = await AsyncStorage.getItem('testUrl');

  const uri = asset.uri;
  const name =
    asset.fileName ||
    asset.name ||
    `ai_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`;
  const type = asset.type || (isVideo ? 'video/mp4' : 'image/jpeg');

  const formData = new FormData();
  formData.append('file', { uri, type, name });

  let url = '/ai-proxy/upload';
  if (testUrl) {
    url = testUrl + url;
  } else {
    url = Config.API_PATH + url;
  }

  // 不要手动设 Content-Type：RN fetch 需自动带 multipart boundary
  const headers = {
    Accept: 'application/json',
  };
  if (jwToken) {
    headers.Authorization = 'Bearer ' + jwToken;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });
  const raw = await response.text();
  let res;
  try {
    res = raw ? JSON.parse(raw) : null;
  } catch (_) {
    throw new Error(
      response.ok ? '上传响应解析失败' : `素材上传失败(${response.status})`
    );
  }
  if (res && res.code === 200 && res.data) {
    // data 可能是字符串 URL，或 { url / name }
    if (typeof res.data === 'string') return res.data;
    if (res.data.url) return res.data.url;
    if (res.data.name) {
      // 若只返回相对 path，拼 File_PATH
      const n = res.data.name;
      if (/^https?:\/\//i.test(n)) return n;
      return (Config.File_PATH || '') + n;
    }
    return res.data;
  }
  throw new Error((res && (res.message || res.msg)) || '素材上传失败');
}

/** 根据结果 URL 后缀判断媒体类型 */
export function getResultKind(url) {
  const u = String(url || '').split('?')[0].toLowerCase();
  if (/\.(mp4|mov|webm|m3u8)$/.test(u)) return 'video';
  if (/\.(webp|gif)$/.test(u)) return 'anim';
  return 'image';
}
