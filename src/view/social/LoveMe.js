import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';

import CachedImage from '../../component/CachedImage';
const C = {
  ink: '#2A1420',
  rose: '#E23CFE',
  blush: '#FFF0F6',
  soft: '#FFFFFF',
  mute: 'rgba(42,20,32,0.55)',
};

class LoveMe extends React.Component {
  state = { list: [], refreshing: false, page: 0 };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
    this.load();
  }

  load = async (page = 0) => {
    if (!this.props.user?.isLogged) return;
    this.setState({ refreshing: true });
    try {
      const res = await Http('post', '/social/user/loveMeList', {
        page,
        pageNum: 20,
      });
      if (res && res.code === 200) {
        const list = res.data?.list || [];
        this.setState({ list: page === 0 ? list : [...this.state.list, ...list], page });
      }
    } finally {
      this.setState({ refreshing: false });
    }
  };

  openChat = (item) => {
    this.props.navigation.navigate('Chats', {
      partnerId: String(item.userId),
      nickName: item.name || item.nickName,
      faceUrl: item.avatar || item.myFace,
    });
  };

  renderItem = ({ item }) => (
    <Pressable style={styles.row} onPress={() => this.openChat(item)}>
      <View style={styles.avatar}>
        {item.avatar || item.myFace ? (
          <CachedImage source={{ uri: item.avatar || item.myFace }} style={styles.avatarImg} />
        ) : (
          <Icons name="user" size={22} color={C.rose} />
        )}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{item.name || item.nickName || item.userId}</Text>
        <Text style={styles.desc} numberOfLines={1}>
          {item.city || item.desc || '对你心动了'}
        </Text>
      </View>
      <Icons name="message1" size={18} color={C.rose} />
    </Pressable>
  );

  render() {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => this.props.navigation.goBack()} hitSlop={12}>
            <Icons name="left" size={22} color={C.ink} />
          </Pressable>
          <Text style={styles.navTitle}>喜欢我</Text>
          <View style={{ width: 22 }} />
        </View>

        <FlatList
          data={this.state.list}
          keyExtractor={(item, i) => String(item.userId || i)}
          renderItem={this.renderItem}
          contentContainerStyle={this.state.list.length ? { padding: 16 } : styles.emptyWrap}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.load(0)}
              tintColor={C.rose}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icons name="heart" size={40} color={C.rose} />
              <Text style={styles.emptyTitle}>还没有人喜欢你</Text>
              <Text style={styles.emptyDesc}>去推荐页遇见更多有缘人吧</Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.blush },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navTitle: { fontSize: 17, fontWeight: '700', color: C.ink },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.soft,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFE8F3',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 48, height: 48 },
  name: { fontSize: 16, fontWeight: '700', color: C.ink },
  desc: { marginTop: 4, fontSize: 13, color: C.mute },
  emptyWrap: { flexGrow: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 24,
    padding: 28,
    backgroundColor: C.soft,
    borderRadius: 24,
  },
  emptyTitle: { marginTop: 14, fontSize: 17, fontWeight: '700', color: C.ink },
  emptyDesc: { marginTop: 8, fontSize: 13, color: C.mute },
});

export default connect((s) => ({ user: s.user }))(LoveMe);
