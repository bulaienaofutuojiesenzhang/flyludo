import { Alert, Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const requestMediaPermission = async () => {
  try {
    // 检查是否同意过
    const hasAgreed = await AsyncStorage.getItem('mediaPermissionRequested');
    
    if (!hasAgreed) {
      // 第一次请求时显示确认弹窗
      return new Promise((resolve) => {
        Alert.alert(
          '权限申请',
          '同城有约需要访问您的相册和相机来上传图片，是否同意授权？',
          [
            {
              text: '不同意',
              style: 'cancel',
              onPress: () => resolve(false)
            },
            {
              text: '同意',
              onPress: async () => {
                await AsyncStorage.setItem('mediaPermissionRequested', 'true');
                const result = await requestPermissions();
                resolve(result);
              }
            }
          ],
          { cancelable: false }
        );
      });
    } else {
      // 已经同意过,直接请求系统权限
      return true;
    }
  } catch (error) {
    console.error('权限请求错误:', error);
    return false;
  }
};
