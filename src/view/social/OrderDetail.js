import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { SC } from '../../theme/social';

const STATE_TXT = { 0: '待填地址', 1: '待发货', 2: '已发货', 5: '已完成' };

class OrderDetail extends React.Component {
  state = { list: [], refreshing: false, editingId: null, address: '', name: '', phone: '' };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
    this.load();
  }

  load = () => {
    this.setState({ refreshing: true });
    Http('post', '/social/manghe/myBaobei', { page: 0, pageNum: 50 })
      .then((res) => {
        if (res?.code === 200) this.setState({ list: res.data?.list || [] });
      })
      .finally(() => this.setState({ refreshing: false }));
  };

  submitAddress = (item) => {
    Http('post', '/social/manghe/myBaobeiFahuo', {
      id: item._id,
      targetAddress: this.state.address,
      name: this.state.name,
      phone: this.state.phone,
    }).then((res) => {
      if (res?.code === 200) {
        Alert.alert('已提交');
        this.setState({ editingId: null });
        this.load();
      }
    });
  };

  confirmRecv = (item) => {
    Http('post', '/social/manghe/myBaobeiShouhuo', { id: item._id }).then((res) => {
      if (res?.code === 200) {
        Alert.alert('已确认收货');
        this.load();
      }
    });
  };

  renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>
        {STATE_TXT[item.orderState] || item.orderState} · {item.price} 钻
      </Text>
      {item.orderState === 0 && (
        <>
          {this.state.editingId === item._id ? (
            <View>
              <TextInput
                style={styles.input}
                placeholder="收货人"
                placeholderTextColor={SC.mute}
                value={this.state.name}
                onChangeText={(name) => this.setState({ name })}
              />
              <TextInput
                style={styles.input}
                placeholder="手机号"
                placeholderTextColor={SC.mute}
                value={this.state.phone}
                onChangeText={(phone) => this.setState({ phone })}
              />
              <TextInput
                style={styles.input}
                placeholder="地址"
                placeholderTextColor={SC.mute}
                value={this.state.address}
                onChangeText={(address) => this.setState({ address })}
              />
              <Pressable style={styles.btn} onPress={() => this.submitAddress(item)}>
                <Text style={styles.btnTxt}>提交地址</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.btn} onPress={() => this.setState({ editingId: item._id })}>
              <Text style={styles.btnTxt}>填写地址</Text>
            </Pressable>
          )}
        </>
      )}
      {item.orderState === 2 && (
        <Pressable style={styles.btn} onPress={() => this.confirmRecv(item)}>
          <Text style={styles.btnTxt}>确认收货</Text>
        </Pressable>
      )}
      {item.expressNo ? <Text style={styles.meta}>快递：{item.expressNo}</Text> : null}
    </View>
  );

  render() {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => this.props.navigation.goBack()}>
            <Icons name="left" size={22} color={SC.ink} />
          </Pressable>
          <Text style={styles.navTitle}>我的盲盒</Text>
          <Pressable onPress={() => this.props.navigation.navigate('UpOrder')}>
            <Text style={styles.link}>卖家</Text>
          </Pressable>
        </View>
        <FlatList
          data={this.state.list}
          keyExtractor={(item, i) => String(item._id || i)}
          renderItem={this.renderItem}
          refreshControl={
            <RefreshControl refreshing={this.state.refreshing} onRefresh={this.load} tintColor={SC.rose} />
          }
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>暂无订单</Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SC.blush },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navTitle: { fontSize: 17, fontWeight: '700', color: SC.ink },
  link: { color: SC.rose, fontWeight: '700' },
  card: { backgroundColor: SC.soft, borderRadius: 16, padding: 14, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '700', color: SC.ink },
  meta: { marginTop: 6, color: SC.mute, fontSize: 12 },
  input: {
    marginTop: 8,
    backgroundColor: SC.blush,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: SC.ink,
  },
  btn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: SC.rose,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  btnTxt: { color: '#fff', fontWeight: '700' },
  empty: { alignItems: 'center', padding: 40 },
  emptyTitle: { color: SC.mute },
});

export default connect((s) => ({ user: s.user }))(OrderDetail);
