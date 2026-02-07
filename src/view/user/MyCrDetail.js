import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, StatusBar, FlatList, Image, Text, TextInput, Pressable, Switch } from 'react-native';
import { View, } from 'native-base';
import { Tab, TabView } from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import DatePicker from 'react-native-date-picker';
import Moment from 'moment';

import { Header, Loading, ToastService } from '../../component';
import Config from '../../config/index';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import ParamsValidate from '../../utils/ValueValidate';


class MyCrDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      showFoot: 1,
      page: 1,
      tabIndex: 0,
      dataList: [],
    }
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    this.initFunc()
  }

  setTabIndexFunc(e) {
    this.setState({ tabIndex: e })
  }

  filterDataList = () => {
    const { tabIndex, dataList } = this.state;
    switch (tabIndex) {
      case 0:
        return dataList; // 全部数据
      case 1:
        return dataList.filter((item) => item.checkStatus === 0); // isShow 值为 0 的数据
      case 2:
        return dataList.filter((item) => item.checkStatus == 2); // checkStatus 值为 0 的数据
      case 3:
        return dataList.filter((item) => item.checkStatus === 1);
      default:
        return dataList;
    }
  };

  initFunc() {
    this.setState({ isLoading: true, showFoot: 0, page: 1 }, () => {
      Http('get', `/api/hash/list/mine/${this.state.page}/${10}`, {

      }).then(res => {
        this.setState({ isLoading: false, refreshLoading: false })
        console.log(res.data.list)
        if (res.code === 200) {
          this.setState({ dataList: res.data.list })
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
    Http('get', `/api/hash/list/mine/${page}/${10}`, {

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

  // 渲染头部
  _renderHeader() {
    return (
      <View style={{ backgroundColor: Colors.bai }}>
        {/* <Tab
          value={this.state.tabIndex}
          onChange={(e) => this.setTabIndexFunc(e)}
          indicatorStyle={{ backgroundColor: Colors.subject, height: 3 }}
          dense={false}
          scrollable={false}
          style={{ backgroundColor: 'white' }} // 设置背景色为白色
        >
          {['全部', '审核中', '未通过', '已出证'].map((title, index) => (
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
        </Tab> */}
        <View style={{ borderBottomColor: Colors.huiF5, borderBottomWidth: 1, marginTop: 10 }}></View>
      </View>
    )
  }

  renderListItem(item, index) {
    return (
      <Pressable onPress={() => this.props.navigation.push('WorkEvidence', { id: item.id, name: item.dataName, isid: true })} style={Styles.itemsCont} key={index}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginVertical: 10 }}>
          <View style={{ marginRight: 10 }}>
            <Image 
              style={{ width: Metrics.px2dp(120), height: Metrics.px2dp(120), borderRadius: 4 }} 
              source={item.dataUrl ? 
                { uri: Config.File_PATH + item.dataUrl } : 
                require('../../asserts/images/publish/test_img1.png')
              } 
              resizeMode='cover'
            />
          </View>
          
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: Colors.hei, fontSize: Metrics.fontSize16 }}>存证 {item.dataName}</Text>
              <Text style={{ marginTop: 8, color: Colors.hui66 }}>
                {item.hashId}
              </Text>
              <Text style={{ marginTop: 8, color: Colors.hui66 }}>作者 {item.userInfo.name}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <Text style={Styles.names}>存证时间 {Moment(item.createTime).format('YYYY-MM-DD HH:mm')}</Text>
              {/* <View style={[
                Styles.statusTag, 
                { 
                  backgroundColor: item.checkStatus === 0 ? '#E6F7FF' :
                                  item.checkStatus === 1 ? '#F6FFED' : '#FFF1F0'
                }
              ]}>
                <Text style={[
                  Styles.statusText,
                  {
                    color: item.checkStatus === 0 ? '#1890FF' :
                           item.checkStatus === 1 ? '#52C41A' : '#FF4D4F'
                  }
                ]}>
                  {item.checkStatus === 0 ? '审核中' :
                   item.checkStatus === 1 ? '已通过' : '未通过'}
                </Text>
              </View> */}
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{}} >
          <FlatList
            data={this.filterDataList()}
            ListHeaderComponent={this._renderHeader()}
            refreshing={this.state.refreshLoading}
            onRefresh={() => { this._onRefresh() }}
            renderItem={({ item, index }) => this.renderListItem(item, index)}
            keyExtractor={(item, index) => String(index)}
            ListFooterComponent={this._renderFooter()}
            onEndReached={() => { this._onEndReached() }}
            onEndReachedThreshold={0.3}
            getItemLayout={(data, index) => {
              return { length: 88, offset: 88 * index, index }
            }}
          ></FlatList>
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

export default connect(mapStateToProps, mapDispatchToProps)(MyCrDetail);

const Styles = StyleSheet.create({
  itemsCont: { backgroundColor: Colors.bai, marginBottom: 8, paddingVertical: 15, paddingHorizontal: 10 },
  myColumn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 0 },
  itemRightIcon: { width: 23, height: 23, marginRight: 10 },
  isShowText: { color: Colors.subject },
  zhamshiText: { color: Colors.bai, fontSize: Metrics.fontSize12 },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
  },
});