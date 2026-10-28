import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { SC, socialShadow, socialPage } from '../../theme/social';
import { AppDialog, ToastService } from '../../component';

const TABS = [
  { label: '推荐', type: 0 },
  { label: '新人', type: 1 },
  { label: '同城', type: 2 },
];

class Expand extends React.Component {
  state = { tab: 0, list: [], page: 0, refreshing: false, drawing: false };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
    this.focusUnsub = this.props.navigation.addListener('focus', () => this.load(0));
    this.load(0);
  }

  componentWillUnmount() {
    this.focusUnsub && this.focusUnsub();
  }

  requireLogin = (fn) => {
    if (!this.props.user?.isLogged) {
      this.props.navigation.navigate('Login');
      return;
    }
    fn && fn();
  };

  load = (page = 0) => {
    if (!this.props.user?.isLogged) {
      this.setState({ list: [] });
      return;
    }
    const type = TABS[this.state.tab].type;
    this.setState({ refreshing: true });
    Http('post', '/social/manghe/recomFriend', {
      page,
      pageNum: 20,
      type,
      city: this.props.user.city || '',
    })
      .then((res) => {
        if (res?.code === 200) {
          const rows = res.data?.list || [];
          this.setState({
            list: page === 0 ? rows : [...this.state.list, ...rows],
            page,
          });
        }
      })
      .finally(() => this.setState({ refreshing: false }));
  };

  drawWx = (num, sex) => {
    this.requireLogin(() => {
      this.setState({ drawing: true });
      Http('post', '/social/manghe/getFriendWx', { num, sex })
        .then((res) => {
          if (res?.code === 200) {
            const n = (res.data?.list || []).length;
            const orderNo = res.data?.orderNo;
            if (orderNo) {
              Http('post', '/social/manghe/checkoutWx', { orderNo }).catch(() => {});
            }
            if (res.data?.yuanbao != null) {
              this.props.setUserInfo({ yuanbao: res.data.yuanbao });
            }
            AppDialog.confirm({
              title: '抽到了',
              message: `成功解锁 ${n} 个微信号`,
              cancelText: '好的',
              confirmText: '去看看',
            }).then((go) => {
              if (go) this.props.navigation.navigate('MyWeFriend');
            });
          } else if (res?.code === 600) {
            AppDialog.diamondInsufficient().then((go) => {
              if (go) this.props.navigation.navigate('Diamond');
            });
          } else {
            ToastService.warn(res?.message || '暂无可抽用户');
          }
        })
        .finally(() => this.setState({ drawing: false }));
    });
  };

  renderItem = ({ item }) => {
    const face = item.myFace || item.avatar;
    return (
      <Pressable
        style={styles.row}
        onPress={() =>
          this.requireLogin(() => this.props.navigation.navigate('FriendDetail', { user: item }))
        }
      >
        <View style={styles.avatar}>
          {face ? (
            <Image source={{ uri: face }} style={styles.avatarImg} />
          ) : (
            <Icons name="user" size={22} color={SC.rose} />
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.name}>{item.nickName || item.name || item.userId}</Text>
          <Text style={styles.desc} numberOfLines={1}>
            {[item.city, item.signStr || item.desc].filter(Boolean).join(' · ') || '完善资料中'}
          </Text>
        </View>
        <Pressable
          style={styles.ghostBtn}
          onPress={() =>
            this.requireLogin(() =>
              this.props.navigation.navigate('Chats', {
                partnerId: String(item.userId),
                nickName: item.nickName || item.name,
                faceUrl: face,
              })
            )
          }
        >
          <Text style={styles.ghostTxt}>打招呼</Text>
        </Pressable>
      </Pressable>
    );
  };

  render() {
    const logged = !!this.props.user?.isLogged;
    return (
      <SafeAreaView style={socialPage.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={socialPage.title}>扩列</Text>
            <Text style={socialPage.sub}>同城遇见 · 微信盲盒派对</Text>
          </View>
          <Pressable
            style={styles.iconBtn}
            onPress={() => this.requireLogin(() => this.props.navigation.navigate('SearchFriend'))}
          >
            <Icons name="search1" size={20} color={SC.ink} />
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => this.requireLogin(() => this.props.navigation.navigate('WeChat'))}
          >
            <Icons name="adduser" size={20} color={SC.ink} />
          </Pressable>
        </View>

        <View style={[styles.wxBanner, socialShadow]}>
          <View style={styles.wxBannerInner}>
            <Text style={styles.wxTitle}>微信盲盒</Text>
            <Text style={styles.wxSub}>抽一张名片，遇见今晚的同城</Text>
            <View style={styles.wxRow}>
              <Pressable
                style={styles.wxBtn}
                onPress={() => this.drawWx(1, 2)}
                disabled={this.state.drawing}
              >
                <Text style={styles.wxBtnTxt}>抽女生 ×1</Text>
              </Pressable>
              <Pressable
                style={styles.wxBtn}
                onPress={() => this.drawWx(1, 1)}
                disabled={this.state.drawing}
              >
                <Text style={styles.wxBtnTxt}>抽男生 ×1</Text>
              </Pressable>
              <Pressable
                style={styles.wxMine}
                onPress={() => this.requireLogin(() => this.props.navigation.navigate('MyWeFriend'))}
              >
                <Text style={styles.wxMineTxt}>我的</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.tabs}>
          {TABS.map((t, i) => {
            const on = this.state.tab === i;
            return (
              <Pressable
                key={t.label}
                style={styles.tab}
                onPress={() => this.setState({ tab: i }, () => this.load(0))}
              >
                <Text style={[styles.tabTxt, on && styles.tabTxtOn]}>{t.label}</Text>
                {on ? <View style={styles.tabLine} /> : <View style={styles.tabLinePh} />}
              </Pressable>
            );
          })}
        </View>

        {!logged ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>登录后查看扩列</Text>
            <Pressable style={socialPage.cta} onPress={() => this.props.navigation.navigate('Login')}>
              <Text style={socialPage.ctaTxt}>去登录</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={this.state.list}
            keyExtractor={(item, i) => String(item.userId || i)}
            renderItem={this.renderItem}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => this.load(0)}
                tintColor={SC.rose}
              />
            }
            onEndReached={() => this.load(this.state.page + 1)}
            onEndReachedThreshold={0.3}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>暂无推荐</Text>
                <Text style={styles.emptyDesc}>完善资料后更容易被发现</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SC.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  wxBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: SC.rose,
  },
  wxBannerInner: {
    padding: 18,
    backgroundColor: 'rgba(176,24,212,0.35)',
  },
  wxTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  wxSub: { marginTop: 4, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 14 },
  wxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wxBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    paddingVertical: 11,
    alignItems: 'center',
  },
  wxBtnTxt: { color: SC.roseDeep, fontWeight: '700', fontSize: 13 },
  wxMine: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  wxMineTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SC.line,
  },
  tab: { marginRight: 22, paddingVertical: 10, alignItems: 'center' },
  tabTxt: { fontSize: 15, color: SC.mute, fontWeight: '600' },
  tabTxtOn: { color: SC.rose, fontWeight: '800' },
  tabLine: {
    marginTop: 8,
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: SC.rose,
  },
  tabLinePh: { marginTop: 8, height: 3 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: SC.line },
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
  name: { fontSize: 16, fontWeight: '700', color: SC.ink },
  desc: { marginTop: 4, fontSize: 12, color: SC.mute },
  ghostBtn: {
    backgroundColor: SC.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  ghostTxt: { color: SC.roseDeep, fontWeight: '700', fontSize: 12 },
  empty: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: SC.ink },
  emptyDesc: { marginTop: 8, color: SC.mute },
});

export default connect(
  (s) => ({ user: s.user }),
  (d) => ({ setUserInfo: (p) => d({ type: 'SET_USERINFO', payload: p }) })
)(Expand);
