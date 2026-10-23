import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { SC } from '../../theme/social';

class Qiqiu extends React.Component {
  state = { text: '', picked: null, anonymous: false, busy: false };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
  }

  pick = () => {
    this.setState({ busy: true });
    Http('post', '/social/manghe/getZhitiao', { num: 1 })
      .then((res) => {
        if (res?.code === 200) {
          const item = (res.data?.list || [])[0] || null;
          this.setState({ picked: item });
        }
      })
      .finally(() => this.setState({ busy: false }));
  };

  insert = () => {
    const data = String(this.state.text || '').trim();
    if (!data) return;
    this.setState({ busy: true });
    Http('post', '/social/manghe/insertZhitiao', {
      data,
      isAnonymous: this.state.anonymous,
      nickName: this.props.user.name || '',
      myFace: this.props.user.avatar || '',
      city: this.props.user.city || '',
      sex: this.props.user.gender,
    })
      .then((res) => {
        if (res?.code === 200) {
          Alert.alert('已放入', '你的真心已飞向天空');
          this.setState({ text: '' });
        }
      })
      .finally(() => this.setState({ busy: false }));
  };

  render() {
    const p = this.state.picked;
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => this.props.navigation.goBack()}>
            <Icons name="left" size={22} color={SC.ink} />
          </Pressable>
          <Text style={styles.navTitle}>真心气球</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.label}>抽一张纸条</Text>
            {p ? (
              <>
                <Text style={styles.pickTxt}>{p.data}</Text>
                <Text style={styles.meta}>
                  {p.isAnonymous ? '匿名' : p.nickName || '有缘人'}
                  {p.city ? ` · ${p.city}` : ''}
                </Text>
                {!p.isAnonymous && p.userId ? (
                  <Pressable
                    style={styles.hi}
                    onPress={() =>
                      this.props.navigation.navigate('Chats', {
                        partnerId: String(p.userId),
                        nickName: p.nickName,
                        faceUrl: p.myFace,
                      })
                    }
                  >
                    <Text style={styles.hiTxt}>聊聊</Text>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <Text style={styles.hint}>点下方按钮，接住一颗真心</Text>
            )}
            <Pressable style={styles.cta} onPress={this.pick} disabled={this.state.busy}>
              <Text style={styles.ctaTxt}>{this.state.busy ? '…' : '抽纸条'}</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>塞一张纸条</Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="写下你想对陌生人说的话…"
              placeholderTextColor={SC.mute}
              value={this.state.text}
              onChangeText={(text) => this.setState({ text })}
            />
            <View style={styles.row}>
              <Text style={styles.anon}>匿名</Text>
              <Switch
                value={this.state.anonymous}
                onValueChange={(anonymous) => this.setState({ anonymous })}
                trackColor={{ true: SC.rose }}
              />
            </View>
            <Pressable style={styles.cta} onPress={this.insert} disabled={this.state.busy}>
              <Text style={styles.ctaTxt}>放飞</Text>
            </Pressable>
          </View>
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
  body: { padding: 16 },
  card: { backgroundColor: SC.soft, borderRadius: 22, padding: 18, marginBottom: 14 },
  label: { fontSize: 16, fontWeight: '700', color: SC.ink, marginBottom: 10 },
  hint: { color: SC.mute, marginBottom: 12 },
  pickTxt: { fontSize: 16, color: SC.ink, lineHeight: 24, marginBottom: 8 },
  meta: { fontSize: 12, color: SC.mute, marginBottom: 10 },
  hi: {
    alignSelf: 'flex-start',
    backgroundColor: SC.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 10,
  },
  hiTxt: { color: SC.rose, fontWeight: '700' },
  input: {
    minHeight: 100,
    backgroundColor: SC.blush,
    borderRadius: 14,
    padding: 12,
    color: SC.ink,
    textAlignVertical: 'top',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  anon: { color: SC.ink, fontWeight: '600' },
  cta: {
    marginTop: 14,
    backgroundColor: SC.rose,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaTxt: { color: '#fff', fontWeight: '700' },
});

export default connect((s) => ({ user: s.user }))(Qiqiu);
