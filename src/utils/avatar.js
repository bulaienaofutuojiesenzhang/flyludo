/**
 * 默认头像：无头像时按性别展示
 * gender: 1 男 / 2 女（其它或未填按女）
 */
import Config from '../config/index';

const AVATAR_MALE = require('../asserts/images/user/avatar_male.jpg');
const AVATAR_FEMALE = require('../asserts/images/user/avatar_female.jpg');

export function isMaleGender(gender) {
  return Number(gender) === 1;
}

export function defaultAvatarSource(gender) {
  return isMaleGender(gender) ? AVATAR_MALE : AVATAR_FEMALE;
}

/** 原始地址转可加载 http(s)；空则返回 null */
export function normalizeAvatarUri(raw) {
  const a = raw == null ? '' : String(raw).trim();
  if (!a) return null;
  if (/^https?:\/\//i.test(a)) return a;
  if (a.startsWith('file://') || a.startsWith('content://')) return a;
  const base = String(Config.File_PATH || '').replace(/\/$/, '');
  return base + (a.startsWith('/') ? a : '/' + a);
}

/**
 * 给 Image / FastImage / CachedImage 用的 source
 * @param {string|object} faceOrUser 头像 URL，或含 avatar/myFace/faceUrl + gender/sex 的对象
 * @param {number} [gender] 单独传性别时优先
 */
export function getAvatarSource(faceOrUser, gender) {
  let face = faceOrUser;
  let g = gender;
  if (faceOrUser && typeof faceOrUser === 'object' && !Array.isArray(faceOrUser)) {
    face = faceOrUser.avatar || faceOrUser.myFace || faceOrUser.faceUrl || faceOrUser.face;
    if (g == null) g = faceOrUser.gender ?? faceOrUser.sex;
  }
  const uri = normalizeAvatarUri(face);
  if (uri) return { uri };
  return defaultAvatarSource(g);
}

export default {
  isMaleGender,
  defaultAvatarSource,
  normalizeAvatarUri,
  getAvatarSource,
  AVATAR_MALE,
  AVATAR_FEMALE,
};
