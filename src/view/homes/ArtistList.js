import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, TextInput, FlatList, Pressable } from 'react-native';
import { connect } from 'react-redux';
import FastImage from 'react-native-fast-image';

import Config from '../../config/index';
import { Colors, Metrics } from '../../theme';
import { Loading, ToastService, MyAlert } from '../../component';
import Http from '../../utils/HttpPost';

class ArtistList extends Component {
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
      Http('get', `/api/artist/list/${this.state.page}/${10}`, {

      }).then(res => {
        this.setState({ isLoading: false, refreshLoading: false })
        console.log(res.data.list)
        if (res.code === 0) {
          this.setState({ followers: res.data.list })
        }
      })
    })
  }

  _onRefresh() {
    this.setState({ refreshLoading: true })
    this.initFunc();
  }


  handleFollow = (id) => {
    this.setState((prevState) => ({
      followers: prevState.followers.map((follower) =>
        follower.id === id ? { ...follower, mutual: !follower.mutual } : follower
      ),
    }));
  };

  _onEndReached() {
    if (this.state.showFoot == 1) {
      return
    }
    let page = this.state.page + 1;
    this.setState({ isLoading: true, showFoot: 2 })
    Http('get', `/api/artist/list/${page}/${10}`, {

    }).then(res => {
      this.setState({ isLoading: false, refreshLoading: false })
      if (res.code === 0) {
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

  guanzhuFunc(userId) {
    Http('post', `/api/artist/collect/add/${userId}`, {}).then(res => {
      this.setState({ isLoading: false, refreshLoading: false })
      console.log(res.data)
      if (res.code === 0) {
        this.initFunc();
        ToastService.showToast({
          title: '已关注'
        })
      }
    })
  }

  quxiaoguanzhuFunc(userId) {
    Http('post', `/api/artist/collect/del/${userId}`, {}).then(res => {
      this.setState({ isLoading: false, refreshLoading: false })
      console.log(res.data)
      if (res.code === 0) {
        this.initFunc();
        ToastService.showToast({
          title: '取消关注'
        })
      }
    })
  }

  



  renderFollower = ({ item }) => {
    return (
      <View style={Styles.followerItem}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => { this.props.navigation.push('ArtistDetail', item) }} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FastImage style={Styles.avatar} source={item.userInfo?.avatar ? { uri: Config.File_PATH + item.userInfo?.avatar } : require('../../asserts/images/user/plc_user.png')} />
            <Text style={{ marginLeft: 5 }}>{item.userInfo.name}</Text> 
          </TouchableOpacity>

          <View>
            {
              item.isCollect ?
                <TouchableOpacity onPress={() => { this.quxiaoguanzhuFunc(item.userId) }} style={{ width: 60, backgroundColor: Colors.subject, paddingVertical: 3, borderRadius: 15 }} >
                  <Text style={{ color: Colors.bai, textAlign: 'center' }}>已关注</Text>
                </TouchableOpacity>
                :
                <TouchableOpacity onPress={() => { this.guanzhuFunc(item.userId) }} style={{ width: 60, backgroundColor: Colors.subject, paddingVertical: 3, borderRadius: 15 }} >
                  <Text style={{ color: Colors.bai, textAlign: 'center' }}>关注</Text>
                </TouchableOpacity>
            }

          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginVertical: 15 }}>
          {item.imgUrlList.map(itemImg =>
            <Image style={{ width: Metrics.px2dpi(288), height: Metrics.px2dpi(210), marginRight: 10 }} source={itemImg ? { uri: Config.File_PATH + itemImg } : require('../../asserts/images/publish/test_img1.png')} resizeMode='stretch' />
          )}
        </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(ArtistList);

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
    flexDirection: 'column',
    padding: 10,
    paddingVertical: 20,
    borderBottomWidth: 1,
    backgroundColor: Colors.bai,
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
