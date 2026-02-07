import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Text, StatusBar, Modal, ScrollView, FlatList } from 'react-native';
import { View } from 'native-base';
import { connect } from 'react-redux';
import Icons from 'react-native-vector-icons/AntDesign';

import { Header, ToastService, Loading } from '../../component';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import ParamsValidate from '../../utils/ValueValidate';


class ProblemBack extends Component {
	constructor(props) {
		super(props);
		this.state = {
			title: '',
			content: '',
			isLoading: false,
			showMyFeedbackModal: false,
			myFeedbackList: [],
		}
	}

	componentDidMount() {
	}

	// 获取我的反馈
	getMyFeedback = () => {
		this.setState({ isLoading: true })
		Http('get', '/message/my').then(res => {
			this.setState({ isLoading: false })
			console.log('反馈数据:', res)
			console.log('反馈列表:', res.data?.messages)
			if (res.code === 200) {
				const feedbackList = res.data?.messages || [];
				console.log('设置列表长度:', feedbackList.length)
				this.setState({ 
					myFeedbackList: feedbackList,
					showMyFeedbackModal: true 
				}, () => {
					console.log('状态更新后的列表:', this.state.myFeedbackList)
				})
			} else {
				ToastService.showToast({
					title: res.message || '获取失败'
				})
			}
		}).catch(err => {
			this.setState({ isLoading: false })
			console.log('获取失败', err)
			ToastService.showToast({
				title: '网络错误，请重试'
			})
		})
	}


	// 数据提交
	submitFunc() {
		let { title, content } = this.state;

		// 验证标题
		let titleMsg = ParamsValidate('isEmpty', title);
		if (titleMsg !== null) {
			ToastService.showToast({
				title: '请输入标题'
			})
			return;
		}

		if (title.length > 100) {
			ToastService.showToast({
				title: '标题不能超过100个字符'
			})
			return;
		}

		// 验证内容
		let contentMsg = ParamsValidate('isEmpty', content);
		if (contentMsg !== null) {
			ToastService.showToast({
				title: '请输入内容'
			})
			return;
		}

		if (content.length > 500) {
			ToastService.showToast({
				title: '内容不能超过500个字符'
			})
			return;
		}

		this.setState({ isLoading: true })
		Http('post', "/message/post", {
			title: title,
			content: content
		}).then(res => {
			this.setState({ isLoading: false })
			if (res.code === 200) {
				ToastService.showToast({
					title: '提交成功!'
				})
				this.props.navigation.goBack();
			} else {
				ToastService.showToast({
					title: res.message || '提交失败，请重试'
				})
			}
		}).catch(err => {
			this.setState({ isLoading: false })
			console.log('提交失败', err)
			ToastService.showToast({
				title: '网络错误，请重试'
			})
		})
	}

	// 格式化时间
	formatTime = (timeString) => {
		if (!timeString) return '';
		const date = new Date(timeString);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day} ${hours}:${minutes}`;
	}

	// 获取状态文本
	getStatusText = (status) => {
		const statusMap = {
			'pending': '待处理',
			'resolved': '已处理',
			'rejected': '已拒绝'
		};
		return statusMap[status] || status;
	}

	// 获取状态颜色
	getStatusColor = (status) => {
		const colorMap = {
			'pending': Colors.hui99,
			'resolved': Colors.subject,
			'rejected': Colors.hong
		};
		return colorMap[status] || Colors.hui99;
	}

	// 渲染反馈列表项
	renderFeedbackItem = ({ item, index }) => {
		console.log('渲染列表项 - index:', index, 'item:', item)
		
		if (!item) {
			console.log('item 为空！')
			return null
		}

		return (
			<View style={Styles.feedbackItem}>
				<View style={Styles.feedbackHeader}>
					<Text style={Styles.feedbackTitle}>{item.title || '无标题'}</Text>
					<View style={Styles.feedbackHeaderRight}>
						<Text style={[Styles.feedbackStatus, { color: this.getStatusColor(item.status) }]}>
							{/* {this.getStatusText(item.status)} */}
						</Text>
					</View>
				</View>
				<Text style={Styles.feedbackTime}>{this.formatTime(item.createTime)}</Text>
				<Text style={Styles.feedbackContent}>{item.content || '无内容'}</Text>
				{item.reviewComment && (
					<View style={Styles.replyContainer}>
						<View style={Styles.replyHeader}>
							<Text style={Styles.replyLabel}>客服回复</Text>
							{item.reviewTime && (
								<Text style={Styles.replyTime}>{this.formatTime(item.reviewTime)}</Text>
							)}
						</View>
						<Text style={Styles.replyContent}>{item.reviewComment}</Text>
					</View>
				)}
			</View>
		)
	}

	render() {
		const { showMyFeedbackModal, myFeedbackList } = this.state;
		console.log('Render - 弹窗状态:', showMyFeedbackModal)
		console.log('Render - 列表数据:', myFeedbackList)

		return (
			<View style={{ flex: 1, backgroundColor: Colors.bai }}>
				<StatusBar barStyle="dark-content" backgroundColor="white" />
				<Loading showLoading={this.state.isLoading} />
				<Header 
					title="反馈与建议" 
					isTabBar={false}
					onLeftPress={() => this.props.navigation.goBack()}
					rightText="我的反馈"
					rightStyle={{ fontSize: Metrics.fontSize14, color: Colors.subject }}
					onRightPress={this.getMyFeedback}
				/>
				<View style={{ flex: 1 }}>
					<View style={Styles.contents}>
						<Text style={Styles.titles}>
							标题
							<Text style={Styles.bitian}> * </Text>
						</Text>
						<TextInput
							style={Styles.inputText}
							placeholder='请输入标题（最多100字符）'
							placeholderTextColor={Colors.huiCc}
							value={this.state.title}
							maxLength={100}
							onChangeText={(value) => this.setState({ title: value })}
						/>
						<Text style={Styles.charCount}>{this.state.title.length}/100</Text>

						<Text style={Styles.titles}>
							内容
							<Text style={Styles.bitian}> * </Text>
						</Text>
						<View style={Styles.textAreaContainer}>
							<TextInput
								style={Styles.textArea}
								multiline={true}
								numberOfLines={8}
								placeholder="请输入您的反馈或建议（最多500字符）"
								placeholderTextColor={Colors.huiCc}
								value={this.state.content}
								maxLength={500}
								textAlignVertical="top"
								onChangeText={(value) => this.setState({ content: value })}
							/>
						</View>
						<Text style={Styles.charCount}>{this.state.content.length}/500</Text>

						<TouchableOpacity 
							onPress={() => { this.submitFunc() }} 
							style={Styles.submitButton}
						>
							<Text style={Styles.submitButtonText}>提交反馈</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* 我的反馈弹窗 */}
				<Modal
					visible={showMyFeedbackModal}
					transparent={true}
					animationType="slide"
					onRequestClose={() => this.setState({ showMyFeedbackModal: false })}
				>
					<View style={Styles.modalOverlay}>
						<View style={Styles.modalContainer}>
							<View style={Styles.modalHeader}>
								<Text style={Styles.modalTitle}>我的反馈</Text>
								<TouchableOpacity 
									onPress={() => this.setState({ showMyFeedbackModal: false })}
									style={Styles.modalClose}
								>
									<Icons name="close" size={24} color={Colors.hui66} />
								</TouchableOpacity>
							</View>

							<FlatList
								data={myFeedbackList}
								renderItem={this.renderFeedbackItem}
								keyExtractor={(item, index) => {
									console.log('FlatList item:', item, 'index:', index)
									return item._id || index.toString()
								}}
								style={Styles.feedbackList}
								contentContainerStyle={{ paddingBottom: 20 }}
								ListEmptyComponent={
									<View style={Styles.emptyContainer}>
										<Text style={Styles.emptyText}>暂无反馈记录</Text>
									</View>
								}
							/>
						</View>
					</View>
				</Modal>
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

export default connect(mapStateToProps, mapDispatchToProps)(ProblemBack);

const Styles = StyleSheet.create({
	contents: { 
		flex: 1, 
		padding: 20, 
		backgroundColor: Colors.huiF5, 
	},
	titles: { 
		fontSize: Metrics.fontSize15, 
		marginTop: 20,
		marginBottom: 10,
		color: Colors.hei2E,
		fontWeight: 'bold',
	},
	bitian: { 
		fontSize: 12, 
		color: Colors.hong, 
	},
	inputText: { 
		fontSize: Metrics.fontSize15, 
		paddingHorizontal: 15,
		paddingVertical: 12,
		backgroundColor: Colors.bai, 
		borderRadius: 8,
		borderWidth: 1,
		borderColor: Colors.huiCc,
		color: Colors.hei2E,
	},
	textAreaContainer: {
		backgroundColor: Colors.bai,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: Colors.huiCc,
		minHeight: 160,
	},
	textArea: { 
		fontSize: Metrics.fontSize15, 
		paddingHorizontal: 15,
		paddingVertical: 12,
		minHeight: 160,
		color: Colors.hei2E,
	},
	charCount: {
		fontSize: Metrics.fontSize12,
		color: Colors.hui99,
		textAlign: 'right',
		marginTop: 5,
	},
	submitButton: {
		marginTop: 40,
		backgroundColor: Colors.subject,
		height: 50,
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 4,
	},
	submitButtonText: {
		textAlign: 'center',
		color: Colors.bai,
		fontSize: Metrics.fontSize16,
		fontWeight: 'bold',
	},
	// 弹窗样式
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	modalContainer: {
		backgroundColor: Colors.bai,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		height: Metrics.screenHeight * 0.75,
		paddingBottom: 20,
	},
	modalHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: Colors.huiCc,
		position: 'relative',
	},
	modalTitle: {
		fontSize: Metrics.fontSize18,
		fontWeight: 'bold',
		color: Colors.hei2E,
	},
	modalClose: {
		position: 'absolute',
		right: 15,
		padding: 5,
	},
	feedbackList: {
		paddingHorizontal: 15,
	},
	feedbackItem: {
		backgroundColor: Colors.huiF9,
		borderRadius: 10,
		padding: 15,
		marginTop: 15,
	},
	feedbackHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 5,
	},
	feedbackHeaderRight: {
		marginLeft: 10,
	},
	feedbackTitle: {
		fontSize: Metrics.fontSize16,
		fontWeight: 'bold',
		color: Colors.hei2E,
		flex: 1,
		marginRight: 10,
	},
	feedbackStatus: {
		fontSize: Metrics.fontSize12,
		fontWeight: '500',
	},
	feedbackTime: {
		fontSize: Metrics.fontSize12,
		color: Colors.hui99,
		marginBottom: 8,
	},
	feedbackContent: {
		fontSize: Metrics.fontSize14,
		color: Colors.hui66,
		lineHeight: 22,
	},
	replyContainer: {
		backgroundColor: Colors.bai,
		borderRadius: 8,
		padding: 12,
		marginTop: 10,
		borderLeftWidth: 3,
		borderLeftColor: Colors.subject,
	},
	replyHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	replyLabel: {
		fontSize: Metrics.fontSize13,
		fontWeight: 'bold',
		color: Colors.subject,
	},
	replyTime: {
		fontSize: Metrics.fontSize11,
		color: Colors.hui99,
	},
	replyContent: {
		fontSize: Metrics.fontSize14,
		color: Colors.hei2E,
		lineHeight: 20,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 80,
	},
	emptyText: {
		fontSize: Metrics.fontSize15,
		color: Colors.hui99,
	},
});