import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, RefreshControl, StatusBar, ImageBackground, Image, Text, Pressable } from 'react-native';
import { View, Toast } from 'native-base';
import Icons from 'react-native-vector-icons/AntDesign';
import { connect } from 'react-redux';

import FastImage from 'react-native-fast-image';
import Config from '../config/index';
import { Button, Icon } from 'react-native-elements';
import { Loading, MyAlert } from '../component';
import { Colors, Metrics } from '../theme';
import Http from '../utils/HttpPost';

class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      myAlert: false,
      showDonateModal: false,
      fansNum: 0,
      focusNum: 0,
    }
  }


  componentDidMount() {
    // // 监听 Tab 页面的 focus 和 blur 事件
    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      // 页面获得焦点时更新状态栏样式
      StatusBar.setBackgroundColor('#fff');
    });

    this.unsubscribeBlur = this.props.navigation.addListener('blur', () => {
      // 页面失去焦点时恢复状态栏样式
      StatusBar.setBackgroundColor('#fff');
    });

    // this.initFunc()
  }

  initFunc() {

    Http('get', `/api/user/mine`, {

    }).then(res => {
      this.setState({ isLoading: false, refreshLoading: false })
      console.log('mine:', res.data)
      if (res.code === 200) {
        this.props.setUserInfo(res.data);
      }
    })


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


  refreshFunc(params) {
    console.log('refreshFuncrefreshFunc', this.props.user)
    return;
    this.initFunc()
  }

  componentWillUnmount() {
    // 在页面卸载时移除事件监听，防止内存泄漏
    if (this.unsubscribeFocus) this.unsubscribeFocus();
    if (this.unsubscribeBlur) this.unsubscribeBlur();
  }

  UNSAFE_componentWillMount() {

  }

  // componentDidMount() {
  //   console.log('componentDidMountcomponentDidMount', this.props.user)
  //   const { isLogged, navigation } = this.props;
  //   // 检查是否已登录
  //   if (!isLogged) {
  //     // 如果未登录，跳转到登录界面
  //     navigation.navigate('Login');
  //   }
  // }

  goLoginFunc() {
    const { isLogged, navigation } = this.props;
    navigation.navigate('Login');
  }


  render() {
    return (
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl
          refreshing={this.state.refreshLoading}
          onRefresh={() => {
            this.refreshFunc()
          }}
        ></RefreshControl>}
      >
        <Loading showLoading={this.state.refreshLoading ? false : this.state.isLoading} />
        <MyAlert
          visible={this.state.myAlert}
          title="提示"
          message="该功能开发中 敬请期待..."
          buttons={[{ title: '好的', onPress: () => { this.setState({ myAlert: false }) } }]}
        />

        <ImageBackground style={Styles.userBackImg} source={require('../asserts/images/user/icon_mine_bg.png')} resizeMode='stretch'>

          {/* 用户信息展示 */}
          <View style={Styles.userContent}>
            <TouchableOpacity style={Styles.userContentLeft} onPress={() => this.props.navigation.navigate('MyHome')}>
              <View style={Styles.headerContentNew}>
                <FastImage style={Styles.headerPortrait} source={this.props.user.avatar ? { uri: Config.File_PATH + this.props.user.avatar } : require('../asserts/images/user/plc_user.png')} />
              </View>
              <View style={Styles.userNickCont}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={Styles.userNickText}>{this.props.user.name || '用户'}</Text>
                </View>
                <Text style={Styles.userPhone}>{this.props.user.account}</Text>
              </View>
            </TouchableOpacity>
          </View>

        </ImageBackground>
        {/* 主体信息 */}
        <View style={{ paddingHorizontal: 20 }}>
          {/* 位移主体 */}
          <View style={{ marginTop: -30 }}>
            {/* 捐赠作者 */}
            <TouchableOpacity 
              style={Styles.donateCard}
              onPress={() => this.setState({ showDonateModal: true })}
            >
              <View style={Styles.donateContent}>
                <Text style={Styles.donateIcon}>❤️</Text>
                <View style={Styles.donateTextContainer}>
                  <Text style={Styles.donateTitle}>支持作者</Text>
                  <Text style={Styles.donateSubtitle}>您的支持是我们前进的动力</Text>
                </View>
              </View>
              <Icons name='right' style={Styles.donateArrow} />
            </TouchableOpacity>
            {/* 作品信息 - 列表模式 */}
            <View style={Styles.menuListContainer}>

            <TouchableOpacity 
                style={Styles.menuListItem} 
                onPress={() => { this.props.navigation.navigate('ProblemBack') }}
              >
                <View style={Styles.menuListLeft}>
                  <Image 
                    style={Styles.menuListIcon} 
                    source={require('../asserts/images/user/icon_mine_tab_work.png')} 
                    resizeMode='contain' 
                  />
                  <Text style={Styles.menuListText}>反馈与建议</Text>
                </View>
                <Icons name='right' style={Styles.menuListArrow} />
              </TouchableOpacity>

            <TouchableOpacity 
                style={Styles.menuListItem} 
                onPress={() => { this.props.navigation.navigate('PrivacyInfo') }}
              >
                <View style={Styles.menuListLeft}>
                  <Image 
                    style={Styles.menuListIcon} 
                    source={require('../asserts/images/user/icon_mine_tab_work.png')} 
                    resizeMode='contain' 
                  />
                  <Text style={Styles.menuListText}>个人信息收集清单</Text>
                </View>
                <Icons name='right' style={Styles.menuListArrow} />
              </TouchableOpacity>

              <View style={Styles.menuListDivider} />

              <TouchableOpacity 
                style={Styles.menuListItem} 
                onPress={() => { this.props.navigation.navigate('ThirdPartySDK') }}
              >
                <View style={Styles.menuListLeft}>
                  <Image 
                    style={Styles.menuListIcon} 
                    source={require('../asserts/images/user/icon_mine_tab_work.png')} 
                    resizeMode='contain' 
                  />
                  <Text style={Styles.menuListText}>第三方SDK使用说明</Text>
                </View>
                <Icons name='right' style={Styles.menuListArrow} />
              </TouchableOpacity>

             

            </View> 

            {/* 任务礼品 */}
            {/* <View style={{ marginTop: 10, backgroundColor: Colors.bai, borderRadius: 5, overflow: 'hidden', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Pressable onPress={() => this.setState({ myAlert: true })}>
                <Image style={{ width: Metrics.px2dpi(490), height: Metrics.px2dpi(192) }} source={require('../asserts/images/user/icon_mine_task.png')} resizeMode='contain' />
              </Pressable>

              <Pressable onPress={() => this.setState({ myAlert: true })}>
                <Image style={{ width: Metrics.px2dpi(490), height: Metrics.px2dpi(192) }} source={require('../asserts/images/user/icon_mine_dou.png')} resizeMode='contain' />
              </Pressable>
            </View> */}

            {/* 认证和设置 */}
            <View style={Styles.bolockCont}>
              <View style={Styles.bottonListCont}>
              <TouchableOpacity style={Styles.buttonList} onPress={() => { this.props.navigation.navigate('ChangjianWt') }}>
                  <Image style={Styles.listIcon} source={require('../asserts/images/user/wenti.png')} resizeMode='contain' />
                  <Text style={Styles.listText}>常见问题</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { this.props.navigation.navigate('GuanyuYika') }} style={Styles.buttonList}>
                  <Image style={Styles.listIcon} source={require('../asserts/images/user/icon_mine_tab_other.png')} resizeMode='contain' />
                  <Text style={Styles.listText}>关于我们</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { this.props.navigation.navigate('CausMens') }} style={Styles.buttonList}>
                  <Image style={Styles.listIcon} source={require('../asserts/images/user/icon_mine_tab_cus.png')} resizeMode='contain' />
                  <Text style={Styles.listText}>联系客服</Text>
                </TouchableOpacity>
                <TouchableOpacity style={Styles.buttonList} onPress={() => { this.props.navigation.navigate('Setting') }}>
                  <Image style={Styles.listIcon} source={require('../asserts/images/user/icon_mine_tab_set.png')} resizeMode='contain' />
                  <Text style={Styles.listText}>用户设置</Text>
                </TouchableOpacity >
              </View>
              <View style={Styles.bottonListCont}>
                
              </View>

            </View>

          </View>

        </View>

        {/* 捐赠弹窗 */}
        <MyAlert
          visible={this.state.showDonateModal}
          title="❤️ 支持作者"
          message=""
          component={
            <View style={{ alignItems: 'center', paddingVertical: 10 }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 15, textAlign: 'center' }}>
                感谢您的支持！{'\n'}扫描下方二维码即可捐赠
              </Text>
              <Image 
                style={{ width: 220, height: 220, borderRadius: 8 }} 
                source={require('../asserts/images/user/juanzeng.jpg')} 
                resizeMode='contain' 
              />
              <Text style={{ fontSize: 12, color: '#999', marginTop: 10, textAlign: 'center' }}>
                您的每一份支持都是我们前进的动力！
              </Text>
            </View>
          }
          buttons={[{ title: '关闭', onPress: () => { this.setState({ showDonateModal: false }) } }]}
        />
      </ScrollView>
    );
  }

}


const mapStateToProps = state => ({
  isLogged: state.user.isLogged,
  token: state.user.token,
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
  setUserInfo: payload => dispatch({ type: 'SET_USERINFO', payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Users);

const Styles = StyleSheet.create({
  userBackImg: { flex: 1, height: Metrics.px2dp(360) },
  userContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingLeft: 20, marginTop: 50, },
  userContentLeft: { flexDirection: "row", alignItems: "center", },
  userNickCont: { marginLeft: 18 },
  userNickText: { fontSize: 17, color: Colors.bai },
  userNickEditIcon: { width: 25, height: 25 },
  userPhone: { fontSize: Metrics.fontSize12, marginTop: 6, color: Colors.bai },
  headerPortrait: { width: Metrics.px2dp(150), height: Metrics.px2dp(150), borderRadius: Metrics.px2dp(150) },
  myHomeCont: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#EFDFBD', 
    paddingVertical: 6, 
    paddingLeft: 15, 
    paddingRight: 3, 
    borderTopLeftRadius: 20, 
    borderBottomLeftRadius: 20 
  },
  myHomeContVip: {
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  myHomeText: { 
    fontSize: Metrics.fontSize14, 
    marginRight: 5, 
    color: Colors.bai,
    fontWeight: 'bold',
  },
  vipBadge: {
    fontSize: 16,
    marginRight: 4,
  },
  inviteIcon: { width: 25, height: 25 },
  listIcon: { width: 30, height: 30 },
  listIconTop: { width: 30, height: 30 },
  listText: { fontSize: Metrics.fontSize14, color: Colors.hei2E, marginTop: 8 },
  bottonListCont: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingHorizontal: 20, paddingVertical: 10 },
  buttonList: { alignItems: 'center', width: Metrics.px2dp(120), },
  buttonListTop: { alignItems: 'center', width: Metrics.px2dp(186), },
  bolockCont: { marginTop: 10, backgroundColor: Colors.bai, borderRadius: 5, overflow: 'hidden', paddingBottom: 10 },
  
  // 列表模式样式
  menuListContainer: {
    marginTop: 10,
    backgroundColor: Colors.bai,
    borderRadius: 8,
    overflow: 'hidden',
  },
  menuListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    minHeight: 60,
  },
  menuListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuListIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  menuListText: {
    fontSize: Metrics.fontSize14,
    color: Colors.hei2E,
  },
  menuListArrow: {
    fontSize: 16,
    color: Colors.huiCc,
  },
  menuListDivider: {
    height: 1,
    backgroundColor: Colors.huiF5,
    marginLeft: 51, // 对齐文字，留出图标+间距的空间
  },
  donateCard: {
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFB6C1',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  donateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  donateIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  donateTextContainer: {
    flex: 1,
  },
  donateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 4,
  },
  donateSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  donateArrow: {
    fontSize: 20,
    color: '#FFB6C1',
  },
});