import React from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Image,
  Text,
  Pressable,
  Linking,
  Platform,
  View,
  Dimensions,
} from 'react-native';
import Icons from 'react-native-vector-icons/AntDesign';
import { connect } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Config from '../config/index';
import { SC } from '../theme/social';
import Http from '../utils/HttpPost';
import { isVipActive, getVipBadgeText } from '../utils/vip';

import CachedImage from '../component/CachedImage';
const { width: W } = Dimensions.get('window');
const PAD = 14;
const HERO = '#8F63F2';
const HERO_DARK = '#7B4FE0';
const HERO_LIGHT = '#A982F7';
const BLUE = '#4FC3F7';
const PINK = '#FF8FB1';
const THUMB = (W - PAD * 2 - 8) / 3;

const SERVICE_ROWS = [
  { icon: 'questioncircleo', label: '常见问题', route: 'ChangjianWt' },
  { icon: 'customerservice', label: '联系客服', route: 'CausMens' },
  { icon: 'mail', label: '反馈建议', route: 'ProblemBack' },
  { icon: 'infocirlceo', label: '关于我们', route: 'GuanyuYika' },
  { icon: 'filetext1', label: '个人信息收集', route: 'PrivacyInfo' },
  { icon: 'Safety', label: '第三方 SDK', route: 'ThirdPartySDK' },
];

const PUBLIC_ROUTES = ['GuanyuYika', 'ChangjianWt', 'PrivacyInfo', 'ThirdPartySDK'];

const TABS = [
  { key: 'say', label: '瞬间', type: 4 },
  { key: 'like', label: '赞过', type: 6 },
];

function avatarUri(user) {
  const a = user?.avatar || user?.myFace;
  if (!a) {
    return null;
  }
  if (/^https?:\/\//i.test(a)) {
    return a;
  }
  return Config.File_PATH + a;
}

function two(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function fmtTime(ms) {
  const d = new Date(Number(ms));
  if (!ms || Number.isNaN(d.getTime())) {
    return '';
  }
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())} ${two(d.getHours())}:${two(d.getMinutes())}`;
}

function daysSince(t) {
  const ms = new Date(t).getTime();
  if (!ms) {
    return 0;
  }
  return Math.max(1, Math.floor((Date.now() - ms) / 86400000) + 1);
}

class Users extends React.Component {
  state = {
    refreshing: false,
    stats: { likeCount: 0, likedCount: 0, sayCount: 0 },
    tab: 0,
    says: [],
    sayLoaded: false,
  };

  applyStatusBar = () => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
  };

  componentDidMount() {
    this.applyStatusBar();
    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      this.applyStatusBar();
      this.refreshAll();
    });
    this.refreshAll();
  }

  componentWillUnmount() {
    if (this.unsubscribeFocus) {
      this.unsubscribeFocus();
    }
  }

  refreshAll = () => {
    if (!this.props.isLogged) {
      return Promise.resolve();
    }
    this.setState({ refreshing: true });
    return Promise.all([this.refreshProfile(), this.refreshStats(), this.loadSays()]).finally(() =>
      this.setState({ refreshing: false })
    );
  };

  refreshProfile = () =>
    Http('get', '/users/profile')
      .then((res) => {
        if (res?.code === 200 && res.data) {
          this.props.setUserInfo(res.data);
        }
      })
      .catch(() => {});

  refreshStats = () =>
    Http('post', '/social/user/myStats', {})
      .then((res) => {
        if (res?.code === 200 && res.data) {
          this.setState({ stats: res.data });
        }
      })
      .catch(() => {});

  loadSays = (tab = this.state.tab) =>
    Http('post', '/social/say/getPublishSay', { type: TABS[tab].type, page: 0, pageNum: 20 })
      .then((res) => {
        if (res?.code === 200) {
          this.setState({ says: res.data?.list || [], sayLoaded: true });
        }
      })
      .catch(() => {});

  switchTab = (tab) => {
    if (tab === this.state.tab) {
      return;
    }
    this.setState({ tab, says: [], sayLoaded: false }, () => this.loadSays(tab));
  };

  go = (route, params) => {
    if (!this.props.isLogged && !PUBLIC_ROUTES.includes(route)) {
      this.props.navigation.navigate('Login');
      return;
    }
    this.props.navigation.navigate(route, params);
  };

  /* ---------------- 顶部：紫色星球背景 + 工具栏 ---------------- */

  renderHero() {
    const { user, isLogged, insets } = this.props;
    const top = (insets?.top || StatusBar.currentHeight || 0) + 6;
    return (
      <View style={[styles.hero, { paddingTop: top }]}>
        <View style={[styles.orb, styles.orbA]} />
        <View style={[styles.orb, styles.orbB]} />
        <View style={[styles.ring]} />
        <View style={[styles.orb, styles.orbC]} />
        <View style={styles.topBar}>
          <View style={{ width: 28 }} />
          <View style={styles.topRight}>
            {isLogged ? (
              <Pressable style={styles.spacePill} onPress={() => this.go('MySays', { mine: true })}>
                <Icons name="earth" size={14} color="#fff" />
                <Text style={styles.spaceTxt}>我的空间</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.topIcon} onPress={() => this.go('Setting')} hitSlop={8}>
              <Icons name="setting" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>
        {isLogged && user?.city ? (
          <Text style={styles.ipTxt}>所在地：{user.city}</Text>
        ) : null}
      </View>
    );
  }

  renderChip(txt, extra) {
    return (
      <View style={[styles.chip, extra]}>
        <Text style={styles.chipTxt}>{txt}</Text>
      </View>
    );
  }

  renderProfile() {
    const { user, isLogged } = this.props;
    const { stats } = this.state;
    const face = avatarUri(user);
    const vip = isVipActive(user);

    if (!isLogged) {
      return (
        <View style={styles.card}>
          <Pressable style={styles.loginRow} onPress={() => this.go('Login')}>
            <View style={[styles.avatar, styles.avatarPh]}>
              <Icons name="user" size={34} color={SC.roseSoft} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.name}>登录同城有约</Text>
              <Text style={styles.sign}>开启扩列 · 动态 · 私聊</Text>
            </View>
            <View style={styles.loginPill}>
              <Text style={styles.loginPillTxt}>去登录</Text>
            </View>
          </Pressable>
        </View>
      );
    }

    const male = Number(user.gender) === 1;
    const tags = [...(user.tags || []), ...(user.hobbies || [])].slice(0, 6);

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Pressable onPress={() => this.go('MyHome')}>
            {face ? (
              <FastImage style={styles.avatar} source={{ uri: face }} />
            ) : (
              <Image style={styles.avatar} source={require('../asserts/images/user/plc_user.png')} />
            )}
          </Pressable>
          <View style={styles.cardRight}>
            <Pressable style={styles.nameRow} onPress={() => this.go('MyHome')}>
              <Text style={styles.name} numberOfLines={1}>
                {user.name || user.account || '用户'}
              </Text>
              <Icons name="edit" size={16} color="#B5B5BF" style={{ marginLeft: 6 }} />
            </Pressable>
            <View style={styles.stats}>
              <Pressable style={styles.stat} onPress={() => this.go('LoveMe')}>
                <Text style={styles.statNum}>{stats.likedCount}</Text>
                <Text style={styles.statLab}>喜欢我</Text>
              </Pressable>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{stats.likeCount}</Text>
                <Text style={styles.statLab}>我喜欢</Text>
              </View>
              <Pressable style={styles.stat} onPress={() => this.go('MySays', { mine: true })}>
                <Text style={styles.statNum}>{stats.sayCount}</Text>
                <Text style={styles.statLab}>动态</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable onPress={() => this.go('MyHome')}>
          <Text style={[styles.sign, !(user.signStr || user.desc) && { color: '#A7A7B3' }]} numberOfLines={2}>
            {user.signStr || user.desc || '未设置个性签名'}
          </Text>
        </Pressable>

        <View style={styles.chipRow}>
          {user.gender
            ? this.renderChip(
                `${male ? '♂' : '♀'}${user.age ? ` ${user.age}` : ''}`,
                { backgroundColor: male ? BLUE : PINK }
              )
            : null}
          {vip ? this.renderChip(getVipBadgeText(user), { backgroundColor: '#F7B731' }) : null}
          {user.city ? this.renderChip(user.city, styles.chipGray) : null}
          {user.job ? this.renderChip(user.job, styles.chipGray) : null}
          {user.registerTime ? this.renderChip(`${daysSince(user.registerTime)}天`, styles.chipGray) : null}
        </View>

        <Pressable style={styles.tagBox} onPress={() => this.go('MyHome')}>
          <View style={styles.tagWrap}>
            {tags.length ? (
              tags.map((t) => (
                <Text key={t} style={styles.tagTxt}>
                  {t}
                </Text>
              ))
            ) : (
              <Text style={styles.tagEmpty}>添加形象标签和兴趣爱好，让大家更了解你</Text>
            )}
          </View>
          <View style={styles.tagPlus}>
            <Icons name="plus" size={14} color="#666" />
          </View>
        </Pressable>
      </View>
    );
  }

  /* ---------------- 快捷入口：一排图标 ---------------- */

  renderEntries() {
    const { user, isLogged } = this.props;
    if (!isLogged) {
      return null;
    }
    const vip = isVipActive(user);
    const items = [
      { icon: 'pay-circle1', color: '#5B8DEF', bg: '#E8F0FE', label: `钻石 ${Math.floor(Number(user?.yuanbao) || 0)}`, route: 'Diamond' },
      { icon: 'Trophy', color: '#E5A21C', bg: '#FFF4DB', label: vip ? '会员中心' : '开通会员', route: 'Recharge' },
      { icon: 'contacts', color: '#2FBF9B', bg: '#DFF7F0', label: '抽到的微信', route: 'MyWeFriend' },
      { icon: 'gift', color: '#F0668F', bg: '#FFE6EE', label: '盲盒订单', route: 'OrderDetail' },
      { icon: 'hearto', color: '#9B6BF2', bg: '#EFE6FE', label: '喜欢我', route: 'LoveMe' },
    ];
    return (
      <View style={[styles.card, styles.entryCard]}>
        {items.map((it) => (
          <Pressable key={it.route} style={styles.entry} onPress={() => this.go(it.route)}>
            <View style={[styles.entryIcon, { backgroundColor: it.bg }]}>
              <Icons name={it.icon} size={22} color={it.color} />
            </View>
            <Text style={styles.entryTxt} numberOfLines={1}>
              {it.label}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  /* ---------------- 瞬间 / 赞过 ---------------- */

  renderSayItem = (item) => {
    const imgs = item.imgList || [];
    return (
      <View key={item._id} style={styles.say}>
        <View style={styles.sayHead}>
          <Text style={styles.sayTime}>{fmtTime(item.time)}</Text>
          {this.state.tab === 1 ? <Text style={styles.sayWho}>{item.nickName}</Text> : null}
        </View>
        <Text style={styles.sayText}>{item.data}</Text>
        {imgs.length ? (
          <View style={styles.sayImgs}>
            {imgs.slice(0, 9).map((uri, i) => (
              <CachedImage key={`${uri}_${i}`} source={{ uri }} style={styles.sayImg} />
            ))}
          </View>
        ) : null}
        <View style={styles.sayFoot}>
          <Icons name="hearto" size={13} color="#A7A7B3" />
          <Text style={styles.sayCnt}>{item.likeCount || 0}</Text>
          <Icons name="message1" size={13} color="#A7A7B3" style={{ marginLeft: 14 }} />
          <Text style={styles.sayCnt}>{item.commentCount || 0}</Text>
        </View>
      </View>
    );
  };

  renderMoments() {
    if (!this.props.isLogged) {
      return null;
    }
    const { tab, says, sayLoaded, stats } = this.state;
    return (
      <View style={styles.momentBox}>
        <View style={styles.mTabs}>
          {TABS.map((t, i) => {
            const on = tab === i;
            return (
              <Pressable key={t.key} style={styles.mTab} onPress={() => this.switchTab(i)}>
                <Text style={[styles.mTabTxt, on && styles.mTabOn]}>
                  {t.label}
                  {i === 0 && stats.sayCount ? <Text style={styles.mTabNum}> {stats.sayCount}</Text> : null}
                </Text>
                <View style={[styles.mBar, on && styles.mBarOn]} />
              </Pressable>
            );
          })}
        </View>
        <View style={styles.mHead}>
          <Text style={styles.mAll}>全部</Text>
          <Pressable hitSlop={10} onPress={() => this.go('PublishSay')}>
            <Icons name="plus" size={20} color="#222" />
          </Pressable>
        </View>
        {says.map(this.renderSayItem)}
        {sayLoaded && !says.length ? (
          <Pressable style={styles.emptyBox} onPress={() => (tab === 0 ? this.go('PublishSay') : null)}>
            <Text style={styles.emptyTxt}>
              {tab === 0 ? '还没有动态，点这里发布第一条' : '还没有赞过的动态'}
            </Text>
          </Pressable>
        ) : null}
        {sayLoaded && says.length ? <Text style={styles.noMore}>没有更多了</Text> : null}
      </View>
    );
  }

  renderService() {
    return (
      <View style={styles.serviceCard}>
        <Pressable style={styles.listRow} onPress={() => Linking.openURL('https://daoyikeji.com')}>
          <View style={styles.listLeft}>
            <View style={styles.listIcon}>
              <Icons name="link" size={15} color={SC.rose} />
            </View>
            <Text style={styles.listTxt}>官网网站</Text>
          </View>
          <Icons name="right" size={12} color={SC.mute2} />
        </Pressable>
        {SERVICE_ROWS.map((item, i) => (
          <Pressable
            key={item.route}
            style={[styles.listRow, i === SERVICE_ROWS.length - 1 && styles.listRowLast]}
            onPress={() => this.go(item.route)}
          >
            <View style={styles.listLeft}>
              <View style={styles.listIcon}>
                <Icons name={item.icon} size={15} color={SC.rose} />
              </View>
              <Text style={styles.listTxt}>{item.label}</Text>
            </View>
            <Icons name="right" size={12} color={SC.mute2} />
          </Pressable>
        ))}
      </View>
    );
  }

  render() {
    return (
      <View style={styles.root}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.refreshAll}
              tintColor="#fff"
              progressViewOffset={60}
            />
          }
        >
          {this.renderHero()}
          {this.renderProfile()}
          {this.renderEntries()}
          {this.renderMoments()}
          {this.renderService()}
          <Text style={styles.foot}>同城有约</Text>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  isLogged: state.user.isLogged,
  token: state.user.token,
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  setUserInfo: (payload) => dispatch({ type: 'SET_USERINFO', payload }),
});

function UsersWithInsets(props) {
  const insets = useSafeAreaInsets();
  return <Users {...props} insets={insets} />;
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersWithInsets);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F6F8' },
  scroll: { paddingBottom: 30 },

  /* 紫色星球头图 */
  hero: { height: 250, backgroundColor: HERO, overflow: 'hidden' },
  orb: { position: 'absolute', borderRadius: 999 },
  orbA: { width: 260, height: 260, right: -70, top: -60, backgroundColor: HERO_LIGHT, opacity: 0.55 },
  orbB: { width: 150, height: 150, left: -50, top: 90, backgroundColor: HERO_DARK, opacity: 0.55 },
  orbC: { width: 60, height: 60, left: W * 0.42, top: 70, backgroundColor: '#fff', opacity: 0.16 },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.22)',
    left: W * 0.12,
    top: 36,
    transform: [{ rotate: '-20deg' }, { scaleY: 0.45 }],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PAD + 2,
    height: 44,
  },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  spacePill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    marginRight: 18,
  },
  spaceTxt: { marginLeft: 5, color: '#fff', fontSize: 13, fontWeight: '700' },
  topIcon: { padding: 2 },
  ipTxt: { position: 'absolute', right: PAD + 2, bottom: 76, color: '#fff', fontSize: 11, opacity: 0.9 },

  /* 资料卡 */
  card: {
    marginHorizontal: PAD,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
  },
  cardTop: { flexDirection: 'row', marginTop: -44 },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: SC.card,
  },
  avatarPh: { alignItems: 'center', justifyContent: 'center' },
  cardRight: { flex: 1, marginLeft: 12, paddingTop: 44 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: -2 },
  name: { fontSize: 19, fontWeight: '800', color: '#1F1F28', flexShrink: 1 },
  stats: { flexDirection: 'row', marginTop: 6 },
  stat: { alignItems: 'center', marginRight: 22 },
  statNum: { fontSize: 18, fontWeight: '800', color: '#1F1F28' },
  statLab: { marginTop: 1, fontSize: 11, color: '#8A8A98' },
  sign: { marginTop: 10, fontSize: 14, color: '#3B3B48', lineHeight: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  chip: {
    height: 22,
    paddingHorizontal: 9,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  chipGray: { backgroundColor: '#F1F1F6' },
  chipTxt: { fontSize: 12, color: '#fff', fontWeight: '600' },
  tagBox: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6FA',
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 8,
    minHeight: 44,
  },
  tagWrap: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 8 },
  tagTxt: { fontSize: 13, color: '#333', marginRight: 14, lineHeight: 20 },
  tagEmpty: { fontSize: 12, color: '#A7A7B3', lineHeight: 20 },
  tagPlus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  loginRow: { flexDirection: 'row', alignItems: 'center', marginTop: -44 },
  loginPill: { backgroundColor: SC.rose, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginTop: 40 },
  loginPillTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },

  /* 快捷入口 */
  entryCard: { marginTop: 12, flexDirection: 'row', paddingHorizontal: 6, paddingVertical: 14 },
  entry: { flex: 1, alignItems: 'center' },
  entryIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryTxt: { marginTop: 7, fontSize: 11, color: '#333' },

  /* 瞬间 */
  momentBox: { marginTop: 12, backgroundColor: '#fff' },
  mTabs: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 6 },
  mTab: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  mTabTxt: { fontSize: 17, color: '#8A8A98', fontWeight: '700' },
  mTabOn: { color: '#1F1F28' },
  mTabNum: { fontSize: 12, color: '#8A8A98', fontWeight: '400' },
  mBar: { marginTop: 6, width: 22, height: 3, borderRadius: 2, backgroundColor: 'transparent' },
  mBarOn: { backgroundColor: SC.rose },
  mHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PAD + 2,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEE',
  },
  mAll: { fontSize: 15, color: '#1F1F28' },
  say: { paddingHorizontal: PAD + 2, paddingVertical: 14, borderTopWidth: 8, borderTopColor: '#F5F6F8' },
  sayHead: { flexDirection: 'row', alignItems: 'center' },
  sayTime: { fontSize: 13, color: '#A7A7B3' },
  sayWho: { marginLeft: 10, fontSize: 13, color: '#6F6FF0' },
  sayText: { marginTop: 8, fontSize: 16, color: '#1F1F28', lineHeight: 23 },
  sayImgs: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  sayImg: { width: THUMB, height: THUMB, borderRadius: 6, marginRight: 4, marginBottom: 4, backgroundColor: '#EEE' },
  sayFoot: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  sayCnt: { marginLeft: 4, fontSize: 12, color: '#A7A7B3' },
  emptyBox: { alignItems: 'center', paddingVertical: 36 },
  emptyTxt: { fontSize: 14, color: '#B7B7C2' },
  noMore: { textAlign: 'center', fontSize: 14, color: '#C0C0CA', paddingVertical: 28 },

  /* 服务 */
  serviceCard: { marginTop: 12, marginHorizontal: PAD, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SC.line,
  },
  listRowLast: { borderBottomWidth: 0 },
  listLeft: { flexDirection: 'row', alignItems: 'center' },
  listIcon: {
    width: 30,
    height: 30,
    borderRadius: 11,
    backgroundColor: 'rgba(226,60,254,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listTxt: { fontSize: 14, color: SC.ink, fontWeight: '600' },

  foot: { textAlign: 'center', marginTop: 24, marginBottom: 12, fontSize: 12, color: '#B7B7C2' },
});
