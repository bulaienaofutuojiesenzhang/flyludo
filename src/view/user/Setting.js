import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, Alert, Share, NativeModules, DeviceEventEmitter, Linking, Pressable } from 'react-native';
import { View, Toast, Text, Switch, Modal, FormControl, Input, Button } from 'native-base';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import { CommonActions } from '@react-navigation/native';

import { Header, ToastService, Loading } from '../../component';
import { Colors, Metrics } from '../../theme';
import Config from '../../config/index';
import AsyncStorage from '../../utils/AsyncStorage';
import Http from '../../utils/HttpPost';


class Setting extends Component {
	constructor(props) {
		super(props)
		this.state = {
			isLoading: false,
			rewarded: false,
			interstitial: false,
			adIndex: 0,
			isSwitchOn: false,
			showModal: false,
			dizhiurl: '',
		}
	}

	UNSAFE_componentWillReceiveProps(nextProps) {

	}

	// 闪屏触发
	componentDidMount() {
		this.setState({ isSwitchOn: this.props.global.lingsheng })
		this.initFunc();
	}

	initFunc() {

	}



	componentWillUnmount() {

	}

	//  路由地址
	toNavigateFunc(uri) {
		this.props.navigation.navigate(uri)
	}

	//   分享
	async shareFunc() {
		let str = 'http://tongchengyouyue.com/';
		try {
			const result = await Share.share({
				title: '同城有约',
				message: '就是同城有约都用它',
				url: str
			})

			if (result.action === Share.sharedAction) {
				if (result.activityType) {
					// shared with activity type of result.activityType
				} else {
					// shared
				}
			} else if (result.action === Share.dismissedAction) {
				// dismissed
			}
		} catch (error) {
			Toast.show({
				title: '分享失败!' + error.message,
				type: "warning"
			})
		}
	}


	/**
	 * 退出登录
	 */
	loginOutFunc() {
		this.props.logout();
		AsyncStorage.setItem("jwToken", "").then((res) => {

			this.props.navigation.dispatch(
				CommonActions.reset({
				  index: 0, // 默认显示的页面索引
				  routes: [{ name: 'Login' }], // 新的路由栈
				})
			  );

			// this.props.navigation.replace('Login');
			// 	Http('post','/user/logout',{
			//   	}).then(res => {
			// 	Alert.alert(
			// 		'提示',
			// 		'退出成功！',
			// 		[
			// 		{text: '确定', onPress: () => {
			// 			_this.props.navigation.goBack()
			// 		}},
			// 		],
			// 		{ cancelable: false }
			// 	)
			//   })
		})
	}


	setShowModal(bloo) {
		this.setState({ showModal: bloo })
	}

	changgePublish() {
		AsyncStorage.setItem("testUrl", this.state.dizhiurl).then((res) => {
			this.setShowModal(false);
		})
	}


	testChanggePublish() {
		console.log('@@@.@@@')
		Http('get', this.state.dizhiurl+`/api/user/test`).then(res => {
				ToastService.showToast({
						  title: res.msg
						})
			  })
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				<Loading showLoading={this.state.isLoading} />
				<View style={Styles.container}>
					<View style={Styles.blockBack}>
						{/* <TouchableOpacity style={Styles.blockBack} onPress={() => this.toNavigateFunc('CunzhengPassword')}>
							<View style={Styles.cardStyle}>
								<Text style={Styles.labelTxt}>存证密码</Text>
								<Icon name="angle-right" style={Styles.rightIcons} />
							</View>
						</TouchableOpacity> */}
						<TouchableOpacity style={Styles.blockBack} onPress={() => this.toNavigateFunc('ForgetPassword')}>
							<View style={Styles.cardStyle}>
								<Text style={Styles.labelTxt}>忘记密码</Text>
								<Icon name="angle-right" style={Styles.rightIcons} />
							</View>
						</TouchableOpacity>
						{/* <TouchableOpacity style={Styles.blockBack} onPress={() => this.toNavigateFunc('ProblemBack')}>
							<View style={Styles.cardStyle}>
								<Text style={Styles.labelTxt}>反馈与建议</Text>
								<Icon name="angle-right" style={Styles.rightIcons} />
							</View>
						</TouchableOpacity> */}

						{/* <TouchableOpacity style={Styles.blockBack} onPress={() => this.shareFunc()}>
							<View style={Styles.cardStyle}>
								<Text style={Styles.labelTxt}>分享APP</Text>
								<Icon name="angle-right" style={Styles.rightIcons} />
							</View>
						</TouchableOpacity> */}
						
						{/* <TouchableOpacity style={Styles.blockBack} onPress={() => this.toNavigateFunc('Login')}>
							<View style={Styles.cardStyle}>
								<Text style={Styles.labelTxt}>重新登录</Text>
								<Icon name="angle-right" style={Styles.rightIcons} />
							</View>
						</TouchableOpacity> */}

						{/* <TouchableOpacity style={Styles.blockBack} onPress={() => this.toNavigateFunc('Zhuxiao')}>
							<View style={Styles.cardStyle}>
								<Text style={Styles.labelTxt}>用户注销</Text>
								<Icon name="angle-right" style={Styles.rightIcons} />
							</View>
						</TouchableOpacity> */}


						<TouchableOpacity style={Styles.blockBack} >
							<View style={Styles.cardStyle}>
								<Text style={Styles.labelTxt}>版本</Text>
								<Text style={{ color: '#aab9ca', fontSize: 16 }}>
									{
										`${Config.Env === 'dev' ? Config.Env : ''} ${Config.Version.version}.${Config.Version.versionNum}`
									}
								</Text>
							</View>
						</TouchableOpacity>

					</View>

					<View style={{ marginTop: 8, marginBottom: 18 }}>
						<View style={Styles.signOutView}>
							<TouchableOpacity onPress={() => this.loginOutFunc()} >
								<View style={[Styles.loginBtn]} colors={[Colors.subject, Colors.subject]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
									<Text style={{ fontSize: 12, padding: 12, color: Colors.bai }}>退出登录</Text>
								</View>
							</TouchableOpacity>
						</View>
						<View style={Styles.textCongh}>
							<Text style={{ color: Colors.subject, fontSize: 12, textDecorationLine: 'underline' }} onPress={() => this.toNavigateFunc('Yonghuxieyi')}>用户协议 </Text>
							<Text style={{ color: Colors.subject, fontSize: 12 }}> | </Text>
							<Text style={{ color: Colors.subject, fontSize: 12, textDecorationLine: 'underline' }} onPress={() => this.toNavigateFunc('Yinsixieyi')}> 隐私政策</Text>
						</View>
						<Pressable onLongPress={() => { this.setShowModal(true) }} >
							<Text style={{ color: Colors.subject, fontSize: 12, textAlign: 'center', marginTop: 10 }}>同城有约 Copyright 2019-2026.All Right Reserved.</Text>
						</Pressable>
					</View>
					{/* <BannerAd
						unitId={BANNERadUnitId}
						size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
					/> */}
				</View>


				<Modal isOpen={this.state.showModal} onClose={() => this.setShowModal(false)}>
					<Modal.Content maxWidth="400px">
						<Modal.CloseButton />
						<Modal.Header>Developer Options</Modal.Header>
						<Modal.Body>
							<FormControl mb="5">
								<FormControl.Label>Config Url</FormControl.Label>
								<Input onChangeText={(value) => this.setState({ dizhiurl: value })} />
							</FormControl>
						</Modal.Body>
						<Modal.Footer>
							<Button.Group space={2}>

								<Button variant="ghost" colorScheme="blueGray" onPress={() => {
									this.testChanggePublish()
								}}>
									Test
								</Button>

								<Button onPress={() => {
									this.changgePublish()
								}}>
									Save
								</Button>
							</Button.Group>
						</Modal.Footer>
					</Modal.Content>
				</Modal>

			</View>
		)
	}
}

const mapStateToProps = state => ({
	isLogged: state.user.isLogged,
	userId: state.user.id,
	user: state.user,
	global: state.global,
});

const mapDispatchToProps = dispatch => ({
	logout: () => dispatch({ type: 'LOGOUT' }),
	setGlobalInfo: globalInfo => dispatch({ type: 'SET_GLOBALINFO', payload: globalInfo }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Setting);

const Styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "space-between" },
	blockBack: { backgroundColor: 'white'},
	cardStyle: {
		height: 50,
		marginLeft: 15,
		paddingRight: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderBottomWidth: 1,
		borderColor: Colors.huiF5,
	},
	leftIcons: { color: '#aab9ca', fontSize: 20 },
	labelTxt: { color: "#666666", fontSize: 14 },
	rightIcons: { color: '#aab9ca', fontSize: 20 },
	signOutView: { marginTop: 58, justifyContent: 'center', alignItems: "center" },
	textCongh: { flexDirection: "row", marginTop: 18, justifyContent: "center", alignItems: "center", },
	loginBtn: { width: Metrics.screenWidth * 0.6, alignItems: "center", borderRadius: 8, backgroundColor: Colors.subject },
});



