import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { connect } from 'react-redux';

import { Colors, Metrics } from '../../theme';
import { Loading, ToastService, MyAlert } from '../../component';
import Http from '../../utils/HttpPost';

class VerificationCenter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshLoading: false,
      myAlert: false,
      thisObj: {
        certificateType : null
      },
      myAlertTile: '提示',
      myAlertMsg: '您还未进行实名认证，请在实名认证通过后再进行该操作。',
    }
  }

  UNSAFE_componentWillMount() {

  }

  componentDidMount() {
    console.log('user:', this.props.user)

    // Http('get', "/api/user/mine", {
    // }).then(res => {
    //   this.setState({ isLoading: false })
    //   if (res.code == 200) {
    //   }
    // })

    Http('get', `/api/approve/mine/info`, {
    }).then(res => {
      this.setState({ isLoading: false })
      if (res.code == 200) {
        this.setState({thisObj: res.data || {} })
      }
    })

  }


  goRenzhengFunc(title){
    if (title == '实名认证') {
      if (this.state.thisObj.certificateType == 'business_license') {
        this.setState({myAlert: true, myAlertMsg: '您已经存在实名认证'})
        return
      }
      this.props.navigation.push('ApproveUser')
    }

    if (title == '艺术家认证') {
      if (!this.state.thisObj?.certificateType) {
        this.setState({myAlert: true, myAlertMsg: '您还未进行实名认证，请在实名认证通过后再进行该操作。'})
      }

      if (this.state.thisObj.certificateType == 'identification_card' || this.state.thisObj.certificateType == 'business_license') {
        this.props.navigation.push('ApproveArtist')
      }
    }

    if (title == '企业认证') {
      if (this.state.thisObj.certificateType == 'identification_card' ) {
        this.setState({myAlert: true, myAlertMsg: '您已经存在实名认证'})
        return
      }
      this.props.navigation.push('ApproveCompany')
    }
  }

  render() {
    return (
      <ScrollView style={Styles.container}>
        <MyAlert
          visible={this.state.myAlert}
          title={this.state.myAlertTile}
          message={this.state.myAlertMsg}
          buttons={[{ title: '我知道了', onPress: () => { this.setState({ myAlert: false }) } }]}
        />
        {/* Header */}
        <ImageBackground style={Styles.userBackImg} source={require('../../asserts/images/user/icon_mine_bg.png')} resizeMode='stretch'>
          {/* <View style={Styles.header}>
            <Text style={Styles.headerTitle}>认证中心</Text>
            <Text style={Styles.headerSubtitle}>认/证/体/验/更/多/功/能</Text>
          </View> */}
          <Image style={Styles.inviteIcon} source={require('../../asserts/images/publish/icon_attest_bg_hint.png')} resizeMode='contain' />
        </ImageBackground>

        {/* Verification List */}
        <View style={Styles.verificationList}>
          {this.renderVerificationItem('实名认证', '个人用户身份信息认证', this.state.thisObj?.certificateType == 'identification_card')}
          {this.renderVerificationItem('艺术家认证', '个人用户上传资料认证艺术家', this.props.user.artist )}
          {this.renderVerificationItem('企业认证', '企业用户上传资料认证企业', this.state.thisObj?.certificateType == 'business_license')}
        </View>

        {/* Description Table */}
        <View style={Styles.table}>
          <Text style={Styles.tableTitle}>身份认证说明</Text>
          <View style={Styles.tableRow}>
            <Text style={Styles.tableHeader}>功能</Text>
            <Text style={Styles.tableHeader}>未实名</Text>
            <Text style={Styles.tableHeader}>已实名</Text>
            <Text style={Styles.tableHeader}>艺术家</Text>
            <Text style={Styles.tableHeader}>企业</Text>
          </View>
          {this.renderTableRow('区块链存证', false, true, true, true)}
          {this.renderTableRow('版权登记', false, true, true, true)}
          {this.renderTableRow('作品展示', false, true, true, true)}
          {this.renderTableRow('参与投稿', false, true, true, false)}
          {this.renderTableRow('发布主题展', false, false, true, true)}
          {this.renderTableRow('推荐艺术家', false, false, true, false)}
        </View>
      </ScrollView>
    );
  }

  renderVerificationItem(title, description, verified, actionText = '已认证') {
    return (
      <View style={Styles.verificationItem}>
        {/* <View style={Styles.verificationIcon} /> */}
        {
          title == '实名认证' ?
            <Image style={Styles.verificationIcon} source={require('../../asserts/images/publish/icon_task_real.png')} resizeMode='contain' />
            :
            <></>
        }
        {
          title == '艺术家认证' ?
            <Image style={Styles.verificationIcon} source={require('../../asserts/images/publish/icon_attest_art.png')} resizeMode='contain' />
            :
            <></>
        }
        {
          title == '企业认证' ?
            <Image style={Styles.verificationIcon} source={require('../../asserts/images/publish/icon_attest_company.png')} resizeMode='contain' />
            :
            <></>
        }
        <View style={Styles.verificationText}>
          <Text style={Styles.verificationTitle}>{title}</Text>
          <Text style={Styles.verificationDescription}>{description}</Text>
        </View>
        <TouchableOpacity style={[Styles.verificationButton, verified && Styles.verified]}  onPress={()=> this.goRenzhengFunc(title)}>
          <Text style={[Styles.verificationButtonText, verified && Styles.verifiedText]}>{verified?'已认证': '去认证'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderTableRow(feature, unverified, verified, artist, enterprise) {
    return (
      <View>
        <View style={{ borderBottomColor: Colors.huiF5, borderBottomWidth: 1,}}></View>
        <View style={Styles.tableRow}>
          <Text style={Styles.tableCell}>{feature}</Text>
          <Text style={Styles.tableCell}>{unverified ? '✔️' : '✖️'}</Text>
          <Text style={Styles.tableCell}>{verified ? '✔️' : '✖️'}</Text>
          <Text style={Styles.tableCell}>{artist ? '✔️' : '✖️'}</Text>
          <Text style={Styles.tableCell}>{enterprise ? '✔️' : '✖️'}</Text>
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

export default connect(mapStateToProps, mapDispatchToProps)(VerificationCenter);

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  userBackImg: {
    paddingVertical: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  inviteIcon: {
    width: Metrics.px2dpi(918),
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
  verificationList: {
    backgroundColor: '#FFF',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  verificationIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    marginRight: 10,
  },
  verificationText: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  verificationDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  verificationButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: '#F0A23B',
  },
  verificationButtonText: {
    fontSize: 12,
    color: '#FFF',
  },
  verified: {
    backgroundColor: '#CCC',
  },
  verifiedText: {
    color: '#666',
  },
  table: {
    backgroundColor: '#FFF',
    marginTop: 10,
    padding: 15,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  tableHeader: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#999',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    color: Colors.subject,
  },
});
