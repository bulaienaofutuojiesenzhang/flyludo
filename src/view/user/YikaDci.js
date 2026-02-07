import React, { Component } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, ImageBackground } from 'react-native';
import { connect } from 'react-redux';

import { Colors, Metrics } from '../../theme';
import { Loading, ToastService, MyAlert } from '../../component';
import Http from '../../utils/HttpPost';

class YikaDci extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {


  }


  render() {
    return (
      <ScrollView style={Styles.container}>
        <Image style={Styles.image} source={require('../../asserts/images/publish/icon_dci_desc.png')} resizeMode='contain' />
      </ScrollView>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(YikaDci);

const Styles = StyleSheet.create({
  container: { flex: 1 },
  image: {
    width: Metrics.px2dp(750), // 图片宽度占满父容器
    height: Metrics.px2dp(3160),
  },
});
