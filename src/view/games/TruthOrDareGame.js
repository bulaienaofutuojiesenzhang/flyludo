import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Text, Pressable, Animated, TouchableOpacity, Image } from 'react-native';
import { View } from 'native-base';
import Icons from 'react-native-vector-icons/AntDesign';
import { Colors, Metrics } from '../../theme';

class TruthOrDareGame extends React.Component {
  constructor(props) {
    super(props);
    
    const { truths = [], dares = [], mode = 'both' } = this.props.route?.params || {};
    
    // 根据模式设置初始类型
    const initialType = mode === 'truth' ? 'truth' : mode === 'dare' ? 'dare' : null;
    
    this.state = {
      mode, // 'truth', 'dare', 'both'
      truths,
      dares,
      currentType: initialType, // 'truth' 或 'dare'
      currentQuestion: '点击下方按钮开始游戏', // 初始提示
      usedTruthIndexes: [],
      usedDareIndexes: [],
      isRolling: false, // 是否正在滚动
      displayIndex: 0, // 当前显示的题目索引
      finalIndex: -1, // 最终停止的索引
      opacityAnim: new Animated.Value(1),
      showStartButton: true, // 显示开始按钮
    };
    
    this.rollingInterval = null;
  }

  // 开始游戏（根据当前类型）
  startGame = () => {
    const { currentType, mode, isRolling } = this.state;
    
    if (isRolling) return; // 如果正在滚动，不响应
    
    // 如果是both模式且没有选择类型，需要先选择
    if (!currentType && mode === 'both') {
      alert('请先选择真心话或大冒险！');
      return;
    }
    
    // 根据类型调用对应的方法
    if (currentType === 'truth') {
      this.selectTruth();
    } else if (currentType === 'dare') {
      this.selectDare();
    }
  }

  // 选择真心话
  selectTruth = () => {
    const { truths, usedTruthIndexes, isRolling } = this.state;
    
    if (isRolling) return; // 如果正在滚动，不响应
    
    if (truths.length === 0) {
      alert('真心话题库为空！');
      return;
    }

    // 如果所有题目都用过了，重置
    let availableIndexes = truths.map((_, i) => i).filter(i => !usedTruthIndexes.includes(i));
    if (availableIndexes.length === 0) {
      availableIndexes = truths.map((_, i) => i);
      this.setState({ usedTruthIndexes: [] });
    }

    // 随机选择一个最终题目
    const finalIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];

    this.setState({
      currentType: 'truth',
      isRolling: true,
      displayIndex: 0,
      finalIndex: finalIndex,
      showStartButton: false,
    });

    this.startRolling('truth', finalIndex, availableIndexes);
  }

  // 选择大冒险
  selectDare = () => {
    const { dares, usedDareIndexes, isRolling } = this.state;
    
    if (isRolling) return; // 如果正在滚动，不响应
    
    if (dares.length === 0) {
      alert('大冒险题库为空！');
      return;
    }

    // 如果所有题目都用过了，重置
    let availableIndexes = dares.map((_, i) => i).filter(i => !usedDareIndexes.includes(i));
    if (availableIndexes.length === 0) {
      availableIndexes = dares.map((_, i) => i);
      this.setState({ usedDareIndexes: [] });
    }

    // 随机选择一个最终题目
    const finalIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];

    this.setState({
      currentType: 'dare',
      isRolling: true,
      displayIndex: 0,
      finalIndex: finalIndex,
      showStartButton: false,
    });

    this.startRolling('dare', finalIndex, availableIndexes);
  }

  // 开始走马灯滚动
  startRolling = (type, finalIndex, availableIndexes) => {
    const questions = type === 'truth' ? this.state.truths : this.state.dares;
    let currentIndex = 0;
    let speed = 100; // 初始速度（毫秒）
    let rollCount = 0;
    const totalRolls = 20 + Math.floor(Math.random() * 10); // 滚动20-30次

    this.rollingInterval = setInterval(() => {
      rollCount++;
      
      // 循环显示题目
      currentIndex = (currentIndex + 1) % questions.length;
      
      this.setState({ displayIndex: currentIndex });

      // 逐渐减速
      if (rollCount > totalRolls * 0.7) {
        speed += 20; // 后期逐渐变慢
      }

      // 停止条件：达到总次数且当前索引等于最终索引
      if (rollCount >= totalRolls) {
        clearInterval(this.rollingInterval);
        
        // 确保停在正确的题目上
        const finalQuestion = questions[finalIndex];
        const usedKey = type === 'truth' ? 'usedTruthIndexes' : 'usedDareIndexes';
        const currentUsed = this.state[usedKey];
        
        this.setState({
          displayIndex: finalIndex,
          currentQuestion: finalQuestion,
          isRolling: false,
          [usedKey]: [...currentUsed, finalIndex],
        });
      }
    }, speed);
  }

  // 重新开始（用图片按钮）
  restartGame = () => {
    if (this.state.isRolling) return;
    
    const { mode, currentType } = this.state;
    
    // 直接开始新一轮游戏
    if (currentType === 'truth') {
      this.selectTruth();
    } else if (currentType === 'dare') {
      this.selectDare();
    }
  }

  // 组件卸载时清理定时器
  componentWillUnmount() {
    if (this.rollingInterval) {
      clearInterval(this.rollingInterval);
    }
  }

  // 不再自动开始游戏
  componentDidMount() {
    // 移除自动开始逻辑
  }

  render() {
    const { currentType, currentQuestion, mode, isRolling, displayIndex, truths, dares, showStartButton } = this.state;

    const isSingleMode = mode === 'truth' || mode === 'dare';
    
    // 获取当前显示的题目（走马灯效果）
    const getDisplayQuestion = () => {
      if (isRolling) {
        const questions = currentType === 'truth' ? truths : dares;
        return questions[displayIndex] || '';
      }
      return currentQuestion;
    };

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* 返回按钮 */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => this.props.navigation.goBack()}
        >
          <Icons name="left" size={24} color="#333" />
        </TouchableOpacity>

        {/* 主内容 */}
        <View style={styles.content}>
          {/* 直接显示题目卡片 */}
          <View style={styles.questionContainer}>
            <View style={[
              styles.questionCard,
              currentType === 'truth' ? styles.truthCard : currentType === 'dare' ? styles.dareCard : styles.defaultCard
            ]}>
              <Text style={styles.questionType}>
                {currentType === 'truth' ? '💭 真心话' : currentType === 'dare' ? '⚡ 大冒险' : '🎮 游戏'}
              </Text>
              <Text style={styles.questionText}>{getDisplayQuestion()}</Text>
              
              {isRolling && (
                <Text style={styles.rollingHint}>正在抽取...</Text>
              )}
            </View>

            {/* 始终显示开始按钮 */}
            {!isRolling && (
              <Pressable 
                style={styles.restartButtonContainer}
                onPress={showStartButton ? this.startGame : this.restartGame}
              >
                <Image 
                  source={require('../../asserts/images/games/kaishi.jpg')} 
                  resizeMode='contain' 
                  style={styles.restartButtonImage} 
                />
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  selectContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6C5CE7',
    marginBottom: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  startButtonContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  startButtonImage: {
    width: Metrics.screenWidth * 0.6,
    height: Metrics.screenWidth * 0.6 * 0.35,
  },
  buttonGroup: {
    width: '100%',
    gap: 20,
  },
  selectButton: {
    width: '100%',
    paddingVertical: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  truthButton: {
    backgroundColor: Colors.zhenxinPink,
  },
  dareButton: {
    backgroundColor: Colors.maoxianYellow,
  },
  buttonEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  buttonCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  questionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  questionCard: {
    width: '100%',
    minHeight: 300,
    borderRadius: 20,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  truthCard: {
    backgroundColor: Colors.zhenxinPink,
  },
  dareCard: {
    backgroundColor: Colors.maoxianYellow,
  },
  defaultCard: {
    backgroundColor: '#6C5CE7',
  },
  questionType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  questionText: {
    fontSize: 22,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 32,
    minHeight: 66,
  },
  rollingHint: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 20,
    fontStyle: 'italic',
  },
  restartButtonContainer: {
    marginTop: 40,
  },
  restartButtonImage: {
    width: Metrics.screenWidth * 0.6,
    height: Metrics.screenWidth * 0.6 * 0.35,
  },
});

export default TruthOrDareGame;

