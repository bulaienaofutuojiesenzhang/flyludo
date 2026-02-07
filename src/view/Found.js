import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Image, Text, Pressable, FlatList, Modal } from 'react-native';
import { View, Toast } from 'native-base';
import { connect } from 'react-redux';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/AntDesign';
import Moment from 'moment';

import Config from '../config/index';
import { Colors, Metrics } from '../theme';
import Http from '../utils/HttpPost';
import { Header } from '../component';

class Found extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      showFoot: -1,
      page: 1,
      creationList: [],
      currentTab: 'creation', // 'creation' 或 'collection'
      showCreateModal: false, // 显示创作类型选择弹窗
    }
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    this.initFunc()
    
    // 监听导航焦点事件，用于页面返回时刷新
    this.focusListener = this.props.navigation.addListener('focus', () => {
      // 检查是否需要刷新
      const params = this.props.route?.params;
      if (params?.refresh) {
        this.initFunc()
        // 清除刷新参数
        this.props.navigation.setParams({ refresh: undefined })
      }
    })
  }

  componentWillUnmount() {
    // 移除监听器
    if (this.focusListener) {
      this.focusListener()
    }
  }

  // 获取列表数据（根据当前tab）
  initFunc() {
    const { currentTab } = this.state;
    const apiUrl = currentTab === 'creation' 
      ? '/couple-game/my-creations' 
      : '/couple-game/my-collections';
    
    this.setState({ page: 1, isLoading: true })
    Http('get', apiUrl, { page: 1, pageSize: 10 }).then(res => {
      this.setState({ isLoading: false, refreshLoading: false })
      console.log(`${apiUrl}:`, res.data)
      if (res.code === 200) {
        this.setState({ creationList: res.data.list || [] })
      }
    }).catch(err => {
      this.setState({ isLoading: false, refreshLoading: false })
      console.log('获取列表失败:', err)
    })
  }

  // 下拉刷新
  refreshFunc() {
    this.setState({ refreshLoading: true })
    this.initFunc();
  }

  // 加载更多数据
  loadData() {
    if (this.state.showFoot == 1) {
      return
    }
    const { currentTab } = this.state;
    const apiUrl = currentTab === 'creation' 
      ? '/couple-game/my-creations' 
      : '/couple-game/my-collections';
    
    let page = this.state.page + 1;
    this.setState({ isLoading: true, showFoot: 2 })
    Http('get', apiUrl, { page: page, pageSize: 10 }).then(res => {
      this.setState({ isLoading: false, refreshLoading: false })
      console.log(`${apiUrl}:`, res.data)
      if (res.code === 200) {
        if (res.data.list && res.data.list.length) {
          let myData = res.data.list;
          let creationList = [...this.state.creationList, ...myData]
          this.setState({ creationList: creationList, page: page, showFoot: 0 })
        } else {
          this.setState({ showFoot: 1 })
        }
      }
    }).catch(err => {
      this.setState({ isLoading: false, showFoot: 0 })
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
          <Text> 下拉刷新试试吧！ </Text>
        </View>
      );
    }
  }


  // 切换tab
  switchTab = (tab) => {
    if (tab !== this.state.currentTab) {
      this.setState({ 
        currentTab: tab,
        creationList: [],
        page: 1,
        showFoot: -1
      }, () => {
        this.initFunc();
      });
    }
  }

  // 取消收藏
  removeFromCollection = (gameId, index) => {
    this.setState({ isLoading: true })
    Http('post', '/couple-game/remove-from-collection', { gameId }).then(res => {
      this.setState({ isLoading: false })
      if (res.code === 200) {
        // 从列表中移除该项
        const newList = this.state.creationList.filter((_, idx) => idx !== index);
        this.setState({ creationList: newList });
      }
    }).catch(err => {
      this.setState({ isLoading: false })
      console.log('取消收藏失败:', err)
    })
  }

  // 根据游戏类型跳转到对应界面
  navigateToGame = (gameData) => {
    const gameType = gameData.gameType || 'feixingqi';
    
    if (gameType === 'zhenxinhua') {
      this.props.navigation.push('TruthMode', { gameData: gameData });
    } else if (gameType === 'damaoxian') {
      this.props.navigation.push('DareMode', { gameData: gameData });
    } else {
      // 飞行棋
      this.props.navigation.push('CoupleFlyingChess', { 
        gameData: gameData 
      });
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

  // 渲染列表项
  renderCreationItem(item, index) {
    const { currentTab } = this.state;
    const isCollection = currentTab === 'collection';
    
    // 收藏列表的数据结构不同，需要从game字段中获取游戏数据
    const gameData = isCollection ? item.game : item;
    const displayTime = isCollection ? item.addedAt : item.createdAt;
    const gameType = gameData.gameType || 'feixingqi';
    const typeInfo = this.getGameTypeInfo(gameType);
    
    return (
      <View style={Styles.creationItem} key={index}>
        {/* 游戏类型浮标 */}
        <View style={[Styles.gameTypeBadge, { backgroundColor: typeInfo.color }]}>
          <Text style={Styles.gameTypeEmoji}>{typeInfo.emoji}</Text>
          <Text style={Styles.gameTypeText}>{typeInfo.text}</Text>
        </View>

        {/* 上半部分：可点击进入游戏 */}
        <Pressable 
          onPress={() => this.navigateToGame(gameData)}
        >
          <View style={Styles.creationHeader}>
            <Text style={Styles.creationTitle}>{gameData.title}</Text>
            <Text style={Styles.creationTime}>
              {Moment(displayTime).format('YYYY-MM-DD HH:mm')}
            </Text>
          </View>
          
          <Text style={Styles.creationDesc} numberOfLines={2}>
            {gameData.description}
          </Text>
          
          <View style={Styles.statsRow}>
            <Text style={Styles.stepCount}>
              步数: {gameData.steps?.length || 0} {gameData.gameType === 'feixingqi' ? '· 推荐人数:'+ gameData.playerCount || 2 : ''}
            </Text>
          </View>
        </Pressable>
        
        {/* 下半部分：统计数据和操作按钮 */}
        <View style={Styles.creationFooter}>
          {(gameData.status === 'published' || isCollection) && (
            <View style={Styles.statsContainer}>
              <View style={Styles.statItem}>
                <Icon name="heart" size={14} color="#FF6B6B" />
                <Text style={[Styles.statsText, { color: "#FF6B6B" }]}>{gameData.likeCount || 0}</Text>
              </View>
              <View style={Styles.statItem}>
                <Icon name="star" size={14} color="#FFD700" />
                <Text style={[Styles.statsText, { color: "#FFD700" }]}>{gameData.addedCount || 0}</Text>
              </View>
            </View>
          )}
          
          <View style={Styles.creationActions}>
            {!isCollection && gameData.status === 'draft' && (
              <>
                <TouchableOpacity 
                  style={Styles.actionButton}
                  onPress={() => {
                    // 根据游戏类型进入不同的编辑界面
                    const gameType = item.gameType || 'feixingqi';
                    if (gameType === 'zhenxinhua' || gameType === 'damaoxian') {
                      this.props.navigation.navigate('CreateQuestion', { 
                        type: gameType,
                        editData: gameData 
                      });
                    } else {
                      // 飞行棋
                      this.props.navigation.navigate('Publish', { editData: gameData });
                    }
                  }}
                >
                  <Icon name="edit" size={16} color={Colors.subject} />
                  <Text style={Styles.actionText}>编辑</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[Styles.actionButton, { marginLeft: 15 }]}
                  onPress={() => {
                    // 发布功能
                    this.publishGame(gameData.gameId)
                  }}
                >
                  <Icon name="upload" size={16} color={Colors.subject} />
                  <Text style={Styles.actionText}>发布</Text>
                </TouchableOpacity>
              </>
            )}
            {!isCollection && gameData.status === 'published' && (
              <View style={Styles.statusBadge}>
                <Text style={Styles.statusText}>已发布</Text>
              </View>
            )}
            {isCollection && (
              <TouchableOpacity 
                style={[Styles.statusBadge, { 
                  backgroundColor: item.isOwn ? Colors.primary : Colors.subject 
                }]}
                onPress={() => {
                  if (!item.isOwn) {
                    // 取消收藏
                    this.removeFromCollection(gameData.gameId, index);
                  }
                }}
                disabled={item.isOwn}
              >
                <Text style={Styles.statusText}>
                  {item.isOwn ? '我的创作' : '取消收藏'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    )
  }

  // 发布游戏到社区
  publishGame = (gameId) => {
    this.setState({ isLoading: true })
    Http('post', '/couple-game/publish', { gameId }).then(res => {
      this.setState({ isLoading: false })
      if (res.code === 200) {
        // 发布成功，刷新列表
        this.initFunc()
      }
    }).catch(err => {
      this.setState({ isLoading: false })
      console.log('发布失败:', err)
    })
  }


  render() {
    const { currentTab } = this.state;
    
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bai }}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* 自定义标题栏，右侧带新增按钮 */}
        <View style={Styles.headerContainer}>
          <Text style={Styles.headerTitle}>
            {currentTab === 'creation' ? '我的创作' : '我的收藏'}
          </Text>
          {currentTab === 'creation' && (
            <TouchableOpacity 
              style={Styles.addButton}
              onPress={() => this.setState({ showCreateModal: true })}
            >
              <Icon name="plus" size={14} color={Colors.bai} />
              <Text style={Styles.addButtonText}>新增创作</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab切换 */}
        <View style={Styles.tabContainer}>
          <TouchableOpacity 
            style={[
              Styles.tabButton, 
              currentTab === 'creation' && Styles.tabButtonActive
            ]}
            onPress={() => this.switchTab('creation')}
          >
            <Text style={[
              Styles.tabText,
              currentTab === 'creation' && Styles.tabTextActive
            ]}>
              我的创作
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              Styles.tabButton, 
              currentTab === 'collection' && Styles.tabButtonActive
            ]}
            onPress={() => this.switchTab('collection')}
          >
            <Text style={[
              Styles.tabText,
              currentTab === 'collection' && Styles.tabTextActive
            ]}>
              我的收藏
            </Text>
          </TouchableOpacity>
        </View>

        {/* 列表 */}
        <View style={{ flex: 1 }}>
          <FlatList
            style={{ paddingHorizontal: 15, paddingTop: 10 }}
            ListEmptyComponent={() => (
              <View style={Styles.emptyContainer}>
                <Text style={Styles.emptyText}>
                  {currentTab === 'creation' ? '暂无创作内容' : '暂无收藏内容'}
                </Text>
                {currentTab === 'creation' && (
                  <TouchableOpacity 
                    style={Styles.emptyButton}
                    onPress={() => this.setState({ showCreateModal: true })}
                  >
                    <Text style={Styles.emptyButtonText}>立即创作</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            ListFooterComponent={this._renderFooter()}
            data={this.state.creationList}
            renderItem={({ item, index }) => this.renderCreationItem(item, index)}
            keyExtractor={(item, index) => String(index)}
            refreshing={this.state.refreshLoading}
            onRefresh={() => {
              this.refreshFunc()
            }}
            onEndReached={() => {
              this.loadData()
            }}
            onEndReachedThreshold={0.2}
          />
        </View>

        {/* 创作类型选择弹窗 */}
        <Modal
          visible={this.state.showCreateModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.setState({ showCreateModal: false })}
        >
          <View style={Styles.modalOverlay}>
            <View style={Styles.modalContent}>
              <View style={Styles.modalHeader}>
                <Text style={Styles.modalTitle}>选择创作类型</Text>
                <TouchableOpacity 
                  onPress={() => this.setState({ showCreateModal: false })}
                  style={Styles.modalClose}
                >
                  <Icon name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={Styles.createOptions}>
                {/* 飞行棋 */}
                <TouchableOpacity 
                  style={Styles.createOption}
                  onPress={() => {
                    this.setState({ showCreateModal: false });
                    this.props.navigation.navigate('Publish');
                  }}
                >
                  <View style={[Styles.optionIcon, { backgroundColor: this.getGameTypeInfo('feixingqi').color }]}>
                    <Text style={Styles.optionEmoji}>🎲</Text>
                  </View>
                  <View style={Styles.optionContent}>
                    <Text style={Styles.optionTitle}>情侣飞行棋</Text>
                    <Text style={Styles.optionDesc}>创建浪漫任务步骤</Text>
                  </View>
                </TouchableOpacity>

                {/* 真心话 */}
                <TouchableOpacity 
                  style={Styles.createOption}
                  onPress={() => {
                    this.setState({ showCreateModal: false });
                    this.props.navigation.navigate('CreateQuestion', { type: 'zhenxinhua' });
                  }}
                >
                  <View style={[Styles.optionIcon, { backgroundColor: this.getGameTypeInfo('zhenxinhua').color }]}>
                    <Text style={Styles.optionEmoji}>💭</Text>
                  </View>
                  <View style={Styles.optionContent}>
                    <Text style={Styles.optionTitle}>真心话</Text>
                    <Text style={Styles.optionDesc}>创建真心话问题</Text>
                  </View>
                </TouchableOpacity>

                {/* 大冒险 */}
                <TouchableOpacity 
                  style={Styles.createOption}
                  onPress={() => {
                    this.setState({ showCreateModal: false });
                    this.props.navigation.navigate('CreateQuestion', { type: 'damaoxian' });
                  }}
                >
                  <View style={[Styles.optionIcon, { backgroundColor: this.getGameTypeInfo('damaoxian').color }]}>
                    <Text style={Styles.optionEmoji}>⚡</Text>
                  </View>
                  <View style={Styles.optionContent}>
                    <Text style={Styles.optionTitle}>大冒险</Text>
                    <Text style={Styles.optionDesc}>创建大冒险挑战</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

}


const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Found);

const Styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 1,
    backgroundColor: Colors.bai,
    borderBottomWidth: 1,
    borderBottomColor: Colors.huiF5,
    height: 60,
  },
  headerTitle: {
    fontSize: Metrics.fontSize18,
    color: Colors.hei2E,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.subject,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: Colors.bai,
    fontSize: Metrics.fontSize14,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  creationItem: {
    backgroundColor: Colors.bai,
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  gameTypeBadge: {
    position: 'absolute',
    top: 88,
    right: 12,
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
  creationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  creationTitle: {
    fontSize: Metrics.fontSize16,
    color: Colors.hei2E,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  creationTime: {
    fontSize: Metrics.fontSize12,
    color: Colors.hui99,
  },
  creationDesc: {
    fontSize: Metrics.fontSize14,
    color: Colors.hui66,
    marginBottom: 12,
    lineHeight: 20,
  },
  statsRow: {
    marginTop: 10,
  },
  stepCount: {
    fontSize: Metrics.fontSize13,
    color: Colors.subject,
  },
  creationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.huiF5,
    paddingTop: 10,
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statsText: {
    fontSize: Metrics.fontSize12,
    color: Colors.hui99,
    marginLeft: 4,
  },
  creationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.bai,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    position: 'absolute',
    right: 0,
    top: -5,
    padding: 8,
  },
  createOptions: {
    gap: 12,
  },
  createOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: Metrics.fontSize13,
    color: Colors.subject,
    marginLeft: 5,
  },
  statusBadge: {
    backgroundColor: Colors.subject,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Metrics.fontSize12,
    color: Colors.bai,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: Metrics.fontSize16,
    color: Colors.hui99,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: Colors.subject,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: Colors.bai,
    fontSize: Metrics.fontSize14,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.bai,
    borderBottomWidth: 1,
    borderBottomColor: Colors.huiF5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: Colors.subject,
  },
  tabText: {
    fontSize: Metrics.fontSize15,
    color: Colors.hui66,
  },
  tabTextActive: {
    color: Colors.subject,
    fontWeight: 'bold',
  },
});