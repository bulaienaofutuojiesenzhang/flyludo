import { launchImageLibrary } from 'react-native-image-picker';
import Config from '../config';
import HttpFrom from './HttpFrom';

/**
 * 选图并上传到 /api/oss/upload
 * @returns {Promise<string|null>} 可访问的完整 URL
 */
export function pickAndUploadImage(options = {}) {
  const { selectionLimit = 1 } = options;
  return new Promise((resolve) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit,
        quality: 0.85,
      },
      async (response) => {
        if (response?.didCancel || response?.errorCode) {
          resolve(null);
          return;
        }
        const assets = response?.assets || [];
        if (!assets.length) {
          resolve(null);
          return;
        }
        try {
          if (selectionLimit === 1) {
            const a = assets[0];
            const url = await uploadAsset(a);
            resolve(url);
          } else {
            const urls = [];
            for (const a of assets) {
              const u = await uploadAsset(a);
              if (u) urls.push(u);
            }
            resolve(urls);
          }
        } catch (e) {
          console.warn('[socialUpload]', e);
          resolve(selectionLimit === 1 ? null : []);
        }
      }
    );
  });
}

export async function uploadAsset(asset) {
  if (!asset?.uri && !asset?.path) return null;
  let uri = String(asset.uri || asset.path || '');
  if (uri.startsWith('/') && !uri.startsWith('file://')) {
    uri = `file://${uri}`;
  }
  const res = await HttpFrom.imgUpData(
    uri,
    asset.type || asset.mime || 'image/jpeg',
    asset.fileName || asset.filename || `img_${Date.now()}.jpg`
  );
  if (!res || res.code !== 200) return null;
  if (res.data?.url) return String(res.data.url);
  const name = res.data?.name;
  if (!name) return null;
  if (/^https?:\/\//i.test(name)) return name;
  const base = String(Config.File_PATH || '').replace(/\/$/, '');
  return `${base}/${String(name).replace(/^\//, '')}`;
}
