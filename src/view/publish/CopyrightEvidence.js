import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image, Text, TextInput, View } from 'react-native';
import { connect } from 'react-redux';
import FastImage from 'react-native-fast-image';
import { launchImageLibrary } from 'react-native-image-picker';
import Moment from 'moment';
import md5 from 'md5';

import { Header, Loading, ToastService } from '../../component';
import Config from '../../config/index';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import HttpFrom from '../../utils/HttpFrom';
import { requestMediaPermission } from '../../utils/PermissionHelper';

class CopyrightEvidence extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      name: '',
      desc: '',
      upImg: '',
      type: '1', // 作品类型
      password: '', // 存证密码
      renzhengObj: null, // 认证信息
    }
  }

  componentDidMount() {
    // 获取认证信息
    this.getRenzhengInfo();
  }

  // 获取认证信息
  async getRenzhengInfo() {
    try {
      const res = await Http('get', '/api/approve/mine/info');
      if (res.code === 200) {
        this.setState({ renzhengObj: res.data });
      }
    } catch (error) {
      console.log('获取认证信息失败:', error);
    }
  }

  // 处理密码输入
  handlePasswordChange = (value) => {
    this.setState({ password: value });
  };

  // 掩码处理身份证号
  maskIDCard(idcard) {
    if (!idcard) return '';
    
    // 如果长度不是18位,直接返回原值
    if (idcard.length !== 18) {
      return idcard;
    }
    
    // 18位身份证号码才进行掩码处理
    return idcard.replace(/^(.{6})(?:\d+)(.{4})$/, '$1****$2');
  }

  // 上传图片
  async toUpImgFunc() {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) {
      ToastService.showToast({ title: "需要相册权限才能上传图片" });
      return;
    }

    let photoOptions = {
      mediaType: 'photo',
      quality: 0.8,
    };
    launchImageLibrary(photoOptions, (response) => {
      if (response.didCancel) return;
      
      response = response?.assets[0];
      if (response.uri) {
        this.setState({ isLoading: true });
        HttpFrom.imgUpData(response.uri, response.type, response.fileName)
          .then(res => {
            this.setState({ isLoading: false });
            if (res.code == 200) {
              this.setState({ upImg: res.data.name });
            }
          })
          .catch(err => {
            console.log('请求失败', err);
            this.setState({ isLoading: false });
          });
      }
    });
  }

  // 提交
  async toSubmitFunc() {
    if (this.state.isLoading) return;

    const { name, password, upImg } = this.state;
    
    if (!name || !upImg) {
      ToastService.showToast({ title: "请完善信息" });
      return;
    }

    let params = {
      dataName: name,
      dataUrl: upImg
    };

    this.setState({ isLoading: true });
    try {
      const res = await Http('post', '/api/hash/add', params);
      this.setState({ isLoading: false });
      console.log('res@@@', res);
      if (res.code === 200) {
        ToastService.showToast({ title: "提交成功" });
        this.props.navigation.goBack();
      }
    } catch (error) {
      this.setState({ isLoading: false });
      console.log('提交失败:', error);
    }
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.huiF5 }}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Loading showLoading={this.state.isLoading} />
        
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.section}>
            <View style={styles.uploadContainer}>
              <Text style={styles.sectionTitle}>
                作品图片
                <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity 
                style={styles.uploadBox}
                onPress={() => this.toUpImgFunc()}
              >
                {this.state.upImg ? (
                  <FastImage 
                    source={{ uri: Config.File_PATH + this.state.upImg }} 
                    style={styles.uploadedImage}
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Image 
                      source={require('../../asserts/images/publish/icon_add.png')} 
                      style={styles.addIcon}
                    />
                    <Text style={styles.uploadText}>上传作品图片</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>作品信息</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  作品名称
                  <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入作品名称"
                  placeholderTextColor={Colors.huiCc}
                  value={this.state.name}
                  onChangeText={(value) => this.setState({ name: value })}
                />
              </View>

              {/* <View style={styles.inputContainer}>
                <Text style={[styles.label, { marginTop: 5, marginBottom: 18 }]}>存证密码(8-16位)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入存证密码"
                  placeholderTextColor={Colors.huiCc}
                  secureTextEntry={true}
                  value={this.state.password}
                  onChangeText={this.handlePasswordChange}
                />
                <Text style={styles.tipText}>前往用户设置 -> 存证密码设置 </Text>
              </View> */}

            </View>

            
          </View>

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => this.toSubmitFunc()}
          >
            <Text style={styles.submitText}>提交</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.hei,
    marginBottom: 12,
  },
  uploadContainer: {
    backgroundColor: Colors.bai,
    padding: 16,
  },
  uploadBox: {
    width: Metrics.px2dp(300),
    height: Metrics.px2dp(300),
    backgroundColor: Colors.huiF5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholder: {
    alignItems: 'center',
  },
  addIcon: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: Colors.hui66,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  formContainer: {
    backgroundColor: Colors.bai,
    padding: 16,
    marginTop: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.hei,
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: Colors.hui66,
    backgroundColor: Colors.huiF5,
    padding: 12,
    borderRadius: 8,
  },
  input: {
    height: 44,
    backgroundColor: Colors.huiF5,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.hei,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButton: {
    height: 44,
    backgroundColor: Colors.subject,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 24,
  },
  submitText: {
    fontSize: 16,
    color: Colors.bai,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: Colors.hui66,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.hei,
  },
  tipText: {
    fontSize: 12,
    color: Colors.hui66,
    marginTop: 18,
  },
  required: {
    color: '#FF0000',
    marginLeft: 4,
  },
});

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(CopyrightEvidence); 