import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Image, Text, TextInput, Pressable, Platform } from 'react-native';
import { View, Toast } from 'native-base';
import { connect } from 'react-redux';
import FastImage from 'react-native-fast-image';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

import { Header, Loading, ToastService } from '../component';
import Config from '../config/index';
import { Colors, Metrics } from '../theme';
import Http from '../utils/HttpPost';
import HttpFrom from '../utils/HttpFrom';
import ParamsValidate from '../utils/ValueValidate';
import BottomPicker from '../component/BottomPicker';
import Icon from 'react-native-vector-icons/AntDesign';


class Publish extends React.Component {
  constructor(props) {
    super(props);
    
    // 如果是编辑模式，从路由参数获取数据
    const editData = props.route?.params?.editData || null;
    
    this.state = {
      isLoading: false,
      isEditMode: !!editData,
      editId: editData?.gameId || null,
      title: editData?.title || '',
      description: editData?.description || '',
      steps: editData?.steps || ['', '', '', '', '', ''], // 默认6个步骤
      playerCount: editData?.playerCount || 2, // 默认2人
      customPlayerCount: '', // 自定义人数输入
    }
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {

  }

  // 添加步骤
  addStep = () => {
    if (this.state.steps.length >= 54) {
      return ToastService.showToast({
        title: '最多添加54个步骤'
      })
    }
    this.setState({
      steps: [...this.state.steps, '']
    })
  }

  // 删除步骤
  removeStep = (index) => {
    if (this.state.steps.length <= 6) {
      return ToastService.showToast({
        title: '最少需要6个步骤'
      })
    }
    const newSteps = [...this.state.steps];
    newSteps.splice(index, 1);
    this.setState({ steps: newSteps })
  }

  // 更新步骤内容
  updateStep = (index, value) => {
    const newSteps = [...this.state.steps];
    newSteps[index] = value;
    this.setState({ steps: newSteps })
  }

  // 提交创作
  async toSubmintFunc() {
    // 验证标题（1-100字符）
    let isEmpty = ParamsValidate('isEmpty', this.state.title);
    if (isEmpty !== null) {
      return ToastService.showToast({
        title: '请输入创作标题'
      })
    }
    if (this.state.title.length > 100) {
      return ToastService.showToast({
        title: '标题不能超过100个字符'
      })
    }

    // 验证描述（1-500字符）
    isEmpty = ParamsValidate('isEmpty', this.state.description);
    if (isEmpty !== null) {
      return ToastService.showToast({
        title: '请输入创作描述'
      })
    }
    if (this.state.description.length > 500) {
      return ToastService.showToast({
        title: '描述不能超过500个字符'
      })
    }

    // 验证步骤（6-54个，每个最多200字符）
    const validSteps = this.state.steps.filter(step => step.trim() !== '');
    if (validSteps.length < 6) {
      return ToastService.showToast({
        title: '请至少填写6个步骤'
      })
    }
    if (validSteps.length > 54) {
      return ToastService.showToast({
        title: '步骤不能超过54个'
      })
    }
    
    // 检查每个步骤的长度
    const tooLongStep = validSteps.find(step => step.length > 200);
    if (tooLongStep) {
      return ToastService.showToast({
        title: '每个步骤不能超过200个字符'
      })
    }

        // 验证人数（2-1000人）
        if (this.state.playerCount < 2 || this.state.playerCount > 1000) {
          return ToastService.showToast({
            title: '游戏人数必须在2-1000人之间'
          })
        }

    // 构建提交数据
    const submitData = {
      title: this.state.title,
      description: this.state.description,
      steps: validSteps,
      playerCount: this.state.playerCount,
      gameType: 'feixingqi'
    };

    this.setState({ isLoading: true });

    try {
      let res;
      if (this.state.isEditMode) {
        // 编辑模式 - 更新创作（只能更新草稿状态的作品）
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
        // 返回到创作列表并触发刷新
        this.props.navigation.navigate('Found', { refresh: true });
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
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bai }}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Loading showLoading={this.state.isLoading} />
        <Header 
          title={this.state.isEditMode ? '编辑创作' : '新增创作'} 
          isTabBar={false}
          onLeftPress={() => this.props.navigation.goBack()}
        />
        
        <ScrollView style={{ flex: 1 }}>
          {/* 标题 */}
          <View style={Styles.section}>
            <Text style={Styles.label}>创作标题 * (1-100字符)</Text>
            <TextInput 
              style={Styles.inputText}
              placeholder='请输入创作标题' 
              placeholderTextColor={Colors.huiCc}
              value={this.state.title}
              maxLength={100}
              onChangeText={(value) => this.setState({ title: value })} 
            />
            <Text style={Styles.charCount}>{this.state.title.length}/100</Text>
          </View>

          {/* 描述 */}
          <View style={Styles.section}>
            <Text style={Styles.label}>创作描述 * (1-500字符)</Text>
            <TextInput 
              style={Styles.textArea}
              placeholder='请输入创作描述' 
              placeholderTextColor={Colors.huiCc}
              value={this.state.description}
              maxLength={500}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onChangeText={(value) => this.setState({ description: value })} 
            />
            <Text style={Styles.charCount}>{this.state.description.length}/500</Text>
          </View>

          {/* 游戏人数 */}
          <View style={Styles.section}>
            <Text style={Styles.label}>游戏人数 * (2-1000人)</Text>
            <View style={Styles.playerCountContainer}>
              {[2, 3, 4].map(count => (
                <TouchableOpacity
                  key={count}
                  style={[
                    Styles.playerCountButton,
                    this.state.playerCount === count && Styles.playerCountButtonActive
                  ]}
                  onPress={() => this.setState({ playerCount: count, customPlayerCount: '' })}
                >
                  <Text style={[
                    Styles.playerCountText,
                    this.state.playerCount === count && Styles.playerCountTextActive
                  ]}>
                    {count}人
                  </Text>
                </TouchableOpacity>
              ))}

                <TextInput
                  style={Styles.customPlayerInput}
                  value={this.state.customPlayerCount}
                  onChangeText={(text) => {
                    // 只允许输入数字
                    const numericText = text.replace(/[^0-9]/g, '');
                    this.setState({ customPlayerCount: numericText });
                    
                    // 如果输入了有效数字，更新playerCount
                    if (numericText) {
                      const count = parseInt(numericText, 10);
                      if (count >= 2 && count <= 1000) {
                        this.setState({ playerCount: count });
                      } else if (count > 1000) {
                        this.setState({ playerCount: 1000, customPlayerCount: '1000' });
                        ToastService.showToast({ title: '最多1000人' });
                      } else if (count < 2 && count > 0) {
                        ToastService.showToast({ title: '至少2人' });
                      }
                    }
                  }}
                  placeholder="人数"
                  placeholderTextColor={Colors.hui99}
                  keyboardType="numeric"
                  maxLength={4}
                />
              
            </View>
          </View>

          {/* 步骤 */}
          <View style={Styles.section}>
            <View style={Styles.stepHeader}>
              <Text style={Styles.label}>创作步骤 * (最少6个，最多54个)</Text>
              <Text style={Styles.stepCount}>
                {this.state.steps.length}/54
              </Text>
            </View>
            
            {this.state.steps.map((step, index) => (
              <View key={index} style={Styles.stepItem}>
                <View style={Styles.stepNumber}>
                  <Text style={Styles.stepNumberText}>{index + 1}</Text>
                </View>
                <TextInput 
                  style={Styles.stepInput}
                  placeholder={`请输入第${index + 1}步（最多200字符）`}
                  placeholderTextColor={Colors.huiCc}
                  value={step}
                  maxLength={200}
                  onChangeText={(value) => this.updateStep(index, value)} 
                />
                {this.state.steps.length > 6 && (
                  <TouchableOpacity 
                    style={Styles.deleteButton}
                    onPress={() => this.removeStep(index)}
                  >
                    <Icon name="close" size={18} color={Colors.hui99} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* 添加步骤按钮 */}
            {this.state.steps.length < 54 && (
              <TouchableOpacity 
                style={Styles.addStepButton}
                onPress={this.addStep}
              >
                <Icon name="plus" size={16} color={Colors.subject} />
                <Text style={Styles.addStepText}>添加步骤</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 提交按钮 */}
          <View style={{ paddingHorizontal: 15, paddingVertical: 30 }}>
            <TouchableOpacity 
              onPress={() => { this.toSubmintFunc() }} 
              style={Styles.submitButton}
            >
              <Text style={Styles.submitButtonText}>
                {this.state.isEditMode ? '保存修改' : '提交创作'}
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

export default connect(mapStateToProps, mapDispatchToProps)(Publish);

const Styles = StyleSheet.create({
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
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepCount: {
    fontSize: Metrics.fontSize14,
    color: Colors.subject,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.subject,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    color: Colors.bai,
    fontSize: Metrics.fontSize14,
    fontWeight: 'bold',
  },
  stepInput: {
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
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderWidth: 1,
    borderColor: Colors.subject,
    borderRadius: 8,
    borderStyle: 'dashed',
    marginTop: 10,
  },
  addStepText: {
    fontSize: Metrics.fontSize15,
    color: Colors.subject,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: Colors.subject,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.bai,
    fontSize: Metrics.fontSize16,
    fontWeight: 'bold',
  },
  playerCountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  playerCountButton: {
    height: 38,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.huiCc,
    marginRight: 12,
    marginBottom: 12,
    backgroundColor: Colors.bai,
  },
  playerCountButtonActive: {
    borderColor: Colors.subject,
    backgroundColor: Colors.subject,
  },
  playerCountText: {
    fontSize: Metrics.fontSize15,
    color: Colors.hui66,
  },
  playerCountTextActive: {
    color: Colors.bai,
    fontWeight: 'bold',
  },
  customPlayerCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  customPlayerLabel: {
    fontSize: Metrics.fontSize15,
    color: Colors.hei,
    marginRight: 8,
  },
  customPlayerInput: {
    height: 38,
    borderWidth: 1,
    borderColor: Colors.huiCc,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: Metrics.fontSize15,
    color: Colors.hei,
    width: 68,
    textAlign: 'center',
  },
  customPlayerUnit: {
    fontSize: Metrics.fontSize15,
    color: Colors.hei,
    marginLeft: 8,
  },
});