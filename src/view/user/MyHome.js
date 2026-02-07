import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, TextInput } from 'react-native';
import { connect } from 'react-redux';
import FastImage from 'react-native-fast-image';
import ImagePicker from 'react-native-image-crop-picker';

import Config from '../../config/index';
import { Colors, Metrics } from '../../theme';
import { Loading, ToastService, MyAlert } from '../../component';
import Http from '../../utils/HttpPost';
import HttpFrom from '../../utils/HttpFrom';


class MyHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      myAlert: false,
      myAlertTile: '提示',
      myAlertMsg: '您还未进行实名认证，请在实名认证通过后再进行该操作。',
      fansNum: 0,
      focusNum: 0,
    }
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    console.log('user:', this.props.user)

    Http('get', `/api/artist/fans/list/1/${10}`).then(res => {
      console.log(res.data.list)
      if (res.code === 200) {
        this.setState({ fansNum: res.data.total_count })
      }
    })

    Http('get', `/api/artist/collect/list/1/${10}`).then(res => {
      if (res.code === 200) {
        this.setState({ focusNum: res.data.total_count })
      }
    })
  }


  //  修改头像
	uploadFaceFunc() {
		let _this = this;
		ImagePicker.openPicker({
			width: 500,
			height: 500,
			cropping: true,
			compressImageQuality: 0.8,
			mediaType: 'photo'
		}).then(image => {
			this.setState({ isLoading: true })

      console.log('image.mime', image)

      if (image) {
              console.log('image::', image)
              this.setState({ isLoading: true })
              HttpFrom.imgUpData(image.path, image.mime, image.filename).then(res => {
                _this.setState({ isLoading: false })
                if (res.code == 200) {
                  // this.setState({upImg: res.data.name})
                  console.log('adasdada', res.data.name)
                  this.changeUserFaceFunc({avatar: res.data.name })
                }
              }).catch(err=>{
                  console.log('请求失败', err)
                  _this.setState({ isLoading: false })
              })
        }
		});

	}

  // 修改用户数据
	changeUserFaceFunc(obj = {}) {
		Http('put', "/users/profile", obj).then(res => {
			this.setState({ isLoading: false })
			if (res.code === 200) {
				this.props.setUserInfo({ avatar: obj.avatar });
			}
		})
	}



  render() {
    return (
      <View style={Styles.container}>
        {/* 顶部背景 */}
        <ImageBackground style={Styles.userBackImg} source={require('../../asserts/images/user/icon_intro_bg.png')} resizeMode='stretch'>
        <TouchableOpacity onPress={() => { this.uploadFaceFunc() }}> 
          <FastImage style={Styles.headerPortrait} source={this.props.user.avatar ? { uri: Config.File_PATH + this.props.user.avatar } : require('../../asserts/images/user/plc_user.png')} />
        </TouchableOpacity>
          
          <View style={Styles.userNickCont}>
                <TouchableOpacity onPress={() => { this.props.navigation.push('UserChange', { type: 1 }) }} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                  <Text style={Styles.userNickText}>{this.props.user.name || '暗忍'}</Text>
                  <Image style={Styles.userNickEditIcon} source={require('../../asserts/images/user/icon_mine_edit.png')} resizeMode='contain' />
                </TouchableOpacity>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30}}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('MyFocus')} style={{justifyContent:'center', alignItems: 'center', marginHorizontal: 40}}>
                    <Text style={{color: Colors.bai, fontSize: 14, fontWeight: 'bold'}}>{this.state.focusNum}</Text>
                    <Text style={{color: Colors.huiCc, fontSize: 13}}>我的关注</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.props.navigation.navigate('MyFans')} style={{justifyContent:'center', alignItems: 'center', marginHorizontal: 40}}>
                    <Text style={{color: Colors.bai, fontSize: 14, fontWeight: 'bold'}}>{this.state.fansNum}</Text>
                    <Text style={{color: Colors.huiCc, fontSize: 13}}>我的粉丝</Text>
                  </TouchableOpacity>
              </View>
        </ImageBackground>
        
        {/* 个人简介 */}
        <View style={{ flex: 1, backgroundColor: Colors.huiF5 }}>
          <View style={{ marginTop: 8, backgroundColor: Colors.bai, paddingBottom: 20, paddingHorizontal: 10 }}>
            <Text style={{ lineHeight: 50, fontSize: Metrics.fontSize15, fontWeight: 'bold' }}>简介</Text>
            <TouchableOpacity onPress={() => { this.props.navigation.push('UserChange', { type: 2 }) }} style={{ borderWidth: 1, borderColor: Colors.huiCc, borderRadius: 10, borderStyle: 'dashed', }}>
              <Text style={Styles.inputText}>
                {
                  this.props.user.desc ? this.props.user.desc : '这个人没有简介'
                }
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 8, backgroundColor: Colors.bai, paddingBottom: 20, paddingHorizontal: 10 }}>
            <Text style={{ lineHeight: 50, fontSize: Metrics.fontSize15, fontWeight: 'bold' }}>基本信息</Text>
            <TouchableOpacity onPress={() => { this.props.navigation.push('UserChange', { type: 3 }) }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
              <Text style={{color: Colors.hui99, fontSize: 14}}>
                性别
              </Text>
              <Text style={{marginLeft: 30, color: Colors.hui33, fontSize: 14}}>
                {
                  this.props.user.gender == 2? '女': '男'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        




      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
  setUserInfo: payload => dispatch({ type: 'SET_USERINFO', payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(MyHome);

const Styles = StyleSheet.create({
  headerPortrait: { width: Metrics.px2dp(150), height: Metrics.px2dp(150), borderRadius: Metrics.px2dp(150), marginTop: -10 },
  userNickCont: { },
  userNickText: { fontSize: Metrics.fontSize20, color: Colors.bai },
  userNickEditIcon: { width: 25, height: 25 },
  itemsCont: { backgroundColor: Colors.bai, marginBottom: 8, paddingVertical: 15, paddingHorizontal: 10 },
  myColumn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  imgUrl: { width: Metrics.px2dpi(300), height: Metrics.px2dpi(300), },
  itemRightIcon: { width: 23, height: 23, marginRight: 10 },
  isShowText: { color: Colors.subject },
  zhamshiText: { color: Colors.bai, fontSize: Metrics.fontSize12 },
inputText: { textAlignVertical: 'top', height: 110, lineHeight: 52, paddingHorizontal: 10, fontSize: Metrics.fontSize16 },

  userBackImg: {
    paddingVertical: 30,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  inviteIcon: {
    width: Metrics.px2dpi(915),
    height: Metrics.px2dpi(198),
  },
  headerTitle: {
    fontSize: 28,
    color: Colors.subjectQian,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 18,
    color: Colors.subject,
    marginTop: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  iconLabel: {
    fontSize: 12,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: '#f0e6d6',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    color: '#8a6d3b',
  },
  darkButton: {
    backgroundColor: '#333',
  },
  darkButtonText: {
    color: '#fff',
  },
});
