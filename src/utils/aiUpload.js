import Config from '../config/index';
import AsyncStorage from './AsyncStorage';

/**
 * AI / 通用素材上传：走飞行棋自有接口 POST /api/oss/upload → R2 foleme
 * 返回可公网访问的完整 URL（供 z7 AI 拉取）
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

  let url = '/api/oss/upload';
  if (testUrl) {
    url = testUrl + url;
  } else {
    url = Config.API_PATH + url;
  }

  const headers = {
    Accept: 'application/json',
  };
  if (jwToken) {
    headers.Authorization =
      jwToken.indexOf('Bearer ') === 0 ? jwToken : 'Bearer ' + jwToken;
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
    if (typeof res.data === 'string') return res.data;
    if (res.data.url) return res.data.url;
    if (res.data.name) {
      const n = res.data.name;
      if (/^https?:\/\//i.test(n)) return n;
      const base = (Config.File_PATH || '').replace(/\/$/, '');
      return base + (n.startsWith('/') ? n : '/' + n);
    }
    return res.data;
  }
  throw new Error((res && (res.message || res.msg)) || '素材上传失败');
}

/**
 * 根据结果 URL / 业务类型判断媒体类型
 * @param {string} url
 * @param {'video'|'anim'|'image'|string} [hint] 如 sceneVideo → video
 */
export function getResultKind(url, hint) {
  if (hint === 'video' || hint === 'anim' || hint === 'image') return hint;
  const raw = String(url || '');
  const u = raw.split('?')[0].toLowerCase();
  if (/\.(mp4|mov|m4v|webm|mkv|m3u8)$/.test(u)) return 'video';
  if (/\.(webp|gif)$/.test(u)) return 'anim';
  // 无后缀的 CDN 链接：靠路径关键词兜底
  if (/\/(video|videos|mp4)\b/i.test(u) || /[?&](type|format|mime)=.*video/i.test(raw)) {
    return 'video';
  }
  return 'image';
}
