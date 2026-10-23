import React from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';

/**
 * 带磁盘 + 内存缓存的网络图片。
 * - 同一个 URL 加载过一次后，下次直接读本地缓存，不再发网络请求
 * - 动态图片 / 头像 URL 内容不会变，所以用 immutable 策略（不做 ETag 重新校验）
 * - 本地资源（require）也能传，直接透传给 FastImage
 */
function CachedImage({ source, uri, style, resizeMode = 'cover', priority = 'normal', ...rest }) {
  const real = uri || (source && typeof source === 'object' ? source.uri : null);

  // 本地 require 资源
  if (!real && typeof source === 'number') {
    return <FastImage source={source} style={style} resizeMode={FastImage.resizeMode[resizeMode]} {...rest} />;
  }

  // 没有地址：渲染占位，避免原生层收到空 uri
  if (!real) {
    return <View style={style} />;
  }

  return (
    <FastImage
      {...rest}
      style={style}
      source={{
        uri: real,
        priority: FastImage.priority[priority] || FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      resizeMode={FastImage.resizeMode[resizeMode] || FastImage.resizeMode.cover}
    />
  );
}

/** 提前把列表里的图片拉到本地缓存，滑到时就是秒开 */
export function preloadImages(urls, max = 24) {
  const list = (urls || [])
    .filter((u) => typeof u === 'string' && /^https?:\/\//i.test(u))
    .slice(0, max)
    .map((uri) => ({ uri, priority: FastImage.priority.low, cache: FastImage.cacheControl.immutable }));
  if (list.length) {
    try {
      FastImage.preload(list);
    } catch (e) {
      // 预加载失败不影响主流程
    }
  }
}

export default React.memo(CachedImage);
