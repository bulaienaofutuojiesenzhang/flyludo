import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Text, TouchableOpacity, Animated, View as RNView } from 'react-native';
import { View } from 'native-base';
import Icons from 'react-native-vector-icons/AntDesign';
import { Colors, Metrics } from '../../theme';

class CoinFlip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null, // 'heads' or 'tails'
      isFlipping: false,
      headsCount: 0,
      tailsCount: 0,
    };
    this.flipValue = new Animated.Value(0);
  }

  // 抛硬币
  flipCoin = () => {
    if (this.state.isFlipping) return;

    this.setState({ isFlipping: true, result: null });

    // 旋转动画
    this.flipValue.setValue(0);
    Animated.timing(this.flipValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      this.setState({ 
        result,
        isFlipping: false,
        headsCount: result === 'heads' ? this.state.headsCount + 1 : this.state.headsCount,
        tailsCount: result === 'tails' ? this.state.tailsCount + 1 : this.state.tailsCount,
      });
    });
  };

  // 重置统计
  resetStats = () => {
    this.setState({
      headsCount: 0,
      tailsCount: 0,
      result: null,
    });
  };

  render() {
    const rotateY = this.flipValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '1800deg'],
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
          <Text style={styles.headerTitle}>抛硬币</Text>
          <TouchableOpacity 
            style={styles.resetBtn} 
            onPress={this.resetStats}
          >
            <Icons name="reload1" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* 硬币显示 */}
          <View style={styles.coinSection}>
            <Animated.View 
              style={[
                styles.coin,
                { 
                  transform: [{ rotateY }],
                  backgroundColor: this.state.result === 'heads' ? '#F5D89A' : 
                                 this.state.result === 'tails' ? '#E8D4A2' : '#F5D89A'
                }
              ]}
            >
              <Text style={styles.coinText}>
                {this.state.isFlipping ? '?' : 
                 this.state.result === 'heads' ? '正面' : 
                 this.state.result === 'tails' ? '反面' : '🪙'}
              </Text>
            </Animated.View>

            {this.state.result && (
              <Text style={styles.resultText}>
                {this.state.result === 'heads' ? '正面！' : '反面！'}
              </Text>
            )}
          </View>

          {/* 抛硬币按钮 */}
          <TouchableOpacity
            style={[styles.flipBtn, this.state.isFlipping && styles.flipBtnDisabled]}
            onPress={this.flipCoin}
            disabled={this.state.isFlipping}
            activeOpacity={0.8}
          >
            <Text style={styles.flipBtnText}>
              {this.state.isFlipping ? '抛硬币中...' : '🪙 抛硬币'}
            </Text>
          </TouchableOpacity>

          {/* 统计信息 */}
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>正面</Text>
              <Text style={styles.statValue}>{this.state.headsCount}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>反面</Text>
              <Text style={styles.statValue}>{this.state.tailsCount}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>总次数</Text>
              <Text style={styles.statValue}>
                {this.state.headsCount + this.state.tailsCount}
              </Text>
            </View>
          </View>
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
  resetBtn: {
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
  coinSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  coin: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F5D89A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 5,
    borderColor: '#E8D4A2',
  },
  coinText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8B7355',
  },
  resultText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F5D89A',
    marginTop: 30,
  },
  flipBtn: {
    backgroundColor: '#F5D89A',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#F5D89A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  flipBtnDisabled: {
    opacity: 0.6,
  },
  flipBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B7355',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5D89A',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5D89A',
  },
});

export default CoinFlip;

