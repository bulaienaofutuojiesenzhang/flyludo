import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, StatusBar, FlatList, Image, Text, TextInput, Pressable, ImageBackground } from 'react-native';
import { View, } from 'native-base';
import { Tab, TabView } from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import DatePicker from 'react-native-date-picker';
import Moment from 'moment';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import BottomPicker from '../../component/BottomPicker';

import { Header, Loading, ToastService } from '../../component';
import Config from '../../config/index';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import HttpFrom from '../../utils/HttpFrom';
import ParamsValidate from '../../utils/ValueValidate';


class WorkBanquan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      "dataId": "",
      "dataName": "",
      "nature": "1",
      "finishDate": "",
      "introprocess": "",
      "finishAddress": "",
      "publishStatus": "",
      "publishDate": "",
      "publishAddress": "",
      "signType": "",
      "signName": "",
      "powerBelongType": "",
      "powerBelongFileUrl": "",
      "powerReceiveType": "",
      "powerOwnType": "",
      "proveFileUrl": "",
      upImg: '',
      timeType: '',
      cunzhengObj: {},
      dateOpen: false,
      selectDate: new Date(),
      tongyi: false,
      selectedPrice: '',
      price: 48.00,
    }
    this.pricePickerRef = React.createRef();
    this.paymentModalRef = React.createRef();
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    console.log('WorkBanquan', this.props.route.params)
    const { params } = this.props.route;
    if (params) {
      this.setState((prevState) => ({
        ...prevState,  // 保留原 state 的其他数据
        ...params,     // 使用 params 中的字段来覆盖 state
      }));
    }

    this.initFunc()
  }

  initFunc() {
    Http('get', `/api/dict/info/dataId/${this.props.route.params.id}`, {}).then(res => {
      this.setState({ isLoading: false })
      if (res.code === 200) {
        this.setState({ cunzhengObj: res.data })
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

  toSubmintFunc() {
    if (this.state.isLoading) {
      return false;
    }

    let isEmpty;
    isEmpty = ParamsValidate('isEmpty', this.state.introprocess);
    if (isEmpty !== null) {
      return ToastService.showToast({
        title: '请输入填写登记说明'
      })
    }

    if (!this.state.tongyi) {
      return ToastService.showToast({
        title: "请先阅读并同意用户承诺",
      });
    }

    let params = {
      "dataId": this.props.route.params.id,
      "dataName": this.props.route.params.name,
      "intro": this.state.introprocess,
      "introFileUrl": this.state.upImg,
    }

    this.setState({ isLoading: true })
    Http('post', "/api/dict/works/add", params).then(res => {
      this.setState({ isLoading: false })
      if (res.code === 200) {
        ToastService.showToast({ title: "提交成功" });
        // 调用支付 
        const paymentModal = this.paymentModalRef.current;
        if (paymentModal) {
          paymentModal.show({
            amount: this.state.price,
            dataId: res.data.id,
            type: 'dict',
            onPaymentComplete: (method, success) => {
              if (success) {
                this.props.navigation.goBack();
              }
            }
          });
        }
      }
    })
  };


  // 确认选择的日期
  handleConfirm = (date) => {
    if (this.state.timeType == 'finishDate') {
      this.setState({ finishDate: date, selectDate: date, dateOpen: false });
    } else {
      this.setState({ publishDate: date, selectDate: date, dateOpen: false });
    }
  };

  handleToggle = (value) => {
    this.setState({ isShow: value })
  };

  renderField(label, value) {
    return (
      <View style={Styles.fieldContainer}>
        <Text style={Styles.label}>{label}:</Text>
        <Text style={Styles.value}>{value || '无'}</Text>
      </View>
    );
  }

  getNatureDescription(nature) {
    const natureMap = {
      '1': '原创',
      '2': '改编',
      '3': '翻译',
      '4': '汇编',
      '5': '注释',
      '6': '整理',
      '7': '其他',
    };
    return natureMap[nature] || '未知';
  }

  getQuanligs(nature) {
    const natureMap = {
      '1': '个人作品',
      '2': '合作作品',
      '3': '法人作品',
      '4': '职务作品',
      '5': '委托作品',
    };
    return natureMap[nature] || '未知';
  }

  getQuanlihuodefs(nature) {
    const natureMap = {
      '1': '原始',
      '2': '继承',
      '3': '承受',
      '4': '其他',
    };
    return natureMap[nature] || '未知';
  }


  toUpImgFunc() {
    let _this = this;
    let photoOptions = {
      mediaType: 'photo',
      quality: 0.8,
      // includeBase64: true
    };
    launchImageLibrary(photoOptions, (response) => {
      console.log('response', response)
      if (response.didCancel) {
        return
      }
      response = response?.assets[0]
      if (response.uri) {
        console.log('response::', response)
        this.setState({ isLoading: true })
        HttpFrom.imgUpData(response.uri, response.type, response.fileName).then(res => {
          _this.setState({ isLoading: false })
          if (res.code == 200) {
            this.setState({ upImg: res.data.name })
          }
        }).catch(err => {
          console.log('请求失败', err)
          _this.setState({ isLoading: false })
        })

      }
    });
  }


  render() {
    const {
      dataName,
      intro,
      nature,
      finishDate,
      finishAddress,
      process,
      publishStatus,
      publishDate,
      publishAddress,
      signType,
      signName,
      powerBelongType,
      powerBelongFileUrl,
      powerReceiveType,
      powerOwnType,
      powerOwnExplainList,
      proveFileUrl
    } = this.state.cunzhengObj || {};

    return (
      <ScrollView style={Styles.container}>
        <DatePicker
          modal
          open={this.state.dateOpen}
          date={this.state.selectDate}
          onConfirm={this.handleConfirm}
          onCancel={this.hideDatePicker}
          locale="zh_CN"  // 设置为中文
          title="请选择时间" // 设置标题为中文
          confirmText="选择" // 设置确认按钮为中文
          cancelText="取消" // 设置取消按钮为中文
          mode="date"
        />

        <View style={{ flex: 1 }}>
          {/* 主体内容 */}
          <View style={Styles.content}>

            {
              this.state.cunzhengObj ?

                <View style={{ flex: 1, backgroundColor: Colors.bai, paddingTop: 20, paddingBottom: 60, paddingHorizontal: 10 }}>
                  {this.renderField('作品名称', dataName)}
                  <View style={{ marginTop: 8, backgroundColor: Colors.bai, paddingBottom: 20 }}>
                    <Text style={Styles.label}>登记说明:</Text>
                    <View style={{ borderWidth: 1, borderColor: Colors.huiCc, borderRadius: 10, marginTop: 10, paddingVertical: 20, paddingHorizontal: 5, borderStyle: 'dashed', }}>
                      <Text> {intro}</Text>
                    </View>


                    {this.state.cunzhengObj.introFileUrl && <View>
                      <Text style={{ marginTop: 15, marginBottom: 10, fontWeight: 'bold' }}>补充文件</Text>

                      <Pressable >
                        <Image style={Styles.upImg} source={{ uri: Config.File_PATH + this.state.cunzhengObj.introFileUrl }} />
                      </Pressable>
                    </View>}


                    <Text style={{ marginTop: 50, marginBottom: 10, fontWeight: 'bold', textAlign: 'center', color: Colors.subject }}>
                      {this.state.cunzhengObj.checkStatus == 1 ? '已通过' : ''}
                      {this.state.cunzhengObj.checkStatus == 0 ? '审核中' : ''}
                      {this.state.cunzhengObj.checkStatus == -1 ? '未通过' : ''}
                    </Text>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                      {this.state.cunzhengObj.dictImgUrl && <Image style={Styles.upImg} source={{ uri: Config.File_PATH + this.state.cunzhengObj.dictImgUrl }} />}
                    </View>

                  </View>

                </View>

                :
                <View style={{}}>

                  <View style={{ backgroundColor: Colors.bai, paddingBottom: 6, paddingVertical: 10, paddingHorizontal: 10 }}>
                    <Text style={Styles.label}>作品信息</Text>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingVertical: 20,
                    }}>
                      <Text style={Styles.infoLabel}>作品</Text>
                      <Text style={Styles.infoValue}>{this.props.route.params.name}</Text>
                    </View>

                  </View>


                  <View style={{ marginTop: 8, backgroundColor: Colors.bai, paddingBottom: 20, paddingHorizontal: 10 }}>
                    <Text style={{ lineHeight: 50, fontSize: Metrics.fontSize15 }}>登记说明</Text>
                    <View style={{ borderWidth: 1, borderColor: Colors.huiCc, borderRadius: 10, borderStyle: 'dashed', }}>
                      <TextInput style={Styles.inputTextH}
                        multiline={true}  // 允许多行输入
                        numberOfLines={4}  // 设置初始行数
                        placeholder='点击输入文字' placeholderTextColor={Colors.huiCc}
                        onChangeText={(value) => this.setState({ introprocess: value })} />
                    </View>

                    <Text style={{ lineHeight: 50, fontSize: Metrics.fontSize15 }}>补充文件</Text>

                    <Pressable onPress={() => { this.toUpImgFunc() }}>
                      <Image style={Styles.upImg} source={this.state.upImg ? { uri: Config.File_PATH + this.state.upImg } : require('../../asserts/images/publish/icon_add.png')} />
                    </Pressable>
                  </View>

                  <View style={{ marginTop: 8, flex: 1, backgroundColor: Colors.bai, paddingHorizontal: 10, paddingBottom: 30 }}>
                    <View style={Styles.xieyiCont}>
                      <TouchableOpacity style={Styles.yhXieyiClikCont} onPress={() => { this.setState({ tongyi: !this.state.tongyi }) }}>
                        {
                          this.state.tongyi ?
                            <Image
                              resizeMode='contain'
                              style={Styles.xieyiIconSele}
                              source={require('../../asserts/images/icons/icon_check_check.png')} />
                            :
                            <Image
                              resizeMode='contain'
                              style={Styles.xieyiIconSele}
                              source={require('../../asserts/images/icons/icon_check_uncheck.png')} />
                        }
                      </TouchableOpacity>
                      <Text style={Styles.yhXieyiText}>本人承诺:所上传文件符合现行国家法律法规相关规定，并且上传文件内容为原创作品，如因作品权属问题发生争议，本人自愿承担相关责任。 </Text>
                    </View>

                    <TouchableOpacity onPress={() => { this.toSubmintFunc() }} style={{ marginTop: 30, backgroundColor: Colors.subject, height: 50, lineHeight: 50, borderRadius: 50, marginHorizontal: 10, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ textAlign: 'center', color: Colors.bai, fontSize: Metrics.fontSize14 }}>提交</Text>
                    </TouchableOpacity>

                  </View>


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

export default connect(mapStateToProps, mapDispatchToProps)(WorkBanquan);

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

  inputContainer: {
    flexDirection: 'row', // 水平布局
    alignItems: 'center', // 垂直居中
  },
  unitText: {
    fontSize: 16,
    marginLeft: 10, // 在单位和输入框之间添加间距
    color: '#333',
  },
  inputText: { height: 52, lineHeight: 52, paddingHorizontal: 10, fontSize: Metrics.fontSize16 },
  inputTextH: { textAlignVertical: 'top', height: 110, lineHeight: 52, paddingHorizontal: 10, fontSize: Metrics.fontSize16 },
  inputTextMe: { flex: 1, height: 52, lineHeight: 52, paddingHorizontal: 10, fontSize: Metrics.fontSize16 },
  yhXieyiText: { fontSize: Metrics.fontSize14, color: Colors.subject, marginLeft: 5 },
  xieyiCont: { marginTop: 18, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start' },
  yhXieyiClikCont: { fontSize: Metrics.fontSize15, color: Colors.subject, textAlign: 'center', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  xieyiIconSele: { fontSize: 20, color: Colors.hui99, marginBottom: 2, width: 16, height: Metrics.px2dpi(54) },
  upImg: { width: Metrics.px2dpi(300), height: Metrics.px2dpi(300), borderRadius: 5 },

  fieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 5
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  value: {
    color: '#333',
  },
  pickerContainer: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  pickerText: {
    fontSize: Metrics.fontSize14,
    color: Colors.hei,
  },
  placeholderText: {
    color: Colors.huiCc,
  },
});