import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { SC } from '../../theme/social';
import SwipeDeck from '../../component/SwipeDeck';

const FILTERS = [
  { label: '推荐', type: 0 },
  { label: '同城', type: 2 },
];

/** 首页：只做一件事 —— 遇见人（玩法在「玩法」页，动态在「广场」） */
class Recommend extends React.Component {
  state = {
    tab: 0,
    list: [],
    page: 0,
    deckKey: 0,
  };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
    this.focusUnsub = this.props.navigation.addListener('focus', () => {
      StatusBar.setBarStyle('dark-content');
      // 从详情页返回不打断当前滑卡进度，只有没数据时才拉
      if (!this.state.list.length) {
        this.load(0, true);
      }
    });
    this.load(0, true);
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

  /** reset=true 时重建卡堆（切 Tab / 刷新）；翻页追加不重建 */
  load = (page = 0, reset = false) => {
    if (!this.props.user?.isLogged) {
      this.setState({ list: [] });
      return;
    }
    const type = FILTERS[this.state.tab].type;
    Http('post', '/social/manghe/recomFriend', {
      page,
      pageNum: 20,
      type,
      city: this.props.user.city || '',
    }).then((res) => {
      if (res?.code !== 200) {
        return;
      }
      const rows = res.data?.list || [];
      if (page === 0) {
        this.setState((s) => ({
          list: rows,
          page: 0,
          deckKey: reset ? s.deckKey + 1 : s.deckKey,
        }));
      } else if (rows.length) {
        this.setState((s) => ({ list: [...s.list, ...rows], page }));
      }
    });
  };

  switchTab = (i) => {
    if (i === this.state.tab) {
      return;
    }
    this.setState({ tab: i, list: [] }, () => this.load(0, true));
  };

  openUser = (item) => {
    this.requireLogin(() => this.props.navigation.navigate('FriendDetail', { user: item }));
  };

  /** 右滑喜欢：静默建立心动，对方回应后在消息里聊 */
  onSwipeRight = (item) => {
    if (!this.props.user?.isLogged) {
      this.props.navigation.navigate('Login');
      return;
    }
    Http('post', '/social/user/loveYou', { userId: String(item.userId) }).catch(() => {});
  };

  renderHeader = () => (
    <View style={styles.head}>
      {this.props.navigation.canGoBack() && this.props.route?.name === 'Swipe' ? (
        <Pressable style={styles.iconBtn} onPress={() => this.props.navigation.goBack()}>
          <Icons name="left" size={21} color={SC.ink} />
        </Pressable>
      ) : null}
      <View style={styles.tabs}>
        {FILTERS.map((t, i) => {
          const on = this.state.tab === i;
          return (
            <Pressable key={t.label} style={styles.tabItem} onPress={() => this.switchTab(i)}>
              <Text style={[styles.tabTxt, on && styles.tabTxtOn]}>{t.label}</Text>
              <View style={[styles.tabBar, on && styles.tabBarOn]} />
            </Pressable>
          );
        })}
      </View>
      <Pressable
        style={styles.iconBtn}
        onPress={() => this.requireLogin(() => this.props.navigation.navigate('SearchFriend'))}
      >
        <Icons name="search1" size={21} color={SC.ink} />
      </Pressable>
    </View>
  );

  renderEmpty = () => {
    const logged = this.props.user?.isLogged;
    return (
      <View style={styles.empty}>
        <Image
          source={require('../../asserts/images/home/v2_hero.png')}
          style={styles.emptyImg}
          resizeMode="contain"
        />
        <Text style={styles.emptyTitle}>{logged ? '今天的推荐看完啦' : '登录后查看推荐'}</Text>
        <Text style={styles.emptyDesc}>
          {logged ? '换个分类，或者去搭子里逛逛' : '同城的有缘人正在等你'}
        </Text>
        <Pressable
          style={styles.emptyCta}
          onPress={() => (logged ? this.load(0, true) : this.props.navigation.navigate('Login'))}
        >
          <Text style={styles.emptyCtaTxt}>{logged ? '再刷一轮' : '立即登录'}</Text>
        </Pressable>
      </View>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        {this.renderHeader()}
        <View style={styles.body}>
          <SwipeDeck
            key={this.state.deckKey}
            data={this.state.list}
            onSwipeRight={this.onSwipeRight}
            onPressCard={this.openUser}
            onExhaust={() => this.props.user?.isLogged && this.load(this.state.page + 1)}
            renderEmpty={this.renderEmpty}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SC.cream },
  body: { flex: 1 },

  head: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 14,
    paddingTop: 6,
    paddingBottom: 6,
  },
  tabs: { flex: 1, flexDirection: 'row', alignItems: 'flex-end' },
  tabItem: { alignItems: 'center', marginRight: 24 },
  tabTxt: { fontSize: 17, fontWeight: '600', color: SC.mute },
  tabTxtOn: { fontSize: 24, fontWeight: '900', color: SC.ink },
  tabBar: { width: 18, height: 4, borderRadius: 2, marginTop: 3, backgroundColor: 'transparent' },
  tabBarOn: { backgroundColor: SC.rose },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyImg: { width: 200, height: 200 },
  emptyTitle: { marginTop: 6, fontSize: 17, fontWeight: '800', color: SC.ink },
  emptyDesc: { marginTop: 8, fontSize: 13, color: SC.mute, textAlign: 'center' },
  emptyCta: {
    marginTop: 18,
    backgroundColor: SC.rose,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyCtaTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
});

export default connect((s) => ({ user: s.user }))(Recommend);
