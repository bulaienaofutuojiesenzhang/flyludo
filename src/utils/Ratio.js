import { Dimensions, StyleSheet,Platform} from 'react-native';

/**
 * @ProjectName:  ttyyRnApp
 * @ClassName:    Ratio
 * @Desc:         作用描述:
 * @source:       来源:
 * @Author:       wangding
 * @CreateDate:   2020/7/28 4:58 下午
 * @Version:      1.0.0
 */

export const deviceW = Dimensions.get('window').width;
export const deviceH = Dimensions.get('window').height;
export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

// UI 默认 750 iphone6s 基准
const uiWidthPx = 750;

/**
 * UI适配单位转换函数
 * @param pxValue px 数值
 * @returns {number|*} 转换后的 dp 值
 */
export default function px2dp(pxValue) {
    const transferUnit = pxValue * deviceW / uiWidthPx;
    if (transferUnit >= 1) {
        // 避免出现小数
        return Math.ceil(transferUnit);
    }
    return StyleSheet.hairlineWidth;
}
