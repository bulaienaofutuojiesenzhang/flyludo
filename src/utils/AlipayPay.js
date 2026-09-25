import { Platform } from 'react-native';
import Alipay from '@uiw/react-native-alipay';
import Http from './HttpPost';
import Config from '../config/index';

/** 飞行棋支付宝 AppId（与开放平台一致，勿用旧产品） */
export const FLYLUDO_ALIPAY_APP_ID = '2021006199697336';

/** iOS / Android 回跳 scheme，需与原生配置一致 */
export const FLYLUDO_ALIPAY_SCHEME = `alipay${FLYLUDO_ALIPAY_APP_ID}`;

let schemeReady = false;

export function ensureAlipayScheme() {
  if (schemeReady) return;
  try {
    if (typeof Alipay.setAlipayScheme === 'function') {
      Alipay.setAlipayScheme(FLYLUDO_ALIPAY_SCHEME);
    }
    schemeReady = true;
  } catch (e) {
    console.warn('setAlipayScheme failed', e);
  }
}

/**
 * 拉取商品列表
 */
export async function fetchFlyludoProducts() {
  return Http('get', '/payment/flyludo/products');
}

/**
 * 创建支付宝 APP 订单并调起支付
 * @param {string} product 商品 key，如 flyludo_vip_month
 * @returns {Promise<{ orderId: string, result: any }>}
 */
export async function payFlyludoProduct(product) {
  ensureAlipayScheme();

  const createRes = await Http('post', '/payment/flyludo/alipay/create', { product });
  if (!createRes || createRes.code !== 200 || !createRes.data?.orderInfo) {
    const msg = createRes?.message || '创建支付订单失败';
    throw new Error(msg);
  }

  const { orderId, orderInfo, appId } = createRes.data;
  if (appId && appId !== FLYLUDO_ALIPAY_APP_ID) {
    console.warn('服务端 appId 与客户端常量不一致', appId, FLYLUDO_ALIPAY_APP_ID);
  }

  const result = await Alipay.alipay(orderInfo);
  return { orderId, result, env: Config.Env, platform: Platform.OS };
}
