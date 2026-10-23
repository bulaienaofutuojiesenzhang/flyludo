import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  StatusBar,
  RefreshControl,
  Modal,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { SC } from '../../theme/social';

class AnonymousWall extends React.Component {
  state = { list: [], refreshing: false, showPost: false, content: '' };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
    this.load();
  }

  load = () => {
    this.setState({ refreshing: true });
    Http('post', '/social/niming/getWallList', { page: 0, pageNum: 40 })
      .then((res) => {
        if (res?.code === 200) this.setState({ list: res.data?.list || [] });
      })
      .finally(() => this.setState({ refreshing: false }));
  };

  like = (item) => {
    if (!this.props.user?.isLogged) {
      this.props.navigation.navigate('Login');
      return;
    }
    Http('post', '/social/niming/likeWall', { wallId: item._id }).then(() => this.load());
  };

  post = () => {
    const content = String(this.state.content || '').trim();
    if (!content) return;
    Http('post', '/social/niming/postWall', { content }).then((res) => {
      if (res?.code === 200) {
        this.setState({ showPost: false, content: '' });
        this.load();
      }
    });
  };

  renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: item.bgColor || SC.card }]}>
      <Text style={[styles.content, { color: item.textColor || SC.ink }]}>{item.content}</Text>
      <View style={styles.foot}>
        <Text style={styles.fake}>{item.fakeName || '匿名'}</Text>
        <Pressable style={styles.like} onPress={() => this.like(item)}>
          <Icons name="heart" size={14} color={SC.rose} />
          <Text style={styles.likeTxt}>{item.likes || 0}</Text>
        </Pressable>
      </View>
    </View>
  );

  render() {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => this.props.navigation.goBack()}>
            <Icons name="left" size={22} color={SC.ink} />
          </Pressable>
          <Text style={styles.navTitle}>匿名墙</Text>
          <Pressable
            onPress={() => {
              if (!this.props.user?.isLogged) {
                this.props.navigation.navigate('Login');
                return;
              }
              this.setState({ showPost: true });
            }}
          >
            <Icons name="edit" size={20} color={SC.rose} />
          </Pressable>
        </View>
        <FlatList
          data={this.state.list}
          keyExtractor={(item, i) => String(item._id || i)}
          renderItem={this.renderItem}
          refreshControl={
            <RefreshControl refreshing={this.state.refreshing} onRefresh={this.load} tintColor={SC.rose} />
          }
          contentContainerStyle={{ padding: 16 }}
        />
        <Modal visible={this.state.showPost} transparent animationType="slide">
          <View style={styles.modal}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>匿名发言</Text>
              <TextInput
                style={styles.input}
                multiline
                placeholder="说点什么，不会暴露身份"
                placeholderTextColor={SC.mute}
                value={this.state.content}
                onChangeText={(content) => this.setState({ content })}
              />
              <View style={styles.sheetBtns}>
                <Pressable onPress={() => this.setState({ showPost: false })}>
                  <Text style={styles.cancel}>取消</Text>
                </Pressable>
                <Pressable style={styles.cta} onPress={this.post}>
                  <Text style={styles.ctaTxt}>发布</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  card: { borderRadius: 18, padding: 16, marginBottom: 12 },
  content: { fontSize: 15, lineHeight: 22 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' },
  fake: { fontSize: 12, color: SC.mute },
  like: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeTxt: { fontSize: 12, color: SC.mute },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: SC.soft,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    paddingBottom: 32,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: SC.ink, marginBottom: 12 },
  input: {
    minHeight: 100,
    backgroundColor: SC.blush,
    borderRadius: 14,
    padding: 12,
    color: SC.ink,
    textAlignVertical: 'top',
  },
  sheetBtns: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 14, gap: 16 },
  cancel: { color: SC.mute },
  cta: { backgroundColor: SC.rose, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 16 },
  ctaTxt: { color: '#fff', fontWeight: '700' },
});

export default connect((s) => ({ user: s.user }))(AnonymousWall);
