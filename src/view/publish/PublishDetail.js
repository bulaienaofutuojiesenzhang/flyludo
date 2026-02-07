import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, RefreshControl, StatusBar, FlatList, Image, Text, TextInput, Pressable, Switch } from 'react-native';
import { View,  } from 'native-base';
import { Tab, TabView } from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import DatePicker from 'react-native-date-picker';
import Moment from 'moment';

import { Header, Loading, ToastService } from '../../component';
import Config from '../../config/index';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import ParamsValidate from '../../utils/ValueValidate';


class PublishDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      type: '',
      imgUrl: '',
      selectedCategory: '',
      name: '',
      desc: '',
      width: '',
      height: '',
      dateOpen: false,
      selectDate: new Date(),
      showData: '',
      tongyi: false,
      isSell: false,
      isCollect: false,
      isShow: false,
    }
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    console.log('详细：', this.props.route.params)
    const { params } = this.props.route;
    if (params) {
      this.setState((prevState) => ({
        ...prevState,  // 保留原 state 的其他数据
        ...params,     // 使用 params 中的字段来覆盖 state
      }));
    }
  }

  // 显示日期选择器
  showDatePicker = () => {
    this.setState({ dateOpen: true });
  };

  // 隐藏日期选择器
  hideDatePicker = () => {
    this.setState({ dateOpen: false });
  };

  // 确认选择的日期
  handleConfirm = (date) => {
    this.setState({ showData: date, selectDate: date, dateOpen: false });
  };

  handleToggle = (value) => {
    this.setState({isShow: value})
  };

  handleToggleisSell = (value) => {
    this.setState({isSell: value})
  };

  handleToggleisCollect = (value) => {
    this.setState({isCollect: value})
  };

  // 发布
  async toSubmintFunc() {
    console.log('toSubmintFunc', this.state)
    if (this.state.isLoading) {
      return false;
    }
    let isEmpty;
    let showData = Moment(this.state.showData).format('YYYY-MM-DD');
    isEmpty = ParamsValidate('isEmpty', showData);
    if (isEmpty !== null) {
      return ToastService.showToast({
        title: '请选择作品完成时间'
      })
    }

    isEmpty = ParamsValidate('isEmpty', this.state.desc);
    if (isEmpty !== null) {
      return ToastService.showToast({
        title: '请输入描述文字'
      })
    }

    let params = {
			"name": this.state.name,
      "type": Number(this.state.type),
      "dataUrl": this.state.imgUrl,
      "finishTime": showData,
      "desc": this.state.desc,
      "isSell": this.state.isSell?1:0,
      "isCollect": this.state.isCollect?1:0,
      "isShow": this.state.isShow?1:0
		}

    if (this.state.category && this.state.category !== '') {
      params.category = Number(this.state.category);
    }
    if (this.state.length && this.state.length !== '') {
      params.length = Number(this.state.length);
    }
    if (this.state.width && this.state.width !== '') {
      params.width = Number(this.state.width);
    }

    this.setState({ isLoading: true })
		Http('post', "/api/works/add", params).then(res => {
			this.setState({ isLoading: false })
			if (res.code === 200) {
				ToastService.showToast({ title: "发布成功！"});
        this.props.navigation.navigate('WorkList')
			}
		})

  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <DatePicker
          modal
          open={this.state.dateOpen}
          date={this.state.selectDate}
          onConfirm={this.handleConfirm}
          onCancel={this.hideDatePicker}
          locale="zh_CN"  // 设置为中文
          title="请选择时间" // 设置标题为中文
          confirmText="选择" // 设置确认按钮为中文
          cancelText="取消" // 设置取消按钮为中文
          mode="date"
        />
        <ScrollView style={{ flex: 1, paddingBottom: 20 }}>

          <View style={{ marginTop: 8, backgroundColor: Colors.bai, paddingBottom: 6 }}>
            <Pressable onPress={() => this.setState({ dateOpen: true })} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 60, paddingHorizontal: 10 }}>
              {
                this.state.showData ?
                  <Text style={{ color: Colors.hei2E }} >{Moment(this.state.showData).format('YYYY-MM-DD')}</Text>
                  :
                  <Text style={{ color: Colors.huiCc }} >请输入作品完成创作时间</Text>
              }

              <Icon name='right' />
            </Pressable>
          </View>

          <View style={{ marginTop: 8, backgroundColor: Colors.bai, paddingBottom: 20, paddingHorizontal: 10 }}>
            <Text style={{ lineHeight: 50, fontSize: Metrics.fontSize15 }}>作品描述</Text>
            <View style={{ borderWidth: 1, borderColor: Colors.huiCc, borderRadius: 10, borderStyle: 'dashed', }}>
              <TextInput style={Styles.inputText}
                multiline={true}  // 允许多行输入
                numberOfLines={4}  // 设置初始行数
                placeholder='点击输入文字' placeholderTextColor={Colors.huiCc}
                onChangeText={(value) => this.setState({ desc: value })} />
            </View>
          </View>

          <View style={{ marginTop: 8, backgroundColor: Colors.bai, paddingBottom: 20, paddingHorizontal: 10 }}>
            <Text style={{ lineHeight: 60, fontSize: Metrics.fontSize16 }}>作品主图</Text>

            <Pressable onPress={() => { this.toUpImgFunc() }}>
              <FastImage style={Styles.imgUrl} source={this.state.imgUrl ? { uri: Config.File_PATH + this.state.imgUrl } : require('../../asserts/images/publish/icon_add.png')} />
            </Pressable>
          </View>

          <View style={{ marginTop: 8, flex: 1, backgroundColor: Colors.bai, paddingHorizontal: 10, paddingBottom: 30 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 60, paddingHorizontal: 10, borderBottomColor: Colors.huiF5, borderBottomWidth: 1 }}>
              <Text style={{ color: Colors.hei2E }} >是否已被收藏</Text>
              <Switch
                trackColor={{ true: Colors.subjectQian }}
                thumbColor={this.state.isCollect ? Colors.subject : ""}
                onValueChange={this.handleToggleisCollect}
                value={this.state.isCollect}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 60, paddingHorizontal: 10, borderBottomColor: Colors.huiF5, borderBottomWidth: 1 }}>
              <Text style={{ color: Colors.hei2E }} >是否在个人主页展示</Text>
              <Switch
                trackColor={{ true: Colors.subjectQian }}
                thumbColor={this.state.isShow ? Colors.subject : ""}
                onValueChange={this.handleToggle}
                value={this.state.isShow}
              />
            </View>

            <View style={Styles.xieyiCont}>
							<TouchableOpacity style={Styles.yhXieyiClikCont} onPress={() => { this.setState({ tongyi: !this.state.tongyi }) }}>
								{
									this.state.tongyi ?
										<Image
											resizeMode='contain'
											style={Styles.xieyiIconSele}
											source={require('../../asserts/images/icons/icon_check_check.png')} />
										:
										<Image
											resizeMode='contain'
											style={Styles.xieyiIconSele}
											source={require('../../asserts/images/icons/icon_check_uncheck.png')} />
								}
							</TouchableOpacity>
							<Text style={Styles.yhXieyiText}> 本人承诺:所上传文件符合现行国家法律法规相关规定，并且上传文件内容为原创作品，如因作品权属问题发生争议，本人自愿承担相关责任。 </Text>
						</View>

            <TouchableOpacity onPress={() => { this.toSubmintFunc() }} style={{ marginTop: 30, backgroundColor: Colors.subject, height: 50, lineHeight: 50, borderRadius: 50, marginHorizontal: 10, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ textAlign: 'center', color: Colors.bai, fontSize: Metrics.fontSize14 }}>提交</Text>
            </TouchableOpacity>

          </View>



        </ScrollView>
      </View>
    );
  }

}


const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(PublishDetail);

const Styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row', // 水平布局
    alignItems: 'center', // 垂直居中
  },
  unitText: {
    fontSize: 16,
    marginLeft: 10, // 在单位和输入框之间添加间距
    color: '#333',
  },
  inputText: { textAlignVertical: 'top', height: 110, lineHeight: 52, paddingHorizontal: 10, fontSize: Metrics.fontSize16 },
  inputTextMe: { flex: 1, height: 52, lineHeight: 52, paddingHorizontal: 10, fontSize: Metrics.fontSize16 },
  imgUrl: { width: Metrics.px2dpi(300), height: Metrics.px2dpi(300), },
  yhXieyiText: { fontSize: Metrics.fontSize14, color: Colors.subject, },
  xieyiCont: { marginTop: 18, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start' },
  yhXieyiClikCont: { fontSize: Metrics.fontSize15, color: Colors.subject, textAlign: 'center', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  xieyiIconSele: { fontSize: 20, color: Colors.hui99, marginBottom: 2, width: 16, height: Metrics.px2dpi(54) },

});