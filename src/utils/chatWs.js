/**
 * 聊天推送 WS：连 tongchengserver，收到 chat_notify 后静默拉 /social/chat/pullMsg
 */
import { DeviceEventEmitter, AppState, Platform } from 'react-native';
import io from 'socket.io-client';
import Config from '../config';
import AsyncStorage from './AsyncStorage';

let socket = null;
let currentUserId = null;
let pulling = false;
let appStateSub = null;
let intentionalReplace = false;
let connectTimer = null;
let connecting = false;

function getWsUrl() {
  return Config.CHAT_WS_PATH || '';
}

function getAppMeta() {
  return {
    app: Config.CHAT_APP || 'flyludo',
    secret: Config.CHAT_SECRET || '',
  };
}

export function isChatWsConnected() {
  return !!(socket && socket.connected);
}

export function connectChatWs(userId) {
  const uid = String(userId || '').trim();
  if (!uid || uid === 'undefined') return;

  const url = getWsUrl();
  const { app, secret } = getAppMeta();
  if (!url || !secret) {
    console.warn('[chatWs] missing CHAT_WS_PATH / CHAT_SECRET');
    return;
  }

  if (currentUserId === uid && socket && (socket.connected || connecting)) return;

  if (connectTimer) clearTimeout(connectTimer);
  connectTimer = setTimeout(() => {
    connectTimer = null;
    doConnect(uid, url, app, secret);
  }, 120);
}

function doConnect(uid, url, app, secret) {
  if (currentUserId === uid && socket && (socket.connected || connecting)) return;

  intentionalReplace = true;
  disconnectChatWs(false);
  intentionalReplace = false;
  currentUserId = uid;
  connecting = true;

  socket = io(url, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: Infinity,
    timeout: 15000,
  });

  socket.on('connect', () => {
    connecting = false;
    console.log('[chatWs] connected, register', app, uid);
    socket.emit('chat_register', { app, secret, userId: uid });
  });

  socket.on('chat_register_success', () => {
    silentPullAndDispatch();
  });

  socket.on('chat_register_error', (err) => {
    console.warn('[chatWs] register error', err);
  });

  socket.on('chat_notify', () => {
    silentPullAndDispatch();
  });

  socket.on('chat_ping', () => {
    if (socket) socket.emit('chat_pong');
  });

  socket.on('chat_kicked', () => {
    if (intentionalReplace) return;
    console.log('[chatWs] kicked (another device)');
  });

  socket.on('disconnect', () => {
    connecting = false;
  });

  socket.on('connect_error', (err) => {
    connecting = false;
    console.warn('[chatWs] connect_error', err?.message || err);
  });

  if (!appStateSub) {
    appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && currentUserId) {
        if (!socket || !socket.connected) {
          connectChatWs(currentUserId);
        } else {
          silentPullAndDispatch();
        }
      }
    });
  }
}

export function disconnectChatWs(clearUser = true) {
  connecting = false;
  if (socket) {
    try {
      socket.removeAllListeners();
      socket.disconnect();
    } catch (_) {}
    socket = null;
  }
  if (clearUser) currentUserId = null;
}

export async function silentPullAndDispatch() {
  if (pulling) return;
  pulling = true;
  try {
    await doPullMsg({ sync: false });
  } finally {
    pulling = false;
  }
}

export async function syncChatAndDispatch(myUserId) {
  if (pulling) return { count: 0 };
  pulling = true;
  try {
    const myId = String(myUserId || currentUserId || '').trim();
    let sinceTime = 0;
    if (myId && myId !== 'undefined') {
      try {
        const listStr = await AsyncStorage.getItem(`CONV_LIST_${myId}`);
        const list = listStr ? JSON.parse(listStr) : [];
        let maxTs = 0;
        for (const item of list || []) {
          const t = Number(item?.lastMessage?.timestamp || 0);
          const ms = t > 1e12 ? t : t * 1000;
          if (ms > maxTs) maxTs = ms;
        }
        sinceTime = maxTs > 0 ? Math.max(0, maxTs - 2 * 60 * 60 * 1000) : 0;
      } catch (_) {}
    }
    const list = await doPullMsg({
      sync: true,
      sinceTime,
      limit: 200,
      silentNotify: true,
    });
    return { count: list.length };
  } finally {
    pulling = false;
  }
}

async function doPullMsg({ sync = false, sinceTime = 0, limit = 50, silentNotify = false } = {}) {
  const jwToken = await AsyncStorage.getItem('jwToken');
  const url = `${Config.API_PATH}/social/chat/pullMsg`;
  const payload = {
    timestamp: Date.now(),
    system: Platform.OS,
    version: `${Config.Version?.version || ''}.${Config.Version?.versionNum || ''}`,
    sync: sync ? 1 : 0,
    sinceTime: Number(sinceTime) || 0,
    limit: Math.min(200, Math.max(1, Number(limit) || 50)),
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: jwToken ? `Bearer ${jwToken}` : '',
    },
    body: JSON.stringify(payload),
  });
  const text = await resp.text();
  let res = null;
  try {
    res = text ? JSON.parse(text) : null;
  } catch (_) {
    console.warn('[chatWs] pullMsg non-json', resp.status, text?.slice?.(0, 80));
    return [];
  }
  if (res && res.code === 200 && res.data && Array.isArray(res.data.list)) {
    for (const msg of res.data.list) {
      DeviceEventEmitter.emit('NEW_MESSAGE', silentNotify ? { ...msg, silent: true } : msg);
    }
    if (res.data.list.length) {
      DeviceEventEmitter.emit('REFRESH_CONV_LIST');
    }
    return res.data.list;
  }
  if (res && res.code !== 200) {
    console.warn('[chatWs] pullMsg', res.code, res.message);
  }
  return [];
}

export function emitLocalSentMessage(msg) {
  DeviceEventEmitter.emit('NEW_MESSAGE', msg);
}
