import React from 'react';
import {
  StyleSheet,
  StatusBar,
  Image,
  ImageBackground,
  Text,
  Pressable,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';

const { width: W, height: H } = Dimensions.get('window');
const HERO_H = Math.min(H * 0.38, W * 0.78);
const TILE = (W - 40 - 12) / 2;

const C = {
  ink: '#2A1420',
  rose: '#E23CFE',
  roseDeep: '#B018D4',
  blush: '#FFF0F6',
  soft: 'rgba(255,255,255,0.88)',
  mute: 'rgba(42,20,32,0.55)',
};

export const ROMANTIC_STEPS = [
  '给对方一个拥抱', '给对方一个吻', '一起唱一首歌', '互相说一句情话',
  '一起做10个俯卧撑', '给对方一个惊喜', '一起看一部电影', '给对方按摩5分钟',
  '互相讲一个笑话', '一起做饭', '互相画像', '一起跳舞', '给对方捶背',
  '一起玩游戏', '互相编头发', '一起散步', '给对方写一封信', '一起看星星',
  '互相分享秘密', '一起做运动', '给对方讲一个童年故事', '一起拍一张合照',
  '互相喂对方吃东西', '一起看日出或日落', '给对方一个惊喜礼物',
  '一起听一首喜欢的歌', '互相说三个优点', '一起做一道甜品', '给对方洗脚',
  '一起玩一个小游戏', '互相模仿对方', '一起规划未来', '给对方写一首诗',
  '一起看老照片', '互相化妆', '一起去散步30分钟', '给对方唱一首歌',
  '一起做手工', '互相按摩肩膀', '一起看搞笑视频', '给对方讲一个笑话',
  '一起做瑜伽', '互相说出最喜欢对方的地方', '一起玩猜谜游戏',
  '给对方一个深情的拥抱', '一起制定一周计划', '互相分享梦想',
  '一起做一件浪漫的事', '给对方一个甜蜜的吻', '一起跳一支舞',
  '互相说"我爱你"', '一起许下一个愿望', '给对方一个承诺', '一起庆祝胜利！',
];

export const FITNESS_STEPS = [
  '一起做10个深蹲', '互相击掌20次', '一起做15个开合跳', '平板支撑30秒',
  '一起做10个俯卧撑', '互相拉伸腿部', '一起跳绳50下', '做20个仰卧起坐',
  '一起原地跑步1分钟', '互相按摩小腿', '一起做15个弓步蹲', '高抬腿30秒',
  '一起做波比跳10个', '互相拉伸手臂', '一起做20个深蹲', '平板支撑45秒',
  '一起做箭步蹲15个', '互相击掌30次', '一起做卷腹20个', '原地高抬腿40秒',
  '一起做俯卧撑15个', '互相拉伸背部', '一起跳绳100下', '做平板支撑1分钟',
  '一起做深蹲跳15个', '互相按摩肩膀', '一起做开合跳30个', '做仰卧起坐30个',
  '一起原地跑步2分钟', '互相拉伸全身', '一起做波比跳15个', '平板支撑1分30秒',
  '一起做弓步蹲20个', '互相击掌50次', '一起做俯卧撑20个', '高抬腿1分钟',
  '一起做深蹲30个', '互相按摩腰部', '一起跳绳150下', '做卷腹30个',
  '一起做箭步蹲25个', '互相拉伸腿部', '一起做波比跳20个', '平板支撑2分钟',
  '一起做深蹲跳20个', '互相击掌100次', '一起做俯卧撑25个', '原地高抬腿2分钟',
  '一起做开合跳50个', '互相拉伸全身', '一起做仰卧起坐40个', '平板支撑3分钟',
  '一起做深蹲50个', '抱起对方转一圈', '一起庆祝健身成功！',
];

class Home extends React.Component {
  fade = new Animated.Value(0);
  rise = new Animated.Value(18);

  componentDidMount() {
    // 本地棋类/派对可先玩，登录放到需要同步/创作时再拦
    this.applyImmersiveStatusBar();
    this.focusUnsub = this.props.navigation.addListener('focus', this.applyImmersiveStatusBar);
    Animated.parallel([
      Animated.timing(this.fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(this.rise, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }

  componentWillUnmount() {
    if (this.focusUnsub) this.focusUnsub();
  }

  applyImmersiveStatusBar = () => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
  };

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

  startTruthOrDare = () => {
    this.props.navigation.push('TruthOrDareGame', {
      mode: 'both',
      truths: this.props.truths || [],
      dares: this.props.dares || [],
    });
  };

  goCustom = () => {
    this.props.navigation.navigate('Found', { currentTab: 'creation' });
  };

  render() {
    return (
      <View style={styles.root}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* 第一屏：一个构图 — 品牌 + 一句 headline + 一句支撑 + 一组 CTA + 全出血主视觉 */}
          <ImageBackground
            source={require('../asserts/images/home/v2_hero.png')}
            style={styles.hero}
            resizeMode="cover"
          >
            <View style={styles.heroScrim1} pointerEvents="none" />
            <View style={styles.heroScrim2} pointerEvents="none" />
            <View style={styles.heroScrim3} pointerEvents="none" />
            <SafeAreaView edges={['top']} style={styles.heroSafe}>
              <Animated.View
                style={[
                  styles.heroCopy,
                  { opacity: this.fade, transform: [{ translateY: this.rise }] },
                ]}
              >
                <Text style={styles.brand}>同城有约</Text>
                <Text style={styles.headline}>今晚，和 TA 玩一局</Text>
                <Text style={styles.support}>飞行棋 · 象棋 · 五子棋 · 派对</Text>

                <Pressable
                  onPress={this.startRomantic}
                  style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
                >
                  <Text style={styles.ctaText}>开始情侣飞行棋</Text>
                  <Icons name="arrowright" size={16} color="#fff" style={{ marginLeft: 8 }} />
                </Pressable>
              </Animated.View>
            </SafeAreaView>
          </ImageBackground>

          {/* 第二屏一块：换一种玩法 — 大图块，不做信息卡片墙 */}
          <View style={styles.sheet}>
            <Text style={styles.blockTitle}>换一种玩法</Text>
            <Text style={styles.blockDesc}>同一套棋盘，不同的夜晚气氛</Text>

            <View style={styles.modeRow}>
              <TouchableOpacity activeOpacity={0.9} onPress={this.startTruthOrDare} style={styles.modeTile}>
                <Image source={require('../asserts/images/home/v2_truth.png')} style={styles.modeImg} />
                <View style={styles.modeCaption}>
                  <Text style={styles.modeName}>真心话大冒险</Text>
                  <Text style={styles.modeHint}>抽题当面玩</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.9} onPress={this.goCustom} style={styles.modeTile}>
                <Image source={require('../asserts/images/home/v2_custom.png')} style={styles.modeImg} />
                <View style={styles.modeCaption}>
                  <Text style={styles.modeName}>创建玩法</Text>
                  <Text style={styles.modeHint}>创建专属飞行棋、真心话</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* 棋类对战：象棋主推 + 五子棋/黑白棋 */}
            <View style={styles.partyBlock}>
              <Text style={styles.blockTitle}>棋类对战</Text>
              <Text style={styles.blockDesc}>面对面双人局，不联网也能玩</Text>

              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => this.props.navigation.push('XiangqiGame')}
                style={styles.featureWide}
              >
                <Image source={require('../asserts/images/home/v2_xiangqi.png')} style={styles.featureWideImg} />
                <View style={styles.featureWideBody}>
                  <Text style={styles.featureWideTag}>经典</Text>
                  <Text style={styles.featureWideTitle}>中国象棋</Text>
                  <Text style={styles.featureWideHint}>楚河汉界 · 红黑对弈</Text>
                </View>
                <View style={styles.featureWideGo}>
                  <Icons name="arrowright" size={14} color="#fff" />
                </View>
              </TouchableOpacity>

              <View style={[styles.modeRow, { marginTop: 12 }]}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => this.props.navigation.push('GomokuGame')}
                  style={styles.modeTile}
                >
                  <Image source={require('../asserts/images/home/v2_gomoku.png')} style={styles.modeImg} />
                  <View style={styles.modeCaption}>
                    <Text style={styles.modeName}>五子棋</Text>
                    <Text style={styles.modeHint}>五子连珠</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => this.props.navigation.push('OthelloGame')}
                  style={styles.modeTile}
                >
                  <Image source={require('../asserts/images/home/v2_othello.png')} style={styles.modeImg} />
                  <View style={styles.modeCaption}>
                    <Text style={styles.modeName}>黑白棋</Text>
                    <Text style={styles.modeHint}>翻转吃子</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.partyBlock}>
              <Text style={styles.blockTitle}>派对开场</Text>
              <Text style={styles.blockDesc}>不想下棋时，抽题当面玩</Text>
              <View style={styles.modeRow}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => this.props.navigation.push('TruthMode')}
                  style={styles.modeTile}
                >
                  <Image source={require('../asserts/images/home/v2_truth.png')} style={styles.modeImg} />
                  <View style={styles.modeCaption}>
                    <Text style={styles.modeName}>真心话</Text>
                    <Text style={styles.modeHint}>快速开始</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => this.props.navigation.push('DareMode')}
                  style={styles.modeTile}
                >
                  <Image source={require('../asserts/images/home/v2_dare.png')} style={styles.modeImg} />
                  <View style={styles.modeCaption}>
                    <Text style={styles.modeName}>大冒险</Text>
                    <Text style={styles.modeHint}>快速开始</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.foot}>玩得开心 · 注意分寸 · 尊重彼此</Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  isLogged: state.user.isLogged,
  token: state.user.token,
  user: state.user,
  truths: state.game?.truths,
  dares: state.game?.dares,
});

export default connect(mapStateToProps)(Home);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.blush },
  scroll: { paddingBottom: 100 },

  hero: {
    width: W,
    height: HERO_H,
    justifyContent: 'flex-end',
  },
  heroScrim1: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    backgroundColor: 'rgba(28,6,22,0.15)',
  },
  heroScrim2: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '38%',
    backgroundColor: 'rgba(28,6,22,0.45)',
  },
  heroScrim3: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '22%',
    backgroundColor: 'rgba(28,6,22,0.72)',
  },
  heroSafe: { flex: 1, justifyContent: 'flex-end' },
  heroCopy: {
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  brand: {
    color: 'rgba(255,220,245,0.95)',
    fontSize: 12,
    letterSpacing: 5,
    fontWeight: '600',
    marginBottom: 6,
  },
  headline: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: 1,
  },
  support: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    letterSpacing: 1,
  },
  cta: {
    marginTop: 14,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.rose,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    shadowColor: C.rose,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  ctaPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },

  sheet: {
    marginTop: -18,
    backgroundColor: C.blush,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 28,
    paddingHorizontal: 20,
    minHeight: H * 0.5,
  },
  blockTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: 0.5,
  },
  blockDesc: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 13,
    color: C.mute,
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeTile: {
    width: TILE,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  modeImg: {
    width: '100%',
    height: TILE * 0.95,
  },
  modeCaption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modeName: {
    fontSize: 16,
    fontWeight: '700',
    color: C.ink,
  },
  modeHint: {
    marginTop: 3,
    fontSize: 12,
    color: C.mute,
  },
  partyBlock: {
    marginTop: 32,
  },
  featureWide: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    overflow: 'hidden',
    paddingRight: 14,
  },
  featureWideImg: {
    width: 108,
    height: 108,
  },
  featureWideBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  featureWideTag: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '700',
    color: C.rose,
    backgroundColor: 'rgba(226,60,254,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 6,
  },
  featureWideTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.ink,
  },
  featureWideHint: {
    marginTop: 4,
    fontSize: 12,
    color: C.mute,
  },
  featureWideGo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foot: {
    marginTop: 36,
    textAlign: 'center',
    color: 'rgba(42,20,32,0.35)',
    fontSize: 12,
  },
});
