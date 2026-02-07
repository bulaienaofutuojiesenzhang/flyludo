import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Image, Text, Pressable } from 'react-native';
import { View } from 'native-base';
import { connect } from 'react-redux';
import Icons from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/AntDesign';

import { Header } from '../component';
import { Colors, Metrics } from '../theme';

class Baibao extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {

  }

  // 工具数据
  gameList = [
    {
      id: 1,
      title: '幸运转盘',
      icon: 'sync',
      color: '#CB9869',
      route: 'LuckyWheel'
    },
    {
      id: 2,
      title: '掷骰子',
      icon: 'questioncircleo',
      color: '#4ECDC4',
      route: 'DiceGame'
    },
    {
      id: 3,
      title: '抛硬币',
      icon: 'creditcard',
      color: '#FFD93D',
      route: 'CoinFlip'
    },
    {
      id: 4,
      title: '随机数',
      icon: 'calculator',
      color: '#5DADE2',
      route: 'RandomNumber'
    },
    {
      id: 5,
      title: '幸运抽签',
      icon: 'gift',
      color: '#FF8C42',
      route: 'LuckyDraw'
    },
    {
      id: 6,
      title: '今日运势',
      icon: 'staro',
      color: '#AF7AC5',
      route: 'DailyFortune'
    },
    {
      id: 7,
      title: '敲木鱼',
      icon: 'sound',
      color: '#98D8C8',
      route: 'WoodenFish'
    },
    {
      id: 8,
      title: '二维码',
      icon: 'qrcode',
      color: '#4CAF50',
      route: 'QRCodeGenerator'
    },
    {
      id: 9,
      title: '设备信息',
      icon: 'mobile1',
      color: '#9C27B0',
      route: 'DeviceInfo'
    },
  ]

  // 点击工具卡片
  onGamePress = (game) => {
    this.props.navigation.push(game.route);
  }


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
            {this.gameList.map((game, index) => (
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
                
                {/* 装饰元素 */}
                <View style={Styles.decorationCircle1} />
                <View style={Styles.decorationCircle2} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

}


const mapStateToProps = state => ({
  isLogged: state.user.isLogged,
  token: state.user.token,
  user: state.user,
});

const mapDispatchToProps = dispatch => ({});

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
    width: (Metrics.screenWidth - 45) / 3, // 3列布局
    aspectRatio: 1, // 正方形
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
});