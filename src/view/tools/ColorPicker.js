import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Text, TouchableOpacity, ScrollView, TextInput, View as RNView, Clipboard } from 'react-native';
import { View } from 'native-base';
import Icons from 'react-native-vector-icons/AntDesign';
import { Colors } from '../../theme';

class ColorPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentColor: '#FF6B9D',
      hexInput: 'FF6B9D',
      r: 255,
      g: 107,
      b: 157,
      savedColors: [],
    };
  }

  // Hex转RGB
  hexToRgb = (hex) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  };

  // RGB转Hex
  rgbToHex = (r, g, b) => {
    const toHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  // 更新颜色
  updateColor = (r, g, b) => {
    const hex = this.rgbToHex(r, g, b);
    this.setState({
      r,
      g,
      b,
      currentColor: hex,
      hexInput: hex.replace('#', ''),
    });
  };

  // 从Hex输入更新
  updateFromHex = (hex) => {
    const cleanHex = hex.replace('#', '').toUpperCase();
    if (/^[0-9A-F]{6}$/i.test(cleanHex)) {
      const rgb = this.hexToRgb(cleanHex);
      this.setState({
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        currentColor: '#' + cleanHex,
        hexInput: cleanHex,
      });
    }
  };

  // 保存颜色
  saveColor = () => {
    const { currentColor, savedColors } = this.state;
    if (!savedColors.includes(currentColor)) {
      this.setState({
        savedColors: [...savedColors, currentColor],
      });
    }
  };

  // 删除保存的颜色
  removeSavedColor = (color) => {
    this.setState({
      savedColors: this.state.savedColors.filter(c => c !== color),
    });
  };

  // 复制到剪贴板
  copyToClipboard = (text, type) => {
    Clipboard.setString(text);
    alert(`${type}已复制到剪贴板`);
  };

  // 随机颜色
  randomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    this.updateColor(r, g, b);
  };

  // 预设颜色
  presetColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DFE6E9', '#74B9FF', '#A29BFE',
    '#FD79A8', '#FDCB6E', '#6C5CE7', '#00B894',
    '#FF7675', '#00D2D3', '#2D3436', '#FFFFFF',
  ];

  render() {
    const { currentColor, hexInput, r, g, b, savedColors } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* 顶部导航 */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => this.props.navigation.goBack()}
          >
            <Icons name="left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>颜色助手</Text>
          <TouchableOpacity 
            style={styles.randomBtn} 
            onPress={this.randomColor}
          >
            <Icons name="sync" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* 颜色预览 */}
            <View style={styles.previewSection}>
              <View style={[styles.colorPreview, { backgroundColor: currentColor }]}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={this.saveColor}
                >
                  <Icons name="heart" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.colorName}>{currentColor}</Text>
            </View>

            {/* HEX输入 */}
            <View style={styles.inputSection}>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>HEX</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.hashText}>#</Text>
                  <TextInput
                    style={styles.hexInput}
                    value={hexInput}
                    onChangeText={(text) => this.setState({ hexInput: text })}
                    onBlur={() => this.updateFromHex(hexInput)}
                    maxLength={6}
                    autoCapitalize="characters"
                  />
                </View>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => this.copyToClipboard(currentColor, 'HEX')}
                >
                  <Icons name="copy1" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* RGB输入 */}
            <View style={styles.slidersSection}>
              <View style={styles.sliderRow}>
                <View style={[styles.sliderLabel, { backgroundColor: '#FF6B6B' }]}>
                  <Text style={styles.sliderLabelText}>R</Text>
                </View>
                <View style={styles.sliderProgressBar}>
                  <View style={[styles.sliderProgress, { width: `${(r / 255) * 100}%`, backgroundColor: '#FF6B6B' }]} />
                </View>
                <TextInput
                  style={styles.colorInput}
                  value={String(r)}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    this.updateColor(Math.max(0, Math.min(255, num)), g, b);
                  }}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>

              <View style={styles.sliderRow}>
                <View style={[styles.sliderLabel, { backgroundColor: '#4ECDC4' }]}>
                  <Text style={styles.sliderLabelText}>G</Text>
                </View>
                <View style={styles.sliderProgressBar}>
                  <View style={[styles.sliderProgress, { width: `${(g / 255) * 100}%`, backgroundColor: '#4ECDC4' }]} />
                </View>
                <TextInput
                  style={styles.colorInput}
                  value={String(g)}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    this.updateColor(r, Math.max(0, Math.min(255, num)), b);
                  }}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>

              <View style={styles.sliderRow}>
                <View style={[styles.sliderLabel, { backgroundColor: '#5DADE2' }]}>
                  <Text style={styles.sliderLabelText}>B</Text>
                </View>
                <View style={styles.sliderProgressBar}>
                  <View style={[styles.sliderProgress, { width: `${(b / 255) * 100}%`, backgroundColor: '#5DADE2' }]} />
                </View>
                <TextInput
                  style={styles.colorInput}
                  value={String(b)}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    this.updateColor(r, g, Math.max(0, Math.min(255, num)));
                  }}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>

              {/* RGB复制按钮 */}
              <TouchableOpacity
                style={styles.rgbCopyBtn}
                onPress={() => this.copyToClipboard(`rgb(${r}, ${g}, ${b})`, 'RGB')}
              >
                <Text style={styles.rgbCopyText}>复制 RGB({r}, {g}, {b})</Text>
              </TouchableOpacity>
            </View>

            {/* 预设颜色 */}
            <View style={styles.presetsSection}>
              <Text style={styles.sectionTitle}>🎨 预设颜色</Text>
              <View style={styles.colorsGrid}>
                {this.presetColors.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.colorTile, { backgroundColor: color }]}
                    onPress={() => {
                      const rgb = this.hexToRgb(color);
                      this.updateColor(rgb.r, rgb.g, rgb.b);
                    }}
                  />
                ))}
              </View>
            </View>

            {/* 保存的颜色 */}
            {savedColors.length > 0 && (
              <View style={styles.savedSection}>
                <Text style={styles.sectionTitle}>💾 保存的颜色</Text>
                <View style={styles.colorsGrid}>
                  {savedColors.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.colorTile, { backgroundColor: color }]}
                      onPress={() => {
                        const rgb = this.hexToRgb(color);
                        this.updateColor(rgb.r, rgb.g, rgb.b);
                      }}
                      onLongPress={() => this.removeSavedColor(color)}
                    >
                      <View style={styles.savedColorOverlay}>
                        <Icons name="close" size={12} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.tipText}>💡 长按删除保存的颜色</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: Colors.bai,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 5,
  },
  randomBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  previewSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  colorPreview: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  saveBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  inputSection: {
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 15,
    width: 40,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  hashText: {
    fontSize: 18,
    color: '#999',
    marginRight: 5,
  },
  hexInput: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    paddingVertical: 10,
  },
  copyBtn: {
    padding: 10,
    marginLeft: 10,
  },
  slidersSection: {
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sliderLabel: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sliderLabelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  sliderProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  sliderProgress: {
    height: '100%',
    borderRadius: 4,
  },
  colorInput: {
    width: 50,
    height: 36,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  rgbCopyBtn: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  rgbCopyText: {
    fontSize: 14,
    color: '#666',
  },
  presetsSection: {
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  savedSection: {
    backgroundColor: Colors.bai,
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorTile: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  savedColorOverlay: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ColorPicker;

