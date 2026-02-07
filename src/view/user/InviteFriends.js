import React, { Component } from 'react';
import { StyleSheet,Image,Platform,PermissionsAndroid,TouchableOpacity, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { View, Toast, Text, } from 'native-base';
import QRCode from 'react-native-qrcode-svg';
// import {CameraRoll} from "@react-native-camera-roll/camera-roll";

import Swiper from 'react-native-swiper';

import { Colors, Metrics } from '../../theme';


class InviteFriends extends Component {

	constructor(props) {
		super(props);
		this.state = {
			baseUri: 'http://tongchengyouyue.com/?code=',
			isLoading: false,
		}
	}

	componentDidMount() {

	}
	
	// 保存图片
    async onRightPressSave() {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                  {
                    title: '申请存储权限！',
                    message: '申请存储权限，保存图片到相册！',
                    buttonNegative: '拒绝',
                    buttonPositive: '允许'
                  },
                );
                // return granted;
              } catch (err) {
                console.warn(err);
              }
        }

        if (!this.refs.shareViewShot) return;
        
        // captureRef(
        //     this.refs.shareViewShot, {
        //     format: 'jpg',
        //     quality: 1,
        //     result: "tmpfile"
        // })
        // .then(response => {
		// 	let imagePath = response;
		// 	console.log('imagePath', imagePath)
        //     var promise = CameraRoll.save(imagePath,{type: 'photo'});
        //     promise.then(function(result) {
        //         Toast.show({
        //             title: '图片保存成功',
        //             type: "success"
        //         })
        //     }).catch(function(error) {
        //         Toast.show({
        //             title: '请进行截图分享',
        //             type: "warning"
        //         })
        //     })

        // })
        // .catch(e => {
        //     console.error(e);
        // });
	}
	
	// 点击复制
    clipboardFunc(str) {
        str = str + '';
        // Clipboard.setString(str);
        // Toast.show({
        //     title: '复制成功',
        //     type: "success"
        // })
    }


	render() {
		let QRcodeUri = this.state.baseUri + this.props.inviteCode;
		return (
			<ScrollView>
				<View>

					<Text style={Styles.haibaosele}>
						选择海报
                	</Text>

					<View style={Styles.wrapperCont} ref="shareViewShot">
						<Swiper style={Styles.wrapper}
							dot={<View style={{ backgroundColor: 'rgba(0,0,0,.5)', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />}
							activeDot={<View style={{ backgroundColor: Colors.subject, width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3 }} />}
							paginationStyle={{
								bottom: -20
							}}
							loop>
							<TouchableOpacity activeOpacity={1} style={Styles.slide}>
								<Image resizeMode='stretch' style={Styles.inviteBackImg} source={require('../../asserts/images/publish/icon_invite_default.png')} />
								<Text style={{position: 'absolute',right: 10, top: 20, textAlign: 'center', color: Colors.bai}}>  </Text>
								<View style={Styles.posQrcode} >
									<QRCode
										value={QRcodeUri}
										size={80}
										quietZone={5}
									/>
									{/* <View style={Styles.posTextCon}>
										<Text style={Styles.qrtext1}> {this.props.inviteCode} </Text>
										<Text style={Styles.qrtext2}> 我的邀请码 </Text>
									</View> */}

								</View>
							</TouchableOpacity>

						</Swiper>
					</View>

					<View style={Styles.bottomContent}>
						<TouchableOpacity style={Styles.bottomClick} onPress={()=>{this.clipboardFunc(this.props.inviteCode)}}>
							<Text style={Styles.bottomText}>复制邀请码</Text>
						</TouchableOpacity>
						<TouchableOpacity style={Styles.bottomClick} onPress={()=>{this.clipboardFunc(QRcodeUri)}}>
							<Text style={Styles.bottomText}>复制邀请链接</Text>
						</TouchableOpacity>
					</View>

				</View>
			</ScrollView>
		);
	}
}

const mapStateToProps = state => ({
	isLogged: state.user.isLogged,
	token: state.user.token,
	nickName: state.user.nickName,
	head_portrait: state.user.head_portrait,
	inviteCode: state.user.inviteCode,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(InviteFriends);


const Styles = StyleSheet.create({
	titcontes: {
		height: 50,
		lineHeight: 50,
		backgroundColor: '#F0F0F8',
		flexDirection: "row",
		justifyContent: 'center',
		alignItems: "center",
	},
	fontme: {
		color: '#666666',
		fontSize: 12,
	},
	yaoqicode: {
		color: '#007AFF',
		fontSize: 18,
		marginRight: 15
	},
	titbtnpad: {
		padding: 15,
		paddingTop: 1,
		paddingBottom: 1,
		fontSize: 10
	},
	haibaosele: {
		marginTop: 10,
		marginBottom: 6,
		lineHeight: 30,
		fontSize: 14,
		textAlign: 'center',
		color: '#666666'
	},
	wrapperCont: {
		backgroundColor: 'transparent',
		marginLeft: 25,
		width: Metrics.screenWidth - 50,
		height: (Metrics.screenWidth - 50) * 1.75,
		paddingBottom: 0
	},
	wrapper: {
		height: (Metrics.screenWidth - 50) * 1.75,
	},
	slide: {
		height: (Metrics.screenWidth - 50) * 1.75,
		justifyContent: 'center',
		position: 'relative',
	},
	inviteBackImg: {
		width: Metrics.screenWidth - 50,
		height: (Metrics.screenWidth - 50) * 1.75,
		flex: 1
	},
	posQrcode: {
		position: 'absolute',
		bottom: 50,
		right: 30,
		flexDirection: "row",
		justifyContent: 'center',
		alignItems: "center",
	},
	posTextCon: {
		backgroundColor: 'rgba(30,30,30,0.3)',
		height: 66,
		marginLeft: 1,
		paddingLeft: 6,
		paddingRight: 6
	},
	qrtext1: {
		lineHeight: 35,
		color: '#fff',
		fontSize: 15
	},
	qrtext2: {
		color: '#fff',
		fontSize: 11
	},
	bottomContent: {
		marginTop: 28,
		flexDirection: "row",
		justifyContent: 'space-between',
		alignItems: "center",
	},
	bottomClick:{
		width: Metrics.screenWidth/2-1,
		height: 50,
		lineHeight: 50,
		backgroundColor: Colors.subject,
	},
	bottomText: {
		lineHeight: 50,
		textAlign: "center",
		color: Colors.bai
	}
});



