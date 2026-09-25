import React, { Component } from 'react';
import {
  StyleSheet,
  FlatList,
  Text,
  View,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';

import { Header } from '../../component';
import Http from '../../utils/HttpPost';

const DIAMOND_PRODUCTS = new Set([
  'flyludo_diamond_10',
  'flyludo_diamond_20',
  'flyludo_diamond_50',
  'flyludo_diamond_100',
  'flyludo_diamond_200',
  'flyludo_diamond_500',
]);

const PRODUCT_NAME = {
  flyludo_diamond_10: '钻石 1000',
  flyludo_diamond_20: '钻石 2000',
  flyludo_diamond_50: '钻石 5000',
  flyludo_diamond_100: '钻石 10000',
  flyludo_diamond_200: '钻石 20000',
  flyludo_diamond_500: '钻石 50000',
};

const STATUS_MAP = {
  pending: { text: '待支付', color: '#F0A04B' },
  completed: { text: '已到账', color: '#52C41A' },
  failed: { text: '失败', color: '#FF4D4F' },
};

class DiamondRecords extends Component {
  state = {
    loading: true,
    refreshing: false,
    list: [],
  };

  componentDidMount() {
    this.loadOrders();
  }

  loadOrders = (refreshing = false) => {
    this.setState(refreshing ? { refreshing: true } : { loading: true });
    Http('get', '/payment/flyludo/orders', { page: 1, pageSize: 50 })
      .then((res) => {
        let list = [];
        if (res?.code === 200) {
          list = (res.data?.list || []).filter((o) => DIAMOND_PRODUCTS.has(o.product));
        }
        this.setState({ list, loading: false, refreshing: false });
      })
      .catch(() => this.setState({ loading: false, refreshing: false }));
  };

  formatTime = (t) => {
    if (!t) return '-';
    const d = new Date(t);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  renderItem = ({ item }) => {
    const st = STATUS_MAP[item.status] || { text: item.status, color: '#999' };
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>{PRODUCT_NAME[item.product] || item.product}</Text>
          <Text style={[styles.status, { color: st.color }]}>{st.text}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.sub}>订单号 {item.orderId}</Text>
          <Text style={styles.amount}>¥{item.amount}</Text>
        </View>
        <Text style={styles.time}>{this.formatTime(item.completedAt || item.createdAt)}</Text>
      </View>
    );
  };

  render() {
    const { loading, refreshing, list } = this.state;
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF6EE" />
        <Header
          title="充值明细"
          leftIcon="left"
          leftIconColor="#333"
          onLeftPress={() => this.props.navigation.goBack()}
          backgroundColor="#FFF6EE"
          isPurecolor
        />
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#F0A04B" />
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item) => item.orderId}
            renderItem={this.renderItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => this.loadOrders(true)}
                colors={['#F0A04B']}
              />
            }
            ListEmptyComponent={
              <Text style={styles.empty}>暂无钻石充值记录</Text>
            }
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF6EE' },
  list: { padding: 16, paddingBottom: 40, flexGrow: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 15, fontWeight: '700', color: '#222' },
  status: { fontSize: 13, fontWeight: '600' },
  sub: { fontSize: 12, color: '#999', marginTop: 8, flex: 1, paddingRight: 8 },
  amount: { fontSize: 16, fontWeight: '700', color: '#F0A04B', marginTop: 8 },
  time: { fontSize: 12, color: '#BBB', marginTop: 8 },
  empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 14 },
});

export default connect((state) => ({ user: state.user }))(DiamondRecords);
