import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Colors, Metrics } from '../../theme';
import { Tab } from '@rneui/themed';
import Http from '../../utils/HttpPost';
import moment from 'moment';
import { PaymentModal } from '../../component';

class MyOrderList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshing: false,
      orderList: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      tabIndex: 0
    };
    this.paymentModalRef = React.createRef();
  }

  componentDidMount() {
    const { status } = this.props.route.params || {};
    console.log('status:', status)
    let initialTabIndex = 0;
    
    switch(status) {
      case '待支付':
        initialTabIndex = 1;
        break;
      case '已付款':
        initialTabIndex = 2;
        break;
      default:
        initialTabIndex = 0; // '全部'
    }

    this.setState({ tabIndex: initialTabIndex }, () => {
      this.loadOrders(true);
    });
  }

  setTabIndexFunc = (index) => {
    this.setState({
      tabIndex: index,
      page: 1,
      orderList: []
    }, () => {
      this.loadOrders(true);
    });
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
          style={{ backgroundColor: 'white' }}
        >
          {['全部', '待支付', '已付款'].map((title, index) => (
            <Tab.Item
              key={index}
              title={title}
              titleStyle={{
                color: this.state.tabIndex === index ? 'black' : 'gray',
                fontSize: Metrics.fontSize14,
              }}
              buttonStyle={{
                backgroundColor: Colors.bai,
                paddingHorizontal: 0,
              }}
            />
          ))}
        </Tab>
        <View style={{ borderBottomColor: Colors.huiF5, borderBottomWidth: 1, marginTop: 10 }}></View>
      </View>
    )
  }

  // 渲染底部
  _renderFooter() {
    if (!this.state.hasMore) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>没有更多数据了</Text>
        </View>
      );
    }
    if (this.state.isLoading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={Colors.subject} />
          <Text style={styles.footerText}>加载中...</Text>
        </View>
      );
    }
    return null;
  }

  loadOrders = async (isRefresh = false) => {
    const { page, pageSize, tabIndex } = this.state;

    try {
      this.setState({ isLoading: true });
      
      let status;
      switch(tabIndex) {
        case 1:
          status = 0; // 待支付
          break;
        case 2:
          status = 1; // 已付款
          break;
        default:
          status = undefined; // 全部
      }

      const res = await Http('get', `/api/pay/list/mine/${page}/${pageSize}`, {
        status: status
      });

      if (res.code === 200) {
        const newList = res.data.list || [];
        this.setState({
          orderList: isRefresh ? newList : [...this.state.orderList, ...newList],
          hasMore: newList.length === pageSize,
          page: isRefresh ? 1 : page + 1
        });
      }
    } catch (error) {
      console.error('加载订单列表失败:', error);
    } finally {
      this.setState({ 
        isLoading: false,
        refreshing: false 
      });
    }
  };

  handleRefresh = () => {
    this.setState({
      refreshing: true,
      page: 1
    }, () => {
      this.loadOrders(true);
    });
  };

  handleLoadMore = () => {
    if (this.state.hasMore && !this.state.isLoading) {
      this.loadOrders();
    }
  };

  handlePay (item) {
    const paymentModal = this.paymentModalRef.current;
    paymentModal.show({
      amount: Number(item.money.$numberDecimal),
      orderId: item._id,
      payData: item.payData,
      way: item.way,
      dataId: item.dataId,
      type: item.type,
      onPaymentComplete: (method, success) => {
        if (success) {
          this.handleRefresh();
        }
      }
    });
  };

  renderItem = ({ item }) => {
    const { content, createTime, money, status, way, dataContent } = item;
    
    return (
      <View style={styles.orderItem}>
        <View style={styles.basicInfo}>
          <Text style={styles.orderTitle1}>{content}</Text>
          <Text style={styles.orderTitle}>作品：{dataContent}</Text>
          <Text style={styles.orderTime}>
            {moment(createTime).format('YYYY-MM-DD HH:mm:ss')}
          </Text>
        </View>

        <View style={styles.payInfo}>
          <View style={styles.payMethod}>
            <Image 
              source={way === 'wx' ? 
                require('../../asserts/images/publica/icon_pay_wx.png') :
                require('../../asserts/images/publica/icon_pay_ali.png')
              } 
              style={styles.payIcon}
            />
            <Text style={styles.payText}>
              {way === 'wx' ? '微信支付' : '支付宝支付'}
            </Text>
          </View>
          <Text style={styles.priceText}>
            ¥{parseFloat(money.$numberDecimal).toFixed(2)}
          </Text>
        </View>

        <View style={styles.orderFooter}>
          <Text style={[
            styles.statusText,
            status === 0 ? styles.statusUnpaid :
            status === 1 ? styles.statusPaid :
            styles.statusCancelled
          ]}>
            {status === 0 ? '待支付' :
             status === 1 ? '已付款' :
             '已取消'}
          </Text>
          {status === 0 && (
            <TouchableOpacity 
              style={styles.payButton}
              onPress={() => this.handlePay(item)}
            >
              <Text style={styles.payButtonText}>立即支付</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        {this._renderHeader()}
        <FlatList
          style={styles.listContainer}
          data={this.state.orderList}
          renderItem={this.renderItem}
          keyExtractor={item => item._id}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
            />
          }
          onEndReached={this.handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={this._renderFooter.bind(this)}
        />
        <PaymentModal ref={this.paymentModalRef} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.huiF5,
  },
  listContainer: {
    flex: 1,
  },
  orderItem: {
    backgroundColor: Colors.bai,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
    padding: 15,
  },
  basicInfo: {
    paddingBottom: 12,
  },
  orderTitle1: {
    fontSize: 15,
    color: Colors.hei,
    fontWeight: '500',
  },
  orderTitle: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.hei,
  },
  orderTime: {
    fontSize: 13,
    color: Colors.hui99,
    marginTop: 8,
  },
  payInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.huiCc,
  },
  payMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  payText: {
    fontSize: 14,
    color: Colors.hui66,
  },
  priceText: {
    fontSize: 16,
    color: Colors.red,
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusUnpaid: {
    color: Colors.red,
  },
  statusPaid: {
    color: Colors.green,
  },
  statusCancelled: {
    color: Colors.hui99,
  },
  payButton: {
    backgroundColor: Colors.subject,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 15,
  },
  payButtonText: {
    color: Colors.bai,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  footerText: {
    fontSize: 14,
    color: Colors.hui99,
    marginLeft: 5,
  },
});

export default MyOrderList;