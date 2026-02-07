import * as React from 'react';
import { StyleSheet, Platform, NativeModules, BackHandler, Alert, Linking, Image, Modal, TouchableOpacity,  View, Text, DeviceEventEmitter} from 'react-native';
// 配置组件
import { connect } from 'react-redux';
import { NavigationContainer, useNavigation, } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators  } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// 组件库
import SplashScreen from 'react-native-splash-screen';
import Onboarding from 'react-native-onboarding-swiper';

// 工具
import px2dp from './utils/Ratio';
import { isIPhoneXFooter } from "./utils/iphoneXHelper";
import { initializeApp, checkUpdateStatus } from './utils/AppInitService';

// 首页类路由
import HomeScreen from "./view/Home"; // 首页
import FoundScreen from "./view/Found"; // 发现
import PublishScreen from "./view/Publish"; // 发布
import BaibaoScreen from "./view/Baibao"; // 百宝箱
import DynamicScreen from "./view/Dynamic"; // 动态
import UsersScreen from "./view/Users"; // 用户

// 登录类路由
import LoginScreen from "./view/user/Login"; // 登录
import RegisterScreen from "./view/user/Register"; // 注册
import ForgetPasswordScreen from  "./view/user/ForgetPassword"; // 忘记Miami

// 页面路由
import Routes from './Routes';

import PublishModal from './component/PublishModal';

const navigationRef = React.createRef();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();



let iconPath = './asserts/images/tabbar/';
let routeIcon = [
  {
    normal: require(iconPath + 'icon_main_tab_home_unselect.png'),
    selected: require(iconPath + 'icon_main_tab_home_select.png')
  }, {
    normal: require(iconPath + 'icon_main_tab_found_unselect.png'),
    selected: require(iconPath + 'icon_main_tab_found_select.png')
  },
  {
    normal: require(iconPath + 'icon_main_tab_sub_unselect.png'),
    selected: require(iconPath + 'icon_main_tab_sub_unselect.png')
  },
  {
    normal: require(iconPath + 'icon_main_tab_hot_unselect.png'),
    selected: require(iconPath + 'icon_main_tab_hot_select.png')
  },
  {
    normal: require(iconPath + 'icon_main_tab_mine_unselect.png'),
    selected: require(iconPath + 'icon_main_tab_mine_select.png')
  },
]


function renderScreen() {
  return Routes.map((value, index) => {
    return (
      <Stack.Screen
        key={index}
        name={value.name}
        component={value.screen}
        options={value.options? value.options: {
          title: value.title,
          headerShown: false,
          headerBackTitle: '',
        } }
      />
    )
  })
}

function renderLoginScreen() {
  return (
    <>
    <Stack.Screen
        name={"Publish"}
        component={PublishScreen}
        options={{
          title: "",
          headerShown: false,
          gestureEnabled: false,
          headerBackTitle: '',
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerStyle: {
            elevation: 0, // Android 去掉部阴影
            shadowOpacity: 0, // iOS 去掉头部阴影
            borderBottomWidth: 0, // iOS 去掉头部底部线
          },
        }}
      />
      <Stack.Screen
        name={"Login"}
        component={LoginScreen}
        options={{
          title: "",
          gestureEnabled: false,
          headerBackTitle: '',
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerStyle: {
            elevation: 0, // Android 去掉部阴影
            shadowOpacity: 0, // iOS 去掉头部阴影
            borderBottomWidth: 0, // iOS 去掉头部底部线
          },
        }}
      />
      <Stack.Screen
        name={"Register"}
        component={RegisterScreen}
        options={{
          title: "",
          headerBackTitle: '',
          gestureEnabled: false,
          animation: 'slide_from_right',
          headerStyle: {
            elevation: 0, // Android 去掉头部阴影
            shadowOpacity: 0, // iOS 去掉头部阴影
            borderBottomWidth: 0, // iOS 去掉头部底部线
          },
        }}
      />
      <Stack.Screen
        name={"ForgetPassword"}
        component={ForgetPasswordScreen}
        options={{
          title: "",
          headerBackTitle: '',
          gestureEnabled: false,
          animation: 'slide_from_right',
          headerStyle: {
            elevation: 0, // Android 去掉头部阴影
            shadowOpacity: 0, // iOS 去掉头部阴影
            borderBottomWidth: 0, // iOS 去掉头部底部线
          },
        }}
      />
      
    </>
  )
}

function MyTabBar({ state, descriptors, navigation }) {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#fff',
      paddingBottom: Platform.OS === 'ios' ? 28 : 8,
      borderTopWidth: 0.5,
      borderTopColor: '#E5E5E5'
    }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          // 如果是发布按钮，通过事件触发弹窗
          if (route.name === 'Publish') {
            DeviceEventEmitter.emit('showPublishModal');
            return;
          }

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center' }}
          >
            <View>
              <Image
                style={Styles.tabIcon}
                source={isFocused ? routeIcon[index].selected : routeIcon[index].normal}
              />
            </View>
            <Text style={[Styles.tabLabel, { color: isFocused ? '#F9BBC6' : '#999999' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}


function MainTabCom() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={props => <MyTabBar {...props} />}
    >
      <Tab.Screen
        name={"Home"}
        component={HomeScreen}
        options={{
          title: "首页",
          headerShown: false
        }}
      />
      <Tab.Screen
        name={"Found"}
        component={FoundScreen}
        options={{
          title: "棋盘",
          headerShown: false
        }}
      />
      <Tab.Screen
        name={"Baibao"}
        component={BaibaoScreen}
        options={{
          title: "百宝箱",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={"Dynamic"}
        component={DynamicScreen}
        options={{
          title: "动态",
          headerShown: false
        }}
      />
      <Tab.Screen
        name={"Users"}
        component={UsersScreen}
        options={{
          title: "我的",
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}


class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showOnboarding: false,
      showUpdateModal: false,
      updateInfo: null,
    }
    this.publishModalRef = React.createRef();
  }

  async componentDidMount() {
    // 初始化 App，检查版本更新
    await this.checkAppVersion();

    if (!this.props.global.isFirstApp) {
      SplashScreen.hide();
    }
    // 监听发布弹窗事件
    this.publishListener = DeviceEventEmitter.addListener('showPublishModal', this.handlePublishPress);
  }

  // 检查 App 版本
  async checkAppVersion() {
    try {
      const result = await initializeApp();
      
      if (result.success && result.data) {
        const updateStatus = checkUpdateStatus(result.data);
        
        // 如果不能使用或需要强制更新
        if (!updateStatus.canUse || updateStatus.forceUpdate) {
          this.setState({
            showUpdateModal: true,
            updateInfo: updateStatus,
          });
        } else if (updateStatus.needUpdate) {
          // 可选更新，显示提示但允许关闭
          this.setState({
            showUpdateModal: true,
            updateInfo: updateStatus,
          });
        }
      }
    } catch (error) {
      console.error('版本检查失败:', error);
      // 版本检查失败不影响 app 使用
    }
  }

  componentWillUnmount() {
    // 移除事件监听
    if (this.publishListener && this.publishListener.remove) {
      this.publishListener.remove();
    }
  }

  // 做一些跳转事情
  doDispatchRouterFunc(rName, params) {
    navigationRef.current?.navigate(rName, params);
  }

  doLinkFunc(uri) {
    Linking.openURL(uri).catch(err => console.error('An error occurred', err));
  }

  acceptAgreement(){
    this.props.setGlobalInfo({ isFirstApp: false });
    SplashScreen.hide(); 
    this.setState({showOnboarding: true})
  };

   jujueFunc() {
    BackHandler.exitApp()
  }

  // 引导页完成或跳过
  completeOnboarding = () => {
    // console.log('doDispatchRouterFunc')
    this.setState({ showOnboarding: false });
  };

  renderCustomDot = ({ selected }) => {
    return (
      <View
        style={[
          Styles.dot,
          selected ? Styles.activeDot : Styles.inactiveDot,
        ]}
      />
    );
  };

  handlePublishPress = () => {
    this.publishModalRef.current.show();
  };

  handleModalSelect = (type) => {
    switch(type) {
      case 'register':
        navigationRef.current?.navigate('CopyrightRegister');
        break;
      case 'copyright':
        navigationRef.current?.navigate('CopyrightEvidence');
        break;
      case 'publish':
        navigationRef.current?.navigate('Publish');
        break;
    }
  };

  // 处理更新按钮点击
  handleUpdatePress = () => {
    const { updateInfo } = this.state;
    if (updateInfo && updateInfo.downloadUrl) {
      Linking.openURL(updateInfo.downloadUrl).catch(err => 
        console.error('打开下载链接失败:', err)
      );
    }
  };

  // 处理跳过更新（仅非强制更新可用）
  handleSkipUpdate = () => {
    const { updateInfo } = this.state;
    // 只有非强制更新才能跳过
    if (updateInfo && !updateInfo.forceUpdate && updateInfo.canUse) {
      this.setState({ showUpdateModal: false });
    }
  };

  render() {
    return (
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName={"MainTab"}
        >

          
          <Stack.Screen
            name={"MainTab"}
            component={MainTabCom}
            options={{
              headerShown: false,
              headerBackTitle: '',
            }}
          />
          {renderLoginScreen()}
          {renderScreen()}
        </Stack.Navigator>
        {/* 协议页面 */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.props.global.isFirstApp}
        >
          <View style={Styles.modalBackground}>
            <View style={Styles.modalContent}>
              <View style={{padding: 20}}>
                <Text style={{ textAlign:'center', fontSize: 16, color: '#B29F80'}}>
                  用户协议和隐私协议
                </Text>
                <Text style={{ textAlign: 'left', fontSize: 14, color: '#000000', marginTop: 30}}>
                  感谢您使用同城有约非常重视对您的个人信息保护，在您使用服务之前，您可阅读
                  <Text onPress={() => { this.doLinkFunc('http://tongchengyouyue.com/tongchengyouyue/agreement') }} style={{ color: "#B29F80" }}>
                    《用户协议》
                  </Text>
                  及
                  <Text onPress={() => { this.doLinkFunc('http://tongchengyouyue.com/tongchengyouyue/privacy') }} style={{ color: "#B29F80" }}>
                    《隐私协议》
                  </Text>
                  了解详细信息。如您同意，请点击"同意"开始接受我们的服务。
                </Text>
              </View>
              <View style={{ flexDirection:'row', borderTopColor: '#D7D7D7', borderTopWidth: 1, marginTop: 10 }}>
                <TouchableOpacity style={Styles.button} onPress={ ()=> this.jujueFunc() }>
                  <Text style={[Styles.buttonText, {color: '#999999'}]}>暂不使用</Text>
                </TouchableOpacity>
                <View style={{width:1, height: '100%', backgroundColor: '#D7D7D7' }}>
                  <Text>{/* 分隔线 */}</Text>
                </View>
                <TouchableOpacity style={Styles.button} onPress={ ()=>this.acceptAgreement() }>
                  <Text style={[Styles.buttonText, {color: '#B29F80'}]}>同意</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* 引导页 */}
        {this.state.showOnboarding && (
          <Modal
          animationType="slide"
          transparent={true}
        >
            <Onboarding
            pages={[
              {
                backgroundColor: '#fff',
                image: <Image source={require('./asserts/images/home/guide0.png')} resizeMode='center'/>,
                title: '开启同城约会',
                subtitle: '同城有约，让约会更简单',
              },
              {
                backgroundColor: '#fff',
                image: <Image source={require('./asserts/images/home/guide1.png')} resizeMode='center' />,
                title: '同城邂逅浪漫相约',
                subtitle: '发现身边有趣的人，开启美好邂逅',
              },
              // {
              //   backgroundColor: '#fff',
              //   image: <Image source={require('./asserts/images/home/guide2.png')} resizeMode='center'/>,
              //   title: '同城交友派对',
              //   subtitle: '派对狂欢，释放自我，结识志同道合的朋友',
              // },
            ]}
            showSkip={false}
            showNext={false}
            bottomBarHighlight={false}
            bottomBarColor="transparent"
            onDone={this.completeOnboarding} // 用户完成引导页
            onSkip={this.completeOnboarding} // 用户跳过引导页
            DotComponent={this.renderCustomDot}
          />
          </Modal>
        )}
        {/* 发布引导 */}
        <PublishModal 
          ref={this.publishModalRef}
          onSelect={this.handleModalSelect}
        />
        
        {/* 版本更新弹窗 */}
        {this.state.showUpdateModal && this.state.updateInfo && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.showUpdateModal}
            onRequestClose={() => {
              // 只有非强制更新才能关闭
              if (!this.state.updateInfo.forceUpdate && this.state.updateInfo.canUse) {
                this.handleSkipUpdate();
              }
            }}
          >
            <View style={Styles.modalBackground}>
              <View style={Styles.updateModalContent}>
                <View style={Styles.updateHeader}>
                  <Text style={Styles.updateTitle}>
                    {this.state.updateInfo.forceUpdate ? '发现新版本（必须更新）' : '发现新版本'}
                  </Text>
                </View>
                
                <View style={Styles.updateBody}>
                  <View style={Styles.versionInfo}>
                    <Text style={Styles.versionLabel}>当前版本：</Text>
                    <Text style={Styles.versionText}>{this.state.updateInfo.currentVersion}</Text>
                  </View>
                  <View style={Styles.versionInfo}>
                    <Text style={Styles.versionLabel}>最新版本：</Text>
                    <Text style={[Styles.versionText, { color: '#CB9869' }]}>
                      {this.state.updateInfo.latestVersion}
                    </Text>
                  </View>
                  <View style={Styles.updateMessage}>
                    <Text style={Styles.messageText}>
                      {this.state.updateInfo.message || '请更新到最新版本以获得更好的体验'}
                    </Text>
                  </View>
                  
                  {this.state.updateInfo.forceUpdate && (
                    <View style={Styles.forceUpdateWarning}>
                      <Text style={Styles.warningText}>⚠️ 当前版本无法继续使用，请立即更新</Text>
                    </View>
                  )}
                </View>

                <View style={Styles.updateFooter}>
                  {!this.state.updateInfo.forceUpdate && this.state.updateInfo.canUse && (
                    <TouchableOpacity 
                      style={[Styles.updateButton, Styles.skipButton]} 
                      onPress={this.handleSkipUpdate}
                    >
                      <Text style={Styles.skipButtonText}>暂不更新</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={[
                      Styles.updateButton, 
                      Styles.confirmButton,
                      (!this.state.updateInfo.forceUpdate && this.state.updateInfo.canUse) ? {} : { flex: 1 }
                    ]} 
                    onPress={this.handleUpdatePress}
                  >
                    <Text style={Styles.confirmButtonText}>
                      {this.state.updateInfo.forceUpdate ? '立即更新' : '去更新'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </NavigationContainer>
    );
  }
}

const mapStateToProps = state => ({
  global: state.global,
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
  setUserInfo: payload => dispatch({ type: 'SET_USERINFO', payload }),
  setGlobalInfo: globalInfo => dispatch({ type: 'SET_GLOBALINFO', payload: globalInfo }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Root)

const Styles = StyleSheet.create({
  tabIcon: {
    width: px2dp(48),
    height: px2dp(44),
    marginTop: px2dp(6),
  },
  tabLabel: {
    marginTop: px2dp(1),
    fontSize: 12
  },
  Texts: {
    color: '#333333'
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '80%',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },

  dot: {
    marginHorizontal: 5,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#B29F80', // 激活状态的圆点颜色
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#BDBDBD', // 非激活状态的圆点颜色
  },

  // 版本更新弹窗样式
  updateModalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '85%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  updateHeader: {
    backgroundColor: '#CB9869',
    padding: 20,
    alignItems: 'center',
  },
  updateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  updateBody: {
    padding: 20,
  },
  versionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  versionLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  versionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  updateMessage: {
    marginTop: 15,
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  forceUpdateWarning: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    fontSize: 13,
    color: '#E65100',
    fontWeight: '500',
  },
  updateFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  updateButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#999',
  },
  confirmButton: {
    backgroundColor: '#CB9869',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
})
