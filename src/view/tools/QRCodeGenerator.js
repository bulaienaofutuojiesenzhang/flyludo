import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  View as RNView,
  Share,
} from 'react-native';
import { View } from 'native-base';
import Icons from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../../theme';

const ACCENT = '#5B9A8B';
const ACCENT_SOFT = 'rgba(91, 154, 139, 0.12)';

const QUICK_TYPES = [
  { key: 'url', label: '网址', icon: 'link-outline', tint: '#5B9A8B' },
  { key: 'phone', label: '电话', icon: 'call-outline', tint: '#6A8CAF' },
  { key: 'email', label: '邮箱', icon: 'mail-outline', tint: '#C97BA5' },
  { key: 'wifi', label: 'WiFi', icon: 'wifi-outline', tint: '#C19769' },
];

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

  generateQRCode = () => {
    if (!this.state.inputText.trim()) {
      alert('请输入内容');
      return;
    }
    this.setState({ qrText: this.state.inputText.trim() });
  };

  clearQRCode = () => {
    this.setState({
      inputText: '',
      qrText: '',
    });
  };

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

  renderSectionHead = (icon, title) => (
    <RNView style={styles.sectionHead}>
      <RNView style={styles.sectionIcon}>
        <Ionicons name={icon} size={16} color={ACCENT} />
      </RNView>
      <Text style={styles.sectionTitle}>{title}</Text>
    </RNView>
  );

  render() {
    const { inputText, qrText, qrSize } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => this.props.navigation.goBack()}
          >
            <Icons name="left" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>二维码生成</Text>
          {qrText ? (
            <TouchableOpacity style={styles.shareBtn} onPress={this.shareQRCode}>
              <Ionicons name="share-outline" size={22} color="#666" />
            </TouchableOpacity>
          ) : (
            <RNView style={{ width: 40 }} />
          )}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.inputSection}>
              {this.renderSectionHead('create-outline', '输入内容')}
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={(text) => this.setState({ inputText: text })}
                placeholder="输入文字、网址、电话等..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />

              <View style={styles.quickSection}>
                <Text style={styles.quickLabel}>快速填充</Text>
                <View style={styles.quickButtons}>
                  {QUICK_TYPES.map((item) => (
                    <TouchableOpacity
                      key={item.key}
                      style={styles.quickBtn}
                      onPress={() => this.quickFill(item.key)}
                      activeOpacity={0.75}
                    >
                      <RNView style={[styles.quickIconWrap, { backgroundColor: `${item.tint}18` }]}>
                        <Ionicons name={item.icon} size={18} color={item.tint} />
                      </RNView>
                      <Text style={styles.quickBtnText}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.generateBtn]}
                onPress={this.generateQRCode}
                activeOpacity={0.85}
              >
                <Ionicons name="qr-code-outline" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>生成二维码</Text>
              </TouchableOpacity>

              {!!qrText && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.clearBtn]}
                  onPress={this.clearQRCode}
                  activeOpacity={0.85}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>清空</Text>
                </TouchableOpacity>
              )}
            </View>

            {!!qrText && (
              <View style={styles.qrSection}>
                {this.renderSectionHead('scan-outline', '二维码预览')}
                <View style={styles.qrContainer}>
                  <QRCode
                    value={qrText}
                    size={qrSize}
                    color="#1A1A1A"
                    backgroundColor="#fff"
                    getRef={(ref) => (this.qrCodeRef = ref)}
                  />
                </View>

                <View style={styles.qrContentSection}>
                  <Text style={styles.qrContentLabel}>内容</Text>
                  <Text style={styles.qrContentText} numberOfLines={3}>
                    {qrText}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.tipSection}>
              {this.renderSectionHead('information-circle-outline', '使用提示')}
              <Text style={styles.tipText}>支持文本、网址、电话、邮箱等多种格式</Text>
              <Text style={styles.tipText}>WiFi：WIFI:T:类型;S:名称;P:密码;;</Text>
              <Text style={styles.tipText}>电话：tel:手机号</Text>
              <Text style={styles.tipText}>邮箱：mailto:邮箱地址</Text>
              <Text style={styles.tipText}>生成后可点右上角分享内容</Text>
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
    backgroundColor: '#F7F8F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.bai,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EAEAEA',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2A2A2A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  inputSection: {
    backgroundColor: Colors.bai,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: ACCENT_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A2A2A',
  },
  textInput: {
    backgroundColor: '#F7F8F6',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E4E6E3',
  },
  quickSection: {
    marginTop: 14,
  },
  quickLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickBtn: {
    width: '23%',
    alignItems: 'center',
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickBtnText: {
    fontSize: 12,
    color: '#444',
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
  },
  generateBtn: {
    backgroundColor: ACCENT,
    marginRight: 10,
  },
  clearBtn: {
    backgroundColor: '#D97878',
    flex: 0.55,
  },
  actionBtnText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.bai,
  },
  qrSection: {
    backgroundColor: Colors.bai,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    alignItems: 'stretch',
  },
  qrContainer: {
    alignSelf: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ECECEC',
  },
  qrContentSection: {
    width: '100%',
    backgroundColor: '#F7F8F6',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  qrContentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
  },
  qrContentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  tipSection: {
    backgroundColor: Colors.bai,
    borderRadius: 14,
    padding: 16,
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
    paddingLeft: 36,
  },
});

export default QRCodeGenerator;
