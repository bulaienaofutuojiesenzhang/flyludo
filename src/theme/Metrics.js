/*

 * @Date: 2018-08-17 00:58:48
 * @Last Modified by:  
 * @Last Modified time: 2019-07-18 14:56:07
 */

import { Dimensions, Platform, StyleSheet, StatusBar } from 'react-native';
import {isIphoneX} from 'react-native-iphone-x-helper';
const { width, height } = Dimensions.get('window');

/**
 * px和rn长度单位转化
 * @param {*} uiElementPx
 */
function px2dp(uiElementPx, uiWidthPx = 750) {
	const length = uiElementPx * width / uiWidthPx;
	return Math.ceil(length);
}

function px2dpi(uiElementPx, uiWidthPx = 750) {
	const length = uiElementPx/1.5 * width / uiWidthPx;
	return Math.ceil(length);
}

module.exports = {
	width:width,
	screenWidth: width < height ? width : height,
	screenHeight: width < height ? height : width,
	uiWidthPx: 750,
	px2dp,
	px2dpi,
	brs: 8,
	borderWidth: StyleSheet.hairlineWidth,
	mainMagin: 15,
	mainPadding: 15,
	fontSize9: 9,
	fontSize10: 10,
	fontSize11: 11,
	fontSize12: 12,
	fontSize13: 13,
	fontSize14: 14,
	fontSize15: 15,
	fontSize16: 16,
	fontSize18: 18,
	fontSize19: 19,
	fontSize20: 20,
	fontSize22: 22,
	fontSize24: 24,
	fontSize25: 25,
	fontSize26: 26,
	fontSize28: 28,
	fontSize30: 30,
	STATUSBAR_HEIGHT: Platform.OS === 'ios' ? (20 + (isIphoneX() ? 15 : 10)) : StatusBar.currentHeight,  // 状态栏高度
	HEADER_HEIGHT: Platform.OS === 'ios' ? (44 + (isIphoneX() ? 24 : 0)) : 44,  //头部高度
	PADDING_BOTTOM: isIphoneX() ? 15 : 0,
	LIST_BOTTOM: isIphoneX() ? (24 + 10) : 15,
};
