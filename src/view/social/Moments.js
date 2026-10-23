import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
  RefreshControl,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Http from '../../utils/HttpPost';
import { SC } from '../../theme/social';

import CachedImage, { preloadImages } from '../../component/CachedImage';
const { width: W } = Dimensions.get('window');
const PAD = 18;
const GAP = 4;
const GRID = (W - PAD * 2 - GAP * 2) / 3;
const SINGLE = Math.min(240, W * 0.62);
const PAGE_NUM = 20;

const BLUE = '#4FC3F7';
const PINK = '#FF8FB1';
const VIP_GOLD = '#F7B731';
const VIP_RED = '#D63031';
const BG_BAR = '#F5F6F8';

function fromNow(ms) {
  const t = Number(ms);
  if (!t) {
    return '';
  }
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 1) {
    return '刚刚';
  }
  if (min < 60) {
    return `${min}分钟前`;
  }
  const hour = Math.floor(min / 60);
  if (hour < 24) {
    return `${hour}小时前`;
  }
  const day = Math.floor(hour / 24);
  if (day < 30) {
    return `${day}天前`;
  }
  const d = new Date(t);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 附近的人：10 分钟内算在线 */
function activeText(ms) {
  if (!ms) {
    return '';
  }
  return Date.now() - ms < 10 * 60 * 1000 ? '在线' : fromNow(ms);
}

/** 性别 + 年龄 小胶囊（男蓝女粉） */
function GenderChip({ gender, age }) {
  if (!gender && !age) {
    return null;
  }
  const male = Number(gender) === 1;
  return (
    <View style={[styles.gChip, { backgroundColor: male ? BLUE : PINK }]}>
      <Icons name={male ? 'man' : 'woman'} size={10} color="#fff" />
      {!!age && <Text style={styles.gChipTxt}>{age}</Text>}
    </View>
  );
}

function VipChip({ level }) {
  return (
    <View style={styles.vipChip}>
      <Text style={styles.vipChipTxt}>VIP{Number(level) > 1 ? level : ''}</Text>
    </View>
  );
}

/** 陌陌式首页：顶部「动态 / 附近」+ 右上角发动态；mine 模式 = 我的动态 */
class Moments extends React.Component {
  state = {
    tab: 0,
    says: [],
    sayPage: 0,
    sayEnd: false,
    nearby: [],
    nearPage: 0,
    nearEnd: false,
    strip: [],
    refreshing: false,
    // 评论弹层
    cmtSay: null,
    cmtList: [],
    cmtText: '',
    cmtSending: false,
  };

  get mine() {
    return !!this.props.route?.params?.mine;
  }

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
    this.focusUnsub = this.props.navigation.addListener('focus', () => {
      StatusBar.setBarStyle('dark-content');
      this.refresh();
    });
    this.refresh();
  }

  componentWillUnmount() {
    this.focusUnsub && this.focusUnsub();
  }

  get logged() {
    return !!this.props.user?.isLogged;
  }

  requireLogin = (fn) => {
    if (!this.logged) {
      this.props.navigation.navigate('Login');
      return;
    }
    fn && fn();
  };

  refresh = () => {
    if (!this.logged) {
      return;
    }
    if (this.state.tab === 0 || this.mine) {
      this.loadSays(0);
      if (!this.mine) {
        this.loadStrip();
      }
    } else {
      this.loadNearby(0);
    }
  };

  loadSays = (page = 0) => {
    this.setState({ refreshing: page === 0 });
    Http('post', '/social/say/getPublishSay', {
      page,
      pageNum: PAGE_NUM,
      type: this.mine ? 4 : 1,
    })
      .then((res) => {
        if (res?.code === 200) {
          const rows = res.data?.list || [];
          // 提前缓存配图和头像，往下滑时不用再等网络
          preloadImages(rows.flatMap((r) => [r.myFace, ...(r.imgList || [])]));
          this.setState((s) => ({
            says: page === 0 ? rows : [...s.says, ...rows],
            sayPage: page,
            sayEnd: rows.length < PAGE_NUM,
          }));
        }
      })
      .finally(() => this.setState({ refreshing: false }));
  };

  loadStrip = () => {
    Http('post', '/social/manghe/recomFriend', { page: 0, pageNum: 6, type: 0 }).then((res) => {
      if (res?.code === 200) {
        const rows = (res.data?.list || []).filter((u) => (u.photos && u.photos[0]) || u.myFace);
        this.setState({ strip: rows.slice(0, 3) });
      }
    });
  };

  loadNearby = (page = 0) => {
    const city = this.props.user?.city;
    if (!city) {
      this.setState({ nearby: [], refreshing: false });
      return;
    }
    this.setState({ refreshing: page === 0 });
    Http('post', '/social/manghe/recomFriend', { page, pageNum: PAGE_NUM, type: 2, city })
      .then((res) => {
        if (res?.code === 200) {
          const rows = res.data?.list || [];
          this.setState((s) => ({
            nearby: page === 0 ? rows : [...s.nearby, ...rows],
            nearPage: page,
            nearEnd: rows.length < PAGE_NUM,
          }));
        }
      })
      .finally(() => this.setState({ refreshing: false }));
  };

  switchTab = (i) => {
    if (i === this.state.tab) {
      return;
    }
    this.setState({ tab: i }, this.refresh);
  };

  openUser = (u) => {
    this.requireLogin(() =>
      this.props.navigation.navigate('FriendDetail', {
        user: {
          userId: u.userId,
          nickName: u.nickName,
          myFace: u.myFace,
          city: u.city,
        },
      })
    );
  };

  greet = (u) => {
    this.requireLogin(() =>
      this.props.navigation.navigate('Chats', {
        partnerId: String(u.userId),
        nickName: u.nickName,
        faceUrl: u.myFace,
      })
    );
  };

  /** 抢首赞：乐观更新，失败再回滚 */
  like = (item) => {
    this.requireLogin(() => {
      if (item.liked) {
        return;
      }
      const patch = (liked, delta) =>
        this.setState((s) => ({
          says: s.says.map((x) =>
            x._id === item._id ? { ...x, liked, likeCount: (x.likeCount || 0) + delta } : x
          ),
        }));
      patch(true, 1);
      Http('post', '/social/say/likePublishSay', { id: item._id }).then((res) => {
        if (res?.code !== 200 && res?.code !== 215) {
          patch(false, -1);
        }
      });
    });
  };

  confirmDelete = (item) => {
    Alert.alert('删除动态', '删除后不可恢复，确定吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () =>
          Http('post', '/social/say/deletePublishSay', { id: item._id }).then((res) => {
            if (res?.code === 200) {
              this.setState((s) => ({ says: s.says.filter((x) => x._id !== item._id) }));
            }
          }),
      },
    ]);
  };

  /* —— 评论 —— */

  openComments = (item) => {
    this.requireLogin(() => {
      this.setState({ cmtSay: item, cmtList: [], cmtText: '' });
      Http('post', '/social/say/getComments', { sayId: item._id, page: 0, pageNum: 50 }).then(
        (res) => {
          if (res?.code === 200) {
            this.setState({ cmtList: res.data?.list || [] });
          }
        }
      );
    });
  };

  sendComment = () => {
    const { cmtSay, cmtText, cmtSending } = this.state;
    const content = cmtText.trim();
    if (!content || cmtSending || !cmtSay) {
      return;
    }
    this.setState({ cmtSending: true });
    Http('post', '/social/say/addComment', { sayId: cmtSay._id, content })
      .then((res) => {
        if (res?.code === 200 && res.data) {
          this.setState((s) => ({
            cmtList: [res.data, ...s.cmtList],
            cmtText: '',
            says: s.says.map((x) =>
              x._id === cmtSay._id ? { ...x, commentCount: (x.commentCount || 0) + 1 } : x
            ),
          }));
        }
      })
      .finally(() => this.setState({ cmtSending: false }));
  };

  /* —— 渲染 —— */

  renderImages = (imgs) => {
    if (!imgs || !imgs.length) {
      return null;
    }
    if (imgs.length === 1) {
      return <CachedImage source={{ uri: imgs[0] }} style={styles.imgSingle} />;
    }
    return (
      <View style={styles.imgGrid}>
        {imgs.slice(0, 9).map((uri, i) => (
          <CachedImage key={`${uri}_${i}`} source={{ uri }} style={styles.imgCell} />
        ))}
      </View>
    );
  };

  renderSay = ({ item }) => {
    const own = String(item.userId) === String(this.props.user?.userId);
    const meta = [fromNow(item.time), item.city].filter(Boolean).join(' · ');
    return (
      <View>
        <View style={styles.say}>
          <View style={styles.sayHead}>
            <Pressable onPress={() => this.openUser(item)}>
              {item.myFace ? (
                <CachedImage source={{ uri: item.myFace }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPh]}>
                  <Icons name="user" size={22} color={SC.roseSoft} />
                </View>
              )}
            </Pressable>
            <View style={styles.sayWho}>
              <Text
                style={[styles.name, item.isVip && { color: VIP_RED }]}
                numberOfLines={1}
              >
                {item.nickName || item.userId}
              </Text>
              <View style={styles.chips}>
                <GenderChip gender={item.gender} age={item.age} />
                {item.isVip && <VipChip level={item.vipLevel} />}
              </View>
            </View>
          </View>

          {!!item.data && <Text style={styles.content}>{item.data}</Text>}
          {this.renderImages(item.imgList)}
          {!!meta && <Text style={styles.meta}>{meta}</Text>}

          <View style={styles.acts}>
            <Pressable style={styles.act} onPress={() => this.like(item)}>
              <Icons
                name={item.liked ? 'like1' : 'like2'}
                size={20}
                color={item.liked ? SC.rose : SC.mute}
              />
              <Text style={[styles.actTxt, item.liked && { color: SC.rose }]}>
                {item.likeCount > 0 ? item.likeCount : '抢首赞'}
              </Text>
            </Pressable>
            <Pressable style={styles.act} onPress={() => this.openComments(item)}>
              <Icons name="edit" size={19} color={SC.mute} />
              <Text style={styles.actTxt}>{item.commentCount > 0 ? item.commentCount : '评论'}</Text>
            </Pressable>
            {!own && (
              <Pressable style={styles.act} onPress={() => this.greet(item)}>
                <Icons name="message1" size={19} color={SC.mute} />
                <Text style={styles.actTxt}>打招呼</Text>
              </Pressable>
            )}
            <View style={styles.flex} />
            {own && (
              <Pressable style={styles.more} onPress={() => this.confirmDelete(item)}>
                <Feather name="more-vertical" size={19} color={SC.mute2} />
              </Pressable>
            )}
          </View>
        </View>
        <View style={styles.bar} />
      </View>
    );
  };

  /** 动态顶部：同城在线的人（像陌陌里那排小照片） */
  renderStrip = () => {
    const { strip } = this.state;
    if (this.mine || !strip.length) {
      return null;
    }
    return (
      <View>
        <View style={styles.stripRow}>
          {strip.map((u) => (
            <Pressable key={u.userId} onPress={() => this.openUser(u)}>
              <CachedImage source={{ uri: (u.photos && u.photos[0]) || u.myFace }} style={styles.stripImg} />
            </Pressable>
          ))}
        </View>
        <Text style={styles.stripMeta}>在线 · 同城</Text>
        <View style={styles.bar} />
      </View>
    );
  };

  renderNear = ({ item }) => {
    const act = activeText(item.lastActive);
    const meta = [act, item.city, item.height ? `${item.height}cm` : ''].filter(Boolean).join(' · ');
    return (
      <Pressable style={styles.nearRow} onPress={() => this.openUser(item)}>
        {item.myFace ? (
          <CachedImage source={{ uri: item.myFace }} style={styles.nearAvatar} />
        ) : (
          <View style={[styles.nearAvatar, styles.avatarPh]}>
            <Icons name="user" size={26} color={SC.roseSoft} />
          </View>
        )}
        <View style={styles.nearMid}>
          <View style={styles.nameLine}>
            <Text
              style={[styles.name, item.isVip && { color: VIP_RED }, styles.nameShrink]}
              numberOfLines={1}
            >
              {item.nickName || item.userId}
            </Text>
            <GenderChip gender={item.gender} age={item.age} />
            {item.isVip && <VipChip level={item.vipLevel} />}
          </View>
          {!!meta && <Text style={styles.nearMeta}>{meta}</Text>}
          <Text style={styles.nearSign} numberOfLines={1}>
            {item.signStr || item.desc || '很高兴遇见你'}
          </Text>
        </View>
        <Pressable style={styles.hiBtn} onPress={() => this.greet(item)}>
          <Text style={styles.hiTxt}>打招呼</Text>
        </Pressable>
      </Pressable>
    );
  };

  renderEmpty = (title, desc, cta, onCta) => (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icons name="picture" size={30} color={SC.rose} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDesc}>{desc}</Text>
      {!!cta && (
        <Pressable style={styles.cta} onPress={onCta}>
          <Text style={styles.ctaTxt}>{cta}</Text>
        </Pressable>
      )}
    </View>
  );

  renderHeader = () => {
    const publish = (
      <Pressable
        style={styles.pubBtn}
        onPress={() => this.requireLogin(() => this.props.navigation.navigate('PublishSay'))}
      >
        <Feather name="send" size={16} color={SC.ink} />
        <Text style={styles.pubTxt}>发动态</Text>
      </Pressable>
    );

    if (this.mine) {
      return (
        <View style={styles.head}>
          <Pressable style={styles.backBtn} onPress={() => this.props.navigation.goBack()}>
            <Icons name="left" size={20} color={SC.ink} />
          </Pressable>
          <Text style={styles.mineTitle}>我的动态</Text>
          <View style={styles.flex} />
          {publish}
        </View>
      );
    }
    return (
      <View style={styles.head}>
        <Pressable style={styles.tabItem} onPress={() => this.switchTab(0)}>
          <Text style={[styles.tab, this.state.tab === 0 && styles.tabOn]}>动态</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => this.switchTab(1)}>
          <Text style={[styles.tab, this.state.tab === 1 && styles.tabOn]}>附近</Text>
        </Pressable>
        <View style={styles.flex} />
        {publish}
      </View>
    );
  };

  renderList = () => {
    const { tab, says, nearby, sayEnd, nearEnd, refreshing } = this.state;
    const refreshControl = (
      <RefreshControl refreshing={refreshing} onRefresh={this.refresh} tintColor={SC.rose} />
    );

    if (!this.logged) {
      return this.renderEmpty('登录后查看', '登录即可看到同城的动态和附近的人', '去登录', () =>
        this.props.navigation.navigate('Login')
      );
    }

    if (tab === 1 && !this.mine) {
      if (!this.props.user?.city) {
        return this.renderEmpty('还没有设置城市', '设置城市后，才能看到附近的人', '去设置', () =>
          this.props.navigation.navigate('MyHome')
        );
      }
      return (
        <FlatList
          data={nearby}
          keyExtractor={(u, i) => String(u.userId || i)}
          renderItem={this.renderNear}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          onEndReached={() => !nearEnd && this.loadNearby(this.state.nearPage + 1)}
          onEndReachedThreshold={0.4}
          contentContainerStyle={styles.listPad}
          ListEmptyComponent={this.renderEmpty('附近暂时没有人', '换个时间再来看看')}
        />
      );
    }

    return (
      <FlatList
        data={says}
        keyExtractor={(s, i) => String(s._id || i)}
        renderItem={this.renderSay}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        onEndReached={() => !sayEnd && this.loadSays(this.state.sayPage + 1)}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listPad}
        ListHeaderComponent={this.renderStrip}
        ListEmptyComponent={this.renderEmpty(
          this.mine ? '你还没发过动态' : '还没有动态',
          '发一条此刻的心情，遇见懂你的人',
          '发动态',
          () => this.props.navigation.navigate('PublishSay')
        )}
      />
    );
  };

  renderCommentSheet = () => {
    const { cmtSay, cmtList, cmtText, cmtSending } = this.state;
    return (
      <Modal
        visible={!!cmtSay}
        transparent
        animationType="slide"
        onRequestClose={() => this.setState({ cmtSay: null })}
      >
        <Pressable style={styles.mask} onPress={() => this.setState({ cmtSay: null })} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>评论 {cmtSay?.commentCount || 0}</Text>
              <Pressable onPress={() => this.setState({ cmtSay: null })}>
                <Icons name="close" size={20} color={SC.mute} />
              </Pressable>
            </View>
            <FlatList
              data={cmtList}
              keyExtractor={(c) => String(c._id)}
              style={styles.cmtList}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text style={styles.cmtEmpty}>还没有评论，来抢沙发</Text>}
              renderItem={({ item: c }) => (
                <View style={styles.cmt}>
                  {c.myFace ? (
                    <CachedImage source={{ uri: c.myFace }} style={styles.cmtAvatar} />
                  ) : (
                    <View style={[styles.cmtAvatar, styles.avatarPh]}>
                      <Icons name="user" size={14} color={SC.roseSoft} />
                    </View>
                  )}
                  <View style={styles.cmtBody}>
                    <Text style={styles.cmtName}>{c.nickName || c.userId}</Text>
                    <Text style={styles.cmtTxt}>{c.content}</Text>
                    <Text style={styles.cmtTime}>{fromNow(c.time)}</Text>
                  </View>
                </View>
              )}
            />
            <View style={styles.cmtBar}>
              <TextInput
                style={styles.cmtInput}
                value={cmtText}
                onChangeText={(v) => this.setState({ cmtText: v })}
                placeholder="说点什么..."
                placeholderTextColor={SC.mute2}
                maxLength={200}
                returnKeyType="send"
                onSubmitEditing={this.sendComment}
              />
              <Pressable
                style={[styles.cmtSend, !cmtText.trim() && styles.cmtSendOff]}
                onPress={this.sendComment}
              >
                <Text style={styles.cmtSendTxt}>{cmtSending ? '...' : '发送'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        {this.renderHeader()}
        <View style={styles.flex}>{this.renderList()}</View>
        {this.renderCommentSheet()}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },

  /* 顶部 */
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: PAD,
    paddingRight: 14,
    paddingTop: 8,
    paddingBottom: 12,
  },
  tabItem: { marginRight: 20 },
  tab: { fontSize: 22, fontWeight: '700', color: 'rgba(31,18,24,0.38)' },
  tabOn: { fontSize: 25, fontWeight: '900', color: SC.ink },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  mineTitle: { fontSize: 20, fontWeight: '900', color: SC.ink },
  pubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    elevation: 4,
    shadowColor: 'rgba(31,18,24,0.25)',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  pubTxt: { marginLeft: 6, fontSize: 15, fontWeight: '700', color: SC.ink },

  listPad: { paddingBottom: 30, flexGrow: 1 },
  bar: { height: 8, backgroundColor: BG_BAR },

  /* 动态条目 */
  say: { paddingHorizontal: PAD, paddingTop: 16 },
  sayHead: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: SC.card },
  avatarPh: { alignItems: 'center', justifyContent: 'center' },
  sayWho: { flex: 1, marginLeft: 12 },
  name: { fontSize: 17, fontWeight: '700', color: SC.ink },
  nameShrink: { flexShrink: 1, marginRight: 6 },
  chips: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  gChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    height: 17,
    borderRadius: 9,
    marginRight: 6,
  },
  gChipTxt: { marginLeft: 2, fontSize: 11, fontWeight: '800', color: '#fff' },
  vipChip: {
    paddingHorizontal: 7,
    height: 17,
    borderRadius: 9,
    backgroundColor: VIP_GOLD,
    justifyContent: 'center',
  },
  vipChipTxt: { fontSize: 11, fontWeight: '900', fontStyle: 'italic', color: '#fff' },
  content: { marginTop: 12, fontSize: 16, lineHeight: 24, color: SC.ink },
  imgSingle: {
    marginTop: 12,
    width: SINGLE,
    height: SINGLE,
    borderRadius: 8,
    backgroundColor: SC.card,
  },
  imgGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap' },
  imgCell: {
    width: GRID,
    height: GRID,
    borderRadius: 6,
    marginRight: GAP,
    marginBottom: GAP,
    backgroundColor: SC.card,
  },
  meta: { marginTop: 12, fontSize: 13, color: 'rgba(31,18,24,0.4)' },
  acts: { flexDirection: 'row', alignItems: 'center', height: 52 },
  act: { flexDirection: 'row', alignItems: 'center', marginRight: 28 },
  actTxt: { marginLeft: 6, fontSize: 14, color: SC.mute },
  more: { paddingLeft: 12, paddingVertical: 8 },

  /* 动态顶部小照片 */
  stripRow: { flexDirection: 'row', paddingHorizontal: PAD, paddingTop: 4 },
  stripImg: { width: 140, height: 140, borderRadius: 8, marginRight: 6, backgroundColor: SC.card },
  stripMeta: { paddingHorizontal: PAD, paddingVertical: 14, fontSize: 13, color: 'rgba(31,18,24,0.4)' },

  /* 附近的人 */
  nearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SC.line,
  },
  nearAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: SC.card },
  nearMid: { flex: 1, marginLeft: 14, marginRight: 8 },
  nameLine: { flexDirection: 'row', alignItems: 'center' },
  nearMeta: { marginTop: 6, fontSize: 12, color: 'rgba(31,18,24,0.45)' },
  nearSign: { marginTop: 5, fontSize: 13, color: SC.inkSoft },
  hiBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SC.rose,
  },
  hiTxt: { fontSize: 13, fontWeight: '700', color: SC.rose },

  /* 空态 */
  empty: { alignItems: 'center', paddingTop: 90, paddingHorizontal: 40 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(226,60,254,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { marginTop: 16, fontSize: 16, fontWeight: '800', color: SC.ink },
  emptyDesc: { marginTop: 8, fontSize: 13, color: SC.mute, textAlign: 'center', lineHeight: 20 },
  cta: {
    marginTop: 20,
    backgroundColor: SC.rose,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 22,
  },
  ctaTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },

  /* 评论弹层 */
  mask: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    maxHeight: Dimensions.get('window').height * 0.7,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PAD,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SC.line,
  },
  sheetTitle: { fontSize: 15, fontWeight: '800', color: SC.ink },
  cmtList: { minHeight: 160, paddingHorizontal: PAD },
  cmtEmpty: { textAlign: 'center', paddingVertical: 40, color: SC.mute, fontSize: 13 },
  cmt: { flexDirection: 'row', paddingTop: 14 },
  cmtAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: SC.card },
  cmtBody: { flex: 1, marginLeft: 10 },
  cmtName: { fontSize: 13, fontWeight: '700', color: SC.inkSoft },
  cmtTxt: { marginTop: 4, fontSize: 15, lineHeight: 21, color: SC.ink },
  cmtTime: { marginTop: 4, fontSize: 11, color: 'rgba(31,18,24,0.4)' },
  cmtBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SC.line,
  },
  cmtInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: BG_BAR,
    paddingHorizontal: 16,
    fontSize: 14,
    color: SC.ink,
  },
  cmtSend: {
    marginLeft: 10,
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 20,
    backgroundColor: SC.rose,
    justifyContent: 'center',
  },
  cmtSendOff: { opacity: 0.4 },
  cmtSendTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
});

export default connect((s) => ({ user: s.user }))(Moments);
