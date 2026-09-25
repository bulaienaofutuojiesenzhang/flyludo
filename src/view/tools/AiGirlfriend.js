import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Linking,
  BackHandler,
  SafeAreaView,
} from 'react-native';
import { Toast } from 'native-base';
import { WebView } from 'react-native-webview';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Loading } from '../../component';
import { Colors } from '../../theme';
import Http from '../../utils/HttpPost';

const isAndroid = Platform.OS === 'android';

/**
 * AI 女友（第三方 H5）
 * 进入 → /ai-proxy/aigf/enter 拿 h5_url
 * 退出 → /ai-proxy/aigf/exit 结算（返回/卸载都必须调用）
 * 余额字段：user.yuanbao
 */
class AiGirlfriend extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      h5Url: '',
      asset: 0,
      yuanbao: Math.floor(Number(props.user?.yuanbao) || 0),
      errorMsg: '',
      entered: false,
      showTip: false,
    };
    this.sessionId = '';
    this._needExit = false;
    this._exiting = false;
  }

  componentDidMount() {
    this.enterFunc();
    this.unsubscribeBeforeRemove = this.props.navigation.addListener(
      'beforeRemove',
      () => {
        this.ensureExit();
      }
    );
    if (isAndroid) {
      this.backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          this.onBack();
          return true;
        }
      );
    }
  }

  componentWillUnmount() {
    if (this.unsubscribeBeforeRemove) this.unsubscribeBeforeRemove();
    if (this.backHandler) this.backHandler.remove();
    if (this.tipTimer) clearTimeout(this.tipTimer);
    this.ensureExit();
  }

  ensureExit = () => {
    if (!this._needExit || this._exiting) return;
    this._needExit = false;
    this._exiting = true;
    this.exitInBackground();
  };

  enterFunc = () => {
    this.setState({ isLoading: true, errorMsg: '', showTip: false });
    if (this.tipTimer) clearTimeout(this.tipTimer);
    Http('post', '/ai-proxy/aigf/enter', {})
      .then((res) => {
        if (res.code === 200 && res.data?.h5_url) {
          const remain = Math.floor(
            Number(res.data.yuanbao ?? res.data.myZuanshi ?? 0)
          );
          // tongcheng：1 元 = 100 元宝；优先用 holdYuanbao
          const bringIn = Math.round(
            Number(
              res.data.holdYuanbao ??
                (Number(res.data.asset) || 0) * 100
            ) || 0
          );
          this.sessionId = String(
            res.data.sessionId || res.data.session_id || ''
          );
          this._needExit = true;
          this._exiting = false;
          // Redux 同步为预扣后余额，避免未退出前其它页读到旧余额
          if (!Number.isNaN(remain)) {
            this.props.setUserInfo({ yuanbao: remain });
          }
          this.setState({
            isLoading: false,
            h5Url: res.data.h5_url,
            asset: res.data.asset || 0,
            yuanbao: remain + bringIn,
            entered: true,
            showTip: true,
          });
          this.tipTimer = setTimeout(() => {
            this.setState({ showTip: false });
          }, 3000);
        } else if (
          res.code === 10401 ||
          res.code === 600 ||
          res.code === 3001
        ) {
          this._needExit = false;
          this.setState({
            isLoading: false,
            errorMsg: res.message || res.msg || '钻石不足，请先充值',
          });
        } else {
          this._needExit = false;
          this.setState({
            isLoading: false,
            errorMsg: res.message || res.msg || 'AI女友服务繁忙，请稍后再试',
          });
        }
      })
      .catch(() => {
        this._needExit = false;
        this.setState({
          isLoading: false,
          errorMsg: '网络请求失败，请检查网络',
        });
      });
  };

  exitInBackground = () => {
    const body = {};
    if (this.sessionId) body.sessionId = this.sessionId;
    Http('post', '/ai-proxy/aigf/exit', body)
      .then((res) => {
        if (res.code === 200 && res.data) {
          const spent =
            res.data.spentYuanbao || res.data.spentZuanshi || 0;
          const settled = !!(res.data.settled || res.data.settledLocal);
          if (settled && spent > 0) {
            Toast.show({
              title: `本次消费 ${spent} 钻石`,
              placement: 'top',
            });
          } else if (settled) {
            Toast.show({ title: '本次未产生消费', placement: 'top' });
          }
          if (res.data.yuanbao != null) {
            this.props.setUserInfo({ yuanbao: res.data.yuanbao });
          } else {
            this.refreshProfile();
          }
        } else {
          this.refreshProfile();
        }
      })
      .catch(() => {
        this.refreshProfile();
      })
      .finally(() => {
        this._exiting = false;
        this.sessionId = '';
        this.setState({ entered: false });
      });
  };

  refreshProfile() {
    Http('get', '/users/profile')
      .then((res) => {
        if (res?.code === 200 && res.data) {
          this.props.setUserInfo(res.data);
        }
      })
      .catch(() => {});
  }

  onBack = () => {
    this.ensureExit();
    this.props.navigation.goBack();
  };

  renderError() {
    const isBalance =
      (this.state.errorMsg || '').indexOf('钻石') > -1 ||
      (this.state.errorMsg || '').indexOf('余额') > -1;
    return (
      <View style={Styles.errorCont}>
        <Ionicons name="heart-dislike-outline" size={64} color="#FFB6C1" />
        <Text style={Styles.errorText}>{this.state.errorMsg}</Text>
        {isBalance ? (
          <TouchableOpacity
            style={Styles.errorBtn}
            onPress={() => this.props.navigation.navigate('Diamond')}
          >
            <Text style={Styles.errorBtnText}>去充值</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={Styles.errorBtn} onPress={this.enterFunc}>
            <Text style={Styles.errorBtnText}>重试</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{ marginTop: 14 }}
          onPress={() => this.props.navigation.goBack()}
        >
          <Text style={{ color: '#999', fontSize: 13 }}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const { h5Url, isLoading, errorMsg, yuanbao, asset, entered, showTip } =
      this.state;
    return (
      <SafeAreaView style={Styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={Styles.topBar}>
          <TouchableOpacity style={Styles.backBtn} onPress={this.onBack}>
            <Icon name="left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={Styles.title}>AI女友</Text>
          <View style={Styles.zuanshiCont}>
            <Ionicons name="diamond" size={14} color="#C19769" />
            <Text style={Styles.zuanshiText}>{Math.floor(yuanbao)}</Text>
          </View>
        </View>

        {entered && !errorMsg && showTip ? (
          <View style={Styles.tipBar}>
            <Text style={Styles.tipText}>
              已带入 {Math.round(asset * 100)} 钻石，退出时按实际消费结算
            </Text>
          </View>
        ) : null}

        {errorMsg ? (
          this.renderError()
        ) : h5Url ? (
          <WebView
            source={{ uri: h5Url }}
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            startInLoadingState
            originWhitelist={['*']}
            allowFileAccess
            renderLoading={() => <Loading showLoading />}
            onShouldStartLoadWithRequest={(request) => {
              if (
                request.url.startsWith('weixin://') ||
                request.url.startsWith('alipay')
              ) {
                Linking.canOpenURL(request.url)
                  .then((supported) => {
                    if (supported) Linking.openURL(request.url);
                  })
                  .catch(() => {});
                return false;
              }
              return true;
            }}
          />
        ) : (
          <Loading showLoading />
        )}

        <Loading showLoading={isLoading} />
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  isLogged: state.user.isLogged,
});

const mapDispatchToProps = (dispatch) => ({
  setUserInfo: (payload) => dispatch({ type: 'SET_USERINFO', payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(AiGirlfriend);

const Styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  topBar: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    width: 44,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: -44,
  },
  zuanshiCont: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EDE3',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 12,
  },
  zuanshiText: {
    color: Colors.subject,
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  tipBar: {
    backgroundColor: '#FFF0F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tipText: { color: '#D6336C', fontSize: 11, textAlign: 'center' },
  errorCont: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: '#666',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorBtn: {
    marginTop: 22,
    backgroundColor: Colors.subject,
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 11,
  },
  errorBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
