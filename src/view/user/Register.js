import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Text, } from 'react-native';
import { View, } from 'native-base';
import { Tab, TabView } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import Icon from 'react-native-vector-icons/AntDesign';

import { Loading, SmsCodeButton, ToastService } from '../../component';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import ParamsValidate from '../../utils/ValueValidate';
import md5 from 'js-md5';


class Register extends React.Component {
	constructor(props) {
		super(props);
		this._SendVcode = this._SendVcode.bind(this)
		this.state = {
			isLoading: false,
			account: '', // 邮箱账号
			emailCode: '',
			password: '',
			inviteCode: '',
			captcha: '',
			captchaSvg: '',
			captchaId: '',
			tongyi: false,
			tabIndex: 0,
		}
	}


	UNSAFE_componentWillMount() {

	}

	componentDidMount() {
		this.getCaptcha();
	}

	setTabIndexFunc(e) {
		this.setState({ tabIndex: e })
	}

	// 设置token
	async setToken(name, val) {
		try {
			await AsyncStorage.setItem(name, val);
		} catch (error) {
			console.error('ERROR: Logion setToken')
		}
	}

	// 获取图形验证码
	getCaptcha() {
		Http('get', "/users/captcha").then(res => {
			if (res.code === 200) {
				this.setState({
					captchaSvg: res.data.svg,
					captchaId: res.data.captchaId
				});
			}
		});
	}

	/* 发送邮箱验证码 */
	_SendVcode(shouldStartCountting) {
		const account = this.state.account;
		const msg = ParamsValidate('isEmail', account);
		if (msg !== null) {
			ToastService.showToast({ title: msg });
			setTimeout(() => { shouldStartCountting && shouldStartCountting(false) }, 0);
			return;
		}

		// 使用新的API接口 - POST /register/code
		Http('post', "/users/register/code", { email: account }).then(res => {
			if (res && res.code === 200) {
				setTimeout(() => { shouldStartCountting && shouldStartCountting(true) }, 0);
				ToastService.showToast({ title: "验证码已发送至您的邮箱", duration: 6000, placement: 'top' });
			} else {
				setTimeout(() => { shouldStartCountting && shouldStartCountting(false) }, 0);
			}
		}).catch(err => {
			setTimeout(() => { shouldStartCountting && shouldStartCountting(false) }, 0);
		})
	}

	// 注册
	async userAddFunc() {
		let { account, password, emailCode, captcha, captchaId, inviteCode } = this.state;

		let emailMsg = ParamsValidate('isEmail', account);
		if (emailMsg !== null) {
			ToastService.showToast({ title: emailMsg })
			return;
		}

		let passwordMsg = ParamsValidate('password', password);
		if (passwordMsg !== null) {
			ToastService.showToast({ title: passwordMsg })
			return false;
		}

		let captchaMsg = ParamsValidate('isEmpty', captcha);
		if (captchaMsg !== null) {
			ToastService.showToast({ title: '请填写图形验证码' })
			return;
		}

		let emailCodeMsg = ParamsValidate('smsCode', emailCode);
		if (emailCodeMsg !== null) {
			ToastService.showToast({ title: emailCodeMsg })
			return;
		}


		if (!this.state.tongyi) {
			ToastService.showToast({
				title: '请先阅读并同意用户协议及隐私条款'
			})
			return;
		}

		this.setState({ isLoading: true })
		Http('post', "/users/register", {
			account: account,
			password: md5(password),
			inviteCode: inviteCode,
			captchaId: captchaId,
			captcha: captcha,
			emailCode: emailCode,
		}).then(res => {
			this.setState({ isLoading: false })
			if (res && (res.code === 200 || res.code === 0)) {
				ToastService.showToast({ title: "注册成功！" });
				this.props.navigation.goBack();
			}
		})
	}

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: Colors.bai }}>
				<Loading showLoading={this.state.isLoading} />
				<ScrollView>
					<View style={Styles.showWelcome}>
						<Image
							resizeMode='contain'
							style={Styles.loginTopImg}
							source={
								require('../../asserts/images/home/logo.png')
							}
						/>
					</View>
					<View style={{ paddingBottom: 20 }}>
						<View style={{ paddingHorizontal: Metrics.px2dp(280), marginBottom: 8 }} >
							<Tab
								value={this.state.tabIndex}
								onChange={(e) => this.setTabIndexFunc(e)}
								indicatorStyle={{ backgroundColor: Colors.subject, height: 3 }}
								dense={true}
								style={{ backgroundColor: 'white' }} // 设置背景色为白色
							>
								<Tab.Item title="注册"
									titleStyle={{
										color: this.state.tabIndex === 0 ? 'black' : 'gray',
									}}
									buttonStyle={{
										backgroundColor: Colors.bai
									}}
								/>
							</Tab>
						</View>


						{/* <TabView value={this.state.tabIndex} onChange={(e) => this.setTabIndexFunc(e)}>
							<TabView.Item style={{ flex: 1 }}> */}
						<View style={{ paddingHorizontal: 20 }}>

						<View style={Styles.inputTextCont}>
							<Image
								resizeMode='contain'
								style={Styles.inputIcon}
								source={require('../../asserts/images/icons/icon_code_pressed.png')} />
							<TextInput style={Styles.inputText} placeholder='请输入邮箱账号' placeholderTextColor={Colors.huiCc} keyboardType='email-address' borderBottomWidth={0}
								value={this.state.account}
								onChangeText={(value) => {
									this.setState({ account: value })
								}} />
						</View>
							<View style={Styles.inputTextCont}>
								<Image
									resizeMode='contain'
									style={Styles.inputIcon}
									source={require('../../asserts/images/icons/icon_pwd_pressed.png')} />
								<TextInput style={Styles.inputText} placeholder='请输入8-16位密码' placeholderTextColor={Colors.huiCc} secureTextEntry={true}
									onChangeText={(value) => this.setState({ password: value })} />
							</View>
						{/* 图形验证码 */}
						<View style={Styles.inputTextCont}>
							<Icon name="lock" size={18} color={'#464B4B'} />
							<TextInput style={Styles.inputText} placeholder='请输入图形验证码' placeholderTextColor={Colors.huiCc}
								onChangeText={(value) => this.setState({ captcha: value })} />
							<TouchableOpacity onPress={() => this.getCaptcha()}>
								{this.state.captchaSvg ? (
									<SvgXml xml={this.state.captchaSvg} width={90} height={36} />
								) : null}
							</TouchableOpacity>
						</View>
							<View style={Styles.inputTextCont}>
								<Icon name="mail" size={16} color={'#464B4B'} />
							<TextInput style={Styles.inputText} placeholder='请输入邮箱验证码' placeholderTextColor={Colors.huiCc} keyboardType='number-pad'
								onChangeText={(value) => this.setState({ emailCode: value })} />
								<SmsCodeButton
									textStyle={{ color: Colors.subject, fontSize: 14 }}
									style={{ backgroundColor: "transparent" }}
									buttonStyle={{}}
									timerCount={60}
									timerTitle={'获取验证码'}
								enable={this.state.account && this.state.account.indexOf('@') > -1}
									onClick={
										(shouldStartCountting) => {
											this._SendVcode(shouldStartCountting)
										}}
									timerEnd={() => { this.setState({ state: '倒计时结束' }) }}
								/>
							</View>
							<View style={Styles.inputTextCont}>
								<Image
									resizeMode='contain'
									style={Styles.inputIcon}
									source={require('../../asserts/images/icons/icon_pwd_pressed.png')} />
							<TextInput style={Styles.inputText} placeholder='请输入邀请码(非必填)' placeholderTextColor={Colors.huiCc} secureTextEntry={false}
									onChangeText={(value) => this.setState({ inviteCode: value })} />
							</View>

						</View>
						{/* </TabView.Item>
						</TabView> */}

						<View style={Styles.xieyiCont}>
							<TouchableOpacity style={Styles.yhXieyiClikCont} onPress={() => { this.setState({ tongyi: !this.state.tongyi }) }}>
								{
									this.state.tongyi ?
										<Image
											resizeMode='contain'
											style={Styles.inputIcon}
											source={require('../../asserts/images/icons/icon_check_check.png')} />
										:
										<Image
											resizeMode='contain'
											style={Styles.inputIcon}
											source={require('../../asserts/images/icons/icon_check_uncheck.png')} />
								}
							</TouchableOpacity>
							<Text style={Styles.yhXieyiText}> 登录即表明您已阅读并同意 </Text>
							<Text onPress={() => this.props.navigation.navigate("Yonghuxieyi")} style={Styles.yhXieyiBook}>《用户协议》</Text>
							<Text onPress={() => this.props.navigation.navigate("Yinsixieyi")} style={Styles.yhXieyiBook}>《隐私协议》</Text>
						</View>


						<View style={Styles.signInView}>
							<TouchableOpacity onPress={() => { this.userAddFunc() }} disabled={this.state.isLoading} >
								<View style={Styles.loginBtn} >
									<Text style={Styles.loginBtnText}>{this.state.isLoading ? "注册中..." : "立即注册"}</Text>
								</View>
							</TouchableOpacity>
						</View>
						<View style={Styles.caozuoCont}>
							<TouchableOpacity >
							</TouchableOpacity>
							<TouchableOpacity onPress={() => this.props.navigation.goBack()} >
								<Text style={{ fontSize: Metrics.fontSize15, color: Colors.hei }}> 去登录 </Text>
							</TouchableOpacity>
						</View>
						{/* <View style={Styles.banben}>
							<Text style={{ fontSize: Metrics.fontSize9, color: Colors.subject }}>版本: {`${Config.Env !== 'dev' ? Config.Env : ''}${Config.Version.version}.${Config.Version.versionNum}`}</Text>
						</View> */}

					</View>
				</ScrollView>
			</View>
		);
	}

}

const mapStateToProps = state => ({
	isLogged: state.user.isLogged,
	token: state.user.token,

});

const mapDispatchToProps = dispatch => ({
	loginSuccess: userInfo => dispatch({ type: 'LOGINSUCCESS', payload: { userInfo } }),
	setUserInfo: payload => dispatch({ type: 'SET_USERINFO', payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Register);

const Styles = StyleSheet.create({
	showWelcome: { marginBottom: 8, position: 'relative', justifyContent: 'center', alignItems: 'center' },
	loginTopView: { position: 'absolute', top: 60, left: 20, zIndex: 6, },
	loginTopImg: { width: Metrics.px2dp(168), height: Metrics.px2dp(168), borderRadius: 18, marginTop: 8 },
	showWelcomeText1: { textAlign: 'left', fontSize: 22, color: Colors.bai, marginBottom: 8 },
	showWelcomeText2: { textAlign: 'left', fontSize: 20, color: Colors.bai, marginBottom: 6 },
	pageTitleText: { textAlign: 'left', fontSize: 18, color: Colors.hui99, marginBottom: 6 },
	inputTextCont: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, marginTop: 10, paddingBottom: 1, borderBottomColor: Colors.huiCc, borderBottomWidth: Metrics.borderWidth },
	inputText: { flex: 1, paddingLeft: 8, fontSize: Metrics.fontSize15 },
	inputIcon: { fontSize: 20, color: Colors.hui99, marginBottom: 2, width: 16 },
	xieyiCont: { marginTop: 28, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap', alignItems: 'center' },
	caozuoCont: { marginTop: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	signInView: { marginTop: 58, alignItems: "center", paddingHorizontal: 20 },
	loginBtn: { width: Metrics.px2dp(700), alignItems: "center", borderRadius: 30, backgroundColor: Colors.subject },
	loginBtnText: { fontSize: Metrics.fontSize16, height: Metrics.px2dp(88), lineHeight: Metrics.px2dp(88), color: Colors.bai },
	banben: { marginTop: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
	yhXieyi: { marginTop: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
	yhXieyiClikCont: { fontSize: Metrics.fontSize15, color: Colors.subject, textAlign: 'center', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
	yhXieyiText: { fontSize: Metrics.fontSize14, color: Colors.subject, },
	yhXieyiBook: { fontSize: Metrics.fontSize14, color: Colors.subject, },
});