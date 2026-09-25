import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Text,
  Alert,
  View as RNView,
} from 'react-native';
import { View } from 'native-base';
import { connect } from 'react-redux';
import Icons from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Colors, Metrics } from '../theme';

class Baibao extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 工具数据
  gameList = [
    {
      id: 1,
      title: '幸运转盘',
      icon: 'sync',
      color: '#CB9869',
      route: 'LuckyWheel',
    },
    {
      id: 2,
      title: '掷骰子',
      icon: 'questioncircleo',
      color: '#4ECDC4',
      route: 'DiceGame',
    },
    {
      id: 3,
      title: '抛硬币',
      icon: 'creditcard',
      color: '#FFD93D',
      route: 'CoinFlip',
    },
    {
      id: 4,
      title: '随机数',
      icon: 'calculator',
      color: '#5DADE2',
      route: 'RandomNumber',
    },
    {
      id: 5,
      title: '幸运抽签',
      icon: 'gift',
      color: '#FF8C42',
      route: 'LuckyDraw',
    },
    {
      id: 6,
      title: '今日运势',
      icon: 'staro',
      color: '#AF7AC5',
      route: 'DailyFortune',
    },
    {
      id: 7,
      title: '敲木鱼',
      icon: 'sound',
      color: '#98D8C8',
      route: 'WoodenFish',
    },
    {
      id: 8,
      title: '二维码',
      icon: 'qrcode',
      color: '#4CAF50',
      route: 'QRCodeGenerator',
    },
    {
      id: 9,
      title: '设备信息',
      icon: 'mobile1',
      color: '#9C27B0',
      route: 'DeviceInfo',
    },
  ];

  aiToolList = [
    {
      id: 'face',
      title: 'AI换脸',
      icon: 'people-outline',
      color: '#AF7AC5',
      route: 'FaceSwap',
      params: { mode: 'image' },
    },
    {
      id: 'clothes',
      title: 'AI换衣',
      icon: 'shirt-outline',
      color: '#5DADE2',
      route: 'AiTool',
      params: { ability: 'clothesSwap' },
    },
    {
      id: 'webp',
      title: '场景动图',
      icon: 'images-outline',
      color: '#CB9869',
      route: 'AiTool',
      params: { ability: 'sceneWebp' },
    },
    {
      id: 'sceneFace',
      title: '场景换脸',
      icon: 'videocam-outline',
      color: '#FF8C42',
      route: 'FaceSwap',
      params: { mode: 'video' },
    },
    {
      id: 'sceneVideo',
      title: '场景视频',
      icon: 'film-outline',
      color: '#4ECDC4',
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
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        <ScrollView style={Styles.scrollView}>
          <View style={Styles.headerSection}>
            <Icons name="gift" size={24} color="#FF6B6B" />
            <Text style={Styles.headerTitle}>百宝箱</Text>
          </View>

          {/* 工具卡片列表 */}
          <View style={Styles.gameGrid}>
            {this.gameList.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={[Styles.gameCard, { backgroundColor: game.color }]}
                onPress={() => this.onGamePress(game)}
                activeOpacity={0.8}
              >
                <View style={Styles.gameCardContent}>
                  <Icon name={game.icon} size={48} color="#FFF" />
                  <Text style={Styles.gameTitle}>{game.title}</Text>
                </View>
                <View style={Styles.decorationCircle1} />
                <View style={Styles.decorationCircle2} />
              </TouchableOpacity>
            ))}
          </View>

          {/* AI 专区：放在工具网格下方 */}
          <View style={Styles.aiSection}>
            <View style={Styles.aiSectionHeader}>
              <Ionicons name="sparkles" size={18} color={Colors.subject} />
              <Text style={Styles.aiSectionTitle}>AI 专区</Text>
            </View>

            {/* AI女友 横幅 */}
            <TouchableOpacity
              style={Styles.aiBanner}
              onPress={this.onAiGirlfriendPress}
              activeOpacity={0.88}
            >
              <RNView style={Styles.aiBannerDecor1} />
              <RNView style={Styles.aiBannerDecor2} />
              <View style={Styles.aiBannerContent}>
                <View style={Styles.aiBannerIconWrap}>
                  <Ionicons name="heart" size={28} color="#FFF" />
                </View>
                <View style={Styles.aiBannerText}>
                  <Text style={Styles.aiBannerTitle}>AI女友</Text>
                  <Text style={Styles.aiBannerSub}>
                    智能陪伴 · 随心畅聊 · 点击进入
                  </Text>
                </View>
                <View style={Styles.aiBannerCta}>
                  <Text style={Styles.aiBannerCtaTxt}>去聊聊</Text>
                  <Icon name="right" size={12} color="#C19769" />
                </View>
              </View>
            </TouchableOpacity>

            {/* AI 工具网格 */}
            <View style={Styles.aiGrid}>
              {this.aiToolList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[Styles.aiCard, { backgroundColor: item.color }]}
                  onPress={() => this.onAiPress(item)}
                  activeOpacity={0.8}
                >
                  <View style={Styles.gameCardContent}>
                    <Ionicons name={item.icon} size={36} color="#FFF" />
                    <Text style={Styles.aiCardTitle}>{item.title}</Text>
                  </View>
                  <View style={Styles.decorationCircle1} />
                  <View style={Styles.decorationCircle2} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  isLogged: state.user.isLogged,
  token: state.user.token,
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Baibao);

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.bai,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  gameCard: {
    width: (Metrics.screenWidth - 45) / 3,
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  gameCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  decorationCircle1: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: -20,
    right: -20,
  },
  decorationCircle2: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: -10,
    left: -10,
  },
  aiSection: {
    marginTop: 8,
    paddingHorizontal: 15,
  },
  aiSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
  },
  aiBanner: {
    backgroundColor: '#E8A0BF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#E8A0BF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  aiBannerDecor1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.18)',
    top: -40,
    right: -20,
  },
  aiBannerDecor2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.12)',
    bottom: -20,
    left: 40,
  },
  aiBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  aiBannerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  aiBannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  aiBannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  aiBannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  aiBannerCtaTxt: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#C19769',
    marginRight: 2,
  },
  aiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  aiCard: {
    width: (Metrics.screenWidth - 45) / 2,
    aspectRatio: 1.6,
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  aiCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
