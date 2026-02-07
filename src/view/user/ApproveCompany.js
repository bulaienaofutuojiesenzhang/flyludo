import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, TextInput, Alert, Pressable } from 'react-native';
import { connect } from 'react-redux';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/AntDesign';

import BottomPicker from '../../component/BottomPicker';
import DatePicker from 'react-native-date-picker';
import Moment from 'moment';

import { Colors, Metrics } from '../../theme';
import Config from '../../config/index';
import { Loading, ToastService, MyAlert } from '../../component';
import Http from '../../utils/HttpPost';
import HttpFrom from '../../utils/HttpFrom';

import cityData  from './cityData.json';


class ApproveCompany extends Component {
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
      selectedType: 1,
      selectedProvince: null,
      selectedCity: null,
      selectedDistrict: null,
    }
    this.typePickerRef = React.createRef();
    this.provincePickerRef = React.createRef();
    this.cityPickerRef = React.createRef();
    this.districtPickerRef = React.createRef();
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    console.log('user:', this.props.user)
    this.initFunc()
  }

  initFunc(){
    Http('get', "/api/approve/mine/info", {}).then(res => {  
      this.setState({ isLoading: false })
      if (res.code === 200 && res.data.id) {
        this.setState({renzhengState: true,renzhengObj: res.data})
      }
    })

    Http('get', `/api/user/mine`, {
        
            }).then(res => {
              this.setState({ isLoading: false, refreshLoading: false })
              console.log('mine:', res.data)
              if (res.code === 200) {
                this.props.setUserInfo(res.data);
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
            } else if (type === 'back'){
              this.setState({ backImage: res.data.name });
            }else if (type === 'idcardHoldUrl'){
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
    // Alert.alert('上传图片', `您点击了上传 ${type === 'front' ? '正面照' : '反����照'}`);
    // 在这里实现图片上传逻辑
    this.toUpImgFunc(type);
  };

  handleSubmit = () => {
    const { name, idNumber, frontImage, backImage, selectedProvince, selectedCity, selectedDistrict  } = this.state;
    if (!name || !frontImage) {
      ToastService.showToast({ title: "请完整填写信息并上传图片" });
      return;
    }
    // 在这里实现提交逻辑
    if (this.state.isLoading) {
      return false;
    }

    let params = {
      "name": name,
      "certificateType": 'business_license',
      "certificateImgUrl": frontImage,
    }

    this.setState({ isLoading: true })
    Http('post', "/api/approve/add", params).then(res => {
      this.setState({ isLoading: false })
      if (res.code === 200) {
        ToastService.showToast({ title: "已提交审核！" });
        this.initFunc();
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
          this.state.renzhengState && this.state.renzhengObj.certificateType == 'business_license' ?
          <View style={{ alignItems : 'center' , marginTop: 20 }}>
            <ImageBackground style={{width: Metrics.px2dpi(1029), height: Metrics.px2dpi(319), paddingLeft: 20,   justifyContent: 'center'  }} source={require('../../asserts/images/publish/icon_art_suc_bg.png')} resizeMode='stretch'>
                  <View>
                  <Text style={Styles.nameText}>{this.state.renzhengObj?.name}</Text>
                  {/* <Text style={Styles.cardText}>{this.maskIDCard( this.state.renzhengObj?.certificateInfo?.licenseNo ) }</Text> */}
                  </View>
              </ImageBackground>
              <Text style={{marginVertical: 20, }}>证件</Text>
                <TouchableOpacity
                  style={Styles.uploadBox}
                >
                  {this.state.renzhengObj ? (
                    <Image source={{ uri: Config.File_PATH + this.state.renzhengObj.certificateImgUrl }} style={Styles.uploadedImage} />
                  ) : (
                    <Image source={require('../../asserts/images/publish/icon_idcard_front.png')} style={Styles.uploadedImage} />
                  )}
                </TouchableOpacity>
          </View>
          :
          <View >
            <View style={Styles.inputContainer}>
          <TextInput
            style={Styles.input}
            placeholder="请输入公司全称"
            value={name}
            onChangeText={(text) => this.setState({ name: text })}
          />
          {/* <TextInput
            style={Styles.input}
            placeholder="请输入营业执照号码"
            value={idNumber}
            onChangeText={(text) => this.setState({ idNumber: text })}
          /> */}

          {/* <View style={[Styles.input, { paddingBottom: 12, marginBottom: 5}]}>
            <Pressable onPress={() => this.setState({ dateOpen: true, changeDate: 'start' })} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 60, paddingBottom: 10 }}>
              {
                this.state.startDate ?
                  <Text style={{ color: Colors.hei2E }} >{Moment(this.state.startDate).format('YYYY-MM-DD')}</Text>
                  :
                  <Text style={{ color: Colors.hui66 }} >请输入身份证开始时间</Text>
              }

              <Icon name='right' />
            </Pressable>
          </View>

          <View style={Styles.itemView}>
            <Text style={Styles.leftText}>公司类型</Text>
            <TouchableOpacity 
              style={Styles.pickerContainer}
              onPress={() => this.typePickerRef.current.show()}
            >
              <Text style={[Styles.pickerText, !this.state.selectedType && Styles.placeholderText]}>
                {this.state.selectedType ? 
                  ["个体工商户", "有限责任公司", "股份有限公司"][parseInt(this.state.selectedType) - 1] : 
                  "请选择公司类型"}
              </Text>
            </TouchableOpacity>
            <BottomPicker
              ref={this.typePickerRef}
              value={this.state.selectedType}
              items={[
                { label: '个体工商户', value: '1' },
                { label: '有限责任公司', value: '2' },
                { label: '股份有限公司', value: '3' },
              ]}
              onValueChange={(value) => this.setState({ selectedType: value })}
            />
          </View> */}
        </View>



        {/* <View style={Styles.uploadContainer}>
          <View style={Styles.itemView}>
            <Text style={Styles.leftText}>选择省份</Text>
            <TouchableOpacity 
              style={Styles.pickerContainer}
              onPress={() => this.provincePickerRef.current.show()}
            >
              <Text style={[Styles.pickerText, !this.state.selectedProvince && Styles.placeholderText]}>
                {this.state.selectedProvince ? 
                  cityData["86"][this.state.selectedProvince] : 
                  "请选择省份"}
              </Text>
            </TouchableOpacity>
            <BottomPicker
              ref={this.provincePickerRef}
              value={this.state.selectedProvince}
              items={this.getProvinceList()}
              onValueChange={this.handleProvinceChange}
            />
          </View>

          <View style={Styles.itemView}>
            <Text style={Styles.leftText}>选择城市</Text>
            <TouchableOpacity 
              style={Styles.pickerContainer}
              onPress={() => this.cityPickerRef.current.show()}
            >
              <Text style={[Styles.pickerText, !this.state.selectedCity && Styles.placeholderText]}>
                {this.state.selectedCity ? 
                  cityData[this.state.selectedProvince][this.state.selectedCity] : 
                  "请选择城市"}
              </Text>
            </TouchableOpacity>
            <BottomPicker
              ref={this.cityPickerRef}
              value={this.state.selectedCity}
              items={this.getCityList()}
              onValueChange={this.handleCityChange}
            />
          </View>

          <View style={Styles.itemView}>
            <Text style={Styles.leftText}>选择区县</Text>
            <TouchableOpacity 
              style={Styles.pickerContainer}
              onPress={() => this.districtPickerRef.current.show()}
            >
              <Text style={[Styles.pickerText, !this.state.selectedDistrict && Styles.placeholderText]}>
                {this.state.selectedDistrict ? 
                  cityData[this.state.selectedCity][this.state.selectedDistrict] : 
                  "请选择区县"}
              </Text>
            </TouchableOpacity>
            <BottomPicker
              ref={this.districtPickerRef}
              value={this.state.selectedDistrict}
              items={this.getDistrictList()}
              onValueChange={this.handleDistrictChange}
            />
          </View>
        </View> */}

        {/* 图片上传区域 */}
        <View style={Styles.uploadContainer}>
          <Text style={Styles.uploadTitle}>上传营业执照信息</Text>
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

          </View>
        </View>

        {/* 图片上传区域 */}
        <View style={[Styles.uploadContainer, {paddingBottom: 60}]}>
          {/* <Text style={Styles.uploadTitle}>上传委托书</Text>
          <View style={Styles.imageRow}>

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
          </View> */}

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
  setUserInfo: payload => dispatch({ type: 'SET_USERINFO', payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ApproveCompany);

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
    paddingTop: 16
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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
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
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  leftText: {
    fontSize: Metrics.fontSize14,
    fontWeight: 'bold',
    marginRight: 10,
    width: 70,
  },
  pickerContainer: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: Colors.bai,
    borderRadius: 4,
  },
  pickerText: {
    fontSize: Metrics.fontSize14,
    color: Colors.hei,
  },
  placeholderText: {
    color: Colors.huiCc,
  },
});
