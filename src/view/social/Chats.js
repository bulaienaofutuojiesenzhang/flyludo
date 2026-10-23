import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
  Alert,
  DeviceEventEmitter,
  Image,
  ImageBackground,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { emitLocalSentMessage } from '../../utils/chatWs';
import { clearConvUnread } from '../../utils/chatBootstrap';
import { CHAT_GIFTS } from '../../utils/chatGifts';
import { pickAndUploadImage } from '../../utils/socialUpload';
import AsyncStorage from '../../utils/AsyncStorage';
import { SC } from '../../theme/social';

const CHAT_BG = require('../../asserts/images/chat/chatbglv.png');

class Chats extends React.Component {
  state = { text: '', sending: false, messages: [], giftOpen: false };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
    const { partnerId } = this.props.route.params || {};
    clearConvUnread(partnerId);
    this.loadLocal();
    this.pull();
    this.sub = DeviceEventEmitter.addListener('NEW_MESSAGE', this.onMsg);
  }

  componentWillUnmount() {
    this.sub && this.sub.remove();
  }

  histKey = () => {
    const me = this.props.user?.userId;
    const p = this.props.route.params?.partnerId;
    return `CHAT_HISTORY_${me}_${p}`;
  };

  loadLocal = async () => {
    try {
      const raw = await AsyncStorage.getItem(this.histKey());
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) this.setState({ messages: list });
    } catch (_) {}
  };

  saveLocal = async (messages) => {
    await AsyncStorage.setItem(this.histKey(), JSON.stringify(messages.slice(-300)));
  };

  onMsg = (msg) => {
    const p = String(this.props.route.params?.partnerId || '');
    const me = String(this.props.user?.userId || '');
    const from = String(msg.fromUserId || '');
    const to = String(msg.toUserId || '');
    const related = (from === p && to === me) || (from === me && to === p);
    if (!related) return;
    this.setState((s) => {
      if (s.messages.some((m) => String(m._id) === String(msg._id))) return s;
      const messages = [...s.messages, msg];
      this.saveLocal(messages);
      return { messages };
    });
  };

  pull = () => {
    Http('post', '/social/chat/pullMsg', {
      sync: 1,
      partnerId: String(this.props.route.params?.partnerId || ''),
      limit: 100,
    }).then((res) => {
      if (res?.code === 200 && Array.isArray(res.data?.list)) {
        const incoming = res.data.list;
        this.setState((s) => {
          const map = new Map();
          for (const m of s.messages) map.set(String(m._id), m);
          for (const m of incoming) map.set(String(m._id), m);
          const messages = Array.from(map.values()).sort(
            (a, b) => Number(a.time) - Number(b.time)
          );
          this.saveLocal(messages);
          return { messages };
        });
      }
    });
  };

  send = async (payload) => {
    const { partnerId, nickName, faceUrl } = this.props.route.params || {};
    if (!partnerId || this.state.sending) return;
    if (!this.props.user?.isLogged) {
      this.props.navigation.navigate('Login');
      return;
    }
    this.setState({ sending: true });
    try {
      const time = Date.now();
      const res = await Http('post', '/social/chat/sendMsg', {
        toUserId: String(partnerId),
        content: payload.content,
        type: payload.type || 'text',
        time,
        nickName: this.props.user.name || this.props.user.account || '',
      });
      if (res && res.code === 200) {
        const local = {
          fromUserId: String(this.props.user.userId),
          toUserId: String(partnerId),
          content: payload.content,
          type: payload.type || 'text',
          time,
          nickName: nickName || '',
          faceUrl: faceUrl || '',
          _id: res.data?.msgId || String(time),
        };
        this.setState((s) => {
          const messages = [...s.messages, local];
          this.saveLocal(messages);
          return { text: '', messages };
        });
        emitLocalSentMessage(local);
      } else if (res?.code === 40301) {
        Alert.alert('今日次数已用完', res.message || '开通 VIP 可无限发送');
      }
    } finally {
      this.setState({ sending: false });
    }
  };

  sendText = () => {
    const content = String(this.state.text || '').trim();
    if (!content) return;
    this.send({ content, type: 'text' });
  };

  sendImage = async () => {
    if (this.state.sending) return;
    const url = await pickAndUploadImage({ selectionLimit: 1 });
    if (!url) return;
    const q = await Http('post', '/social/chat/quota', {});
    if (q?.code === 200 && q.data && !q.data.isVip) {
      const remain = Number(q.data.remain?.image);
      if (Number.isFinite(remain) && remain <= 0) {
        Alert.alert('今日图片次数已用完', '开通 VIP 可无限发送', [
          { text: '去开通', onPress: () => this.props.navigation.navigate('Recharge') },
          { text: '取消' },
        ]);
        return;
      }
    }
    await this.send({ content: url, type: 'image' });
  };

  sendGift = (gift) => {
    const { partnerId, nickName, faceUrl } = this.props.route.params || {};
    this.setState({ giftOpen: false });
    Http('post', '/social/chat/sendGift', {
      toUserId: String(partnerId),
      giftId: gift.id,
      time: Date.now(),
      nickName: this.props.user.name || '',
    }).then((res) => {
      if (res?.code === 200) {
        if (res.data?.yuanbao != null) {
          this.props.setUserInfo({ yuanbao: res.data.yuanbao });
        }
        const local = {
          fromUserId: String(this.props.user.userId),
          toUserId: String(partnerId),
          content: JSON.stringify(res.data?.gift || gift),
          type: 'gift',
          time: res.data?.time || Date.now(),
          nickName: nickName || '',
          faceUrl: faceUrl || '',
          _id: res.data?.msgId || String(Date.now()),
        };
        this.setState((s) => {
          const messages = [...s.messages, local];
          this.saveLocal(messages);
          return { messages };
        });
        emitLocalSentMessage(local);
      } else if (res?.code === 600) {
        Alert.alert('钻石不足', '请先充值', [
          { text: '去充值', onPress: () => this.props.navigation.navigate('Diamond') },
          { text: '取消' },
        ]);
      }
    });
  };

  renderBody = (item) => {
    if (item.type === 'image') {
      if (item.locked) {
        return (
          <Text style={[styles.bubbleTxt, { color: SC.mute }]}>
            {item.preview || '[图片已锁定·开通VIP可看]'}
          </Text>
        );
      }
      return <Image source={{ uri: item.content }} style={styles.msgImg} resizeMode="cover" />;
    }
    if (item.type === 'gift') {
      try {
        const g = JSON.parse(item.content || '{}');
        return `[礼物] ${g.name || ''}`;
      } catch (_) {
        return '[礼物]';
      }
    }
    if (item.locked) return item.preview || '[媒体已锁定·开通VIP可看]';
    return item.content;
  };

  renderItem = ({ item }) => {
    const mine = String(item.fromUserId) === String(this.props.user?.userId);
    const isImg = item.type === 'image' && !item.locked;
    const body = this.renderBody(item);
    return (
      <View style={[styles.bubbleWrap, mine ? styles.right : styles.left]}>
        <View
          style={[
            styles.bubble,
            mine ? styles.bubbleMe : styles.bubbleOther,
            isImg && styles.bubbleImg,
          ]}
        >
          {typeof body === 'string' ? (
            <Text style={styles.bubbleTxt}>{body}</Text>
          ) : (
            body
          )}
        </View>
      </View>
    );
  };

  render() {
    const { nickName, partnerId } = this.props.route.params || {};
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.nav}>
          <Pressable onPress={() => this.props.navigation.goBack()} hitSlop={12} style={styles.navSide}>
            <Icons name="left" size={22} color={SC.ink} />
          </Pressable>
          <Text style={styles.navTitle} numberOfLines={1}>
            {nickName || partnerId || '对话'}
          </Text>
          <Pressable onPress={() => this.setState({ giftOpen: true })} style={styles.navSide}>
            <Icons name="gift" size={20} color={SC.inkSoft} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={8}
        >
          <ImageBackground source={CHAT_BG} style={styles.msgBg} resizeMode="cover">
            <FlatList
              data={this.state.messages}
              keyExtractor={(item, i) => String(item._id || i)}
              renderItem={this.renderItem}
              contentContainerStyle={styles.list}
              ListEmptyComponent={<Text style={styles.hint}>发送第一条消息开始聊天</Text>}
            />
          </ImageBackground>

          <View style={styles.inputBar}>
            <Pressable style={styles.iconBtn} onPress={this.sendImage} disabled={this.state.sending}>
              <Icons name="picture" size={22} color={SC.inkSoft} />
            </Pressable>
            <TextInput
              style={styles.input}
              value={this.state.text}
              onChangeText={(text) => this.setState({ text })}
              placeholder="说点什么…"
              placeholderTextColor={SC.mute2}
              multiline
            />
            <Pressable
              style={[styles.sendBtn, !String(this.state.text || '').trim() && styles.sendBtnOff]}
              onPress={this.sendText}
            >
              <Text style={styles.sendTxt}>{this.state.sending ? '…' : '发送'}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>

        <Modal visible={this.state.giftOpen} transparent animationType="slide">
          <Pressable style={styles.mask} onPress={() => this.setState({ giftOpen: false })}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>送礼物</Text>
              <View style={styles.giftGrid}>
                {CHAT_GIFTS.map((g) => (
                  <Pressable key={g.id} style={styles.giftItem} onPress={() => this.sendGift(g)}>
                    <Text style={styles.giftName}>{g.name}</Text>
                    <Text style={styles.giftPrice}>{g.price} 钻</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SC.soft },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: SC.soft,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  navSide: { width: 44, alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: SC.ink },
  msgBg: { flex: 1, backgroundColor: SC.chatBg },
  list: { padding: 12, paddingBottom: 16, flexGrow: 1 },
  hint: { textAlign: 'center', color: SC.mute, marginTop: 40, fontSize: 13 },
  bubbleWrap: { marginBottom: 10, flexDirection: 'row' },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '76%',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  bubbleMe: {
    backgroundColor: SC.chatMe,
    borderRadius: 6,
    borderTopRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: SC.chatOther,
    borderRadius: 6,
    borderTopLeftRadius: 2,
  },
  bubbleTxt: { fontSize: 16, color: SC.ink, lineHeight: 22 },
  bubbleImg: { padding: 3, backgroundColor: 'transparent' },
  msgImg: { width: 180, height: 180, borderRadius: 6 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: SC.chatBar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: SC.soft,
    borderRadius: 6,
    color: SC.ink,
    fontSize: 16,
    marginHorizontal: 4,
  },
  sendBtn: {
    marginLeft: 4,
    backgroundColor: SC.success,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 56,
    alignItems: 'center',
  },
  sendBtnOff: { backgroundColor: '#C9C9C9' },
  sendTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  mask: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: SC.soft,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 28,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: SC.ink, marginBottom: 12 },
  giftGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  giftItem: {
    width: '33.33%',
    padding: 10,
    alignItems: 'center',
  },
  giftName: { fontWeight: '700', color: SC.ink },
  giftPrice: { marginTop: 4, color: SC.rose, fontSize: 12 },
});

export default connect(
  (s) => ({ user: s.user }),
  (d) => ({ setUserInfo: (p) => d({ type: 'SET_USERINFO', payload: p }) })
)(Chats);
