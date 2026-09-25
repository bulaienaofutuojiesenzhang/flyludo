import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Toast } from 'native-base';
import { connect } from 'react-redux';

import { Header } from '../../component';
import Http from '../../utils/HttpPost';
import { fetchFlyludoProducts, payFlyludoProduct } from '../../utils/AlipayPay';

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_PAD = 16;
const GRID_GAP = 10;
const CARD_W = (SCREEN_W - GRID_PAD * 2 - GRID_GAP * 2) / 3;

class Diamond extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      paying: false,
      products: [],
      selectedIndex: 0,
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
        const products = (res.data?.list || []).filter((p) => p.type === 'diamond');
        this.setState({ products, selectedIndex: 0 });
      } else {
        Toast.show({ title: res?.message || '商品加载失败', placement: 'top' });
      }
    } catch (e) {
      Toast.show({ title: '商品加载失败', placement: 'top' });
    } finally {
      this.setState({ loading: false });
    }
  };

  onPay = async () => {
    const item = this.state.products[this.state.selectedIndex];
    if (this.state.paying || !item) return;
    this.setState({ paying: true });
    try {
      const { result } = await payFlyludoProduct(item.product);
      const status = result?.resultStatus != null ? String(result.resultStatus) : '';
      if (status === '9000') {
        Toast.show({ title: '支付成功，钻石稍后到账', placement: 'top' });
        setTimeout(() => this.refreshProfile(), 1500);
        setTimeout(() => this.refreshProfile(), 4000);
      } else if (status === '8000' || status === '6004') {
        Toast.show({ title: '支付确认中，请稍后刷新', placement: 'top' });
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

  renderPackage = (item, index) => {
    const selected = index === this.state.selectedIndex;
    return (
      <TouchableOpacity
        key={item.product}
        activeOpacity={0.85}
        onPress={() => this.setState({ selectedIndex: index })}
        style={[styles.packWrap, { width: CARD_W }]}
      >
        <View style={[styles.packCard, selected && styles.packCardSelected]}>
          <Text style={styles.packEmoji}>💎</Text>
          <Text style={styles.packAmount}>{item.diamond}</Text>
        </View>
        <Text style={styles.packPrice}>¥ {parseFloat(item.amountCny)}</Text>
      </TouchableOpacity>
    );
  };

  render() {
    const { loading, paying, products, selectedIndex } = this.state;
    const balance = this.props.user?.yuanbao || 0;
    const selected = products[selectedIndex];

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF6EE" />
        <Header
          title="钻石充值"
          leftIcon="left"
          leftIconColor="#333"
          onLeftPress={() => this.props.navigation.goBack()}
          rightText="明细"
          rightStyle={{ color: '#333', fontSize: 15 }}
          onRightPress={() => this.props.navigation.navigate('DiamondRecords')}
          backgroundColor="#FFF6EE"
          isPurecolor
        />

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#F0A04B" />
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.balanceCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.balanceLabel}>当前钻石余额</Text>
                  <Text style={styles.balanceValue}>{balance}</Text>
                </View>
                <Text style={styles.balanceCoin}>💎</Text>
              </View>

              <Text style={styles.sectionTitle}>立即充值</Text>
              <View style={styles.grid}>
                {products.map(this.renderPackage)}
              </View>

              <Text style={styles.disclaimer}>
                钻石可用于应用内虚拟权益；虚拟商品充值后不支持退款。{'\n'}
                汇率：1 元 = 100 钻石。支付完成后由服务器异步到账。
              </Text>
              <View style={{ height: 90 }} />
            </ScrollView>

            {selected ? (
              <View style={styles.bottomBar}>
                <TouchableOpacity
                  style={[styles.payBtn, paying && { opacity: 0.7 }]}
                  disabled={paying}
                  onPress={this.onPay}
                >
                  <Text style={styles.payBtnText}>
                    {paying
                      ? '正在唤起支付宝…'
                      : `立即支付·¥${parseFloat(selected.amountCny)}`}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF6EE' },
  content: { paddingHorizontal: GRID_PAD, paddingTop: 8, paddingBottom: 24 },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    shadowColor: '#F0A04B',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  balanceLabel: { fontSize: 13, color: '#999' },
  balanceValue: { fontSize: 40, fontWeight: '800', color: '#333', marginTop: 4 },
  balanceCoin: { fontSize: 48, marginLeft: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#222', marginBottom: 14 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -GRID_GAP / 2,
  },
  packWrap: {
    paddingHorizontal: GRID_GAP / 2,
    marginBottom: 14,
  },
  packCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F0E6DA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    minHeight: 96,
  },
  packCardSelected: {
    borderColor: '#F0A04B',
    backgroundColor: '#FFF8EC',
  },
  packEmoji: { fontSize: 26, marginBottom: 6 },
  packAmount: { fontSize: 20, fontWeight: '800', color: '#F0A04B' },
  packPrice: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  disclaimer: {
    marginTop: 8,
    fontSize: 12,
    color: '#AAA',
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: 'rgba(255,246,238,0.96)',
  },
  payBtn: {
    backgroundColor: '#F0A04B',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default connect(
  (state) => ({ user: state.user }),
  (dispatch) => ({
    setUserInfo: (payload) => dispatch({ type: 'SET_USERINFO', payload }),
  })
)(Diamond);
