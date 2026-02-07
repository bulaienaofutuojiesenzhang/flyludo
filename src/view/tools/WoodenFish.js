import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Text, TouchableOpacity, Animated, View as RNView, Vibration } from 'react-native';
import { View } from 'native-base';
import Icons from 'react-native-vector-icons/AntDesign';
import { Colors, Metrics } from '../../theme';

class WoodenFish extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      merit: 0, // 功德值
      isKnocking: false,
    };
    this.scaleValue = new Animated.Value(1);
    this.meritAnimation = new Animated.Value(0);
  }

  // 播放振动反馈（暂时替代音效）
  playSound = () => {
    // 使用振动反馈，给用户反馈
    Vibration.vibrate(50);
  };

  // 敲木鱼
  knockWoodenFish = () => {
    if (this.state.isKnocking) return;

    this.setState({ 
      isKnocking: true,
      count: this.state.count + 1,
      merit: this.state.merit + 1,
    });

    // 播放音效
    this.playSound();

    // 缩放动画
    Animated.sequence([
      Animated.timing(this.scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(this.scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      this.setState({ isKnocking: false });
    });

    // 功德值动画
    this.meritAnimation.setValue(0);
    Animated.timing(this.meritAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  // 重置
  reset = () => {
    this.setState({
      count: 0,
      merit: 0,
    });
  };

  // 获取功德等级
  getMeritLevel = () => {
    const merit = this.state.merit;
    if (merit >= 1000) return { level: '佛祖', color: '#FFD700' };
    if (merit >= 500) return { level: '菩萨', color: '#FF8C00' };
    if (merit >= 200) return { level: '罗汉', color: '#FF6B6B' };
    if (merit >= 100) return { level: '居士', color: '#98D8C8' };
    if (merit >= 50) return { level: '信徒', color: '#7CC6E8' };
    return { level: '凡人', color: '#999' };
  };

  render() {
    const meritLevel = this.getMeritLevel();
    const opacity = this.meritAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 0],
    });
    const translateY = this.meritAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -50],
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
          <Text style={styles.headerTitle}>敲木鱼</Text>
          <TouchableOpacity 
            style={styles.resetBtn} 
            onPress={this.reset}
          >
            <Icons name="reload1" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* 功德等级 */}
          <View style={styles.meritSection}>
            <Text style={styles.meritLabel}>当前境界</Text>
            <Text style={[styles.meritLevel, { color: meritLevel.color }]}>
              {meritLevel.level}
            </Text>
            <Text style={styles.meritValue}>功德: {this.state.merit}</Text>
          </View>

          {/* 木鱼 */}
          <View style={styles.fishSection}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={this.knockWoodenFish}
            >
              <Animated.View 
                style={[
                  styles.woodenFish,
                  { transform: [{ scale: this.scaleValue }] }
                ]}
              >
                <Text style={styles.fishEmoji}>🪵</Text>
              </Animated.View>
            </TouchableOpacity>

            {/* 功德+1动画 */}
            <Animated.View 
              style={[
                styles.meritFloat,
                { 
                  opacity,
                  transform: [{ translateY }]
                }
              ]}
            >
              <Text style={styles.meritFloatText}>功德+1</Text>
            </Animated.View>

            <Text style={styles.tapHint}>点击木鱼</Text>
          </View>

          {/* 统计 */}
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>敲击次数</Text>
              <Text style={styles.statValue}>{this.state.count}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>功德累积</Text>
              <Text style={styles.statValue}>{this.state.merit}</Text>
            </View>
          </View>

          {/* 功德语录 */}
          <View style={styles.quoteSection}>
            <Text style={styles.quoteText}>
              {this.state.count === 0 && '🙏 开始敲击木鱼，积累功德'}
              {this.state.count > 0 && this.state.count < 10 && '✨ 初心不改，继续修行'}
              {this.state.count >= 10 && this.state.count < 50 && '🌟 心诚则灵，功德无量'}
              {this.state.count >= 50 && this.state.count < 100 && '💫 勤修苦练，道行渐深'}
              {this.state.count >= 100 && '🎊 功德圆满，普度众生'}
            </Text>
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
  meritSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  meritLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  meritLevel: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  meritValue: {
    fontSize: 16,
    color: '#999',
  },
  fishSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  woodenFish: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#98D8C8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#98D8C8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fishEmoji: {
    fontSize: 100,
  },
  meritFloat: {
    position: 'absolute',
    top: '30%',
  },
  meritFloatText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tapHint: {
    fontSize: 16,
    color: '#999',
    marginTop: 30,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#98D8C8',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#98D8C8',
  },
  quoteSection: {
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#98D8C8',
  },
  quoteText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default WoodenFish;

