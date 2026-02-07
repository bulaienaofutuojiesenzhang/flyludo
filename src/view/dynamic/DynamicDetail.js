import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, RefreshControl, StatusBar, FlatList, Image, Text } from 'react-native';
import { View, Toast } from 'native-base';
import { Tab, TabView } from 'react-native-elements';
import RenderHtml from 'react-native-render-html';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import Moment from 'moment';

import Config from '../../config/index';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import FeedbackSection from '../../component/FeedbackSection';
import CommentsList from '../../component/CommentsList';


class Dynamic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      detailObj: {
        userInfo: {}
      },

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

  initFunc() {
    this.setState({ isLoading: true })
    Http('get', `/api/information/browse/${this.props.route.params.id}`).then(res => {
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
    if (!this.state.hasMore && !bloo) return;
    let pageSize = 10;
    this.setState({ isLoading: true })

    try { 
      const res = await Http('get', `/api/review/list/data/${this.state.pageNoPl}/${pageSize}`, {dataId: this.props.route.params.id});
      this.setState({ isLoading: false })

      if (res.code === 200) {
        const newComments = res.data.list || [];
        console.log('newComments',newComments)
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
              <Text style={Styles.abstract}>{this.state.detailObj.abstract}</Text>
            </View>
            <View style={{ backgroundColor: Colors.bai, paddingHorizontal: 10, paddingVertical: 10, flexDirection: 'column', alignItems: 'center', marginTop: 10 }}>
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
            <View style={{ backgroundColor: Colors.bai, paddingHorizontal: 10, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FastImage style={Styles.pubilshFaceImg} source={this.state.detailObj.userInfo?.avatar ? { uri: Config.File_PATH + this.state.detailObj.userInfo.avatar } : require('../../asserts/images/publish/plc_collect_user_home.png')} />
                <View style={{ marginLeft: 10 }}>
                  <Text>{this.state.detailObj.userInfo?.name}</Text>
                  <Text style={{ marginTop: 8 }}>{Moment(this.state.detailObj.createTime).format('YYYY-MM-DD HH:mm')}</Text>
                </View>
              </View>
              <Text>{this.state.detailObj.interflow?.browseNum}人看过</Text>
            </View>
          </View>

          <CommentsList
            comments={this.state.comments}
          />



        </ScrollView>
        <FeedbackSection
          dataId={this.state.detailObj.id}
          LikeUrl="/api/information/like/"
          likeCountProp={this.props.route.params.interflow.likeNum}
          favoriteCountProp={this.props.route.params.interflow.browseNum}
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

export default connect(mapStateToProps, mapDispatchToProps)(Dynamic);

const Styles = StyleSheet.create({
  bannerImg: { width: Metrics.px2dp(750), height: Metrics.px2dp(375), },
  title: { fontSize: Metrics.fontSize16, color: Colors.hei2E, marginTop: 10 },
  abstract: { fontSize: Metrics.fontSize14, color: Colors.hui66, marginTop: 10 },
  pubilshFaceImg: { width: Metrics.px2dp(100), height: Metrics.px2dp(100), borderRadius: Metrics.px2dp(100) },
});