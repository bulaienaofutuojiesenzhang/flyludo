import React, { Component } from 'react';
import { StyleSheet, ScrollView, Text, StatusBar } from 'react-native';
import { View } from 'native-base';
import { connect } from 'react-redux';
import Icons from 'react-native-vector-icons/AntDesign';

import { Header } from '../../component';
import { Colors, Metrics } from '../../theme';

class ThirdPartySDK extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
  }

  render() {
    const sdkList = [
      {
        name: '穿山甲广告平台',
        company: '北京巨量引擎网络技术有限公司',
        purpose: '广告展示与推广',
        dataCollected: [
          '设备标识（如IMEI、Android ID、OAID）',
          '设备型号、操作系统版本',
          '网络类型、运营商信息',
          'IP地址',
          '应用列表信息',
          '广告点击、展示数据'
        ],
        privacyPolicy: 'https://www.csjplatform.com/privacy',
        scene: '在应用内展示广告内容，帮助我们获得运营收入以维持应用免费使用',
        canClose: '不可完全关闭',
        closeEffect: '该SDK用于支持应用的广告业务，无法单独关闭'
      },
      {
        name: '支付宝SDK',
        company: '支付宝（中国）网络技术有限公司',
        purpose: '在线支付功能',
        dataCollected: [
          '设备标识（如IMEI、Android ID）',
          '设备型号、操作系统版本',
          '网络环境信息',
          '支付相关订单信息',
          '应用包名'
        ],
        privacyPolicy: 'https://opendocs.alipay.com/open/01g6qm',
        scene: '用于VIP会员购买、虚拟商品购买等支付场景',
        canClose: '可关闭',
        closeEffect: '关闭后无法使用支付宝支付功能，但不影响其他功能使用'
      }
    ];

    return (
      <View style={{ flex: 1, backgroundColor: Colors.bai }}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Header 
          title="第三方SDK使用说明" 
          isTabBar={false}
          onLeftPress={() => this.props.navigation.goBack()}
        />
        
        <ScrollView style={Styles.container}>
          <View style={Styles.headerSection}>
            <Text style={Styles.headerTitle}>第三方SDK使用说明</Text>
            <Text style={Styles.headerDesc}>
              为了向您提供更完善的服务，我们的应用中集成了以下第三方SDK。这些SDK可能会收集您的部分信息，我们会要求第三方严格遵守相关法律法规，保护您的个人信息安全。
            </Text>
            <Text style={Styles.updateTime}>更新时间：2025年11月03日</Text>
          </View>

          {sdkList.map((item, index) => (
            <View key={index} style={Styles.sdkCard}>
              <View style={Styles.sdkHeader}>
                <View style={Styles.sdkIcon}>
                  <Icons name="API" size={24} color={Colors.bai} />
                </View>
                <View style={Styles.sdkHeaderText}>
                  <Text style={Styles.sdkName}>{item.name}</Text>
                  <Text style={Styles.sdkCompany}>{item.company}</Text>
                </View>
              </View>

              <View style={Styles.sdkSection}>
                <Text style={Styles.sectionTitle}>使用目的</Text>
                <Text style={Styles.sectionContent}>{item.purpose}</Text>
              </View>

              <View style={Styles.sdkSection}>
                <Text style={Styles.sectionTitle}>场景说明</Text>
                <Text style={Styles.sectionContent}>{item.scene}</Text>
              </View>

              <View style={Styles.sdkSection}>
                <Text style={Styles.sectionTitle}>收集的信息</Text>
                {item.dataCollected.map((data, idx) => (
                  <View key={idx} style={Styles.dataItem}>
                    <View style={Styles.dataDot} />
                    <Text style={Styles.dataText}>{data}</Text>
                  </View>
                ))}
              </View>

              <View style={Styles.sdkSection}>
                <Text style={Styles.sectionTitle}>是否可关闭</Text>
                <Text style={[
                  Styles.sectionContent, 
                  item.canClose === '可关闭' ? Styles.canCloseText : Styles.cannotCloseText
                ]}>
                  {item.canClose}
                </Text>
              </View>

              <View style={Styles.sdkSection}>
                <Text style={Styles.sectionTitle}>关闭影响</Text>
                <Text style={Styles.sectionContent}>{item.closeEffect}</Text>
              </View>

              <View style={Styles.privacyPolicySection}>
                <Icons name="link" size={14} color={Colors.subject} />
                <Text style={Styles.privacyPolicyLabel}>隐私政策：</Text>
                <Text 
                  style={Styles.privacyPolicyLink}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {item.privacyPolicy}
                </Text>
              </View>
            </View>
          ))}

          <View style={Styles.footerSection}>
            <View style={Styles.noticeBox}>
              <Icons name="exclamationcircleo" size={16} color={Colors.subject} />
              <Text style={Styles.noticeText}>
                温馨提示：我们会持续监督第三方SDK的信息收集行为，确保其符合相关法律法规。如您发现任何异常，请及时通过反馈与建议联系我们。
              </Text>
            </View>

            <Text style={Styles.footerDesc}>
              以上是我们使用的第三方SDK清单及说明。我们会定期审查和更新SDK使用情况，并及时在此页面公示。
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  isLogged: state.user.isLogged,
  token: state.user.token,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ThirdPartySDK);

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.huiF5,
  },
  headerSection: {
    backgroundColor: Colors.bai,
    padding: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: Metrics.fontSize20,
    fontWeight: 'bold',
    color: Colors.hei2E,
    marginBottom: 10,
  },
  headerDesc: {
    fontSize: Metrics.fontSize14,
    color: Colors.hui66,
    lineHeight: 22,
    marginBottom: 10,
  },
  updateTime: {
    fontSize: Metrics.fontSize12,
    color: Colors.hui99,
  },
  sdkCard: {
    backgroundColor: Colors.bai,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sdkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.huiF0,
  },
  sdkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.subject,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sdkHeaderText: {
    flex: 1,
  },
  sdkName: {
    fontSize: Metrics.fontSize16,
    fontWeight: 'bold',
    color: Colors.hei2E,
    marginBottom: 4,
  },
  sdkCompany: {
    fontSize: Metrics.fontSize12,
    color: Colors.hui99,
  },
  sdkSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: Metrics.fontSize13,
    color: Colors.hui66,
    fontWeight: '500',
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: Metrics.fontSize14,
    color: Colors.hei2E,
    lineHeight: 22,
  },
  canCloseText: {
    color: Colors.subject,
    fontWeight: '500',
  },
  cannotCloseText: {
    color: Colors.hui99,
    fontWeight: '500',
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingLeft: 5,
  },
  dataDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.subject,
    marginTop: 8,
    marginRight: 8,
  },
  dataText: {
    fontSize: Metrics.fontSize13,
    color: Colors.hei2E,
    flex: 1,
    lineHeight: 20,
  },
  privacyPolicySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.huiF0,
  },
  privacyPolicyLabel: {
    fontSize: Metrics.fontSize12,
    color: Colors.hui66,
    marginLeft: 4,
  },
  privacyPolicyLink: {
    fontSize: Metrics.fontSize12,
    color: Colors.subject,
    flex: 1,
    marginLeft: 4,
  },
  footerSection: {
    padding: 15,
    marginBottom: 20,
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  noticeText: {
    fontSize: Metrics.fontSize13,
    color: '#F57C00',
    lineHeight: 20,
    flex: 1,
    marginLeft: 8,
  },
  footerDesc: {
    fontSize: Metrics.fontSize13,
    color: Colors.hui66,
    lineHeight: 22,
    textAlign: 'center',
  },
});

