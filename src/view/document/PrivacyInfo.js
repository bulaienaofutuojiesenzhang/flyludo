import React, { Component } from 'react';
import { StyleSheet, ScrollView, Text, StatusBar } from 'react-native';
import { View } from 'native-base';
import { connect } from 'react-redux';

import { Header } from '../../component';
import { Colors, Metrics } from '../../theme';

class PrivacyInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
  }

  render() {
    const privacyList = [
      {
        title: '网络权限',
        function: '获取app相关数据资源和用户信息',
        scene: '用于用户登录、注册、数据同步、内容加载等网络请求功能',
        canClose: '可关闭',
        closeEffect: '关闭后无法正常使用登录、注册、内容浏览等所列功能'
      },
      {
        title: '设备信息权限',
        function: '获取设备标识、系统版本等信息',
        scene: '用于设备识别、统计分析、安全风控',
        canClose: '可关闭',
        closeEffect: '关闭后可能影响应用稳定性和安全性'
      },
      {
        title: '存储权限',
        function: '读写手机存储',
        scene: '用于保存用户头像、图片、缓存文件等',
        canClose: '可关闭',
        closeEffect: '关闭后无法上传图片、保存文件等功能'
      },
      {
        title: '相机权限',
        function: '访问摄像头',
        scene: '用于拍照上传头像、发布动态等',
        canClose: '可关闭',
        closeEffect: '关闭后无法使用拍照相关功能'
      },
      {
        title: '相册权限',
        function: '访问手机相册',
        scene: '用于选择图片上传头像、发布动态等',
        canClose: '可关闭',
        closeEffect: '关闭后无法从相册选择图片'
      },
      {
        title: '位置权限',
        function: '获取地理位置信息',
        scene: '用于同城交友、附近的人等功能',
        canClose: '可关闭',
        closeEffect: '关闭后无法使用定位相关功能'
      }
    ];

    return (
      <View style={{ flex: 1, backgroundColor: Colors.bai }}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Header 
          title="个人信息收集清单" 
          isTabBar={false}
          onLeftPress={() => this.props.navigation.goBack()}
        />
        
        <ScrollView style={Styles.container}>
          <View style={Styles.headerSection}>
            <Text style={Styles.headerTitle}>个人信息收集清单</Text>
            <Text style={Styles.headerDesc}>
              为了向您提供更好的服务，我们会收集以下信息。我们承诺严格遵守相关法律法规，保护您的个人信息安全。
            </Text>
            <Text style={Styles.updateTime}>更新时间：2025年11月03日</Text>
          </View>

          {privacyList.map((item, index) => (
            <View key={index} style={Styles.itemCard}>
              <View style={Styles.itemHeader}>
                <View style={Styles.itemNumber}>
                  <Text style={Styles.itemNumberText}>{index + 1}</Text>
                </View>
                <Text style={Styles.itemTitle}>{item.title}</Text>
              </View>

              <View style={Styles.itemRow}>
                <Text style={Styles.itemLabel}>业务功能：</Text>
                <Text style={Styles.itemValue}>{item.function}</Text>
              </View>

              <View style={Styles.itemRow}>
                <Text style={Styles.itemLabel}>场景说明：</Text>
                <Text style={Styles.itemValue}>{item.scene}</Text>
              </View>

              <View style={Styles.itemRow}>
                <Text style={Styles.itemLabel}>是否可关闭：</Text>
                <Text style={[Styles.itemValue, Styles.canCloseText]}>{item.canClose}</Text>
              </View>

              <View style={Styles.itemRow}>
                <Text style={Styles.itemLabel}>关闭影响：</Text>
                <Text style={Styles.itemValue}>{item.closeEffect}</Text>
              </View>
            </View>
          ))}

          <View style={Styles.footerSection}>
            <Text style={Styles.footerText}>
              以上是我们收集的个人信息清单，我们会采取严格的安全措施保护您的信息。如您对个人信息保护有任何疑问，可通过反馈与建议联系我们。
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

export default connect(mapStateToProps, mapDispatchToProps)(PrivacyInfo);

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
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.huiF0,
  },
  itemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.subject,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemNumberText: {
    fontSize: Metrics.fontSize14,
    fontWeight: 'bold',
    color: Colors.bai,
  },
  itemTitle: {
    fontSize: Metrics.fontSize16,
    fontWeight: 'bold',
    color: Colors.hei2E,
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  itemLabel: {
    fontSize: Metrics.fontSize14,
    color: Colors.hui66,
    fontWeight: '500',
    width: 90,
    flexShrink: 0,
  },
  itemValue: {
    fontSize: Metrics.fontSize14,
    color: Colors.hei2E,
    flex: 1,
    lineHeight: 22,
  },
  canCloseText: {
    color: Colors.subject,
    fontWeight: '500',
  },
  footerSection: {
    backgroundColor: Colors.bai,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  footerText: {
    fontSize: Metrics.fontSize13,
    color: Colors.hui66,
    lineHeight: 22,
    textAlign: 'center',
  },
});

