/**
 * 邀请有礼（对齐 z7box：海报 + 邀请码 + 复制链接）
 */
import React, { Component } from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Text as RNText,
  FlatList,
  Share,
  Clipboard,
  View as RNView,
} from 'react-native';
import { connect } from 'react-redux';
import { View, Toast, Text } from 'native-base';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/Ionicons';

import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';

const INVITE_BASE = 'http://daoyikeji.com/flyingchess/?code=';
const INVITE_REWARD = 200;
const POSTER_WIDTH = Metrics.screenWidth - 32;
const POSTER_HEIGHT = POSTER_WIDTH * (481 / 390);

const POSTER_LIST = [
  { key: '1', src: require('../../asserts/images/share/share1.jpg') },
  { key: '2', src: require('../../asserts/images/share/share2.jpg') },
  { key: '3', src: require('../../asserts/images/share/share3.jpg') },
];

class InviteFriends extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posterIndex: 0,
      inviteCode: '',
    };
  }

  componentDidMount() {
    this.syncInviteCode();
    this.refreshProfile();
  }

  syncInviteCode = () => {
    const u = this.props.user || {};
    const code = String(u.yqcode || u.myInviteCode || '').trim();
    if (code) this.setState({ inviteCode: code });
  };

  refreshProfile = () => {
    Http('get', '/users/profile')
      .then((res) => {
        if (res && Number(res.code) === 200 && res.data) {
          this.props.setUserInfo(res.data);
          const code = String(res.data.yqcode || res.data.myInviteCode || '').trim();
          if (code) this.setState({ inviteCode: code });
        }
      })
      .catch(() => {});
  };

  componentDidUpdate(prevProps) {
    const prev = prevProps.user || {};
    const next = this.props.user || {};
    if (prev.yqcode !== next.yqcode || prev.myInviteCode !== next.myInviteCode) {
      this.syncInviteCode();
    }
  }

  clipboardFunc = (str, tip) => {
    const v = String(str || '').trim();
    if (!v) {
      Toast.show({ title: '暂无内容可复制', placement: 'top' });
      return;
    }
    try {
      Clipboard.setString(v);
      Toast.show({ title: tip || '复制成功', placement: 'top' });
    } catch (_) {
      Toast.show({ title: '复制失败', placement: 'top' });
    }
  };

  shareInvite = async () => {
    const code = this.state.inviteCode;
    const url = INVITE_BASE + code;
    try {
      await Share.share({
        title: '同城有约 · 邀请有礼',
        message: `快来同城有约一起玩！我的邀请码：${code}\n${url}`,
        url,
      });
    } catch (_) {}
  };

  onPosterScrollEnd = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / POSTER_WIDTH);
    if (i !== this.state.posterIndex && i >= 0 && i < POSTER_LIST.length) {
      this.setState({ posterIndex: i });
    }
  };

  renderPosterItem = ({ item }) => (
    <RNView style={Styles.slide}>
      <Image source={item.src} style={Styles.heroImg} resizeMode="cover" />
    </RNView>
  );

  render() {
    const inviteCode = this.state.inviteCode || '';
    const inviteUrl = INVITE_BASE + inviteCode;

    return (
      <View style={Styles.page}>
        <ScrollView contentContainerStyle={Styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={Styles.heroCard}>
            <RNView style={Styles.heroImgWrap}>
              <FlatList
                data={POSTER_LIST}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.key}
                renderItem={this.renderPosterItem}
                onMomentumScrollEnd={this.onPosterScrollEnd}
                getItemLayout={(_, index) => ({
                  length: POSTER_WIDTH,
                  offset: POSTER_WIDTH * index,
                  index,
                })}
                decelerationRate="fast"
                snapToInterval={POSTER_WIDTH}
                snapToAlignment="start"
                disableIntervalMomentum
              />
              <RNView style={Styles.qrOverlay} pointerEvents="none">
                <RNView style={Styles.qrBox}>
                  <QRCode value={inviteUrl || 'https://daoyikeji.com/flyingchess'} size={72} quietZone={4} />
                </RNView>
                <RNView style={Styles.qrMeta}>
                  <RNText style={Styles.qrCodeTxt}>{inviteCode || '------'}</RNText>
                  <Text style={Styles.qrLabel}>我的邀请码</Text>
                </RNView>
              </RNView>
              <RNView style={Styles.dotsRow} pointerEvents="none">
                {POSTER_LIST.map((p, i) => (
                  <RNView
                    key={p.key}
                    style={i === this.state.posterIndex ? Styles.activeDot : Styles.dot}
                  />
                ))}
              </RNView>
            </RNView>
          </View>

          <RNView style={Styles.rewardBanner}>
            <Icon name="gift" size={22} color="#FF6C01" />
            <RNView style={{ flex: 1, marginLeft: 10 }}>
              <Text style={Styles.rewardTitle}>邀请 1 位好友 = {INVITE_REWARD} 钻石</Text>
              <Text style={Styles.rewardDesc}>
                好友下载注册并填写你的邀请码后，奖励自动到账
              </Text>
            </RNView>
          </RNView>

          <View style={Styles.card}>
            <Text style={Styles.cardTitle}>我的邀请码</Text>
            <RNView style={Styles.codeRow}>
              <RNText style={Styles.codeBig} selectable>
                {inviteCode || '------'}
              </RNText>
              <TouchableOpacity
                style={Styles.copyBtn}
                onPress={() => this.clipboardFunc(inviteCode, '邀请码已复制')}
              >
                <RNText style={Styles.copyBtnTxt}>复制</RNText>
              </TouchableOpacity>
            </RNView>
            <Text style={Styles.linkLabel}>邀请链接</Text>
            <TouchableOpacity
              style={Styles.linkRow}
              onPress={() => this.clipboardFunc(inviteUrl, '邀请链接已复制')}
            >
              <Text style={Styles.linkTxt} numberOfLines={1}>
                {inviteUrl}
              </Text>
              <Text style={Styles.linkCopy}>复制链接</Text>
            </TouchableOpacity>
          </View>

          <RNView style={Styles.actions}>
            <TouchableOpacity style={Styles.actionPrimary} onPress={this.shareInvite} activeOpacity={0.85}>
              <Text style={Styles.actionPrimaryTxt}>分享给好友</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={Styles.actionSecondary}
              onPress={() => this.clipboardFunc(inviteCode, '邀请码已复制')}
              activeOpacity={0.85}
            >
              <Text style={Styles.actionSecondaryTxt}>复制邀请码</Text>
            </TouchableOpacity>
          </RNView>

          <View style={Styles.card}>
            <Text style={Styles.cardTitle}>好友如何填写邀请码？</Text>
            <Text style={Styles.tipLine}>1. 打开下载页扫码/链接安装 App</Text>
            <Text style={Styles.tipLine}>2. 注册时填写你的邀请码（非必填项）</Text>
            <Text style={Styles.tipLine}>3. 注册成功后，你将获得 {INVITE_REWARD} 钻石奖励</Text>
            <Text style={Styles.tipLine}>4. 也可在「我的 → 邀请有礼」查看自己的邀请码</Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  isLogged: state.user.isLogged,
  user: state.user,
  inviteCode: state.user.yqcode || state.user.myInviteCode,
});

const mapDispatchToProps = (dispatch) => ({
  setUserInfo: (payload) => dispatch({ type: 'SET_USERINFO', payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(InviteFriends);

const Styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9FA' },
  scroll: { paddingBottom: 40 },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 6,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  heroImgWrap: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
    position: 'relative',
  },
  slide: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    overflow: 'hidden',
  },
  heroImg: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 10,
    right: 14,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,.55)',
    width: 7,
    height: 7,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.subject || '#FF6C01',
    width: 7,
    height: 7,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  qrOverlay: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrBox: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  qrMeta: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(80,80,80,0.55)',
  },
  qrCodeTxt: { fontSize: 18, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  qrLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  rewardBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE8D6',
  },
  rewardTitle: { fontSize: 15, fontWeight: 'bold', color: '#FF6C01' },
  rewardDesc: { fontSize: 12, color: '#B85A1A', marginTop: 3, lineHeight: 17 },
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF6EE',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  codeBig: {
    flex: 1,
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.subject || '#FF6C01',
    letterSpacing: 2,
    marginRight: 12,
  },
  copyBtn: {
    flexShrink: 0,
    backgroundColor: Colors.subject || '#FF6C01',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
  },
  copyBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  linkLabel: { fontSize: 12, color: '#999', marginTop: 16, marginBottom: 6 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  linkTxt: { flex: 1, fontSize: 12, color: '#666' },
  linkCopy: { fontSize: 12, color: Colors.subject || '#FF6C01', fontWeight: 'bold', marginLeft: 8 },
  tipLine: { fontSize: 13, color: '#666', lineHeight: 24 },
  actions: { marginHorizontal: 16, marginTop: 18 },
  actionPrimary: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6C01',
  },
  actionPrimaryTxt: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  actionSecondary: {
    marginTop: 12,
    height: 46,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FF6C01',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  actionSecondaryTxt: { color: '#FF6C01', fontSize: 15, fontWeight: 'bold' },
});
