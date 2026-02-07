import React from 'react';
import {
  TouchableOpacity,
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground
} from 'react-native'
import Icons from 'react-native-vector-icons/AntDesign';
import { Metrics, Colors } from '../theme';

export default class Alert extends React.PureComponent {

  constructor(props) {
    super(props);
  }

  render() {
    return <Modal style={Styles.modal} visible={this.props.visible} transparent={true} >
      <View style={[Styles.mainView, { opacity: this.props.opacity || 1, backgroundColor: this.props.backgroundColor || 'rgba(0,0,0,0.5)' }]}>

        <View style={Styles.contentView}>
          <View style={Styles.topView}>
            <TouchableOpacity onPress={() => { this.props.buttons[0].onPress && this.props.buttons[0].onPress() }}>
              {/* <Icons name='close' style={Styles.close_btn} /> */}
            </TouchableOpacity>
          </View>
          <View style={Styles.centerView}>
            {
              this.props.title.length > 0 && 
              <View>
                <ImageBackground style={Styles.userBackImg} source={require('../asserts/images/utlis/icon_explain.png')} resizeMode='stretch'>
                  <Text style={StyleSheet.compose(Styles.title, this.props.titleStyle)}>{this.props.title}</Text>
                </ImageBackground>
              </View>
              
            }
            {
              this.props.message.length > 0 && <Text style={StyleSheet.compose(Styles.content, this.props.messageStyle)}>{this.props.message}</Text>
            }

            {
              this.props.component && 
              <View style={StyleSheet.compose(Styles.componentView, this.props.componentStyle)}>
                {this.props.component}
              </View>
            }
          </View>

          {
            this.props.buttons.length == 1 ?
              <View style={Styles.btnView}>
                <TouchableOpacity style={{ width: 120 }} onPress={() => { this.props.buttons[0].onPress && this.props.buttons[0].onPress() }} >
                  <Text style={{textAlign: 'center', color: Colors.subject, fontSize: 14, fontWeight: 'bold'}}>{this.props.buttons[0].title}</Text>
                </TouchableOpacity>
              </View>
              :
              <View style={Styles.moreBtnView}>
                <TouchableOpacity
                  style={{ width: 100, alignItems: "center"}}
                  onPress={() => { this.props.buttons[0].onPress && this.props.buttons[0].onPress() }} >
                  <Text style={{ fontSize: 14,fontWeight: 'bold', color: Colors.subject, textAlign: 'center', }}>{this.props.buttons[0].title?this.props.buttons[0].title:'拒绝'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: 100 }} onPress={() => { this.props.buttons[1].onPress && this.props.buttons[1].onPress() }} >
                    <Text style={{textAlign: 'center', color: Colors.subject, fontSize: 14, fontWeight: 'bold'}}>{this.props.buttons[1].title}</Text>
                </TouchableOpacity>
              </View>
          }

        </View>

      </View>
    </Modal>
  }
}


Alert.defaultProps = {
  message: '',
  title: '',
  buttons: [{ title: '我知道了', onPress: () => { } }],
}

const Styles = StyleSheet.create({
  modal: {
    flex: 1
  },
  mainView: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  contentView: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 5
  },
  close_btn: {
    width: 35,
    height: 35,
  },
  topView: {
    justifyContent: 'flex-end',
    flexDirection: 'row'
  },
  userBackImg:{
    width: Metrics.px2dpi(660),
    height: Metrics.px2dpi(114),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    color: Colors.bai,
    fontSize: 16,
    fontWeight: 'bold'
  },
  content: {
    fontSize: 14,
    lineHeight: 24,
    marginHorizontal: 20,
    marginVertical: 10,
    color: Colors.hui66,
    textAlign: 'center'
  },
  centerView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -3,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBlockColor: Colors.huiED
  },
  btnView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15
  },
  moreBtnView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20
  },
  componentView: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },

})
