import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import Http from '../../utils/HttpPost';
import { pickAndUploadImage } from '../../utils/socialUpload';
import { SC } from '../../theme/social';
import { ToastService } from '../../component';

class UpManghe extends React.Component {
  state = { title: '', describe: '', price: '', busy: false, photoList: [], vipOnly: false };

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
  }

  addImage = async () => {
    if (this.state.photoList.length >= 6) {
      ToastService.warn('最多 6 张图');
      return;
    }
    const url = await pickAndUploadImage({ selectionLimit: 1 });
    if (url) this.setState((s) => ({ photoList: [...s.photoList, url] }));
  };

  removeImage = (idx) => {
    this.setState((s) => ({
      photoList: s.photoList.filter((_, i) => i !== idx),
    }));
  };

  submit = () => {
    const title = String(this.state.title || '').trim();
    const price = Number(this.state.price) || 0;
    if (!title || price <= 0) {
      ToastService.warn('请填写标题和价格');
      return;
    }
    this.setState({ busy: true });
    Http('post', '/social/manghe/upBaobei', {
      title,
      describe: this.state.describe,
      price,
      type: 'gift',
      vipOnly: this.state.vipOnly,
      photoList: this.state.photoList,
    })
      .then((res) => {
        if (res?.code === 200) {
          ToastService.success('上架成功');
          this.props.navigation.goBack();
        } else {
          ToastService.warn(res?.message || '上架失败');
        }
      })
      .finally(() => this.setState({ busy: false }));
  };

  render() {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => this.props.navigation.goBack()}>
            <Icons name="left" size={22} color={SC.ink} />
          </Pressable>
          <Text style={styles.navTitle}>上架盲盒</Text>
          <Pressable onPress={this.submit}>
            <Text style={styles.save}>{this.state.busy ? '…' : '发布'}</Text>
          </Pressable>
        </View>
        <ScrollView>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="标题"
              placeholderTextColor={SC.mute}
              value={this.state.title}
              onChangeText={(title) => this.setState({ title })}
            />
            <TextInput
              style={[styles.input, { minHeight: 90 }]}
              placeholder="描述"
              placeholderTextColor={SC.mute}
              multiline
              value={this.state.describe}
              onChangeText={(describe) => this.setState({ describe })}
            />
            <TextInput
              style={styles.input}
              placeholder="价格（钻石）"
              placeholderTextColor={SC.mute}
              keyboardType="number-pad"
              value={this.state.price}
              onChangeText={(price) => this.setState({ price })}
            />
            <Text style={styles.label}>谁能看</Text>
            <View style={styles.seg}>
              {[
                { v: false, t: '公开', d: '所有人可见' },
                { v: true, t: 'VIP 专享', d: '仅 VIP 可看可买' },
              ].map((o) => {
                const on = this.state.vipOnly === o.v;
                return (
                  <Pressable
                    key={o.t}
                    style={[styles.segItem, on && styles.segOn]}
                    onPress={() => this.setState({ vipOnly: o.v })}
                  >
                    <Text style={[styles.segTxt, on && styles.segTxtOn]}>{o.t}</Text>
                    <Text style={[styles.segDesc, on && styles.segTxtOn]}>{o.d}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.label}>商品图片</Text>
            <View style={styles.imgs}>
              {this.state.photoList.map((uri, idx) => (
                <Pressable key={`${uri}_${idx}`} onLongPress={() => this.removeImage(idx)}>
                  <Image source={{ uri }} style={styles.thumb} />
                </Pressable>
              ))}
              {this.state.photoList.length < 6 && (
                <Pressable style={styles.add} onPress={this.addImage}>
                  <Icons name="plus" size={28} color={SC.rose} />
                </Pressable>
              )}
            </View>
            <Text style={styles.tip}>长按图片可删除</Text>
          </View>
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
  save: { color: SC.rose, fontWeight: '800' },
  card: { margin: 16, backgroundColor: SC.soft, borderRadius: 18, padding: 14 },
  input: {
    backgroundColor: SC.blush,
    borderRadius: 12,
    padding: 12,
    color: SC.ink,
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  label: { fontSize: 13, color: SC.mute, marginBottom: 8 },
  seg: { flexDirection: 'row', marginBottom: 14 },
  segItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: SC.blush,
    marginRight: 8,
  },
  segOn: { backgroundColor: SC.rose },
  segTxt: { fontSize: 14, fontWeight: '800', color: SC.ink },
  segDesc: { marginTop: 2, fontSize: 11, color: SC.mute },
  segTxtOn: { color: '#fff' },
  imgs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumb: { width: 88, height: 88, borderRadius: 12, backgroundColor: SC.card },
  add: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: SC.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tip: { marginTop: 8, color: SC.mute, fontSize: 12 },
});

export default connect((s) => ({ user: s.user }))(UpManghe);
