import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';
import { Colors } from '../../theme';
import Icon from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { Metrics } from '../../theme';

const OrderTypeCard = ({ title, items }) => {
  const navigation = useNavigation();
  
  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardHeader}
        onPress={() => navigation.navigate('MyOrderList', { type: title })}
      >
        <Text style={styles.cardTitle}>{title}</Text>
        <Icon name="right" size={20} color={Colors.hui99} />
      </TouchableOpacity>

      <View style={styles.cardContent}>
        {items.map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.statusItem}
            onPress={() => navigation.navigate('MyOrderList', { 
              type: title,
              status: item.text 
            })}
          >
            {item.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
            <Image source={item.icon} style={styles.statusIcon} />
            <Text style={styles.statusText}>{item.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const MyOrderOv = () => {
  const blockchainOrders = {
    title: '区块链存证订单',
    items: [
      {
        icon: require('../../asserts/images/user/icon_order_nopay.png'),
        text: '待支付',
        status: 'unpaid',
        badge: 0
      },
      {
        icon: require('../../asserts/images/user/icon_order_pay.png'),
        text: '已付款',
        status: 'paid',
        badge: 0
      },
      {
        icon: require('../../asserts/images/user/icon_order_doing.png'),
        text: '退款中',
        status: 'refunding',
        badge: 0
      },
      {
        icon: require('../../asserts/images/user/icon_order_rsuc.png'),
        text: '已退款',
        status: 'refunded',
        badge: 0
      },
      {
        icon: require('../../asserts/images/user/icon_order_cancel.png'),
        text: '已取消',
        status: 'cancelled',
        badge: 0
      }
    ]
  };

  const registrationOrders = {
    title: '版权登记订单',
    items: [
      {
        icon: require('../../asserts/images/user/icon_order_nopay.png'),
        text: '待支付',
        status: 'unpaid',
        badge: 0
      },
      {
        icon: require('../../asserts/images/user/icon_order_pay.png'),
        text: '已付款',
        status: 'paid',
        badge: 0
      },
    //   {
    //     icon: require('../../asserts/images/user/icon_order_doing.png'),
    //     text: '退款中',
    //     status: 'refunding',
    //     badge: 0
    //   },
    //   {
    //     icon: require('../../asserts/images/user/icon_order_rsuc.png'),
    //     text: '已退款',
    //     status: 'refunded',
    //     badge: 0
    //   },
    //   {
    //     icon: require('../../asserts/images/user/icon_order_cancel.png'),
    //     text: '已取消',
    //     status: 'cancelled',
    //     badge: 0
    //   }
    ]
  };

  const blockchainPackageOrders = {
    title: '区块链存证套餐订单',
    items: [
      {
        icon: require('../../asserts/images/user/icon_order_nopay.png'),
        text: '待支付',
        status: 'unpaid',
        badge: 0
      },
      {
        icon: require('../../asserts/images/user/icon_order_pay.png'),
        text: '已付款',
        status: 'paid',
        badge: 0
      },
      {
        icon: require('../../asserts/images/user/icon_order_cancel.png'),
        text: '已取消',
        status: 'cancelled',
        badge: 0
      }
    ]
  };

  const registrationPackageOrders = {
    title: '登记套餐订单',
    items: [
      {
        icon: require('../../asserts/images/user/icon_order_nopay.png'),
        text: '待支付',
        status: 'unpaid',
        badge: 0
      },
      {
        icon: require('../../asserts/images/user/icon_order_pay.png'),
        text: '已付款',
        status: 'paid',
        badge: 0
      },
      {
        icon: require('../../asserts/images/user/icon_order_cancel.png'),
        text: '已取消',
        status: 'cancelled',
        badge: 0
      }
    ]
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        style={styles.userBackImg} 
        source={require('../../asserts/images/user/icon_mine_bg.png')} 
        resizeMode='stretch'
      >
        <Image 
          style={styles.inviteIcon} 
          source={require('../../asserts/images/publish/icon_order_hint.png')} 
          resizeMode='contain' 
        />
      </ImageBackground>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.cardContainer}>
          {/* <OrderTypeCard {...blockchainOrders} /> */}
          <OrderTypeCard {...registrationOrders} />
          {/* <OrderTypeCard {...blockchainPackageOrders} />
          <OrderTypeCard {...registrationPackageOrders} /> */}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.huiF5,
  },
  userBackImg: { 
    height: Metrics.px2dp(360),
    width: '100%',
  },
  inviteIcon: {
    width: Metrics.px2dp(686),
    height: Metrics.px2dp(160),
    marginTop: Metrics.px2dp(100),
    alignSelf: 'center',
  },
  scrollContent: {
    flex: 1,
    marginTop: 20,
  },
  cardContainer: {
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: Colors.bai,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.huiF5,
  },
  cardTitle: {
    fontSize: 16,
    color: Colors.hei,
    fontWeight: '500',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
  statusItem: {
    alignItems: 'center',
    position: 'relative',
  },
  statusIcon: {
    width: 28,
    height: 28,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: Colors.hui66,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: Colors.bai,
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 6,
  },
});

export default MyOrderOv; 