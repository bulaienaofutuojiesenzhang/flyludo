import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  StatusBar,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { pickAndUploadImage } from '../../utils/socialUpload';
import { SC } from '../../theme/social';

class PublishSay extends React.Component {
  state = { text: '', posting: false, imgList: [] };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
  }

  addImage = async () => {
    if (this.state.imgList.length >= 9) {
      Alert.alert('最多 9 张图');
      return;
    }
    const url = await pickAndUploadImage({ selectionLimit: 1 });
    if (url) this.setState((s) => ({ imgList: [...s.imgList, url] }));
  };

  removeImage = (idx) => {
    this.setState((s) => ({
      imgList: s.imgList.filter((_, i) => i !== idx),
    }));
  };

  submit = () => {
    const data = String(this.state.text || '').trim();
    if ((!data && !this.state.imgList.length) || this.state.posting) return;
    this.setState({ posting: true });
    Http('post', '/social/say/publishSay', {
      data: data || '[图片]',
      imgList: this.state.imgList,
      nickName: this.props.user.name || '',
      myFace: this.props.user.avatar || this.props.user.myFace || '',
      city: this.props.user.city || '',
      sex: this.props.user.gender,
    })
      .then((res) => {
        if (res?.code === 200) {
          this.props.navigation.goBack();
        } else {
          Alert.alert('发布失败', res?.message || '请稍后重试');
        }
      })
      .finally(() => this.setState({ posting: false }));
  };

  render() {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => this.props.navigation.goBack()}>
            <Icons name="close" size={22} color={SC.ink} />
          </Pressable>
          <Text style={styles.navTitle}>发动态</Text>
          <Pressable onPress={this.submit} disabled={this.state.posting}>
            <Text style={styles.publish}>{this.state.posting ? '…' : '发布'}</Text>
          </Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled">
          <TextInput
            style={styles.input}
            multiline
            placeholder="分享此刻心情…"
            placeholderTextColor={SC.mute}
            value={this.state.text}
            onChangeText={(text) => this.setState({ text })}
            maxLength={500}
          />
          <View style={styles.imgs}>
            {this.state.imgList.map((uri, idx) => (
              <Pressable key={`${uri}_${idx}`} onLongPress={() => this.removeImage(idx)}>
                <Image source={{ uri }} style={styles.thumb} />
              </Pressable>
            ))}
            {this.state.imgList.length < 9 && (
              <Pressable style={styles.add} onPress={this.addImage}>
                <Icons name="plus" size={28} color={SC.rose} />
              </Pressable>
            )}
          </View>
          <Text style={styles.tip}>长按图片可删除</Text>
        </ScrollView>
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
  publish: { color: SC.rose, fontWeight: '800', fontSize: 16 },
  input: {
    margin: 16,
    minHeight: 140,
    backgroundColor: SC.soft,
    borderRadius: 18,
    padding: 16,
    fontSize: 16,
    color: SC.ink,
    textAlignVertical: 'top',
  },
  imgs: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  thumb: { width: 96, height: 96, borderRadius: 12, backgroundColor: SC.card },
  add: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: SC.soft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: SC.line,
    borderStyle: 'dashed',
  },
  tip: { marginHorizontal: 16, marginTop: 8, color: SC.mute, fontSize: 12 },
});

export default connect((s) => ({ user: s.user }))(PublishSay);
