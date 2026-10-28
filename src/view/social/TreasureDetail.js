import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { AppDialog, ToastService } from '../../component';

import CachedImage from '../../component/CachedImage';
import { getAvatarSource } from '../../utils/avatar';
const { width: W } = Dimensions.get('window');
const PRICE = '#FF4D4F';

function fromNow(ms) {
  const t = Number(ms);
  if (!t) {
    return '';
  }
  const min = Math.floor((Date.now() - t) / 60000);
  if (min < 1) {
    return '刚刚';
  }
  if (min < 60) {
    return `${min}分钟前`;
  }
  const hour = Math.floor(min / 60);
  if (hour < 24) {
    return `${hour}小时前`;
  }
  const day = Math.floor(hour / 24);
  if (day < 30) {
    return `${day}天前`;
  }
  const d = new Date(t);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

class TreasureDetail extends React.Component {
  state = { index: 0, busy: false };

  item = () => this.props.route.params?.item || {};

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
  }

  onScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / W);
    if (index !== this.state.index) {
      this.setState({ index });
    }
  };

  chat = () => {
    const s = this.item().seller || {};
    if (!s.userId) {
      return;
    }
    this.props.navigation.navigate('Chats', {
      partnerId: String(s.userId),
      nickName: s.nickName,
      faceUrl: s.myFace,
    });
  };

  openSeller = () => {
    const s = this.item().seller || {};
    if (!s.userId) {
      return;
    }
    this.props.navigation.navigate('FriendDetail', {
      user: { ...s, userId: s.userId, name: s.nickName, avatar: s.myFace },
    });
  };

  buy = async () => {
    const it = this.item();
    if (this.state.busy) {
      return;
    }
    if (Number(this.props.user?.yuanbao || 0) < Number(it.price)) {
      const go = await AppDialog.diamondInsufficient();
      if (go) this.props.navigation.navigate('Diamond');
      return;
    }
    const ok = await AppDialog.confirm({
      title: '确认购买',
      message: `花费 ${it.price} 钻石收下「${it.title}」？`,
      cancelText: '再想想',
      confirmText: '确认',
    });
    if (!ok) return;
    this.setState({ busy: true });
    Http('post', '/social/manghe/getBaobei', { id: it._id })
      .then(async (res) => {
        if (res?.code === 200) {
          if (res.data?.yuanbao != null) {
            this.props.setUserInfo({ yuanbao: res.data.yuanbao });
          }
          const goFill = await AppDialog.confirm({
            title: '到手了',
            message: '请到「我的盲盒订单」填写收货地址',
            cancelText: '好的',
            confirmText: '去填写',
          });
          if (goFill) this.props.navigation.replace('OrderDetail');
          else this.props.navigation.goBack();
        } else if (res?.code === 600) {
          const go = await AppDialog.diamondInsufficient();
          if (go) this.props.navigation.navigate('Diamond');
        } else if (res?.code === 403) {
          const go = await AppDialog.confirm({
            title: 'VIP 专享',
            message: res.message || '请先开通 VIP',
            cancelText: '取消',
            confirmText: '去开通',
          });
          if (go) this.props.navigation.navigate('Recharge');
        } else {
          ToastService.warn(res?.message || '手慢了');
        }
      })
      .catch(() => {})
      .finally(() => this.setState({ busy: false }));
  };

  remove = async () => {
    const it = this.item();
    const ok = await AppDialog.confirm({
      title: '下架宝贝',
      message: '下架后别人将看不到，确定吗？',
      cancelText: '取消',
      confirmText: '下架',
    });
    if (!ok) return;
    Http('post', '/social/manghe/deleteBaobei', { id: it._id }).then((res) => {
      if (res?.code === 200) {
        this.props.navigation.goBack();
      } else {
        ToastService.warn(res?.message || '下架失败');
      }
    });
  };

  render() {
    const it = this.item();
    const photos = it.photoList || [];
    const seller = it.seller || {};
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            {photos.length ? (
              <FlatList
                data={photos}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(u, i) => `${u}_${i}`}
                onMomentumScrollEnd={this.onScrollEnd}
                renderItem={({ item: uri }) => (
                  <CachedImage source={{ uri }} style={{ width: W, height: W }} />
                )}
              />
            ) : (
              <View style={[styles.noImg, { width: W, height: W * 0.7 }]}>
                <Icons name="gift" size={56} color="#B9B2F5" />
              </View>
            )}
            {photos.length > 1 && (
              <View style={styles.counter}>
                <Text style={styles.counterTxt}>
                  {this.state.index + 1}/{photos.length}
                </Text>
              </View>
            )}
            <Pressable style={styles.back} onPress={() => this.props.navigation.goBack()}>
              <Icons name="left" size={20} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.body}>
            <View style={styles.priceRow}>
              <Image
                source={require('../../asserts/images/manghe/iconDiamond.png')}
                style={styles.pIcon}
              />
              <Text style={styles.price}>{it.price}</Text>
              <Text style={styles.time}>{fromNow(it.time)}发布</Text>
            </View>
            <Text style={styles.title}>
              {it.vipOnly ? <Text style={styles.vipBadge}> VIP专享 </Text> : null}
              {it.vipOnly ? ' ' : ''}
              {it.title}
            </Text>
            {!!it.describe && <Text style={styles.desc}>{it.describe}</Text>}
          </View>

          <View style={styles.bar} />

          <Pressable style={styles.seller} onPress={this.openSeller}>
            <CachedImage
              source={getAvatarSource(seller.myFace, seller.gender)}
              style={styles.sAvatar}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.sName}>{seller.nickName || '神秘人'}</Text>
              <Text style={styles.sCity}>{seller.city || '隐匿地址'}</Text>
            </View>
            <Icons name="right" size={14} color="#B0AEBA" />
          </Pressable>

          <View style={styles.tips}>
            <Text style={styles.tipTitle}>购买须知</Text>
            <Text style={styles.tipTxt}>· 以钻石计价，购买后宝贝归你，填写收货地址由卖家发货</Text>
            <Text style={styles.tipTxt}>· 确认收货后钻石才会结算给卖家</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {it.mine ? (
            <Pressable style={[styles.fBtn, styles.fGhost, { flex: 1 }]} onPress={this.remove}>
              <Text style={styles.fGhostTxt}>下架这个宝贝</Text>
            </Pressable>
          ) : (
            <>
              <Pressable style={[styles.fBtn, styles.fGhost]} onPress={this.chat}>
                <Icons name="message1" size={16} color="#444" />
                <Text style={[styles.fGhostTxt, { marginLeft: 6 }]}>私信</Text>
              </Pressable>
              <Pressable
                style={[styles.fBtn, styles.fMain, { flex: 1, marginLeft: 12 }]}
                onPress={this.buy}
              >
                <Text style={styles.fMainTxt}>{this.state.busy ? '处理中…' : '立即购买'}</Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  noImg: { backgroundColor: '#EFEDFC', alignItems: 'center', justifyContent: 'center' },
  back: {
    position: 'absolute',
    left: 14,
    top: (StatusBar.currentHeight || 40) + 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  counterTxt: { color: '#fff', fontSize: 12 },
  body: { paddingHorizontal: 16, paddingVertical: 14 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  pIcon: { width: 20, height: 20, marginRight: 4 },
  price: { fontSize: 28, fontWeight: '900', color: PRICE },
  time: { marginLeft: 'auto', fontSize: 12, color: '#B0AEBA' },
  title: { marginTop: 10, fontSize: 18, fontWeight: '700', color: '#222', lineHeight: 25 },
  vipBadge: { fontSize: 12, fontWeight: '800', color: '#fff', backgroundColor: '#F7B731' },
  desc: { marginTop: 10, fontSize: 15, color: '#555', lineHeight: 23 },
  bar: { height: 8, backgroundColor: '#F5F6F8' },
  seller: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  sAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#EEE' },
  sName: { fontSize: 16, fontWeight: '700', color: '#222' },
  sCity: { marginTop: 4, fontSize: 12, color: '#999' },
  tips: { padding: 16, backgroundColor: '#FAFAFD' },
  tipTitle: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 6 },
  tipTxt: { fontSize: 12, color: '#8A8898', lineHeight: 20 },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8E6F0',
    backgroundColor: '#fff',
  },
  fBtn: {
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fGhost: { paddingHorizontal: 22, backgroundColor: '#F1EFFA' },
  fGhostTxt: { color: '#444', fontWeight: '700', fontSize: 15 },
  fMain: { backgroundColor: PRICE },
  fMainTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export default connect(
  (s) => ({ user: s.user }),
  (d) => ({ setUserInfo: (p) => d({ type: 'SET_USERINFO', payload: p }) })
)(TreasureDetail);
