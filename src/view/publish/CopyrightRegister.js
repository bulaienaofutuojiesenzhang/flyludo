import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image, Text, TextInput, View } from 'react-native';
import { connect } from 'react-redux';
import FastImage from 'react-native-fast-image';
import { launchImageLibrary } from 'react-native-image-picker';

import { Header, Loading, ToastService, PaymentModal } from '../../component';
import Config from '../../config/index';
import { Colors, Metrics } from '../../theme';
import Http from '../../utils/HttpPost';
import HttpFrom from '../../utils/HttpFrom';
import { requestMediaPermission } from '../../utils/PermissionHelper'; 

class CopyrightRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      name: '',
      desc: '',
      upImg: '',
      type: '1', // 作品类型
      width: '',
      height: '',
      createDate: '',
      finishAddress: '',
      price: 48.00,
      showSuccessView: false,
    }
    this.paymentModalRef = React.createRef();
  }

  componentDidMount() {
    
  }

  // 上传图片
  async toUpImgFunc() {
    // 先请求权限
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) {
      ToastService.showToast({ title: "需要相册权限才能上传图片" });
      return;
    }

    let photoOptions = {
      mediaType: 'photo',
      quality: 0.8,
    };
    
    launchImageLibrary(photoOptions, (response) => {
      if (response.didCancel) return;
      
      response = response?.assets[0];
      if (response.uri) {
        this.setState({ isLoading: true });
        HttpFrom.imgUpData(response.uri, response.type, response.fileName)
          .then(res => {
            this.setState({ isLoading: false });
            if (res.code == 200) {
              this.setState({ upImg: res.data.name });
            }
          })
          .catch(err => {
            console.log('请求失败', err);
            this.setState({ isLoading: false });
          });
      }
    });
  }

  // 提交
  toSubmitFunc = async () => {
    const { name, desc, upImg, type, width, height, createDate, finishAddress } = this.state;
    const paymentModal = this.paymentModalRef.current;

    let params = {
      dataName: name,
      intro: desc,
    dataUrl: upImg,
  };
    const ress = await Http('post', '/api/dict/add', params);
    console.log('ress',ress)
    if (ress.code === 0) {
      console.log('11111')
      
      // console.log('222', paymentModal)
      // if (!paymentModal) {
        console.log('333', '????')
        console.log('333', this.state.price, 'res.data.id', ress.data.id, '????')
        paymentModal.show({
          amount: this.state.price,
          dataId: ress.data.id,
          type: 'dict',
          onPaymentComplete: (method, success) => {
            console.log('onPaymentComplete??', method, success);
            if (success) {
              this.setState({ showSuccessView: true });
            }
          }
        });
      // }
    }
   
    return;


    if (this.state.isLoading) return;

    
    
    if (!name || !upImg) {
      ToastService.showToast({ title: "请完善信息" });
      return;
    }


    this.setState({ isLoading: true });
    const paymentModals = this.paymentModalRef.current;
    try {
      Http('post', '/api/dict/add', params).then((res)=>{

        this.setState({ isLoading: false });
        console.log('res.code === 200',res.code,res.code === 200)
        // if (res.code === 200) {
          ToastService.showToast({ title: "提交成功" });
          console.log('11111')
          
          console.log('222')
          if (paymentModals) {
            console.log('333', this.state.price, "es.data.id", )
            paymentModals.show({
              amount: this.state.price,
              dataId: "res.data.id",
              type: 'dict',
              onPaymentComplete: (method, success) => {
                console.log('onPaymentComplete??', method, success);
                if (success) {
                  this.setState({ showSuccessView: true });
                }
              }
            });
          }
      });
      
      // }
    } catch (error) {
      this.setState({ isLoading: false });
      console.log('提交失败:', error);
    }
  }

  render() {
    if (this.state.showSuccessView) {
      return (
        <View style={styles.successContainer}>
          <Image 
            source={require('../../asserts/images/home/icon_mine_unlogon.png')}
            style={styles.successIcon}
          />
          <Text style={styles.successTitle}>支付成功</Text>
          <Text style={styles.successDesc1}>
            已提交后台审核
          </Text>
          <Text style={styles.successDesc1}>
            将于3-6个工作日内审核完成
          </Text>
          <Text style={styles.successDesc}>
            审核成功后将颁发版权局登记证书
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={() => {
                this.props.navigation.navigate('MyBqDetail');
              }}
            >
              <Text style={styles.primaryButtonText}>查看我的登记</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={() => {
                this.props.navigation.goBack()
              }}
            >
              <Text style={styles.secondaryButtonText}>返回</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Loading showLoading={this.state.isLoading} />
        
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.section}>
            <View style={styles.uploadContainer}>
              <Text style={styles.sectionTitle}>
                作品图片
                <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity 
                style={styles.uploadBox}
                onPress={() => this.toUpImgFunc()}
              >
                {this.state.upImg ? (
                  <FastImage 
                    source={{ uri: Config.File_PATH + this.state.upImg }} 
                    style={styles.uploadedImage}
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Image 
                      source={require('../../asserts/images/publish/icon_add.png')} 
                      style={styles.addIcon}
                    />
                    <Text style={styles.uploadText}>上传作品图片</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>作品信息</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  作品名称
                  <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入作品名称"
                  placeholderTextColor={Colors.huiCc}
                  value={this.state.name}
                  onChangeText={(value) => this.setState({ name: value })}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>补充说明</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="请输入补充说明"
                  placeholderTextColor={Colors.huiCc}
                  multiline
                  numberOfLines={4}
                  value={this.state.desc}
                  onChangeText={(value) => this.setState({ desc: value })}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => this.toSubmitFunc()}
          >
            <Text style={styles.submitText}>提交</Text>
          </TouchableOpacity>
        </ScrollView>
        
        <PaymentModal 
          ref={this.paymentModalRef} 
          onPaymentComplete={(method, success) => {
            if (success) {
              this.setState({ showSuccessView: true });
            }
          }}
        />
      </>
    );
  }
}

const styles = StyleSheet.create({
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.hei,
    marginBottom: 12,
  },
  uploadContainer: {
    backgroundColor: Colors.bai,
    padding: 16,
  },
  uploadBox: {
    width: Metrics.px2dp(300),
    height: Metrics.px2dp(300),
    backgroundColor: Colors.huiF5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholder: {
    alignItems: 'center',
  },
  addIcon: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: Colors.hui66,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  formContainer: {
    backgroundColor: Colors.bai,
    padding: 16,
    marginTop: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.hei,
    marginBottom: 8,
  },
  input: {
    height: 44,
    backgroundColor: Colors.huiF5,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.hei,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  sizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeInput: {
    width: 100,
    marginRight: 8,
  },
  sizeUnit: {
    fontSize: 14,
    color: Colors.hui66,
    marginRight: 16,
  },
  submitButton: {
    height: 44,
    backgroundColor: Colors.subject,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 24,
  },
  submitText: {
    fontSize: 16,
    color: Colors.bai,
    fontWeight: '500',
  },
  required: {
    color: '#FF0000',
    marginLeft: 4,
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.bai,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.hei,
    marginBottom: 12,
  },
  successDesc: {
    fontSize: 15,
    color: Colors.hui66,
    textAlign: 'center',
    marginBottom: 48,
  },
  successDesc1: {
    fontSize: 15,
    color: Colors.hui66,
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: Colors.subject,
  },
  secondaryButton: {
    backgroundColor: Colors.huiF5,
  },
  primaryButtonText: {
    color: Colors.bai,
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: Colors.hui66,
    fontSize: 16,
    fontWeight: '500',
  },
});

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(CopyrightRegister); 