import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  StatusBar,
  Switch,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Svg, { Defs, LinearGradient, Stop, Ellipse, Path, Rect, G, Circle } from 'react-native-svg';
import Http from '../../utils/HttpPost';
import { SC, socialShadowLite } from '../../theme/social';
import { AppDialog, ToastService } from '../../component';

const { width: W, height: H } = Dimensions.get('window');

/** 青春交友色：雾粉 / 玫瑰，告别发绿海面 */
const C = {
  skyTop: '#FFE6F2',
  skyMid: '#F7D4EC',
  water: '#E8BFD8',
  waterDeep: '#D9A8C8',
  foam: 'rgba(255,255,255,0.55)',
  paper: '#FFF9FC',
  sheet: '#FFFFFF',
  ink: SC.ink,
  mute: SC.mute,
  accent: SC.rose,
  accentSoft: SC.roseSoft,
};

/** 玫瑰玻璃漂流瓶 */
function GlassBottle({ size = 72, tint = 0 }) {
  const gid = `gb${tint}`;
  const tones = [
    ['#FFE4F2', '#F7A8FF', '#E23CFE'],
    ['#FFF0F8', '#FFB8D9', '#FF6BA8'],
    ['#F5E8FF', '#D4B0FF', '#B56BFF'],
  ][tint % 3];
  return (
    <Svg width={size} height={size * 1.45} viewBox="0 0 80 116">
      <Defs>
        <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={tones[0]} stopOpacity="0.98" />
          <Stop offset="0.5" stopColor={tones[1]} stopOpacity="0.9" />
          <Stop offset="1" stopColor={tones[2]} stopOpacity="0.88" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="40" cy="108" rx="20" ry="4.5" fill="rgba(120,40,90,0.16)" />
      <Rect x="30" y="4" width="20" height="11" rx="3" fill="#C19769" />
      <Rect x="32" y="6" width="16" height="2.5" rx="1" fill="#F0D4A8" opacity="0.75" />
      <Path
        d="M34 15 L34 34 Q34 38 40 38 Q46 38 46 34 L46 15 Z"
        fill={`url(#${gid})`}
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="1"
      />
      <Path
        d="M24 42 Q18 48 18 62 Q18 92 40 104 Q62 92 62 62 Q62 48 56 42 Q50 38 40 38 Q30 38 24 42 Z"
        fill={`url(#${gid})`}
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.2"
      />
      <G transform="translate(40,68) rotate(-10)">
        <Rect x="-10" y="-15" width="20" height="26" rx="2" fill="#FFF9FC" opacity="0.95" />
        <Path
          d="M-6 -7 H6 M-6 -1 H4 M-6 5 H5"
          stroke="#E8B4D0"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </G>
      <Path
        d="M26 50 Q24 62 26 78"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <Ellipse cx="40" cy="100" rx="16" ry="3" fill="rgba(255,255,255,0.4)" />
    </Svg>
  );
}

function SoftSky() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.skyTop} />
      <View style={styles.skyMid} />
      <View style={styles.waterBand} />
      <View style={styles.waterDeep} />
      {/* 光斑 */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />
      <Svg width={W} height={H} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#E23CFE" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Circle cx={W * 0.78} cy={H * 0.14} r={56} fill="url(#glow)" />
        <Circle cx={W * 0.18} cy={H * 0.2} r={36} fill="rgba(255,255,255,0.28)" />
      </Svg>
    </View>
  );
}

const FLOATERS = [
  { key: 'a', left: W * 0.1, top: H * 0.3, size: 74, amp: 11, rot: 5, dur: 2600, tint: 0 },
  { key: 'b', left: W * 0.4, top: H * 0.24, size: 92, amp: 15, rot: -6, dur: 3200, tint: 1 },
  { key: 'c', left: W * 0.64, top: H * 0.36, size: 68, amp: 10, rot: 7, dur: 2400, tint: 2 },
  { key: 'd', left: W * 0.2, top: H * 0.48, size: 62, amp: 13, rot: -5, dur: 2900, tint: 1 },
  { key: 'e', left: W * 0.55, top: H * 0.5, size: 78, amp: 12, rot: 4, dur: 3500, tint: 0 },
];

class DriftBottle extends React.Component {
  state = {
    text: '',
    picked: null,
    anonymous: true,
    busy: false,
    mode: 'sea',
  };

  floats = FLOATERS.map(() => ({
    y: new Animated.Value(0),
    x: new Animated.Value(0),
    r: new Animated.Value(0),
  }));

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
    this.startFloat();
  }

  componentWillUnmount() {
    this.floats.forEach((f) => {
      f.y.stopAnimation();
      f.x.stopAnimation();
      f.r.stopAnimation();
    });
  }

  startFloat = () => {
    FLOATERS.forEach((cfg, i) => {
      const f = this.floats[i];
      const loop = (val, dur, to = 1) => {
        const run = () => {
          Animated.sequence([
            Animated.timing(val, { toValue: to, duration: dur, useNativeDriver: true }),
            Animated.timing(val, { toValue: 0, duration: dur, useNativeDriver: true }),
          ]).start(({ finished }) => finished && run());
        };
        setTimeout(run, i * 160);
      };
      loop(f.y, cfg.dur);
      loop(f.x, cfg.dur * 1.25);
      loop(f.r, cfg.dur * 1.1);
    });
  };

  pick = () => {
    this.setState({ busy: true });
    Http('post', '/social/manghe/getZhitiao', { num: 1 })
      .then((res) => {
        if (res?.code === 200) {
          const item = (res.data?.list || [])[0] || null;
          if (!item) {
            AppDialog.show({
              title: '暂时没捞到',
              message: '这片海里瓶子有点少，稍后再试',
            });
            return;
          }
          this.setState({ picked: item, mode: 'pick' });
        } else {
          ToastService.warn(res?.message || '捞瓶失败，稍后再试');
        }
      })
      .catch(() => ToastService.warn('网络有点忙，稍后再试'))
      .finally(() => this.setState({ busy: false }));
  };

  insert = () => {
    const data = String(this.state.text || '').trim();
    if (!data) {
      ToastService.warn('空瓶子漂不出去哦');
      return;
    }
    this.setState({ busy: true });
    Http('post', '/social/manghe/insertZhitiao', {
      data,
      isAnonymous: this.state.anonymous,
      nickName: this.props.user.name || '',
      myFace: this.props.user.avatar || '',
      city: this.props.user.city || '',
      sex: this.props.user.gender,
    })
      .then((res) => {
        if (res?.code === 200) {
          ToastService.success('愿有缘人拾起你的心事');
          this.setState({ text: '', mode: 'sea' });
        } else {
          ToastService.warn(res?.message || '扔瓶失败');
        }
      })
      .catch(() => ToastService.warn('网络有点忙，稍后再试'))
      .finally(() => this.setState({ busy: false }));
  };

  goChat = () => {
    const p = this.state.picked;
    if (!p?.userId) return;
    this.props.navigation.navigate('Chats', {
      partnerId: String(p.userId),
      nickName: p.nickName,
      faceUrl: p.myFace,
    });
  };

  renderFloaters = () =>
    FLOATERS.map((cfg, i) => {
      const f = this.floats[i];
      const translateY = f.y.interpolate({ inputRange: [0, 1], outputRange: [0, -cfg.amp] });
      const translateX = f.x.interpolate({
        inputRange: [0, 1],
        outputRange: [0, cfg.rot > 0 ? 8 : -8],
      });
      const rotate = f.r.interpolate({
        inputRange: [0, 1],
        outputRange: [`${-cfg.rot}deg`, `${cfg.rot}deg`],
      });
      return (
        <Animated.View
          key={cfg.key}
          style={[
            styles.floater,
            { left: cfg.left, top: cfg.top, transform: [{ translateY }, { translateX }, { rotate }] },
          ]}
        >
          <Pressable onPress={this.pick} disabled={this.state.busy} hitSlop={10}>
            <GlassBottle size={cfg.size} tint={cfg.tint} />
          </Pressable>
        </Animated.View>
      );
    });

  renderDock = () => (
    <View style={styles.dock}>
      <Pressable
        style={[styles.dockBtn, styles.dockMain, socialShadowLite]}
        onPress={this.pick}
        disabled={this.state.busy}
      >
        <Text style={styles.dockMainTxt}>{this.state.busy ? '打捞中…' : '捞一个'}</Text>
      </Pressable>
      <Pressable
        style={[styles.dockBtn, styles.dockGhost]}
        onPress={() => this.setState({ mode: 'throw', picked: null })}
        disabled={this.state.busy}
      >
        <Text style={styles.dockGhostTxt}>扔一个</Text>
      </Pressable>
    </View>
  );

  renderPick = () => {
    const p = this.state.picked;
    if (!p) return null;
    return (
      <View style={styles.sheetMask}>
        <Pressable style={styles.sheetDim} onPress={() => this.setState({ mode: 'sea', picked: null })} />
        <View style={[styles.sheet, socialShadowLite]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetEyebrow}>捞到一封信</Text>
          <View style={styles.paper}>
            <Text style={styles.paperTxt}>{p.data}</Text>
            <Text style={styles.paperMeta}>
              {p.isAnonymous ? '匿名同学' : p.nickName || '有缘人'}
              {p.city ? ` · ${p.city}` : ''}
            </Text>
          </View>
          <View style={styles.sheetActions}>
            {!p.isAnonymous && p.userId ? (
              <Pressable style={[styles.dockBtn, styles.dockMain, { flex: 1 }]} onPress={this.goChat}>
                <Text style={styles.dockMainTxt}>回信聊聊</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={[
                styles.dockBtn,
                styles.dockGhostDark,
                { flex: 1, marginLeft: !p.isAnonymous && p.userId ? 10 : 0 },
              ]}
              onPress={() => this.setState({ mode: 'sea', picked: null })}
            >
              <Text style={styles.dockGhostDarkTxt}>放回去</Text>
            </Pressable>
          </View>
          <Pressable style={styles.again} onPress={this.pick} disabled={this.state.busy}>
            <Text style={styles.againTxt}>{this.state.busy ? '打捞中…' : '再捞一个'}</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  renderThrow = () => (
    <View style={styles.sheetMask}>
      <Pressable style={styles.sheetDim} onPress={() => this.setState({ mode: 'sea' })} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}
      >
        <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
          <View style={[styles.sheet, socialShadowLite]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>写给陌生人</Text>
            <Text style={styles.sheetHint}>封进瓶子，说不定会被喜欢的人捡到</Text>
            <TextInput
              style={styles.input}
              multiline
              maxLength={200}
              placeholder="今天想说的一句…"
              placeholderTextColor="rgba(31,18,24,0.28)"
              value={this.state.text}
              onChangeText={(text) => this.setState({ text })}
            />
            <Text style={styles.counter}>{String(this.state.text || '').length}/200</Text>
            <View style={styles.anonRow}>
              <Text style={styles.anonLabel}>匿名投递</Text>
              <Switch
                value={this.state.anonymous}
                onValueChange={(anonymous) => this.setState({ anonymous })}
                trackColor={{ true: SC.roseSoft, false: '#E8DDE6' }}
                thumbColor={this.state.anonymous ? SC.rose : '#fff'}
              />
            </View>
            <View style={styles.sheetActions}>
              <Pressable
                style={[styles.dockBtn, styles.dockGhostDark, { flex: 1, marginRight: 10 }]}
                onPress={() => this.setState({ mode: 'sea' })}
              >
                <Text style={styles.dockGhostDarkTxt}>取消</Text>
              </Pressable>
              <Pressable
                style={[styles.dockBtn, styles.dockMain, { flex: 1.35 }]}
                onPress={this.insert}
                disabled={this.state.busy}
              >
                <Text style={styles.dockMainTxt}>{this.state.busy ? '投入中…' : '扔出去'}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );

  render() {
    const { mode } = this.state;
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <SoftSky />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.nav}>
            <Pressable style={styles.navBtn} onPress={() => this.props.navigation.goBack()} hitSlop={10}>
              <Icons name="left" size={20} color={SC.ink} />
            </Pressable>
            <View style={styles.navMid}>
              <Text style={styles.navTitle}>漂流瓶</Text>
              <Text style={styles.navSub}>点瓶子，捞起一段缘分</Text>
            </View>
            <View style={styles.navBtn} />
          </View>

          <View style={styles.stage}>
            <View style={[styles.ripple, styles.ripple1]} />
            <View style={[styles.ripple, styles.ripple2]} />
            <View style={[styles.ripple, styles.ripple3]} />
            {this.renderFloaters()}
          </View>

          {mode === 'sea' ? (
            <View style={styles.bottom}>
              {this.renderDock()}
              <Text style={styles.tip}>青春不回头，心事可以漂一漂</Text>
            </View>
          ) : null}
        </SafeAreaView>

        {mode === 'pick' ? this.renderPick() : null}
        {mode === 'throw' ? this.renderThrow() : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.skyTop },
  skyTop: { position: 'absolute', left: 0, right: 0, top: 0, height: H * 0.38, backgroundColor: C.skyTop },
  skyMid: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: H * 0.28,
    height: H * 0.22,
    backgroundColor: C.skyMid,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
  },
  waterBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: H * 0.42,
    bottom: H * 0.22,
    backgroundColor: C.water,
  },
  waterDeep: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: H * 0.28,
    backgroundColor: C.waterDeep,
  },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.35)' },
  blob1: { width: 140, height: 140, top: H * 0.08, right: -30 },
  blob2: { width: 90, height: 90, top: H * 0.18, left: 20, backgroundColor: 'rgba(247,168,255,0.25)' },

  safe: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  navMid: { alignItems: 'center', flex: 1 },
  navTitle: { fontSize: 20, fontWeight: '900', color: SC.ink, letterSpacing: 1 },
  navSub: { marginTop: 2, fontSize: 12, color: SC.mute },

  stage: { flex: 1 },
  floater: { position: 'absolute' },
  ripple: {
    position: 'absolute',
    height: 3,
    borderRadius: 3,
    backgroundColor: C.foam,
  },
  ripple1: { left: W * 0.12, right: W * 0.4, top: H * 0.42 },
  ripple2: { left: W * 0.38, right: W * 0.14, top: H * 0.54 },
  ripple3: { left: W * 0.2, right: W * 0.3, top: H * 0.6 },

  bottom: { paddingHorizontal: 20, paddingBottom: 14 },
  dock: { flexDirection: 'row' },
  dockBtn: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockMain: {
    flex: 1.25,
    backgroundColor: C.accent,
    marginRight: 10,
  },
  dockMainTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  dockGhost: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(226,60,254,0.22)',
  },
  dockGhostTxt: { color: SC.roseDeep, fontWeight: '700', fontSize: 15 },
  dockGhostDark: {
    backgroundColor: SC.card,
    borderWidth: 0,
  },
  dockGhostDarkTxt: { color: SC.inkSoft, fontWeight: '700', fontSize: 15 },
  tip: {
    marginTop: 14,
    textAlign: 'center',
    color: 'rgba(80,40,70,0.55)',
    fontSize: 12,
    letterSpacing: 0.3,
  },

  sheetMask: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  sheetDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(40,16,32,0.35)' },
  sheetWrap: { maxHeight: H * 0.78 },
  sheet: {
    marginHorizontal: 14,
    marginBottom: 18,
    backgroundColor: C.sheet,
    borderRadius: 26,
    padding: 18,
    paddingTop: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(31,18,24,0.12)',
    marginBottom: 12,
  },
  sheetEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: SC.rose,
    letterSpacing: 1,
    marginBottom: 10,
  },
  sheetTitle: { fontSize: 19, fontWeight: '900', color: SC.ink },
  sheetHint: { marginTop: 4, marginBottom: 12, fontSize: 13, color: SC.mute },
  paper: {
    backgroundColor: C.paper,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226,60,254,0.12)',
  },
  paperTxt: { fontSize: 16, lineHeight: 26, color: SC.ink },
  paperMeta: { marginTop: 14, fontSize: 12, color: SC.mute },
  sheetActions: { flexDirection: 'row', marginTop: 16 },
  again: { marginTop: 14, alignItems: 'center', paddingVertical: 6 },
  againTxt: { color: SC.rose, fontWeight: '700', fontSize: 14 },
  input: {
    minHeight: 120,
    backgroundColor: C.paper,
    borderRadius: 16,
    padding: 14,
    color: SC.ink,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(226,60,254,0.12)',
  },
  counter: { alignSelf: 'flex-end', marginTop: 6, fontSize: 11, color: SC.mute2 },
  anonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  anonLabel: { fontSize: 14, fontWeight: '600', color: SC.ink },
});

export default connect((s) => ({ user: s.user }))(DriftBottle);
