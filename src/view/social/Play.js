import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import { SC, socialShadowLite } from '../../theme/social';
import { ROMANTIC_STEPS } from '../Home';

const PAD = 20;

/** 扩列：图文列表行 */
const MEET = [
  {
    key: 'qiqiu',
    title: '漂流瓶',
    desc: '捞起陌生心事，或把你的话送出海',
    route: 'Qiqiu',
    img: require('../../asserts/images/home/drift_bottle.jpg'),
  },
  {
    key: 'swipe',
    title: '滑卡速配',
    desc: '右滑喜欢，左滑略过',
    route: 'Swipe',
    img: require('../../asserts/images/home/v2_hero.png'),
  },
  {
    key: 'community',
    title: '玩法社区',
    desc: '看看大家都在玩什么',
    route: 'DynamicPage',
    img: require('../../asserts/images/home/v2_romantic.png'),
  },
];

/** 棋盘派对：横滑海报 */
const GAMES = [
  { key: 'all', title: '全部棋盘', route: 'GamesHome', img: require('../../asserts/images/home/v2_hero.png') },
  { key: 'tr', title: '真心话', route: 'TruthMode', img: require('../../asserts/images/home/v2_truth.png') },
  { key: 'da', title: '大冒险', route: 'DareMode', img: require('../../asserts/images/home/v2_dare.png') },
  { key: 'xq', title: '中国象棋', route: 'XiangqiGame', img: require('../../asserts/images/home/v2_xiangqi.png') },
  { key: 'gm', title: '五子棋', route: 'GomokuGame', img: require('../../asserts/images/home/v2_gomoku.png') },
  { key: 'ot', title: '黑白棋', route: 'OthelloGame', img: require('../../asserts/images/home/v2_othello.png') },
];

/** 更多：与扩列同款图文行 */
const MORE = [
  {
    key: 'baibao',
    title: '百宝箱',
    desc: '小工具与福利',
    route: 'BaibaoPage',
    img: require('../../asserts/images/home/v2_box.png'),
  },
];

const NEED_LOGIN = ['Swipe', 'Qiqiu', 'DynamicPage', 'BaibaoPage'];

class Play extends React.Component {
  componentDidMount() {
    this.focusUnsub = this.props.navigation.addListener('focus', () => {
      StatusBar.setBarStyle('dark-content');
      // 棋盘页是全屏沉浸式（状态栏透明），这里先统一成透明，
      // 否则 Android 进入棋盘时布局会被状态栏高度顶上去
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor('transparent');
      }
    });
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

  go = (route) => {
    if (NEED_LOGIN.includes(route)) {
      this.requireLogin(() => this.props.navigation.navigate(route));
      return;
    }
    this.props.navigation.navigate(route);
  };

  /** 情侣飞行棋：和 TA 一起挑战浪漫任务 */
  startRomantic = () => {
    this.props.navigation.push('CoupleFlyingChess', {
      gameData: {
        title: '情侣飞行棋',
        description: '和TA一起挑战浪漫任务',
        playerCount: 2,
        steps: ROMANTIC_STEPS,
      },
    });
  };

  /** 真心话大冒险 */
  startTruthOrDare = () => {
    this.props.navigation.push('TruthOrDareGame', {
      mode: 'both',
      truths: this.props.truths || [],
      dares: this.props.dares || [],
    });
  };

  /** 自定义棋盘（需要登录） */
  goCustom = () => {
    this.requireLogin(() => this.props.navigation.navigate('Found', { currentTab: 'creation' }));
  };

  renderHero = () => (
    <View>
      <Pressable style={[styles.hero, socialShadowLite]} onPress={this.startRomantic}>
        <Image source={require('../../asserts/images/home/v2_hero.png')} style={styles.heroImg} />
        <View style={styles.heroScrim} pointerEvents="none" />
        <View style={styles.heroText} pointerEvents="none">
          <Text style={styles.heroTitle}>情侣飞行棋</Text>
          <Text style={styles.heroDesc}>和 TA 一起挑战浪漫任务，今晚玩一局</Text>
        </View>
        <View style={styles.heroGo}>
          <Text style={styles.heroGoTxt}>开始</Text>
        </View>
      </Pressable>
      <View style={styles.tileRow}>
        <Pressable style={[styles.tile, socialShadowLite]} onPress={this.startTruthOrDare}>
          <Image source={require('../../asserts/images/home/v2_truth.png')} style={styles.tileImg} />
          <View style={styles.tileScrim} pointerEvents="none" />
          <View style={styles.tileText} pointerEvents="none">
            <Text style={styles.tileTitle}>真心话大冒险</Text>
            <Text style={styles.tileDesc}>抽题当面玩</Text>
          </View>
        </Pressable>
        <Pressable style={[styles.tile, socialShadowLite, { marginRight: 0 }]} onPress={this.goCustom}>
          <Image source={require('../../asserts/images/home/v2_custom.png')} style={styles.tileImg} />
          <View style={styles.tileScrim} pointerEvents="none" />
          <View style={styles.tileText} pointerEvents="none">
            <Text style={styles.tileTitle}>创建玩法</Text>
            <Text style={styles.tileDesc}>飞行棋 · 真心话大冒险</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );

  renderMeet = () => (
    <View style={styles.listCard}>
      {MEET.map((m, i) => (
        <Pressable
          key={m.key}
          style={[styles.row, i === MEET.length - 1 && styles.rowLast]}
          onPress={() => this.go(m.route)}
        >
          <Image source={m.img} style={styles.thumb} />
          <View style={styles.rowMid}>
            <Text style={styles.rowTitle}>{m.title}</Text>
            <Text style={styles.rowDesc} numberOfLines={1}>
              {m.desc}
            </Text>
          </View>
          <Icons name="right" size={12} color={SC.mute2} />
        </Pressable>
      ))}
    </View>
  );

  renderGames = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.posterRow}
    >
      {GAMES.map((g) => (
        <Pressable key={g.key} style={styles.poster} onPress={() => this.go(g.route)}>
          <Image source={g.img} style={styles.posterImg} />
          <Text style={styles.posterTxt}>{g.title}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  renderMore = () => (
    <View style={styles.listCard}>
      {MORE.map((m, i) => (
        <Pressable
          key={m.key}
          style={[styles.row, i === MORE.length - 1 && styles.rowLast]}
          onPress={() => this.go(m.route)}
        >
          <Image source={m.img} style={styles.thumb} />
          <View style={styles.rowMid}>
            <Text style={styles.rowTitle}>{m.title}</Text>
            <Text style={styles.rowDesc} numberOfLines={1}>
              {m.desc}
            </Text>
          </View>
          <Icons name="right" size={12} color={SC.mute2} />
        </Pressable>
      ))}
    </View>
  );

  render() {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.topGap} />
          {this.renderHero()}

          <Text style={styles.sec}>扩列</Text>
          {this.renderMeet()}

          <Text style={styles.sec}>棋盘派对</Text>
          {this.renderGames()}

          <Text style={styles.sec}>更多</Text>
          {this.renderMore()}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const POSTER_W = 118;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SC.cream },
  scroll: { paddingBottom: 30 },
  topGap: { height: 12 },

  /* 主推：整幅插画 + 底部文字 */
  hero: {
    marginHorizontal: PAD,
    height: 168,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: SC.card,
  },
  heroImg: { width: '100%', height: '100%' },
  heroScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 96,
    backgroundColor: 'rgba(31,18,24,0.4)',
  },
  heroText: { position: 'absolute', left: 18, bottom: 16, right: 90 },
  heroTitle: { fontSize: 21, fontWeight: '900', color: '#fff' },
  heroDesc: { marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  heroGo: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
  },
  heroGoTxt: { fontSize: 13, fontWeight: '800', color: SC.rose },

  /* 真心话大冒险 / 自定义棋盘 两个小图块 */
  tileRow: { flexDirection: 'row', paddingHorizontal: PAD, marginTop: 12 },
  tile: {
    flex: 1,
    height: 104,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: SC.card,
    marginRight: 12,
  },
  tileImg: { width: '100%', height: '100%' },
  tileScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
    backgroundColor: 'rgba(31,18,24,0.4)',
  },
  tileText: { position: 'absolute', left: 14, bottom: 10 },
  tileTitle: { fontSize: 15, fontWeight: '900', color: '#fff' },
  tileDesc: { marginTop: 2, fontSize: 11, color: 'rgba(255,255,255,0.88)' },

  sec: {
    paddingHorizontal: PAD,
    marginTop: 26,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: '800',
    color: SC.ink,
  },

  /* 图文列表 */
  listCard: {
    marginHorizontal: PAD,
    backgroundColor: SC.soft,
    borderRadius: 22,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SC.line,
  },
  rowLast: { borderBottomWidth: 0 },
  thumb: { width: 54, height: 54, borderRadius: 16, backgroundColor: SC.card },
  rowMid: { flex: 1, marginLeft: 14, marginRight: 8 },
  rowTitle: { fontSize: 15, fontWeight: '800', color: SC.ink },
  rowDesc: { marginTop: 4, fontSize: 12, color: SC.mute },

  /* 棋盘海报横滑 */
  posterRow: { paddingHorizontal: PAD },
  poster: { width: POSTER_W, marginRight: 12 },
  posterImg: {
    width: POSTER_W,
    height: POSTER_W * 1.28,
    borderRadius: 20,
    backgroundColor: SC.card,
  },
  posterTxt: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: SC.ink,
  },
});

export default connect(
  (s) => ({
    user: s.user,
    truths: s.game?.truths,
    dares: s.game?.dares,
  }),
  (d) => ({ setUserInfo: (p) => d({ type: 'SET_USERINFO', payload: p }) })
)(Play);
