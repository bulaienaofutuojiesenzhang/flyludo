import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Text, TouchableOpacity, Animated, TextInput, ScrollView, View as RNView } from 'react-native';
import { View } from 'native-base';
import Icons from 'react-native-vector-icons/AntDesign';
import { Colors, Metrics } from '../../theme';

class LuckyDraw extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: ['选项1', '选项2', '选项3'],
      result: null,
      isDrawing: false,
      newOption: '',
    };
    this.rotateValue = new Animated.Value(0);
  }

  // 添加选项
  addOption = () => {
    if (this.state.newOption.trim()) {
      this.setState({
        options: [...this.state.options, this.state.newOption.trim()],
        newOption: '',
      });
    }
  };

  // 删除选项
  removeOption = (index) => {
    if (this.state.options.length <= 2) {
      alert('至少保留2个选项');
      return;
    }
    const newOptions = this.state.options.filter((_, i) => i !== index);
    this.setState({ options: newOptions });
  };

  // 抽签
  draw = () => {
    if (this.state.isDrawing || this.state.options.length < 2) return;

    this.setState({ isDrawing: true, result: null });

    // 旋转动画
    this.rotateValue.setValue(0);
    Animated.timing(this.rotateValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      const randomIndex = Math.floor(Math.random() * this.state.options.length);
      this.setState({ 
        result: this.state.options[randomIndex],
        isDrawing: false,
      });
    });
  };

  render() {
    const rotate = this.rotateValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '1080deg'],
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
          <Text style={styles.headerTitle}>幸运抽签</Text>
          <RNView style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* 结果显示 */}
            {this.state.result && (
              <View style={styles.resultSection}>
                <Animated.View 
                  style={[
                    styles.resultCard,
                    { transform: [{ rotate }] }
                  ]}
                >
                  <Text style={styles.resultEmoji}>🎴</Text>
                  <Text style={styles.resultText}>{this.state.result}</Text>
                </Animated.View>
              </View>
            )}

            {/* 选项列表 */}
            <View style={styles.optionsSection}>
              <Text style={styles.sectionTitle}>抽签选项 ({this.state.options.length})</Text>
              {this.state.options.map((option, index) => (
                <View key={index} style={styles.optionItem}>
                  <Text style={styles.optionText}>{option}</Text>
                  <TouchableOpacity onPress={() => this.removeOption(index)}>
                    <Icons name="closecircle" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* 添加选项 */}
            <View style={styles.addSection}>
              <TextInput
                style={styles.input}
                value={this.state.newOption}
                onChangeText={(text) => this.setState({ newOption: text })}
                placeholder="输入新选项"
                onSubmitEditing={this.addOption}
              />
              <TouchableOpacity 
                style={styles.addBtn}
                onPress={this.addOption}
              >
                <Icons name="plus" size={20} color={Colors.bai} />
              </TouchableOpacity>
            </View>

            {/* 抽签按钮 */}
            <TouchableOpacity
              style={[styles.drawBtn, this.state.isDrawing && styles.drawBtnDisabled]}
              onPress={this.draw}
              disabled={this.state.isDrawing || this.state.options.length < 2}
              activeOpacity={0.8}
            >
              <Text style={styles.drawBtnText}>
                {this.state.isDrawing ? '抽签中...' : '🎴 开始抽签'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  resultSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultCard: {
    backgroundColor: '#FFB6C1',
    borderRadius: 20,
    padding: 30,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.bai,
    textAlign: 'center',
  },
  optionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFB6C1',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  addSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#FFB6C1',
  },
  addBtn: {
    backgroundColor: '#FFB6C1',
    borderRadius: 12,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawBtn: {
    backgroundColor: '#FFB6C1',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  drawBtnDisabled: {
    opacity: 0.6,
  },
  drawBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.bai,
  },
});

export default LuckyDraw;

