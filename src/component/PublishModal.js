import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { Colors, Metrics } from '../theme';
import Icon from 'react-native-vector-icons/AntDesign';

export default class PublishModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      animatedValue: new Animated.Value(0),
    };
  }

  show = () => {
    this.setState({ modalVisible: true }, () => {
      Animated.timing(this.state.animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  hide = () => {
    Animated.timing(this.state.animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      this.setState({ modalVisible: false });
    });
  };

  handleItemPress = (type) => {
    this.hide();
    if (this.props.onSelect) {
      this.props.onSelect(type);
    }
  };

  render() {
    const translateY = this.state.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0],
    });

    return (
      <Modal
        transparent
        visible={this.state.modalVisible}
        animationType="fade"
        onRequestClose={this.hide}
      >
        <TouchableWithoutFeedback onPress={this.hide}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalContent,
                  { transform: [{ translateY }] },
                ]}
              >
                <View style={styles.header}>
                  <TouchableOpacity onPress={this.hide}>
                    <Icon name="close" size={20} color={Colors.hui66} />
                  </TouchableOpacity>
                </View>

                {/* <TouchableOpacity 
                  style={styles.item}
                  onPress={() => this.handleItemPress('register')}
                >
                  <View style={[styles.iconContainer , { backgroundColor: '#EFE2BF' }]}>
                    <Image 
                      source={require('../asserts/images/home/icon_main_cert.png')}
                      style={styles.iconImage}
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>版权登记</Text>
                    <Text style={styles.subtitle}>为您的作品进行版权登记</Text>
                  </View>
                  <Icon name="right" size={16} color={Colors.hui66} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.item}
                  onPress={() => this.handleItemPress('copyright')}
                >
                  <View style={[styles.iconContainer , { backgroundColor: '#CDAA72' }]}>
                    <Image 
                      source={require('../asserts/images/home/icon_main_dci.png')}
                      style={styles.iconImage}
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>版权存证</Text>
                    <Text style={styles.subtitle}>为您的作品进行版权存证</Text>
                  </View>
                  <Icon name="right" size={16} color={Colors.hui66} />
                </TouchableOpacity> */}

                <TouchableOpacity 
                  style={styles.item}
                  onPress={() => this.handleItemPress('publish')}
                > 
                  <View style={[styles.iconContainer , { backgroundColor: '#E3EBEC' }]}>
                    <Image 
                      source={require('../asserts/images/publica/fabup.png')}
                      style={styles.iconImage}
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>发布作品</Text>
                    <Text style={styles.subtitle}>发布您的艺术作品</Text>
                  </View>
                  <Icon name="right" size={16} color={Colors.hui66} />
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // 适配 iPhone X 等机型
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.huiF5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.huiF5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain'
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: Colors.hei,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    color: Colors.hui66,
    marginTop: 4,
  },
}); 