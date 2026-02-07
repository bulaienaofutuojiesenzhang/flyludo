import React from 'react';
import { TouchableWithoutFeedback, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { View, Text } from 'native-base';
import Icon from 'react-native-vector-icons/AntDesign';
import * as PropTypes from 'prop-types';
import { Metrics, Colors } from '../theme';

export default class Header extends React.Component {
    
    static propTypes = {
        title: PropTypes.string,                // Header标题
        titleStyle: PropTypes.oneOfType([       // Header标题样式
            PropTypes.number,
            PropTypes.object
        ]),

        leftIcon: PropTypes.string,             // HeaderLeft图标
        leftIconSize: PropTypes.number,         // HeaderLeft图标大小
        leftIconColor: PropTypes.string,       // HeaderLeft图标颜色
        leftText: PropTypes.string,             // HeaderLeft文字
        onLeftPress: PropTypes.func,            // HeaderLeft点击事件
        leftStyle: PropTypes.oneOfType([        // HeaderLeft样式
            PropTypes.number,
            PropTypes.object
        ]),

        rightIcon: PropTypes.string,            // HeaderRight图标
        rightIconSize: PropTypes.number,        // HeaderRight图标大小
        rightIconColor: PropTypes.string,       // HeaderRight图标颜色
        rightText: PropTypes.string,            // HeaderRight文字
        onRightPress: PropTypes.func,           // HeaderRight点击事件
        rightStyle: PropTypes.oneOfType([       // HeaderRight样式
            PropTypes.number,
            PropTypes.object
        ]),

        style: PropTypes.oneOfType([            // HeaderRight样式
            PropTypes.number,
            PropTypes.object
        ]),

        isPurecolor: PropTypes.bool,
        backgroundColor: PropTypes.string,     // StatusBar背景色

        isTabBar: PropTypes.bool,               // 是否为Tab界面
        isStatusBarVisible: PropTypes.bool      // 状态栏是否可见
    };

    static defaultProps = {
        title: "",
        titleStyle: {},

        leftIcon: "angle-left",
        leftIconSize: 28,
        leftIconColor: "#FFFFFF",
        leftText: "",
        leftStyle: {},
        onLeftPress: () => {
            // this.props.navigation.goBack();
        },

        rightIcon: "",
        rightIconSize: 28,
        rightIconColor: "#FFFFFF",
        rightText: "",
        rightStyle: {},
        onRightPress: () => {},

        style: {},
        isPurecolor: true,
        backgroundColor: Colors.bai, // gradientBtnZuo

        isTabBar: false,
        isStatusBarVisible: true
    };

    constructor (props) {
        super(props);
        this.state = {
        };
    }

    /**
     * HeaderLeft点击事件
     */
    onLeftPress () {
        // if (!this.props.isTabBar) {
            this.props.onLeftPress();
        // }
    }

    /**
     * 渲染HeaderLeft
     */
    renderHeaderLeft () {
        let { leftIcon, leftText, leftIconSize, leftIconColor, leftStyle, onLeftPress, isTabBar } = this.props;
        return (
            <TouchableWithoutFeedback onPress={() => this.onLeftPress()}>
                <View style={Styles.leftContainer}>
                    {!isTabBar || leftText ?
                        (leftText ?
                            <Text style={[Styles.leftStyle, leftStyle]}>{leftText}</Text>
                            :
                            <Icon name='left' size={leftIconSize} style={this.props.isPurecolor?Styles.leftStyle1:Styles.leftStyle}/>
                        )
                        : <View />
                    }
                </View>
            </TouchableWithoutFeedback>
        )
    }

    /**
     * 渲染HeaderTitle
     */
    renderHeaderTitle () {
        let { title, titleStyle } = this.props;
        return (
            <View style={Styles.titleContainer}>
                <Text style={[ this.props.isPurecolor?Styles.titleStyle1:Styles.titleStyle, titleStyle]} numberOfLines={1}>{title}</Text>
            </View>
        )
    }

    /**
     * 渲染HeaderRight
     */
    renderHeaderRight () {
        let { rightIcon, rightIconSize, rightIconColor, rightText, rightStyle, onRightPress } = this.props;
        return (
            <TouchableWithoutFeedback onPress={() => onRightPress()}>
                <View style={Styles.rightContainer}>
                    {rightText ?
                        <Text style={[Styles.rightStyle, rightStyle]}>{rightText}</Text>
                        :
                        (rightIcon ?
                            <Icon name={rightIcon} size={rightIconSize} color={rightIconColor} style={[Styles.rightStyle, rightStyle]}/>
                            :
                            <View />
                        )
                    }
                </View>
            </TouchableWithoutFeedback>
        )
    }

    /**
     * 渲染StatusBar
     */
    renderStatusBar () {
        return (
            this.props.isStatusBarVisible ?
                <StatusBar backgroundColor={Colors.gradientBtnZuo} barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
                :
                <View style={{ height: Metrics.HEADER_HEIGHT }} />
        )
    }

    render () {
        return (
            <View style={[Styles.container, { backgroundColor: this.props.backgroundColor }, this.props.style]} >
                {this.renderStatusBar()}
                {this.renderHeaderLeft()}
                {this.renderHeaderTitle()}
                {this.renderHeaderRight()}
            </View>
        )
    }
}

const Styles = StyleSheet.create({
    container: { height: Metrics.HEADER_HEIGHT, width: Metrics.screenWidth, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.subject },
    titleContainer: { justifyContent: 'center', alignItems: 'center' },
    titleStyle: { textAlign: 'center', fontSize: 18, color: '#FFFFFF', fontWeight: 'normal', width: Metrics.screenWidth * 0.3 },
    titleStyle1: { textAlign: 'center', fontSize: 18, color: '#333333', fontWeight: 'normal', width: Metrics.screenWidth * 0.3 },
    leftContainer: { flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 10, paddingRight: 15 },
    leftStyle: { fontSize: 18, color: '#FFFFFF', fontWeight: 'normal', padding: 2 },
    leftStyle1: { fontSize: 18, color: '#333333', fontWeight: 'normal', padding: 2 },
    rightContainer: {  flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingLeft: 15, paddingRight: 10 },
    rightStyle: { fontSize: 16, color: '#FFFFFF', fontWeight: 'normal', padding: 2 },
});