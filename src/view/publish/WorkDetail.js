import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, StatusBar, FlatList, Image, Text, TextInput, Pressable, Switch, Modal } from 'react-native';
import { View, } from 'native-base';
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
import FeedbackSection from '../../component/FeedbackSection';
import CommentsList from '../../component/CommentsList'; 
import BottomPicker from '../../component/BottomPicker';


class WorkDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      thisObj: {
      },

      hasMore: true,
      comments: [],
      pageNoPl: 1,
      totalCountPl: 0,
      descModalVisible: false,
      editingDesc: '',  // 用于编辑的临时描述文本
      dateOpen: false,
      selectDate: new Date(),
    }
    this.typePickerRef = React.createRef();
    this.categoryPickerRef = React.createRef();
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    console.log('WorkDetail详细：', this.props.route.params)
    const { params } = this.props.route;
    if (params) {
      this.setState((prevState) => ({
        ...prevState,  // 保留原 state 的其他数据
        ...params,     // 使用 params 中的字段来覆盖 state
      }));
    }

    this.initFunc();
    this.fetchComments();
  }

  initFunc() {
    this.setState({ isLoading: true }, () => {
      Http('get', `/api/works/info/${this.state.id}`, {

      }).then(res => {
        this.setState({ isLoading: false, refreshLoading: false })
        if (res.code === 200) {
          console.log(';res.datares.datares.data',res.data) 
          this.setState({thisObj: res.data})
          this.setState((prevState) => ({
            ...prevState,  // 保留原 state 的其他数据
            ...res.data,     // 使用 params 中的字段来覆盖 state
          }));
        }
      }) 
    })

    Http('get', `/api/works/browse/${this.props.route.params.id}`, {
    }).then(res => {
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


    qucunzheng(){
      Http('get', `/api/approve/mine/info`, {
          }).then(res => {
            this.setState({ isLoading: false })
            if (res.code == 200) {
              if (res.data?.certificateType) {
                this.props.navigation.push('WorkEvidence', { id: this.state.id, name: this.state.name })
              }else{  
                ToastService.showToast({
                    title: '请前往认证中心认证'
                })
              }
            }
          })
    }

    qudengji(){
      Http('get', `/api/approve/mine/info`, {
          }).then(res => {
            this.setState({ isLoading: false })
            if (res.code == 200) {
              if (res.data?.certificateType) {
                this.props.navigation.push('WorkBanquan', { id: this.state.id, name: this.state.name })
              }else{  
                ToastService.showToast({
                    title: '请前往认证中心认证'
                })
              }
            }
          })
    }


    isCollectFunc(){

      this.setState({ isCollect: !this.state.isCollect }, ()=>{
        Http('post', `/api/works/isCollect/update/${this.state.id}`, {
          isCollect: this.state.isCollect ? 1 : 0,
            }).then(res => { 
              this.setState({ isLoading: false })
              if (res.code == 200) {
                this.initFunc()
              }
            })
      })
      
      
    }

    mineShowFunc(){
      this.setState({ isMineShow: !this.state.isMineShow }, ()=>{
        Http('post', `/api/works/mineShow/update/${this.state.id}`, {
          isMineShow: this.state.isMineShow ? 1 : 0,
            }).then(res => {
              this.setState({ isLoading: false })
              if (res.code == 200) {
                this.initFunc()
              }
            })
      })
    }
  

  updateDesc = async () => {
    if (!this.state.editingDesc.trim()) {
      ToastService.showToast({ title: "描述不能为空" });
      return;
    }

    this.setState({ isLoading: true });
    try {
      const res = await Http('post', `/api/works/info/update/${this.state.id}`, {
        desc: this.state.editingDesc
      });
      
      if (res.code === 200) {
        ToastService.showToast({ title: "修改成功" });
        this.setState({ 
          desc: this.state.editingDesc,
          descModalVisible: false 
        });
      }
    } catch (error) {
      console.error('修改描述失败:', error);
      ToastService.showToast({ title: "修改失败" });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  updateType = async (value) => {
    value = value?value:'1'
    this.setState({ isLoading: true });
    try {
      const res = await Http('post', `/api/works/info/update/${this.state.id}`, {
        type: value
      });
      
      if (res.code === 200) {
        ToastService.showToast({ title: "修改成功" });
        this.setState({ type: value });
      }
    } catch (error) {
      console.error('修改分类失败:', error);
      ToastService.showToast({ title: "修改失败" });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  updateCategory = async (value) => {
    console.log('updateCategory', value)
    value = value?value:'1'
    this.setState({ isLoading: true });
    try {
      const res = await Http('post', `/api/works/info/update/${this.state.id}`, {
        category: value
      });
      
      if (res.code === 200) {
        ToastService.showToast({ title: "修改成功" });
        this.setState({ category: value });
      }
    } catch (error) {
      console.error('修改作品类型失败:', error);
      ToastService.showToast({ title: "修改失败" });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  updateFinishTime = async (date) => {
    this.setState({ isLoading: true });
    try {
      const res = await Http('post', `/api/works/info/update/${this.state.id}`, {
        finishTime: Moment(date).format('YYYY-MM-DD')
      });
      
      if (res.code === 200) {
        ToastService.showToast({ title: "修改成功" });
        this.setState({ finishTime: date });
      }
    } catch (error) {
      console.error('修改创作时间失败:', error);
      ToastService.showToast({ title: "修改失败" });
    } finally {
      this.setState({ isLoading: false, dateOpen: false });
    }
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={Styles.container}>
          {/* 主体内容 */}
          <View style={Styles.content}>
            <View style={Styles.detailTit}>
              {/* 上传时间 */}
              <TouchableOpacity style={Styles.myColumn} >
                <Text style={Styles.uploadTime}>上传时间 {Moment(this.state.createTime).format('YYYY-MM-DD HH:mm')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {
                    this.state.hashId ?
                      <Image style={Styles.itemRightIcon} source={require('../../asserts/images/publish/icon_work_cert.png')} resizeMode='contain' />
                      :
                      <Image style={Styles.itemRightIcon} source={require('../../asserts/images/publish/icon_work_cert_un.png')} resizeMode='contain' />
                  }
                  {
                    this.state.dictId ?
                      <Image style={Styles.itemRightIcon} source={require('../../asserts/images/publish/icon_work_dci.png')} resizeMode='contain' />
                      :
                      <Image style={Styles.itemRightIcon} source={require('../../asserts/images/publish/icon_work_dci_un.png')} resizeMode='contain' />
                  }

                  <Text style={Styles.isShowText}>{this.state.isShow ? '已展示' : '未展示'} </Text>
                </View>
              </TouchableOpacity>


              {/* 图片展示 */}
              <View style={Styles.imageWrapper}>
                <FastImage style={Styles.image} source={this.state.dataUrl ? { uri: Config.File_PATH + this.state.dataUrl } : require('../../asserts/images/publish/icon_add.png')} />
              </View>

              {/* 作品信息 */}
              <Text style={Styles.infoText}>{this.state.name}</Text>
              <Text style={Styles.infoText}>作者 {this.state?.userInfo?.name}</Text>

            </View>

            {/* 操作按钮 */}
            <View style={Styles.actionButtons}>
              <TouchableOpacity 
                style={[
                  Styles.button,
                  this.state.checkStatus !== 1 && Styles.disabledButton
                ]}
                onPress={() => {
                  if(this.state.checkStatus !== 1) {
                    ToastService.showToast({ title: "作品审核通过后才能进行版权登记" });
                    return;
                  }
                  this.qudengji();
                  
                }}
              >
                <Text style={[
                  Styles.buttonText,
                  this.state.checkStatus !== 1 && Styles.disabledText
                ]}>去登记</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  Styles.button,
                  this.state.checkStatus !== 1 && Styles.disabledButton
                ]}
                onPress={() => {
                  if(this.state.checkStatus !== 1) {
                    ToastService.showToast({ title: "作品审核通过后才能进行版权存证" });
                    return;
                  }
                  this.qucunzheng();
                  
                }}
              >
                <Text style={[
                  Styles.buttonText,
                  this.state.checkStatus !== 1 && Styles.disabledText
                ]}>去存证</Text>
              </TouchableOpacity>
              
              {/* <TouchableOpacity style={[Styles.button,Styles.disabledButton]}>
                <Text style={Styles.disabledButtonText}>去卖画</Text>
              </TouchableOpacity> */}
            </View>

            {/* 作品属性 */}
            <View style={Styles.details}>

            <TouchableOpacity 

                onPress={() => this.typePickerRef.current?.show()}

                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}

              >

                <Text style={Styles.detailTitle}>作品分类</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                  <Text style={[Styles.detailItem, { marginBottom: 0, marginRight: 8 }]}>

                    {Number(this.state.type) == 1 ? '美术' :

Number(this.state.type) == 2 ? '摄影' :

Number(this.state.type) == 3 ? '其他' : '未知分类'}

                  </Text>

                  <Icon name="right" size={14} color={Colors.hui66} />

                </View>

              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <TouchableOpacity 
                  onPress={() => this.categoryPickerRef.current?.show()}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}
                >
                  <Text style={Styles.detailTitle}>作品类型</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[Styles.detailItem, { marginBottom: 0, marginRight: 8 }]}>
                      {Number(this.state.category) == 1 ? '国画' :
                       Number(this.state.category) == 2 ? '油画' :
                       Number(this.state.category) == 3 ? '雕塑' :
                       Number(this.state.category) == 4 ? '书法' :
                       Number(this.state.category) == 5 ? '版画' :
                       Number(this.state.category) == 6 ? '漆画' :
                       Number(this.state.category) == 7 ? '水粉水彩' :
                       Number(this.state.category) == 8 ? '原创设计师' : '其他'}
                    </Text>
                    <Icon name="right" size={14} color={Colors.hui66} />
                  </View>
                </TouchableOpacity>
              </View>
              {
                this.state.length ?
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <Text style={Styles.detailTitle}>尺寸</Text>
                    <Text style={Styles.detailItem}>{this.state.width}CM * {this.state.length}CM</Text>
                  </View>
                  :
                  <></>
              }

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <TouchableOpacity 
                  onPress={() => this.setState({ dateOpen: true })}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}
                >
                  <Text style={Styles.detailTitle}>创作时间</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[Styles.detailItem, { marginBottom: 0, marginRight: 8 }]}>
                      {Moment(this.state.finishTime).format('YYYY-MM-DD')}
                    </Text>
                    <Icon name="right" size={14} color={Colors.hui66} />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <Text style={Styles.detailTitle}>审核状态</Text>
                {/* 审核状态标签 */}
                <View style={[
                    Styles.statusTag,
                    {
                      backgroundColor: this.state.checkStatus === 0 ? '#E6F7FF' :
                                      this.state.checkStatus === 1 ? '#F6FFED' : '#FFF1F0'
                    }
                  ]}>
                    <Text style={[
                      Styles.statusText,
                      {
                        color: this.state.checkStatus === 0 ? '#1890FF' :
                               this.state.checkStatus === 1 ? '#52C41A' : '#FF4D4F'
                      }
                    ]}>
                      {this.state.checkStatus === 0 ? '审核中' :
                       this.state.checkStatus === 1 ? '已通过' : '未通过'}
                    </Text>
                  </View>
              </View>
            </View>

            <View style={Styles.details}>
              <TouchableOpacity onPress={() => {
                    this.setState({ 
                      descModalVisible: true,
                      editingDesc: this.state.desc 
                    });
                  }} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={Styles.detailTitle}>作品描述</Text>
                <View>
                  <Icon name="right" size={14} color={Colors.hui66} />
                </View>
              </TouchableOpacity>
              <Text style={Styles.detailItem}>{this.state.desc}</Text>
            </View>

            <View style={Styles.details}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={Styles.detailTitle}>是否已被收藏</Text>
                {/* <Text style={Styles.detailItem}>{this.state.isCollect ? '是' : '否'}</Text> */}
              <Switch
                  trackColor={{ true: Colors.subjectQian }}
                  thumbColor={this.state.isCollect == 1 ? Colors.subject : ""}
                  onValueChange={() => { this.isCollectFunc() }}
                  value={this.state.isCollect == 1 ? true : false}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <Text style={Styles.detailTitle}>是否在个人主页展示 </Text>
                {/* <Text style={Styles.detailItem}>{this.state.isShow ? '是' : '否'}</Text> */}
                <Switch
                  trackColor={{ true: Colors.subjectQian }}
                  thumbColor={this.state.isMineShow == 1 ? Colors.subject : ""}
                  onValueChange={() => { this.mineShowFunc() }}
                  value={this.state.isMineShow == 1 ? true : false}
                />
              </View>
            </View>


            {/* {
              this.state.interflow ?
                <View style={Styles.details}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={Styles.detailTitle}>浏览量</Text>
                    <Text style={Styles.detailItem}>{this.state.interflow.browseNum}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={Styles.detailTitle}>点赞</Text>
                    <Text style={Styles.detailItem}>{this.state.interflow.likeNum}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={Styles.detailTitle}>收藏数量</Text>
                    <Text style={Styles.detailItem}>{this.state.interflow.collectNum}</Text>
                  </View>

                </View>
                :
                <></>
            } */}
          </View>

          <CommentsList
            comments={this.state.comments}
          />
        </ScrollView>

        {this.state.thisObj.interflow && 
          <FeedbackSection
            dataId={this.state.id}
            LikeUrl="/api/works/like/"
            likeCountProp={this.state.thisObj.interflow?.likeNum}
            favoriteCountProp={this.state.thisObj.interflow?.browseNum}
            pinglunCountProp={this.state.totalCountPl} 
            fetchComments={this.fetchComments}
          />
        }

        {/* 修改描述的 Modal */}
        <Modal
          visible={this.state.descModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.setState({ descModalVisible: false })}
        >
          <TouchableOpacity 
            style={Styles.modalOverlay}
            activeOpacity={1}
            onPress={() => this.setState({ descModalVisible: false })}
          >
            <TouchableOpacity 
              activeOpacity={1}
              style={Styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={Styles.modalHeader}>
                <Text style={Styles.modalTitle}>修改描述</Text>
                <TouchableOpacity onPress={() => this.setState({ descModalVisible: false })}>
                  <Icon name="close" size={20} color={Colors.hui66} />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={Styles.descInput}
                multiline={true}
                numberOfLines={4}
                value={this.state.editingDesc}
                onChangeText={(text) => this.setState({ editingDesc: text })}
                placeholder="请输入作品描述"
                placeholderTextColor={Colors.huiCc}
              />
              
              <TouchableOpacity 
                style={Styles.submitButton}
                onPress={this.updateDesc}
              >
                <Text style={Styles.submitButtonText}>确认修改</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {
          this.state.type && 
          <BottomPicker
          ref={this.typePickerRef}
          value={String(this.state.type)}
          items={[
            { label: '美术', value: '1' },
            { label: '摄影', value: '2' },
            { label: '其他', value: '3' },
          ]}
          onValueChange={(value) => this.updateType(value)}
        />
        }
        

    {
      this.state.category && 
      <BottomPicker
      ref={this.categoryPickerRef}
      value={String(this.state.category)}
      items={[
        { label: '国画', value: '1' },
        { label: '油画', value: '2' },
        { label: '雕塑', value: '3' },
        { label: '书法', value: '4' },
        { label: '版画', value: '5' },
        { label: '漆画', value: '6' },
        { label: '水粉水彩', value: '7' },
        { label: '原创设计师', value: '8' },
        { label: '其他', value: '9' },
      ]}
      onValueChange={(value) => this.updateCategory(value)}
    />
    }

{
  this.state.finishTime &&
  <DatePicker
  modal
  open={this.state.dateOpen}
  date={new Date(this.state.finishTime)}
  onConfirm={(date) => this.updateFinishTime(date)}
  onCancel={() => this.setState({ dateOpen: false })}
  locale="zh_CN"
  title="请选择时间"
  confirmText="选择"
  cancelText="取消"
  mode="date"
/>
}

       

      </View>
    );
  }

}


const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkDetail);

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15
  },
  uploadTime: {
    fontSize: 14,
    color: '#666',
  },
  imageWrapper: {
    alignItems: 'center',
    marginVertical: 16,
  },
  image: {
    width: 300,
    height: 400,
    resizeMode: 'contain',
    borderRadius: 5
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    // backgroundColor: '#fff',
    // padding: 16,
    // borderRadius: 8,
    // elevation: 2,
  },
  button: {
    backgroundColor: Colors.subject,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  disabledButtonText: {
    color: '#aaa',
    fontSize: 14,
  },
  detailTit: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  details: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    marginTop: 20,
  },
  detailTitle:
  {
    fontSize: 14,
    color: Colors.hui99,
    marginBottom: 8,
  },
  detailItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  myColumn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemRightIcon: { width: 23, height: 23, marginRight: 10 },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: Colors.bai,
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: Colors.subject,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: Colors.bai,
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: Colors.subjectQian,
  },
  disabledText: {
    color: Colors.hui99,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: Colors.bai,
    borderRadius: 8,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.hei,
  },
  descInput: {
    borderWidth: 1,
    borderColor: Colors.huiCc,
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    color: Colors.hei,
  },
  submitButton: {
    backgroundColor: Colors.subject,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: Colors.bai,
    fontSize: 16,
    fontWeight: '500',
  },
});