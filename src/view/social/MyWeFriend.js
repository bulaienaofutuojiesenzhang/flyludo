import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
  Share,
  RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { SC } from '../../theme/social';
import { AppDialog } from '../../component';

class MyWeFriend extends React.Component {
  state = { list: [], refreshing: false };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
    this.load();
  }

  load = () => {
    this.setState({ refreshing: true });
    Http('post', '/social/manghe/friendWxList', { page: 0, pageNum: 50 })
      .then((res) => {
        if (res?.code === 200) this.setState({ list: res.data?.list || [] });
      })
      .finally(() => this.setState({ refreshing: false }));
  };

  copy = (wx) => {
    const text = String(wx || '');
    Share.share({ message: text }).catch(() =>
      AppDialog.show({ title: '微信号', message: text })
    );
  };

  renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.nickName || '有缘人'}</Text>
        <Text style={styles.wx}>{item.wechatNo}</Text>
        <Text style={styles.meta}>{item.city || ''}</Text>
      </View>
      <Pressable style={styles.btn} onPress={() => this.copy(item.wechatNo)}>
        <Text style={styles.btnTxt}>复制</Text>
      </Pressable>
    </View>
  );

  render() {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => this.props.navigation.goBack()}>
            <Icons name="left" size={22} color={SC.ink} />
          </Pressable>
          <Text style={styles.navTitle}>抽到的微信</Text>
          <View style={{ width: 22 }} />
        </View>
        <FlatList
          data={this.state.list}
          keyExtractor={(item, i) => String(item._id || i)}
          renderItem={this.renderItem}
          refreshControl={
            <RefreshControl refreshing={this.state.refreshing} onRefresh={this.load} tintColor={SC.rose} />
          }
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>还没有抽到微信</Text>
              <Text style={styles.emptyDesc}>去扩列页试试微信盲盒</Text>
            </View>
          }
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SC.soft,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  name: { fontSize: 15, fontWeight: '700', color: SC.ink },
  wx: { marginTop: 4, color: SC.rose, fontWeight: '600' },
  meta: { marginTop: 2, fontSize: 12, color: SC.mute },
  btn: { backgroundColor: SC.card, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  btnTxt: { color: SC.rose, fontWeight: '700' },
  empty: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontWeight: '700', color: SC.ink },
  emptyDesc: { marginTop: 8, color: SC.mute },
});

export default connect((s) => ({ user: s.user }))(MyWeFriend);
