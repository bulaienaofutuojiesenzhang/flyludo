import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, StatusBar, FlatList, Image, Text, TextInput, Pressable, ImageBackground, Platform } from 'react-native';
import { View, } from 'native-base';
import { Tab, TabView } from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import DatePicker from 'react-native-date-picker';
import Moment from 'moment';
import { isIPhoneXFooter } from "../../utils/iphoneXHelper";

import { Header, Loading, ToastService } from '../../component';
import Config from '../../config/index';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import ParamsValidate from '../../utils/ValueValidate';
import { PaymentModal } from '../../component'; 


class MyBqDdetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      price: 48.00,
      "dataId": "",
      "dataName": "",
      "nature": "1",
      "finishDate": "",
      "introprocess": "",
      "finishAddress": "",
      "publishStatus": "",
      "publishDate": "",
      "publishAddress": "",
      "signType": "",
      "signName": "",
      "powerBelongType": "",
      "powerBelongFileUrl": "",
      "powerReceiveType": "",
      "powerOwnType": "",
      "proveFileUrl": "",
      "dictImgUrl": "",
      timeType: '',
    }
    this.paymentModalRef = React.createRef();
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    console.log('MyBqDdetail', this.props.route.params)
    const { params } = this.props.route;
    if (params) {
      this.setState((prevState) => ({
        ...prevState,  // 保留原 state 的其他数据
        ...params,     // 使用 params 中的字段来覆盖 state
      }));
    }

  }
  renderField(label, value) {
    return (
      <View style={Styles.fieldContainer}>
        <Text style={Styles.label}>{label}:</Text>
        <Text style={Styles.value}>{value || '无'}</Text>
      </View>
    );
  }

  getNatureDescription(nature) {
    const natureMap = {
      '1': '原创',
      '2': '改编',
      '3': '翻译',
      '4': '汇编',
      '5': '注释',
      '6': '整理',
      '7': '其他',
    };
    return natureMap[nature] || '未知';
  }

  getQuanligs(nature) {
    const natureMap = {
      '1': '个人作品',
      '2': '合作作品',
      '3': '法人作品',
      '4': '职务作品',
      '5': '委托作品',
    };
    return natureMap[nature] || '未知';
  }

  getQuanlihuodefs(nature) {
    const natureMap = {
      '1': '原始',
      '2': '继承',
      '3': '承受',
      '4': '其他',
    };
    return natureMap[nature] || '未知';
  }

  handlePay = async () => {
    const paymentModal = this.paymentModalRef.current;
    if (paymentModal) {
      paymentModal.show({
        amount: this.state.price,  // 直接使用 state 中的 price
        dataId: this.state.id, // 使用 state 中的 dataId
        type: 'dict',     // 支付类型
        onPaymentComplete: (method, success) => {
          if (success) {
            // 支付成功后刷新数据
            this.initFunc();
          }
        }
      });
    }
  };

  render() {
    const {
      dataName,
      intro,
      dataUrl,
      checkStatus,
      payStatus,
      createTime,
      dictImgUrl
    } = this.state || {};

    // 获取状态标签的样式
    const getStatusStyle = () => {
      if (payStatus === 0) {
        return {
          container: {
            backgroundColor: '#FFF7E6',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 4,
          },
          text: {
            color: '#FFA940',
            fontSize: 14,
          }
        };
      }
      
      switch(checkStatus) {
        case 0:
          return {
            container: {
              backgroundColor: '#E6F7FF',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 4,
            },
            text: {
              color: '#1890FF',
              fontSize: 14,
            }
          };
        case 1:
          return {
            container: {
              backgroundColor: '#F6FFED',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 4,
            },
            text: {
              color: '#52C41A',
              fontSize: 14,
            }
          };
        case -1:
          return {
            container: {
              backgroundColor: '#FFF1F0',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 4,
            },
            text: {
              color: '#FF4D4F',
              fontSize: 14,
            }
          };
        default:
          return null;
      }
    };

    // 获取状态文字
    const getStatusText = () => {
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

    const statusStyle = getStatusStyle();
    const statusText = getStatusText();

    return (
      <>
        <ScrollView style={Styles.container}>
          <View style={{ flex: 1 }}>
            <View style={[
              Styles.content, 
              { paddingBottom: payStatus === 0 ? 80 : 16 }  // 动态设置 paddingBottom
            ]}>
              <View style={Styles.mainContainer}>
                {/* 头部状态区域 */}
                <View style={Styles.headerSection}>
                  <View style={Styles.titleContainer}>
                    <Text style={Styles.titleText}>{dataName}</Text>
                    <View style={Styles.statusWrapper}>
                      {statusStyle && (
                        <View style={statusStyle.container}>
                          <Text style={statusStyle.text}>{statusText}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={Styles.timeText}>
                    申请时间：{Moment(createTime).format('YYYY-MM-DD HH:mm')}
                  </Text>
                </View>

                {/* 作品说明 */}
                <View style={Styles.section}>
                  <Text style={Styles.sectionTitle}>登记说明</Text>
                  <View style={Styles.descContainer}>
                    <Text style={Styles.descText}>{intro}</Text>
                  </View>
                </View>

                {/* 作品图片 */}
                <View style={Styles.section}>
                  <Text style={Styles.sectionTitle}>作品主图</Text>
                  {dataUrl && (
                    <Image 
                      style={Styles.workImage} 
                      source={{ uri: Config.File_PATH + dataUrl }}
                      resizeMode="contain"
                    />
                  )}
                </View>

                {/* 版权证书 */}
                {checkStatus === 1 && dictImgUrl && (
                  <View style={Styles.section}>
                    <Text style={Styles.sectionTitle}>版权证书</Text>
                    <Image 
                      style={Styles.workImage} 
                      source={{ uri: Config.File_PATH + dictImgUrl }}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>


              {(checkStatus === 0 && payStatus === 1) && (
              <View style={Styles.checkStatusContainer}>
                <View style={Styles.statusBox}>
                  <Image 
                    source={require('../../asserts/images/publish/icon_mine_unlogon.png')} 
                    style={Styles.statusIcon}
                  />
                  <View style={Styles.statusTextContainer}>
                    <Text style={Styles.statusTitle}>审核中</Text>
                    <Text style={Styles.statusDesc}>
                      审核成功后将颁发登记证书，请耐心等待
                    </Text>
                  </View>
                </View>
              </View>
            )}
            </View>

            
          </View>

          {/* 底部支付按钮 */}
          {payStatus === 0 && (
            <View style={Styles.bottomContainer}>
              <View style={Styles.priceContainer}>
                <Text style={Styles.priceLabel}>支付金额</Text>
                <Text style={Styles.priceValue}>¥{this.state.price}</Text>
              </View>
              <TouchableOpacity 
                style={Styles.payButton}
                onPress={this.handlePay}
              >
                <Text style={Styles.payButtonText}>立即支付</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <PaymentModal ref={this.paymentModalRef} />
      </>
    );
  }

}


const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(MyBqDdetail);

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    marginTop: 20,
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#d89c6a',
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: Metrics.fontSize16,
  },
  cardText: {
    fontSize: Metrics.fontSize16,
    marginTop: 10
  },

  inputContainer: {
    flexDirection: 'row', // 水平布局
    alignItems: 'center', // 垂直居中
  },
  unitText: {
    fontSize: 16,
    marginLeft: 10, // 在单位和输入框之间添加间距
    color: '#333',
  },
  upImg: { width: Metrics.px2dpi(600), height: Metrics.px2dpi(600), borderRadius: 5 },
  inputText: { height: 52, lineHeight: 52, paddingHorizontal: 10, fontSize: Metrics.fontSize16 },
  inputTextH: { textAlignVertical: 'top', height: 110, lineHeight: 52, paddingHorizontal: 10, fontSize: Metrics.fontSize16 },
  inputTextMe: { flex: 1, height: 52, lineHeight: 52, paddingHorizontal: 10, fontSize: Metrics.fontSize16 },
  yhXieyiText: { fontSize: Metrics.fontSize14, color: Colors.subject, marginLeft: 5 },
  xieyiCont: { marginTop: 18, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start' },
  yhXieyiClikCont: { fontSize: Metrics.fontSize15, color: Colors.subject, textAlign: 'center', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  xieyiIconSele: { fontSize: 20, color: Colors.hui99, marginBottom: 2, width: 16, height: Metrics.px2dpi(54) },

  fieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 5
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  value: {
    color: '#333',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  headerSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.huiF5,
    paddingBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.hei,
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    color: Colors.hui66,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.hei,
    marginBottom: 12,
  },
  descContainer: {
    backgroundColor: Colors.huiF5,
    padding: 12,
    borderRadius: 8,
  },
  descText: {
    fontSize: 14,
    color: Colors.hui66,
    lineHeight: 20,
  },
  workImage: {
    width: '100%',
    height: Metrics.px2dp(600),
    borderRadius: 8,
    backgroundColor: Colors.huiF5,
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bai,
    paddingHorizontal: 16,
    paddingVertical: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.huiF5,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.hui66,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.hei,
  },
  payButton: {
    backgroundColor: Colors.subject,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
    marginLeft: 16,
  },
  payButtonText: {
    color: Colors.bai,
    fontSize: 16,
    fontWeight: '500',
  },
  checkStatusContainer: {
    backgroundColor: Colors.bai,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6FFED',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B7EB8F',
  },
  statusIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#52C41A',
    marginBottom: 4,
  },
  statusDesc: {
    fontSize: 14,
    color: Colors.hui66,
    lineHeight: 20,
  },
});