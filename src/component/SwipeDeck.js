import React from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Pressable, Dimensions } from 'react-native';
import Icons from 'react-native-vector-icons/AntDesign';
import CachedImage from './CachedImage';
import { SC } from '../theme/social';

const { width: SCREEN_W } = Dimensions.get('window');
const ACTION_H = 104; // 底部按钮区高度
const SIDE = 14; // 卡片左右留白
const THRESHOLD = SCREEN_W * 0.26;
const BLUE = '#4FC3F7';
const PINK = '#FF8FB1';

/**
 * 滑卡：自适应父容器高度，叠三张卡，只响应横向拖动（不抢纵向滚动）。
 * props: data, onSwipeLeft(item), onSwipeRight(item), onPressCard(item), onExhaust(), renderEmpty()
 * - 只有「第一张的 userId 变了」才会重置位置，所以追加数据不会跳回开头
 */
class SwipeDeck extends React.Component {
  state = { index: 0, w: 0, h: 0 };

  pan = new Animated.Value(0);

  busy = false;

  exhaustAt = -1;

  constructor(props) {
    super(props);
    this.responder = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        !this.busy && Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        this.pan.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx > THRESHOLD || g.vx > 0.9) {
          this.fling(1);
        } else if (g.dx < -THRESHOLD || g.vx < -0.9) {
          this.fling(-1);
        } else {
          this.back();
        }
      },
      onPanResponderTerminate: () => this.back(),
    });
  }

  componentDidUpdate(prev) {
    const a = prev.data && prev.data[0] && prev.data[0].userId;
    const b = this.props.data && this.props.data[0] && this.props.data[0].userId;
    if (a !== b) {
      this.pan.setValue(0);
      this.exhaustAt = -1;
      this.busy = false;
      this.setState({ index: 0 });
    }
  }

  onLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== this.state.w || height !== this.state.h) {
      this.setState({ w: width, h: height });
    }
  };

  back = () => {
    Animated.spring(this.pan, { toValue: 0, useNativeDriver: true, friction: 6 }).start();
  };

  current = () => (this.props.data || [])[this.state.index];

  fling = (dir) => {
    const item = this.current();
    if (!item || this.busy) {
      return;
    }
    this.busy = true;
    Animated.timing(this.pan, {
      toValue: dir * SCREEN_W * 1.4,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      if (dir > 0) {
        this.props.onSwipeRight && this.props.onSwipeRight(item);
      } else {
        this.props.onSwipeLeft && this.props.onSwipeLeft(item);
      }
      this.pan.setValue(0);
      this.busy = false;
      this.setState(
        (s) => ({ index: s.index + 1 }),
        () => {
          const left = (this.props.data || []).length - this.state.index;
          // 只剩 2 张时就提前要下一页，同一个位置只要一次
          if (left <= 2 && this.exhaustAt !== this.props.data.length) {
            this.exhaustAt = this.props.data.length;
            this.props.onExhaust && this.props.onExhaust();
          }
        }
      );
    });
  };

  renderCard(item, depth, cardW, cardH) {
    const face = item.myFace || item.avatar || (item.photos && item.photos[0]) || '';
    const male = Number(item.gender ?? item.sex) === 1;
    const top = depth === 0;

    const rotate = this.pan.interpolate({
      inputRange: [-SCREEN_W, 0, SCREEN_W],
      outputRange: ['-12deg', '0deg', '12deg'],
    });
    const likeOpacity = this.pan.interpolate({ inputRange: [0, THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
    const nopeOpacity = this.pan.interpolate({ inputRange: [-THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });

    // 后面的卡：随拖动逐步放大靠前
    const progress = this.pan.interpolate({
      inputRange: [-THRESHOLD, 0, THRESHOLD],
      outputRange: [1, 0, 1],
      extrapolate: 'clamp',
    });
    const baseScale = 1 - depth * 0.05;
    const nextScale = 1 - Math.max(0, depth - 1) * 0.05;
    const scale = top ? 1 : progress.interpolate({ inputRange: [0, 1], outputRange: [baseScale, nextScale] });
    const baseY = depth * 12;
    const nextY = Math.max(0, depth - 1) * 12;
    const translateY = top ? 0 : progress.interpolate({ inputRange: [0, 1], outputRange: [baseY, nextY] });

    const style = [
      styles.card,
      { width: cardW, height: cardH, zIndex: 10 - depth },
      top
        ? { transform: [{ translateX: this.pan }, { rotate }] }
        : { transform: [{ translateY }, { scale }] },
    ];

    return (
      <Animated.View key={item.userId || item._id || depth} style={style} {...(top ? this.responder.panHandlers : {})}>
        <Pressable
          style={StyleSheet.absoluteFill}
          disabled={!top}
          onPress={() => this.props.onPressCard && this.props.onPressCard(item)}
        >
          {face ? (
            <CachedImage source={{ uri: face }} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.noFace]}>
              <Icons name="user" size={64} color={SC.roseSoft} />
            </View>
          )}
          <View style={styles.scrim} pointerEvents="none">
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.nickName || item.name || '神秘人'}
              </Text>
              {!!(item.gender || item.sex || item.age) && (
                <View style={[styles.chip, { backgroundColor: male ? BLUE : PINK }]}>
                  <Icons name={male ? 'man' : 'woman'} size={11} color="#fff" />
                  {!!item.age && <Text style={styles.chipTxt}>{item.age}</Text>}
                </View>
              )}
            </View>
            <View style={styles.metaRow}>
              {!!item.city && (
                <View style={styles.cityChip}>
                  <Text style={styles.cityTxt}>{item.city}</Text>
                </View>
              )}
              {!!item.job && (
                <View style={styles.cityChip}>
                  <Text style={styles.cityTxt}>{item.job}</Text>
                </View>
              )}
            </View>
            {!!(item.signStr || item.desc) && (
              <Text style={styles.sign} numberOfLines={2}>
                {item.signStr || item.desc}
              </Text>
            )}
          </View>
        </Pressable>

        {top ? (
          <>
            <Animated.View style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]} pointerEvents="none">
              <Text style={[styles.stampTxt, { color: SC.rose, borderColor: SC.rose }]}>喜欢</Text>
            </Animated.View>
            <Animated.View style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity }]} pointerEvents="none">
              <Text style={[styles.stampTxt, { color: '#8A8F99', borderColor: '#8A8F99' }]}>略过</Text>
            </Animated.View>
          </>
        ) : null}
      </Animated.View>
    );
  }

  render() {
    const { w, h, index } = this.state;
    const data = this.props.data || [];
    const cardW = Math.max(0, w - SIDE * 2);
    const cardH = Math.max(0, h - ACTION_H);
    const stack = data.slice(index, index + 3);

    return (
      <View style={styles.root} onLayout={this.onLayout}>
        {w > 0 && h > 0 ? (
          stack.length ? (
            <>
              <View style={[styles.stage, { height: cardH, paddingHorizontal: SIDE }]}>
                {/* 先渲染最后一张，让最上面那张在最前 */}
                {stack
                  .map((item, depth) => ({ item, depth }))
                  .reverse()
                  .map(({ item, depth }) => this.renderCard(item, depth, cardW, cardH))}
              </View>
              <View style={[styles.actions, { height: ACTION_H }]}>
                <Pressable style={[styles.btn, styles.btnNope]} onPress={() => this.fling(-1)}>
                  <Icons name="close" size={26} color="#8A8F99" />
                </Pressable>
                <Pressable
                  style={[styles.btn, styles.btnInfo]}
                  onPress={() => this.current() && this.props.onPressCard && this.props.onPressCard(this.current())}
                >
                  <Icons name="user" size={20} color={BLUE} />
                </Pressable>
                <Pressable style={[styles.btn, styles.btnLike]} onPress={() => this.fling(1)}>
                  <Icons name="heart" size={30} color="#fff" />
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.emptyWrap}>{this.props.renderEmpty ? this.props.renderEmpty() : null}</View>
          )
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stage: { alignItems: 'center', justifyContent: 'flex-start' },
  card: {
    position: 'absolute',
    top: 0,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: SC.card,
    elevation: 6,
    shadowColor: SC.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  noFace: { alignItems: 'center', justifyContent: 'center', backgroundColor: SC.card },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(20,10,16,0.38)',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 24, fontWeight: '900', color: '#fff', flexShrink: 1 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    height: 20,
    paddingHorizontal: 7,
    borderRadius: 10,
  },
  chipTxt: { marginLeft: 2, fontSize: 12, color: '#fff', fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  cityChip: {
    height: 22,
    paddingHorizontal: 9,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cityTxt: { fontSize: 12, color: '#fff' },
  sign: { marginTop: 10, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.92)' },

  stamp: { position: 'absolute', top: 28 },
  stampLike: { left: 22, transform: [{ rotate: '-14deg' }] },
  stampNope: { right: 22, transform: [{ rotate: '14deg' }] },
  stampTxt: {
    fontSize: 30,
    fontWeight: '900',
    borderWidth: 3,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', elevation: 4 },
  btnNope: { width: 58, height: 58, borderRadius: 29 },
  btnInfo: { width: 46, height: 46, borderRadius: 23, marginHorizontal: 22 },
  btnLike: { width: 66, height: 66, borderRadius: 33, backgroundColor: SC.rose },

  emptyWrap: { flex: 1 },
});

export default SwipeDeck;
