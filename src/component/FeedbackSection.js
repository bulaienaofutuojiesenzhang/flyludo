import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Platform, ActivityIndicator, StyleSheet, KeyboardAvoidingView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Http from '../utils/HttpPost';
import ToastService from './ToastService';

const FeedbackSection = ({ dataId, LikeUrl = '', likeCountProp = 0, favoriteCountProp = 0, pinglunCountProp = 0, fetchComments }) => {
  const [likeCount, setLikeCount] = useState(likeCountProp);
  const [favoriteCount, setFavoriteCount] = useState(favoriteCountProp);
  const [commentCount, setCommentCount] = useState(pinglunCountProp);
  const [newComment, setNewComment] = useState('');


  // 添加评论
  const handleComment = async () => {
    if (!newComment.trim()) {
      ToastService.showToast({
        title: '评论内容不能为空'
      })
      return;
    }

    Http('post', `/api/review/add`, {
        dataId,
        dataDesc: dataId,
        content: newComment.trim(),
    }).then(res => {
        if (res.code === 200) {
          // 调用父组件的方法
          if (fetchComments) {
            console.log('asdadasdasda')
            fetchComments(true); // 更新父组件的 totalCountPl
            console.log('sdfsdfdsfdsfdsfdsf')
          }
            setNewComment('');
            setCommentCount(commentCount + 1);
            ToastService.showToast({
                title: '评论成功'
            })
        }
      })

  };


  // 点赞
  const dianzanFun = () => {
    Http('get', `${LikeUrl + dataId}`).then(res => {
      if (res.code === 200) {
          ToastService.showToast({
              title: '点赞成功'
          })
          setLikeCount(likeCount + 1)
      }
    })
  };

  useEffect(() => {
    setCommentCount(pinglunCountProp);
  }, [pinglunCountProp]);


  return (
    <View >
  
      {/* 底部固定区域 */}
      <KeyboardAvoidingView
        style={Styles.fixedBottomContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={Styles.fixedBottom}>
          {/* 喜欢、收藏、评论数 */}
          <View style={Styles.actions}>
          

            <TouchableOpacity onPress={() => dianzanFun() } style={Styles.actionItem}>
              <Icon name="thumb-up" size={24} color="#B29F80" />
              <Text style={Styles.actionText}>{likeCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={Styles.actionItem}>
              <Icon name="visibility" size={24} color="#B29F80" />
              <Text style={Styles.actionText}>{favoriteCount}</Text>
            </TouchableOpacity>
            
            <View style={Styles.actionItem}>
              <Icon name="comment" size={24} color="#B29F80" />
              <Text style={Styles.actionText}>{commentCount}</Text>
            </View>
          </View>
  
          {/* 评论输入框 */}
          <View style={Styles.inputContainer}>
            <TextInput
              placeholder="说点什么..."
              value={newComment}
              onChangeText={setNewComment}
              onSubmitEditing={handleComment} // 键盘的发送按钮触发评论
              style={Styles.input}
              returnKeyType="send"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const Styles = StyleSheet.create({
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  fixedBottom: {
    backgroundColor: '#fff',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  actionText: {
    marginLeft: 2
  },
  inputContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
});

export default FeedbackSection;