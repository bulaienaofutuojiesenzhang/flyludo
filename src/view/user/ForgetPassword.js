import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Text, } from 'react-native';
import { View, } from 'native-base';
import { Tab, TabView } from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connect } from 'react-redux';
import md5 from 'js-md5';

import { Loading, ToastService, SmsCodeButton } from '../../component';
import Config from '../../config';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import ParamsValidate from '../../utils/ValueValidate';


class ForgetPassword extends React.Component {
	constructor(props) {
		super(props);
		this._SendVcode = this._SendVcode.bind(this);
		this.state = {
			isLoading: false,
			account: '', // 邮箱账号
			verifyCode: '', // 验证码
			passwordAgain: '',
			password: '',
			tabIndex: 0,
			step: 1, // 1: 发送验证码, 2: 重置密码
		}
	}


	UNSAFE_componentWillMount() {

	}

	componentDidMount() {

	}

	setTabIndexFunc(e) {
		this.setState({ tabIndex: e })
	}

	/* 发送重置密码邮件验证码 */
	_SendVcode(shouldStartCountting) {
		const account = this.state.account;
		const msg = ParamsValidate('isEmail', account);
		if (msg !== null) {
			ToastService.showToast({ title: msg });
			setTimeout(() => { shouldStartCountting && shouldStartCountting(false) }, 0);
			return;
		}

		this.setState({ isLoading: true });
		Http('post', "/users/send-reset-email", { account: account }).then(res => {
			this.setState({ isLoading: false });
			if (res && res.code === 200) {
				setTimeout(() => { shouldStartCountting && shouldStartCountting(true) }, 0);
				ToastService.showToast({ title: "验证码已发送至您的邮箱", duration: 6000, placement: 'top' });
				this.setState({ step: 2 });
			}
		}).catch(err => {
			this.setState({ isLoading: false }); 
			setTimeout(() => { shouldStartCountting && shouldStartCountting(false) }, 0);
		});
	}

	// 重置密码
	async userAddFunc() {
		let { account, verifyCode, password, passwordAgain } = this.state;

		if (!account) {
			return ToastService.showToast({ title: "请输入邮箱账号" });
		}

		if (!verifyCode) {
			return ToastService.showToast({ title: "请输入验证码" });
		}

		let passwordMsg = ParamsValidate('password', password);
		if (passwordMsg !== null) {
			ToastService.showToast({ title: passwordMsg })
			return false;
		}

		if (passwordAgain != password) {
			return ToastService.showToast({ title: "两次输入密码不一致" })
		}

		this.setState({ isLoading: true })
		Http('post', "/users/reset-password", {
			account: account,
			newPassword: md5(password),  // MD5加密密码，与登录时的处理保持一致
			verifyType: 'email',
			verifyCode: verifyCode
		}).then(res => {
			this.setState({ isLoading: false })
			if (res.code === 200) {
				ToastService.showToast({ title: "密码重置成功！" });
				setTimeout(() => {
					this.props.navigation.goBack();
				}, 1500);
			}
		})
	}

	// 格式化手机号，保留前3位和后4位，中间用****替换
	formatPhoneNumber = (phone) => {
		if (phone.length >= 7) {
		  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
		}
		return phone; // 如果手机号长度不够7位，则直接返回输入的内容
	  };
	
	  handlePhoneChange = (value) => {
		// 限制输入的长度，最大12位（手机号长度一般为11位）
		if (value.length <= 11) {
		  this.setState({ phone: value });
		}
	  };

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
						<View style={{ paddingHorizontal: Metrics.px2dp(250), marginBottom: 30 }} >
							<Tab
								value={this.state.tabIndex}
								onChange={(e) => this.setTabIndexFunc(e)}
								indicatorStyle={{ backgroundColor: Colors.subject, height: 3 }}
								dense={true}
								style={{ backgroundColor: 'white' }}
							>
								<Tab.Item title="重置密码"
									titleStyle={{
										color: this.state.tabIndex === 0 ? 'black' : 'gray',
									}}
									buttonStyle={{
										backgroundColor: Colors.bai
									}}
								/>
							</Tab>
						</View>

						<View style={{ paddingHorizontal: 20 }}>
							{/* 邮箱输入 */}
							<View style={Styles.inputTextCont}>
								<Image
									resizeMode='contain'
									style={Styles.inputIcon}
									source={require('../../asserts/images/icons/icon_code_pressed.png')} />
								<TextInput 
									style={Styles.inputText} 
									placeholder='请输入邮箱账号' 
									placeholderTextColor={Colors.huiCc}
									value={this.state.account}
									editable={this.state.step === 1}
									onChangeText={(value) => this.setState({ account: value })} />
							</View>

							{/* 验证码输入 - 仅在第2步显示 */}
							{this.state.step === 2 && (
								<View style={Styles.inputTextCont}>
									<Image
										resizeMode='contain'
										style={Styles.inputIcon}
										source={require('../../asserts/images/icons/icon_pwd_pressed.png')} />
									<TextInput 
										style={[Styles.inputText, { flex: 1 }]} 
										placeholder='请输入邮箱验证码' 
										placeholderTextColor={Colors.huiCc}
										value={this.state.verifyCode}
										onChangeText={(value) => this.setState({ verifyCode: value })} />
								</View>
							)}

							{/* 发送验证码按钮 - 仅在第1步显示 */}
							{this.state.step === 1 && (
								<View style={{ marginTop: 20, alignItems: 'center' }}>
									<SmsCodeButton
										enable={this.state.account && this.state.account.includes('@')}
										onClick={this._SendVcode}
									/>
								</View>
							)}

							{/* 密码输入 - 仅在第2步显示 */}
							{this.state.step === 2 && (
								<>
									<View style={Styles.inputTextCont}>
										<Image
											resizeMode='contain'
											style={Styles.inputIcon}
											source={require('../../asserts/images/icons/icon_pwd_pressed.png')} />
										<TextInput 
											style={Styles.inputText} 
											placeholder='请输入新密码' 
											placeholderTextColor={Colors.huiCc} 
											secureTextEntry={true}
											value={this.state.password}
											onChangeText={(value) => this.setState({ password: value })} />
									</View>

									<View style={Styles.inputTextCont}>
										<Image
											resizeMode='contain'
											style={Styles.inputIcon}
											source={require('../../asserts/images/icons/icon_pwd_pressed.png')} />
										<TextInput 
											style={Styles.inputText} 
											placeholder='再次输入新密码' 
											placeholderTextColor={Colors.huiCc} 
											secureTextEntry={true}
											value={this.state.passwordAgain}
											onChangeText={(value) => this.setState({ passwordAgain: value })} />
									</View>
								</>
							)}
						</View>

						{this.state.step === 2 && (
							<View style={Styles.signInView}>
								<TouchableOpacity onPress={() => { this.userAddFunc() }} disabled={this.state.isLoading} >
									<View style={Styles.loginBtn} >
										<Text style={Styles.loginBtnText}>{this.state.isLoading ? "提交中..." : "重置密码"}</Text>
									</View>
								</TouchableOpacity>
							</View>
						)}
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
	user: state.user,
});

const mapDispatchToProps = dispatch => ({
	loginSuccess: userInfo => dispatch({ type: 'LOGINSUCCESS', payload: { userInfo } }),
	setUserInfo: payload => dispatch({ type: 'SET_USERINFO', payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ForgetPassword);

const Styles = StyleSheet.create({
	showWelcome: { marginBottom: 8, position: 'relative', justifyContent: 'center', alignItems: 'center' },
	loginTopView: { position: 'absolute', top: 60, left: 20, zIndex: 6, },
	loginTopImg: { width: Metrics.px2dp(240) },
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