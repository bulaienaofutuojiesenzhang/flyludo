import { Dimensions, Platform, StatusBar } from 'react-native';

/**
 * @ProjectName:  ttyyRnApp
 * @ClassName:    iphoneXHelper
 * @Desc:         作用描述: iphoneX 适配
 * @source:       来源:
 * @Author:       hzx
 * @CreateDate:   2022/11/10 02:35
 * @Version:      1.0.0
 */

export function isIphoneX() {
    const dimen = Dimensions.get('window');
    return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        ((dimen.height === 812 || dimen.width === 812) || (dimen.height === 896 || dimen.width === 896))
    );
}

export function ifIphoneX(iphoneXStyle, regularStyle) {
    if (isIphoneX()) {
        return iphoneXStyle;
    }
    return regularStyle;
}

export function getStatusBarHeight(safe) {
    return Platform.select({
        ios: ifIphoneX(safe ? 44 : 30, 20),
        android: StatusBar.currentHeight
    });
}

/**
 * iphoneX 顶部留白的兼容处理
 * @param number
 * @returns {*}
 */
export function isIPhoneXPaddTop(number)  {
    number = isNaN(+number) ? 0 : +number;
    return number + (isIphoneX() ? 44 : 32);
}

/**
 * iPhoneX 底部高度兼容处理
 * @param number
 * @returns {*}
 */
export function isIPhoneXFooter(number) {
    number = isNaN(+number) ? 0 : +number;
    return number + (isIphoneX() ? 34 : 0);
}
