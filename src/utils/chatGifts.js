/**
 * 聊天礼物目录（对齐 z7box）
 * 价格单位：钻石（yuanbao）
 * 图片：src/asserts/images/gift/
 */

export const CHAT_GIFTS = [
  { id: 'xiaoxinxin', name: '小心心', price: 1, icon: require('../asserts/images/gift/xiaoxinxin.png') },
  { id: 'meiguihua', name: '玫瑰花', price: 10, icon: require('../asserts/images/gift/meiguihua.png') },
  { id: 'xianhua', name: '鲜花', price: 20, icon: require('../asserts/images/gift/xianhua.png') },
  { id: 'yishuhua', name: '一束花', price: 30, icon: require('../asserts/images/gift/yishuhua.png') },
  { id: 'zhenxinaini', name: '真心爱你', price: 50, icon: require('../asserts/images/gift/zhenxinaini.png') },
  { id: 'qinwen', name: '亲吻', price: 60, icon: require('../asserts/images/gift/qinwen.png') },
  { id: 'qiahuoguo', name: '恰火锅', price: 70, icon: require('../asserts/images/gift/qiahuoguo.png') },
  { id: 'huahuan', name: '花环', price: 80, icon: require('../asserts/images/gift/huahuan.png') },
  { id: 'gaogenxie', name: '高跟鞋', price: 90, icon: require('../asserts/images/gift/gaogenxie.png') },
  { id: 'ainiyou', name: '爱你呦', price: 100, icon: require('../asserts/images/gift/ainiyou.png') },
  { id: 'jiezhi', name: '戒指', price: 200, icon: require('../asserts/images/gift/jiezhi.png') },
  { id: 'paoche', name: '跑车', price: 300, icon: require('../asserts/images/gift/paoche.png') },
  { id: 'feiji', name: '飞机', price: 400, icon: require('../asserts/images/gift/feiji.png') },
  { id: 'youlun', name: '游轮', price: 500, icon: require('../asserts/images/gift/youlun.png') },
  { id: 'huojian', name: '火箭', price: 600, icon: require('../asserts/images/gift/huojian.png') },
  { id: 'xiangyue', name: '相约', price: 700, icon: require('../asserts/images/gift/xiangyue.png') },
  { id: 'zhuguangwancan', name: '烛光晚餐', price: 800, icon: require('../asserts/images/gift/zhuguangwancan.png') },
];

export function findChatGift(giftId) {
  return CHAT_GIFTS.find((g) => g.id === String(giftId)) || null;
}

/** 按 giftId / giftElem 解析本地图标 */
export function getGiftIcon(giftOrId) {
  if (!giftOrId) return null;
  if (typeof giftOrId === 'object') {
    if (giftOrId.icon) return giftOrId.icon;
    const found = findChatGift(giftOrId.giftId || giftOrId.id);
    return found?.icon || null;
  }
  return findChatGift(giftOrId)?.icon || null;
}

export function parseGiftContent(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    const obj = JSON.parse(String(raw));
    if (obj && (obj.giftId || obj.name || obj.id)) return obj;
  } catch (_) {}
  return null;
}
