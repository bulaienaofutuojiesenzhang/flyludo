/**
 * 新消息系统通知 / 震动（对齐 z7box：react-native-push-notification 本地通知）
 */
import { Platform, PermissionsAndroid, Vibration, AppState } from 'react-native';

const CHANNEL_ID = 'flyludo_msg_v1';

let PushNotification = null;
if (Platform.OS !== 'web') {
  try {
    PushNotification = require('react-native-push-notification').default;
  } catch (_) {}
}

let configured = false;
let channelReady = false;
let permissionAsked = false;

async function ensureNotifyPermission() {
  if (Platform.OS !== 'android' || permissionAsked) return;
  permissionAsked = true;
  if (Platform.Version < 33) return;
  try {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  } catch (_) {}
}

function configurePushOnce() {
  if (configured || !PushNotification || Platform.OS === 'web') return;
  configured = true;
  try {
    PushNotification.configure({
      onRegister() {},
      onNotification() {},
      permissions: { alert: true, badge: true, sound: true },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  } catch (_) {}
}

export function ensureChatNotifyChannel() {
  if (Platform.OS === 'web' || !PushNotification) return;
  configurePushOnce();
  ensureNotifyPermission();
  if (channelReady) return;
  PushNotification.createChannel(
    {
      channelId: CHANNEL_ID,
      channelName: '消息提醒',
      channelDescription: '收到聊天消息时的铃声与震动提醒',
      playSound: true,
      soundName: 'default',
      importance: 5,
      vibrate: true,
    },
    () => {
      channelReady = true;
    }
  );
}

/**
 * @param {{ title?: string, message?: string, playSound?: boolean, vibrate?: boolean }} opts
 */
export function notifyNewMessage(opts = {}) {
  const playSound = opts.playSound !== false;
  const vibrate = opts.vibrate !== false;
  if (!playSound && !vibrate) return;

  if (vibrate) {
    try {
      Vibration.vibrate(Platform.OS === 'android' ? 400 : [0, 400]);
    } catch (_) {}
  }

  if (Platform.OS === 'web' || !PushNotification) return;

  ensureChatNotifyChannel();
  const inForeground = AppState.currentState === 'active';
  try {
    PushNotification.localNotification({
      channelId: CHANNEL_ID,
      title: opts.title || '新消息',
      message: opts.message || '你有一条新消息',
      playSound: playSound && !inForeground,
      soundName: playSound ? 'default' : undefined,
      vibrate: false,
      importance: 'max',
      priority: 'max',
      ignoreInForeground: false,
    });
  } catch (_) {}
}

/** 设置页「测试」：按当前开关试响 */
export function testMessageNotify({ playSound = true, vibrate = true } = {}) {
  notifyNewMessage({
    title: '测试提醒',
    message: '铃声/震动测试成功',
    playSound,
    vibrate,
  });
}
