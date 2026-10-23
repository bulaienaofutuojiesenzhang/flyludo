import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  StatusBar,
  Dimensions,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { SC } from '../../theme/social';

import CachedImage from '../../component/CachedImage';
const { width: W } = Dimensions.get('window');
const HERO_H = Math.round(W * 1.16);

class FriendDetail extends React.Component {
  state = { user: this.props.route.params?.user || {}, says: [], page: 0 };

  componentDidMount() {
    StatusBar.setBarStyle('light-content');
    this.fetch();
  }

  componentWillUnmount() {
    StatusBar.setBarStyle('dark-content');
  }

  fetch = () => {
    const u = this.state.user;
    const id = u.userId || u._id;
    if (!id) {
      return;
    }
    Http('post', '/social/user/friendDetail', { userId: String(id) }).then((res) => {
      if (res?.code === 200 && res.data) {
        this.setState({ user: { ...u, ...res.data } });
      }
    });
    Http('post', '/social/say/getPublishSay', {
      page: 0,
      pageNum: 10,
      type: 5,
      userId: String(id),
    }).then((res) => {
      if (res?.code === 200) {
        this.setState({ says: res.data?.list || [] });
      }
    });
  };

  love = () => {
    const id = this.state.user.userId;
    Http('post', '/social/user/loveYou', { userId: String(id) }).then(() => {
      this.chat();
    });
  };

  chat = () => {
    const u = this.state.user;
    this.props.navigation.navigate('Chats', {
      partnerId: String(u.userId),
      nickName: u.nickName || u.name,
      faceUrl: u.myFace || u.avatar,
    });
  };

  /** 头像排第一，后面接相册，去重 */
  images = () => {
    const u = this.state.user;
    const list = [u.myFace || u.avatar, ...(u.photos || u.photoList || [])].filter(Boolean);
    return Array.from(new Set(list));
  };

  renderHero = () => {
    const imgs = this.images();
    const { page } = this.state;
    if (!imgs.length) {
      return (
        <View style={[styles.hero, styles.heroPh]}>
          <Icons name="user" size={80} color={SC.roseSoft} />
        </View>
      );
    }
    return (
      <View style={styles.hero}>
        <FlatList
          data={imgs}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(uri, i) => `${uri}_${i}`}
          renderItem={({ item }) => <CachedImage source={{ uri: item }} style={styles.heroImg} />}
          onMomentumScrollEnd={(e) =>
            this.setState({ page: Math.round(e.nativeEvent.contentOffset.x / W) })
          }
        />
        {imgs.length > 1 && (
          <View style={styles.dots} pointerEvents="none">
            {imgs.map((_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotOn]} />
            ))}
          </View>
        )}
      </View>
    );
  };

  renderChips = (list, soft) =>
    !!(list && list.length) && (
      <View style={styles.chipWrap}>
        {list.map((t) => (
          <View key={t} style={[styles.chip, soft && styles.chipSoft]}>
            <Text style={[styles.chipTxt, soft && styles.chipTxtSoft]}>{t}</Text>
          </View>
        ))}
      </View>
    );

  renderInfoRow = (label, value) =>
    !!value && (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoVal}>{value}</Text>
      </View>
    );

  render() {
    const u = this.state.user;
    const name = u.nickName || u.name || u.userId;
    const meta = [u.city, u.job].filter(Boolean).join(' · ');
    const hasTags = !!(u.tags && u.tags.length);
    const hasHobbies = !!(u.hobbies && u.hobbies.length);

    return (
      <View style={styles.root}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {this.renderHero()}

          <View style={styles.body}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              {!!u.age && (
                <View style={[styles.ageTag, u.gender === 1 && styles.ageMale]}>
                  <Icons name={u.gender === 1 ? 'man' : 'woman'} size={11} color="#fff" />
                  <Text style={styles.ageTxt}>{u.age}</Text>
                </View>
              )}
            </View>
            {!!meta && <Text style={styles.meta}>{meta}</Text>}
            <Text style={styles.sign}>{u.signStr || u.desc || '这个人很懒，什么都没写'}</Text>

            {hasTags && (
              <>
                <Text style={styles.sec}>形象标签</Text>
                {this.renderChips(u.tags)}
              </>
            )}
            {hasHobbies && (
              <>
                <Text style={styles.sec}>兴趣爱好</Text>
                {this.renderChips(u.hobbies, true)}
              </>
            )}

            {!!(u.height || u.weight || u.birthday) && (
              <>
                <Text style={styles.sec}>基本信息</Text>
                <View style={styles.infoCard}>
                  {this.renderInfoRow('身高', u.height ? `${u.height} cm` : '')}
                  {this.renderInfoRow('体重', u.weight ? `${u.weight} kg` : '')}
                  {this.renderInfoRow('生日', u.birthday)}
                </View>
              </>
            )}

            <Text style={styles.sec}>TA 的动态</Text>
            {this.state.says.length === 0 ? (
              <Text style={styles.empty}>暂无动态</Text>
            ) : (
              this.state.says.map((s) => (
                <View key={s._id} style={styles.say}>
                  <Text style={styles.sayTxt}>{s.data}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* 返回键浮在照片上 */}
        <SafeAreaView style={styles.back} edges={['top']} pointerEvents="box-none">
          <Pressable style={styles.backBtn} onPress={() => this.props.navigation.goBack()}>
            <Icons name="left" size={20} color="#fff" />
          </Pressable>
        </SafeAreaView>

        {/* 底部固定操作 */}
        <SafeAreaView style={styles.bar} edges={['bottom']}>
          <View style={styles.barRow}>
            <Pressable style={[styles.btn, styles.chatBtn]} onPress={this.chat}>
              <Icons name="message1" size={18} color={SC.ink} />
              <Text style={styles.chatTxt}>私信</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.loveBtn]} onPress={this.love}>
              <Icons name="heart" size={18} color="#fff" />
              <Text style={styles.loveTxt}>喜欢 TA</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SC.cream },
  scroll: { paddingBottom: 110 },

  hero: { width: W, height: HERO_H, backgroundColor: SC.card },
  heroPh: { alignItems: 'center', justifyContent: 'center' },
  heroImg: { width: W, height: HERO_H },
  dots: {
    position: 'absolute',
    bottom: 34,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotOn: { width: 16, backgroundColor: '#fff' },

  back: { position: 'absolute', top: 0, left: 0, right: 0 },
  backBtn: {
    marginLeft: 14,
    marginTop: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(31,18,24,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 信息区：圆角盖住照片底部 */
  body: {
    marginTop: -24,
    backgroundColor: SC.cream,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 26, fontWeight: '900', color: SC.ink, flexShrink: 1, marginRight: 10 },
  ageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SC.rose,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
  },
  ageMale: { backgroundColor: '#4C8DFF' },
  ageTxt: { marginLeft: 3, fontSize: 12, fontWeight: '800', color: '#fff' },
  meta: { marginTop: 8, fontSize: 13, color: SC.mute },
  sign: { marginTop: 12, fontSize: 15, lineHeight: 23, color: SC.ink },

  sec: { marginTop: 24, marginBottom: 10, fontSize: 15, fontWeight: '800', color: SC.ink },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: SC.rose,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSoft: { backgroundColor: SC.soft },
  chipTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
  chipTxtSoft: { color: SC.inkSoft },

  infoCard: { backgroundColor: SC.soft, borderRadius: 18, paddingHorizontal: 16 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SC.line,
  },
  infoLabel: { fontSize: 14, color: SC.mute },
  infoVal: { fontSize: 14, fontWeight: '600', color: SC.ink },

  empty: { color: SC.mute, fontSize: 13 },
  say: { backgroundColor: SC.soft, borderRadius: 16, padding: 14, marginBottom: 10 },
  sayTxt: { color: SC.ink, lineHeight: 21 },

  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(242,218,231,0.96)',
  },
  barRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 },
  btn: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBtn: { flex: 1, backgroundColor: '#fff', marginRight: 12 },
  chatTxt: { marginLeft: 6, fontSize: 15, fontWeight: '800', color: SC.ink },
  loveBtn: { flex: 1.4, backgroundColor: SC.rose },
  loveTxt: { marginLeft: 6, fontSize: 15, fontWeight: '800', color: '#fff' },
});

export default connect((s) => ({ user: s.user }))(FriendDetail);
