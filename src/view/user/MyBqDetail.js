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


class MyBqDetail extends React.Component {
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
        return dataList.filter((item) => item.checkStatus === 2); // checkStatus 值为 0 的数据
      case 3:
        return dataList.filter((item) => item.checkStatus === 1);
      default:
        return dataList;
    }
  };

  initFunc() {
    this.setState({ isLoading: true, showFoot: 0, page: 1 }, () => {
      Http('get', `/api/dict/list/mine/${this.state.page}/${10}`, {

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
    Http('get', `/api/dict/list/mine/${page}/${10}`, {

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
        </Tab>
        <View style={{ borderBottomColor: Colors.huiF5, borderBottomWidth: 1, marginTop: 10 }}></View>
      </View>
    )
  }

  renderListItem(item, index) {
    // 获取状态标签的样式
    const getStatusStyle = (checkStatus, payStatus) => {
      if (payStatus === 0) {
        return {
          container: {
            backgroundColor: '#FFF7E6',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
          },
          text: {
            color: '#FFA940',
            fontSize: 12,
          }
        };
      }
      
      switch(checkStatus) {
        case 0:
          return {
            container: {
              backgroundColor: '#E6F7FF',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
            },
            text: {
              color: '#1890FF',
              fontSize: 12,
            }
          };
        case 1:
          return {
            container: {
              backgroundColor: '#F6FFED',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
            },
            text: {
              color: '#52C41A',
              fontSize: 12,
            }
          };
        case -1:
          return {
            container: {
              backgroundColor: '#FFF1F0',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
            },
            text: {
              color: '#FF4D4F',
              fontSize: 12,
            }
          };
        default:
          return null;
      }
    };

    const getStatusText = (checkStatus, payStatus) => {
      if (payStatus === 0) return '待支付';
      if (payStatus === 2) return '已退款';
      
      switch(checkStatus) {
        case 0:
          return '审核中';
        case 1:
          return '已通过';
        case -1:
          return '未通过';
        default:
          return '';
      }
    };

    const statusStyle = getStatusStyle(item.checkStatus, item.payStatus);

    return (
      <TouchableOpacity 
        onPress={() => { this.props.navigation.push('MyBqDdetail', item) }}  
        style={Styles.itemsCont} 
        key={index}
      >
        <View style={Styles.cardContainer}>
          {/* 左侧图片 */}
          <View style={Styles.imageContainer}>
            <FastImage 
              style={Styles.workImage}
              source={item.dataUrl ? 
                { uri: Config.File_PATH + item.dataUrl } : 
                require('../../asserts/images/publish/icon_add.png')
              }
              resizeMode="cover"
            />
          </View>

          {/* 右侧内容 */}
          <View style={Styles.contentContainer}>
            {/* 标题和状态 */}
            <View style={Styles.titleRow}>
              <Text style={Styles.titleText} numberOfLines={1}>
                {item.dataName}
              </Text>
              {statusStyle && (
                <View style={statusStyle.container}>
                  <Text style={statusStyle.text}>
                    {getStatusText(item.checkStatus, item.payStatus)}
                  </Text>
                </View>
              )}
            </View>

            {/* 描述 */}
            <Text style={Styles.descText} numberOfLines={2}>
              {item.intro}
            </Text>

            {/* 底部信息 */}
            <View style={Styles.bottomInfo}>
              <View style={Styles.userInfo}>
                <FastImage 
                  style={Styles.avatar}
                  source={ this.props.user.avatar ? { uri: Config.File_PATH + this.props.user.avatar } : 
                    require('../../asserts/images/user/plc_user.png')
                  }
                />
                <Text style={Styles.userName}>{item.userInfo.name}</Text>
              </View>
              <Text style={Styles.timeText}>
                {Moment(item.createTime).format('MM-DD HH:mm')}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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

export default connect(mapStateToProps, mapDispatchToProps)(MyBqDetail);

const Styles = StyleSheet.create({
  itemsCont: { 
    backgroundColor: Colors.bai, 
    marginBottom: 8, 
    padding: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContainer: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 12,
  },
  workImage: {
    width: Metrics.px2dp(200),
    height: Metrics.px2dp(200),
    borderRadius: 8,
    backgroundColor: Colors.huiF5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.hei,
    flex: 1,
    marginRight: 8,
  },
  descText: {
    fontSize: 14,
    color: Colors.hui66,
    lineHeight: 20,
    marginBottom: 12,
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  userName: {
    fontSize: 12,
    color: Colors.hui66,
  },
  timeText: {
    fontSize: 12,
    color: Colors.huiCc,
  },
  // ... 保留其他样式
});