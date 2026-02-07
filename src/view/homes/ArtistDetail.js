import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, SectionList, TouchableOpacity, Image, ImageBackground, TextInput } from 'react-native';
import { connect } from 'react-redux';
import { Tab, TabView } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Moment from 'moment';

import Config from '../../config/index';
import { Colors, Metrics } from '../../theme';
import { Loading, ToastService, MyAlert } from '../../component';
import Http from '../../utils/HttpPost';

class ArtistDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      myAlert: false,
      myAlertTile: '提示',
      myAlertMsg: '您还未进行实名认证，请在实名认证通过后再进行该操作。',
      user: {},
      tabIndex: 0,
      page: 0,
      fansNum: 0,
      zuopinNum: 0,
      focusNum: 0,
    }
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    // console.log('this.props.route', this.props.route)
    this.initFunc()

    // Http('get', `/api/artist/fans/list/1/${10}`).then(res => {
    //   console.log(res.data.list)
    //   if (res.code === 200) {
    //     this.setState({ fansNum: res.data.total_count })
    //   }
    // })
    

    // Http('get', `/api/artist/collect/list/1/${10}`).then(res => {
    //   if (res.code === 200) {
    //     this.setState({ focusNum: res.data.total_count })
    //   }
    // })
  }

  setTabIndexFunc(e) {
    this.setState({ tabIndex: e })
  }

  initFunc() {
    Http('get', `/api/artist/info/${this.props.route.params.userId}`).then(res => {
      if (res.code === 200) {
        this.setState({ user: res.data})
      }
    })


    this.setState({ isLoading: true, showFoot: 0, page: 1 }, () => {
      Http('get', `/api/works/list/all/1/${10}`, {
        userId: this.props.route.params.userId
      }).then(res => {
        this.setState({ isLoading: false, refreshLoading: false })
        console.log(res.data.list)
        if (res.code === 200) {
          this.setState({ dataList: res.data.list, zuopinNum: res.data.total_count })
        }
      })
    })

  }

  _onRefresh() {
    this.setState({ refreshLoading: true })
    this.initFunc();
  }

  _onEndReached() {
    if (this.state.showFoot == 1) {
      return
    }
    let page = this.state.page + 1;
    this.setState({ isLoading: true, showFoot: 2 })
    Http('get', `/api/works/list/all/${page}/${10}`, {
      userId: this.props.route.params.userId,
    }).then(res => {
      this.setState({ isLoading: false, refreshLoading: false })
      if (res.code === 200) {
        if (res.data?.list.length) {
          let dataList = [...this.state.dataList, ...res.data.list]
          this.setState({ dataList: dataList, page: page, showFoot: 0 })
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

  renderListItem(item, index) {
    return (
      <TouchableOpacity onPress={()=> { this.props.navigation.push('WorkDetail', item) }} style={Styles.itemsCont} key={index} >
        <TouchableOpacity style={Styles.myColumn} >
          <Text style={Styles.names}>上传时间 {Moment(item.createTime).format('YYYY-MM-DD HH:mm')} </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {
              item.hashId ?
                <Image style={Styles.itemRightIcon} source={require('../../asserts/images/publish/icon_work_cert.png')} resizeMode='contain' />
                :
                <Image style={Styles.itemRightIcon} source={require('../../asserts/images/publish/icon_work_cert_un.png')} resizeMode='contain' />
            }
            {
              item.dictId ?
                <Image style={Styles.itemRightIcon} source={require('../../asserts/images/publish/icon_work_dci.png')} resizeMode='contain' />
                :
                <Image style={Styles.itemRightIcon} source={require('../../asserts/images/publish/icon_work_dci_un.png')} resizeMode='contain' />
            }

            <Text style={Styles.isShowText}>{item.isShow ? '已展示' : '未展示'} </Text>
          </View>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginVertical: 10 }}>
          <View>
            <FastImage style={Styles.imgUrl} source={item.dataUrl ? { uri: Config.File_PATH + item.dataUrl } : require('../../asserts/images/publish/icon_add.png')} />
          </View>
          <View style={{ marginLeft: 10, flex: 1, justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: Colors.hei, fontSize: Metrics.fontSize16 }}>{item.name}</Text>
            </View>
            <View>
              <Text>{item.type === 1
                ? '美术'
                : item.type === 2
                  ? '摄影'
                  : item.type === 3
                    ? '其他'
                    : '未知分类'}
              </Text>
              <Text style={{marginTop: 10}}>作者 {this.state.user.name}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }



  render() {
    return (
      <View style={Styles.container}>
        {/* 顶部背景 */}
        <ImageBackground style={Styles.userBackImg} source={require('../../asserts/images/user/icon_intro_bg.png')} resizeMode='stretch'>
          <FastImage style={Styles.headerPortrait} source={this.state.user.avatar ? { uri: Config.File_PATH + this.state.user.avatar } : require('../../asserts/images/user/plc_user.png')} />
          <View style={Styles.userNickCont}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                  <Text style={Styles.userNickText}>{this.state.user.userName || '暗忍'}</Text>
                </View>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30}}>

                  <View style={{justifyContent:'center', alignItems: 'center', marginHorizontal: 50}}>
                    <Text style={{color: Colors.bai, fontSize: 14, fontWeight: 'bold'}}>{this.state.zuopinNum}</Text>
                    <Text style={{color: Colors.huiCc, fontSize: 13}}>作品库</Text>
                  </View>

                  <View style={{justifyContent:'center', alignItems: 'center', marginHorizontal: 50}}>
                    <Text style={{color: Colors.bai, fontSize: 14, fontWeight: 'bold'}}>{this.state.fansNum}</Text>
                    <Text style={{color: Colors.huiCc, fontSize: 13}}>粉丝</Text>
                  </View>
              </View>
        </ImageBackground>
        <View style={{ flex: 1, backgroundColor: Colors.bai }}>
        <Tab
          value={this.state.tabIndex}
          onChange={(e) => this.setTabIndexFunc(e)}
          indicatorStyle={{ backgroundColor: Colors.subject, height: 3 }}
          dense={false}
          scrollable={false}
          style={{ backgroundColor: 'white' }} // 设置背景色为白色
        >
          {['作品库', '简介'].map((title, index) => (
            <Tab.Item
              key={index}
              title={title}
              titleStyle={{
                color: this.state.tabIndex === index ? 'black' : 'gray',
                fontSize: Metrics.fontSize14,
              }}
              buttonStyle={{
                backgroundColor: Colors.bai,
                paddingHorizontal: 0, // 减少水平内边距
              }}
            />
          ))}
        </Tab>


        {
          this.state.tabIndex == 0?
          <FlatList
            data={this.state.dataList}
            renderItem={({ item, index }) => this.renderListItem(item, index)}
            keyExtractor={(item, index) => String(index)}
            ListFooterComponent={this._renderFooter()}
            onEndReached={() => { this._onEndReached() }}
            onEndReachedThreshold={0.3}
          ></FlatList>
          :
          <View>
            

            <View style={{ marginTop: 8, backgroundColor: Colors.bai, paddingBottom: 20, paddingHorizontal: 10 }}>
            <Text style={{ lineHeight: 50, fontSize: Metrics.fontSize15 }}>简介</Text>
            <View style={{ borderWidth: 1, borderColor: Colors.huiCc, borderRadius: 10, borderStyle: 'dashed', }}>
              <Text style={Styles.inputText}>
                {
                  this.state.user.desc ? this.state.user.desc : '这个人没有简介'
                }
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 8, backgroundColor: Colors.bai, paddingBottom: 20, paddingHorizontal: 10 }}>
            <Text style={{ lineHeight: 50, fontSize: Metrics.fontSize15 }}>基本信息</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{color: Colors.hui99}}>
                性别
              </Text>
              <Text style={{marginLeft: 30, color: Colors.hui33}}>
                {
                  this.state.user.gender == 2? '女': '男'
                }
              </Text>
            </View>
          </View>

          </View>
        }
      </View>
        




      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(ArtistDetail);

const Styles = StyleSheet.create({
  headerPortrait: { width: Metrics.px2dp(150), height: Metrics.px2dp(150), borderRadius: Metrics.px2dp(150), marginTop: -10 },
  userNickCont: { },
  userNickText: { fontSize: Metrics.fontSize20, color: Colors.bai },
  userNickEditIcon: { width: 25, height: 25 },
  itemsCont: { backgroundColor: Colors.bai, marginBottom: 8, paddingVertical: 15, paddingHorizontal: 10 },
  myColumn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  imgUrl: { width: Metrics.px2dpi(300), height: Metrics.px2dpi(300), },
  itemRightIcon: { width: 23, height: 23, marginRight: 10 },
  isShowText: { color: Colors.subject },
  zhamshiText: { color: Colors.bai, fontSize: Metrics.fontSize12 },
inputText: { textAlignVertical: 'top', height: 110, lineHeight: 52, paddingHorizontal: 10, fontSize: Metrics.fontSize16 },

  userBackImg: {
    paddingVertical: 30,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  inviteIcon: {
    width: Metrics.px2dpi(915),
    height: Metrics.px2dpi(198),
  },
  headerTitle: {
    fontSize: 28,
    color: Colors.subjectQian,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 18,
    color: Colors.subject,
    marginTop: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  iconLabel: {
    fontSize: 12,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: '#f0e6d6',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    color: '#8a6d3b',
  },
  darkButton: {
    backgroundColor: '#333',
  },
  darkButtonText: {
    color: '#fff',
  },
});
