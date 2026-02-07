import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, TextInput, Alert, Pressable } from 'react-native';
import { connect } from 'react-redux';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/AntDesign';

import DatePicker from 'react-native-date-picker';
import Moment from 'moment';

import { Colors, Metrics } from '../../theme';
import Config from '../../config/index';
import { Loading, ToastService, MyAlert } from '../../component';
import Http from '../../utils/HttpPost';
import HttpFrom from '../../utils/HttpFrom';

import cityData from './cityData.json';
import BottomPicker from '../../component/BottomPicker';


class ApproveArtist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      renzhengState: false,
      renzhengObj: {},
      name: '',
      idNumber: '',
      frontImage: null,
      backImage: null,
      idcardHoldUrl: null,
      myAlert: false,
      dateOpen: false,
      startDate: '',
      endDate: '',
      selectedType: null,
      selectedProvince: null,
      selectedCity: null,
      selectedDistrict: null,
      desc: '',
      selectedCategory: null,
    }
    this.categoryPickerRef = React.createRef();
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    console.log('user:', this.props.user)
    this.initFunc()
  }

  initFunc(id = '001') {
    Http('get', `/api/artist/info/${this.props.user.id}`, {}).then(res => {
      this.setState({ isLoading: false })
      if (res.code === 200 && res.data.id) {
        this.setState({ renzhengState: true, renzhengObj: res.data })
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

  // 显示日期选择器
  showDatePicker = () => {
    this.setState({ dateOpen: true });
  };

  // 隐藏日期选择器
  hideDatePicker = () => {
    this.setState({ dateOpen: false });
  };

  // 确认选择的日期
  handleConfirm = (date) => {
    if (this.state.changeDate == 'start') {
      this.setState({ startDate: date, dateOpen: false });
    } else {
      this.setState({ endDate: date, dateOpen: false });
    }
  };


  toUpImgFunc(type) {
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
            if (type === 'front') {
              this.setState({ frontImage: res.data.name });
            } else if (type === 'back') {
              this.setState({ backImage: res.data.name });
            } else if (type === 'idcardHoldUrl') {
              this.setState({ idcardHoldUrl: res.data.name });
            }
          }
        }).catch(err => {
          console.log('请求失败', err)
          _this.setState({ isLoading: false })
        })
      }
    });
  }

  handleImageUpload = (type) => {
    // Alert.alert('上传图片', `您点击了上传 ${type === 'front' ? '正面照' : '反面照'}`);
    // 在这里实现图片上传逻辑
    this.toUpImgFunc(type);
  };

  handleSubmit = () => {
    const { frontImage, backImage, idcardHoldUrl, selectedCategory, desc } = this.state;
    console.log('asdaddsad', selectedCategory, desc)
    if (!frontImage || !backImage || !idcardHoldUrl || !selectedCategory || !desc) {
      ToastService.showToast({ title: "请完整填写信息并上传图片" });
      return;
    }
    // 在这里实现提交逻辑
    if (this.state.isLoading) {
      return false;
    }

    let params = {
      "desc": desc,
      "category": Number(this.state.selectedCategory),
      "imgUrlList": [
        frontImage, backImage, idcardHoldUrl
      ]
    }

    this.setState({ isLoading: true })
    Http('post', "/api/artist/add/artist", params).then(res => {
      this.setState({ isLoading: false })
      if (res.code === 200) {
        ToastService.showToast({ title: "已提交审核！" });
        this.initFunc(res.data.id)
        this.props.navigation.goBack();
      }
    })
  };


  // 获取省列表
  getProvinceList = () => {
    return Object.keys(cityData["86"]).map((key) => ({
      label: cityData["86"][key],
      value: key,
    }));
  };

  // 获取市列表
  getCityList = () => {
    const { selectedProvince } = this.state;
    return selectedProvince
      ? Object.keys(cityData[selectedProvince] || {}).map((key) => ({
        label: cityData[selectedProvince][key],
        value: key,
      }))
      : [];
  };

  // 获取区列表
  getDistrictList = () => {
    const { selectedCity } = this.state;
    return selectedCity
      ? Object.keys(cityData[selectedCity] || {}).map((key) => ({
        label: cityData[selectedCity][key],
        value: key,
      }))
      : [];
  };

  handleProvinceChange = (value) => {
    this.setState({
      selectedProvince: value,
      selectedCity: null, // 重置市
      selectedDistrict: null, // 重置区
    });
  };

  handleCityChange = (value) => {
    this.setState({
      selectedCity: value,
      selectedDistrict: null, // 重置区
    });
  };

  handleDistrictChange = (value) => {
    this.setState({
      selectedDistrict: value,
    });
  };

  getArtTypeString(type) {
    const artTypeMap = {
        1: "国画",
        2: "油画",
        3: "雕塑",
        4: "书法",
        5: "版画",
        6: "漆画",
        7: "水粉水彩",
        8: "原创设计师",
        9: "其他"
    };

    return artTypeMap[type] || "未知类型";
}


  render() {
    const { name, idNumber, frontImage, backImage, idcardHoldUrl, selectedProvince, selectedCity, selectedDistrict } = this.state;
    return (
      <ScrollView style={Styles.container}>
        <MyAlert
          visible={this.state.myAlert}
          title="提示"
          message="该功能开发中 敬请期待..."
          buttons={[{ title: '好的', onPress: () => { this.setState({ myAlert: false }) } }]}
        />
        <DatePicker
          modal
          open={this.state.dateOpen}
          date={new Date()}
          onConfirm={this.handleConfirm}
          onCancel={this.hideDatePicker}
          locale="zh_CN"  // 设置为中文
          title="请选择时间" // 设置标题为中文
          confirmText="选择" // 设置确认按钮为中文
          cancelText="取消" // 设置取消按钮为中文
          mode="date"
        />

        {/* 输入区域 */}
        {
          (this.state.renzhengState || this.props.user.artist ) ?
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <ImageBackground style={{ width: Metrics.px2dpi(1029), height: Metrics.px2dpi(319), paddingLeft: 20, justifyContent: 'center' }} source={require('../../asserts/images/publish/icon_art_suc_bg.png')} resizeMode='stretch'>
                <View>
                  <Text style={Styles.nameText}>{this.state.renzhengObj?.userInfo?.name}</Text>
                  <Text style={Styles.cardText}>{ this.getArtTypeString( this.state.renzhengObj.category ) }</Text>
                </View>
              </ImageBackground>


              {/* 图片上传区域 */}
              <View style={{marginTop: 20}}>
                <Text style={Styles.uploadTitle}>艺术家作品</Text>
                <View style={Styles.imageRow}>
                  {
                    this.state.renzhengObj.imgUrlList && this.state.renzhengObj.imgUrlList.map((itemImg, index) =>
                      <View
                        style={Styles.uploadBox}
                        onPress={() => this.handleImageUpload('idcardHoldUrl')}
                        key={index}
                      >
                        <Image source={{ uri: Config.File_PATH + itemImg }} style={Styles.uploadedImage} />
                      </View>
                    )
                  }
                  
                </View>
              </View>

              <Text style={{ marginTop: 50, marginBottom: 10, fontWeight: 'bold', textAlign: 'center', color: Colors.subject }}>
                {this.state.renzhengObj.checkStatus == 1 ? '已通过' : ''}
                {this.state.renzhengObj.checkStatus == 0 ? '审核中' : ''}
                {this.state.renzhengObj.checkStatus == -1 ? '未通过' : ''}
              </Text>
            </View>
            :
            <View >
              <View style={Styles.inputContainer}>
                <View style={Styles.itemView}>
                  <Text style={Styles.leftText}>艺术类别</Text>
                  <TouchableOpacity 
                    style={Styles.pickerContainer}
                    onPress={() => this.categoryPickerRef.current.show()}
                  >
                    <Text style={[Styles.pickerText, !this.state.selectedCategory && Styles.placeholderText]}>
                      {this.state.selectedCategory ? 
                        ["国画", "油画", "雕塑", "书法", "版画", "漆画", "水粉水彩", "原创设计师", "其他"][parseInt(this.state.selectedCategory) - 1] : 
                        "请选择艺术类别"}
                    </Text>
                  </TouchableOpacity>
                  <BottomPicker
                    ref={this.categoryPickerRef}
                    value={this.state.selectedCategory}
                    items={[
                      { label: '国画', value: '1' },
                      { label: '油画', value: '2' },
                      { label: '雕塑', value: '3' },
                      { label: '书法', value: '4' },
                      { label: '版画', value: '5' },
                      { label: '漆画', value: '6' },
                      { label: '水粉水彩', value: '7' },
                      { label: '原创设计师', value: '8' },
                      { label: '其他', value: '9' },
                    ]}
                    onValueChange={(value) => this.setState({ selectedCategory: value })}
                  />
                </View>
                <Text style={{ borderTopColor: Colors.huiF5, borderTopWidth: 1 }}> </Text>
                <View style={{ borderWidth: 1, borderColor: Colors.huiCc, borderRadius: 10, borderStyle: 'dashed', }}>
                  <TextInput style={Styles.inputText}
                    multiline={true}  // 允许多行输入
                    numberOfLines={4}  // 设置初始行数
                    placeholder='点击输入文字' placeholderTextColor={Colors.huiCc}
                    onChangeText={(value) => this.setState({ desc: value })} />
                </View>

              </View>


              {/* 图片上传区域 */}
              <View style={Styles.uploadContainer}>
                <Text style={Styles.uploadTitle}>艺术家作品(必填)</Text>
                <View style={Styles.imageRow}>
                  {/* 正面照片 */}
                  <TouchableOpacity
                    style={Styles.uploadBox}
                    onPress={() => this.handleImageUpload('front')}
                  >
                    {frontImage ? (
                      <Image source={{ uri: Config.File_PATH + frontImage }} style={Styles.uploadedImage} />
                    ) : (
                      <Image source={require('../../asserts/images/publish/icon_add.png')} style={Styles.uploadedImage} />
                    )}
                  </TouchableOpacity>

                  {/* 反面照片 */}
                  <TouchableOpacity
                    style={Styles.uploadBox}
                    onPress={() => this.handleImageUpload('back')}
                  >
                    {backImage ? (
                      <Image source={{ uri: Config.File_PATH + backImage }} style={Styles.uploadedImage} />
                    ) : (
                      <Image source={require('../../asserts/images/publish/icon_add.png')} style={Styles.uploadedImage} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={Styles.uploadBox}
                    onPress={() => this.handleImageUpload('idcardHoldUrl')}
                  >
                    {idcardHoldUrl ? (
                      <Image source={{ uri: Config.File_PATH + idcardHoldUrl }} style={Styles.uploadedImage} />
                    ) : (
                      <Image source={require('../../asserts/images/publish/icon_add.png')} style={Styles.uploadedImage} />
                    )}
                  </TouchableOpacity>

                </View>
                <Text style={[Styles.instructionsText, { marginTop: 20 }]}>
                  请上传三个作品
                </Text>

                {/* 提交按钮 */}
                <TouchableOpacity style={Styles.submitButton} onPress={this.handleSubmit}>
                  <Text style={Styles.submitButtonText}>提交信息</Text>
                </TouchableOpacity>
              </View>


            </View>
        }

      </ScrollView>
    );
  }

}

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(ApproveArtist);

const Styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    paddingHorizontal: 16,
    backgroundColor: Colors.bai,
    marginTop: 16,
    paddingBottom: 16
  },
  input: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input1: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  uploadContainer: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.bai,
    paddingBottom: 60
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15
  },
  uploadBox: {
    width: Metrics.px2dp(200),
    height: Metrics.px2dp(200),
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  instructions: {
    flex: 1,
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.bai,
    paddingBottom: 60
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  submitButton: {
    marginTop: 58,
    backgroundColor: '#D2A26C',
    borderRadius: 24,
    paddingVertical: 12,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  submitButtonText: {
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
  inputText: { textAlignVertical: 'top', height: 110, lineHeight: 52, paddingHorizontal: 10, fontSize: Metrics.fontSize16 },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftText: {
    fontSize: Metrics.fontSize14,
    fontWeight: 'bold',
    marginRight: 10,
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
