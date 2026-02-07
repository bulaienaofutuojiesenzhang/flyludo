import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, TextInput, FlatList } from 'react-native';
import { connect } from 'react-redux';

import { Colors, Metrics } from '../../theme';
import { Loading, ToastService, MyAlert } from '../../component';
import Http from '../../utils/HttpPost';

class MyFocus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      showFoot: 1,
      page: 1,
      searchText: '',
      followers: [
      ],
    }
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    this.initFunc()
  }

  initFunc() {
    this.setState({ isLoading: true, showFoot: 0, page: 1 }, () => {
      Http('get', `/api/artist/collect/list/${this.state.page}/${10}`, {

      }).then(res => {
        this.setState({ isLoading: false, refreshLoading: false })
        console.log(res.data.list)
        if (res.code === 200) {
          this.setState({ followers: res.data.list })
        }
      })
    })
  }

  _onRefresh() {
    this.setState({ refreshLoading: true })
    this.initFunc();
  }


  handleFollow = (userId) => {
    // this.setState((prevState) => ({
    //   followers: prevState.followers.map((follower) =>
    //     follower.id === id ? { ...follower, mutual: !follower.mutual } : follower
    //   ),
    // }));
    Http('post', `/api/artist/collect/del/${userId}`, {}).then(res => {
      this.setState({ isLoading: false, refreshLoading: false })
      console.log(res.data)
      if (res.code === 200) {
        this.initFunc()
        ToastService.showToast({
          title: '取消关注'
        })
      }
    })
  };

  _onEndReached() {
    if (this.state.showFoot == 1) {
      return
    }
    let page = this.state.page + 1;
    this.setState({ isLoading: true, showFoot: 2 })
    Http('get', `/api/artist/collect/list/${page}/${10}`, {

    }).then(res => {
      this.setState({ isLoading: false, refreshLoading: false })
      if (res.code === 200) {
        if (res.data?.list.length) {
          let followers = [...this.state.followers, ...res.data.list]
          this.setState({ followers: followers, page: page, showFoot: 0 })
        } else {
          this.setState({ showFoot: 1 })
        }
      }
    })
  }

  _renderFooter() {
    if (this.state.showFoot === 1) {
      return (
        <View style={{ height: 58, alignItems: 'center', justifyContent: 'center', }}>
          <Text style={{ color: Colors.hui99, fontSize: 14 }}>
            没有更多数据了
          </Text>
        </View>
      );
    } else if (this.state.showFoot === 2) {
      return (
        <View style={{ height: 58, alignItems: 'center', justifyContent: 'center', }}>
          <Text style={{ color: Colors.hui99, fontSize: 14 }}>正在加载更多数据...</Text>
        </View>
      );
    } else if (this.state.showFoot === 0) {
      return (
        <View style={{ height: 58, alignItems: 'center', justifyContent: 'center', }}>
          <Text></Text>
        </View>
      );
    }
  }

  renderFollower = ({ item }) => {
    return (
      <View style={Styles.followerItem}>
        <Image
          source={item.avatar || require('../../asserts/images/publish/plc_yika.png')}
          style={Styles.avatar}
        />
        <View style={Styles.followerInfo}>
          <Text style={Styles.followerName}>{item.artistUserInfo?.name}</Text>
          <Text style={Styles.followerDescription}>个人描述或标签</Text>
        </View>
        <TouchableOpacity
          style={[
            Styles.followButton,
            { backgroundColor: '#f44336' },
          ]} 
          onPress={() => this.handleFollow(item.artistUserId)}
        >
          <Text style={[Styles.followButtonText, { color: '#fff' }]}>
            取消关注
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.moreButton}>
          <Text style={Styles.moreButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    return (
      <View style={Styles.container}>
        {/* 搜索框 */}
        {/* <View style={Styles.searchBar}>
          <TextInput
            style={Styles.searchInput}
            placeholder="搜索用户备注或名字"
            value={this.state.searchText}
            onChangeText={(text) => this.setState({ searchText: text })}
          />
        </View> */}

        {/* 粉丝列表 */}
        <FlatList
          data={this.state.followers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={this.renderFollower}
          ListFooterComponent={this._renderFooter()}
            onEndReached={() => { this._onEndReached() }}
            onEndReachedThreshold={0.3}
        />
      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(MyFocus);

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    padding: 10,
    paddingVertical: 20,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  followerInfo: {
    flex: 1,
  },
  followerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  followerDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  followButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  moreButton: {
    paddingHorizontal: 10,
  },
  moreButtonText: {
    fontSize: 20,
    color: '#999',
  },
});
