/**
 * App 初始化服务
 * 用于检查版本更新和 app 可用性
 */
import { Platform } from 'react-native';
import Http from './HttpPost';
import Version from '../config/Version.json';

/**
 * 初始化 App
 * @returns {Promise} 返回初始化结果
 */
export const initializeApp = async () => {
  try {
    const platform = Platform.OS; // 'android' 或 'ios'
    const currentVersion = `${Version.version}.${Version.versionNum}`; // 例如: "3.1.0"

    const response = await Http('post', '/app/init', {
      version: currentVersion,
      platform: platform,
    });

    if (response.code === 200) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || '初始化失败',
        data: response.data,
      };
    }
  } catch (error) {
    console.error('App初始化失败:', error);
    return {
      success: false,
      message: '网络错误或服务器异常',
      error: error,
    };
  }
};

/**
 * 检查是否需要更新
 * @param {Object} initData - 初始化接口返回的数据
 * @returns {Object} 包含更新信息的对象
 */
export const checkUpdateStatus = (initData) => {
  if (!initData) {
    return {
      needUpdate: false,
      forceUpdate: false,
      canUse: true,
    };
  }

  return {
    needUpdate: initData.needUpdate || false,
    forceUpdate: initData.forceUpdate || false,
    canUse: initData.canUse !== false, // 默认为 true
    currentVersion: initData.currentVersion,
    latestVersion: initData.latestVersion,
    downloadUrl: initData.downloadUrl,
    message: initData.message || '当前版本正常',
  };
};

/**
 * 获取当前版本号
 * @returns {String} 当前版本号
 */
export const getCurrentVersion = () => {
  return `${Version.version}.${Version.versionNum}`;
};

export default {
  initializeApp,
  checkUpdateStatus,
  getCurrentVersion,
};

