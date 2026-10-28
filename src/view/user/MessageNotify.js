/**
 * 消息通知设置：铃声 / 震动开关 + 测试提醒
 */
import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { View, Text, Switch, Toast } from 'native-base';
import { connect } from 'react-redux';

import { Colors } from '../../theme';
import { testMessageNotify, ensureChatNotifyChannel } from '../../utils/msgNotify';
import { setChatNotifyPrefs } from '../../utils/chatBootstrap';

class MessageNotify extends Component {
  constructor(props) {
    super(props);
    const g = props.global || {};
    this.state = {
      lingshengOn: g.lingsheng !== false,
      zhendongOn: g.zhendong !== false,
    };
  }

  componentDidMount() {
    ensureChatNotifyChannel();
  }

  syncPrefs = (lingshengOn, zhendongOn) => {
    setChatNotifyPrefs({ playSound: lingshengOn, vibrate: zhendongOn });
  };

  setLingshengFunc = (val) => {
    this.setState({ lingshengOn: val });
    this.props.setGlobalInfo({ lingsheng: val });
    this.syncPrefs(val, this.state.zhendongOn);
  };

  setZhendongFunc = (val) => {
    this.setState({ zhendongOn: val });
    this.props.setGlobalInfo({ zhendong: val });
    this.syncPrefs(this.state.lingshengOn, val);
  };

  testNotifyFunc = () => {
    const { lingshengOn, zhendongOn } = this.state;
    if (!lingshengOn && !zhendongOn) {
      Toast.show({ title: '请先打开铃声或震动', placement: 'top' });
      return;
    }
    testMessageNotify({ playSound: lingshengOn, vibrate: zhendongOn });
    Toast.show({
      title: lingshengOn ? '已发送测试通知' : '已触发测试震动',
      placement: 'top',
    });
  };

  render() {
    const { lingshengOn, zhendongOn } = this.state;
    return (
      <View style={{ flex: 1, backgroundColor: '#F5F5F7' }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={Styles.sectionHead}>
            <Text style={Styles.sectionTitle}>提醒开关</Text>
          </View>
          <View style={Styles.blockBack}>
            <View style={Styles.cardStyle}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={Styles.labelTxt}>铃声 / 系统通知</Text>
                <Text style={Styles.hintTxt}>收到新消息时播放提示音并弹出通知</Text>
              </View>
              <Switch size="md" isChecked={lingshengOn} onToggle={this.setLingshengFunc} />
            </View>
            <View style={[Styles.cardStyle, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={Styles.labelTxt}>震动</Text>
                <Text style={Styles.hintTxt}>收到新消息时震动提醒</Text>
              </View>
              <Switch size="md" isChecked={zhendongOn} onToggle={this.setZhendongFunc} />
            </View>
          </View>

          <TouchableOpacity style={Styles.testBtn} activeOpacity={0.85} onPress={this.testNotifyFunc}>
            <Text style={Styles.testBtnTxt}>测试提醒</Text>
          </TouchableOpacity>
          <Text style={Styles.tip}>
            若收不到通知，请到系统设置中允许「同城有约」发送通知。
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  global: state.global,
});

const mapDispatchToProps = (dispatch) => ({
  setGlobalInfo: (globalInfo) => dispatch({ type: 'SET_GLOBALINFO', payload: globalInfo }),
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageNotify);

const Styles = StyleSheet.create({
  sectionHead: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  blockBack: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardStyle: {
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#EFEFF4',
  },
  labelTxt: { color: '#222', fontSize: 15, fontWeight: '600' },
  hintTxt: { color: '#999', fontSize: 12, marginTop: 4 },
  testBtn: {
    marginTop: 24,
    marginHorizontal: 40,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.subject || '#E23CFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '600' },
  tip: {
    marginTop: 14,
    marginHorizontal: 24,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
