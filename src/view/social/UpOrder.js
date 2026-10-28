import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { SC } from '../../theme/social';
import { ToastService } from '../../component';

class UpOrder extends React.Component {
  state = { list: [], refreshing: false, express: {}, orderState: 1 };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
    this.load();
  }

  load = () => {
    this.setState({ refreshing: true });
    Http('post', '/social/manghe/maijiaDingdan', {
      page: 0,
      pageNum: 50,
      orderState: this.state.orderState,
    })
      .then((res) => {
        if (res?.code === 200) this.setState({ list: res.data?.list || [] });
      })
      .finally(() => this.setState({ refreshing: false }));
  };

  ship = (item) => {
    const expressNo = this.state.express[item._id] || '';
    Http('post', '/social/manghe/maijiaFahuo', { id: item._id, expressNo }).then((res) => {
      if (res?.code === 200) {
        ToastService.success('已发货');
        this.load();
      }
    });
  };

  del = (item) => {
    Http('post', '/social/manghe/deleteBaobei', { id: item._id }).then(() => this.load());
  };

  renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>
        状态 {item.orderState} · {item.recvName} {item.recvPhone}
      </Text>
      <Text style={styles.meta}>{item.targetAddress}</Text>
      {item.orderState === 1 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="快递单号"
            placeholderTextColor={SC.mute}
            value={this.state.express[item._id] || ''}
            onChangeText={(v) =>
              this.setState({ express: { ...this.state.express, [item._id]: v } })
            }
          />
          <Pressable style={styles.btn} onPress={() => this.ship(item)}>
            <Text style={styles.btnTxt}>发货</Text>
          </Pressable>
        </>
      )}
      {!item.owner && (
        <Pressable onPress={() => this.del(item)}>
          <Text style={styles.del}>删除未售出</Text>
        </Pressable>
      )}
    </View>
  );

  render() {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => this.props.navigation.goBack()}>
            <Icons name="left" size={22} color={SC.ink} />
          </Pressable>
          <Text style={styles.navTitle}>卖家订单</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.tabs}>
          {[
            { s: 1, t: '待发货' },
            { s: 2, t: '已发货' },
            { s: 0, t: '未售出' },
            { s: 5, t: '完成' },
          ].map((x) => (
            <Pressable
              key={x.s}
              style={[styles.tab, this.state.orderState === x.s && styles.tabOn]}
              onPress={() => this.setState({ orderState: x.s }, this.load)}
            >
              <Text style={[styles.tabTxt, this.state.orderState === x.s && styles.tabTxtOn]}>
                {x.t}
              </Text>
            </Pressable>
          ))}
        </View>
        <FlatList
          data={this.state.list}
          keyExtractor={(item, i) => String(item._id || i)}
          renderItem={this.renderItem}
          refreshControl={
            <RefreshControl refreshing={this.state.refreshing} onRefresh={this.load} tintColor={SC.rose} />
          }
          contentContainerStyle={{ padding: 16 }}
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
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: SC.soft },
  tabOn: { backgroundColor: SC.rose },
  tabTxt: { fontSize: 12, color: SC.mute, fontWeight: '600' },
  tabTxtOn: { color: '#fff' },
  card: { backgroundColor: SC.soft, borderRadius: 16, padding: 14, marginBottom: 10 },
  title: { fontWeight: '700', color: SC.ink },
  meta: { marginTop: 4, color: SC.mute, fontSize: 12 },
  input: {
    marginTop: 8,
    backgroundColor: SC.blush,
    borderRadius: 10,
    padding: 10,
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
  del: { marginTop: 8, color: SC.mute },
});

export default connect((s) => ({ user: s.user }))(UpOrder);
