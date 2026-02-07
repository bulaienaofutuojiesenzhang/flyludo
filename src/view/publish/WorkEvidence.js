import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, StatusBar, FlatList, Image, Text, TextInput, Pressable, ImageBackground } from 'react-native';
import { View, } from 'native-base';
import { Tab, TabView } from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import DatePicker from 'react-native-date-picker';
import Moment from 'moment';
import md5 from 'md5';

import { Header, Loading, ToastService } from '../../component';
import Config from '../../config/index';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import ParamsValidate from '../../utils/ValueValidate';


class WorkEvidence extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      renzhengObj: {},
      pwd: '',
      password: '',
      cunzhengObj: {}
    }
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    console.log('WorkEvidence详细：', this.props.route.params)
    const { params } = this.props.route;
    if (params) {
      this.setState((prevState) => ({
        ...prevState,  // 保留原 state 的其他数据
        ...params,     // 使用 params 中的字段来覆盖 state
      }), () => {
        if (params.isid) { 
          Http('get', `/api/hash/info/id/${this.state.id}`).then(res => {
            this.setState({ isLoading: false })
            console.log('res', res) 
            if (res.code === 200) {
            this.setState({ cunzhengObj: res.data })
          }
        })
        }else{
          Http('get', `/api/hash/info/dataId/${this.state.id}`, {}).then(res => {
            this.setState({ isLoading: false })
            console.log('res', res)
            if (res.code === 200) {
            this.setState({ cunzhengObj: res.data })
          }
        })
        }
         
      });
    }

    this.initFunc()
  }

  initFunc() {
    Http('get', "/api/approve/mine/info", {}).then(res => {
      this.setState({ isLoading: false })
      if (res.code === 200 && res.data.id) {
        this.setState({ renzhengObj: res.data })
      }
    })
  }

  maskIDCard(idCard) {
    // 检查身份证号长度是否合法
    if (!idCard) {
      return '';
    }
    // 替换中间 11 位为 *****
    return idCard.replace(/^(\d{3})\d{11}(\w{4})$/, '$1********$2');
  }

  handlePasswordChange = (password) => {
    this.setState({ password });
  };

  handleSubmit = () => {
    // 提交逻辑
    console.log('存证密码:', this.state.password);

    if (this.state.isLoading) {
      return false;
    }
    let isEmpty;
    isEmpty = ParamsValidate('isEmpty', this.state.password);
    if (isEmpty !== null) {
      return ToastService.showToast({
        title: '请输入存证密码'
      })
    }

    let params = {
      "dataId": this.state.id,
      "dataName": this.state.name,
      "password": md5(this.state.password)
    }

    this.setState({ isLoading: true })
    Http('post', "/api/hash/works/add", params).then(res => {
      this.setState({ isLoading: false })
      if (res.code === 200) {
        ToastService.showToast({ title: "存证成功！" });

        Http('get', `/api/hash/info/dataId/${this.state.id}`, {}).then(res => {
          this.setState({ isLoading: false })
          if (res.code === 200) {
            this.setState({ cunzhengObj: res.data })
          }
        })

      }
    })

  };


  render() {
    return (

      <ScrollView style={Styles.container}>
        <View style={{ flex: 1 }}>
          {/* 主体内容 */}
          <View style={Styles.content}>

            {
              this.state.cunzhengObj ?
                <View>
                  {/* 作品图片 */}
                  <View style={Styles.section}>
                    <Text style={Styles.sectionTitle}>作品主图</Text>
                    {this.state.cunzhengObj?.dataUrl && (
                      <Image 
                        style={Styles.workImage} 
                        source={{ uri: Config.File_PATH + this.state.cunzhengObj?.dataUrl }}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <ImageBackground style={{ width: Metrics.px2dpi(1029), height: Metrics.px2dpi(315), paddingLeft: 10, justifyContent: 'center' }} source={require('../../asserts/images/publish/icon_source_bg.png')} resizeMode='stretch'>
                    <View>
                      <Text style={Styles.nameText}>存证ID</Text>
                      <Text style={Styles.cardText}>{this.state.cunzhengObj?.hashId}</Text>
                    </View>
                  </ImageBackground>
                  {/* <Text style={{ marginTop: 50, marginBottom: 10, fontWeight: 'bold', textAlign: 'center', color: Colors.subject }}>
                    {this.state.cunzhengObj.checkStatus == 1 ? '已通过' : ''}
                    {this.state.cunzhengObj.checkStatus == 0 ? '审核中' : ''}
                    {this.state.cunzhengObj.checkStatus == -1 ? '未通过' : ''}
                  </Text> */}
                </View>
                :
                <View style={Styles.content}>
                  {/* 信息展示 */}
                  <Text style={Styles.label}>著作权人身份信息</Text>
                  <View style={Styles.infoRow}>
                    <Text style={Styles.infoLabel}>姓名</Text>
                    <Text style={Styles.infoValue}>{this.state.renzhengObj?.certificateInfo?.name}</Text>
                  </View>
                  <View style={Styles.infoRow}>
                    <Text style={Styles.infoLabel}>身份证号码</Text>
                    <Text style={Styles.infoValue}>{this.maskIDCard(this.state.renzhengObj?.certificateInfo?.licenseNo  )}</Text>
                  </View>

                  {/* 输入密码 */}
                  <Text style={[Styles.label, { marginTop: 15 }]}>存证密码(8-16位) </Text>
                  <TextInput
                    style={Styles.input}
                    placeholder="请输入存证密码"
                    secureTextEntry={true}
                    value={this.state.password}
                    onChangeText={this.handlePasswordChange}
                  />
                  <Text style={Styles.infoLabel}>前往用户设置 -> 存证密码设置 </Text>
                  {/* 确定按钮 */}
                  <TouchableOpacity style={Styles.button} onPress={this.handleSubmit}>
                    <Text style={Styles.buttonText}>确定</Text>
                  </TouchableOpacity>
                </View>
            }






          </View>
        </View>
      </ScrollView>

    );
  }

}


const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkEvidence);

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    marginTop: 20,
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#d89c6a',
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: Metrics.fontSize16,
  },
  cardText: {
    fontSize: Metrics.fontSize16,
    marginTop: 10
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.hei,
    marginBottom: 12,
  },
  descContainer: {
    backgroundColor: Colors.huiF5,
    padding: 12,
    borderRadius: 8,
  },
  descText: {
    fontSize: 14,
    color: Colors.hui66,
    lineHeight: 20,
  },
  workImage: {
    width: '100%',
    height: Metrics.px2dp(600),
    borderRadius: 8,
    backgroundColor: Colors.huiF5,
  },
});