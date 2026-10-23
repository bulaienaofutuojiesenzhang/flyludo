import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
  DeviceEventEmitter,
  RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import { loadConvList } from '../../utils/chatBootstrap';
import { syncChatAndDispatch } from '../../utils/chatWs';
import { SC, socialPage } from '../../theme/social';

import CachedImage from '../../component/CachedImage';
const renderSeparator = () => <View style={separatorStyle.line} />;
const separatorStyle = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth, backgroundColor: SC.line, marginLeft: 86 },
});

const PINNED = [
  {
    route: 'LoveMe',
    title: '喜欢我',
    desc: '看看谁对你心动了',
    icon: 'heart',
    color: SC.rose,
    bg: 'rgba(226,60,254,0.10)',
  },
  {
    route: 'AiGirlfriend',
    title: 'AI 女友',
    desc: '随时在线，陪你聊聊天',
    icon: 'smileo',
    color: SC.goldDeep,
    bg: SC.goldSoft,
  },
];

class Message extends React.Component {
  state = { list: [], refreshing: false };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
    this.reload();
    this.sub = DeviceEventEmitter.addListener('REFRESH_CONV_LIST', this.reload);
    this.focusUnsub = this.props.navigation.addListener('focus', this.reload);
  }

  componentWillUnmount() {
    this.sub && this.sub.remove();
    this.focusUnsub && this.focusUnsub();
  }

  reload = async () => {
    const uid = this.props.user?.userId;
    const list = await loadConvList(uid);
    this.setState({ list });
  };

  onRefresh = async () => {
    if (!this.props.user?.isLogged) return;
    this.setState({ refreshing: true });
    try {
      await syncChatAndDispatch(this.props.user.userId);
      await this.reload();
    } finally {
      this.setState({ refreshing: false });
    }
  };

  requireLogin = (fn) => {
    if (!this.props.user?.isLogged) {
      this.props.navigation.navigate('Login');
      return;
    }
    fn && fn();
  };

  openChat = (item) => {
    this.props.navigation.navigate('Chats', {
      partnerId: item.partnerId,
      nickName: item.nickName,
      faceUrl: item.faceUrl,
    });
  };

  formatTime = (item) => {
    if (!item.lastMessage?.timestamp) return '';
    const raw = item.lastMessage.timestamp;
    const d = new Date(raw > 1e12 ? raw : raw * 1000);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  renderItem = ({ item }) => {
    const ts = this.formatTime(item);
    return (
      <Pressable style={styles.row} onPress={() => this.openChat(item)}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            {item.faceUrl ? (
              <CachedImage source={{ uri: item.faceUrl }} style={styles.avatarImg} />
            ) : (
              <Icons name="user" size={24} color={SC.rose} />
            )}
          </View>
          {!!item.unreadCount && <View style={styles.dot} />}
        </View>
        <View style={styles.mid}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.nickName || item.partnerId}
            </Text>
            <Text style={styles.time}>{ts}</Text>
          </View>
          <Text style={styles.preview} numberOfLines={1}>
            {item.lastMessage?.content || ''}
          </Text>
        </View>
      </Pressable>
    );
  };

  /** 置顶系统会话：和普通会话同一行样式，不再做成一块卡片 */
  renderPinned = () => (
    <View>
      {PINNED.map((p) => (
        <Pressable
          key={p.route}
          style={styles.row}
          onPress={() => this.requireLogin(() => this.props.navigation.navigate(p.route))}
        >
          <View style={[styles.avatar, { backgroundColor: p.bg }]}>
            <Icons name={p.icon} size={24} color={p.color} />
          </View>
          <View style={styles.mid}>
            <Text style={styles.name}>{p.title}</Text>
            <Text style={styles.preview} numberOfLines={1}>
              {p.desc}
            </Text>
          </View>
        </Pressable>
      ))}
      <View style={styles.pinnedEnd} />
    </View>
  );

  render() {
    const logged = !!this.props.user?.isLogged;
    return (
      <SafeAreaView style={socialPage.safe} edges={['top']}>
        <View style={styles.head}>
          <Text style={styles.title}>消息</Text>
          <Pressable
            style={styles.addBtn}
            onPress={() => this.requireLogin(() => this.props.navigation.navigate('SearchFriend'))}
          >
            <Icons name="adduser" size={21} color={SC.ink} />
          </Pressable>
        </View>

        {!logged ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Icons name="message1" size={30} color={SC.rose} />
            </View>
            <Text style={styles.emptyTitle}>登录后查看消息</Text>
            <Text style={styles.emptyDesc}>私聊、心动与通知都在这里</Text>
            <Pressable
              style={[socialPage.cta, { marginTop: 18 }]}
              onPress={() => this.props.navigation.navigate('Login')}
            >
              <Text style={socialPage.ctaTxt}>去登录</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={this.state.list}
            keyExtractor={(item, i) => String(item.partnerId || i)}
            renderItem={this.renderItem}
            ListHeaderComponent={this.renderPinned}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={renderSeparator}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.onRefresh}
                tintColor={SC.rose}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Icons name="inbox" size={30} color={SC.rose} />
                </View>
                <Text style={styles.emptyTitle}>还没有会话</Text>
                <Text style={styles.emptyDesc}>
                  在推荐里喜欢对方后即可开始聊天。下拉可同步云端消息。
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 14,
    paddingTop: 8,
    paddingBottom: 10,
  },
  title: { fontSize: 26, fontWeight: '900', color: SC.ink },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedEnd: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: SC.line,
    marginHorizontal: 20,
    marginVertical: 4,
  },

  /* 会话行：行高 76、浅分割线 */
  list: { paddingBottom: 24 },
  emptyWrap: { flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    height: 76,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: SC.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 52, height: 52 },
  dot: {
    position: 'absolute',
    right: 1,
    top: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: SC.danger,
    borderWidth: 1.5,
    borderColor: SC.cream,
  },
  mid: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { flex: 1, fontSize: 16, fontWeight: '700', color: SC.ink, marginRight: 10 },
  preview: { marginTop: 5, fontSize: 13, color: SC.mute },
  time: { fontSize: 12, color: SC.mute2 },

  /* 空态 */
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(226,60,254,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { marginTop: 16, fontSize: 16, fontWeight: '700', color: SC.ink },
  emptyDesc: {
    marginTop: 8,
    fontSize: 13,
    color: SC.mute,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default connect((s) => ({ user: s.user }))(Message);
