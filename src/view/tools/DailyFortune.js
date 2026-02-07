import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Text, TouchableOpacity, Animated, ScrollView, View as RNView } from 'react-native';
import { View } from 'native-base';
import Icons from 'react-native-vector-icons/AntDesign';
import { Colors, Metrics } from '../../theme';
import { suangua } from '../../data/guaData';

class DailyFortune extends React.Component {
  constructor(props) {
    super(props);
    const today = new Date().toDateString();
    const savedDate = null; // 可以从AsyncStorage读取
    
    this.state = {
      hasChecked: savedDate === today,
      fortune: null,
      isRevealing: false,
    };
    this.scaleValue = new Animated.Value(0);
  }

  // 获取签运颜色
  getSignColor = (shangxia) => {
    const colorMap = {
      '上上签': '#FF6B6B',
      '上签': '#FF8C42',
      '中上签': '#FFD93D',
      '中签': '#6BCB77',
      '中中签': '#6BCB77',
      '中下签': '#4D96FF',
      '下下签': '#9B59B6',
    };
    return colorMap[shangxia] || '#AF7AC5';
  };

  // 幸运元素
  luckyElements = {
    colors: ['红色', '蓝色', '绿色', '黄色', '紫色', '粉色', '橙色', '白色'],
    numbers: [1, 3, 5, 7, 8, 9, 18, 28, 66, 88],
    directions: ['东方', '南方', '西方', '北方', '东南', '西南', '东北', '西北'],
    items: ['咖啡', '奶茶', '水果', '巧克力', '鲜花', '香水', '手机', '书籍'],
  };

  // 生成今日运势
  generateFortune = () => {
    if (this.state.isRevealing) return;

    this.setState({ isRevealing: true });

    // 使用今天的日期作为随机种子，确保同一天结果相同
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // 简单的伪随机数生成器
    const random = (max) => {
      const x = Math.sin(seed) * 10000;
      return Math.floor((x - Math.floor(x)) * max);
    };

    // 从卦象数据中随机选择一个
    const guaIndex = random(suangua.length);
    const selectedGua = suangua[guaIndex];
    
    // 构建运势数据
    const fortune = {
      name: selectedGua.name,
      shortName: selectedGua.shortName,
      forShort: selectedGua.forShort,
      shangxia: selectedGua.shangxia,
      xiangyu: selectedGua.xiangyu,
      gua: selectedGua.gua,
      jieshi: selectedGua.jieshi,
      shi: selectedGua.shi,
      color: this.getSignColor(selectedGua.shangxia),
      luckyColor: this.luckyElements.colors[random(this.luckyElements.colors.length)],
      luckyNumber: this.luckyElements.numbers[random(this.luckyElements.numbers.length)],
      luckyDirection: this.luckyElements.directions[random(this.luckyElements.directions.length)],
      luckyItem: this.luckyElements.items[random(this.luckyElements.items.length)],
    };

    // 动画
    this.scaleValue.setValue(0);
    Animated.spring(this.scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      this.setState({ 
        fortune,
        hasChecked: true,
        isRevealing: false,
      });
    }, 1000);
  };

  render() {
    const { fortune, hasChecked, isRevealing } = this.state;

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
          <Text style={styles.headerTitle}>今日运势</Text>
          <RNView style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* 日期显示 */}
            <View style={styles.dateSection}>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </Text>
            </View>

            {/* 运势结果 */}
            {!hasChecked ? (
              <View style={styles.mysterySection}>
                <Text style={styles.mysteryEmoji}>🔮</Text>
                <Text style={styles.mysteryText}>点击下方按钮查看今日运势</Text>
              </View>
            ) : fortune && (
              <Animated.View style={{ transform: [{ scale: this.scaleValue }] }}>
                {/* 卦象信息 */}
                <View style={[styles.fortuneCard, { borderColor: fortune.color }]}>
                  <View style={[styles.fortuneHeader, { backgroundColor: fortune.color }]}>
                    <View>
                      <Text style={styles.fortuneName}>{fortune.name}</Text>
                      <Text style={styles.fortuneShort}>{fortune.forShort}</Text>
                    </View>
                    <View style={styles.signBadge}>
                      <Text style={styles.signText}>{fortune.shangxia}</Text>
                    </View>
                  </View>
                  
                  {/* 卦辞 */}
                  <View style={styles.guaSection}>
                    <Text style={styles.guaLabel}>卦象</Text>
                    <Text style={styles.guaText}>{fortune.gua}</Text>
                  </View>

                  {/* 象语 */}
                  <View style={styles.xiangSection}>
                    <Text style={styles.xiangLabel}>象曰</Text>
                    <Text style={styles.xiangText}>{fortune.xiangyu}</Text>
                  </View>

                  {/* 解释 */}
                  <View style={styles.jieshiSection}>
                    <Text style={styles.jieshiLabel}>解释</Text>
                    <Text style={styles.jieshiText}>{fortune.jieshi}</Text>
                  </View>

                  {/* 事业 */}
                  <View style={styles.shiSection}>
                    <Text style={styles.shiLabel}>💼 事业运势</Text>
                    <Text style={styles.shiText}>{fortune.shi}</Text>
                  </View>
                </View>

                {/* 幸运元素 */}
                <View style={styles.luckySection}>
                  <Text style={styles.sectionTitle}>🍀 今日幸运</Text>
                  <View style={styles.luckyGrid}>
                    <View style={styles.luckyItem}>
                      <Text style={styles.luckyLabel}>幸运颜色</Text>
                      <Text style={[styles.luckyValue, { color: fortune.color }]}>{fortune.luckyColor}</Text>
                    </View>
                    <View style={styles.luckyItem}>
                      <Text style={styles.luckyLabel}>幸运数字</Text>
                      <Text style={[styles.luckyValue, { color: fortune.color }]}>{fortune.luckyNumber}</Text>
                    </View>
                    <View style={styles.luckyItem}>
                      <Text style={styles.luckyLabel}>幸运方位</Text>
                      <Text style={[styles.luckyValue, { color: fortune.color }]}>{fortune.luckyDirection}</Text>
                    </View>
                    <View style={styles.luckyItem}>
                      <Text style={styles.luckyLabel}>幸运物品</Text>
                      <Text style={[styles.luckyValue, { color: fortune.color }]}>{fortune.luckyItem}</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* 查看按钮 */}
            {!hasChecked && (
              <TouchableOpacity
                style={[styles.checkBtn, isRevealing && styles.checkBtnDisabled]}
                onPress={this.generateFortune}
                disabled={isRevealing}
                activeOpacity={0.8}
              >
                <Text style={styles.checkBtnText}>
                  {isRevealing ? '占卜中...' : '🔮 查看今日运势'}
                </Text>
              </TouchableOpacity>
            )}

            {/* 底部提示 */}
            <View style={styles.footerSection}>
              <Text style={styles.footerText}>
                ✨ 运势仅供娱乐，幸福需要自己创造
              </Text>
            </View>
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
  dateSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  mysterySection: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  mysteryEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  mysteryText: {
    fontSize: 16,
    color: '#999',
  },
  fortuneCard: {
    backgroundColor: Colors.bai,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  fortuneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  fortuneName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.bai,
    marginBottom: 4,
  },
  fortuneShort: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  signBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  signText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.bai,
  },
  guaSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  guaLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  guaText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  xiangSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  xiangLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  xiangText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  jieshiSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  jieshiLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  jieshiText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  shiSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  shiLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  shiText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  luckySection: {
    backgroundColor: Colors.bai,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  luckyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  luckyItem: {
    width: (Metrics.screenWidth - 70) / 2,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  luckyLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  luckyValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkBtn: {
    backgroundColor: '#AF7AC5',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#AF7AC5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  checkBtnDisabled: {
    opacity: 0.6,
  },
  checkBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.bai,
  },
  footerSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default DailyFortune;


