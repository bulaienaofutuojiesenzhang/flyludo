import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppDialog from '../component/AppDialog';

/**
 * 真正向系统申请相册读权限
 */
async function requestSystemMediaPermission() {
  try {
    if (Platform.OS === 'ios') {
      const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      return (
        result === RESULTS.GRANTED ||
        result === RESULTS.LIMITED ||
        result === RESULTS.UNAVAILABLE
      );
    }

    if (Platform.Version >= 33) {
      const img = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
      if (img !== RESULTS.GRANTED) return false;
      try {
        await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
      } catch (_) {}
      return true;
    }

    const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    return result === RESULTS.GRANTED;
  } catch (e) {
    console.error('系统媒体权限请求失败', e);
    return false;
  }
}

/**
 * 业务入口：首次用统一弹窗确认，再申请系统权限
 */
export const requestMediaPermission = async () => {
  try {
    const hasAgreed = await AsyncStorage.getItem('mediaPermissionRequested');

    if (!hasAgreed) {
      const ok = await AppDialog.permission({
        title: '开启相册权限',
        message:
          '同城有约想访问你的相册，方便上传照片玩情侣飞行棋互动和 AI 玩法。仅用于你主动选择的内容。',
      });
      if (!ok) return false;
      await AsyncStorage.setItem('mediaPermissionRequested', 'true');
      return await requestSystemMediaPermission();
    }

    return await requestSystemMediaPermission();
  } catch (error) {
    console.error('权限请求错误:', error);
    return false;
  }
};

/** 规范化本地图片 URI，避免 Android content:// / 裸路径预览空白 */
export function normalizeLocalImageUri(uri) {
  if (!uri || typeof uri !== 'string') return '';
  const u = uri.trim();
  if (!u) return '';
  if (
    u.startsWith('file://') ||
    u.startsWith('content://') ||
    u.startsWith('ph://') ||
    u.startsWith('assets-library://') ||
    /^https?:\/\//i.test(u)
  ) {
    return u;
  }
  if (u.startsWith('/')) return `file://${u}`;
  return u;
}
