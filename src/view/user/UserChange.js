import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { View, Toast, Text } from 'native-base';
import { ListItem, Avatar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather';
import { connect } from 'react-redux';
import Moment from 'moment';

import { Loading, ToastService, MyAlert } from '../../component';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';


class UserChange extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			titleText: '修改',
			myInputText: '',
			mySelectSex: 0,
		}
	}


	UNSAFE_componentWillMount() {

	}

	componentDidMount() {
		console.log('详细信息：', this.props.route.params)
		switch (this.props.route.params.type) {
			case 1:
				this.setState({ titleText: '修改昵称', myInputText: this.props.user.name })
				break;
			case 2:
				this.setState({ titleText: '修改简介', myInputText: this.props.user.desc })
				break;
				case 3:
				this.setState({ titleText: '修改性别', mySelectSex: this.props.user.gender })
				break;
			default:
				break;
		}
	}

	// 获取用户数据
	changeUserInfoFunc() {
		let obj = {}
		if (this.props.route.params.type == 1) {
			if (this.state.myInputText.length > 8) {
				ToastService.showToast({ title: "信息过长，最多8个字符!" });
				return
			}
			obj = {name: this.state.myInputText}
		}
		if (this.props.route.params.type == 2) {
			if (this.state.myInputText.length > 28) {
				ToastService.showToast({ title: "信息过长，最多28个字符!" });
				return
			}
			obj = {desc: this.state.myInputText}
		}

		if (this.props.route.params.type == 3) {
			if (!this.state.mySelectSex) {
				ToastService.showToast({ title: "请选择性别!" });
				return
			}
			obj = {gender: this.state.mySelectSex}
		}
		
		this.setState({ isLoading: true })
		// 使用新的API接口 - PUT /profile
		Http('put', "/users/profile", obj).then(res => {
			this.setState({ isLoading: false })
			if (res.code === 200) {
				// 更新Redux中的用户信息
				if (res.data) {
					// 根据返回的完整用户数据更新
					this.props.setUserInfo(res.data);
				} else {
					// 如果没有返回完整数据，只更新修改的字段
					if (this.props.route.params.type == 1) {
						this.props.setUserInfo({ name: this.state.myInputText });
					}
					if (this.props.route.params.type == 2) {
						this.props.setUserInfo({ desc: this.state.myInputText });
					}
					if (this.props.route.params.type == 3) {
						this.props.setUserInfo({ gender: this.state.mySelectSex });
					}
				}
				ToastService.showToast({ title: '修改成功!' })
				this.props.navigation.goBack();
			}
		})
	}

	render() {
		return (
			<View style={Styles.container}>
				<Loading showLoading={this.state.isLoading} />
				<View style={Styles.content}>
					{
						this.props.route.params.type == 3?
						<View style={{ backgroundColor: Colors.bai, paddingHorizontal: 10, paddingVertical: 5}}>
							<TouchableOpacity onPress={()=> { this.setState({mySelectSex: 1}) }} style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
								<Text>男</Text>
								<View>
								{
										this.state.mySelectSex == 1 && <Icon name="check" size={20} color={Colors.subject} />
									}
								</View>
							</TouchableOpacity>
							<View style={{ borderTopColor: Colors.huiF5, borderTopWidth: 1 }}> </View>
							<TouchableOpacity onPress={()=> { this.setState({mySelectSex: 2}) }} style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
								<Text>女</Text>
								<View>
									{
										this.state.mySelectSex == 2 && <Icon name="check" size={20} color={Colors.subject} />
									}
								</View>
							</TouchableOpacity>
						</View>
						:
						<TextInput style={{ textAlignVertical: 'top', flex: 1, backgroundColor: Colors.huiFB, paddingHorizontal: 6, paddingVertical: 8, borderRadius: 10 }} 
						multiline={true} 
						numberOfLines={8}
						value={this.state.myInputText}
						onChangeText={(value) => this.setState({ myInputText: value })}
						placeholder="~ . ~" />
					}
					
				</View>
				<TouchableOpacity onPress={() => { this.changeUserInfoFunc() }} style={{ marginTop: 30, backgroundColor: Colors.subject, height: 50, lineHeight: 50, borderRadius: 50, marginHorizontal: 10, justifyContent: 'center', alignItems: 'center' }}>
					<Text style={{ textAlign: 'center', color: Colors.bai, fontSize: Metrics.fontSize14 }}> {this.state.titleText} </Text>
				</TouchableOpacity>
			</View>
		);
	}

}

const mapStateToProps = state => ({
	isLogged: state.user.isLogged,
	token: state.user.token,
	user: state.user
});

const mapDispatchToProps = dispatch => ({
	setUserInfo: payload => dispatch({ type: 'SET_USERINFO', payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserChange);

const Styles = StyleSheet.create({
	container: { flex: 1 },
	content: { height: 288, paddingBottom: 20, paddingHorizontal: 18, marginTop: 18 },
});