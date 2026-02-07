import React, { Component } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { connect } from 'react-redux';
import Icons from 'react-native-vector-icons/AntDesign';

import { Colors, Metrics } from '../../theme';
import { Loading, ToastService, MyAlert } from '../../component';
import Http from '../../utils/HttpPost';

class MyCopyright extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      myAlert: false,
      myAlertTile: '提示',
      myAlertMsg: '您还未进行实名认证，请在实名认证通过后再进行该操作。',
    }
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {


  }


  renderIcon(label, iconSource) {
    return (
      <View style={Styles.iconContainer}>
        <Image source={iconSource} style={Styles.icon} />
        <Text style={Styles.iconLabel}>{label}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={Styles.container}>
        {/* 顶部背景 */}
        <ImageBackground style={Styles.userBackImg} source={require('../../asserts/images/user/icon_mine_bg.png')} resizeMode='stretch'>
          <Image style={Styles.inviteIcon} source={require('../../asserts/images/publish/icon_copy_hint.png')} resizeMode='contain' />
        </ImageBackground>

        {/* 登记部分 */}
        <View style={Styles.section}>
          <Pressable onPress={()=> this.props.navigation.push('MyBqDetail')} style={Styles.sectionHeader}>
            <Text style={Styles.sectionTitle}>我的登记</Text>
            <Icons name='right' style={[Styles.settingIcon, { fontSize: 16, color: Colors.huiCc }]} />
          </Pressable>
          <Pressable onPress={()=> this.props.navigation.push('MyBqDetail')} style={Styles.iconRow}>
            {this.renderIcon('审核中', require('../../asserts/images/publish/icon_copy_doing.png'))}
            {this.renderIcon('未通过', require('../../asserts/images/publish/icon_copy_nopass.png'))}
            {this.renderIcon('已出证', require('../../asserts/images/publish/icon_copy_pass.png'))}
          </Pressable>
          <View style={Styles.buttonRow}>
            {/* <TouchableOpacity style={[Styles.button, Styles.darkButton]}>
              <Text style={[Styles.buttonText, Styles.darkButtonText]}>购买登记券</Text>
            </TouchableOpacity> */}
            <TouchableOpacity onPress={() => this.props.navigation.push('CopyrightRegister')} style={[Styles.button, Styles.darkButton]}>
              <Text style={[Styles.buttonText, Styles.darkButtonText]}>去登记</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 存证部分 */}
        <View style={Styles.section}>
          <Pressable onPress={()=> this.props.navigation.push('MyCrDetail')} style={Styles.sectionHeader}>
            <Text style={Styles.sectionTitle}>我的存证</Text>
            <Icons name='right' style={[Styles.settingIcon, { fontSize: 16, color: Colors.huiCc }]} />
          </Pressable>
          <Pressable onPress={()=> this.props.navigation.push('MyCrDetail')} style={Styles.iconRow}>
            {this.renderIcon('审核中', require('../../asserts/images/publish/icon_copy_doing.png'))}
            {this.renderIcon('未通过', require('../../asserts/images/publish/icon_copy_nopass.png'))}
            {this.renderIcon('已出证', require('../../asserts/images/publish/icon_copy_pass.png'))}
          </Pressable>
          <View style={Styles.buttonRow}>
            {/* <TouchableOpacity style={Styles.button}>
              <Text style={Styles.buttonText}>购买存证券</Text>
            </TouchableOpacity> */}
            <TouchableOpacity onPress={()=> this.props.navigation.push('CopyrightEvidence')} style={Styles.button}>
              <Text style={Styles.buttonText}>去存证</Text>
            </TouchableOpacity>
          </View>
        </View>

        
      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(MyCopyright);

const Styles = StyleSheet.create({
  userBackImg: {
    paddingVertical: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  inviteIcon: {
    width: Metrics.px2dpi(915),
    height: Metrics.px2dpi(198),
  },
  headerTitle: {
    fontSize: 28,
    color: Colors.subjectQian,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 18,
    color: Colors.subject,
    marginTop: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  iconLabel: {
    fontSize: 12,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: '#f0e6d6',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    color: '#8a6d3b',
  },
  darkButton: {
    backgroundColor: '#333',
  },
  darkButtonText: {
    color: '#fff',
  },
});
