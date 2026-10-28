import { Platform } from 'react-native';
import { normalizeLocalImageUri } from './PermissionHelper';
import { z7Upload } from './z7OpenApi';

function guessMime(name, isVideo) {
  const lower = String(name || '').toLowerCase();
  if (isVideo || /\.(mp4|mov|m4v|webm|mkv)$/.test(lower)) return 'video/mp4';
  if (/\.png$/.test(lower)) return 'image/png';
  if (/\.webp$/.test(lower)) return 'image/webp';
  if (/\.gif$/.test(lower)) return 'image/gif';
  if (/\.(heic|heif)$/.test(lower)) return 'image/heic';
  return 'image/jpeg';
}

function normalizeMime(type, name, isVideo) {
  let t = String(type || '')
    .toLowerCase()
    .trim();
  if (!t || t === 'image' || t === 'image/*' || t === 'video' || t === 'video/*') {
    return guessMime(name, isVideo);
  }
  if (t === 'image/jpg' || t === 'image/pjpeg') return 'image/jpeg';
  if (t === 'audio/mp4' && isVideo) return 'video/mp4';
  return t;
}

function ensureFileName(name, mime, isVideo) {
  let n = String(name || '').trim() || `ai_${Date.now()}`;
  n = n.replace(/[^\w.\-()\u4e00-\u9fa5]+/g, '_').slice(0, 80);
  if (/\.\w{1,8}$/.test(n)) return n;
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/heic': '.heic',
    'image/heif': '.heif',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
  };
  return n + (map[mime] || (isVideo ? '.mp4' : '.jpg'));
}

/**
 * AI 素材上传：直连 z7 Open /uploadR2Img
 * @returns {Promise<string>} 公网 URL
 */
export async function uploadAiFile(asset, options = {}) {
  const isVideo = !!options.isVideo;
  if (!asset || !asset.uri) {
    throw new Error('未选择素材文件');
  }

  let uri = normalizeLocalImageUri(asset.uri || asset.path || asset.sourceURL);
  if (!uri) {
    throw new Error('素材路径无效');
  }
  if (Platform.OS === 'android' && uri.startsWith('/') && !uri.startsWith('file://')) {
    uri = `file://${uri}`;
  }

  const mime = normalizeMime(
    asset.type || asset.mime,
    asset.fileName || asset.name || asset.filename,
    isVideo
  );
  const name = ensureFileName(
    asset.fileName || asset.name || asset.filename,
    mime,
    isVideo
  );

  const formData = new FormData();
  formData.append('file', { uri, type: mime, name });

  try {
    return await z7Upload(formData);
  } catch (e) {
    throw new Error(e?.message || '网络异常，素材上传失败');
  }
}

/**
 * 根据结果 URL / 业务类型判断媒体类型
 */
export function getResultKind(url, hint) {
  if (hint === 'video' || hint === 'anim' || hint === 'image') return hint;
  const raw = String(url || '');
  const u = raw.split('?')[0].toLowerCase();
  if (/\.(mp4|mov|m4v|webm|mkv|m3u8)$/.test(u)) return 'video';
  if (/\.(webp|gif)$/.test(u)) return 'anim';
  if (/\/(video|videos|mp4)\b/i.test(u) || /[?&](type|format|mime)=.*video/i.test(raw)) {
    return 'video';
  }
  return 'image';
}
