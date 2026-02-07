import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView, StatusBar, Image, Text, Pressable, TouchableOpacity } from 'react-native';
import { View } from 'native-base';
import { connect } from 'react-redux';
import Icons from 'react-native-vector-icons/AntDesign';

import { Colors, Metrics } from '../theme';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    if (!this.props.isLogged) {
      this.props.navigation.navigate('Login')
    }
  }

  _renderContent() {
    return (
      <View style={Styles.container}>
        <Image 
          source={require('../asserts/images/home/tou.png')} 
          resizeMode='contain' 
          style={{ width: Metrics.screenWidth, height: Metrics.screenWidth/633*299}} 
        />

        <View style={{ backgroundColor: '#fff', paddingHorizontal: 10, marginTop: 20 }}>
        <Pressable 
          onPress={() => {
            // 默认游戏配置：2人，54步浪漫任务
            const defaultGameData = {
              title: '情侣飞行棋',
              description: '和TA一起挑战浪漫任务',
              playerCount: 2,
              steps: [
                '给对方一个拥抱',
                '给对方一个吻',
                '一起唱一首歌',
                '互相说一句情话',
                '一起做10个俯卧撑',
                '给对方一个惊喜',
                '一起看一部电影',
                '给对方按摩5分钟',
                '互相讲一个笑话',
                '一起做饭',
                '互相画像',
                '一起跳舞',
                '给对方捶背',
                '一起玩游戏',
                '互相编头发',
                '一起散步',
                '给对方写一封信',
                '一起看星星',
                '互相分享秘密',
                '一起做运动',
                '给对方讲一个童年故事',
                '一起拍一张合照',
                '互相喂对方吃东西',
                '一起看日出或日落',
                '给对方一个惊喜礼物',
                '一起听一首喜欢的歌',
                '互相说三个优点',
                '一起做一道甜品',
                '给对方洗脚',
                '一起玩一个小游戏',
                '互相模仿对方',
                '一起规划未来',
                '给对方写一首诗',
                '一起看老照片',
                '互相化妆',
                '一起去散步30分钟',
                '给对方唱一首歌',
                '一起做手工',
                '互相按摩肩膀',
                '一起看搞笑视频',
                '给对方讲一个笑话',
                '一起做瑜伽',
                '互相说出最喜欢对方的地方',
                '一起玩猜谜游戏',
                '给对方一个深情的拥抱',
                '一起制定一周计划',
                '互相分享梦想',
                '一起做一件浪漫的事',
                '给对方一个甜蜜的吻',
                '一起跳一支舞',
                '互相说"我爱你"',
                '一起许下一个愿望',
                '给对方一个承诺',
                '一起庆祝胜利！',
              ]
            };
            this.props.navigation.push('CoupleFlyingChess', { gameData: defaultGameData });
          }} 
          style={Styles.flyingChessEntry}
        >
          <View style={Styles.flyingChessContent}>
            <Text style={Styles.flyingChessTitle}>💑 情侣飞行棋</Text>
            <Text style={Styles.flyingChessSubtitle}>和TA一起挑战浪漫任务</Text>
          </View>
          <Icons name='right' style={{ fontSize: 20, color: Colors.bai }} />
        </Pressable>

        {/* 情侣健身飞行棋入口 */}
        <Pressable 
          onPress={() => {
            // 健身游戏配置：2人，54步健身任务
            const fitnessGameData = {
              title: '情侣健身飞行棋',
              description: '和TA一起挑战健身目标',
              playerCount: 2,
              steps: [
                '一起做10个深蹲',
                '互相击掌20次',
                '一起做15个开合跳',
                '平板支撑30秒',
                '一起做10个俯卧撑',
                '互相拉伸腿部',
                '一起跳绳50下',
                '做20个仰卧起坐',
                '一起原地跑步1分钟',
                '互相按摩小腿',
                '一起做15个弓步蹲',
                '高抬腿30秒',
                '一起做波比跳10个',
                '互相拉伸手臂',
                '一起做20个深蹲',
                '平板支撑45秒',
                '一起做箭步蹲15个',
                '互相击掌30次',
                '一起做卷腹20个',
                '原地高抬腿40秒',
                '一起做俯卧撑15个',
                '互相拉伸背部',
                '一起跳绳100下',
                '做平板支撑1分钟',
                '一起做深蹲跳15个',
                '互相按摩肩膀',
                '一起做开合跳30个',
                '做仰卧起坐30个',
                '一起原地跑步2分钟',
                '互相拉伸全身',
                '一起做波比跳15个',
                '平板支撑1分30秒',
                '一起做弓步蹲20个',
                '互相击掌50次',
                '一起做俯卧撑20个',
                '高抬腿1分钟',
                '一起做深蹲30个',
                '互相按摩腰部',
                '一起跳绳150下',
                '做卷腹30个',
                '一起做箭步蹲25个',
                '互相拉伸腿部',
                '一起做波比跳20个',
                '平板支撑2分钟',
                '一起做深蹲跳20个',
                '互相击掌100次',
                '一起做俯卧撑25个',
                '原地高抬腿2分钟',
                '一起做开合跳50个',
                '互相拉伸全身',
                '一起做仰卧起坐40个',
                '平板支撑3分钟',
                '一起做深蹲50个',
                '抱起对方转一圈',
                '一起庆祝健身成功！',
              ]
            };
            this.props.navigation.push('CoupleFlyingChess', { gameData: fitnessGameData });
          }} 
          style={[Styles.flyingChessEntry, { backgroundColor: '#FF6B6B' }]}
        >
          <View style={Styles.flyingChessContent}>
            <Text style={Styles.flyingChessTitle}>💪 情侣健身飞行棋</Text>
            <Text style={Styles.flyingChessSubtitle}>和TA一起挑战健身目标</Text>
          </View>
          <Icons name='right' style={{ fontSize: 20, color: Colors.bai }} />
        </Pressable>

        
        {/* 自定义棋盘入口 */}
        <Pressable 
          onPress={() => {
            this.props.navigation.navigate('MainTab', { 
              screen: 'Found', 
              params: { currentTab: 'creation' } 
            });
          }} 
          style={[Styles.flyingChessEntry, { backgroundColor: '#B57EDC' }]}
        >
          <View style={Styles.flyingChessContent}>
            <Text style={Styles.flyingChessTitle}>🎨 自定义棋盘</Text>
            <Text style={Styles.flyingChessSubtitle}>创建符合自己的飞行棋</Text>
          </View>
          <Icons name='right' style={{ fontSize: 20, color: Colors.bai }} />
        </Pressable>

        </View>

        {/* 真心话大冒险入口 */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 20 }}>
          {/* 真心话模式 */}
          <TouchableOpacity 
            onPress={() => this.props.navigation.push('TruthMode')}
            style={Styles.gameCard}
          > 
            <View style={[Styles.gameCardInner, { backgroundColor: '#E8E0FF' }]}>
              <View style={Styles.gameIconContainer}>
                <View style={[Styles.gameIcon, { backgroundColor: '#FF6B9D' }]}>
                  <Text style={Styles.gameIconText}>❤️</Text>
                </View>
              </View>
              <View style={Styles.gameCardFooter}>
                <Text style={Styles.gameCardTitle}>真心话</Text>
                <Text style={Styles.gameCardSubtitle}>快速开始模式 &gt;</Text>
              </View>
            </View>
          </TouchableOpacity>
      
          {/* 大冒险模式 */}
          <TouchableOpacity 
            onPress={() => this.props.navigation.push('DareMode')}
            style={Styles.gameCard}
          > 
            <View style={[Styles.gameCardInner, { backgroundColor: '#FFE5CC' }]}>
              <View style={Styles.gameIconContainer}>
                <View style={[Styles.gameIcon, { backgroundColor: '#FFB84D' }]}>
                  <Text style={Styles.gameIconText}>❓</Text>
                </View>
              </View>
              <View style={Styles.gameCardFooter}>
                <Text style={Styles.gameCardTitle}>大冒险</Text>
                <Text style={Styles.gameCardSubtitle}>快速开始模式 &gt;</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }


  render() {
    return (
      <SafeAreaView style={{ flex: 1}}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="white"
        />
        <ScrollView style={{ flex: 1 }}>
          {this._renderContent()}
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

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);

const Styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flyingChessEntry: {
    marginBottom: 10,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flyingChessContent: {
    flex: 1,
  },
  flyingChessTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.bai,
    marginBottom: 4,
  },
  flyingChessSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  gameCard: {
    width: Metrics.px2dp(259*1.2),
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gameCardInner: {
    height: Metrics.px2dp(295*1.2),
    padding: 20,
    justifyContent: 'space-between',
  },
  gameIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gameIconText: {
    fontSize: 40,
  },
  gameCardFooter: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
  },
  gameCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  gameCardSubtitle: {
    fontSize: 12,
    color: '#999',
  },
});