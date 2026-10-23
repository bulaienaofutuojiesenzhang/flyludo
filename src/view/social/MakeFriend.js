import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ImageBackground,
  StatusBar,
  RefreshControl,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { isVipActive } from '../../utils/vip';

import CachedImage, { preloadImages } from '../../component/CachedImage';
const { width: W } = Dimensions.get('window');
const S = W / 750;
const BLOCK_W = 370 * S;
const BLOCK_H = 651 * S;
const BTN_W = 298 * S;
const PAGE_NUM = 20;

const BG = '#F6F5FB';
const MAIN = '#7A6CF0';
const PRICE = '#FF4D4F';
const BLUE = '#C5DDFE';
const PINK = '#FDA0BB';

const SORTS = [
  { key: 'new', label: '最新' },
  { key: 'price_asc', label: '价格低' },
  { key: 'price_desc', label: '价格高' },
];

const SCOPES = [
  { key: 'all', label: '全部' },
  { key: 'public', label: '公开' },
  { key: 'vip', label: 'VIP专享' },
];
const VIP_GOLD = '#F7B731';

const CARD_GAP = 8;
const COL_PAD = 8;
const CARD_W = (W - COL_PAD * 2 - CARD_GAP) / 2;
const RATIOS = [1, 1.25, 0.82, 1.4, 1.1, 0.9];

/** 同一个 id 永远同一个比例，瀑布流不抖动 */
function ratioOf(id) {
  const s = String(id || '');
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) % 9973;
  }
  return RATIOS[h % RATIOS.length];
}

function cardHeight(item) {
  return CARD_W * ratioOf(item._id) + 92;
}

function GenderDot({ gender }) {
  if (!gender) {
    return null;
  }
  const male = Number(gender) === 1;
  return (
    <View style={[styles.gDot, { backgroundColor: male ? BLUE : PINK }]}>
      <Icons name={male ? 'man' : 'woman'} size={8} color="#fff" />
    </View>
  );
}

class MakeFriend extends React.Component {
  state = {
    refreshing: false,
    loading: false,
    sort: 'new',
    scope: 'all',
    keyword: '',
    searchText: '',
    list: [],
    page: 0,
    noMore: false,
    inited: false,
    drawList: null,
    previewSex: 0,
    previewList: null,
    busy: false,
  };

  componentDidMount() {
    this.focusUnsub = this.props.navigation.addListener('focus', () => {
      StatusBar.setBarStyle('dark-content');
      // 从上架页/详情页回来后刷新
      if (this.state.inited) {
        this.reload();
      }
    });
    this.reload();
  }

  componentDidUpdate(prev) {
    if (!prev.user?.isLogged && this.props.user?.isLogged) {
      this.reload();
    }
  }

  componentWillUnmount() {
    this.focusUnsub && this.focusUnsub();
  }

  requireLogin = (fn) => {
    if (!this.props.user?.isLogged) {
      this.props.navigation.navigate('Login');
      return;
    }
    fn && fn();
  };

  /* ---------------- 寻宝列表 ---------------- */

  fetchPage = (page, replace) => {
    if (!this.props.user?.isLogged) {
      this.setState({ list: [], inited: true, refreshing: false, loading: false, noMore: true });
      return Promise.resolve();
    }
    const { sort, keyword, scope } = this.state;
    this.setState({ loading: true });
    return Http('post', '/social/manghe/listBaobei', {
      sort,
      scope,
      keyword,
      page,
      pageNum: PAGE_NUM,
    })
      .then((res) => {
        if (res?.code !== 200) {
          return;
        }
        const rows = res.data?.list || [];
        preloadImages(rows.flatMap((r) => [r.cover, r.seller?.myFace]));
        this.setState((s) => ({
          list: replace ? rows : [...s.list, ...rows],
          page,
          noMore: rows.length < PAGE_NUM,
        }));
      })
      .catch(() => {})
      .finally(() => this.setState({ loading: false, refreshing: false, inited: true }));
  };

  reload = () => this.fetchPage(0, true);

  loadMore = () => {
    const { loading, noMore, page } = this.state;
    if (loading || noMore) {
      return;
    }
    this.fetchPage(page + 1, false);
  };

  onScroll = ({ nativeEvent: e }) => {
    const { layoutMeasurement, contentOffset, contentSize } = e;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 240) {
      this.loadMore();
    }
  };

  onRefresh = () => {
    this.setState({ refreshing: true });
    this.reload();
  };

  changeSort = (sort) => {
    if (sort === this.state.sort) {
      return;
    }
    this.setState({ sort, list: [], page: 0, noMore: false }, this.reload);
  };

  changeScope = (scope) => {
    if (scope === this.state.scope) {
      return;
    }
    this.setState({ scope, list: [], page: 0, noMore: false }, this.reload);
  };

  /** 最新 → 价格低 → 价格高 循环切换 */
  nextSort = () => {
    const i = SORTS.findIndex((s) => s.key === this.state.sort);
    this.changeSort(SORTS[(i + 1) % SORTS.length].key);
  };

  submitSearch = () => {
    this.setState(
      { keyword: this.state.searchText.trim(), list: [], page: 0, noMore: false },
      this.reload
    );
  };

  clearSearch = () => {
    this.setState({ searchText: '', keyword: '', list: [], page: 0, noMore: false }, this.reload);
  };

  openItem = (item) => {
    if (item.locked) {
      Alert.alert('VIP 专享宝贝', '开通 VIP 后即可查看并购买这件宝贝', [
        { text: '去开通', onPress: () => this.props.navigation.navigate('Recharge') },
        { text: '再看看', style: 'cancel' },
      ]);
      return;
    }
    this.props.navigation.navigate('TreasureDetail', { item });
  };

  upItem = () => {
    this.requireLogin(() => this.props.navigation.navigate('UpManghe'));
  };

  /* ---------------- 微信盲盒 ---------------- */

  draw = (sex, num) => {
    this.requireLogin(() => {
      if (this.state.busy) {
        return;
      }
      const unit = sex === 1 ? 100 : 200;
      const cost = unit * num;
      if (Number(this.props.user?.yuanbao || 0) < cost) {
        this.noDiamond();
        return;
      }
      this.setState({ busy: true });
      Http('post', '/social/manghe/getFriendWx', { num, sex })
        .then((res) => {
          if (res?.code === 200) {
            const rows = res.data?.list || [];
            if (res.data?.yuanbao != null) {
              this.props.setUserInfo({ yuanbao: res.data.yuanbao });
            }
            this.setState({ drawList: rows });
          } else if (res?.code === 600) {
            this.noDiamond();
          } else {
            Alert.alert('提示', res?.message || '暂无可抽的用户');
          }
        })
        .catch(() => {})
        .finally(() => this.setState({ busy: false }));
    });
  };

  noDiamond = () => {
    Alert.alert('钻石不足', '请先充值钻石', [
      { text: '去充值', onPress: () => this.props.navigation.navigate('Diamond') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  openPreview = (sex) => {
    this.requireLogin(() => {
      Http('post', '/social/manghe/previewFriendWx', { sex }).then((res) => {
        if (res?.code === 200) {
          const rows = res.data?.list || [];
          if (!rows.length) {
            Alert.alert('提示', sex === 1 ? '男生盒子暂无可预览' : '女生盒子暂无可预览');
            return;
          }
          this.setState({ previewList: rows, previewSex: sex });
        } else {
          Alert.alert('提示', res?.message || '预览失败');
        }
      });
    });
  };

  unlock = (item) => {
    if (!isVipActive(this.props.user)) {
      Alert.alert('需要 VIP', '直接选定需先开通 VIP', [
        { text: '去开通', onPress: () => this.closePreview(() => this.props.navigation.navigate('Recharge')) },
        { text: '取消', style: 'cancel' },
      ]);
      return;
    }
    if (Number(this.props.user?.yuanbao || 0) < 2000) {
      this.noDiamond();
      return;
    }
    Alert.alert('选定解锁', `花费 2000 钻石解锁「${item.nickName || 'TA'}」的微信？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '确认解锁',
        onPress: () => {
          Http('post', '/social/manghe/unlockFriendWx', { targetId: item._id }).then((res) => {
            if (res?.code === 200 && res.data?.item) {
              if (res.data.yuanbao != null) {
                this.props.setUserInfo({ yuanbao: res.data.yuanbao });
              }
              this.setState({ previewList: null, drawList: [res.data.item] });
            } else if (res?.code === 600) {
              this.noDiamond();
            } else {
              Alert.alert('提示', res?.message || '解锁失败');
            }
          });
        },
      },
    ]);
  };

  closePreview = (cb) => {
    this.setState({ previewList: null }, cb);
  };

  /* ---------------- 渲染 ---------------- */

  renderBlock = (sex) => {
    const boy = sex === 1;
    const unit = boy ? 100 : 200;
    return (
      <ImageBackground
        style={styles.block}
        source={
          boy
            ? require('../../asserts/images/manghe/bgboy.png')
            : require('../../asserts/images/manghe/bggril.png')
        }
        resizeMode="stretch"
      >
        <Pressable style={styles.previewBtn} onPress={() => this.openPreview(sex)}>
          <Text style={styles.previewTxt}>预览</Text>
        </Pressable>
        <Image
          style={styles.blockHead}
          source={
            boy
              ? require('../../asserts/images/manghe/boy.png')
              : require('../../asserts/images/manghe/gril.png')
          }
        />
        <Image
          style={styles.blockTitle}
          source={
            boy
              ? require('../../asserts/images/manghe/boxboy.png')
              : require('../../asserts/images/manghe/boxgril.png')
          }
        />
        <Pressable style={[styles.btn, styles.btnMain]} onPress={() => this.draw(sex, 1)}>
          <Text style={styles.btnTxt}>{boy ? '抽一张男生微信' : '抽一张女生微信'}</Text>
          <Image
            source={require('../../asserts/images/manghe/iconDiamond.png')}
            style={styles.dia}
          />
          <Text style={styles.btnPrice}>{unit}</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnMulti]} onPress={() => this.draw(sex, 5)}>
          <Text style={styles.btnTxt}>
            五连抽 <Text style={styles.gift}>(送1张)</Text>
          </Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnMulti]} onPress={() => this.draw(sex, 10)}>
          <Text style={styles.btnTxt}>
            十连抽 <Text style={styles.gift}>(送3张)</Text>
          </Text>
        </Pressable>
      </ImageBackground>
    );
  };

  renderCard = (item) => {
    const h = CARD_W * ratioOf(item._id);
    const locked = !!item.locked;
    return (
      <Pressable key={item._id} style={styles.card} onPress={() => this.openItem(item)}>
        {item.cover ? (
          <CachedImage source={{ uri: item.cover }} style={{ width: CARD_W, height: h }} />
        ) : (
          <View
            style={[
              styles.noCover,
              { width: CARD_W, height: h },
              locked && styles.lockedCover,
            ]}
          >
            <Icons name={locked ? 'lock' : 'gift'} size={locked ? 36 : 34} color={locked ? VIP_GOLD : '#B9B2F5'} />
            {locked ? <Text style={styles.lockedTxt}>开通 VIP 查看</Text> : null}
          </View>
        )}
        {item.vipOnly ? (
          <View style={styles.vipTag}>
            <Text style={styles.vipTagTxt}>VIP专享</Text>
          </View>
        ) : null}
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, locked && styles.lockedTitle]} numberOfLines={2}>
            {locked ? 'VIP 专享宝贝' : item.title}
          </Text>
          <View style={styles.priceRow}>
            {locked ? (
              <Text style={styles.lockedPrice}>价格 · VIP 可见</Text>
            ) : (
              <>
                <Image
                  source={require('../../asserts/images/manghe/iconDiamond.png')}
                  style={styles.priceIcon}
                />
                <Text style={styles.price}>{item.price}</Text>
              </>
            )}
            {item.mine ? <Text style={styles.mineTag}>我的</Text> : null}
          </View>
          <View style={styles.sellerRow}>
            {item.seller?.myFace ? (
              <CachedImage source={{ uri: item.seller.myFace }} style={styles.sAvatar} />
            ) : (
              <View style={[styles.sAvatar, styles.sAvatarPh]} />
            )}
            <Text style={styles.sName} numberOfLines={1}>
              {item.seller?.nickName || '神秘人'}
            </Text>
            <GenderDot gender={item.seller?.gender} />
            {!!item.seller?.city && (
              <Text style={styles.sCity} numberOfLines={1}>
                {item.seller.city}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  renderMasonry = () => {
    const left = [];
    const right = [];
    let lh = 0;
    let rh = 0;
    this.state.list.forEach((item) => {
      const h = cardHeight(item);
      if (lh <= rh) {
        left.push(item);
        lh += h;
      } else {
        right.push(item);
        rh += h;
      }
    });
    return (
      <View style={styles.masonry}>
        <View style={styles.col}>{left.map(this.renderCard)}</View>
        <View style={styles.col}>{right.map(this.renderCard)}</View>
      </View>
    );
  };

  renderTreasureHead = () => (
    <View style={styles.tHead}>
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Icons name="search1" size={15} color="#9A98A8" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜宝贝，找惊喜"
            placeholderTextColor="#B2B0BE"
            value={this.state.searchText}
            returnKeyType="search"
            onChangeText={(searchText) => this.setState({ searchText })}
            onSubmitEditing={this.submitSearch}
          />
          {!!this.state.searchText && (
            <Pressable onPress={this.clearSearch} hitSlop={8}>
              <Icons name="closecircle" size={14} color="#C5C3D0" />
            </Pressable>
          )}
        </View>
        <Pressable style={styles.upBtn} onPress={this.upItem}>
          <Icons name="plus" size={13} color="#fff" />
          <Text style={styles.upTxt}>上架</Text>
        </Pressable>
      </View>
      <View style={styles.sortRow}>
        <Text style={styles.sortTitle}>寻宝</Text>
        {SCOPES.map((s) => (
          <Pressable key={s.key} style={styles.sortItem} onPress={() => this.changeScope(s.key)}>
            <Text style={[styles.sortTxt, this.state.scope === s.key && styles.sortOn]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
        <Pressable style={styles.sortPill} onPress={this.nextSort}>
          <Text style={styles.sortPillTxt}>
            {SORTS.find((s) => s.key === this.state.sort)?.label}
          </Text>
          <Icons name="swap" size={11} color="#8A8898" style={{ marginLeft: 3 }} />
        </Pressable>
      </View>
    </View>
  );

  renderFooter = () => {
    const { loading, noMore, list, inited } = this.state;
    if (!this.props.user?.isLogged) {
      return (
        <Pressable style={styles.empty} onPress={() => this.props.navigation.navigate('Login')}>
          <Icons name="gift" size={40} color="#B9B2F5" />
          <Text style={styles.emptyTxt}>登录后查看大家上架的宝贝</Text>
          <View style={styles.emptyBtn}>
            <Text style={styles.emptyBtnTxt}>去登录</Text>
          </View>
        </Pressable>
      );
    }
    if (!inited || (loading && !list.length)) {
      return <ActivityIndicator style={{ marginVertical: 40 }} color={MAIN} />;
    }
    if (!list.length) {
      return (
        <Pressable style={styles.empty} onPress={this.upItem}>
          <Icons name="gift" size={40} color="#B9B2F5" />
          <Text style={styles.emptyTxt}>
            {this.state.keyword ? '没有找到相关宝贝' : '还没有宝贝，来上架第一个吧'}
          </Text>
          <View style={styles.emptyBtn}>
            <Text style={styles.emptyBtnTxt}>我要上架</Text>
          </View>
        </Pressable>
      );
    }
    return (
      <Text style={styles.footTxt}>{noMore ? '— 到底啦 —' : loading ? '加载中…' : ''}</Text>
    );
  };

  renderPerson = (u, i) => {
    const male = Number(u.gender ?? u.sex) === 1;
    return (
      <View style={styles.person} key={`${u._id}_${i}`}>
        <View style={styles.personTop}>
          {u.myFace ? (
            <CachedImage source={{ uri: u.myFace }} style={styles.pAvatar} />
          ) : (
            <View style={[styles.pAvatar, styles.sAvatarPh]} />
          )}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={styles.rowC}>
              <Text style={styles.pName} numberOfLines={1}>
                {u.nickName || u.name || '纸飞机'}
              </Text>
              <View style={[styles.gDot, { backgroundColor: male ? BLUE : PINK, marginLeft: 6 }]}>
                <Icons name={male ? 'man' : 'woman'} size={8} color="#fff" />
              </View>
            </View>
            <Text style={styles.pCity}>{u.city || '隐匿地址'}</Text>
          </View>
        </View>
        <Text style={styles.pWx} selectable>
          微信：<Text style={styles.pWxVal}>{u.wechatNo}</Text>
        </Text>
        <Text style={styles.pTip}>长按微信号可复制，添加时备注「同城有约」更容易通过</Text>
      </View>
    );
  };

  renderDrawModal = () => {
    const rows = this.state.drawList;
    return (
      <Modal visible={!!rows} transparent animationType="fade" onRequestClose={() => this.setState({ drawList: null })}>
        <View style={styles.mask}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>抽到 {rows ? rows.length : 0} 个微信</Text>
            <ScrollView style={{ maxHeight: 340 }}>{(rows || []).map(this.renderPerson)}</ScrollView>
            <View style={styles.sheetBtns}>
              <Pressable
                style={[styles.sBtn, styles.sBtnGhost]}
                onPress={() =>
                  this.setState({ drawList: null }, () => this.props.navigation.navigate('MyWeFriend'))
                }
              >
                <Text style={styles.sBtnGhostTxt}>查看行囊</Text>
              </Pressable>
              <Pressable style={[styles.sBtn, styles.sBtnMain]} onPress={() => this.setState({ drawList: null })}>
                <Text style={styles.sBtnMainTxt}>收入囊中</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  renderPreviewModal = () => {
    const rows = this.state.previewList;
    const boy = this.state.previewSex === 1;
    return (
      <Modal visible={!!rows} transparent animationType="slide" onRequestClose={() => this.closePreview()}>
        <View style={styles.mask}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => this.closePreview()} />
          <View style={[styles.sheet, { maxHeight: '72%' }]}>
            <View style={styles.pvHead}>
              <Text style={styles.sheetTitle}>{boy ? '男生盒子预览' : '女生盒子预览'}</Text>
              <Text style={styles.pvTip}>VIP 可直接选定解锁</Text>
            </View>
            <ScrollView>
              {(rows || []).map((u) => (
                <Pressable key={u._id} style={styles.pvRow} onPress={() => this.unlock(u)}>
                  {u.myFace ? (
                    <CachedImage source={{ uri: u.myFace }} style={styles.pvAvatar} />
                  ) : (
                    <View style={[styles.pvAvatar, styles.sAvatarPh]} />
                  )}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.pName} numberOfLines={1}>
                      {u.nickName || '纸飞机'}
                    </Text>
                    <Text style={styles.pCity}>{u.city || '隐匿地址'}</Text>
                    <Text style={styles.pMask}>微信：{u.weChatMask || '*****'}</Text>
                  </View>
                  <View style={styles.unlockPill}>
                    <Image
                      source={require('../../asserts/images/manghe/iconDiamond.png')}
                      style={styles.dia}
                    />
                    <Text style={styles.unlockTxt}>2000</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.closeRow} onPress={() => this.closePreview()}>
              <Text style={styles.closeTxt}>关闭</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={this.onScroll}
          scrollEventThrottle={200}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} colors={[MAIN]} />
          }
        >
          <View style={styles.blocks}>
            {this.renderBlock(1)}
            {this.renderBlock(2)}
          </View>
          {this.renderTreasureHead()}
          {this.renderMasonry()}
          {this.renderFooter()}
        </ScrollView>
        {this.renderDrawModal()}
        {this.renderPreviewModal()}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  rowC: { flexDirection: 'row', alignItems: 'center' },

  /* 盒子 */
  blocks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  block: { width: BLOCK_W, height: BLOCK_H, alignItems: 'center' },
  previewBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    elevation: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  previewTxt: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  blockHead: { width: BTN_W, height: 262 * 0.712 * S, marginTop: 77 * S },
  blockTitle: { width: 210 * 0.712 * S, height: 62 * 0.712 * S, marginTop: 20 * S },
  btn: {
    width: BTN_W,
    height: 80 * S,
    marginTop: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnMain: { backgroundColor: '#F4998A' },
  btnMulti: { backgroundColor: '#F7BE6E' },
  btnTxt: { fontSize: 14, color: '#fff' },
  btnPrice: { fontSize: 10, color: '#fff', marginLeft: 2 },
  gift: { fontSize: 9, color: '#E0381F' },
  dia: { width: 10, height: 10, marginLeft: 3 },

  /* 寻宝头部 */
  tHead: { paddingHorizontal: COL_PAD, marginTop: 14 },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  search: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, marginLeft: 6, fontSize: 14, color: '#222', paddingVertical: 0 },
  upBtn: {
    marginLeft: 10,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: MAIN,
    flexDirection: 'row',
    alignItems: 'center',
  },
  upTxt: { marginLeft: 3, color: '#fff', fontSize: 13, fontWeight: '700' },
  sortRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 6 },
  sortTitle: { fontSize: 19, fontWeight: '900', color: '#222', marginRight: 14 },
  sortItem: { marginRight: 12, paddingVertical: 4 },
  sortTxt: { fontSize: 14, color: '#8A8898' },
  sortOn: { color: MAIN, fontWeight: '800' },
  sortPill: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  sortPillTxt: { fontSize: 12, color: '#8A8898' },
  lockedCover: { backgroundColor: '#2B2640' },
  lockedTxt: { marginTop: 8, fontSize: 12, color: VIP_GOLD, fontWeight: '700' },
  lockedTitle: { color: '#8A8898' },
  lockedPrice: { fontSize: 12, color: '#B0AEBA' },
  vipTag: {
    position: 'absolute',
    left: 6,
    top: 6,
    backgroundColor: VIP_GOLD,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  vipTagTxt: { fontSize: 10, fontWeight: '800', color: '#fff' },

  /* 瀑布流 */
  masonry: { flexDirection: 'row', paddingHorizontal: COL_PAD, marginTop: 6 },
  col: { width: CARD_W, marginRight: 0 },
  card: {
    width: CARD_W,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: CARD_GAP,
    marginRight: CARD_GAP,
  },
  noCover: { backgroundColor: '#EFEDFC', alignItems: 'center', justifyContent: 'center' },
  cardBody: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 9 },
  cardTitle: { fontSize: 14, lineHeight: 19, color: '#222' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  priceIcon: { width: 13, height: 13, marginRight: 2 },
  price: { fontSize: 18, fontWeight: '800', color: PRICE },
  mineTag: {
    marginLeft: 6,
    fontSize: 10,
    color: MAIN,
    borderWidth: 1,
    borderColor: MAIN,
    borderRadius: 3,
    paddingHorizontal: 3,
  },
  sellerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  sAvatar: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#EEE' },
  sAvatarPh: { backgroundColor: '#E6E3F7' },
  sName: { flexShrink: 1, marginLeft: 5, fontSize: 11, color: '#777' },
  sCity: { flex: 1, marginLeft: 6, fontSize: 10, color: '#B0AEBA', textAlign: 'right' },
  gDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footTxt: { textAlign: 'center', color: '#B0AEBA', fontSize: 12, paddingVertical: 20 },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTxt: { marginTop: 10, fontSize: 13, color: '#8A8898' },
  emptyBtn: {
    marginTop: 14,
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: MAIN,
  },
  emptyBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },

  /* 弹层 */
  mask: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24 },
  sheet: { backgroundColor: '#fff', borderRadius: 14, padding: 18 },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: '#222', marginBottom: 10 },
  person: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E8E6F0' },
  personTop: { flexDirection: 'row', alignItems: 'center' },
  pAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEE' },
  pName: { fontSize: 15, color: '#222', fontWeight: '600', flexShrink: 1 },
  pCity: { marginTop: 3, fontSize: 12, color: '#999' },
  pWx: { marginTop: 8, fontSize: 14, color: '#333' },
  pWxVal: { color: MAIN, fontSize: 16, fontWeight: '700' },
  pTip: { marginTop: 4, fontSize: 11, color: '#B0AEBA' },
  sheetBtns: { flexDirection: 'row', marginTop: 14 },
  sBtn: { flex: 1, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  sBtnGhost: { backgroundColor: '#F1EFFA', marginRight: 10 },
  sBtnMain: { backgroundColor: MAIN },
  sBtnGhostTxt: { color: '#444', fontWeight: '700' },
  sBtnMainTxt: { color: '#fff', fontWeight: '700' },

  pvHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pvTip: { fontSize: 12, color: '#999', marginBottom: 10 },
  pvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E6F0',
  },
  pvAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEE' },
  pMask: { marginTop: 3, fontSize: 12, color: MAIN },
  unlockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#FFF3EC',
  },
  unlockTxt: { fontSize: 11, color: '#E27B4A', marginLeft: 2 },
  closeRow: { alignItems: 'center', paddingTop: 12 },
  closeTxt: { color: '#999', fontSize: 14 },
});

export default connect(
  (s) => ({ user: s.user }),
  (d) => ({ setUserInfo: (p) => d({ type: 'SET_USERINFO', payload: p }) })
)(MakeFriend);
