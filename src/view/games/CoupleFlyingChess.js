import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { Colors, Metrics } from '../../theme';
import { ToastService } from '../../component';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOARD_WIDTH = SCREEN_WIDTH;
const BOARD_HEIGHT = SCREEN_HEIGHT;

// 骰子动画组件
class DiceAnimation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAnimation: false,
      animatedValue: new Animated.Value(0),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(1),
    };
  }

  // 开始骰子动画
  startAnimation = (callback) => {
    this.setState({ showAnimation: true });
    
    // 重置动画值
    this.state.animatedValue.setValue(0);
    this.state.rotation.setValue(0);
    this.state.scale.setValue(1);

    // 组合动画：旋转 + 缩放
    Animated.parallel([
      // 旋转动画
      Animated.timing(this.state.rotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // 缩放动画
      Animated.sequence([
        Animated.timing(this.state.scale, {
          toValue: 1.5,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(this.state.scale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setTimeout(() => {
        this.setState({ showAnimation: false });
        if (callback) callback();
      }, 500);
    });
  };

  render() {
    const { showAnimation, rotation, scale } = this.state;
    const { diceValue } = this.props;

    if (!showAnimation) return null;

    const spin = rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '720deg'], // 旋转两圈
    });

    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

    return (
      <Modal
        visible={showAnimation}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.diceAnimationOverlay}>
          <Animated.View
            style={[
              styles.diceAnimationContainer,
              {
                transform: [
                  { rotate: spin },
                  { scale: scale },
                ],
              },
            ]}
          >
            <Text style={styles.diceAnimationText}>{diceFaces[diceValue - 1]}</Text>
          </Animated.View>
        </View>
      </Modal>
    );
  }
}

// 生成动态步数的棋盘路径坐标（U形路径）
// 布局不变，但只生成到指定步数
const generateBoardPath = (maxSteps = 55) => {
  const path = [];
  const padding = 5;
  const cols = 8;
  const rows = 14;
  
  // 计算格子大小
  const availableWidth = SCREEN_WIDTH - padding * 2;
  const availableHeight = SCREEN_HEIGHT - padding * 2;
  const squareSizeByWidth = availableWidth / cols;
  const squareSizeByHeight = availableHeight / rows;
  const squareSize = Math.min(squareSizeByWidth, squareSizeByHeight);
  
  // 计算实际棋盘尺寸并居中
  const boardWidth = cols * squareSize;
  const boardHeight = rows * squareSize;
  const offsetX = (SCREEN_WIDTH - boardWidth) / 2;
  const offsetY = (SCREEN_HEIGHT - boardHeight) / 2;
  
  // 完整的55步路径定义（算法和位置不变）
  const fullPath = [];
  
  // 外圈路径：沿着边缘排列
  
  // 第1-7步：顶部从右到左
  for (let i = 1; i <= 6; i++) {
    fullPath.push({ 
      step: i, 
      x: offsetX + (cols - i-1) * squareSize, 
      y: offsetY + 0 * squareSize 
    });
  }
  
  // 第8步：左上角
  fullPath.push({ 
    step: 7, 
    x: offsetX + 0 * squareSize, 
    y: offsetY + 0 * squareSize 
  });
  
  // 第9-21步：左边从上到下
  for (let i = 8; i <= 20; i++) {
    fullPath.push({ 
      step: i, 
      x: offsetX + 0 * squareSize, 
      y: offsetY + (i - 7) * squareSize 
    });
  }
  
  // 第21-27步：底部从左到右
  for (let i = 21; i <= 27; i++) {
    fullPath.push({ 
      step: i, 
      x: offsetX + (i - 20) * squareSize, 
      y: offsetY + 13 * squareSize 
    });
  }
  
  // 第28-38步：右边从下到上
  for (let i = 28; i <= 38; i++) {
    fullPath.push({ 
      step: i, 
      x: offsetX + 7 * squareSize, 
      y: offsetY + (39 - i + 1) * squareSize 
    });
  }
  
  // 内圈路径：第39-55步
  
  // 第39-43步：内层顶部从右到左
  for (let i = 39; i <= 43; i++) {
    fullPath.push({ 
      step: i, 
      x: offsetX + (45 - i) * squareSize, 
      y: offsetY + 2 * squareSize 
    });
  }
  
  // 第44-46步：内层左边向下
  for (let i = 44; i <= 46; i++) {
    fullPath.push({ 
      step: i, 
      x: offsetX + 2 * squareSize, 
      y: offsetY + (i - 41) * squareSize 
    });
  }

  // 第47-49步：内层底部向右
  for (let i = 47; i <= 49; i++) {
    fullPath.push({ 
      step: i, 
      x: offsetX + (i - 44) * squareSize, 
      y: offsetY + 5 * squareSize 
    });
  }
  
  // 第50-52步：内层右边
  for (let i = 50; i <= 52; i++) {
    fullPath.push({ 
      step: i, 
      x: offsetX + 5 * squareSize, 
      y: offsetY + (i - 44) * squareSize 
    });
  }
  
  // 第53-54步：内层右边向上
  fullPath.push({ step: 53, x: offsetX + 4 * squareSize, y: offsetY + 8 * squareSize });
  fullPath.push({ step: 54, x: offsetX + 3 * squareSize, y: offsetY + 8 * squareSize });
  
  // 第55步：终点
  fullPath.push({ 
    step: 55, 
    x: offsetX + 2 * squareSize, 
    y: offsetY + 8 * squareSize 
  });
  
  // 只返回前 maxSteps 步
  return fullPath.slice(0, maxSteps);
};

class CoupleFlyingChess extends React.Component {
  constructor(props) {
    super(props);
    
    // 从路由参数获取游戏配置
    const gameData = props.route?.params?.gameData || {};
    const steps = gameData.steps || [];
    const playerCount = gameData.playerCount || 2;
    const totalSteps = steps.length;
    
    // 生成棋盘路径（布局不变，只生成到totalSteps）
    this.boardPath = generateBoardPath(totalSteps);
    this.diceAnimationRef = React.createRef();
    
    // 初始化玩家状态和动画
    const playerStates = {};
    const playerAnimations = {};
    const playerDiceStates = {};
    
    if (playerCount === 2) {
      // 2人模式：保持male/female命名
      // position 为 -1 表示在起始位置
      playerStates.malePosition = -1;
      playerStates.femalePosition = -1;
      playerAnimations.maleX = new Animated.Value(0);
      playerAnimations.maleY = new Animated.Value(0);
      playerAnimations.femaleX = new Animated.Value(0);
      playerAnimations.femaleY = new Animated.Value(0);
      playerDiceStates.maleDice = 0;
      playerDiceStates.femaleDice = 0;
    } else {
      // 多人模式：使用player0, player1...
      for (let i = 0; i < playerCount; i++) {
        playerStates[`player${i}Position`] = -1;
        playerAnimations[`player${i}X`] = new Animated.Value(0);
        playerAnimations[`player${i}Y`] = new Animated.Value(0);
        playerDiceStates[`player${i}Dice`] = 0;
      }
    }
    
    this.state = {
      // 游戏配置
      gameData,
      steps,
      playerCount,
      totalSteps,
      
      // 游戏状态
      gameStatus: 'decideFirst',
      currentPlayerIndex: 0, // 当前玩家索引（0表示第一个玩家）
      
      // 玩家位置
      ...playerStates,
      
      // 骰子
      diceValue: 1,
      isRolling: false,
      
      // 动画
      ...playerAnimations,
      diceRotation: new Animated.Value(0),
      
      // 任务弹窗
      showTaskModal: false,
      currentTask: null,
      isTaskView: false, // 是否为查看模式（点击格子查看），还是执行模式（走到格子执行任务）
      
      // 决定先行
      ...playerDiceStates,
      showDecideModal: false,
      
      // 描述弹窗
      showDescModal: false,
    };
    
    this.rotationAnim = null;
  }

  componentDidMount() {
    // 初始化所有玩家位置（起始位置在第一个格子右侧）
    // position 为 -1 表示在起始位置，还未进入棋盘
    const { playerCount } = this.state;
    if (playerCount === 2) {
      this.updateCharacterPosition(0, -1); // -1 表示起始位置
      this.updateCharacterPosition(1, -1);
    } else {
      for (let i = 0; i < playerCount; i++) {
        this.updateCharacterPosition(i, -1);
      }
    }
    this.showDecideFirstModal();
  }

  componentWillUnmount() {
    if (this.rotationAnim) {
      this.rotationAnim.stop();
    }
  }

  // 显示决定先行的弹窗
  showDecideFirstModal() {
    this.setState({ showDecideModal: true, gameStatus: 'decideFirst' });
  }

  // 决定先行 - 随机抽取
  rollDecideDice(playerIndex) {
    const { playerCount } = this.state;
    const diceValue = Math.floor(Math.random() * 6) + 1;
    
    if (playerCount === 2) {
      // 2人模式
      const diceKey = playerIndex === 0 ? 'maleDice' : 'femaleDice';
      this.setState({ [diceKey]: diceValue });
      
      setTimeout(() => {
        const { maleDice, femaleDice } = this.state;
        if (maleDice > 0 && femaleDice > 0) {
          const firstPlayerIndex = maleDice > femaleDice ? 0 : 
                                   femaleDice > maleDice ? 1 : 
                                   (Math.random() > 0.5 ? 0 : 1);
          this.setState({
            currentPlayerIndex: firstPlayerIndex,
            gameStatus: 'playing',
            showDecideModal: false,
          });
          ToastService.showToast({
            title: `${firstPlayerIndex === 0 ? '男生' : '女生'}先开始！`,
          });
        }
      }, 500);
    } else {
      // 多人模式
      const diceKey = `player${playerIndex}Dice`;
      this.setState({ [diceKey]: diceValue });
      
      setTimeout(() => {
        // 检查所有玩家是否都投掷了
        let allRolled = true;
        let maxDice = 0;
        let winnerIndexes = [];
        
        for (let i = 0; i < playerCount; i++) {
          const dice = this.state[`player${i}Dice`];
          if (dice === 0) {
            allRolled = false;
            break;
          }
          if (dice > maxDice) {
            maxDice = dice;
            winnerIndexes = [i];
          } else if (dice === maxDice) {
            winnerIndexes.push(i);
          }
        }
        
        if (allRolled) {
          // 如果有多个最大值，随机选一个
          const firstPlayerIndex = winnerIndexes[Math.floor(Math.random() * winnerIndexes.length)];
          this.setState({
            currentPlayerIndex: firstPlayerIndex,
            gameStatus: 'playing',
            showDecideModal: false,
          });
          ToastService.showToast({
            title: `玩家${firstPlayerIndex + 1}先开始！`,
          });
        }
      }, 500);
    }
  }

  // 投掷骰子
  rollDice = () => {
    if (this.state.isRolling || this.state.gameStatus !== 'playing') {
      return;
    }

    this.setState({ isRolling: true });

    // 随机生成1-6的点数
    const value = Math.floor(Math.random() * 6) + 1;
    this.setState({ diceValue: value });

    // 触发骰子动画
    if (this.diceAnimationRef.current) {
      this.diceAnimationRef.current.startAnimation(() => {
        this.setState({ isRolling: false }, () => {
          this.moveCharacter(this.state.currentPlayerIndex, value);
        });
      });
    } else {
      // 如果动画组件未加载，直接执行移动
      setTimeout(() => {
        this.setState({ isRolling: false }, () => {
          this.moveCharacter(this.state.currentPlayerIndex, value);
        });
      }, 1000);
    }
  };

  // 移动角色
  moveCharacter(playerIndex, steps) {
    const { playerCount, totalSteps } = this.state;
    const positionKey = playerCount === 2 
      ? (playerIndex === 0 ? 'malePosition' : 'femalePosition')
      : `player${playerIndex}Position`;
    
    const currentPos = this.state[positionKey];
    // currentPos 是数组索引（0开始），移动后的新位置也是数组索引
    // 但不能超过最后一个格子的索引（totalSteps - 1）
    const newPos = Math.min(currentPos + steps, totalSteps - 1);

    this.setState({ [positionKey]: newPos }, () => {
      this.updateCharacterPosition(playerIndex, newPos);
      // checkTask 需要传入实际的步骤号（从1开始），所以是 newPos + 1
      this.checkTask(newPos + 1);
    });
  }

  // 更新角色位置
  updateCharacterPosition(playerIndex, step) {
    // 计算格子大小
    const padding = 5;
    const cols = 8;
    const rows = 14;
    const availableWidth = SCREEN_WIDTH - padding * 2;
    const availableHeight = SCREEN_HEIGHT - padding * 2;
    const squareSizeByWidth = availableWidth / cols;
    const squareSizeByHeight = availableHeight / rows;
    const squareSize = Math.min(squareSizeByWidth, squareSizeByHeight);
    
    let x, y;
    
    if (step === -1) {
      // 起始位置：在第一个格子右侧一个格子的位置
      const firstSquare = this.boardPath[0];
      x = firstSquare.x + squareSize + squareSize / 2 - 15; // 右移一个格子
      y = firstSquare.y + squareSize / 2 - 15;
    } else {
      // 正常位置
      if (step >= this.boardPath.length) {
        step = this.boardPath.length - 1;
      }
      const position = this.boardPath[step];
      x = position.x + squareSize / 2 - 15;
      y = position.y + squareSize / 2 - 15;
    }

    const { playerCount } = this.state;
    const xKey = playerCount === 2
      ? (playerIndex === 0 ? 'maleX' : 'femaleX')
      : `player${playerIndex}X`;
    const yKey = playerCount === 2
      ? (playerIndex === 0 ? 'maleY' : 'femaleY')
      : `player${playerIndex}Y`;

    Animated.parallel([
      Animated.timing(this.state[xKey], {
        toValue: x,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(this.state[yKey], {
        toValue: y,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }

  // 检查任务（走到格子时触发，需要执行任务）
  checkTask(step) {
    // 从配置的步骤中获取任务内容
    const { steps } = this.state;
    const taskContent = steps[step - 1] || '完成当前格子的任务';
    
    this.setState({
      showTaskModal: true,
      isTaskView: false, // 执行模式
      currentTask: {
        step,
        content: taskContent,
      },
    });
  }

  // 完成任务
  completeTask = () => {
    this.setState({ showTaskModal: false }, () => {
      // 切换到下一个玩家
      const { currentPlayerIndex, playerCount, totalSteps } = this.state;
      const nextPlayerIndex = (currentPlayerIndex + 1) % playerCount;
      this.setState({ currentPlayerIndex: nextPlayerIndex });
      
      // 检查是否有人到达终点
      // position 是数组索引，totalSteps - 1 是最后一个格子的索引
      let winner = -1;
      for (let i = 0; i < playerCount; i++) {
        const positionKey = playerCount === 2
          ? (i === 0 ? 'malePosition' : 'femalePosition')
          : `player${i}Position`;
        if (this.state[positionKey] >= totalSteps - 1) {
          winner = i;
          break;
        }
      }
      
      if (winner !== -1) {
        this.setState({ gameStatus: 'finished', currentPlayerIndex: winner });
        const winnerName = playerCount === 2
          ? (winner === 0 ? '男生' : '女生')
          : `玩家${winner + 1}`;
        ToastService.showToast({
          title: `${winnerName}获胜！`,
        });
      }
    });
  };

  // 重置游戏
  resetGame = () => {
    const { playerCount } = this.state;
    const resetState = {
      gameStatus: 'decideFirst',
      currentPlayerIndex: 0,
      diceValue: 1,
      isRolling: false,
      showTaskModal: false,
      currentTask: null,
    };
    
    // 重置所有玩家位置和骰子
    // position 为 -1 表示在起始位置
    if (playerCount === 2) {
      resetState.malePosition = -1;
      resetState.femalePosition = -1;
      resetState.maleDice = 0;
      resetState.femaleDice = 0;
    } else {
      for (let i = 0; i < playerCount; i++) {
        resetState[`player${i}Position`] = -1;
        resetState[`player${i}Dice`] = 0;
      }
    }
    
    this.setState(resetState, () => {
      if (playerCount === 2) {
        this.updateCharacterPosition(0, -1); // -1 表示起始位置
        this.updateCharacterPosition(1, -1);
      } else {
        for (let i = 0; i < playerCount; i++) {
          this.updateCharacterPosition(i, -1);
        }
      }
      this.showDecideFirstModal();
    });
  };

  // 渲染棋盘格子
  renderSquare(step, index) {
    const position = this.boardPath[index];
    const { totalSteps, steps } = this.state;
    const isStart = step === 1;
    const isEnd = step === totalSteps;
    
    // 格子颜色（根据图片描述，使用粉色、紫色、浅蓝色交替）
    const colors = ['#FFB3D9', '#DDA0DD', '#B0E0E6'];
    const colorIndex = step % 3;
    
    // 动态计算格子大小 - 与generateBoardPath保持一致
    const padding = 5;
    const cols = 8;
    const rows = 14;
    const availableWidth = SCREEN_WIDTH - padding * 2;
    const availableHeight = SCREEN_HEIGHT - padding * 2;
    const squareSizeByWidth = availableWidth / cols;
    const squareSizeByHeight = availableHeight / rows;
    const squareSize = Math.min(squareSizeByWidth, squareSizeByHeight);

    return (
      <TouchableOpacity
        key={step}
        activeOpacity={0.8}
        onPress={() => {
          // 点击步骤块，弹出对应任务（查看模式）
          const taskContent = steps[step - 1] || '完成当前格子的任务';
          this.setState({
            showTaskModal: true,
            isTaskView: true, // 查看模式
            currentTask: {
              step,
              content: taskContent,
            },
          });
        }}
        style={[
          styles.square,
          {
            position: 'absolute',
            left: position.x,
            top: position.y,
            width: squareSize,
            height: squareSize,
            backgroundColor: isStart || isEnd ? '#FFD700' : colors[colorIndex],
            borderWidth: isEnd ? 3 : 1,
            borderColor: isEnd ? '#FFA500' : '#fff',
          },
        ]}
      >
        <Text style={styles.squareNumber}>{step}</Text>
        {isEnd && <Text style={styles.crown}>👑</Text>}
      </TouchableOpacity>
    );
  }

  // 渲染骰子
  renderDice() {
    const { isRolling, currentPlayerIndex, gameStatus, playerCount } = this.state;

    // 获取当前玩家显示名称
    let currentPlayerName = '';
    if (gameStatus === 'playing') {
      if (playerCount === 2) {
        currentPlayerName = currentPlayerIndex === 0 ? '👨 男生' : '👩 女生';
      } else {
        currentPlayerName = `玩家${currentPlayerIndex + 1}`;
      }
    }

    return (
      <View style={styles.diceContainer}>
        <TouchableOpacity
          onPress={this.rollDice}
          disabled={isRolling || gameStatus !== 'playing'}
          activeOpacity={0.8}
          style={styles.diceButton}
        >
          <View style={styles.diceIconPlaceholder}>
            <Text style={styles.diceIconText}>🎲</Text>
          </View>
        </TouchableOpacity>
        {gameStatus === 'playing' && (
          <View style={styles.currentPlayerBadge}>
            <Text style={styles.currentPlayerText}>
              {currentPlayerName}
            </Text>
          </View>
        )}
      </View>
    );
  }

  render() {
    const {
      showTaskModal,
      currentTask,
      gameStatus,
      currentPlayerIndex,
      showDecideModal,
      playerCount,
      gameData,
    } = this.state;
    
    // 玩家颜色和显示
    const playerColors = ['#4A90E2', '#FF69B4', '#FFD700', '#00CED1', '#FF6347', '#9370DB'];

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6B4E8D" translucent={false} />
        
        {/* 左上角标题和描述 */}
        <View style={styles.headerContainer}>
          <Text style={styles.gameTitle}>{gameData.title || '情侣飞行棋'}</Text>
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => {
              this.setState({ showDescModal: true });
            }}
          >
            <Text style={styles.infoIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        {/* 游戏规则按钮 */}
        <TouchableOpacity style={styles.rulesButton}>
          <Text style={styles.rulesButtonText}>游戏规则</Text>
        </TouchableOpacity>

        {/* 棋盘 - 全屏 */}
        <View style={styles.boardContainer}>
          <View style={[styles.board, { width: BOARD_WIDTH, height: BOARD_HEIGHT }]}>
            {/* 渲染所有格子 */}
            {this.boardPath.map((pos, index) => this.renderSquare(pos.step, index))}
            
            {/* 渲染所有玩家角色 */}
            {playerCount === 2 ? (
              <>
                {/* 2人模式：男生女生 */}
                <Animated.View
                  style={[
                    styles.characterAbsolute,
                    { 
                      borderColor: playerColors[0],
                      zIndex: currentPlayerIndex === 0 ? 200 : 100, // 当前玩家层级更高
                    },
                    {
                      transform: [
                        { translateX: this.state.maleX },
                        { translateY: this.state.maleY },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.characterEmoji}>👨</Text>
                </Animated.View>
                
                <Animated.View
                  style={[
                    styles.characterAbsolute,
                    { 
                      borderColor: playerColors[1],
                      zIndex: currentPlayerIndex === 1 ? 200 : 100, // 当前玩家层级更高
                    },
                    {
                      transform: [
                        { translateX: this.state.femaleX },
                        { translateY: this.state.femaleY },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.characterEmoji}>👩</Text>
                </Animated.View>
              </>
            ) : (
              /* 多人模式：数字标识 */
              Array.from({ length: playerCount }).map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.characterAbsolute,
                    { 
                      borderColor: playerColors[i % playerColors.length],
                      zIndex: currentPlayerIndex === i ? 200 : 100, // 当前玩家层级更高
                    },
                    {
                      transform: [
                        { translateX: this.state[`player${i}X`] },
                        { translateY: this.state[`player${i}Y`] },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.characterNumber}>{i + 1}</Text>
                </Animated.View>
              ))
            )}
          </View>
        </View>
        
        {/* 骰子区域 - 底部固定位置 */}
        <View style={styles.diceOverlay}>
          {this.renderDice()}
        </View>

        {/* 骰子动画组件 */}
        <DiceAnimation 
          ref={this.diceAnimationRef}
          diceValue={this.state.diceValue}
        />

        {/* 决定先行的弹窗 */}
        <Modal
          visible={showDecideModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>决定先行</Text>
              <Text style={styles.modalSubtitle}>每人投掷一次骰子，点数大的先行</Text>
              
              <View style={styles.decideDiceContainer}>
                {playerCount === 2 ? (
                  <>
                    <View style={styles.decideDiceItem}>
                      <Text style={styles.decidePlayerLabel}>👨 男生</Text>
                      <TouchableOpacity
                        style={styles.decideDiceButton}
                        onPress={() => this.rollDecideDice(0)}
                        disabled={this.state.maleDice > 0}
                      >
                        <Text style={styles.decideDiceText}>
                          {this.state.maleDice > 0 ? `点数: ${this.state.maleDice}` : '点击投掷'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.decideDiceItem}>
                      <Text style={styles.decidePlayerLabel}>👩 女生</Text>
                      <TouchableOpacity
                        style={styles.decideDiceButton}
                        onPress={() => this.rollDecideDice(1)}
                        disabled={this.state.femaleDice > 0}
                      >
                        <Text style={styles.decideDiceText}>
                          {this.state.femaleDice > 0 ? `点数: ${this.state.femaleDice}` : '点击投掷'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  /* 多人模式 */
                  Array.from({ length: playerCount }).map((_, i) => (
                    <View key={i} style={styles.decideDiceItem}>
                      <Text style={styles.decidePlayerLabel}>玩家{i + 1}</Text>
                      <TouchableOpacity
                        style={styles.decideDiceButton}
                        onPress={() => this.rollDecideDice(i)}
                        disabled={this.state[`player${i}Dice`] > 0}
                      >
                        <Text style={styles.decideDiceText}>
                          {this.state[`player${i}Dice`] > 0 
                            ? `点数: ${this.state[`player${i}Dice`]}` 
                            : '点击投掷'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        </Modal>

        {/* 任务弹窗 */}
        <Modal
          visible={showTaskModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>第 {currentTask?.step} 格任务</Text>
              <Text style={styles.taskContent}>{currentTask?.content}</Text>
              
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => {
                  if (this.state.isTaskView) {
                    // 查看模式：直接关闭弹窗
                    this.setState({ showTaskModal: false });
                  } else {
                    // 执行模式：完成任务
                    this.completeTask();
                  }
                }}
              >
                <Text style={styles.completeButtonText}>
                  {this.state.isTaskView ? '我知道了' : '完成任务'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 描述弹窗 */}
        <Modal
          visible={this.state.showDescModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {gameData.title || '情侣飞行棋'}
              </Text>
              <Text style={styles.descText}>
                {gameData.description || '和TA一起挑战浪漫任务'}
              </Text>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => this.setState({ showDescModal: false })}
              >
                <Text style={styles.completeButtonText}>知道了</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 游戏结束弹窗 */}
        {gameStatus === 'finished' && (
          <Modal visible={true} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  🎉 {playerCount === 2 
                    ? (currentPlayerIndex === 0 ? '男生' : '女生')
                    : `玩家${currentPlayerIndex + 1}`}获胜！
                </Text>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={this.resetGame}
                >
                  <Text style={styles.completeButtonText}>再来一局</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  }
}

export default CoupleFlyingChess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B4E8D', // 深紫色背景
  },
  rulesButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 179, 217, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 1000,
  },
  rulesButtonText: {
    color: Colors.bai,
    fontSize: Metrics.fontSize14,
    fontWeight: 'bold',
  },
  boardContainer: {
    flex: 1,
  },
  board: {
    position: 'relative',
    backgroundColor: '#6B4E8D',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  squareNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.hei,
  },
  crown: {
    fontSize: 16,
    position: 'absolute',
    top: 2,
  },
  character: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  headerContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  gameTitle: {
    fontSize: Metrics.fontSize16,
    fontWeight: 'bold',
    color: Colors.hei,
    marginRight: 8,
  },
  infoButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 16,
  },
  characterAbsolute: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    zIndex: 100,
  },
  characterEmoji: {
    fontSize: 20,
  },
  characterNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.hei,
  },
  diceOverlay: {
    position: 'absolute',
    bottom: 128,
    left: 0,
    right: 0,
    height: 158, // 固定高度
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // 提高层级，确保悬浮在棋盘之上
    elevation: 10, // Android 层级
  },
  diceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  diceButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceIcon: {
    width: 80,
    height: 80,
  },
  diceIconPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  diceIconText: {
    fontSize: 50,
  },
  dice: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  diceText: {
    fontSize: 60,
  },
  currentPlayerBadge: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  currentPlayerText: {
    fontSize: Metrics.fontSize16,
    fontWeight: 'bold',
    color: Colors.hei,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.bai,
    borderRadius: 20,
    padding: 30,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: Metrics.fontSize20,
    fontWeight: 'bold',
    color: Colors.hei,
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: Metrics.fontSize14,
    color: Colors.hui66,
    marginBottom: 20,
    textAlign: 'center',
  },
  decideDiceContainer: {
    width: '100%',
  },
  decideDiceItem: {
    marginVertical: 15,
    alignItems: 'center',
  },
  decidePlayerLabel: {
    fontSize: Metrics.fontSize16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  decideDiceButton: {
    backgroundColor: Colors.subject,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  decideDiceText: {
    color: Colors.bai,
    fontSize: Metrics.fontSize16,
    fontWeight: 'bold',
  },
  taskContent: {
    fontSize: Metrics.fontSize18,
    color: Colors.hei,
    marginVertical: 20,
    textAlign: 'center',
  },
  descText: {
    fontSize: Metrics.fontSize16,
    color: Colors.hui66,
    marginVertical: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  // 骰子动画样式
  diceAnimationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceAnimationContainer: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  diceAnimationText: {
    fontSize: 80,
  },
  completeButton: {
    backgroundColor: Colors.subject,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 10,
  },
  completeButtonText: {
    color: Colors.bai,
    fontSize: Metrics.fontSize16,
    fontWeight: 'bold',
  },
});
