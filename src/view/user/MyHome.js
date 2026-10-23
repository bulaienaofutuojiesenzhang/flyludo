import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  ScrollView,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';
import ImagePicker from 'react-native-image-crop-picker';

import Config from '../../config/index';
import Http from '../../utils/HttpPost';
import { Loading, ToastService } from '../../component';
import { SC } from '../../theme/social';
import { pickAndUploadImage, uploadAsset } from '../../utils/socialUpload';

let DatePickerComp = null;
try {
  DatePickerComp = require('react-native-date-picker').default;
} catch (e) {
  DatePickerComp = null;
}

const MAX_PHOTOS = 9;
const MAX_TAGS = 6;

const TAG_PRESETS = [
  '温柔', '阳光', '幽默', '高冷', '可爱', '成熟', '文艺', '运动',
  '爱笑', '真诚', '会撩', '治愈', '独立', '慢热', '话痨', '靠谱',
];
const HOBBY_PRESETS = [
  '旅行', '美食', '电影', '音乐', '健身', '游戏', '摄影', '读书',
  '露营', '追剧', '画画', '烘焙', '宠物', '篮球', '咖啡', '逛展',
];

function toUri(v) {
  const s = String(v || '');
  if (!s) {
    return null;
  }
  return /^https?:\/\//i.test(s) ? s : `${String(Config.File_PATH || '').replace(/\/$/, '')}${s.startsWith('/') ? '' : '/'}${s}`;
}

function fmtDate(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function calcAge(birthday) {
  const d = birthday ? new Date(birthday) : null;
  if (!d || Number.isNaN(d.getTime())) {
    return null;
  }
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (
    now.getMonth() < d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())
  ) {
    age -= 1;
  }
  return age;
}

/** 编辑个人资料：头像 / 相册 / 基本信息 / 签名 / 标签 / 爱好 / 微信 */
class MyHome extends Component {
  constructor(props) {
    super(props);
    const u = props.user || {};
    this.state = {
      loading: false,
      name: u.name || '',
      gender: Number(u.gender) || 0,
      birthday: u.birthday || '',
      city: u.city || '',
      height: u.height != null ? String(u.height) : '',
      weight: u.weight != null ? String(u.weight) : '',
      job: u.job || '',
      signStr: u.signStr || u.desc || '',
      tags: Array.isArray(u.tags) ? u.tags : [],
      hobbies: Array.isArray(u.hobbies) ? u.hobbies : [],
      wechatNo: u.wechatNo || '',
      wechatOpen: !!u.wechatOpen,
      photos: Array.isArray(u.photos) ? u.photos : [],
      pickShow: false,
    };
  }

  componentDidMount() {
    StatusBar.setBarStyle('dark-content');
    // 拉最新资料，补齐本地缓存里没有的新字段
    Http('get', '/users/profile').then((res) => {
      if (res?.code === 200 && res.data) {
        this.props.setUserInfo(res.data);
        const u = res.data;
        this.setState({
          name: u.name || '',
          gender: Number(u.gender) || 0,
          birthday: u.birthday || '',
          city: u.city || '',
          height: u.height != null ? String(u.height) : '',
          weight: u.weight != null ? String(u.weight) : '',
          job: u.job || '',
          signStr: u.signStr || u.desc || '',
          tags: u.tags || [],
          hobbies: u.hobbies || [],
          wechatNo: u.wechatNo || '',
          wechatOpen: !!u.wechatOpen,
          photos: u.photos || [],
        });
      }
    });
  }

  /** 立即保存的字段（头像 / 相册）：上传完就落库，避免丢图 */
  saveNow = (obj) =>
    Http('put', '/users/profile', obj).then((res) => {
      if (res?.code === 200) {
        this.props.setUserInfo(res.data ? res.data : obj);
        return true;
      }
      return false;
    });

  changeAvatar = () => {
    ImagePicker.openPicker({
      width: 600,
      height: 600,
      cropping: true,
      compressImageQuality: 0.85,
      mediaType: 'photo',
    })
      .then(async (image) => {
        if (!image) {
          return;
        }
        this.setState({ loading: true });
        const url = await uploadAsset({
          uri: image.path,
          type: image.mime,
          fileName: image.filename || `avatar_${Date.now()}.jpg`,
        });
        if (!url) {
          this.setState({ loading: false });
          ToastService.showToast({ title: '头像上传失败，请重试' });
          return;
        }
        const ok = await this.saveNow({ avatar: url });
        this.setState({ loading: false });
        ToastService.showToast({ title: ok ? '头像已更新' : '保存失败' });
      })
      .catch(() => {});
  };

  addPhotos = async () => {
    const left = MAX_PHOTOS - this.state.photos.length;
    if (left <= 0) {
      return;
    }
    // selectionLimit=1 时返回字符串，统一成数组
    const res = await pickAndUploadImage({ selectionLimit: Math.max(2, left) });
    const urls = [].concat(res || []).slice(0, left);
    if (!urls.length) {
      return;
    }
    const photos = [...this.state.photos, ...urls];
    this.setState({ photos });
    this.saveNow({ photos });
  };

  removePhoto = (i) => {
    Alert.alert('删除照片', '确定删除这张照片吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          const photos = this.state.photos.filter((_, idx) => idx !== i);
          this.setState({ photos });
          this.saveNow({ photos });
        },
      },
    ]);
  };

  toggleChip = (key, val) => {
    const list = this.state[key];
    if (list.includes(val)) {
      this.setState({ [key]: list.filter((x) => x !== val) });
    } else if (list.length >= MAX_TAGS) {
      ToastService.showToast({ title: `最多选 ${MAX_TAGS} 个` });
    } else {
      this.setState({ [key]: [...list, val] });
    }
  };

  save = () => {
    const s = this.state;
    if (!s.name.trim()) {
      ToastService.showToast({ title: '请填写昵称' });
      return;
    }
    this.setState({ loading: true });
    Http('put', '/users/profile', {
      name: s.name.trim(),
      gender: s.gender || undefined,
      birthday: s.birthday,
      city: s.city,
      height: s.height,
      weight: s.weight,
      job: s.job,
      signStr: s.signStr,
      tags: s.tags,
      hobbies: s.hobbies,
      wechatNo: s.wechatNo,
      wechatOpen: s.wechatOpen,
    })
      .then((res) => {
        if (res?.code === 200) {
          if (res.data) {
            this.props.setUserInfo(res.data);
          }
          ToastService.showToast({ title: '已保存' });
          this.props.navigation.goBack();
        }
      })
      .finally(() => this.setState({ loading: false }));
  };

  openBirthday = () => {
    if (!DatePickerComp) {
      ToastService.showToast({ title: '当前版本暂不支持选择生日' });
      return;
    }
    this.setState({ pickShow: true });
  };

  /* —— 小组件 —— */

  renderRow = (label, node, last) => (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>{node}</View>
    </View>
  );

  renderInput = (key, placeholder, extra = {}) => (
    <TextInput
      style={styles.input}
      value={this.state[key]}
      onChangeText={(v) => this.setState({ [key]: v })}
      placeholder={placeholder}
      placeholderTextColor={SC.mute2}
      {...extra}
    />
  );

  renderChips = (key, presets) => (
    <View style={styles.chipWrap}>
      {presets.map((t) => {
        const on = this.state[key].includes(t);
        return (
          <Pressable
            key={t}
            style={[styles.chip, on && styles.chipOn]}
            onPress={() => this.toggleChip(key, t)}
          >
            <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{t}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  renderPhotos = () => {
    const { photos } = this.state;
    return (
      <View style={styles.photoGrid}>
        {photos.map((p, i) => (
          <View key={`${p}_${i}`} style={styles.photoCell}>
            <Image source={{ uri: toUri(p) }} style={styles.photo} />
            {i === 0 && (
              <View style={styles.coverTag}>
                <Text style={styles.coverTxt}>封面</Text>
              </View>
            )}
            <Pressable style={styles.photoDel} onPress={() => this.removePhoto(i)}>
              <Icons name="close" size={11} color="#fff" />
            </Pressable>
          </View>
        ))}
        {photos.length < MAX_PHOTOS && (
          <Pressable style={[styles.photoCell, styles.photoAdd]} onPress={this.addPhotos}>
            <Icons name="plus" size={26} color={SC.roseSoft} />
            <Text style={styles.photoAddTxt}>
              {photos.length}/{MAX_PHOTOS}
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  render() {
    const s = this.state;
    const face = toUri(this.props.user?.avatar || this.props.user?.myFace);
    const age = calcAge(s.birthday);

    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Loading showLoading={s.loading} />

        {!!s.pickShow && !!DatePickerComp && (
          <DatePickerComp
            modal
            open
            mode="date"
            locale="zh-Hans"
            title="选择生日"
            confirmText="确认"
            cancelText="取消"
            maximumDate={new Date()}
            date={s.birthday ? new Date(s.birthday) : new Date(2000, 0, 1)}
            onConfirm={(d) => this.setState({ pickShow: false, birthday: fmtDate(d) })}
            onCancel={() => this.setState({ pickShow: false })}
          />
        )}

        <View style={styles.nav}>
          <Pressable style={styles.navBtn} onPress={() => this.props.navigation.goBack()}>
            <Icons name="left" size={20} color={SC.ink} />
          </Pressable>
          <Text style={styles.navTitle}>编辑资料</Text>
          <Pressable style={styles.navBtn} onPress={this.save}>
            <Text style={styles.save}>保存</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          {/* 头像 */}
          <Pressable style={styles.avatarBox} onPress={this.changeAvatar}>
            {face ? (
              <Image source={{ uri: face }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPh]}>
                <Icons name="user" size={40} color={SC.roseSoft} />
              </View>
            )}
            <View style={styles.camera}>
              <Icons name="camera" size={13} color="#fff" />
            </View>
          </Pressable>
          <Text style={styles.avatarHint}>点击更换头像 · 有真实头像的人更容易被喜欢</Text>

          {/* 相册 */}
          <Text style={styles.sec}>我的照片</Text>
          <View style={styles.card}>{this.renderPhotos()}</View>

          {/* 基本资料 */}
          <Text style={styles.sec}>基本资料</Text>
          <View style={styles.card}>
            {this.renderRow('昵称', this.renderInput('name', '1-12 个字', { maxLength: 12 }))}
            {this.renderRow(
              '性别',
              <View style={styles.seg}>
                {[
                  { v: 1, t: '男' },
                  { v: 2, t: '女' },
                ].map((g) => (
                  <Pressable
                    key={g.v}
                    style={[styles.segItem, s.gender === g.v && styles.segOn]}
                    onPress={() => this.setState({ gender: g.v })}
                  >
                    <Text style={[styles.segTxt, s.gender === g.v && styles.segTxtOn]}>{g.t}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {this.renderRow(
              '生日',
              <Pressable style={styles.pick} onPress={this.openBirthday}>
                <Text style={[styles.pickTxt, !s.birthday && styles.placeholder]}>
                  {s.birthday ? `${s.birthday}${age != null ? ` · ${age}岁` : ''}` : '请选择'}
                </Text>
                <Icons name="right" size={12} color={SC.mute2} />
              </Pressable>
            )}
            {this.renderRow('城市', this.renderInput('city', '如：杭州', { maxLength: 20 }))}
            {this.renderRow(
              '身高',
              this.renderInput('height', 'cm', { keyboardType: 'number-pad', maxLength: 3 })
            )}
            {this.renderRow(
              '体重',
              this.renderInput('weight', 'kg', { keyboardType: 'number-pad', maxLength: 3 })
            )}
            {this.renderRow('职业', this.renderInput('job', '你做什么工作', { maxLength: 20 }), true)}
          </View>

          {/* 签名 */}
          <Text style={styles.sec}>个性签名</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.sign}
              multiline
              maxLength={40}
              value={s.signStr}
              onChangeText={(v) => this.setState({ signStr: v })}
              placeholder="一句话介绍自己，让 TA 更想认识你"
              placeholderTextColor={SC.mute2}
            />
            <Text style={styles.count}>{s.signStr.length}/40</Text>
          </View>

          {/* 标签 */}
          <View style={styles.secRow}>
            <Text style={styles.secInline}>形象标签</Text>
            <Text style={styles.secTip}>
              {s.tags.length}/{MAX_TAGS}
            </Text>
          </View>
          <View style={styles.card}>{this.renderChips('tags', TAG_PRESETS)}</View>

          <View style={styles.secRow}>
            <Text style={styles.secInline}>兴趣爱好</Text>
            <Text style={styles.secTip}>
              {s.hobbies.length}/{MAX_TAGS}
            </Text>
          </View>
          <View style={styles.card}>{this.renderChips('hobbies', HOBBY_PRESETS)}</View>

          {/* 微信 */}
          <Text style={styles.sec}>微信</Text>
          <View style={styles.card}>
            {this.renderRow(
              '微信号',
              this.renderInput('wechatNo', '填写后才会进入微信盲盒', {
                maxLength: 40,
                autoCapitalize: 'none',
              })
            )}
            {this.renderRow(
              '公开微信',
              <Switch
                value={s.wechatOpen}
                onValueChange={(v) => this.setState({ wechatOpen: v })}
                trackColor={{ false: '#ddd', true: SC.roseSoft }}
                thumbColor={s.wechatOpen ? SC.rose : '#fff'}
              />,
              true
            )}
          </View>
          <Text style={styles.note}>
            开启后，别人用钻石抽微信盲盒时可能抽到你；不开启则不会被抽到。
          </Text>

          <Pressable style={styles.saveBtn} onPress={this.save}>
            <Text style={styles.saveBtnTxt}>保存资料</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const CELL = 92;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SC.cream },
  scroll: { paddingBottom: 60 },

  nav: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  navBtn: { minWidth: 52, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 17, fontWeight: '800', color: SC.ink },
  save: { fontSize: 15, fontWeight: '800', color: SC.rose },

  avatarBox: { alignSelf: 'center', marginTop: 8 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: SC.card },
  avatarPh: { alignItems: 'center', justifyContent: 'center' },
  camera: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SC.rose,
    borderWidth: 2,
    borderColor: SC.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: { marginTop: 10, textAlign: 'center', fontSize: 12, color: SC.mute },

  sec: {
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 20,
    fontSize: 15,
    fontWeight: '800',
    color: SC.ink,
  },
  secRow: {
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secInline: { fontSize: 15, fontWeight: '800', color: SC.ink },
  secTip: { fontSize: 12, color: SC.mute2 },

  card: {
    marginHorizontal: 16,
    backgroundColor: SC.soft,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SC.line,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { width: 74, fontSize: 15, color: SC.ink, fontWeight: '600' },
  rowRight: { flex: 1, alignItems: 'flex-end' },
  input: {
    width: '100%',
    paddingVertical: 10,
    textAlign: 'right',
    fontSize: 15,
    color: SC.ink,
  },
  pick: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  pickTxt: { fontSize: 15, color: SC.ink, marginRight: 6 },
  placeholder: { color: SC.mute2 },

  seg: { flexDirection: 'row', backgroundColor: SC.card, borderRadius: 16, padding: 3 },
  segItem: { paddingHorizontal: 18, paddingVertical: 6, borderRadius: 13 },
  segOn: { backgroundColor: SC.rose },
  segTxt: { fontSize: 13, fontWeight: '700', color: SC.mute },
  segTxtOn: { color: '#fff' },

  sign: {
    minHeight: 74,
    paddingTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: SC.ink,
    textAlignVertical: 'top',
  },
  count: { textAlign: 'right', paddingBottom: 10, fontSize: 11, color: SC.mute2 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: SC.card,
    marginRight: 8,
    marginBottom: 8,
  },
  chipOn: { backgroundColor: SC.rose },
  chipTxt: { fontSize: 13, color: SC.inkSoft, fontWeight: '600' },
  chipTxtOn: { color: '#fff' },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 10 },
  photoCell: {
    width: CELL,
    height: CELL,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%', backgroundColor: SC.card },
  photoAdd: {
    backgroundColor: SC.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddTxt: { marginTop: 2, fontSize: 11, color: SC.mute },
  coverTag: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(226,60,254,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderTopRightRadius: 10,
  },
  coverTxt: { fontSize: 10, color: '#fff', fontWeight: '700' },
  photoDel: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(31,18,24,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  note: { marginTop: 8, marginHorizontal: 22, fontSize: 12, lineHeight: 18, color: SC.mute },

  saveBtn: {
    marginTop: 28,
    marginHorizontal: 20,
    height: 48,
    borderRadius: 24,
    backgroundColor: SC.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default connect(
  (s) => ({ user: s.user }),
  (d) => ({ setUserInfo: (payload) => d({ type: 'SET_USERINFO', payload }) })
)(MyHome);
