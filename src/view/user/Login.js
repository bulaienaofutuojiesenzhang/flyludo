import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Text, } from 'react-native';
import { View, } from 'native-base';
import { Tab, TabView, Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connect } from 'react-redux';
import md5 from 'js-md5';

import { Header, Loading, SmsCodeButton, ToastService } from '../../component';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import ParamsValidate from '../../utils/ValueValidate';


class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			mail: '',
			password: '',
			tongyi: true,
			tabIndex: 0,
			captchaSvg: '',
			captchaId: '',
			captcha: '',
			googleCode: '',
		}
	}


	UNSAFE_componentWillMount() {

	}

	componentDidMount() {

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

	// 登录
	async loginFunc() {
		let { mail, password, googleCode } = this.state;

		if (!this.state.tongyi) {
			return ToastService.showToast({
				title: "请先阅读并同意用户协议及隐私条款",
			});
		}

		this.setState({ isLoading: true })
		Http('post', "/users/login", {
			account: mail,
			// password,
			password: md5(password),
			googleCode: googleCode,
			// admin: 1
		}).then(res => {
			this.setState({ isLoading: false })
			if (res.code == 200) {
				this.setToken("jwToken", res.data.token);
				this.props.loginSuccess({
					userInfo: res.data.user,
					token: res.data.token
				})

				// this.props.navigation.replace('Users');
				this.props.navigation.replace('MainTab', { screen: 'Users' });
				ToastService.showToast({ title: "登录成功！", textStyle: { textAlign: "center" }, type: "success" });
				console.log('this.props.user', this.props.user)
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
						<Text style={Styles.loginTopText}>同城有约</Text>
					</View>
					<View style={{ paddingBottom: 20, paddingTop: 28 }}>
						<View style={{ paddingHorizontal: 50, marginBottom: 0 }} >

						</View>


						<View style={{ paddingHorizontal: 20 }}>
							<View style={Styles.inputTextCont}>
								<Image
									resizeMode='contain'
									style={Styles.inputIcon}
									source={require('../../asserts/images/icons/icon_phone_pressed.png')} />
								<TextInput style={Styles.inputText} placeholder='请输入邮箱' placeholderTextColor={Colors.huiCc} keyboardType='email-address' borderBottomWidth={0}
									value={this.state.mail}
									onChangeText={(value) => {
										this.setState({ mail: value }, () => { })
									}} />
							</View>
							<View style={Styles.inputTextCont}>
								<Image
									resizeMode='contain'
									style={Styles.inputIcon}
									source={require('../../asserts/images/icons/icon_pwd_pressed.png')} />
								<TextInput style={Styles.inputText} placeholder='请输入密码' placeholderTextColor={Colors.huiCc} secureTextEntry={true}
									onChangeText={(value) => this.setState({ password: value })} />
							</View>


						</View>


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
							<TouchableOpacity onPress={() => { this.loginFunc() }} disabled={this.state.isLoading} >
								<View style={Styles.loginBtn} >
									<Text style={Styles.loginBtnText}>{this.state.isLoading ? "登录中..." : "登 录"}</Text>
								</View>
							</TouchableOpacity>
						</View>
						<View style={Styles.caozuoCont}>
							<TouchableOpacity onPress={() => this.props.navigation.navigate("ForgetPassword")} >
								<Text style={{ fontSize: Metrics.fontSize15, color: Colors.subject }}> 忘记密码 </Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => this.props.navigation.navigate("Register")} >
								<Text style={{ fontSize: Metrics.fontSize15, color: Colors.hei }}> 免费注册 </Text>
							</TouchableOpacity>
						</View>


					</View>
				</ScrollView>
			</View>
		);
	}

}

const mapStateToProps = state => ({
	isLogged: state.user.isLogged,
	token: state.user.token,
	user: state.user,
});

const mapDispatchToProps = dispatch => ({
	loginSuccess: payload => dispatch({ type: 'LOGINSUCCESS', payload }),
	setUserInfo: payload => dispatch({ type: 'SET_USERINFO', payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);

const Styles = StyleSheet.create({
	showWelcome: { marginBottom: 8, position: 'relative', justifyContent: 'center', alignItems: 'center' },
	loginTopView: { position: 'absolute', top: 60, left: 20, zIndex: 6, },
	loginTopImg: { width: Metrics.px2dp(168), height: Metrics.px2dp(168), borderRadius: 18, marginTop: 80 },
	loginTopText: { fontSize: Metrics.fontSize20, color: Colors.subject, marginTop: 18, fontWeight: 'bold' },
	showWelcomeText1: { textAlign: 'left', fontSize: 22, color: Colors.bai, marginBottom: 8 },
	showWelcomeText2: { textAlign: 'left', fontSize: 20, color: Colors.bai, marginBottom: 6 },
	pageTitleText: { textAlign: 'left', fontSize: 18, color: Colors.hui99, marginBottom: 6 },
	inputTextCont: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, marginTop: 10, paddingBottom: 1, borderBottomColor: Colors.huiCc, borderBottomWidth: Metrics.borderWidth, height: 50 },
	inputText: { flex: 1, paddingLeft: 8, fontSize: Metrics.fontSize15, },
	inputIcon: { fontSize: 20, color: Colors.hui99, marginBottom: 2, width: 16, height: Metrics.px2dpi(54), opacity: 0.8 },
	xieyiCont: { marginTop: 28, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap', alignItems: 'center' },
	caozuoCont: { marginTop: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	signInView: { marginTop: 58, alignItems: "center", paddingHorizontal: 20 },
	loginBtn: { width: Metrics.px2dp(700), alignItems: "center", borderRadius: 30, backgroundColor: Colors.subject },
	loginBtnText: { fontSize: Metrics.fontSize16, height: Metrics.px2dp(88), lineHeight: Metrics.px2dp(88), color: Colors.bai },
	banben: { marginTop: 58, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
	yhXieyi: { marginTop: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
	yhXieyiClikCont: { fontSize: Metrics.fontSize15, color: Colors.subject, textAlign: 'center', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
	yhXieyiText: { fontSize: Metrics.fontSize14, color: Colors.primaryQian, },
	yhXieyiBook: { fontSize: Metrics.fontSize14, color: Colors.primary, },
	captchaContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
	captchaInputCont: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingBottom: 1, borderBottomColor: Colors.huiCc, borderBottomWidth: Metrics.borderWidth, height: 50 },
	captchaInput: { flex: 1, paddingLeft: 8, fontSize: Metrics.fontSize15 },
	captchaImageCont: { width: 150, height: 50, marginLeft: 10, borderWidth: 1, borderColor: Colors.huiF5, overflow: 'hidden' },
	captchaImage: { width: 150, height: 50 },
	captchaLoading: { textAlign: 'center', lineHeight: 40, fontSize: Metrics.fontSize14, color: Colors.hui99 },
});