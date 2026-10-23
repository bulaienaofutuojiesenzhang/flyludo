import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { SC } from '../../theme/social';

import CachedImage from '../../component/CachedImage';
class SearchFriend extends React.Component {
  state = { keyword: '', list: [] };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
  }

  search = () => {
    const keyword = String(this.state.keyword || '').trim();
    Http('post', '/social/manghe/searchFriend', {
      page: 0,
      pageNum: 30,
      type: 0,
      keyword,
    }).then((res) => {
      if (res?.code === 200) this.setState({ list: res.data?.list || [] });
    });
  };

  renderItem = ({ item }) => (
    <Pressable
      style={styles.row}
      onPress={() => this.props.navigation.navigate('FriendDetail', { user: item })}
    >
      <View style={styles.avatar}>
        {item.myFace || item.avatar ? (
          <CachedImage source={{ uri: item.myFace || item.avatar }} style={styles.avatarImg} />
        ) : (
          <Icons name="user" size={20} color={SC.rose} />
        )}
      </View>
      <Text style={styles.name}>{item.nickName || item.name || item.userId}</Text>
    </Pressable>
  );

  render() {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => this.props.navigation.goBack()}>
            <Icons name="left" size={22} color={SC.ink} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="搜昵称"
            placeholderTextColor={SC.mute}
            value={this.state.keyword}
            onChangeText={(keyword) => this.setState({ keyword })}
            onSubmitEditing={this.search}
            returnKeyType="search"
          />
          <Pressable onPress={this.search}>
            <Text style={styles.go}>搜索</Text>
          </Pressable>
        </View>
        <FlatList
          data={this.state.list}
          keyExtractor={(item, i) => String(item.userId || i)}
          renderItem={this.renderItem}
          contentContainerStyle={{ padding: 16 }}
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: SC.soft,
    borderRadius: 14,
    paddingHorizontal: 12,
    color: SC.ink,
  },
  go: { color: SC.rose, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SC.soft,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: SC.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarImg: { width: 44, height: 44 },
  name: { fontSize: 15, fontWeight: '700', color: SC.ink },
});

export default connect((s) => ({ user: s.user }))(SearchFriend);
