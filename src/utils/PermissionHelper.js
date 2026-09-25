import { Alert, Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    // Android 13+ (API 33)
    if (Platform.Version >= 33) {
      const img = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
      // 场景视频只需图片；顺带申请视频权限不影响
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
 * 业务入口：首次弹确认，再申请系统权限；之后直接申请/校验
 */
export const requestMediaPermission = async () => {
  try {
    const hasAgreed = await AsyncStorage.getItem('mediaPermissionRequested');

    if (!hasAgreed) {
      return new Promise((resolve) => {
        Alert.alert(
          '权限申请',
          '同城有约需要访问您的相册来选择图片，是否同意授权？',
          [
            {
              text: '不同意',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: '同意',
              onPress: async () => {
                await AsyncStorage.setItem('mediaPermissionRequested', 'true');
                const ok = await requestSystemMediaPermission();
                resolve(ok);
              },
            },
          ],
          { cancelable: false }
        );
      });
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
