/**
 * 一键打招呼弹窗（对齐 z7box）
 * 仅当后端 greetPending 且未 greetDone 时弹出一次；点打招呼/跳过后不再重开
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Toast } from 'native-base';
import Http from '../utils/HttpPost';
import { silentPullAndDispatch } from '../utils/chatWs';
import { Colors } from '../theme';
import { SC } from '../theme/social';
import { getAvatarSource } from '../utils/avatar';

const SHOW_COUNT = 8;

export function GreetBootstrap() {
  const user = useSelector((s) => s.user);
  const [visible, setVisible] = useState(false);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(false);
  const loadedRef = useRef(false);
  const dismissedRef = useRef(false);
  const cacheRef = useRef([]);
  const prefetchingRef = useRef(false);
  const userId = user?.userId;
  const isLogged = !!user?.isLogged;

  const loadGreetBots = useCallback(async () => {
    const res = await Http('post', '/social/user/greetPending', {});
    if (res && res.code === 200 && res.data && res.data.pending && (res.data.bots || []).length) {
      const list = (res.data.bots || []).filter((b) => b && (b.myFace || b.nickName));
      return list.slice(0, SHOW_COUNT);
    }
    return [];
  }, []);

  const closeGreet = useCallback(() => {
    dismissedRef.current = true;
    cacheRef.current = [];
    setVisible(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isLogged || !userId) {
      setVisible(false);
      setBots([]);
      loadedRef.current = false;
      dismissedRef.current = false;
      cacheRef.current = [];
      return;
    }

    let cancelled = false;
    loadedRef.current = false;
    dismissedRef.current = false;
    cacheRef.current = [];

    const boot = async () => {
      if (prefetchingRef.current) return;
      prefetchingRef.current = true;
      try {
        const list = await loadGreetBots();
        if (cancelled || dismissedRef.current) return;
        if (list.length) cacheRef.current = list;
        if (!list.length || loadedRef.current) return;
        loadedRef.current = true;
        setBots(list);
        setVisible(true);
      } catch (_) {
      } finally {
        prefetchingRef.current = false;
      }
    };

    const t = setTimeout(boot, 500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [isLogged, userId, loadGreetBots]);

  const onGreet = () => {
    if (loading) return;
    setLoading(true);
    Http('post', '/social/user/oneClickGreet', {})
      .then((res) => {
        // 无论成功失败都先关弹窗，避免接口慢/状态抖动看起来「关不掉」
        closeGreet();
        if (res && Number(res.code) === 200) {
          Toast.show({
            title: '已打招呼，对方会陆续回复你',
            placement: 'top',
          });
          setTimeout(() => {
            try {
              silentPullAndDispatch();
            } catch (_) {}
          }, 8000);
          setTimeout(() => {
            try {
              silentPullAndDispatch();
            } catch (_) {}
          }, 60000);
        } else {
          Toast.show({
            title: (res && res.message) || '打招呼失败',
            placement: 'top',
          });
        }
      })
      .catch(() => {
        closeGreet();
        Toast.show({ title: '网络异常', placement: 'top' });
      });
  };

  const onSkip = () => closeGreet();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.mask}>
        <View style={styles.card}>
          <Text style={styles.title}>附近有人想认识你</Text>
          <Text style={styles.sub}>同城新朋友已上线，一键打个招呼吧</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.row}
            contentContainerStyle={styles.rowContent}
          >
            {bots.map((b, i) => (
              <View key={`greet_${i}_${String(b.userId || '')}`} style={styles.item}>
                <View style={styles.avatarWrap}>
                  <ImageBackground
                    source={getAvatarSource(b.myFace, b.gender ?? b.sex)}
                    style={styles.avatar}
                    imageStyle={styles.avatarImg}
                    resizeMode="cover"
                    blurRadius={b.myFace ? 12 : 0}
                  >
                    {!!b.myFace && <View style={styles.avatarFrost} />}
                  </ImageBackground>
                </View>
                <Text style={styles.name} numberOfLines={1}>
                  {b.nickName || '好友'}
                </Text>
                <Text style={styles.city} numberOfLines={1}>
                  {b.city || '附近'}
                </Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={onGreet} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>一键打招呼</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onSkip} style={styles.skip}>
            <Text style={styles.skipText}>稍后再说</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.hei || '#222',
    textAlign: 'center',
  },
  sub: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.hui66 || '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  row: { maxHeight: 120, marginBottom: 8 },
  rowContent: { paddingHorizontal: 4, alignItems: 'flex-start' },
  item: { width: 76, alignItems: 'center', marginRight: 12 },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  avatar: {
    width: 64,
    height: 64,
    justifyContent: 'flex-end',
  },
  avatarImg: {
    borderRadius: 30,
  },
  avatarFrost: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  name: { marginTop: 6, fontSize: 12, color: '#333', maxWidth: 72, textAlign: 'center' },
  city: { fontSize: 10, color: '#999', maxWidth: 72, textAlign: 'center' },
  btn: {
    marginTop: 12,
    height: 44,
    borderRadius: 22,
    backgroundColor: SC.rose || Colors.primary || '#E23CFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  skip: { marginTop: 12, alignItems: 'center' },
  skipText: { color: '#999', fontSize: 13 },
});
