import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Text, TouchableOpacity, Animated, TextInput, ScrollView, View as RNView, Dimensions } from 'react-native';
import { View } from 'native-base';
import Icons from 'react-native-vector-icons/AntDesign';
import Svg, { G, Path, Text as SvgText, Circle } from 'react-native-svg';
import { Colors, Metrics } from '../../theme';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(width - 40, 350);

const MAX_OPTION_LENGTH = 8; // 最大字符数

class LuckyWheel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isConfiguring: true,
      options: ['打', '不打', '睡觉'],
      newOption: '',
      editingIndex: null,
      editingText: '',
      wheelMultiplier: 2, // 转盘倍数（1=原始，2=双倍格子）
      isSpinning: false,
      result: null,
    };
    this.rotateValue = new Animated.Value(0);
  }

  // 添加选项
  addOption = () => {
    const trimmed = this.state.newOption.trim();
    if (trimmed) {
      if (trimmed.length > MAX_OPTION_LENGTH) {
        alert(`选项最多${MAX_OPTION_LENGTH}个字`);
        return;
      }
      this.setState({
        options: [...this.state.options, trimmed],
        newOption: '',
      });
    }
  };

  // 开始编辑选项
  startEdit = (index) => {
    this.setState({
      editingIndex: index,
      editingText: this.state.options[index],
    });
  };

  // 保存编辑
  saveEdit = () => {
    const { editingIndex, editingText, options } = this.state;
    const trimmed = editingText.trim();
    
    if (!trimmed) {
      alert('选项不能为空');
      return;
    }
    
    if (trimmed.length > MAX_OPTION_LENGTH) {
      alert(`选项最多${MAX_OPTION_LENGTH}个字`);
      return;
    }
    
    const newOptions = [...options];
    newOptions[editingIndex] = trimmed;
    
    this.setState({
      options: newOptions,
      editingIndex: null,
      editingText: '',
    });
  };

  // 取消编辑
  cancelEdit = () => {
    this.setState({
      editingIndex: null,
      editingText: '',
    });
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

  // 开始配置转盘
  startWheel = () => {
    if (this.state.options.length < 2) {
      alert('至少需要2个选项');
      return;
    }
    this.setState({ isConfiguring: false });
  };

  // 旋转转盘
  spin = () => {
    if (this.state.isSpinning) return;

    this.setState({ isSpinning: true, result: null });

    const { options, wheelMultiplier } = this.state;
    const totalSlices = options.length * wheelMultiplier;
    
    // 随机选择一个格子
    const randomSliceIndex = Math.floor(Math.random() * totalSlices);
    // 对应的选项索引
    const resultIndex = randomSliceIndex % options.length;
    const anglePerSlice = 360 / totalSlices;
    
    // 计算目标角度（多转几圈 + 目标角度）
    const extraSpins = 5; // 额外旋转5圈
    const targetAngle = 360 * extraSpins + (360 - randomSliceIndex * anglePerSlice - anglePerSlice / 2);

    // 重置旋转值
    this.rotateValue.setValue(0);

    // 旋转动画
    Animated.timing(this.rotateValue, {
      toValue: targetAngle,
      duration: 4000,
      useNativeDriver: true,
    }).start(() => {
      this.setState({ 
        isSpinning: false,
        result: options[resultIndex],
      });
    });
  };

  // 绘制转盘
  renderWheel = () => {
    const { options, wheelMultiplier } = this.state;
    const totalSlices = options.length * wheelMultiplier;
    const anglePerSlice = 360 / totalSlices;
    const radius = WHEEL_SIZE / 2;
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#9B59B6', '#FF8C42', '#5DADE2', '#F39C12'];

    // 生成所有格子
    const slices = [];
    for (let i = 0; i < totalSlices; i++) {
      const optionIndex = i % options.length;
      slices.push({
        text: options[optionIndex],
        colorIndex: optionIndex,
      });
    }

    return (
      <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
        <G x={radius} y={radius}>
          {slices.map((slice, index) => {
            const startAngle = (anglePerSlice * index - 90) * (Math.PI / 180);
            const endAngle = (anglePerSlice * (index + 1) - 90) * (Math.PI / 180);
            
            const x1 = radius * Math.cos(startAngle);
            const y1 = radius * Math.sin(startAngle);
            const x2 = radius * Math.cos(endAngle);
            const y2 = radius * Math.sin(endAngle);

            const largeArcFlag = anglePerSlice > 180 ? 1 : 0;
            const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            // 文字位置
            const textAngle = (anglePerSlice * index + anglePerSlice / 2 - 90) * (Math.PI / 180);
            const textRadius = radius * 0.7;
            const textX = textRadius * Math.cos(textAngle);
            const textY = textRadius * Math.sin(textAngle);

            return (
              <G key={index}>
                <Path
                  d={pathData}
                  fill={colors[slice.colorIndex % colors.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
                <SvgText
                  x={textX}
                  y={textY}
                  fill="#fff"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {slice.text.length > 5 ? slice.text.substring(0, 4) + '...' : slice.text}
                </SvgText>
              </G>
            );
          })}
          {/* 中心圆 */}
          <Circle r={30} fill="#fff" stroke="#333" strokeWidth={2} />
          <SvgText
            fill="#333"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            START
          </SvgText>
        </G>
      </Svg>
    );
  };

  render() {
    const { isConfiguring, options, newOption, editingIndex, editingText, wheelMultiplier, isSpinning, result } = this.state;

    const rotate = this.rotateValue.interpolate({
      inputRange: [0, 360],
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
          <Text style={styles.headerTitle}>幸运转盘</Text>
          {!isConfiguring && (
            <TouchableOpacity 
              style={styles.configBtn} 
              onPress={() => this.setState({ isConfiguring: true, result: null })}
            >
              <Icons name="setting" size={20} color="#666" />
            </TouchableOpacity>
          )}
          {isConfiguring && <RNView style={{ width: 40 }} />}
        </View>

        {isConfiguring ? (
          // 配置界面
          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              <Text style={styles.title}>⚙️ 配置转盘选项</Text>
              
              {/* 选项列表 */}
              <View style={styles.optionsSection}>
                {options.map((option, index) => (
                  <View key={index} style={styles.optionItem}>
                    <Text style={styles.optionIndex}>{index + 1}</Text>
                    {editingIndex === index ? (
                      // 编辑模式
                      <>
                        <TextInput
                          style={styles.editInput}
                          value={editingText}
                          onChangeText={(text) => {
                            if (text.length <= MAX_OPTION_LENGTH) {
                              this.setState({ editingText: text });
                            }
                          }}
                          maxLength={MAX_OPTION_LENGTH}
                          autoFocus
                        />
                        <TouchableOpacity onPress={this.saveEdit} style={styles.iconBtn}>
                          <Icons name="check" size={20} color="#4ECDC4" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.cancelEdit} style={styles.iconBtn}>
                          <Icons name="close" size={20} color="#999" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      // 显示模式
                      <>
                        <Text style={styles.optionText}>{option}</Text>
                        <TouchableOpacity onPress={() => this.startEdit(index)} style={styles.iconBtn}>
                          <Icons name="edit" size={18} color="#4ECDC4" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.removeOption(index)} style={styles.iconBtn}>
                          <Icons name="closecircle" size={20} color="#FF6B6B" />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                ))}
              </View>

              {/* 添加选项 */}
              <View style={styles.addSection}>
                <TextInput
                  style={styles.input}
                  value={newOption}
                  onChangeText={(text) => {
                    if (text.length <= MAX_OPTION_LENGTH) {
                      this.setState({ newOption: text });
                    }
                  }}
                  placeholder={`输入新选项(最多${MAX_OPTION_LENGTH}字)`}
                  maxLength={MAX_OPTION_LENGTH}
                  onSubmitEditing={this.addOption}
                />
                <TouchableOpacity 
                  style={styles.addBtn}
                  onPress={this.addOption}
                >
                  <Icons name="plus" size={20} color={Colors.bai} />
                </TouchableOpacity>
              </View>

              {/* 转盘倍数设置 */}
              <View style={styles.multiplierSection}>
                <Text style={styles.multiplierLabel}>🎡 转盘格数倍数</Text>
                <Text style={styles.multiplierHint}>
                  当前: {options.length} 个选项 × {wheelMultiplier} = {options.length * wheelMultiplier} 格
                </Text>
                <View style={styles.multiplierButtons}>
                  {[1, 2, 3, 4, 5].map((multiplier) => (
                    <TouchableOpacity
                      key={multiplier}
                      style={[
                        styles.multiplierBtn,
                        wheelMultiplier === multiplier && styles.multiplierBtnActive
                      ]}
                      onPress={() => this.setState({ wheelMultiplier: multiplier })}
                    >
                      <Text style={[
                        styles.multiplierBtnText,
                        wheelMultiplier === multiplier && styles.multiplierBtnTextActive
                      ]}>
                        ×{multiplier}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 提示 */}
              <View style={styles.tipSection}>
                <Text style={styles.tipText}>💡 至少需要2个选项才能开始</Text>
                <Text style={styles.tipText}>✏️ 点击编辑按钮可修改选项</Text>
                <Text style={styles.tipText}>🎲 倍数越高，随机性越强</Text>
              </View>

              {/* 开始按钮 */}
              <TouchableOpacity
                style={styles.startBtn}
                onPress={this.startWheel}
              >
                <Text style={styles.startBtnText}>🎡 开始使用转盘</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          // 转盘界面
          <View style={styles.wheelContainer}>
            {/* 指针 */}
            <View style={styles.pointer}>
              <Text style={styles.pointerText}>▼</Text>
            </View>

            {/* 转盘 */}
            <Animated.View style={[styles.wheel, { transform: [{ rotate }] }]}>
              {this.renderWheel()}
            </Animated.View>

            {/* 结果显示 */}
            {result && (
              <View style={styles.resultSection}>
                <Text style={styles.resultLabel}>🎉 抽中了</Text>
                <Text style={styles.resultText}>{result}</Text>
              </View>
            )}

            {/* 旋转按钮 */}
            <TouchableOpacity
              style={[styles.spinBtn, isSpinning && styles.spinBtnDisabled]}
              onPress={this.spin}
              disabled={isSpinning}
            >
              <Text style={styles.spinBtnText}>
                {isSpinning ? '🎡 旋转中...' : '🎯 开始抽奖'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  configBtn: {
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsSection: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#CB9869',
  },
  optionIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CB9869',
    color: Colors.bai,
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: 'bold',
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
  },
  iconBtn: {
    padding: 5,
    marginLeft: 5,
  },
  addSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#CB9869',
  },
  addBtn: {
    backgroundColor: '#CB9869',
    borderRadius: 12,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiplierSection: {
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  multiplierLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  multiplierHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  multiplierButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  multiplierBtn: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  multiplierBtnActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  multiplierBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  multiplierBtnTextActive: {
    color: Colors.bai,
  },
  tipSection: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
  },
  startBtn: {
    backgroundColor: '#CB9869',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#CB9869',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.bai,
  },
  wheelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pointer: {
    position: 'absolute',
    top: 60,
    zIndex: 10,
  },
  pointerText: {
    fontSize: 40,
    color: '#FF6B6B',
  },
  wheel: {
    marginTop: 40,
    marginBottom: 40,
  },
  resultSection: {
    backgroundColor: Colors.bai,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  resultLabel: {
    fontSize: 16,
    color: '#999',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#CB9869',
  },
  spinBtn: {
    backgroundColor: '#CB9869',
    borderRadius: 15,
    paddingHorizontal: 40,
    paddingVertical: 18,
    shadowColor: '#CB9869',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  spinBtnDisabled: {
    opacity: 0.6,
  },
  spinBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.bai,
  },
});

export default LuckyWheel;

