import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Text, TouchableOpacity, ScrollView, TextInput, View as RNView, Share } from 'react-native';
import { View } from 'native-base';
import Icons from 'react-native-vector-icons/AntDesign';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../../theme';

class QRCodeGenerator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: '',
      qrText: '',
      qrSize: 200,
    };
    this.qrCodeRef = null;
  }

  // 生成二维码
  generateQRCode = () => {
    if (!this.state.inputText.trim()) {
      alert('请输入内容');
      return;
    }
    this.setState({ qrText: this.state.inputText.trim() });
  };

  // 清空
  clearQRCode = () => {
    this.setState({
      inputText: '',
      qrText: '',
    });
  };

  // 分享二维码
  shareQRCode = () => {
    if (!this.state.qrText) {
      alert('请先生成二维码');
      return;
    }
    Share.share({
      message: this.state.qrText,
      title: '二维码内容',
    });
  };

  // 快速填充示例
  quickFill = (type) => {
    let text = '';
    switch (type) {
      case 'url':
        text = 'https://www.example.com';
        break;
      case 'wifi':
        text = 'WIFI:T:WPA;S:WiFi名称;P:WiFi密码;;';
        break;
      case 'phone':
        text = 'tel:13800138000';
        break;
      case 'email':
        text = 'mailto:example@email.com';
        break;
    }
    this.setState({ inputText: text });
  };

  render() {
    const { inputText, qrText, qrSize } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* 顶部导航 */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => this.props.navigation.goBack()}
          >
            <Icons name="left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>二维码生成</Text>
          {qrText && (
            <TouchableOpacity 
              style={styles.shareBtn} 
              onPress={this.shareQRCode}
            >
              <Icons name="sharealt" size={20} color="#666" />
            </TouchableOpacity>
          )}
          {!qrText && <RNView style={{ width: 40 }} />}
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* 输入区域 */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>📝 输入内容</Text>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={(text) => this.setState({ inputText: text })}
                placeholder="输入文字、网址、电话等..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />
              
              {/* 快速填充按钮 */}
              <View style={styles.quickSection}>
                <Text style={styles.quickLabel}>快速填充：</Text>
                <View style={styles.quickButtons}>
                  <TouchableOpacity
                    style={styles.quickBtn}
                    onPress={() => this.quickFill('url')}
                  >
                    <Text style={styles.quickBtnText}>🌐 网址</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickBtn}
                    onPress={() => this.quickFill('phone')}
                  >
                    <Text style={styles.quickBtnText}>📞 电话</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickBtn}
                    onPress={() => this.quickFill('email')}
                  >
                    <Text style={styles.quickBtnText}>✉️ 邮箱</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickBtn}
                    onPress={() => this.quickFill('wifi')}
                  >
                    <Text style={styles.quickBtnText}>📶 WiFi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 生成按钮 */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.generateBtn]}
                onPress={this.generateQRCode}
              >
                <Icons name="qrcode" size={20} color={Colors.bai} />
                <Text style={styles.actionBtnText}>生成二维码</Text>
              </TouchableOpacity>
              
              {qrText && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.clearBtn]}
                  onPress={this.clearQRCode}
                >
                  <Icons name="delete" size={20} color={Colors.bai} />
                  <Text style={styles.actionBtnText}>清空</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 二维码显示区域 */}
            {qrText && (
              <View style={styles.qrSection}>
                <Text style={styles.sectionTitle}>✨ 二维码预览</Text>
                <View style={styles.qrContainer}>
                  <QRCode
                    value={qrText}
                    size={qrSize}
                    color="#000"
                    backgroundColor="#fff"
                    getRef={(ref) => (this.qrCodeRef = ref)}
                  />
                </View>
                
                {/* 二维码内容显示 */}
                <View style={styles.qrContentSection}>
                  <Text style={styles.qrContentLabel}>内容：</Text>
                  <Text style={styles.qrContentText} numberOfLines={3}>
                    {qrText}
                  </Text>
                </View>
              </View>
            )}

            {/* 提示信息 */}
            <View style={styles.tipSection}>
              <Text style={styles.tipTitle}>💡 使用提示</Text>
              <Text style={styles.tipText}>• 支持文本、网址、电话、邮箱等多种格式</Text>
              <Text style={styles.tipText}>• WiFi格式: WIFI:T:类型;S:名称;P:密码;;</Text>
              <Text style={styles.tipText}>• 电话格式: tel:手机号</Text>
              <Text style={styles.tipText}>• 邮箱格式: mailto:邮箱地址</Text>
              <Text style={styles.tipText}>• 点击分享按钮可分享二维码内容</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: Colors.bai,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 5,
  },
  shareBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  inputSection: {
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickSection: {
    marginTop: 15,
  },
  quickLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickBtn: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  quickBtnText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateBtn: {
    backgroundColor: '#4CAF50',
  },
  clearBtn: {
    backgroundColor: '#FF6B6B',
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.bai,
  },
  qrSection: {
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  qrContentSection: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  qrContentLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  qrContentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  tipSection: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 13,
    color: '#1976D2',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default QRCodeGenerator;

