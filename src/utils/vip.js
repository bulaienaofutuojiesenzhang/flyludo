/** 与网站共用：仅看 vipExpireTime 是否未过期 */

const FOREVER_YEAR = 2090;

export function isVipActive(user) {
  if (!user?.vipExpireTime) return false;
  return new Date(user.vipExpireTime).getTime() > Date.now();
}

export function isVipForever(user) {
  if (!user?.vipExpireTime) return false;
  return new Date(user.vipExpireTime).getFullYear() >= FOREVER_YEAR;
}

export function formatVipExpire(user) {
  if (!isVipActive(user)) return '';
  if (isVipForever(user)) return '永久有效';
  const d = new Date(user.vipExpireTime);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day} 到期`;
}

export function getVipBadgeText(user) {
  if (!isVipActive(user)) return '';
  if (isVipForever(user)) return '至尊会员';
  return 'VIP会员';
}
