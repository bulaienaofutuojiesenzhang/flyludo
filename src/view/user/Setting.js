import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Share,
  Pressable,
  Clipboard,
} from 'react-native';
import { View, Toast, Text, Modal, FormControl, Input, Button } from 'native-base';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import { CommonActions } from '@react-navigation/native';

import { ToastService, Loading } from '../../component';
import { Colors, Metrics } from '../../theme';
import Config from '../../config/index';
import AsyncStorage from '../../utils/AsyncStorage';
import Http from '../../utils/HttpPost';

function maskAccount(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  if (s.includes('@')) {
    const [name, domain] = s.split('@');
    if (!domain) return s;
    const head = name.slice(0, 2);
    return `${head}${name.length > 2 ? '***' : ''}@${domain}`;
  }
  if (/^\d{7,}$/.test(s)) {
    return `${s.slice(0, 3)}****${s.slice(-4)}`;
  }
  if (s.length <= 4) return s;
  return `${s.slice(0, 2)}***${s.slice(-2)}`;
}

class Setting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      dizhiurl: '',
    };
  }

  componentDidMount() {
    this.refreshProfile();
  }

  refreshProfile = () => {
    Http('get', '/users/profile')
      .then((res) => {
        if (res && Number(res.code) === 200 && res.data) {
          this.props.setUserInfo(res.data);
        }
      })
      .catch(() => {});
  };

  resolveUserId = (user = {}) => {
    const raw =
      user.userId ??
      user.id ??
      user.uid ??
      (user.userInfo && (user.userInfo.userId ?? user.userInfo.id));
    if (raw === undefined || raw === null || raw === '') return '';
    return String(raw);
  };

  toNavigateFunc(uri) {
    this.props.navigation.navigate(uri);
  }

  copyText = (label, value) => {
    const v = String(value || '').trim();
    if (!v) {
      Toast.show({ title: '暂无内容可复制', placement: 'top' });
      return;
    }
    try {
      Clipboard.setString(v);
      Toast.show({ title: `${label}已复制`, placement: 'top' });
    } catch (_) {
      Toast.show({ title: '复制失败', placement: 'top' });
    }
  };

  async shareFunc() {
    const str = 'http://daoyikeji.com/flyingchess/';
    try {
      await Share.share({
        title: '同城有约',
        message: '就是同城有约都用它',
        url: str,
      });
    } catch (error) {
      Toast.show({
        title: '分享失败!' + error.message,
        type: 'warning',
      });
    }
  }

  loginOutFunc() {
    this.props.logout();
    AsyncStorage.setItem('jwToken', '').then(() => {
      this.props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    });
  }

  setShowModal(bloo) {
    this.setState({ showModal: bloo });
  }

  changgePublish() {
    AsyncStorage.setItem('testUrl', this.state.dizhiurl).then(() => {
      this.setShowModal(false);
    });
  }

  testChanggePublish() {
    Http('get', this.state.dizhiurl + `/api/user/test`).then((res) => {
      ToastService.showToast({
        title: res.msg,
      });
    });
  }

  notifySummary() {
    const g = this.props.global || {};
    const sound = g.lingsheng !== false;
    const vibe = g.zhendong !== false;
    if (!sound && !vibe) return '已关闭';
    if (sound && vibe) return '铃声+震动';
    if (sound) return '仅铃声';
    return '仅震动';
  }

  render() {
    const user = this.props.user || {};
    const userId = this.resolveUserId(user);
    const account = user.account || user.phone || user.email || '';
    const nickName = user.name || '';
    const accountShow = account ? maskAccount(account) : '未绑定';

    return (
      <View style={{ flex: 1 }}>
        <Loading showLoading={this.state.isLoading} />
        <View style={Styles.container}>
          <View>
            <View style={Styles.sectionHead}>
              <Text style={Styles.sectionTitle}>账号信息</Text>
            </View>
            <View style={Styles.blockBack}>
              <TouchableOpacity
                style={Styles.cardStyle}
                activeOpacity={0.7}
                onPress={() => this.copyText('账号', account || userId)}
              >
                <Text style={Styles.labelTxt}>账号</Text>
                <View style={Styles.rightRow}>
                  <Text style={Styles.valueTxt}>{accountShow}</Text>
                  <Icon name="copy" style={Styles.copyIcon} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={Styles.cardStyle}
                activeOpacity={0.7}
                onPress={() => this.copyText('用户ID', userId)}
              >
                <Text style={Styles.labelTxt}>用户ID</Text>
                <View style={Styles.rightRow}>
                  <Text style={Styles.valueTxt}>{userId || '-'}</Text>
                  <Icon name="copy" style={Styles.copyIcon} />
                </View>
              </TouchableOpacity>
              <View style={[Styles.cardStyle, { borderBottomWidth: 0 }]}>
                <Text style={Styles.labelTxt}>昵称</Text>
                <Text style={Styles.valueTxt}>{nickName || '-'}</Text>
              </View>
            </View>

            <View style={Styles.sectionHead}>
              <Text style={Styles.sectionTitle}>通用</Text>
            </View>
            <View style={Styles.blockBack}>
              <TouchableOpacity
                style={Styles.cardStyle}
                onPress={() => this.toNavigateFunc('MessageNotify')}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={Styles.labelTxt}>消息通知</Text>
                  <Text style={Styles.hintTxt}>铃声、震动与系统通知</Text>
                </View>
                <Text style={Styles.summaryTxt}>{this.notifySummary()}</Text>
                <Icon name="angle-right" style={Styles.rightIcons} />
              </TouchableOpacity>
              <TouchableOpacity
                style={Styles.cardStyle}
                onPress={() => this.toNavigateFunc('ForgetPassword')}
              >
                <Text style={Styles.labelTxt}>忘记密码</Text>
                <Icon name="angle-right" style={Styles.rightIcons} />
              </TouchableOpacity>
              <TouchableOpacity style={[Styles.cardStyle, { borderBottomWidth: 0 }]}>
                <Text style={Styles.labelTxt}>版本</Text>
                <Text style={Styles.valueTxt}>
                  {`${Config.Env === 'dev' ? Config.Env + ' ' : ''}${Config.Version.version}.${Config.Version.versionNum}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginTop: 8, marginBottom: 18 }}>
            <View style={Styles.signOutView}>
              <TouchableOpacity onPress={() => this.loginOutFunc()}>
                <View style={Styles.loginBtn}>
                  <Text style={{ fontSize: 12, padding: 12, color: Colors.bai }}>退出登录</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={Styles.textCongh}>
              <Text
                style={{ color: Colors.subject, fontSize: 12, textDecorationLine: 'underline' }}
                onPress={() => this.toNavigateFunc('Yonghuxieyi')}
              >
                用户协议{' '}
              </Text>
              <Text style={{ color: Colors.subject, fontSize: 12 }}> | </Text>
              <Text
                style={{ color: Colors.subject, fontSize: 12, textDecorationLine: 'underline' }}
                onPress={() => this.toNavigateFunc('Yinsixieyi')}
              >
                {' '}
                隐私政策
              </Text>
            </View>
            <Pressable
              onLongPress={() => {
                this.setShowModal(true);
              }}
            >
              <Text
                style={{
                  color: Colors.subject,
                  fontSize: 12,
                  textAlign: 'center',
                  marginTop: 10,
                }}
              >
                同城有约 Copyright 2019-2026.All Right Reserved.
              </Text>
            </Pressable>
          </View>
        </View>

        <Modal isOpen={this.state.showModal} onClose={() => this.setShowModal(false)}>
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>Developer Options</Modal.Header>
            <Modal.Body>
              <FormControl mb="5">
                <FormControl.Label>Config Url</FormControl.Label>
                <Input onChangeText={(value) => this.setState({ dizhiurl: value })} />
              </FormControl>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button
                  variant="ghost"
                  colorScheme="blueGray"
                  onPress={() => {
                    this.testChanggePublish();
                  }}
                >
                  Test
                </Button>
                <Button
                  onPress={() => {
                    this.changgePublish();
                  }}
                >
                  Save
                </Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  isLogged: state.user.isLogged,
  userId: state.user.userId || state.user.id,
  user: state.user,
  global: state.global,
});

const mapDispatchToProps = (dispatch) => ({
  logout: () => dispatch({ type: 'LOGOUT' }),
  setUserInfo: (payload) => dispatch({ type: 'SET_USERINFO', payload }),
  setGlobalInfo: (globalInfo) => dispatch({ type: 'SET_GLOBALINFO', payload: globalInfo }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Setting);

const Styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', backgroundColor: '#F5F5F7' },
  sectionHead: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  blockBack: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardStyle: {
    minHeight: 50,
    paddingLeft: 14,
    paddingRight: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.huiF5,
  },
  labelTxt: { color: '#333', fontSize: 14 },
  hintTxt: { color: '#999', fontSize: 11, marginTop: 2 },
  valueTxt: { color: '#8E8E93', fontSize: 14, maxWidth: 200, textAlign: 'right' },
  summaryTxt: { color: '#8E8E93', fontSize: 13, marginRight: 6 },
  rightRow: { flexDirection: 'row', alignItems: 'center' },
  copyIcon: { color: '#C0C0C8', fontSize: 14, marginLeft: 8 },
  rightIcons: { color: '#aab9ca', fontSize: 20 },
  signOutView: { marginTop: 58, justifyContent: 'center', alignItems: 'center' },
  textCongh: {
    flexDirection: 'row',
    marginTop: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtn: {
    width: Metrics.screenWidth * 0.6,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.subject,
  },
});
