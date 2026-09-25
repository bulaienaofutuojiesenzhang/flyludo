import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { Toast } from 'native-base';
import { connect } from 'react-redux';
import Icons from 'react-native-vector-icons/AntDesign';
import Swiper from 'react-native-swiper';

import { Header } from '../../component';
import Http from '../../utils/HttpPost';
import { fetchFlyludoProducts, payFlyludoProduct } from '../../utils/AlipayPay';
import { isVipActive, formatVipExpire, getVipBadgeText } from '../../utils/vip';

const { width: SCREEN_W } = Dimensions.get('window');
// VIP 素材 684x312，必须按此比例，否则 ImageBackground cover 会左右裁切
const CARD_W = SCREEN_W - 8;
const CARD_H = Math.round(CARD_W * (312 / 684));

const VIP_CARD_IMAGES = {
  flyludo_vip_month: require('../../asserts/images/vip/yueka.png'),
  flyludo_vip_quarter: require('../../asserts/images/vip/jika.png'),
  flyludo_vip_year: require('../../asserts/images/vip/nianka.png'),
  flyludo_vip_forever: require('../../asserts/images/vip/yongjiuka.png'),
};

const PRIVILEGES = [
  { icon: 'rocket1', title: '玩法无限创作', desc: '飞行棋 / 真心话等玩法畅享' },
  { icon: 'star', title: '会员专属标识', desc: '昵称旁展示 VIP 徽章' },
  { icon: 'clouduploado', title: '社区优先展示', desc: '发布内容获得更高曝光' },
  { icon: 'message1', title: '反馈优先处理', desc: '问题与建议更快响应' },
  { icon: 'gift', title: '活动优先参与', desc: '后续活动优先资格' },
  { icon: 'heart', title: '支持开发', desc: '助力同城有约持续更新' },
];

class Recharge extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      paying: false,
      vipProducts: [],
      selectedVipIndex: 0,
      tab: 'vip',
    };
  }

  componentDidMount() {
    this.loadProducts();
    this.refreshProfile();
    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      this.refreshProfile();
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeFocus) this.unsubscribeFocus();
  }

  refreshProfile = () => {
    Http('get', '/users/profile').then((res) => {
      if (res?.code === 200 && res.data) {
        this.props.setUserInfo(res.data);
      }
    }).catch(() => {});
  };

  loadProducts = async () => {
    this.setState({ loading: true });
    try {
      const res = await fetchFlyludoProducts();
      if (res?.code === 200) {
        const vipProducts = (res.data?.list || []).filter((p) => p.type === 'vip');
        let selectedVipIndex = vipProducts.findIndex((p) => p.label === '超值');
        if (selectedVipIndex < 0) selectedVipIndex = 0;
        this.setState({ vipProducts, selectedVipIndex });
      } else {
        Toast.show({ title: res?.message || '商品加载失败', placement: 'top' });
      }
    } catch (e) {
      Toast.show({ title: '商品加载失败', placement: 'top' });
    } finally {
      this.setState({ loading: false });
    }
  };

  onPay = async (product) => {
    if (this.state.paying || !product) return;
    this.setState({ paying: true });
    try {
      const { result } = await payFlyludoProduct(product);
      const status = result?.resultStatus != null ? String(result.resultStatus) : '';
      if (status === '9000') {
        Toast.show({ title: '支付成功，正在同步会员状态', placement: 'top' });
        setTimeout(() => this.refreshProfile(), 1500);
        setTimeout(() => this.refreshProfile(), 4000);
      } else if (status === '8000' || status === '6004') {
        Toast.show({ title: '支付确认中，稍后自动同步', placement: 'top' });
        setTimeout(() => this.refreshProfile(), 3000);
      } else if (status === '6001') {
        Toast.show({ title: '已取消支付', placement: 'top' });
      } else {
        Toast.show({ title: result?.memo || '支付未完成', placement: 'top' });
      }
    } catch (e) {
      Toast.show({ title: e?.message || '支付失败', placement: 'top' });
    } finally {
      this.setState({ paying: false });
    }
  };

  renderVipSlide = (item, index) => {
    const priceNum = parseFloat(item.amountCny);
    const period =
      item.permanent ? '永久' : item.durationDays === 30 ? '月' : item.durationDays === 90 ? '季' : '年';
    const cover = VIP_CARD_IMAGES[item.product] || VIP_CARD_IMAGES.flyludo_vip_month;
    return (
      <View key={item.product} style={styles.slide}>
        <View style={styles.vipCardWrap}>
          <ImageBackground
            source={cover}
            style={styles.vipCardBg}
            imageStyle={styles.vipCardBgImg}
            resizeMode="stretch"
          >
            <View style={styles.vipCardBottom}>
              <Text style={styles.vipCardPrice}>
                ¥{priceNum}
                <Text style={styles.vipCardPeriod}> / {period}</Text>
              </Text>
              {item.dayPrice ? (
                <Text style={styles.vipCardDay}>{item.dayPrice}元/天</Text>
              ) : (
                <Text style={styles.vipCardDay}>一次开通 · 永久有效</Text>
              )}
            </View>
          </ImageBackground>
        </View>
      </View>
    );
  };

  renderStatusBar() {
    const { user } = this.props;
    const active = isVipActive(user);
    return (
      <View style={styles.statusBar}>
        <View style={{ flex: 1 }}>
          {active ? (
            <View style={styles.statusRow}>
              <View style={styles.memberTag}>
                <Text style={styles.memberTagText}>{getVipBadgeText(user)}</Text>
              </View>
              <Text style={styles.expireText}>{formatVipExpire(user)}</Text>
            </View>
          ) : (
            <Text style={styles.expireText}>暂未开通会员</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.renewBtn}
          onPress={() => {
            const item = this.state.vipProducts[this.state.selectedVipIndex];
            if (item) this.onPay(item.product);
          }}
        >
          <Text style={styles.renewBtnText}>{active ? '续费' : '开通'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderPrivileges() {
    return (
      <View style={styles.privilegeBox}>
        <Text style={styles.privilegeTitle}>我的会员特权</Text>
        <View style={styles.privilegeGrid}>
          {PRIVILEGES.map((p) => (
            <View key={p.title} style={styles.privilegeItem}>
              <View style={styles.privilegeIconWrap}>
                <Icons name={p.icon} size={18} color="#E85A2B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.privilegeName}>{p.title}</Text>
                <Text style={styles.privilegeDesc}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  render() {
    const { loading, paying, vipProducts, selectedVipIndex, tab } = this.state;
    const selected = vipProducts[selectedVipIndex];

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF5F0" />
        <Header
          title="会员中心"
          leftIcon="left"
          leftIconColor="#333"
          onLeftPress={() => this.props.navigation.goBack()}
          rightText="交易明细"
          rightStyle={{ color: '#333', fontSize: 15 }}
          onRightPress={() => this.setState({ tab: tab === 'vip' ? 'orders' : 'vip' })}
          backgroundColor="#FFF5F0"
          isPurecolor
        />
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#E85A2B" />
        ) : (
          <>
            {tab === 'orders' ? (
              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                <OrdersBlock onBack={() => this.setState({ tab: 'vip' })} />
              </ScrollView>
            ) : (
              <>
                <View style={styles.carouselWrap}>
                  {vipProducts.length > 0 ? (
                    <Swiper
                      key={`vip-swiper-${vipProducts.length}`}
                      loop={false}
                      index={selectedVipIndex}
                      showsPagination
                      autoplay={false}
                      removeClippedSubviews={false}
                      onIndexChanged={(index) => this.setState({ selectedVipIndex: index })}
                      dotStyle={styles.dot}
                      activeDotStyle={styles.activeDot}
                      paginationStyle={styles.pagination}
                      containerStyle={styles.swiperContainer}
                      style={{ height: CARD_H + 28 }}
                    >
                      {vipProducts.map((item, index) => this.renderVipSlide(item, index))}
                    </Swiper>
                  ) : (
                    <Text style={styles.sectionHint}>暂无会员套餐</Text>
                  )}
                </View>

                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={styles.content}
                  showsVerticalScrollIndicator={false}
                >
                  {this.renderStatusBar()}
                  {this.renderPrivileges()}
                  <View style={{ height: 90 }} />
                </ScrollView>
              </>
            )}

            {tab !== 'orders' && selected ? (
              <View style={styles.bottomBar}>
                <TouchableOpacity
                  style={[styles.buyBtn, paying && { opacity: 0.7 }]}
                  disabled={paying}
                  onPress={() => this.onPay(selected.product)}
                >
                  <Text style={styles.buyBtnText}>
                    {paying
                      ? '正在唤起支付宝…'
                      : `${isVipActive(this.props.user) ? '立即续费' : '立即开通'}·${selected.name}¥${parseFloat(selected.amountCny)}`}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </>
        )}
      </View>
    );
  }
}

class OrdersBlock extends Component {
  state = { loading: true, list: [] };

  componentDidMount() {
    Http('get', '/payment/flyludo/orders', { page: 1, pageSize: 30 }).then((res) => {
      if (res?.code === 200) {
        this.setState({ list: res.data?.list || [], loading: false });
      } else {
        this.setState({ loading: false });
      }
    }).catch(() => this.setState({ loading: false }));
  }

  render() {
    const { loading, list } = this.state;
    return (
      <View>
        <TouchableOpacity onPress={this.props.onBack} style={{ marginBottom: 12 }}>
          <Text style={{ color: '#E85A2B' }}>← 返回会员套餐</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>交易明细</Text>
        {loading ? <ActivityIndicator color="#E85A2B" /> : null}
        {!loading && !list.length ? <Text style={styles.sectionHint}>暂无订单</Text> : null}
        {list.map((o) => (
          <View key={o.orderId} style={styles.diamondCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.diamondName}>{o.product}</Text>
              <Text style={styles.diamondDesc}>{o.orderId}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.diamondPrice}>¥{o.amount}</Text>
              <Text style={styles.sectionHint}>{o.status}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F0' },
  content: { paddingBottom: 24 },
  carouselWrap: {
    height: CARD_H + 36,
    width: SCREEN_W,
  },
  swiperContainer: {
    height: CARD_H + 36,
  },
  slide: {
    width: SCREEN_W,
    height: CARD_H + 8,
    paddingLeft: 4,
    paddingRight: 4,
    justifyContent: 'center',
  },
  vipCardWrap: {
    width: CARD_W,
    height: CARD_H,
  },
  vipCardBg: {
    width: CARD_W,
    height: CARD_H,
    justifyContent: 'flex-end',
  },
  vipCardBgImg: {
    width: CARD_W,
    height: CARD_H,
    resizeMode: 'stretch',
  },
  vipCardBottom: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 28,
  },
  vipCardPrice: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  vipCardPeriod: { fontSize: 14, fontWeight: '500' },
  vipCardDay: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pagination: { bottom: 0 },
  dot: { backgroundColor: '#E8D5C8', width: 6, height: 6, borderRadius: 3, marginHorizontal: 3 },
  activeDot: { backgroundColor: '#E85A2B', width: 14, height: 6, borderRadius: 3, marginHorizontal: 3 },
  statusBar: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  memberTag: {
    borderWidth: 1,
    borderColor: '#E85A2B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  memberTagText: { fontSize: 12, color: '#E85A2B', fontWeight: '600' },
  expireText: { fontSize: 13, color: '#666' },
  renewBtn: {
    backgroundColor: '#E85A2B',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  renewBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  privilegeBox: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#FFF8E8',
    borderRadius: 14,
    padding: 14,
  },
  privilegeTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 10 },
  privilegeGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  privilegeItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingRight: 6,
  },
  privilegeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE4D6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  privilegeName: { fontSize: 13, color: '#222', fontWeight: '600' },
  privilegeDesc: { fontSize: 11, color: '#888', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  sectionHint: { fontSize: 12, color: '#999', marginBottom: 10, textAlign: 'center' },
  diamondCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  diamondName: { fontSize: 15, color: '#222', fontWeight: '600' },
  diamondDesc: { fontSize: 12, color: '#888', marginTop: 4 },
  diamondPrice: { fontSize: 18, color: '#E85A2B', fontWeight: '700' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: 'rgba(255,245,240,0.96)',
  },
  buyBtn: {
    backgroundColor: '#E85A2B',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default connect(
  (state) => ({ user: state.user }),
  (dispatch) => ({
    setUserInfo: (payload) => dispatch({ type: 'SET_USERINFO', payload }),
  })
)(Recharge);
