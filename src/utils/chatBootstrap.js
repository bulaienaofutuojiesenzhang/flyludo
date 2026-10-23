/**
 * 本地会话列表维护：监听 NEW_MESSAGE，更新 CONV_LIST_* 与未读角标
 */
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from './AsyncStorage';

let started = false;
let myUserId = '';
let onUnreadChange = null;

function previewOf(msg) {
  const type = String(msg?.type || 'text').toLowerCase();
  if (type === 'text') return String(msg.content || '').slice(0, 80);
  if (type === 'image') return '[图片]';
  if (type === 'video') return '[视频]';
  if (type === 'voice' || type === 'audio') return '[语音]';
  if (type === 'gift') {
    try {
      const g = JSON.parse(msg.content || '{}');
      return `[礼物]${g.name || ''}`;
    } catch (_) {
      return '[礼物]';
    }
  }
  return `[${type}]`;
}

function partnerIdOf(msg, meId) {
  const from = String(msg.fromUserId || '');
  const to = String(msg.toUserId || '');
  if (from === meId) return to;
  return from;
}

async function upsertConv(msg) {
  const meId = String(myUserId || '').trim();
  if (!meId) return;

  const partnerId = partnerIdOf(msg, meId);
  if (!partnerId) return;

  const key = `CONV_LIST_${meId}`;
  let list = [];
  try {
    const raw = await AsyncStorage.getItem(key);
    list = raw ? JSON.parse(raw) : [];
  } catch (_) {
    list = [];
  }
  if (!Array.isArray(list)) list = [];

  const ts = Number(msg.time) || Date.now();
  const incoming = String(msg.toUserId) === meId;
  const idx = list.findIndex((c) => String(c.partnerId) === partnerId);
  const lastMessage = {
    content: previewOf(msg),
    timestamp: Math.floor(ts / 1000),
    type: msg.type || 'text',
  };

  if (idx >= 0) {
    const prev = list[idx];
    const nextUnread = incoming && !msg.silent
      ? (Number(prev.unreadCount) || 0) + 1
      : Number(prev.unreadCount) || 0;
    list[idx] = {
      ...prev,
      partnerId,
      nickName: msg.nickName || prev.nickName || partnerId,
      faceUrl: msg.faceUrl || prev.faceUrl || '',
      lastMessage,
      unreadCount: incoming ? nextUnread : prev.unreadCount || 0,
      updatedAt: ts,
    };
    const [item] = list.splice(idx, 1);
    list.unshift(item);
  } else {
    list.unshift({
      partnerId,
      nickName: msg.nickName || partnerId,
      faceUrl: msg.faceUrl || '',
      lastMessage,
      unreadCount: incoming ? 1 : 0,
      updatedAt: ts,
    });
  }

  await AsyncStorage.setItem(key, JSON.stringify(list.slice(0, 200)));
  const totalUnread = list.reduce((sum, item) => sum + (Number(item.unreadCount) || 0), 0);
  if (typeof onUnreadChange === 'function') onUnreadChange(totalUnread);
  DeviceEventEmitter.emit('REFRESH_CONV_LIST');
}

export function startChatBootstrap(userId, unreadCb) {
  myUserId = String(userId || '').trim();
  onUnreadChange = unreadCb || null;
  if (started) return;
  started = true;
  DeviceEventEmitter.addListener('NEW_MESSAGE', (msg) => {
    upsertConv(msg).catch((e) => console.warn('[chatBootstrap]', e));
  });
}

export function stopChatBootstrap() {
  myUserId = '';
  onUnreadChange = null;
}

export async function clearConvUnread(partnerId) {
  const meId = String(myUserId || '').trim();
  if (!meId || !partnerId) return;
  const key = `CONV_LIST_${meId}`;
  try {
    const raw = await AsyncStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return;
    let changed = false;
    for (const c of list) {
      if (String(c.partnerId) === String(partnerId) && c.unreadCount) {
        c.unreadCount = 0;
        changed = true;
      }
    }
    if (changed) {
      await AsyncStorage.setItem(key, JSON.stringify(list));
      const totalUnread = list.reduce((sum, item) => sum + (Number(item.unreadCount) || 0), 0);
      if (typeof onUnreadChange === 'function') onUnreadChange(totalUnread);
      DeviceEventEmitter.emit('REFRESH_CONV_LIST');
    }
  } catch (_) {}
}

export async function loadConvList(userId) {
  const meId = String(userId || myUserId || '').trim();
  if (!meId) return [];
  try {
    const raw = await AsyncStorage.getItem(`CONV_LIST_${meId}`);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (_) {
    return [];
  }
}
