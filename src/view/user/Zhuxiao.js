
import React, { Component } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, } from 'react-native';
import { View, Text } from 'native-base';
import { connect } from 'react-redux';

import { Header } from '../../component';
import { Metrics, Colors } from '../../theme';
import AsyncStorage from '../../utils/AsyncStorage';

class Zhuxiao extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    //  路由地址
    toNavigateFunc(uri) {
        this.props.navigation.navigate(uri)
    }

    componentWillUnmount() {

    }

    /**
     * 退出登录
     */
    loginOutFunc() {
        this.props.logout();
        AsyncStorage.setItem("jwToken", "").then((res) => {
            this.props.navigation.replace('Login');
        })
    }

    zhuixaoFunc() {
        let _this = this;
        Alert.alert(
            "注销提示",
            "您确定对账户进行注销？",
            [
                {
                    text: "我很确定",
                    onPress: () => {
                        _this.loginOutFunc()
                    },
                    style: "cancel",
                },
                { text: "取消", onPress: () => console.log("OK") }
            ],
            {
                cancelable: true,
                onDismiss: () => {
                    // 点击其他区域
                },
            }
        );

    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <ScrollView style={{ paddingHorizontal: 10, paddingVertical: 10 }}>

                    <Text style={Styles.sectionTitle}>一、注销账号的影响</Text>
                    <Text style={Styles.text}>
                        1. <Text style={Styles.bold}>账号注销是不可逆的操作</Text>：账号一旦注销，将无法恢复，请您慎重考虑。
                        {'\n'}2. 服务功能终止：账号注销后，您将无法使用本应用的所有功能和服务，包括但不限于社交、娱乐、购物等服务。
                        {'\n'}3. 数据删除：注销账号将导致所有相关数据被删除或匿名化，具体包括但不限于以下内容：
                        {'\n'} - 用户的个人信息和历史记录（如昵称、头像、聊天记录等）
                        {'\n'} - 应用使用记录（如订单记录、偏好设置等）
                        {'\n'} - 其他由用户自行上传的数据（如个人照片、动态等）
                        {'\n'}4. 不可转让：注销账号不可逆且不支持账号信息转移至其他账号。
                    </Text>

                    <Text style={Styles.sectionTitle}>二、用户数据的处理</Text>
                    <Text style={Styles.text}>
                        1. 个人信息删除：根据法律法规的要求，在账号注销后，您的个人信息将从本应用的数据库中删除或匿名化处理。
                        {'\n'}2. 备份数据：为了保障数据安全性，本应用的系统备份数据可能会在注销完成后的一定时间内保留，之后将按照法律法规要求进行彻底清除。
                        {'\n'}3. 法定义务：若您的数据根据法律法规需要保留的（如有未了结的争议、争议解决期间的证据保存等），我们将根据适用法律法规的规定予以妥善保留。
                    </Text>

                    <Text style={Styles.sectionTitle}>三、注销流程</Text>
                    <Text style={Styles.text}>
                        1. 提交注销申请：用户可以在应用内的“账号设置”中选择“注销账号”选项，按照页面提示填写注销申请并提交。
                        {'\n'}2. 注销确认：在申请提交后，我们会进行审核并发送确认信息至您的注册邮箱或手机号码，以便确保账号注销的安全性。
                        {'\n'}3. 注销完成：收到确认信息后，账号将正式注销。您将收到通知确认账号已注销成功。
                    </Text>

                    <Text style={Styles.sectionTitle}>四、注意事项</Text>
                    <Text style={Styles.text}>
                        1. 未完成交易：在注销前，请确保您已完成所有未完成的交易或订单，否则您将无法再继续该交易。
                        {'\n'}2. 余额或权益清零：账号内的任何余额、优惠券、积分、权益等在注销后将不再保留或找回。
                        {'\n'}3. 联系方式更新：若您存在未完成的退款事宜或其他业务往来，请在注销前更新有效联系方式，以确保沟通畅通。
                    </Text>

                    <Text style={Styles.sectionTitle}>五、其他条款</Text>
                    <Text style={Styles.text}>
                        1. 法律适用：本协议受相关法律法规的管辖和保护，因本协议或与本协议相关产生的任何争议，双方应友好协商解决，协商不成时，可向本应用所在的有管辖权的人民法院起诉。
                        {'\n'}2. 协议的更新：本应用保留对本协议的解释及修改权，如有任何变动，我们将在应用内发布公告。
                    </Text>


                    <View style={{ marginTop: 8, marginBottom: 58 }}>
                        <View style={Styles.signOutView}>
                            <TouchableOpacity onPress={() => this.zhuixaoFunc()} >
                                <View style={[Styles.loginBtn]} >
                                    <Text style={{ fontSize: 12, padding: 12, color: Colors.bai }}>确定注销</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
            </View>
        )
    }
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch({ type: 'LOGOUT' }),
    setGlobalInfo: globalInfo => dispatch({ type: 'SET_GLOBALINFO', payload: globalInfo }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Zhuxiao);

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    text: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'justify',
    },
    bold: {
        fontWeight: 'bold',
    },
    contact: {
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 20,
    },
    signOutView: { marginTop: 58, justifyContent: 'center', alignItems: "center" },
    textCongh: { flexDirection: "row", marginTop: 18, justifyContent: "center", alignItems: "center", },
    loginBtn: { width: Metrics.screenWidth * 0.6, alignItems: "center", borderRadius: 8, backgroundColor: Colors.subject },
});