// CommentsList.js
import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';

import Config from '../config/index';
import Moment from 'moment';

const CommentsList = ({ comments}) => {

  return (
    <View style={styles.commentsList}>
      {comments.map((comment, index) => (
        <View key={index} style={styles.commentItem}>
          <Image
            source={{ uri: Config.File_PATH + comment.userInfo.avatar || 'https://via.placeholder.com/40' }} // 默认头像
            style={styles.avatar}
          />
          <View style={styles.commentContent}>
            <Text style={styles.userName}>{comment.userInfo.name}</Text>
            <Text style={styles.commentText}>{comment.content}</Text>
            <Text style={styles.commentTime}>{Moment(comment.createTime).format('YYYY-MM-DD HH:mm')}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  commentsList: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 80,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentText: {
    fontSize: 14,
    marginTop: 5,
  },
  commentTime: {
    fontSize: 12,
    marginTop: 5,
    color: '#aaa',
  },
});

export default CommentsList;