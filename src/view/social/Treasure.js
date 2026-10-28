import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ImageBackground,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { SC } from '../../theme/social';
import { AppDialog, ToastService } from '../../component';

const { width: W } = Dimensions.get('window');
const PAD = 10;
const CARD_W = (W - PAD * 2 - 10) / 2;
const CARD_H = CARD_W * (659 / 634);
const DX_W = W - PAD * 2;
const DX_H = DX_W * (455 / 516) * 0.92;

const BOXES = [
  {
    hezi: 1,
    price: 100,
    bg: require('../../asserts/images/manghe/xingyunhe.png'),
    header: require('../../asserts/images/manghe/xingyun.png'),
  },
  {
    hezi: 2,
    price: 200,
    bg: require('../../asserts/images/manghe/nvshenhe.png'),
    header: require('../../asserts/images/manghe/nvshen.png'),
  },
];

const DIRECT = {
  hezi: 3,
  price: 500,
  bg: require('../../asserts/images/manghe/hezibg.png'),
  header: require('../../asserts/images/manghe/dingxiang.png'),
  icon: require('../../asserts/images/manghe/dingxianghe.png'),
};

const BTN_DISE = require('../../asserts/images/manghe/dise.png');
const DIA_ICON = require('../../asserts/images/manghe/iconDiamond.png');

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
          if (!item) {
            AppDialog.show({
              title: '空空如也',
              message: '暂时没有可开的盲盒，去上架一个吧',
            });
          }
        } else if (res?.code === 600) {
          AppDialog.diamondInsufficient().then((go) => {
            if (go) this.props.navigation.navigate('Diamond');
          });
        }
      })
      .finally(() => this.setState({ busy: false }));
  };

  buy = () => {
    const item = this.state.result;
    if (!item) return;
    Http('post', '/social/manghe/getBaobei', { id: item._id, price: item.price }).then(async (res) => {
      if (res?.code === 200) {
        if (res.data?.yuanbao != null) this.props.setUserInfo({ yuanbao: res.data.yuanbao });
        this.setState({ result: null });
        const go = await AppDialog.confirm({
          title: '到手了',
          message: '可在「我的盲盒」填写收货地址',
          cancelText: '好的',
          confirmText: '去看看',
        });
        if (go) this.props.navigation.navigate('OrderDetail');
      } else if (res?.code === 600) {
        AppDialog.diamondInsufficient({ message: res.message || '请先充值钻石' }).then((go) => {
          if (go) this.props.navigation.navigate('Diamond');
        });
      } else {
        ToastService.warn(res?.message || '手慢了');
      }
    });
  };

  drawBtn = (price, onPress) => (
    <Pressable disabled={this.state.busy} onPress={onPress}>
      <ImageBackground style={styles.btnBg} source={BTN_DISE} resizeMode="stretch">
        <Text style={styles.btnTxt}>{this.state.busy ? '开盒中…' : '抽一次'}</Text>
        <View style={styles.priceRow}>
          <Image source={DIA_ICON} style={styles.dia} />
          <Text style={styles.btnPrice}>{price}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );

  render() {
    const item = this.state.result;
    const photo = Array.isArray(item?.photoList)
      ? item.photoList[0]
      : String(item?.photoList || '')
          .split(',')
          .filter(Boolean)[0];

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
        <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 40 }}>
          <Text style={styles.bal}>钻石余额 {Math.floor(this.props.user?.yuanbao || 0)}</Text>
          <View style={styles.row}>
            {BOXES.map((b) => (
              <ImageBackground key={b.hezi} style={styles.card} source={b.bg} resizeMode="stretch">
                <Image style={styles.header} source={b.header} resizeMode="contain" />
                <View style={styles.btnSlot}>{this.drawBtn(b.price, () => this.open(b.hezi))}</View>
              </ImageBackground>
            ))}
          </View>
          <ImageBackground style={styles.direct} source={DIRECT.bg} resizeMode="stretch">
            <Image style={styles.headerDx} source={DIRECT.header} resizeMode="contain" />
            <View style={styles.dxBody}>
              <Image style={styles.dxIcon} source={DIRECT.icon} resizeMode="contain" />
              <View style={styles.dxRight}>
                <Text style={styles.dxTip}>至尊 UP · 可定向抽取</Text>
                {this.drawBtn(DIRECT.price, () => this.open(DIRECT.hezi))}
              </View>
            </View>
          </ImageBackground>
          {item ? (
            <View style={styles.result}>
              <Text style={styles.resTitle}>{item.title}</Text>
              <Text style={styles.resDesc}>{item.describe}</Text>
              {photo ? <Image source={{ uri: photo }} style={styles.img} /> : null}
              <View style={styles.priceRow}>
                <Text style={styles.resPrice}>确认购买 {item.price}</Text>
                <Image source={DIA_ICON} style={styles.dia} />
              </View>
              <Pressable style={styles.cta} onPress={this.buy}>
                <Text style={styles.ctaTxt}>果断买下</Text>
              </Pressable>
            </View>
          ) : null}
          <Pressable style={styles.up} onPress={() => this.props.navigation.navigate('UpManghe')}>
            <Text style={styles.upTxt}>我要上架盲盒</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F5FB' },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navTitle: { fontSize: 17, fontWeight: '700', color: SC.ink },
  link: { color: '#7A6CF0', fontWeight: '700' },
  bal: { color: '#8A8898', fontSize: 12, marginBottom: 10, paddingHorizontal: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  card: { width: CARD_W, height: CARD_H, alignItems: 'center', paddingTop: 10 },
  header: { width: CARD_W * 0.72, height: CARD_W * 0.18 },
  btnSlot: { position: 'absolute', left: 0, right: 0, bottom: 14, alignItems: 'center' },
  btnBg: {
    width: CARD_W * 0.78,
    height: CARD_W * 0.28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  btnPrice: { color: '#fff', fontSize: 12, marginLeft: 3, fontWeight: '600' },
  dia: { width: 12, height: 12 },
  direct: {
    marginTop: 12,
    width: DX_W,
    height: DX_H,
    alignSelf: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  headerDx: { width: DX_W * 0.42, height: DX_W * 0.1 },
  dxBody: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  dxIcon: { width: 78, height: 74 },
  dxRight: { marginLeft: 12, alignItems: 'center' },
  dxTip: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginBottom: 8, fontWeight: '600' },
  result: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
  },
  resTitle: { fontSize: 16, fontWeight: '800', color: '#222' },
  resDesc: { marginTop: 4, fontSize: 13, color: '#888' },
  img: { marginTop: 10, width: '100%', height: 160, borderRadius: 10 },
  resPrice: { fontSize: 13, fontWeight: '700', color: '#FF4D4F', marginRight: 4 },
  cta: {
    marginTop: 12,
    backgroundColor: '#7A6CF0',
    borderRadius: 18,
    paddingVertical: 11,
    alignItems: 'center',
  },
  ctaTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  up: { marginTop: 18, alignItems: 'center', paddingVertical: 12 },
  upTxt: { color: '#7A6CF0', fontWeight: '700' },
});

export default connect(
  (s) => ({ user: s.user }),
  (d) => ({ setUserInfo: (p) => d({ type: 'SET_USERINFO', payload: p }) })
)(Treasure);
