import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Colors, Metrics } from '../../theme';

class ChangjianWt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [
        {
          title: '情侣飞行棋是什么？',
          content: '情侣飞行棋是我们的主打功能！您可以：1）自定义创建属于自己的飞行棋（设置格子内容、惩罚、奖励等）；2）发布分享您的飞行棋作品，让更多人体验；3）收藏其他用户创作的精彩飞行棋；4）和伴侣一起玩，增进感情。既有趣味性又充满创意，是情侣互动的最佳选择！'
        },
        {
          title: '如何创建自定义飞行棋？',
          content: '创建自定义飞行棋很简单：1）进入首页点击"自定义棋盘"；2）设置棋盘格子数量和每格内容；3）可以添加各种有趣的任务、惩罚或奖励；4）保存并分享给好友或发布到社区；5）其他用户可以收藏和使用您的创意飞行棋。让您的创意被更多人看到！'
        },
        {
          title: '百宝箱有哪些实用工具？',
          content: '百宝箱提供多种实用小工具：幸运转盘（可自定义选项做决策）、掷骰子、抛硬币、随机数生成、幸运抽签、今日运势、敲木鱼（功德累积）、二维码生成器、颜色助手等。这些工具可以帮助您在日常生活中快速做决策或使用实用功能。'
        },
        {
          title: '二维码生成器支持哪些格式？',
          content: '二维码生成器支持多种格式：普通文本、网址（https://...）、电话（tel:手机号）、邮箱（mailto:邮箱地址）、WiFi信息（WIFI:T:类型;S:名称;P:密码;;）等。生成后可以直接分享二维码内容，方便快捷地分享信息。'
        },
        {
          title: '如何反馈问题或提建议？',
          content: '您可以通过以下方式反馈：1）进入"个人中心"；2）点击"反馈与建议"；3）填写您遇到的问题或想法；4）提交后我们会尽快处理。您的每一条反馈都对我们很重要，帮助我们不断改进产品体验。'
        },
        {
          title: '应用需要哪些权限？',
          content: '为了正常使用，应用可能需要以下权限：网络权限（获取在线数据）、存储权限（保存图片等）、振动权限（木鱼等功能的反馈）、相机权限（扫描二维码，可选）。我们承诺仅在必要时使用这些权限，不会收集您的隐私信息。详情可查看"个人信息收集清单"。'
        },
        {
          title: '真心话大冒险怎么玩？',
          content: '1）选择真心话或大冒险模式；2）系统会随机滚动显示问题；3）停止后显示最终问题，参与者需要完成；4）可以自定义题库，添加自己的问题；5）支持批量添加和管理题目。适合朋友聚会、团队建设等场景活跃气氛。'
        }
      ]
    };
  }

  renderQuestionItem = (item, index) => {
    return (
      <View key={index} style={styles.questionItem}>
        <Text style={styles.questionTitle}>{item.title}</Text>
        <Text style={styles.questionContent}>{item.content}</Text>
      </View>
    );
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>常见问题</Text>
        </View>
        <View style={styles.content}>
          {this.state.questions.map((item, index) => 
            this.renderQuestionItem(item, index)
          )}
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.huiF5,
  },
  header: {
    height: 120,
    backgroundColor: '#CB9869',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.bai,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  headerImage: {
    width: '80%',
    height: 120,
  },
  content: {
    padding: 15,
  },
  questionItem: {
    backgroundColor: Colors.bai,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#CB9869',
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CB9869',
    marginBottom: 10,
  },
  questionContent: {
    fontSize: 14,
    color: Colors.hui66,
    lineHeight: 22,
  },
});

export default ChangjianWt; 