import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Colors, Metrics } from '../theme';

const { height } = Dimensions.get('window');

export default class BottomPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      animatedValue: new Animated.Value(0),
      selectedValue: props.value || props.items?.[0]?.value || '',
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ selectedValue: this.props.value });
    }
  }

  show = () => {
    this.setState({ 
      modalVisible: true,
      selectedValue: this.props.value || this.state.selectedValue
    }, () => {
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

  onConfirm = () => {
    const value = this.state.selectedValue;
    this.props.onValueChange && this.props.onValueChange(value);
    this.hide();
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
                    <Text style={styles.buttonText}>取消</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={this.onConfirm}>
                    <Text style={[styles.buttonText, { color: Colors.subject }]}>确定</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  selectedValue={this.state.selectedValue}
                  onValueChange={(value) => this.setState({ selectedValue: value })}
                >
                  {this.props.items.map((item) => (
                    <Picker.Item
                      key={item.value}
                      label={item.label}
                      value={item.value}
                      color={Colors.hei}
                    />
                  ))}
                </Picker>
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
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCCCCC',
  },
  buttonText: {
    fontSize: 16,
    color: '#666666',
  },
}); 