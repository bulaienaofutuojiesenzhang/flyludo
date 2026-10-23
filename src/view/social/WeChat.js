import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { SC } from '../../theme/social';

class WeChat extends React.Component {
  state = {
    wechatNo: this.props.user?.wechatNo || '',
    wechatOpen: !!this.props.user?.wechatOpen,
    city: this.props.user?.city || '',
    saving: false,
  };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
  }

  save = () => {
    this.setState({ saving: true });
    Http('post', '/social/user/updateSocialProfile', {
      wechatNo: String(this.state.wechatNo || '').trim(),
      wechatOpen: !!this.state.wechatOpen,
      city: String(this.state.city || '').trim(),
    })
      .then((res) => {
        if (res?.code === 200) {
          this.props.setUserInfo({
            wechatNo: this.state.wechatNo,
            wechatOpen: this.state.wechatOpen,
            city: this.state.city,
          });
          Alert.alert('已保存', '扩列微信设置已更新');
          this.props.navigation.goBack();
        }
      })
      .finally(() => this.setState({ saving: false }));
  };

  render() {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => this.props.navigation.goBack()}>
            <Icons name="left" size={22} color={SC.ink} />
          </Pressable>
          <Text style={styles.navTitle}>微信交友</Text>
          <Pressable onPress={this.save}>
            <Text style={styles.save}>{this.state.saving ? '…' : '保存'}</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>微信号</Text>
          <TextInput
            style={styles.input}
            value={this.state.wechatNo}
            onChangeText={(wechatNo) => this.setState({ wechatNo })}
            placeholder="填写真实微信号"
            placeholderTextColor={SC.mute}
            autoCapitalize="none"
          />
          <Text style={styles.label}>城市</Text>
          <TextInput
            style={styles.input}
            value={this.state.city}
            onChangeText={(city) => this.setState({ city })}
            placeholder="如：上海"
            placeholderTextColor={SC.mute}
          />
          <View style={styles.row}>
            <Text style={styles.labelInline}>开启扩列</Text>
            <Switch
              value={this.state.wechatOpen}
              onValueChange={(wechatOpen) => this.setState({ wechatOpen })}
              trackColor={{ true: SC.rose }}
            />
          </View>
          <Text style={styles.tip}>开启后，其他人可通过盲盒抽到你的微信（需消耗钻石）。</Text>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SC.blush },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navTitle: { fontSize: 17, fontWeight: '700', color: SC.ink },
  save: { color: SC.rose, fontWeight: '800' },
  card: { margin: 16, backgroundColor: SC.soft, borderRadius: 18, padding: 16 },
  label: { fontSize: 13, color: SC.mute, marginBottom: 6, marginTop: 8 },
  labelInline: { fontSize: 15, fontWeight: '600', color: SC.ink },
  input: {
    backgroundColor: SC.blush,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: SC.ink,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  tip: { marginTop: 14, fontSize: 12, color: SC.mute, lineHeight: 18 },
});

export default connect(
  (s) => ({ user: s.user }),
  (d) => ({ setUserInfo: (p) => d({ type: 'SET_USERINFO', payload: p }) })
)(WeChat);
