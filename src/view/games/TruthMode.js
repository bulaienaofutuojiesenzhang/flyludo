import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Image, Text, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import { View } from 'native-base';
import { connect } from 'react-redux';
import Icons from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import { Colors, Metrics } from '../../theme';

class TruthMode extends React.Component {
  constructor(props) {
    super(props);
    
    // 从路由参数获取游戏数据
    const gameData = props.route?.params?.gameData || null;
    
    this.state = {
      gameData: gameData,
      showVipModal: false,
    };
  }

  // 开始游戏 - 真心话模式
  startGame = () => {
    const { gameData } = this.state;
    
    // 如果有游戏数据，使用游戏数据中的题目；否则使用Redux中的题目
    const truths = gameData?.steps || this.props.truths;
    
    this.props.navigation.navigate('TruthOrDareGame', {
      mode: 'truth',
      truths: truths,
      dares: [],
    });
  }

  // 查看/编辑真心话题库
  viewList = () => {
    this.props.navigation.navigate('TruthOrDareList', {
      mode: 'truth',
      truths: this.props.truths,
      dares: this.props.dares,
      onUpdate: (truths, dares) => {
        this.props.dispatch({
          type: 'UPDATE_GAME_DATA',
          payload: { truths, dares }
        });
      }
    });
  }

  // 编辑游戏
  handleEdit = () => {
    console.log('===== handleEdit called =====');
    console.log('user:', this.props.user);
    
    const isVip = this.props.user?.isVip || false;
    console.log('isVip:', isVip);
    
    // 强制显示 VIP 弹窗进行测试
    console.log('showing vip modal');
    this.setState({ showVipModal: true }, () => {
      console.log('setState callback - showVipModal:', this.state.showVipModal);
    });
    
    if (isVip) {
      // 会员可以编辑
      const { gameData } = this.state;
      console.log('navigating to CreateQuestion with gameData:', gameData);
      this.props.navigation.navigate('CreateQuestion', {
        type: 'zhenxinhua',
        editData: gameData
      });
    }
  }

  // 升级会员
  handleUpgradeVip = () => {
    this.setState({ showVipModal: false });
    // TODO: 跳转到会员购买页面
    // this.props.navigation.navigate('VipPurchase');
  }

  render() {
    const { gameData, showVipModal } = this.state;
    console.log('gameData', gameData);
    console.log('showVipModal in render:', showVipModal);
    const hasGameData = !!gameData;
    const questionCount = hasGameData ? (gameData.steps?.length || 0) : this.props.truths.length;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* 右上角按钮 */}
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => this.props.navigation.goBack()}
          >
            <Icons name="left" size={24} color="#333" />
          </TouchableOpacity>

          {!hasGameData && (
            <View style={styles.rightButtons}>
              <TouchableOpacity 
                style={styles.headerBtn} 
                onPress={this.viewList}
              >
                <Icons name="edit" size={20} color={Colors.subject} />
                <Text style={styles.headerBtnText}>题库</Text>
              </TouchableOpacity>
            </View>
          )}

          {hasGameData && (
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={this.handleEdit}
              activeOpacity={0.7}
            >
              <Icons name="edit" size={18} color={Colors.bai} />
              <Text style={styles.editBtnText}>编辑</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.scrollView}>
          {/* 主内容区 */}
          <View style={styles.content}>
            {/* 真心话卡片 */}
            {!hasGameData && (
              <View style={styles.gameCard}>
                <View style={styles.gameIconContainer}>
                  <View style={[styles.gameIcon, { backgroundColor: '#FF6B9D' }]}>
                    <Text style={styles.gameIconText}>❤️</Text>
                  </View>
                </View>
                <View style={styles.gameCardFooter}>
                  <Text style={styles.gameCardTitle}>真心话</Text>
                  <Text style={styles.gameCardSubtitle}>快速开始模式 &gt;</Text>
                </View>
              </View>
            )}

            {/* 如果有游戏数据，显示游戏信息 */}
            {hasGameData && (
              <View style={styles.gameInfoCard}>
                {/* 标题 */}
                <Text style={styles.gameTitle}>{gameData.title}</Text>
                
                {/* 描述 */}
                <Text style={styles.gameDescription}>{gameData.description}</Text>

                {/* 作者信息 */}
                {gameData.creator && (
                  <View style={styles.creatorSection}>
                    <FastImage 
                      style={styles.creatorAvatar}
                      source={
                        gameData.creator.avatar 
                          ? { uri: gameData.creator.avatar }
                          : require('../../asserts/images//user/plc_user.png')
                      }
                    />
                    <View style={styles.creatorInfo}>
                      <Text style={styles.creatorName}>{gameData.creator.nickname || '匿名用户'}</Text>
                      <Text style={styles.creatorMeta}>
                        {questionCount} 道题目 · {gameData.playCount || 0} 次游玩
                      </Text>
                    </View>
                  </View>
                )}

                {/* 题目预览 */}
                <View style={styles.questionPreview}>
                  <View style={styles.previewHeader}>
                    <Icons name="profile" size={16} color={Colors.zhenxinPink} />
                    <Text style={styles.previewTitle}>题目预览</Text>
                  </View>
                  <View style={styles.previewList}>
                    {gameData.steps?.slice(0, 5).map((question, index) => (
                      <View key={index} style={styles.previewItem}>
                        <View style={styles.previewDot} />
                        <Text style={styles.previewText} numberOfLines={1}>
                          {question}
                        </Text>
                      </View>
                    ))}
                    {questionCount > 5 && (
                      <Text style={styles.moreText}>还有 {questionCount - 5} 道题目...</Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* 开始按钮 */}
            <Pressable 
              style={styles.startButtonContainer}
              onPress={this.startGame}
            >
              <Image 
                source={require('../../asserts/images/games/kaishi.jpg')} 
                resizeMode='contain' 
                style={styles.startButton} 
              />
            </Pressable>

            {/* 提示文字 */}
            <Text style={styles.tipText}>
              💭 真心话模式 · {questionCount} 题
            </Text>
          </View>
        </ScrollView>

      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 5,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
  },
  headerBtnText: {
    fontSize: 14,
    color: Colors.subject,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.maoxianYellow,
  },
  editBtnText: {
    fontSize: 14,
    color: Colors.bai,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cardImage: {
    width: Metrics.screenWidth * 0.6,
    height: Metrics.screenWidth * 0.6 * 1.14,
    marginBottom: 20,
  },
  gameCard: {
    width: Metrics.screenWidth * 0.6,
    height: Metrics.screenWidth * 0.6 * 1.14,
    marginBottom: 20,
    backgroundColor: '#E8E0FF',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
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
  gameInfoCard: {
    width: '100%',
    backgroundColor: Colors.bai,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.zhenxinPink,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.hei2E,
    marginBottom: 12,
  },
  gameDescription: {
    fontSize: 15,
    color: Colors.hui66,
    lineHeight: 22,
    marginBottom: 16,
  },
  creatorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.huiF5,
    marginBottom: 16,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.hei2E,
    marginBottom: 4,
  },
  creatorMeta: {
    fontSize: 12,
    color: Colors.hui99,
  },
  questionPreview: {
    backgroundColor: `${Colors.zhenxinPink}10`,
    borderRadius: 12,
    padding: 15,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.zhenxinPink,
    marginLeft: 6,
  },
  previewList: {
    gap: 8,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.zhenxinPink,
    marginRight: 10,
  },
  previewText: {
    flex: 1,
    fontSize: 14,
    color: Colors.hui66,
  },
  moreText: {
    fontSize: 13,
    color: Colors.hui99,
    fontStyle: 'italic',
    marginTop: 4,
  },
  startButtonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  startButton: {
    width: Metrics.screenWidth * 0.5,
    height: Metrics.screenWidth * 0.5 * 0.35,
  },
  tipText: {
    fontSize: 16,
    color: Colors.zhenxinPink,
    marginTop: 10,
    fontWeight: 'bold',
  },
});

const mapStateToProps = state => ({
  truths: state.game.truths,
  dares: state.game.dares,
  user: state.user,
});

export default connect(mapStateToProps)(TruthMode);

