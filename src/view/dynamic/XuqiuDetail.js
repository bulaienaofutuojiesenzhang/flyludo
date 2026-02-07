import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, RefreshControl, StatusBar, FlatList, Image, Text, KeyboardAvoidingView, TextInput } from 'react-native';
import { View, Toast } from 'native-base';
import { Tab, TabView } from 'react-native-elements';
import RenderHtml from 'react-native-render-html';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Moment from 'moment';

import Config from '../../config/index';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import FeedbackSection from '../../component/FeedbackSection';
import CommentsList from '../../component/CommentsList';

class XuqiuDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      detailObj: {},

      hasMore: true,
      comments: [],
      pageNoPl: 1,
      totalCountPl: 0,
    }
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    console.log('详细：', this.props.route.params)
    this.setState({ detailObj: this.props.route.params })
    this.initFunc()
    this.fetchComments();

  }

  // 获取数据
  initFunc() {
    this.setState({ isLoading: true })
    Http('get', `/api/need/browse/${this.props.route.params.id}`).then(res => {
      this.setState({ isLoading: false, refreshLoading: false })
      if (res.code === 200) {
      }
    })
  }

  // 处理滚动到底部的逻辑
  handleScrollEnd = (event) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollOffset = event.nativeEvent.contentOffset.y;
    const visibleHeight = event.nativeEvent.layoutMeasurement.height;

    if (contentHeight - scrollOffset <= visibleHeight + 50) {
      console.log(11111)
      if (!this.state.hasMore) return;
      this.setState((prevState) => ({
        pageNoPl: prevState.pageNoPl + 1, // 原数据加 1
      }), () => { this.fetchComments() });
    }
  };

  // 获取评论列表
  fetchComments = async (bloo) => {
    console.log('hasMore', this.state.hasMore, bloo);
    if (!this.state.hasMore && !bloo ) return;
    let pageSize = 10;
    this.setState({ isLoading: true })

    try {
      const res = await Http('get', `/api/review/list/data/${this.state.pageNoPl}/${pageSize}`, {dataId: this.props.route.params.id});
      this.setState({ isLoading: false })

      if (res.code === 200) {
        const newComments = res.data.list || [];
        if (bloo) {
          this.setState(prevState => ({
            comments: newComments,
            hasMore: newComments.length === pageSize,
            totalCountPl: res.data.total_count
          }));
        } else {
          this.setState(prevState => ({
            comments: [...prevState.comments, ...newComments],
            hasMore: newComments.length === pageSize,
            totalCountPl: res.data.total_count
          }));
        }
      } else {
        this.setState({ isLoading: false, hasMore: false })
      }
    } catch (error) {
      this.setState({ isLoading: false, hasMore: false })
      console.error('Error fetching comments:', error);
    }
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} onScrollEndDrag={this.handleScrollEnd} >
          <StatusBar barStyle="dark-content" backgroundColor="white" />
          <FastImage style={Styles.bannerImg} source={this.state.detailObj.imgUrl ? { uri: Config.File_PATH + this.state.detailObj.imgUrl } : require('../../asserts/images/publish/plc_collect_home.png')} />
          <View style={{}}>

            <View style={{ backgroundColor: Colors.bai, paddingHorizontal: 10, paddingVertical: 10, flexDirection: 'column', }}>
              <Text style={Styles.title}>{this.state.detailObj.title}</Text>
              <Text style={Styles.abstract}>{this.state.detailObj.solicitor}</Text>
              <Text style={Styles.abstract}>{this.state.detailObj.desc}</Text>
            </View>
            <View style={{ backgroundColor: Colors.bai, paddingHorizontal: 10, paddingVertical: 10, flexDirection: 'column', alignItems: 'flex-start', marginTop: 10 }}>
              {
                this.state.detailObj.content ?
                  <RenderHtml
                    contentWidth={300}
                    source={{ html: this.state.detailObj.content }}
                  />
                  :
                  <></>
              }
            </View>
            <View style={{ backgroundColor: Colors.bai, paddingHorizontal: 10, paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <View style={{}}>
                <Text>开始时间：{Moment(this.state.detailObj.createTime).format('YYYY-MM-DD HH:mm')}</Text>
                {
                  this.state.detailObj.endTime ?
                    <Text style={{ marginTop: 5 }}>结束时间：{Moment(this.state.detailObj.endTime).format('YYYY-MM-DD HH:mm')} </Text>
                    :
                    <></>
                }

              </View>
              <Text>{this.props.route.params?.interflow?.browseNum || 0}人看过</Text>
            </View>
          </View>

          <CommentsList
            comments={this.state.comments}
          />
        </ScrollView >

        <FeedbackSection
          dataId={this.state.detailObj.id}
          LikeUrl="/api/need/like/"
          likeCountProp={this.props.route.params?.interflow?.likeNum || 0}
          favoriteCountProp={this.props.route.params?.interflow?.browseNum || 0}
          pinglunCountProp={this.state.totalCountPl}
          fetchComments={this.fetchComments}
        />
      </View>
    );
  }

}


const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(XuqiuDetail);

const Styles = StyleSheet.create({
  bannerImg: { width: Metrics.px2dp(750), height: Metrics.px2dp(375), },
  title: { fontSize: Metrics.fontSize16, color: Colors.hei2E, marginTop: 10 },
  abstract: { fontSize: Metrics.fontSize14, color: Colors.hui66, marginTop: 10 },
  pubilshFaceImg: { width: Metrics.px2dp(100), height: Metrics.px2dp(100), borderRadius: Metrics.px2dp(100) },
});