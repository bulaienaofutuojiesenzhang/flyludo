import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Text, TouchableOpacity, Animated, TextInput, View as RNView } from 'react-native';
import { View } from 'native-base';
import Icons from 'react-native-vector-icons/AntDesign';
import { Colors, Metrics } from '../../theme';

class RandomNumber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      minValue: '1',
      maxValue: '100',
      result: null,
      isAnimating: false,
    };
    this.animatedValue = new Animated.Value(0);
  }

  // 生成随机数
  generateRandom = () => {
    const min = parseInt(this.state.minValue) || 1;
    const max = parseInt(this.state.maxValue) || 100;

    if (min >= max) {
      alert('最小值必须小于最大值');
      return;
    }

    this.setState({ isAnimating: true });

    // 动画效果
    this.animatedValue.setValue(0);
    Animated.spring(this.animatedValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // 随机数生成
    setTimeout(() => {
      const random = Math.floor(Math.random() * (max - min + 1)) + min;
      this.setState({ 
        result: random,
        isAnimating: false 
      });
    }, 300);
  };

  render() {
    const scale = this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
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
          <Text style={styles.headerTitle}>随机数生成器</Text>
          <RNView style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* 输入区域 */}
          <View style={styles.inputSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>最小值</Text>
              <TextInput
                style={styles.input}
                value={this.state.minValue}
                onChangeText={(text) => this.setState({ minValue: text })}
                keyboardType="numeric"
                placeholder="输入最小值"
              />
            </View>

            <Text style={styles.separator}>~</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>最大值</Text>
              <TextInput
                style={styles.input}
                value={this.state.maxValue}
                onChangeText={(text) => this.setState({ maxValue: text })}
                keyboardType="numeric"
                placeholder="输入最大值"
              />
            </View>
          </View>

          {/* 结果显示 */}
          <View style={styles.resultSection}>
            {this.state.result !== null && (
              <Animated.View style={[styles.resultCard, { transform: [{ scale }] }]}>
                <Text style={styles.resultNumber}>{this.state.result}</Text>
              </Animated.View>
            )}
            {this.state.result === null && (
              <Text style={styles.placeholder}>点击下方按钮生成随机数</Text>
            )}
          </View>

          {/* 生成按钮 */}
          <TouchableOpacity
            style={[styles.generateBtn, this.state.isAnimating && styles.generateBtnDisabled]}
            onPress={this.generateRandom}
            disabled={this.state.isAnimating}
            activeOpacity={0.8}
          >
            <Text style={styles.generateBtnText}>
              {this.state.isAnimating ? '生成中...' : '生成随机数'}
            </Text>
          </TouchableOpacity>
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
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 15,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#B8A1E8',
  },
  separator: {
    fontSize: 24,
    color: '#999',
    marginHorizontal: 15,
    marginTop: 25,
  },
  resultSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: '#B8A1E8',
    borderRadius: 20,
    padding: 40,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#B8A1E8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  resultNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: Colors.bai,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  generateBtn: {
    backgroundColor: '#B8A1E8',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#B8A1E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  generateBtnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.bai,
  },
});

export default RandomNumber;

