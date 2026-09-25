import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  Linking,
  View as RNView,
} from 'react-native';
import { View } from 'native-base';
import Icon from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import { WebView } from 'react-native-webview';

import { Loading, ToastService, AppDialog } from '../../component';
import { Colors } from '../../theme';
import Http from '../../utils/HttpPost';
import { uploadAiFile, getResultKind } from '../../utils/aiUpload';
import {
  requestMediaPermission,
  normalizeLocalImageUri,
} from '../../utils/PermissionHelper';

const FACESWAP_COST = { image: 10, video: 100 };
const ACCENT = Colors.subject;

class FaceSwap extends Component {
  constructor(props) {
    super(props);
    const mode =
      props.route?.params?.mode === 'video' ? 'video' : 'image';
    this.state = {
      isLoading: false,
      mode,
      faceAsset: null,
      targetAsset: null,
      processing: false,
      resultUrl: '',
    };
    this.pollTimer = null;
  }

  componentWillUnmount() {
    this.clearPoll();
  }

  clearPoll = () => {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  };

  switchMode = (mode) => {
    if (this.state.processing) {
      ToastService.warn('任务处理中，请稍候');
      return;
    }
    this.setState({ mode, targetAsset: null, resultUrl: '' });
  };

  pickAsset = async (field, mediaType) => {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) {
      ToastService.warn('需要相册权限才能选择素材');
      return;
    }

    const isVideo = mediaType === 'video';
    launchImageLibrary(
      {
        mediaType: isVideo ? 'video' : 'photo',
        quality: 0.9,
        selectionLimit: 1,
        maxWidth: isVideo ? undefined : 2048,
        maxHeight: isVideo ? undefined : 2048,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          ToastService.warn(
            response.errorCode === 'permission'
              ? '请在系统设置中允许访问相册'
              : response.errorMessage || '无法打开相册'
          );
          return;
        }
        const asset = response.assets && response.assets[0];
        const rawUri = asset && (asset.fileCopyUri || asset.uri);
        const uri = normalizeLocalImageUri(rawUri);
        if (!uri) {
          ToastService.warn('未获取到素材，请重试');
          return;
        }
        this.setState({
          [field]: {
            ...asset,
            uri,
            type:
              asset.type ||
              (isVideo ? 'video/mp4' : 'image/jpeg'),
            fileName:
              asset.fileName ||
              asset.name ||
              `${isVideo ? 'video' : 'photo'}_${Date.now()}.${
                isVideo ? 'mp4' : 'jpg'
              }`,
          },
          resultUrl: '',
        });
      }
    );
  };

  getYuanbao = () => Number(this.props.user?.yuanbao) || 0;

  submitFunc = async () => {
    const { mode, faceAsset, targetAsset } = this.state;
    if (!faceAsset) {
      ToastService.warn('请选择脸源照片');
      return;
    }
    if (!targetAsset) {
      ToastService.warn(
        mode === 'video' ? '请选择目标视频' : '请选择目标图片'
      );
      return;
    }
    const cost = FACESWAP_COST[mode];
    const ok = await AppDialog.confirm({
      title: '确认消耗钻石',
      message: `本次${mode === 'video' ? '视频' : '图片'}换脸将消耗 ${cost} 钻石，当前余额 ${this.getYuanbao()} 钻石。`,
      type: 'diamond',
      cancelText: '再想想',
      confirmText: '确认支付',
    });
    if (ok) this.doSubmitFunc();
  };

  doSubmitFunc = async () => {
    const { mode, faceAsset, targetAsset } = this.state;
    this.setState({ isLoading: true, resultUrl: '' });
    try {
      const sourceUrl = await uploadAiFile(faceAsset, { isVideo: false });
      const targetUrl = await uploadAiFile(targetAsset, {
        isVideo: mode === 'video',
      });
      const res = await Http('post', '/ai-proxy/faceswap/submit', {
        type: mode,
        sourceUrl,
        targetUrl,
      });
      this.setState({ isLoading: false });
      if (res.code === 200 && res.data?.taskId) {
        const nextYb = res.data.yuanbao ?? res.data.balance;
        if (nextYb != null) {
          this.props.setUserInfo({ yuanbao: nextYb });
        }
        this.setState({ processing: true });
        ToastService.success('支付成功，任务处理中...');
        this.startPoll(res.data.taskId);
      } else if (res.code === 600 || res.code === 3001) {
        const go = await AppDialog.diamondInsufficient({
          message: `本次换脸需要 ${FACESWAP_COST[mode]} 钻石，充值后就能继续玩。`,
        });
        if (go) this.props.navigation.push('Diamond');
      } else {
        ToastService.error(res.message || res.msg || '提交失败');
      }
    } catch (e) {
      this.setState({ isLoading: false });
      ToastService.error(e.message || '提交失败');
    }
  };

  startPoll = (taskId) => {
    this.clearPoll();
    let count = 0;
    this.pollTimer = setInterval(async () => {
      count++;
      if (count > 180) {
        this.clearPoll();
        this.setState({ processing: false });
        ToastService.warn('处理超时，请稍后重试');
        return;
      }
      try {
        const res = await Http('post', '/ai-proxy/faceswap/task', {
          task_id: taskId,
        });
        if (res.code === 200 && res.data) {
          if (res.data.status === 'completed') {
            this.clearPoll();
            if (res.data.resultUrl) {
              this.setState({
                processing: false,
                resultUrl: res.data.resultUrl,
              });
              ToastService.success('换脸完成！');
            } else {
              this.setState({ processing: false });
              ToastService.warn('任务完成但未获取到结果');
            }
          } else if (res.data.status === 'failed') {
            this.clearPoll();
            this.setState({ processing: false });
            const refunded = !!(res.data.localRefunded || res.data.refunded);
            if (refunded) {
              const nextYb =
                res.data.yuanbao != null
                  ? res.data.yuanbao
                  : this.getYuanbao() + FACESWAP_COST[this.state.mode];
              this.props.setUserInfo({ yuanbao: nextYb });
              ToastService.diamond('换脸失败，钻石已退回');
            } else {
              ToastService.error('换脸失败，请更换素材重试');
            }
          }
        }
      } catch (e) {}
    }, 5000);
  };

  openResult = () => {
    const { resultUrl } = this.state;
    if (resultUrl) Linking.openURL(resultUrl).catch(() => {});
  };

  renderPickCard(asset, label, icon, onPress, isVideo) {
    return (
      <TouchableOpacity
        style={Styles.pickCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {asset ? (
          isVideo ? (
            <View style={Styles.pickInner}>
              <Ionicons name="videocam" size={40} color={ACCENT} />
              <Text style={Styles.pickDoneTxt} numberOfLines={1}>
                已选择视频
              </Text>
              <Text style={Styles.pickReTxt}>点击重新选择</Text>
            </View>
          ) : (
            <Image
              key={asset.uri}
              source={{ uri: asset.uri }}
              style={Styles.pickImage}
              resizeMode="cover"
            />
          )
        ) : (
          <View style={Styles.pickInner}>
            <Ionicons name={icon} size={36} color="#BBB" />
            <Text style={Styles.pickLabel}>{label}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  renderResult(resultUrl) {
    const kind = getResultKind(resultUrl);
    if (kind === 'video' || kind === 'anim') {
      const safeUrl = String(resultUrl).replace(/"/g, '%22');
      const html =
        kind === 'video'
          ? `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>html,body{margin:0;padding:0;width:100%;height:100%;background:#000}video{width:100%;height:100%;object-fit:contain}</style></head><body><video src="${safeUrl}" controls autoplay playsinline loop></video></body></html>`
          : `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>html,body{margin:0;padding:0;width:100%;height:100%;background:#F5F5F5;display:flex;align-items:center;justify-content:center}img{max-width:100%;max-height:100%;object-fit:contain}</style></head><body><img src="${safeUrl}"/></body></html>`;
      return (
        <WebView
          source={{ html, baseUrl: '' }}
          style={Styles.resultMedia}
          scrollEnabled={false}
          originWhitelist={['*']}
          mixedContentMode="always"
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      );
    }
    return (
      <Image
        source={{ uri: resultUrl }}
        style={Styles.resultMedia}
        resizeMode="contain"
      />
    );
  }

  render() {
    const { mode, faceAsset, targetAsset, processing, resultUrl } =
      this.state;
    return (
      <SafeAreaView style={Styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={Styles.header}>
          <TouchableOpacity
            style={Styles.backBtn}
            onPress={() => this.props.navigation.goBack()}
          >
            <Icon name="left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={Styles.headerTitle}>
            {mode === 'video' ? '场景换脸' : 'AI换脸'}
          </Text>
          <RNView style={{ width: 40 }} />
        </View>
        <Loading showLoading={this.state.isLoading} />
        <ScrollView contentContainerStyle={Styles.scrollContent}>
          <View style={Styles.tabBar}>
            <TouchableOpacity
              style={[
                Styles.tabItem,
                mode === 'image' && Styles.tabItemActive,
              ]}
              onPress={() => this.switchMode('image')}
            >
              <Ionicons
                name="image-outline"
                size={18}
                color={mode === 'image' ? '#FFF' : '#666'}
              />
              <Text
                style={[
                  Styles.tabTxt,
                  mode === 'image' && Styles.tabTxtActive,
                ]}
              >
                图片换脸
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                Styles.tabItem,
                mode === 'video' && Styles.tabItemActive,
              ]}
              onPress={() => this.switchMode('video')}
            >
              <Ionicons
                name="videocam-outline"
                size={18}
                color={mode === 'video' ? '#FFF' : '#666'}
              />
              <Text
                style={[
                  Styles.tabTxt,
                  mode === 'video' && Styles.tabTxtActive,
                ]}
              >
                视频换脸
              </Text>
            </TouchableOpacity>
          </View>

          <View style={Styles.pickRow}>
            {this.renderPickCard(
              faceAsset,
              '选择脸源照片',
              'person-add-outline',
              () => this.pickAsset('faceAsset', 'photo'),
              false
            )}
            <View style={Styles.pickArrow}>
              <Ionicons name="swap-horizontal" size={24} color={ACCENT} />
            </View>
            {this.renderPickCard(
              targetAsset,
              mode === 'video' ? '选择目标视频' : '选择目标图片',
              mode === 'video' ? 'film-outline' : 'image-outline',
              () =>
                this.pickAsset(
                  'targetAsset',
                  mode === 'video' ? 'video' : 'photo'
                ),
              mode === 'video'
            )}
          </View>
          <Text style={Styles.tipTxt}>
            脸源请使用清晰正面人像照片
            {mode === 'video' ? ',目标视频建议不超过 1 分钟' : ''}
          </Text>

          <TouchableOpacity
            style={[
              Styles.submitBtn,
              processing && Styles.submitBtnDisabled,
            ]}
            onPress={this.submitFunc}
            disabled={processing}
            activeOpacity={0.8}
          >
            <Text style={Styles.submitBtnTxt}>
              {processing
                ? 'AI 处理中,请稍候...'
                : `开始换脸 (${FACESWAP_COST[mode]} 钻石)`}
            </Text>
          </TouchableOpacity>
          <Text style={Styles.tipTxt}>
            当前余额:{this.getYuanbao()} 钻石 · 失败自动退款
          </Text>

          {processing ? (
            <View style={Styles.processingBox}>
              <Text style={Styles.processingTxt}>
                AI 正在处理中,一般需要 1~3 分钟,请耐心等待
              </Text>
            </View>
          ) : null}

          {!!resultUrl && (
            <View style={Styles.resultBox}>
              <Text style={Styles.resultTitle}>换脸结果</Text>
              {this.renderResult(resultUrl)}
              <TouchableOpacity
                style={Styles.saveBtn}
                onPress={this.openResult}
              >
                <Ionicons name="open-outline" size={16} color={ACCENT} />
                <Text style={Styles.saveBtnTxt}>打开结果链接</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  isLogged: state.user.isLogged,
  token: state.user.token,
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  setUserInfo: (payload) => dispatch({ type: 'SET_USERINFO', payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(FaceSwap);

const Styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: Colors.bai,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scrollContent: { padding: 15 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabItemActive: { backgroundColor: ACCENT },
  tabTxt: { fontSize: 14, color: '#666', marginLeft: 5 },
  tabTxtActive: { color: '#FFF', fontWeight: 'bold' },
  pickRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  pickCard: {
    flex: 1,
    height: 160,
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  pickInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pickImage: { width: '100%', height: '100%' },
  pickLabel: { fontSize: 13, color: '#999', marginTop: 8 },
  pickDoneTxt: {
    fontSize: 13,
    color: '#333',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  pickReTxt: { fontSize: 11, color: '#BBB', marginTop: 4 },
  pickArrow: { width: 40, alignItems: 'center' },
  tipTxt: {
    fontSize: 12,
    color: '#BBB',
    marginTop: 10,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: ACCENT,
  },
  submitBtnDisabled: { backgroundColor: '#CCC' },
  submitBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  processingBox: {
    marginTop: 20,
    backgroundColor: '#F5EDE3',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  processingTxt: { fontSize: 13, color: ACCENT },
  resultBox: {
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  resultMedia: {
    width: '100%',
    height: 320,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5EDE3',
  },
  saveBtnTxt: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
