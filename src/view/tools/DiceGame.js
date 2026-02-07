import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Text, TouchableOpacity, Animated, View as RNView } from 'react-native';
import { View } from 'native-base';
import Icons from 'react-native-vector-icons/AntDesign';
import { Colors, Metrics } from '../../theme';

class DiceGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      diceValue: 1,
      isRolling: false,
      history: [],
    };
    this.rotateValue = new Animated.Value(0);
  }

  // 骰子图案
  getDiceDisplay = (value) => {
    const dots = {
      1: ['•'],
      2: ['• ', ' •'],
      3: ['• ', ' • ', ' •'],
      4: ['• •', '• •'],
      5: ['• •', ' • ', '• •'],
      6: ['• • •', '• • •'],
    };
    return dots[value] || ['•'];
  };

  // 掷骰子
  rollDice = () => {
    if (this.state.isRolling) return;

    this.setState({ isRolling: true });

    // 旋转动画
    this.rotateValue.setValue(0);
    Animated.timing(this.rotateValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // 快速滚动效果
    let count = 0;
    const interval = setInterval(() => {
      const randomValue = Math.floor(Math.random() * 6) + 1;
      this.setState({ diceValue: randomValue });
      count++;
      if (count >= 10) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        this.setState({ 
          diceValue: finalValue,
          isRolling: false,
          history: [finalValue, ...this.state.history.slice(0, 9)]
        });
      }
    }, 50);
  };

  render() {
    const rotate = this.rotateValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* 顶部导航 */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => this.props.navigation.goBack()}
          >
            <Icons name="left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>掷骰子</Text>
          <RNView style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* 骰子显示 */}
          <View style={styles.diceSection}>
            <Animated.View 
              style={[
                styles.dice, 
                { transform: [{ rotate }] }
              ]}
            >
              <View style={styles.diceInner}>
                {this.getDiceDisplay(this.state.diceValue).map((row, index) => (
                  <Text key={index} style={styles.diceDots}>{row}</Text>
                ))}
              </View>
            </Animated.View>
            <Text style={styles.diceNumber}>{this.state.diceValue}</Text>
          </View>

          {/* 掷骰子按钮 */}
          <TouchableOpacity
            style={[styles.rollBtn, this.state.isRolling && styles.rollBtnDisabled]}
            onPress={this.rollDice}
            disabled={this.state.isRolling}
            activeOpacity={0.8}
          >
            <Text style={styles.rollBtnText}>
              {this.state.isRolling ? '掷骰子中...' : '🎲 掷骰子'}
            </Text>
          </TouchableOpacity>

          {/* 历史记录 */}
          {this.state.history.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>历史记录</Text>
              <View style={styles.historyList}>
                {this.state.history.map((value, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Text style={styles.historyValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: Colors.bai,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  diceSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dice: {
    width: 150,
    height: 150,
    backgroundColor: Colors.bai,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7CC6E8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#7CC6E8',
  },
  diceInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceDots: {
    fontSize: 40,
    color: '#7CC6E8',
    letterSpacing: 10,
    lineHeight: 45,
  },
  diceNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#7CC6E8',
    marginTop: 20,
  },
  rollBtn: {
    backgroundColor: '#7CC6E8',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#7CC6E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rollBtnDisabled: {
    opacity: 0.6,
  },
  rollBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.bai,
  },
  historySection: {
    marginTop: 30,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  historyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  historyItem: {
    width: 50,
    height: 50,
    backgroundColor: Colors.bai,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7CC6E8',
  },
  historyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7CC6E8',
  },
});

export default DiceGame;

