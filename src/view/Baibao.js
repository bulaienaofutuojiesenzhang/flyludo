import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Text,
  Alert,
  View,
  Platform,
} from 'react-native';
import { connect } from 'react-redux';
import Icons from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Metrics } from '../theme';

const CARD_GAP = 10;
const PAGE_PAD = 16;
// 向下取整，避免浮点宽度导致换行变成两列
const COL3_W = Math.floor((Metrics.screenWidth - PAGE_PAD * 2 - CARD_GAP * 2) / 3);

class Baibao extends React.Component {
  gameList = [
    { id: 1, title: '幸运转盘', icon: 'sync', tint: '#C19769', route: 'LuckyWheel' },
    { id: 2, title: '掷骰子', icon: 'questioncircleo', tint: '#5B9A8B', route: 'DiceGame' },
    { id: 3, title: '抛硬币', icon: 'creditcard', tint: '#D4A017', route: 'CoinFlip' },
    { id: 4, title: '随机数', icon: 'calculator', tint: '#6A8CAF', route: 'RandomNumber' },
    { id: 5, title: '幸运抽签', icon: 'gift', tint: '#E08A5B', route: 'LuckyDraw' },
    { id: 6, title: '今日运势', icon: 'staro', tint: '#C97BA5', route: 'DailyFortune' },
    { id: 7, title: '敲木鱼', icon: 'sound', tint: '#7BA89A', route: 'WoodenFish' },
    { id: 8, title: '二维码', icon: 'qrcode', tint: '#6B9B76', route: 'QRCodeGenerator' },
    { id: 9, title: '设备信息', icon: 'mobile1', tint: '#8B7EAB', route: 'DeviceInfo' },
  ];

  aiToolList = [
    {
      id: 'face',
      title: 'AI换脸',
      desc: '一键替换脸部',
      icon: 'people-outline',
      tint: '#C97BA5',
      route: 'FaceSwap',
      params: { mode: 'image' },
    },
    {
      id: 'clothes',
      title: 'AI换衣',
      desc: '多种服饰风格',
      icon: 'shirt-outline',
      tint: '#6A8CAF',
      route: 'AiTool',
      params: { ability: 'clothesSwap' },
    },
    {
      id: 'webp',
      title: '场景动图',
      desc: '静态变动态',
      icon: 'images-outline',
      tint: '#C19769',
      route: 'AiTool',
      params: { ability: 'sceneWebp' },
    },
    {
      id: 'sceneFace',
      title: '场景换脸',
      desc: '视频脸部替换',
      icon: 'videocam-outline',
      tint: '#E08A5B',
      route: 'FaceSwap',
      params: { mode: 'video' },
    },
    {
      id: 'sceneVideo',
      title: '场景视频',
      desc: '专属场景生成',
      icon: 'film-outline',
      tint: '#5B9A8B',
      route: 'AiTool',
      params: { ability: 'sceneVideo' },
    },
  ];

  ensureLogin = (onOk) => {
    if (this.props.isLogged) {
      onOk();
      return;
    }
    Alert.alert('提示', '请先登录后再使用 AI 功能', [
      { text: '取消', style: 'cancel' },
      {
        text: '去登录',
        onPress: () => this.props.navigation.navigate('Login'),
      },
    ]);
  };

  onGamePress = (game) => {
    this.props.navigation.push(game.route);
  };

  onAiPress = (item) => {
    this.ensureLogin(() => {
      this.props.navigation.push(item.route, item.params || {});
    });
  };

  onAiGirlfriendPress = () => {
    this.ensureLogin(() => {
      this.props.navigation.push('AiGirlfriend');
    });
  };

  render() {
    return (
      <SafeAreaView style={Styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8F5" />

        <ScrollView
          style={Styles.scrollView}
          contentContainerStyle={Styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={Styles.header}>
            <Text style={Styles.headerTitle}>百宝箱</Text>
          </View>

          <Text style={Styles.sectionTitle}>趣味工具</Text>
          <View style={Styles.toolGrid}>
            {this.gameList.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={Styles.toolCard}
                onPress={() => this.onGamePress(game)}
                activeOpacity={0.75}
              >
                <View style={[Styles.toolIconWrap, { backgroundColor: `${game.tint}18` }]}>
                  <Icons name={game.icon} size={22} color={game.tint} />
                </View>
                <Text style={Styles.toolTitle} numberOfLines={1}>
                  {game.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[Styles.sectionTitle, Styles.sectionTitleSpaced]}>AI 玩法</Text>
          <View style={Styles.aiGrid}>
            {this.aiToolList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={Styles.aiCard}
                onPress={() => this.onAiPress(item)}
                activeOpacity={0.75}
              >
                <View style={[Styles.aiIconWrap, { backgroundColor: `${item.tint}18` }]}>
                  <Ionicons name={item.icon} size={22} color={item.tint} />
                </View>
                <View style={Styles.aiTextCol}>
                  <Text style={Styles.aiTitle}>{item.title}</Text>
                  <Text style={Styles.aiDesc} numberOfLines={1}>
                    {item.desc}
                  </Text>
                </View>
                <Icons name="right" size={12} color="#C9B8B0" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* 底部固定：AI女友 */}
        <View style={Styles.bottomDock}>
          <TouchableOpacity
            style={Styles.gfBar}
            onPress={this.onAiGirlfriendPress}
            activeOpacity={0.88}
          >
            <View style={Styles.gfGlow} />
            <View style={Styles.gfIcon}>
              <Ionicons name="heart" size={22} color="#FFF" />
            </View>
            <View style={Styles.gfText}>
              <Text style={Styles.gfTitle}>AI女友</Text>
              <Text style={Styles.gfSub}>智能陪伴 · 随时开聊</Text>
            </View>
            <View style={Styles.gfCta}>
              <Text style={Styles.gfCtaTxt}>进入</Text>
              <Icons name="right" size={11} color="#C44A6A" />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  isLogged: state.user.isLogged,
  token: state.user.token,
  user: state.user,
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Baibao);

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PAGE_PAD,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2A1F24',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A1F24',
    marginBottom: 10,
  },
  sectionTitleSpaced: {
    marginTop: 8,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toolCard: {
    width: COL3_W,
    marginBottom: CARD_GAP,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(193, 151, 105, 0.16)',
    shadowColor: '#C19769',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  toolIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  toolTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3D2F34',
    textAlign: 'center',
  },
  aiGrid: {
    marginBottom: 8,
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 122, 150, 0.14)',
    shadowColor: '#E87A96',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  aiIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTextCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A1F24',
  },
  aiDesc: {
    marginTop: 2,
    fontSize: 12,
    color: '#A88F97',
  },
  bottomDock: {
    paddingHorizontal: PAGE_PAD,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 10 : 4,
    backgroundColor: '#FFF8F5',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(232, 122, 150, 0.12)',
  },
  gfBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E86B8A',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    overflow: 'hidden',
    shadowColor: '#E86B8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  gfGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.16)',
    right: -20,
    top: -30,
  },
  gfIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gfText: {
    flex: 1,
    marginLeft: 12,
  },
  gfTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  gfSub: {
    marginTop: 2,
    fontSize: 11,
    color: 'rgba(255,255,255,0.88)',
  },
  gfCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  gfCtaTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C44A6A',
    marginRight: 2,
  },
});
