import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, StatusBar, FlatList, Image, Text, Pressable, Platform } from 'react-native';
import { View, Toast } from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import Moment from 'moment';
import Icon from 'react-native-vector-icons/AntDesign';

import Config from '../config/index';
import { Colors, Metrics } from '../theme';
import Http from '../utils/HttpPost';
import { ToastService } from '../component';


const PAGE_SIZE = 10;

class Dynamic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      showFoot: -1, // -1 初始 / 0 还可加载 / 1 没有更多 / 2 加载中
      sortType: 'latest', // latest, hot, popular
      communityList: [],
      page: 1,
      totalPages: 1,
    }
    this._loadingMore = false;
    this._listRequestId = 0;
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    this.initFunc()
  }

  // 切换排序方式
  setSortType(sortType) {
    this.setState({ sortType }, () => {
      this.initFunc();
    });
  }

  _footAfterPage(listLen, page, totalPages) {
    if (totalPages > 0) {
      return page >= totalPages ? 1 : 0;
    }
    return listLen < PAGE_SIZE ? 1 : 0;
  }

  // 获取社区动态列表
  initFunc() {
    const requestId = ++this._listRequestId;
    this._loadingMore = false;
    this.setState({ page: 1, isLoading: true, showFoot: -1, totalPages: 1 })
    Http('get', '/couple-game/community/posts', { 
      page: 1, 
      pageSize: PAGE_SIZE,
      sort: this.state.sortType 
    }).then(res => {
      if (requestId !== this._listRequestId) return;
      this.setState({ isLoading: false, refreshLoading: false })
      console.log('/couple-game/community/posts:', res.data)
      if (res.code === 200) {
        const list = res.data.list || [];
        const totalPages = res.data.pagination?.totalPages || 1;
        this.setState({
          communityList: list,
          page: 1,
          totalPages,
          showFoot: this._footAfterPage(list.length, 1, totalPages),
        })
      }
    }).catch(err => {
      if (requestId !== this._listRequestId) return;
      this.setState({ isLoading: false, refreshLoading: false, showFoot: 0 })
      console.log('获取社区列表失败:', err)
    })
  }

  // 下拉刷新
  refreshFunc() {
    this.setState({ refreshLoading: true })
    this.initFunc();
  }

  // 加载更多
  loadData() {
    const { showFoot, isLoading, refreshLoading, page, totalPages, sortType, communityList } = this.state;
    if (showFoot === 1 || showFoot === 2 || isLoading || refreshLoading || this._loadingMore) {
      return
    }
    if (totalPages > 0 && page >= totalPages) {
      this.setState({ showFoot: 1 });
      return
    }
    const nextPage = page + 1;
    const requestId = this._listRequestId;
    this._loadingMore = true;
    this.setState({ showFoot: 2 })
    Http('get', '/couple-game/community/posts', { 
      page: nextPage, 
      pageSize: PAGE_SIZE,
      sort: sortType 
    }).then(res => {
      if (requestId !== this._listRequestId) {
        this._loadingMore = false;
        return;
      }
      this._loadingMore = false;
      if (res.code === 200) {
        const myData = res.data.list || [];
        const pages = res.data.pagination?.totalPages || totalPages;
        if (myData.length) {
          const exist = new Set(communityList.map((p) => p.postId));
          const merged = [...communityList, ...myData.filter((p) => !exist.has(p.postId))];
          this.setState({
            communityList: merged,
            page: nextPage,
            totalPages: pages,
            showFoot: this._footAfterPage(myData.length, nextPage, pages),
          })
        } else {
          this.setState({ showFoot: 1, totalPages: pages })
        }
      } else {
        this.setState({ showFoot: 0 })
      }
    }).catch(err => {
      if (requestId !== this._listRequestId) {
        this._loadingMore = false;
        return;
      }
      this._loadingMore = false;
      this.setState({ showFoot: 0 })
    })
  }

  // 点赞/取消点赞
  toggleLike = (postId, index) => {
    Http('post', '/couple-game/community/toggle-like', { postId }).then(res => {
      if (res.code === 200) {
        // 更新列表中的点赞状态
        const newList = [...this.state.communityList];
        newList[index].isLiked = res.data.isLiked;
        newList[index].likeCount = res.data.likeCount;
        this.setState({ communityList: newList });
        
        ToastService.showToast({
          title: res.data.isLiked ? '点赞成功' : '取消点赞'
        });
      }
    }).catch(err => {
      console.log('点赞失败:', err)
      ToastService.showToast({
        title: '操作失败'
      });
    })
  }

  // 添加到收藏
  addToCollection = (gameId, index) => {
    Http('post', '/couple-game/add-to-collection', { gameId }).then(res => {
      if (res.code === 200) {
        // 更新列表中的收藏状态
        const newList = [...this.state.communityList];
        newList[index].isCollected = true;
        newList[index].addedCount = (newList[index].addedCount || 0) + 1;
        this.setState({ communityList: newList });
        
        ToastService.showToast({
          title: '添加成功'
        });
      } else {
        ToastService.showToast({
          title: res.message || '添加失败'
        });
      }
    }).catch(err => {
      console.log('添加收藏失败:', err)
      ToastService.showToast({
        title: '操作失败'
      });
    })
  }

  _renderFooter() {
    if (this.state.showFoot === 1) {
      return (
        <View style={{ height: 58, alignItems: 'center', justifyContent: 'center', }}>
          <Text style={{ color: Colors.hui99, fontSize: 14 }}>
          没有更多数据了
          </Text>
        </View>
      );
    } else if (this.state.showFoot === 2) {
      return (
        <View style={{ height: 58, alignItems: 'center', justifyContent: 'center', }}>
          <Text style={{ color: Colors.hui99, fontSize: 14 }}>正在加载更多数据...</Text>
        </View>
      );
    } else if (this.state.showFoot === 0) {
      return (
        <View style={{ height: 58, alignItems: 'center', justifyContent: 'center', }}>
          <Text style={{ color: Colors.hui99, fontSize: 14 }}>上拉加载更多</Text>
        </View>
      );
    }
    return null;
  }

  // 根据游戏类型跳转到对应界面
  navigateToGame = (item) => {
    const gameType = item.gameType || 'feixingqi';
    
    const gameData = {
      gameId: item.gameId,
      title: item.title,
      description: item.description,
      steps: item.steps,
      playerCount: item.playerCount || 2,
      creator: item.creator,
      playCount: item.playCount,
      gameType: gameType,
    };
    
    if (gameType === 'zhenxinhua') {
      this.props.navigation.push('TruthMode', { gameData: gameData });
    } else if (gameType === 'damaoxian') {
      this.props.navigation.push('DareMode', { gameData: gameData });
    } else {
      // 飞行棋
      this.props.navigation.push('CoupleFlyingChess', { gameData: gameData });
    }
  }

  // 获取游戏类型显示信息
  getGameTypeInfo = (gameType) => {
    switch (gameType) {
      case 'zhenxinhua':
        return { text: '真心话', color: Colors.zhenxinPink, emoji: '💭' };
      case 'damaoxian':
        return { text: '大冒险', color: Colors.maoxianYellow, emoji: '⚡' };
      case 'feixingqi':
      default:
        return { text: '飞行棋', color: Colors.subjectFen, emoji: '🎲' };
    }
  }

  // 渲染社区动态项
  renderCommunityItem = (item, index) => {
    const gameType = item.gameType || 'feixingqi';
    const typeInfo = this.getGameTypeInfo(gameType);

    return (
      <View style={Styles.communityItem} key={index}>
        {/* 置顶标签 */}
        {item.isPinned && (
          <View style={Styles.pinnedBadge}>
            <Text style={Styles.pinnedText}>置顶</Text>
          </View>
        )}

        {/* 游戏类型浮标 - 右侧中间位置 */}
        <View style={[Styles.gameTypeBadge, { backgroundColor: typeInfo.color }]}>
          <Text style={Styles.gameTypeEmoji}>{typeInfo.emoji}</Text>
          <Text style={Styles.gameTypeText}>{typeInfo.text}</Text>
        </View>

        {/* 上半部分：可点击进入游戏 */}
        <Pressable 
          onPress={() => this.navigateToGame(item)}
        >
          {/* 创作者信息 */}
          <View style={Styles.creatorInfo}>
            <FastImage 
              style={Styles.avatar} 
              source={item.creator?.avatar ? 
                { uri: Config.File_PATH + item.creator.avatar } : 
                require('../asserts/images/publish/icon_task_login.png')
              } 
            />
            <View style={Styles.creatorDetail}>
              <Text style={Styles.creatorName}>{item.creator?.name || '匿名用户'}</Text>
              <Text style={Styles.publishTime}>
                {Moment(item.publishedAt).format('YYYY-MM-DD HH:mm')}
              </Text>
            </View>
          </View>

          {/* 标题和描述 */}
          <Text style={Styles.postTitle}>{item.title}</Text>
          <Text style={Styles.postDesc} numberOfLines={2}>{item.description}</Text>

          {/* 步骤预览 */}
          <View style={Styles.stepsPreview}>
            <Text style={Styles.stepsLabel}>
              共 {item.steps?.length || 0} 个步骤 · 推荐{item.playerCount || 2}人
            </Text>
            <View style={Styles.stepsContainer}>
              {item.steps?.slice(0, 3).map((step, idx) => (
                <View key={idx} style={Styles.stepTag}>
                  <Text style={Styles.stepText} numberOfLines={1}>
                    {idx + 1}. {step}
                  </Text>
                </View>
              ))}
              {item.steps?.length > 3 && (
                <Text style={Styles.moreSteps}>...</Text>
              )}
            </View>
          </View>
        </Pressable>

        {/* 下半部分：统计数据和操作按钮 */}
        <View style={Styles.actionBar}>
          <View style={Styles.statsContainer}>
            <View style={Styles.statItem}>
              <Icon name="heart" size={14} color="#FF6B6B" />
              <Text style={[Styles.statText, { color: "#FF6B6B" }]}>{item.likeCount || 0}</Text>
            </View>
            <View style={Styles.statItem}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={[Styles.statText, { color: "#FFD700" }]}>{item.addedCount || 0}</Text>
            </View>
          </View>

          <View style={Styles.actionButtons}>
            {/* 点赞按钮 */}
            <TouchableOpacity 
              style={Styles.actionButton}
              onPress={() => this.toggleLike(item.postId, index)}
            >
              <Icon 
                name={item.isLiked ? "heart" : "hearto"} 
                size={18} 
                color={item.isLiked ? "#FF6B6B" : Colors.hui99} 
              />
              <Text style={[Styles.actionText, item.isLiked && { color: "#FF6B6B" }]}>
                {item.likeCount || 0}
              </Text>
            </TouchableOpacity>

            {/* 收藏按钮 */}
            <TouchableOpacity 
              style={Styles.actionButton}
              onPress={() => this.addToCollection(item.gameId, index)}
              disabled={item.isCollected}
            >
              <Icon 
                name={item.isCollected ? "star" : "staro"} 
                size={18} 
                color={item.isCollected ? "#FFD700" : Colors.hui99} 
              />
              <Text style={[Styles.actionText, item.isCollected && { color: "#FFD700" }]}>
                {item.isCollected ? '已收藏' : '收藏'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  render() {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Colors.bai }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        
        {/* 标题栏 */}
        <View style={Styles.headerContainer}>
          <Text style={Styles.headerTitle}>情侣游戏社区</Text>
        </View>

        {/* 排序选项 */}
        <View style={Styles.sortContainer}>
          <TouchableOpacity 
            style={[Styles.sortButton, this.state.sortType === 'latest' && Styles.sortButtonActive]}
            onPress={() => this.setSortType('latest')}
          >
            <Icon name="clockcircleo" size={14} color={this.state.sortType === 'latest' ? Colors.subject : Colors.hui99} />
            <Text style={[Styles.sortText, this.state.sortType === 'latest' && Styles.sortTextActive]}>
              最新
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[Styles.sortButton, this.state.sortType === 'hot' && Styles.sortButtonActive]}
            onPress={() => this.setSortType('hot')}
          >
            <Icon name="heart" size={14} color={this.state.sortType === 'hot' ? Colors.subject : Colors.hui99} />
            <Text style={[Styles.sortText, this.state.sortType === 'hot' && Styles.sortTextActive]}>
              热门
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[Styles.sortButton, this.state.sortType === 'popular' && Styles.sortButtonActive]}
            onPress={() => this.setSortType('popular')}
          >
            <Icon name="star" size={14} color={this.state.sortType === 'popular' ? Colors.subject : Colors.hui99} />
            <Text style={[Styles.sortText, this.state.sortType === 'popular' && Styles.sortTextActive]}>
              流行
            </Text>
          </TouchableOpacity>
        </View>

        {/* 社区列表 */}
        <FlatList
          style={{ flex: 1 }}
          ListEmptyComponent={() => (
            <View style={Styles.emptyContainer}>
              <Image style={{ width: 190 }} source={require('../asserts/images/home/icon_empty.png')} resizeMode='contain' />
              <Text style={{ color: Colors.hui99, marginTop: 20 }}>暂无社区内容</Text>
            </View>
          )}
          ListFooterComponent={this._renderFooter()}
          data={this.state.communityList}
          renderItem={({ item, index }) => this.renderCommunityItem(item, index)}
          keyExtractor={(item) => String(item.postId)}
          refreshing={this.state.refreshLoading}
          onRefresh={() => {
            this.refreshFunc()
          }}
          onEndReached={() => {
            this.loadData()
          }}
          onEndReachedThreshold={0.3}
        />
      </SafeAreaView>
    );
  }

}


const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Dynamic);

const Styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: Colors.bai,
    borderBottomWidth: 1,
    borderBottomColor: Colors.huiF5,
  },
  headerTitle: {
    fontSize: Metrics.fontSize18,
    color: Colors.hei2E,
    fontWeight: 'bold',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: Colors.bai,
    borderBottomWidth: 1,
    borderBottomColor: Colors.huiF5,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 10,
    borderRadius: 15,
    backgroundColor: Colors.huiF5,
  },
  sortButtonActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  sortText: {
    fontSize: Metrics.fontSize13,
    color: Colors.hui99,
    marginLeft: 5,
  },
  sortTextActive: {
    color: Colors.subject,
    fontWeight: 'bold',
  },
  communityItem: {
    backgroundColor: Colors.bai,
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  pinnedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 2,
  },
  gameTypeBadge: {
    position: 'absolute',
    top: '50%',
    right: 10,
    transform: [{ translateY: -15 }],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  gameTypeEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  gameTypeText: {
    fontSize: 11,
    color: Colors.bai,
    fontWeight: 'bold',
  },
  pinnedText: {
    fontSize: Metrics.fontSize11,
    color: Colors.bai,
    fontWeight: 'bold',
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  creatorDetail: {
    marginLeft: 10,
    flex: 1,
  },
  creatorName: {
    fontSize: Metrics.fontSize15,
    color: Colors.hei2E,
    fontWeight: 'bold',
  },
  publishTime: {
    fontSize: Metrics.fontSize12,
    color: Colors.hui99,
    marginTop: 2,
  },
  postTitle: {
    fontSize: Metrics.fontSize16,
    color: Colors.hei2E,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postDesc: {
    fontSize: Metrics.fontSize14,
    color: Colors.hui66,
    lineHeight: 20,
    marginBottom: 12,
  },
  stepsPreview: {
    marginBottom: 12,
  },
  stepsLabel: {
    fontSize: Metrics.fontSize13,
    color: Colors.subject,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  stepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stepTag: {
    backgroundColor: Colors.huiF5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 6,
    maxWidth: '100%',
  },
  stepText: {
    fontSize: Metrics.fontSize12,
    color: Colors.hui66,
  },
  moreSteps: {
    fontSize: Metrics.fontSize12,
    color: Colors.hui99,
    alignSelf: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.huiF5,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    fontSize: Metrics.fontSize12,
    color: Colors.hui99,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  actionText: {
    fontSize: Metrics.fontSize13,
    color: Colors.hui99,
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
});