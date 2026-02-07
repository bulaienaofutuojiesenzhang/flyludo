import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Image, Text, StatusBar } from 'react-native';
import { View, Toast } from 'native-base';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';

import Config from '../../config/index';
import { Header,ToastService,  Loading } from '../../component';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import HttpFrom from '../../utils/HttpFrom';
import ParamsValidate from '../../utils/ValueValidate';


class CausMens extends Component {
	constructor(props) {
		super(props);
		this.state = {
			wentiType: '',
			wentiDescribe: '',
			updataImg1: '',
			updataImg2: '',
			updataImg3: '',
			isLoading: false,
		}
	}


	UNSAFE_componentWillMount() {

	}

	componentDidMount() {
	}


	render() {
		return (
			<View style={{ flex: 1 }}>
				<Loading showLoading={this.state.isLoading} />
				<View style={{ flex: 1 }}>
					<View style={Styles.contents}>
						<View style={Styles.tipSection}>
							<Text style={Styles.tipTitle}>📞 联系我们</Text>
							<Text style={Styles.tipText}>感谢您使用同城有约！如有任何问题或建议，欢迎通过以下方式联系我们：</Text>
						</View>

						<TouchableOpacity 
							style={Styles.feedbackBtn}
							onPress={() => this.props.navigation.navigate('ProblemBack')}
						>
							<View style={Styles.feedbackBtnContent}>
								<Icon name="create-outline" size={24} color="#fff" />
								<Text style={Styles.feedbackBtnText}>问题反馈与建议</Text>
							</View>
							<Icon name="chevron-forward" size={24} color="#fff" />
						</TouchableOpacity>

						<View style={Styles.contactSection}>
							<View style={Styles.contactItem}>
								<Icon name="mail-outline" size={20} color="#666" />
								<Text style={Styles.contactText}>邮箱：support@tongchengyouyue.com</Text>
							</View>
							<View style={Styles.contactItem}>
								<Icon name="time-outline" size={20} color="#666" />
								<Text style={Styles.contactText}>工作时间：周一至周五 9:00-18:00</Text>
							</View>
						</View>

						<View style={Styles.jietuGroup}>
							{/* <Image style={Styles.jietuImg} source={require('../../asserts/images/user/yikakefu.jpg')} /> */}
						</View>
						
						<Text style={{ color: Colors.hui99, fontSize: 12, textAlign: 'center', marginTop: 30 }}>同城有约 Copyright 2019-2026.All Right Reserved.</Text>
					</View>
				</View>
			</View>
		);
	}

}

const mapStateToProps = state => ({
	isLogged: state.user.isLogged,
	token: state.user.token,
	global: state.global,
});

const mapDispatchToProps = dispatch => ({
	setGlobalInfo: globalInfo => dispatch({ type: 'SET_GLOBALINFO', payload: { globalInfo } }),
});

export default connect(mapStateToProps, mapDispatchToProps)(CausMens);

const Styles = StyleSheet.create({
	contents: { flex: 1, padding: 20, backgroundColor: Colors.huiF0, },
	tipSection: {
		backgroundColor: Colors.bai,
		borderRadius: 12,
		padding: 20,
		marginBottom: 20,
	},
	tipTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 12,
	},
	tipText: {
		fontSize: 14,
		color: '#666',
		lineHeight: 22,
	},
	feedbackBtn: {
		backgroundColor: '#CB9869',
		borderRadius: 12,
		padding: 18,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
		shadowColor: '#CB9869',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 5,
	},
	feedbackBtnContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	feedbackBtnText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#fff',
	},
	contactSection: {
		backgroundColor: Colors.bai,
		borderRadius: 12,
		padding: 20,
		marginBottom: 20,
	},
	contactItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 15,
		gap: 12,
	},
	contactText: {
		fontSize: 14,
		color: '#666',
	},
	signInView: { marginTop: 28, marginBottom: 28, alignItems: "center" },
	loginBtn: { width: Metrics.screenWidth * 0.6, alignItems: "center", borderRadius: 8 },
	inputText: { fontSize: 14, marginTop: 10, padding: 6, textAlign: 'center', paddingVertical: 10, backgroundColor: Colors.bai, borderRadius: 10 },
	multilineText: { fontSize: 14, height: 160, marginTop: 18, padding: 6, textAlign: 'center', backgroundColor: Colors.bai },
	titles: { fontSize: 14, marginTop: 18 },
	bitian: { fontSize: 12, color: Colors.hong, },
	xuantian: { fontSize: 12, color: Colors.hui99, },
	jietuGroup: { marginTop: 18, flexDirection: "row", justifyContent: "center", alignItems: "center", },
	jietuImg: { width: Metrics.px2dp(300), height: Metrics.px2dp(300), borderRadius: Metrics.px2dp(10), },
	xiangceImgBlock: { width: Metrics.px2dp(180), height: Metrics.px2dp(250), borderRadius: Metrics.px2dp(20), backgroundColor: Colors.bai, marginRight: Metrics.px2dp(10), justifyContent: 'center', alignItems: 'center' },
});