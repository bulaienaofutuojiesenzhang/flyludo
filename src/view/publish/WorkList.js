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


class WorkList extends React.Component {
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
        return dataList.filter((item) => item.isShow === 0); // isShow 值为 0 的数据
      case 2:
        return dataList.filter((item) => item.checkStatus === 0); // checkStatus 值为 0 的数据
      case 3:
        return dataList.filter((item) => item.isShow === 1); // isShow 值为 1 的数据
      case 4:
          return dataList.filter((item) => item.checkStatus === -1); // checkStatus 值为 0 的数据
      default:
        return dataList;
    }
  };

  initFunc() {
    this.setState({ isLoading: true, showFoot: 0, page: 1 }, () => {
      Http('get', `/api/works/list/mine/${this.state.page}/${10}`, {

      }).then(res => {
        this.setState({ isLoading: false, refreshLoading: false })
        console.log(res.data.list)
        if (res.code === 200) {
          this.setState({ dataList: res.data.list })
        }
      })
    })
  }

  shengqingFunc(id) {
    this.setState({ isLoading: true }, () => {
      Http('post', `/api/works/show/update/${id}`, {
        isShow: 1
      }).then(res => {
        this.setState({ isLoading: false })
        if (res.code === 200) {
          ToastService.showToast({
                          title: '已提交申请！'
                      })
        }
      })
    })
  }

  shengqingCxFunc(id) {
    this.setState({ isLoading: true }, () => {
      Http('post', `/api/works/show/update/${id}`, {
        isShow: 0
      }).then(res => {
        this.setState({ isLoading: false })
        if (res.code === 200) {
          ToastService.showToast({
                          title: '已提交撤销申请！'
                      })
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
    Http('get', `/api/works/list/mine/${page}/${10}`, {

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
        <Tab
          value={this.state.tabIndex}
          onChange={(e) => this.setTabIndexFunc(e)}
          indicatorStyle={{ backgroundColor: Colors.subject, height: 3 }}
          dense={false}
          scrollable={false}
          style={{ backgroundColor: 'white' }} // 设置背景色为白色
        >
          {['全部', '未展示', '审核中', '已展示', '未通过'].map((title, index) => (
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
        <View style={{ borderBottomColor: Colors.huiF5, borderBottomWidth: 1, marginTop: 10 }}></View>
      </View>
    )
  }

  renderListItem(item, index) {
    return (
      <View style={Styles.itemsCont} key={index} >
        <TouchableOpacity onPress={()=> { this.props.navigation.push('WorkDetail', item) }} > 
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
              <Text style={{marginTop: 10}}>作者 {this.props.user.name}</Text>
            </View>
          </View>
        </View>
        <View style={{ borderBottomColor: Colors.huiF5, borderBottomWidth: 1, marginTop: 10 }}></View>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15 }}>
          {item.isShow ?
            <TouchableOpacity onPress={()=>{ this.shengqingCxFunc(item.id) }} >
              <Text style={Styles.timeTit}>撤销展示</Text>
            </TouchableOpacity>
            :
            <TouchableOpacity onPress={()=>{ this.shengqingFunc(item.id) }}  style={item.checkStatus != 1 ?
              { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, backgroundColor: Colors.subject, color: Colors.bai }
              :
              { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, backgroundColor: Colors.huiB6, color: Colors.bai }}>
              <Text style={Styles.zhamshiText}>申请展示</Text>
            </TouchableOpacity>
          }

        </View>
      </View>
    )
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

export default connect(mapStateToProps, mapDispatchToProps)(WorkList);

const Styles = StyleSheet.create({
  itemsCont: { backgroundColor: Colors.bai, marginBottom: 8, paddingVertical: 15, paddingHorizontal: 10 },
  myColumn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  imgUrl: { width: Metrics.px2dpi(300), height: Metrics.px2dpi(300), },
  itemRightIcon: { width: 23, height: 23, marginRight: 10 },
  isShowText: { color: Colors.subject },
  zhamshiText: { color: Colors.bai, fontSize: Metrics.fontSize12 },
});