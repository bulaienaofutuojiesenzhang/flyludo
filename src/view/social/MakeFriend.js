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
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { isVipActive } from '../../utils/vip';
import { AppDialog, ToastService } from '../../component';

import CachedImage, { preloadImages } from '../../component/CachedImage';
import { getAvatarSource } from '../../utils/avatar';
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

/** 寻宝开盒档位（素材对齐 z7box） */
const FIND_BOXES = [
  {
    hezi: 1,
    title: '幸运盒',
    price: 100,
    bg: require('../../asserts/images/manghe/xingyunhe.png'),
    header: require('../../asserts/images/manghe/xingyun.png'),
  },
  {
    hezi: 2,
    title: '女神盒',
    price: 200,
    bg: require('../../asserts/images/manghe/nvshenhe.png'),
    header: require('../../asserts/images/manghe/nvshen.png'),
  },
];

const FIND_DIRECT = {
  hezi: 3,
  title: '定向盒',
  price: 500,
  // 与幸运/女神同风格的横版卡，避免旧 hezibg 拉伸变形
  bg: require('../../asserts/images/manghe/dingxiang_banner.jpg'),
  header: require('../../asserts/images/manghe/dingxiang.png'),
  icon: require('../../asserts/images/manghe/dingxianghe.png'),
};

const FIND_DIRECT_H = Math.round((W - 16) * (9 / 16));

const BTN_DISE = require('../../asserts/images/manghe/dise.png');
const DIA_ICON = require('../../asserts/images/manghe/iconDiamond.png');

const FIND_SEX_OPTS = [
  { value: 0, label: '女' },
  { value: 1, label: '男' },
];

const FIND_TYPE_OPTS = [
  { value: '1', label: '服饰' },
  { value: '2', label: '美妆' },
  { value: '3', label: '玩具' },
  { value: '4', label: '文娱' },
  { value: '5', label: '电子' },
  { value: '6', label: '特产' },
  { value: '7', label: '手工' },
  { value: '8', label: '生活' },
  { value: '9', label: '其他' },
];

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
    list: [],
    page: 0,
    noMore: false,
    inited: false,
    drawList: null,
    previewSex: 0,
    previewList: null,
    busy: false,
    findBusy: false,
    findResult: null,
    findSex: 0,
    findType: '1',
    findSameCity: false,
    findTypeModal: false,
  };

  _lastFetchAt = 0;
  _fetchSeq = 0;

  componentDidMount() {
    this.focusUnsub = this.props.navigation.addListener('focus', () => {
      StatusBar.setBarStyle('dark-content');
      // 切 Tab 回来只静默刷新，空列表也不要 loading 转圈，否则「暂时还没有宝贝」会闪
      if (!this.state.inited) return;
      const now = Date.now();
      if (now - this._lastFetchAt < 60000) return;
      this.softReload();
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

  listFingerprint = (rows) =>
    (rows || [])
      .map((r) => `${r._id}:${r.price}:${r.locked ? 1 : 0}:${r.cover || ''}`)
      .join('|');

  fetchPage = (page, replace, opts = {}) => {
    if (!this.props.user?.isLogged) {
      this.setState({ list: [], inited: true, refreshing: false, loading: false, noMore: true });
      return Promise.resolve();
    }
    // silent：不改 loading，避免空态 ↔ 转圈闪烁（有无数据都适用）
    const silent = !!opts.silent;
    const { sort, keyword, scope } = this.state;
    const seq = ++this._fetchSeq;
    if (!silent) {
      this.setState({ loading: true });
    }
    return Http('post', '/social/manghe/listBaobei', {
      sort,
      scope,
      keyword,
      page,
      pageNum: PAGE_NUM,
    })
      .then((res) => {
        if (seq !== this._fetchSeq) return;
        if (res?.code !== 200) {
          this.setState({ loading: false, refreshing: false, inited: true });
          return;
        }
        const rows = res.data?.list || [];
        preloadImages(rows.flatMap((r) => [r.cover, r.seller?.myFace]));
        this._lastFetchAt = Date.now();
        this.setState((s) => {
          if (replace) {
            // 数据没变就不替换 list，避免瀑布流重排 / 图片闪白
            if (this.listFingerprint(s.list) === this.listFingerprint(rows)) {
              return { loading: false, refreshing: false, inited: true, noMore: rows.length < PAGE_NUM };
            }
            return {
              list: rows,
              page,
              noMore: rows.length < PAGE_NUM,
              loading: false,
              refreshing: false,
              inited: true,
            };
          }
          return {
            list: [...s.list, ...rows],
            page,
            noMore: rows.length < PAGE_NUM,
            loading: false,
            refreshing: false,
            inited: true,
          };
        });
      })
      .catch(() => {
        if (seq !== this._fetchSeq) return;
        this.setState({ loading: false, refreshing: false, inited: true });
      });
  };

  reload = () => this.fetchPage(0, true);

  /** 后台静默刷新：不亮「加载中」，旧列表继续显示 */
  softReload = () => this.fetchPage(0, true, { silent: true });

  loadMore = () => {
    const { loading, noMore, page, list } = this.state;
    // 空列表时短页面也会触发「触底」，别反复打下一页
    if (loading || noMore || !list.length) {
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
    // 下拉只亮顶部 RefreshControl；列表区（含空态）静默换数，避免闪一下
    this.setState({ refreshing: true });
    this.fetchPage(0, true, { silent: true }).finally(() => {
      if (this.state.refreshing) this.setState({ refreshing: false });
    });
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

  openItem = async (item) => {
    if (item.locked) {
      const go = await AppDialog.confirm({
        title: 'VIP 专享宝贝',
        message: '开通 VIP 后即可查看并购买这件宝贝',
        cancelText: '再看看',
        confirmText: '去开通',
      });
      if (go) this.props.navigation.navigate('Recharge');
      return;
    }
    this.props.navigation.navigate('TreasureDetail', { item });
  };

  needVip = async (message = '定向盲盒仅 VIP 用户可抽取') => {
    const go = await AppDialog.confirm({
      title: 'VIP专属',
      message,
      cancelText: '取消',
      confirmText: '去开通',
    });
    if (go) this.props.navigation.navigate('Recharge');
  };

  /* ---------------- 寻宝开盒 ---------------- */

  openFindBox = (hezi) => {
    this.requireLogin(async () => {
      if (this.state.findBusy) return;
      if (hezi === 3 && !isVipActive(this.props.user)) {
        this.needVip();
        return;
      }
      const query = { hezi, num: 1, sex: 0 };
      if (hezi === 3) {
        query.sex = this.state.findSex;
        query.type = this.state.findType;
        if (this.state.findSameCity && this.props.user?.city) {
          query.city = this.props.user.city;
        }
      }
      this.setState({ findBusy: true, findResult: null });
      Http('post', '/social/manghe/findBaobei', query)
        .then((res) => {
          if (res?.code === 200) {
            const item = (res.data?.list || [])[0] || null;
            this.setState({ findResult: item });
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
            this.noDiamond();
          } else if (res?.code === 403) {
            this.needVip(res?.message || '定向盲盒仅 VIP 用户可抽取');
          } else {
            ToastService.warn(res?.message || '开盒失败');
          }
        })
        .catch(() => {})
        .finally(() => this.setState({ findBusy: false }));
    });
  };

  buyFindResult = async () => {
    const item = this.state.findResult;
    if (!item) return;
    Http('post', '/social/manghe/getBaobei', { id: item._id, price: item.price }).then(async (res) => {
      if (res?.code === 200) {
        if (res.data?.yuanbao != null) {
          this.props.setUserInfo({ yuanbao: res.data.yuanbao });
        }
        this.setState({ findResult: null });
        this.reload();
        const go = await AppDialog.confirm({
          title: '到手了',
          message: '可在「我的盲盒」填写收货地址',
          cancelText: '好的',
          confirmText: '去看看',
        });
        if (go) this.props.navigation.navigate('OrderDetail');
      } else if (res?.code === 600) {
        this.noDiamond();
      } else {
        ToastService.warn(res?.message || '手慢了');
      }
    });
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
            ToastService.warn(res?.message || '暂无可抽的用户');
          }
        })
        .catch(() => {})
        .finally(() => this.setState({ busy: false }));
    });
  };

  noDiamond = async () => {
    const go = await AppDialog.diamondInsufficient({
      message: '请先充值钻石，充值后就能继续开盒。',
    });
    if (go) this.props.navigation.navigate('Diamond');
  };

  openPreview = (sex) => {
    this.requireLogin(() => {
      Http('post', '/social/manghe/previewFriendWx', { sex }).then((res) => {
        if (res?.code === 200) {
          const rows = res.data?.list || [];
          if (!rows.length) {
            AppDialog.show({
              title: '暂无预览',
              message: sex === 1 ? '男生盒子暂无可预览' : '女生盒子暂无可预览',
            });
            return;
          }
          this.setState({ previewList: rows, previewSex: sex });
        } else {
          ToastService.warn(res?.message || '预览失败');
        }
      });
    });
  };

  unlock = async (item) => {
    if (!isVipActive(this.props.user)) {
      const go = await AppDialog.confirm({
        title: '需要 VIP',
        message: '直接选定需先开通 VIP',
        cancelText: '取消',
        confirmText: '去开通',
      });
      if (go) this.closePreview(() => this.props.navigation.navigate('Recharge'));
      return;
    }
    if (Number(this.props.user?.yuanbao || 0) < 2000) {
      this.noDiamond();
      return;
    }
    const ok = await AppDialog.confirm({
      title: '选定解锁',
      message: `花费 2000 钻石解锁「${item.nickName || 'TA'}」的微信？`,
      cancelText: '取消',
      confirmText: '确认解锁',
    });
    if (!ok) return;
    Http('post', '/social/manghe/unlockFriendWx', { targetId: item._id }).then((res) => {
      if (res?.code === 200 && res.data?.item) {
        if (res.data.yuanbao != null) {
          this.props.setUserInfo({ yuanbao: res.data.yuanbao });
        }
        this.setState({ previewList: null, drawList: [res.data.item] });
      } else if (res?.code === 600) {
        this.noDiamond();
      } else {
        ToastService.warn(res?.message || '解锁失败');
      }
    });
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
            <CachedImage
              source={getAvatarSource(item.seller?.myFace, item.seller?.gender)}
              style={styles.sAvatar}
            />
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

  renderSectionTitle = (title, right) => (
    <View style={styles.secRow}>
      <Text style={styles.secTitle}>{title}</Text>
      {right || null}
    </View>
  );

  renderFindDrawBtn = (price, onPress, compact) => (
    <Pressable disabled={this.state.findBusy} onPress={onPress}>
      <ImageBackground
        style={compact ? styles.findBtnBgSm : styles.findBtnBg}
        source={BTN_DISE}
        resizeMode="stretch"
      >
        <Text style={styles.findBtnTxt}>{this.state.findBusy ? '开盒中…' : '抽一次'}</Text>
        <View style={styles.findPriceRow}>
          <Image source={DIA_ICON} style={styles.findDia} />
          <Text style={styles.findBtnPrice}>{price}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );

  findTypeLabel = () =>
    (FIND_TYPE_OPTS.find((o) => o.value === this.state.findType) || FIND_TYPE_OPTS[0]).label;

  renderFindTypeModal = () => (
    <Modal
      visible={!!this.state.findTypeModal}
      transparent
      animationType="fade"
      onRequestClose={() => this.setState({ findTypeModal: false })}
    >
      <View style={styles.typeMask}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => this.setState({ findTypeModal: false })} />
        <View style={styles.typeSheet}>
          <Text style={styles.typeTitle}>选择分类</Text>
          {FIND_TYPE_OPTS.map((o) => {
            const on = this.state.findType === o.value;
            return (
              <Pressable
                key={o.value}
                style={[styles.typeRow, on && styles.typeRowOn]}
                onPress={() => this.setState({ findType: o.value, findTypeModal: false })}
              >
                <Text style={[styles.typeRowTxt, on && styles.typeRowTxtOn]}>{o.label}</Text>
                {on ? <Icons name="check" size={16} color={MAIN} /> : null}
              </Pressable>
            );
          })}
          <Pressable style={styles.typeCancel} onPress={() => this.setState({ findTypeModal: false })}>
            <Text style={styles.typeCancelTxt}>取消</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  renderFindBoxes = () => {
    const item = this.state.findResult;
    const { findSex, findSameCity } = this.state;
    const photo = Array.isArray(item?.photoList)
      ? item.photoList[0]
      : String(item?.photoList || '')
          .split(',')
          .filter(Boolean)[0];
    return (
      <View style={styles.findWrap}>
        <View style={styles.findRow}>
          {FIND_BOXES.map((b) => (
            <ImageBackground
              key={b.hezi}
              style={styles.findCard}
              source={b.bg}
              resizeMode="stretch"
            >
              <Image style={styles.findHeader} source={b.header} resizeMode="contain" />
              <View style={styles.findBtnSlot}>
                {this.renderFindDrawBtn(b.price, () => this.openFindBox(b.hezi))}
              </View>
            </ImageBackground>
          ))}
        </View>

        {/* 定向盲盒：矮卡，分类弹窗选 */}
        <ImageBackground
          style={styles.findDirect}
          source={FIND_DIRECT.bg}
          resizeMode="stretch"
        >
          <View style={styles.findDxRow}>
            <Image style={styles.findDxIcon} source={FIND_DIRECT.icon} resizeMode="contain" />
            <View style={styles.findDxMeta}>
              <Image style={styles.findHeaderDx} source={FIND_DIRECT.header} resizeMode="contain" />
              <Text style={styles.findDxTip} numberOfLines={1}>
                VIP用户可定向抽取
              </Text>
            </View>
            {this.renderFindDrawBtn(
              FIND_DIRECT.price,
              () => this.openFindBox(FIND_DIRECT.hezi),
              true
            )}
          </View>
          <View style={styles.findDxOpts}>
            {FIND_SEX_OPTS.map((o) => (
              <Pressable
                key={o.value}
                style={[styles.findChip, findSex === o.value && styles.findChipOn]}
                onPress={() => this.setState({ findSex: o.value })}
              >
                <Text style={[styles.findChipTxt, findSex === o.value && styles.findChipTxtOn]}>
                  {o.label}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.findChip, findSameCity && styles.findChipOn]}
              onPress={() => this.setState({ findSameCity: !findSameCity })}
            >
              <Text style={[styles.findChipTxt, findSameCity && styles.findChipTxtOn]}>同城</Text>
            </Pressable>
            <Pressable
              style={[styles.findChip, styles.findTypeBtn]}
              onPress={() => this.setState({ findTypeModal: true })}
            >
              <Text style={styles.findChipTxt} numberOfLines={1}>
                {this.findTypeLabel()}
              </Text>
              <Icons name="down" size={10} color="#fff" style={{ marginLeft: 4 }} />
            </Pressable>
          </View>
        </ImageBackground>

        {item ? (
          <View style={styles.findResult}>
            <Text style={styles.findResTitle}>{item.title}</Text>
            <Text style={styles.findResDesc} numberOfLines={2}>
              {item.describe}
            </Text>
            {photo ? <Image source={{ uri: photo }} style={styles.findImg} /> : null}
            <View style={styles.findPriceRow}>
              <Text style={styles.findResPrice}>确认购买 {item.price}</Text>
              <Image source={DIA_ICON} style={styles.findDia} />
            </View>
            <Pressable style={styles.findCta} onPress={this.buyFindResult}>
              <Text style={styles.findCtaTxt}>果断买下</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  };

  renderTreasureHead = () => (
    <View style={styles.tHead}>
      <View style={styles.sortRow}>
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
    const { loading, noMore, list, inited, refreshing } = this.state;
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
    // 只在真正首次进页时转圈；之后空列表固定空态，刷新/切 Tab 都别换成转圈
    if (!inited && !list.length) {
      return <ActivityIndicator style={{ marginVertical: 40 }} color={MAIN} />;
    }
    if (!list.length) {
      return (
        <View style={styles.empty}>
          <Icons name="gift" size={40} color="#B9B2F5" />
          <Text style={styles.emptyTxt}>暂时还没有宝贝</Text>
        </View>
      );
    }
    // 仅加载更多时显示「加载中」，首屏/静默刷新不改文案
    const tip = noMore ? '— 到底啦 —' : loading && !refreshing && list.length ? '加载中…' : '';
    return <Text style={styles.footTxt}>{tip}</Text>;
  };

  renderPerson = (u, i) => {
    const male = Number(u.gender ?? u.sex) === 1;
    return (
      <View style={styles.person} key={`${u._id}_${i}`}>
        <View style={styles.personTop}>
          <CachedImage
            source={getAvatarSource(u.myFace, u.gender ?? u.sex)}
            style={styles.pAvatar}
          />
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
                  <CachedImage
                    source={getAvatarSource(u.myFace, u.gender ?? u.sex)}
                    style={styles.pvAvatar}
                  />
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
          {this.renderSectionTitle(
            '微信盲盒',
            <Pressable onPress={() => this.props.navigation.navigate('MyWeFriend')} hitSlop={8}>
              <Text style={styles.secLink}>我的微信</Text>
            </Pressable>
          )}
          <View style={styles.blocks}>
            {this.renderBlock(1)}
            {this.renderBlock(2)}
          </View>
          {this.renderSectionTitle('寻宝盲盒')}
          {this.renderFindBoxes()}
          {this.renderTreasureHead()}
          {this.renderMasonry()}
          {this.renderFooter()}
        </ScrollView>
        {this.renderDrawModal()}
        {this.renderPreviewModal()}
        {this.renderFindTypeModal()}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  rowC: { flexDirection: 'row', alignItems: 'center' },

  secRow: {
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secTitle: { fontSize: 17, fontWeight: '800', color: '#222' },
  secLink: { fontSize: 13, fontWeight: '700', color: MAIN },

  /* 寻宝开盒（z7box 素材卡） */
  findWrap: { marginTop: 4, paddingHorizontal: 8, marginBottom: 8 },
  findRow: { flexDirection: 'row', justifyContent: 'space-between' },
  findCard: {
    width: (W - 16 - 10) / 2,
    height: ((W - 16 - 10) / 2) * (659 / 634),
    alignItems: 'center',
    paddingTop: 10,
  },
  findHeader: {
    width: ((W - 16 - 10) / 2) * 0.72,
    height: ((W - 16 - 10) / 2) * 0.18,
  },
  findBtnSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 14,
    alignItems: 'center',
  },
  findBtnBg: {
    width: ((W - 16 - 10) / 2) * 0.78,
    height: ((W - 16 - 10) / 2) * 0.28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findBtnBgSm: {
    width: 96,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  findPriceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  findBtnPrice: { color: '#fff', fontSize: 11, marginLeft: 3, fontWeight: '600' },
  findDia: { width: 12, height: 12 },
  findDirect: {
    marginTop: 10,
    width: W - 16,
    height: FIND_DIRECT_H,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  findDxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  findDxIcon: { width: 36, height: 34 },
  findDxMeta: { marginLeft: 8, flex: 1, marginRight: 6 },
  findHeaderDx: { width: 88, height: 22 },
  findDxTip: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
    fontWeight: '600',
  },
  findDxOpts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  findChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    marginRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  findChipOn: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: '#fff',
  },
  findChipTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },
  findChipTxtOn: { color: '#3A4F9A', fontWeight: '800' },
  findTypeBtn: { flexShrink: 1, maxWidth: 88 },
  typeMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  typeSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 14,
    paddingBottom: 28,
    paddingHorizontal: 8,
  },
  typeTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  typeRowOn: { backgroundColor: '#F1EFFA' },
  typeRowTxt: { fontSize: 15, color: '#333', fontWeight: '600' },
  typeRowTxtOn: { color: MAIN, fontWeight: '800' },
  typeCancel: { marginTop: 6, alignItems: 'center', paddingVertical: 12 },
  typeCancelTxt: { fontSize: 15, color: '#999', fontWeight: '600' },
  findResult: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
  },
  findResTitle: { fontSize: 16, fontWeight: '800', color: '#222' },
  findResDesc: { marginTop: 4, fontSize: 13, color: '#888' },
  findImg: { marginTop: 10, width: '100%', height: 140, borderRadius: 10 },
  findResPrice: { fontSize: 13, fontWeight: '700', color: PRICE, marginRight: 4 },
  findCta: {
    marginTop: 12,
    backgroundColor: MAIN,
    borderRadius: 18,
    paddingVertical: 11,
    alignItems: 'center',
  },
  findCtaTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },

  /* 盒子 */
  blocks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
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

  /* 寻宝筛选 */
  tHead: { paddingHorizontal: COL_PAD, marginTop: 10 },
  sortRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
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
