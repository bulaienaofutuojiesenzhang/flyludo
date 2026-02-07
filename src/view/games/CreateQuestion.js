import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Text, TextInput, Platform } from 'react-native';
import { View } from 'native-base';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/AntDesign';

import { Header, Loading, ToastService } from '../../component';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import ParamsValidate from '../../utils/ValueValidate';

class CreateQuestion extends React.Component {
  constructor(props) {
    super(props);
    
    // 从路由参数获取类型：'zhenxinhua' 或 'damaoxian'
    const type = props.route?.params?.type || 'zhenxinhua';
    const editData = props.route?.params?.editData || null;
    
    this.state = {
      isLoading: false,
      type: type, // 'zhenxinhua' 或 'damaoxian'
      isEditMode: !!editData,
      editId: editData?.gameId || null,
      title: editData?.title || '',
      description: editData?.description || '',
      questions: editData?.steps || [''], // 题目列表
    }
  }

  componentDidMount() {
  }

  // 添加题目
  addQuestion = () => {
    if (this.state.questions.length >= 50) {
      return ToastService.showToast({
        title: '最多添加50个题目'
      })
    }
    this.setState({
      questions: [...this.state.questions, '']
    })
  }

  // 删除题目
  removeQuestion = (index) => {
    if (this.state.questions.length <= 1) {
      return ToastService.showToast({
        title: '至少需要1个题目'
      })
    }
    const newQuestions = [...this.state.questions];
    newQuestions.splice(index, 1);
    this.setState({ questions: newQuestions })
  }

  // 更新题目内容
  updateQuestion = (index, value) => {
    const newQuestions = [...this.state.questions];
    newQuestions[index] = value;
    this.setState({ questions: newQuestions })
  }

  // 提交题目
  async submitFunc() {
    const { title, description, questions, type } = this.state;
    
    // 验证标题（1-100字符）
    let isEmpty = ParamsValidate('isEmpty', title);
    if (isEmpty !== null) {
      return ToastService.showToast({
        title: '请输入创作标题'
      })
    }
    if (title.length > 100) {
      return ToastService.showToast({
        title: '标题不能超过100个字符'
      })
    }

    // 验证描述（1-500字符）
    isEmpty = ParamsValidate('isEmpty', description);
    if (isEmpty !== null) {
      return ToastService.showToast({
        title: '请输入创作描述'
      })
    }
    if (description.length > 500) {
      return ToastService.showToast({
        title: '描述不能超过500个字符'
      })
    }
    
    // 验证题目（至少1个，每个最多200字符）
    const validQuestions = questions.filter(q => q.trim() !== '');
    if (validQuestions.length < 1) {
      return ToastService.showToast({
        title: '请至少填写1个题目'
      })
    }
    
    // 检查每个题目的长度
    const tooLongQuestion = validQuestions.find(q => q.length > 200);
    if (tooLongQuestion) {
      return ToastService.showToast({
        title: '每个题目不能超过200个字符'
      })
    }

    // 构建提交数据
    const submitData = {
      title: title,
      description: description,
      steps: validQuestions,
      gameType: type
    };

    this.setState({ isLoading: true });

    try {
      let res;
      if (this.state.isEditMode) {
        // 编辑模式 - 更新创作
        res = await Http('put', `/couple-game/update/${this.state.editId}`, submitData);
      } else {
        // 新增模式 - 创建创作
        res = await Http('post', '/couple-game/create', submitData);
      }

      this.setState({ isLoading: false });

      if (res.code === 200) {
        ToastService.showToast({
          title: this.state.isEditMode ? '更新成功' : '创建成功'
        });
        // 返回上一页（通常是 TruthOrDareList 或 Found）
        this.props.navigation.goBack();
      } else {
        ToastService.showToast({
          title: res.message || '操作失败'
        });
      }
    } catch (err) {
      this.setState({ isLoading: false });
      console.log('提交失败:', err);
      ToastService.showToast({
        title: '网络错误，请重试'
      });
    }
  }

  render() {
    const { type, questions, title, description } = this.state;
    const isZhenxinhua = type === 'zhenxinhua';
    const pageTitle = this.state.isEditMode 
      ? (isZhenxinhua ? '编辑真心话' : '编辑大冒险')
      : (isZhenxinhua ? '新增真心话' : '新增大冒险');
    const placeholder = isZhenxinhua ? '真心话问题' : '大冒险挑战';

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bai }}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Loading showLoading={this.state.isLoading} />
        <Header 
          title={pageTitle} 
          isTabBar={false}
          onLeftPress={() => this.props.navigation.goBack()}
        />
        
        <ScrollView style={{ flex: 1 }}>
          {/* 提示 */}
          <View style={Styles.tipSection}>
            <View style={[Styles.tipBadge, { backgroundColor: isZhenxinhua ? Colors.zhenxinPink : Colors.maoxianYellow }]}>
              <Text style={Styles.tipBadgeText}>
                {isZhenxinhua ? '💭 真心话' : '⚡ 大冒险'}
              </Text>
            </View>
            <Text style={Styles.tipText}>
              {isZhenxinhua 
                ? '创建有趣的真心话问题，让游戏更加精彩！' 
                : '创建有趣的大冒险挑战，让游戏更加刺激！'}
            </Text>
          </View>

          {/* 标题 */}
          <View style={Styles.section}>
            <Text style={Styles.label}>创作标题 * (1-100字符)</Text>
            <TextInput 
              style={Styles.inputText}
              placeholder='请输入创作标题' 
              placeholderTextColor={Colors.huiCc}
              value={title}
              maxLength={100}
              onChangeText={(value) => this.setState({ title: value })} 
            />
            <Text style={Styles.charCount}>{title.length}/100</Text>
          </View>

          {/* 描述 */}
          <View style={Styles.section}>
            <Text style={Styles.label}>创作描述 * (1-500字符)</Text>
            <TextInput 
              style={Styles.textArea}
              placeholder='请输入创作描述' 
              placeholderTextColor={Colors.huiCc}
              value={description}
              maxLength={500}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onChangeText={(value) => this.setState({ description: value })} 
            />
            <Text style={Styles.charCount}>{description.length}/500</Text>
          </View>

          {/* 题目列表 */}
          <View style={Styles.section}>
            <View style={Styles.questionHeader}>
              <Text style={Styles.label}>{placeholder} * (至少1个，最多50个)</Text>
              <Text style={Styles.questionCount}>
                {questions.length}/50
              </Text>
            </View>
            
            {questions.map((question, index) => (
              <View key={index} style={Styles.questionItem}>
                <View style={[Styles.questionNumber, { backgroundColor: isZhenxinhua ? Colors.zhenxinPink : Colors.maoxianYellow }]}>
                  <Text style={Styles.questionNumberText}>{index + 1}</Text>
                </View>
                <TextInput 
                  style={Styles.questionInput}
                  placeholder={`请输入${placeholder}（最多200字符）`}
                  placeholderTextColor={Colors.huiCc}
                  value={question}
                  maxLength={200}
                  multiline
                  onChangeText={(value) => this.updateQuestion(index, value)} 
                />
                {questions.length > 1 && (
                  <TouchableOpacity 
                    style={Styles.deleteButton}
                    onPress={() => this.removeQuestion(index)}
                  >
                    <Icon name="close" size={18} color={Colors.hui99} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* 添加题目按钮 */}
            {questions.length < 50 && (
              <TouchableOpacity 
                style={[Styles.addQuestionButton, { borderColor: isZhenxinhua ? Colors.zhenxinPink : Colors.maoxianYellow }]}
                onPress={this.addQuestion}
              >
                <Icon name="plus" size={16} color={isZhenxinhua ? Colors.zhenxinPink : Colors.maoxianYellow} />
                <Text style={[Styles.addQuestionText, { color: isZhenxinhua ? Colors.zhenxinPink : Colors.maoxianYellow }]}>
                  添加题目
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 提交按钮 */}
          <View style={{ paddingHorizontal: 15, paddingVertical: 30 }}>
            <TouchableOpacity 
              onPress={() => { this.submitFunc() }} 
              style={[Styles.submitButton, { backgroundColor: isZhenxinhua ? Colors.zhenxinPink : Colors.maoxianYellow }]}
            >
              <Text style={Styles.submitButtonText}>
                提交题目
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  isLogged: state.user.isLogged,
  token: state.user.token,
  user: state.user,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(CreateQuestion);

const Styles = StyleSheet.create({
  tipSection: {
    backgroundColor: Colors.bai,
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.huiF5,
  },
  tipBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  tipBadgeText: {
    color: Colors.bai,
    fontSize: Metrics.fontSize14,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: Metrics.fontSize14,
    color: Colors.hui99,
    lineHeight: 20,
  },
  section: {
    backgroundColor: Colors.bai,
    marginTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 6,
  },
  label: {
    fontSize: Metrics.fontSize15,
    color: Colors.hei2E,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  charCount: {
    fontSize: Metrics.fontSize12,
    color: Colors.hui99,
    textAlign: 'right',
    marginTop: 5,
  },
  inputText: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.huiF5,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: Metrics.fontSize16,
    backgroundColor: Colors.bai,
    ...Platform.select({
      ios: {
        paddingTop: 15,
        paddingBottom: 15,
      }
    })
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.huiF5,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: Metrics.fontSize16,
    backgroundColor: Colors.bai,
    textAlignVertical: 'top',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  questionCount: {
    fontSize: Metrics.fontSize14,
    color: Colors.subject,
    fontWeight: 'bold',
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 8,
  },
  questionNumberText: {
    color: Colors.bai,
    fontSize: Metrics.fontSize14,
    fontWeight: 'bold',
  },
  questionInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.huiF5,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: Metrics.fontSize15,
    backgroundColor: Colors.bai,
  },
  deleteButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginTop: 5,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    marginTop: 10,
  },
  addQuestionText: {
    fontSize: Metrics.fontSize15,
    marginLeft: 8,
  },
  submitButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: Colors.bai,
    fontSize: Metrics.fontSize16,
    fontWeight: 'bold',
  },
});

