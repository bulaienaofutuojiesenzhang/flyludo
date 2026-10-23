import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { SC } from '../../theme/social';

const BOXES = [
  { hezi: 1, title: '幸运盒', price: 100, desc: '随机惊喜' },
  { hezi: 2, title: '女神盒', price: 200, desc: '品质更高' },
  { hezi: 3, title: '至尊盒', price: 500, desc: '顶级掉落' },
];

class Treasure extends React.Component {
  state = { result: null, busy: false };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
  }

  open = (hezi) => {
    this.setState({ busy: true, result: null });
    Http('post', '/social/manghe/findBaobei', { hezi, num: 1, sex: 0 })
      .then((res) => {
        if (res?.code === 200) {
          const item = (res.data?.list || [])[0] || null;
          this.setState({ result: item });
          if (res.data?.yuanbao != null) {
            this.props.setUserInfo({ yuanbao: res.data.yuanbao });
          }
          if (!item) Alert.alert('空空如也', '暂时没有可开的盲盒，去上架一个吧');
        } else if (res?.code === 600) {
          Alert.alert('钻石不足', '请先充值', [
            { text: '去充值', onPress: () => this.props.navigation.navigate('Diamond') },
            { text: '取消' },
          ]);
        }
      })
      .finally(() => this.setState({ busy: false }));
  };

  buy = () => {
    const item = this.state.result;
    if (!item) return;
    Http('post', '/social/manghe/getBaobei', { id: item._id, price: item.price }).then((res) => {
      if (res?.code === 200) {
        Alert.alert('到手了', '可在「我的盲盒」填写收货地址', [
          { text: '去看看', onPress: () => this.props.navigation.navigate('OrderDetail') },
          { text: '好的' },
        ]);
        if (res.data?.yuanbao != null) this.props.setUserInfo({ yuanbao: res.data.yuanbao });
        this.setState({ result: null });
      } else if (res?.code === 600) {
        Alert.alert('钻石不足', res.message || '');
      } else {
        Alert.alert('未抢到', res?.message || '手慢了');
      }
    });
  };

  render() {
    const item = this.state.result;
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => this.props.navigation.goBack()}>
            <Icons name="left" size={22} color={SC.ink} />
          </Pressable>
          <Text style={styles.navTitle}>寻宝盲盒</Text>
          <Pressable onPress={() => this.props.navigation.navigate('OrderDetail')}>
            <Text style={styles.link}>订单</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={styles.bal}>钻石余额 {Math.floor(this.props.user?.yuanbao || 0)}</Text>
          {BOXES.map((b) => (
            <Pressable
              key={b.hezi}
              style={styles.box}
              disabled={this.state.busy}
              onPress={() => this.open(b.hezi)}
            >
              <Text style={styles.boxTitle}>{b.title}</Text>
              <Text style={styles.boxDesc}>{b.desc}</Text>
              <Text style={styles.boxPrice}>{b.price} 钻 / 次</Text>
            </Pressable>
          ))}
          {item ? (
            <View style={styles.result}>
              <Text style={styles.resTitle}>{item.title}</Text>
              <Text style={styles.resDesc}>{item.describe}</Text>
              {item.photoList?.[0] ? (
                <Image source={{ uri: item.photoList[0] }} style={styles.img} />
              ) : null}
              <Text style={styles.boxPrice}>确认购买 {item.price} 钻</Text>
              <Pressable style={styles.cta} onPress={this.buy}>
                <Text style={styles.ctaTxt}>收下</Text>
              </Pressable>
            </View>
          ) : null}
          <Pressable
            style={styles.up}
            onPress={() => this.props.navigation.navigate('UpManghe')}
          >
            <Text style={styles.upTxt}>我要上架盲盒</Text>
          </Pressable>
        </ScrollView>
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
  bal: { color: SC.mute, marginBottom: 12 },
  box: {
    backgroundColor: SC.soft,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  boxTitle: { fontSize: 18, fontWeight: '800', color: SC.ink },
  boxDesc: { marginTop: 4, color: SC.mute },
  boxPrice: { marginTop: 10, color: SC.rose, fontWeight: '700' },
  result: {
    marginTop: 8,
    backgroundColor: SC.card,
    borderRadius: 18,
    padding: 16,
  },
  resTitle: { fontSize: 18, fontWeight: '800', color: SC.ink },
  resDesc: { marginTop: 6, color: SC.mute },
  img: { marginTop: 10, width: '100%', height: 160, borderRadius: 12 },
  cta: {
    marginTop: 14,
    backgroundColor: SC.rose,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaTxt: { color: '#fff', fontWeight: '700' },
  up: { marginTop: 20, alignItems: 'center', padding: 12 },
  upTxt: { color: SC.ink, fontWeight: '700' },
});

export default connect(
  (s) => ({ user: s.user }),
  (d) => ({ setUserInfo: (p) => d({ type: 'SET_USERINFO', payload: p }) })
)(Treasure);
