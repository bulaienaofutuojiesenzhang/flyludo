/** 同城有约 · 夜色玫瑰酒会（深墨紫粉系） */
export const SC = {
  ink: '#1F1218', // 深墨：主文案 / 暗部
  inkSoft: '#4A3340', // 墨紫：次级标题
  rose: '#E23CFE', // 玫瑰：主行动色
  roseDeep: '#B018D4',
  roseSoft: '#F7A8FF',
  blush: '#FFF0F6', // 雾面粉：亮部
  blushDeep: '#FFE0EE',
  cream: '#F2DAE7', // 页面氛围底：深雾粉（非死白）
  creamDeep: '#EBCBDD', // 氛围渐变深处
  soft: '#FFFFFF', // 卡片
  mute: 'rgba(31,18,24,0.52)',
  mute2: 'rgba(31,18,24,0.32)',
  card: '#FBE9F4', // 浅玫瑰底（图标底等）
  line: 'rgba(31,18,24,0.07)', // 浅分割线
  gold: '#C19769', // 金色点缀
  goldDeep: '#8A5A2B',
  goldSoft: '#F7EBD8', // 淡金底（会员卡）
  success: '#07C160',
  danger: '#FA5151',
  chatMe: '#95EC69',
  chatOther: '#FFFFFF',
  chatBg: '#EDEDED',
  chatBar: '#F7F7F7',
  shadow: 'rgba(93,29,74,0.13)',
};

/** 柔和投影：大圆角白卡浮在氛围底上 */
export const socialShadow = {
  shadowColor: SC.shadow,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 1,
  shadowRadius: 24,
  elevation: 7,
};

/** 轻投影：小入口卡 / 插画卡 */
export const socialShadowLite = {
  shadowColor: SC.shadow,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 1,
  shadowRadius: 14,
  elevation: 4,
};

export const socialPage = {
  safe: { flex: 1, backgroundColor: SC.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  headMeta: { flex: 1 },
  brand: { fontSize: 25, fontWeight: '800', color: SC.ink, letterSpacing: 0.5 },
  title: { fontSize: 25, fontWeight: '800', color: SC.ink },
  sub: { marginTop: 4, fontSize: 13, color: SC.mute, lineHeight: 18 },
  /** 顶部右侧操作位：40 圆角白底图标钮 */
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: SC.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { fontSize: 17, fontWeight: '700', color: SC.ink, marginBottom: 12 },
  cta: {
    backgroundColor: SC.rose,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  ctaTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  ghost: {
    backgroundColor: SC.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  ghostTxt: { color: SC.roseDeep, fontWeight: '700', fontSize: 13 },
};
