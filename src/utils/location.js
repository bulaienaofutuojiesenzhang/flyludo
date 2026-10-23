/**
 * 定位：先拿系统经纬度（需要定位权限），再用高德把经纬度换算成城市。
 *
 * 每一步失败都有自己的 error.code，界面据此给出不同提示：
 *   PERMISSION  没给定位权限（可再次申请）
 *   BLOCKED     定位权限被永久拒绝（只能去系统设置开）
 *   GPS_OFF     有权限，但手机的定位服务（GPS/位置信息开关）关着
 *   NO_COORDS   有权限、定位服务也开着，但没拿到经纬度（超时/室内无信号等）
 *   GEOCODE     经纬度拿到了，但换算城市失败（网络/高德接口问题）
 */
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// 高德 Web 服务 Key（逆地理编码 / 坐标转换）
const AMAP_WEB_KEY = '2d1aae402afb413e66700c77eb0f9ca1';

function fail(code, message, extra) {
  const e = new Error(message);
  e.code = code;
  Object.assign(e, extra);
  return e;
}

function configure(provider) {
  Geolocation.setRNConfiguration({
    skipPermissionRequests: Platform.OS === 'android', // Android 由 ensurePermission 申请
    authorizationLevel: 'whenInUse',
    locationProvider: provider,
  });
}

/** 第一步：权限。已有权限直接通过，没有才弹窗 */
async function ensurePermission() {
  if (Platform.OS !== 'android') {
    return;
  }
  const P = PermissionsAndroid.PERMISSIONS;
  const hasFine = await PermissionsAndroid.check(P.ACCESS_FINE_LOCATION);
  const hasCoarse = await PermissionsAndroid.check(P.ACCESS_COARSE_LOCATION);
  if (hasFine || hasCoarse) {
    return;
  }
  const res = await PermissionsAndroid.requestMultiple([
    P.ACCESS_FINE_LOCATION,
    P.ACCESS_COARSE_LOCATION,
  ]);
  const vals = Object.values(res);
  if (vals.includes(PermissionsAndroid.RESULTS.GRANTED)) {
    return;
  }
  if (vals.includes(PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) {
    throw fail('BLOCKED', '定位权限已被关闭，请到系统设置里允许「使用期间」定位');
  }
  throw fail('PERMISSION', '需要定位权限才能查看附近的人');
}

function getPosition(options) {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err || new Error('unknown')),
      options
    );
  });
}

/**
 * 第二步：经纬度。国内很多手机没有谷歌服务，所以先走系统 LocationManager
 * （网络定位 → GPS），最后再试谷歌融合定位。
 */
async function getCoords() {
  const attempts = [
    { provider: 'android', opts: { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 } },
    { provider: 'android', opts: { enableHighAccuracy: true, timeout: 15000, maximumAge: 60 * 1000 } },
    { provider: 'playServices', opts: { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 } },
  ];
  const reasons = [];
  for (const a of attempts) {
    if (Platform.OS !== 'android' && a.provider !== 'android') {
      break;
    }
    configure(a.provider);
    try {
      return await getPosition(a.opts);
    } catch (e) {
      if (e && e.code === 1) {
        throw fail('PERMISSION', '系统没有给本应用定位权限');
      }
      reasons.push(String((e && e.message) || e));
    }
  }
  configure('auto');
  console.log('[location] 获取经纬度失败:', reasons);
  if (reasons.length && reasons.every((r) => /No location provider available|settings/i.test(r))) {
    throw fail('GPS_OFF', '手机的定位服务（位置信息开关）没有打开', { reasons });
  }
  const timeout = reasons.some((r) => /timed out|temporarily unavailable/i.test(r));
  throw fail(
    'NO_COORDS',
    timeout ? '定位超时，没有获取到位置，可以到窗边或室外再试' : '已有定位权限，但没有获取到位置',
    { reasons }
  );
}

async function getJson(url) {
  const res = await fetch(url);
  return res.json();
}

/** 系统坐标(WGS84) → 高德坐标(GCJ02)，失败就原样返回 */
async function toAmap(lng, lat) {
  try {
    const r = await getJson(
      `https://restapi.amap.com/v3/assistant/coordinate/convert?locations=${lng},${lat}&coordsys=gps&key=${AMAP_WEB_KEY}`
    );
    if (r && r.status === '1' && r.locations) {
      const [a, b] = String(r.locations).split(',').map(Number);
      if (Number.isFinite(a) && Number.isFinite(b)) {
        return { lng: a, lat: b };
      }
    }
  } catch (e) {}
  return { lng, lat };
}

function pick(v) {
  if (Array.isArray(v)) {
    return String(v[0] || '').trim();
  }
  return v ? String(v).trim() : '';
}

/** 第三步：经纬度 → 城市（直辖市 city 为空，取 province） */
async function cityFromCoords(lng, lat) {
  let r;
  try {
    r = await getJson(
      `https://restapi.amap.com/v3/geocode/regeo?location=${lng},${lat}&key=${AMAP_WEB_KEY}`
    );
  } catch (e) {
    throw fail('GEOCODE', '已获取到位置，但网络异常，没能换算出城市');
  }
  const ac = (r && r.regeocode && r.regeocode.addressComponent) || {};
  const city = pick(ac.city) || pick(ac.province) || pick(ac.district);
  if (!city) {
    console.log('[location] 逆地理失败:', r);
    throw fail('GEOCODE', `已获取到位置，但没能换算出城市（${(r && r.info) || '无结果'}）`);
  }
  return city;
}

/**
 * 获取当前位置：权限 → 经纬度 → 城市
 * @returns {Promise<{latitude:number, longitude:number, city:string}>}
 */
export async function locateMe() {
  await ensurePermission();
  const c = await getCoords();
  const { lng, lat } = await toAmap(c.longitude, c.latitude);
  const city = await cityFromCoords(lng, lat);
  return { latitude: lat, longitude: lng, city };
}
