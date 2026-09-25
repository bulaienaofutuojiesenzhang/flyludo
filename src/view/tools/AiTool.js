import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
  View as RNView,
  InteractionManager,
} from 'react-native';
import { View, Toast } from 'native-base';
import Icon from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import { WebView } from 'react-native-webview';
import FastImage from 'react-native-fast-image';

import { Loading } from '../../component';
import { Colors } from '../../theme';
import Http from '../../utils/HttpPost';
import AsyncStorage from '../../utils/AsyncStorage';
import { uploadAiFile, getResultKind } from '../../utils/aiUpload';
import {
  requestMediaPermission,
  normalizeLocalImageUri,
} from '../../utils/PermissionHelper';

const SCENES_CACHE_KEY = 'AI_SCENES_CACHE_V2';
const SCENES_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SCENES_SOFT_REFRESH_MS = 6 * 60 * 60 * 1000;
const ACCENT = Colors.subject;
/** 场景缩略图只渲染可见窗口，避免进页一次解码几十张大图 */
const SCENE_ITEM_W = 90;

const AI_CONFIG = {
  clothesSwap: {
    title: 'AI换衣',
    cost: 10,
    resultType: 'image',
    needScene: false,
    needMethod: true,
    tip: '上传人物照片并选择服装风格,AI 自动换装',
  },
  sceneWebp: {
    title: '场景动图',
    cost: 50,
    resultType: 'anim',
    needScene: true,
    needMethod: false,
    tip: '上传人物照片并选择场景,AI 生成特殊场景动态图',
  },
  sceneVideo: {
    title: '场景视频',
    cost: 100,
    resultType: 'video',
    needScene: true,
    needMethod: false,
    tip: '上传人物照片并选择场景,AI 生成特殊场景视频',
  },
};

const DEFAULT_CLOTHES_STYLES = [
  { id: 'bikini', name: '比基尼' },
  { id: 'underwear', name: '内衣' },
  { id: 'lingerie', name: '情趣装' },
  { id: 'school', name: 'JK制服' },
  { id: 'maid', name: '女仆装' },
  { id: 'nurse', name: '护士装' },
  { id: 'qipao', name: '旗袍' },
  { id: 'sport', name: '运动装' },
  { id: 'dress', name: '连衣裙' },
];

class AiTool extends Component {
  constructor(props) {
    super(props);
    let ability = props.route?.params?.ability || 'clothesSwap';
    if (!AI_CONFIG[ability]) ability = 'clothesSwap';
    this.cfg = AI_CONFIG[ability];
    this.state = {
      isLoading: false,
      ability,
      sourceAsset: null,
      scenes: [],
      sceneSel: null,
      scenesLoading: false,
      styles: DEFAULT_CLOTHES_STYLES,
      styleSel: null,
      stylesLoading: false,
      processing: false,
      resultUrl: '',
    };
    this.pollTimer = null;
  }

  componentDidMount() {
    // 等页面转场动画结束后再拉场景，避免进页瞬间卡死
    this._interactionTask = InteractionManager.runAfterInteractions(() => {
      if (this.cfg.needScene) this.loadScenes();
      if (this.cfg.needMethod) this.loadClothesStyles();
    });
  }

  componentWillUnmount() {
    this.clearPoll();
    if (this._interactionTask && this._interactionTask.cancel) {
      this._interactionTask.cancel();
    }
  }

  clearPoll = () => {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  };

  getYuanbao = () => Number(this.props.user?.yuanbao) || 0;

  /** 缓存只留列表渲染必要字段，减小 JSON 解析卡顿 */
  slimScenes = (list) =>
    (list || []).map((s) => ({
      id: s.id,
      name: s.name || '',
      sceneName: s.sceneName || s.name || '',
      preview: s.preview || '',
      type: s.type || '',
    }));

  saveScenesCache = async (list) => {
    try {
      await AsyncStorage.setItem(
        SCENES_CACHE_KEY,
        JSON.stringify({ list: this.slimScenes(list), at: Date.now() })
      );
    } catch (_) {}
  };

  readScenesCache = async () => {
    try {
      const raw = await AsyncStorage.getItem(SCENES_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.list) || !parsed.list.length)
        return null;
      const age = Date.now() - Number(parsed.at || 0);
      if (age > SCENES_CACHE_TTL_MS) return null;
      return { list: parsed.list, age };
    } catch (_) {
      return null;
    }
  };

  preloadSceneImages = (list) => {
    try {
      const sources = (list || [])
        .map((s) => s && s.preview)
        .filter((u) => typeof u === 'string' && /^https?:\/\//i.test(u))
        .slice(0, 12)
        .map((uri) => ({
          uri,
          priority: FastImage.priority.low,
        }));
      if (sources.length) FastImage.preload(sources);
    } catch (_) {}
  };

  loadScenes = async () => {
    const cached = await this.readScenesCache();
    if (cached?.list?.length) {
      this.setState({ scenes: cached.list, scenesLoading: false });
      this.preloadSceneImages(cached.list);
      if (cached.age < SCENES_SOFT_REFRESH_MS) return;
    } else {
      this.setState({ scenesLoading: true });
    }
    try {
      const res = await Http('post', '/ai-proxy/ai/scenes', {});
      if (res.code === 200 && res.data?.list) {
        const list = this.slimScenes(res.data.list);
        this.setState({ scenes: list });
        await this.saveScenesCache(list);
        this.preloadSceneImages(list);
      }
    } catch (e) {}
    this.setState({ scenesLoading: false });
  };

  // 服务端失败时本地兜底，避免「获取换衣风格失败」后无法使用
  FALLBACK_CLOTHES_STYLES = [
    { id: 'bikini', name: '比基尼' },
    { id: 'underwear', name: '内衣' },
    { id: 'lingerie', name: '情趣装' },
    { id: 'school', name: 'JK制服' },
    { id: 'maid', name: '女仆装' },
    { id: 'nurse', name: '护士装' },
    { id: 'qipao', name: '旗袍' },
    { id: 'sport', name: '运动装' },
    { id: 'dress', name: '连衣裙' },
  ];

  loadClothesStyles = async () => {
    this.setState({ stylesLoading: true });
    try {
      const res = await Http('post', '/ai-proxy/ai/clothesStyles', {});
      if (res.code === 200 && res.data?.list?.length) {
        this.setState({ styles: res.data.list, stylesLoading: false });
        return;
      }
    } catch (e) {}
    this.setState({
      styles: this.FALLBACK_CLOTHES_STYLES,
      stylesLoading: false,
    });
  };

  pickAsset = async () => {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) {
      Toast.show({
        title: '需要相册权限才能选择图片',
        placement: 'top',
      });
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.9,
        selectionLimit: 1,
        maxWidth: 2048,
        maxHeight: 2048,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Toast.show({
            title:
              response.errorCode === 'permission'
                ? '请在系统设置中允许访问相册'
                : response.errorMessage || '无法打开相册',
            placement: 'top',
          });
          return;
        }
        const asset = response.assets && response.assets[0];
        const rawUri = asset && (asset.fileCopyUri || asset.uri);
        const uri = normalizeLocalImageUri(rawUri);
        if (!uri) {
          Toast.show({ title: '未获取到图片，请重试', placement: 'top' });
          return;
        }
        this.setState({
          sourceAsset: {
            ...asset,
            uri,
            type: asset.type || 'image/jpeg',
            fileName:
              asset.fileName ||
              asset.name ||
              `photo_${Date.now()}.jpg`,
          },
          resultUrl: '',
        });
      }
    );
  };

  submitFunc = () => {
    const { sourceAsset, sceneSel, styleSel } = this.state;
    if (!sourceAsset) {
      Toast.show({ title: '请先选择素材照片', placement: 'top' });
      return;
    }
    if (this.cfg.needScene && !sceneSel) {
      Toast.show({ title: '请选择场景', placement: 'top' });
      return;
    }
    if (this.cfg.needMethod && !styleSel) {
      Toast.show({ title: '请选择换衣风格', placement: 'top' });
      return;
    }
    Alert.alert(
      '扣费确认',
      `本次${this.cfg.title}将消耗 ${this.cfg.cost} 钻石，当前余额 ${this.getYuanbao()} 钻石。`,
      [
        { text: '取消', style: 'cancel' },
        { text: '确认支付', onPress: () => this.doSubmitFunc() },
      ]
    );
  };

  doSubmitFunc = async () => {
    const { ability, sourceAsset, sceneSel, styleSel } = this.state;
    this.setState({ isLoading: true, resultUrl: '' });
    try {
      const sourceUrl = await uploadAiFile(sourceAsset);
      const body = { ability, sourceUrl };
      if (this.cfg.needScene && sceneSel) {
        body.sceneName = sceneSel.sceneName || sceneSel.name;
      }
      if (this.cfg.needMethod && styleSel) {
        body.method = styleSel.id;
      }
      const res = await Http('post', '/ai-proxy/ai/submit', body);
      this.setState({ isLoading: false });
      if (res.code === 200 && res.data?.taskId) {
        const nextYb = res.data.yuanbao ?? res.data.balance;
        if (nextYb != null) {
          this.props.setUserInfo({ yuanbao: nextYb });
        }
        this.setState({ processing: true });
        Toast.show({ title: '支付成功,任务处理中...', placement: 'top' });
        this.startPoll(res.data.taskId);
      } else if (res.code === 600 || res.code === 3001) {
        Alert.alert(
          '钻石余额不足',
          `本次${this.cfg.title}需要 ${this.cfg.cost} 钻石，请先充值。`,
          [
            { text: '取消', style: 'cancel' },
            {
              text: '去充值',
              onPress: () => this.props.navigation.push('Diamond'),
            },
          ]
        );
      } else {
        Toast.show({
          title: res.message || res.msg || '提交失败',
          placement: 'top',
        });
      }
    } catch (e) {
      this.setState({ isLoading: false });
      Toast.show({ title: e.message || '提交失败', placement: 'top' });
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
        Toast.show({ title: '处理超时,请稍后重试', placement: 'top' });
        return;
      }
      try {
        const res = await Http('post', '/ai-proxy/ai/task', {
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
              Toast.show({ title: '生成完成!', placement: 'top' });
            } else {
              this.setState({ processing: false });
              Toast.show({
                title: '任务完成但未获取到结果',
                placement: 'top',
              });
            }
          } else if (res.data.status === 'failed') {
            this.clearPoll();
            this.setState({ processing: false });
            const refunded = !!(res.data.localRefunded || res.data.refunded);
            if (refunded) {
              const nextYb =
                res.data.yuanbao != null
                  ? res.data.yuanbao
                  : this.getYuanbao() + this.cfg.cost;
              this.props.setUserInfo({ yuanbao: nextYb });
              Toast.show({
                title: '生成失败,钻石已退回',
                placement: 'top',
              });
            } else {
              Toast.show({
                title: '生成失败,请更换素材重试',
                placement: 'top',
              });
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

  renderSceneItem = ({ item }) => {
    const { sceneSel } = this.state;
    const active = sceneSel && sceneSel.id === item.id;
    return (
      <TouchableOpacity
        style={[Styles.sceneItem, active && Styles.sceneItemActive]}
        onPress={() => this.setState({ sceneSel: item })}
        activeOpacity={0.8}
      >
        {item.preview ? (
          <FastImage
            source={{
              uri: item.preview,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            style={Styles.sceneImg}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={[Styles.sceneImg, Styles.sceneImgEmpty]}>
            <Ionicons name="image-outline" size={24} color="#CCC" />
          </View>
        )}
        <Text
          style={[Styles.sceneName, active && Styles.sceneNameActive]}
          numberOfLines={2}
        >
          {item.sceneName || item.name}
        </Text>
        {active ? (
          <View style={Styles.sceneCheck}>
            <Ionicons name="checkmark-circle" size={18} color={ACCENT} />
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  sceneKeyExtractor = (item) => String(item.id || item.sceneName);

  renderStyleItem(item) {
    const { styleSel } = this.state;
    const active = styleSel && styleSel.id === item.id;
    return (
      <TouchableOpacity
        key={item.id}
        style={[Styles.styleChip, active && Styles.styleChipActive]}
        onPress={() => this.setState({ styleSel: item })}
        activeOpacity={0.8}
      >
        <Text
          style={[Styles.styleChipTxt, active && Styles.styleChipTxtActive]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  }

  renderResultMedia(resultUrl) {
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
    const {
      sourceAsset,
      scenes,
      scenesLoading,
      styles,
      stylesLoading,
      styleSel,
      processing,
      resultUrl,
    } = this.state;
    const cfg = this.cfg;
    const isVideo =
      cfg.resultType === 'video' || getResultKind(resultUrl) === 'video';

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
          <Text style={Styles.headerTitle}>{cfg.title}</Text>
          <RNView style={{ width: 40 }} />
        </View>
        <Loading showLoading={this.state.isLoading} />
        <ScrollView contentContainerStyle={Styles.scrollContent}>
          <TouchableOpacity
            style={Styles.pickCard}
            onPress={this.pickAsset}
            activeOpacity={0.8}
          >
            {sourceAsset ? (
              <Image
                key={sourceAsset.uri}
                source={{ uri: sourceAsset.uri }}
                style={Styles.pickImage}
                resizeMode="cover"
              />
            ) : (
              <View style={Styles.pickInner}>
                <Ionicons name="person-add-outline" size={36} color="#BBB" />
                <Text style={Styles.pickLabel}>选择素材照片</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={Styles.tipTxt}>{cfg.tip}</Text>

          {cfg.needMethod ? (
            <View style={Styles.sceneBox}>
              <Text style={Styles.sceneTitle}>
                选择风格{styleSel ? ` · ${styleSel.name}` : ''}
              </Text>
              {stylesLoading ? (
                <Text style={Styles.sceneLoadingTxt}>风格加载中...</Text>
              ) : (
                <View style={Styles.styleWrap}>
                  {styles.map((item) => this.renderStyleItem(item))}
                </View>
              )}
            </View>
          ) : null}

          {cfg.needScene ? (
            <View style={Styles.sceneBox}>
              <Text style={Styles.sceneTitle}>
                选择场景
                {this.state.sceneSel
                  ? ` · ${this.state.sceneSel.sceneName || this.state.sceneSel.name}`
                  : ''}
              </Text>
              {scenesLoading ? (
                <Text style={Styles.sceneLoadingTxt}>场景加载中...</Text>
              ) : scenes.length ? (
                <FlatList
                  horizontal
                  data={scenes}
                  keyExtractor={this.sceneKeyExtractor}
                  renderItem={this.renderSceneItem}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={Styles.sceneList}
                  initialNumToRender={6}
                  maxToRenderPerBatch={4}
                  windowSize={5}
                  removeClippedSubviews
                  getItemLayout={(_, index) => ({
                    length: SCENE_ITEM_W + 10,
                    offset: (SCENE_ITEM_W + 10) * index,
                    index,
                  })}
                />
              ) : (
                <Text style={Styles.sceneLoadingTxt}>暂无可用场景</Text>
              )}
            </View>
          ) : null}

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
                : `开始生成 (${cfg.cost} 钻石)`}
            </Text>
          </TouchableOpacity>
          <Text style={Styles.tipTxt}>
            当前余额:{this.getYuanbao()} 钻石 · 失败自动退款
          </Text>

          {processing ? (
            <View style={Styles.processingBox}>
              <Text style={Styles.processingTxt}>
                AI 正在处理中,
                {isVideo ? '视频生成需要 3~10 分钟' : '一般需要 1~3 分钟'}
                ,请耐心等待
              </Text>
            </View>
          ) : null}

          {!!resultUrl && (
            <View style={Styles.resultBox}>
              <Text style={Styles.resultTitle}>{cfg.title}结果</Text>
              {this.renderResultMedia(resultUrl)}
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

export default connect(mapStateToProps, mapDispatchToProps)(AiTool);

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
  pickCard: {
    height: 200,
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 2,
  },
  pickInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pickImage: { width: '100%', height: '100%' },
  pickLabel: { fontSize: 13, color: '#999', marginTop: 8 },
  tipTxt: {
    fontSize: 12,
    color: '#BBB',
    marginTop: 10,
    textAlign: 'center',
  },
  sceneBox: { marginTop: 15 },
  sceneTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sceneLoadingTxt: {
    fontSize: 12,
    color: '#BBB',
    textAlign: 'center',
    paddingVertical: 20,
  },
  sceneList: { paddingVertical: 2 },
  sceneItem: {
    width: SCENE_ITEM_W,
    marginRight: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sceneItemActive: { borderColor: ACCENT },
  sceneImg: { width: '100%', height: 110, backgroundColor: '#F5F5F5' },
  sceneImgEmpty: { justifyContent: 'center', alignItems: 'center' },
  sceneName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  sceneNameActive: { color: ACCENT, fontWeight: 'bold' },
  styleWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  styleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginRight: 8,
    marginBottom: 8,
  },
  styleChipActive: { borderColor: ACCENT, backgroundColor: '#F5EDE3' },
  styleChipTxt: { fontSize: 13, color: '#666' },
  styleChipTxtActive: { color: ACCENT, fontWeight: 'bold' },
  sceneCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFF',
    borderRadius: 9,
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
    overflow: 'hidden',
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
