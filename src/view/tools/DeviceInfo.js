import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text, TouchableOpacity, Alert, FlatList, InteractionManager, Platform } from 'react-native';
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/AntDesign';

import { Colors, Metrics } from '../../theme';

class DeviceInfoPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceInfo: {},
      loading: true,
      loadingStep: 0, // 加载步骤
    };
    // 缓存计算结果
    this.cachedSections = null;
    this.hasLoadedData = false; // 防止重复加载
    this.interactionHandle = null;
  }

  // 避免不必要的重新渲染
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.loading !== nextState.loading) return true;
    if (this.state.loadingStep !== nextState.loadingStep) return true;
    if (JSON.stringify(this.state.deviceInfo) !== JSON.stringify(nextState.deviceInfo)) return true;
    return false;
  }

  componentDidMount() {
    // 等待所有动画和交互完成后才开始加载数据，避免抖动
    this.interactionHandle = InteractionManager.runAfterInteractions(() => {
      this.getDeviceInfo();
    });
  }

  componentWillUnmount() {
    // 清除可能存在的异步操作
    if (this.interactionHandle) {
      this.interactionHandle.cancel();
    }
  }

  // 获取设备信息 - 分步加载优化性能
  getDeviceInfo = async () => {
    // 防止重复加载
    if (this.hasLoadedData) {
      return;
    }

    this.hasLoadedData = true;

    try {
      // 第一步：加载基本信息（同步，无需等待）
      const basicInfo = {
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        deviceId: DeviceInfo.getDeviceId(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        apiLevel: DeviceInfo.getApiLevel(),
      };

      const appInfo = {
        appVersion: DeviceInfo.getVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
        bundleId: DeviceInfo.getBundleId(),
        appName: DeviceInfo.getApplicationName(),
      };

      // 先显示基本信息
      this.setState({
        deviceInfo: {
          basic: basicInfo,
          app: appInfo,
        },
        loadingStep: 1
      });

      // 第二步：加载硬件信息（异步，但相对较快）
      let totalMemory;
      try {
        // 尝试同步方法
        totalMemory = DeviceInfo.getTotalMemorySync ? DeviceInfo.getTotalMemorySync() : DeviceInfo.getTotalMemory();
        console.log('Total Memory raw value:', totalMemory, 'Platform:', Platform.OS, 'Type:', typeof totalMemory);

        // 检查值是否合理（内存通常在256MB到64GB之间）
        if (typeof totalMemory === 'number' && totalMemory > 0 && totalMemory < 68719476736) { // 64GB
          console.log('Memory value seems reasonable');
        } else {
          console.log('Memory value seems unreasonable, setting to null');
          totalMemory = null;
        }
      } catch (error) {
        console.log('getTotalMemory error:', error);
        totalMemory = null;
      }

      const hardwareInfo = {
        totalMemory: totalMemory,
        batteryLevel: await DeviceInfo.getBatteryLevel().catch(() => null),
        isEmulator: DeviceInfo.isEmulatorSync(),
      };

      this.setState(prevState => ({
        deviceInfo: {
          ...prevState.deviceInfo,
          hardware: hardwareInfo,
        },
        loadingStep: 2
      }));

      // 第三步：加载存储信息（可能较慢）
      let freeDiskStorage, totalDiskCapacity;
      try {
        [freeDiskStorage, totalDiskCapacity] = await Promise.all([
          DeviceInfo.getFreeDiskStorage(),
          DeviceInfo.getTotalDiskCapacity(),
        ]);
        console.log('Storage info:', { freeDiskStorage, totalDiskCapacity });
      } catch (error) {
        console.log('Storage info error:', error);
        freeDiskStorage = null;
        totalDiskCapacity = null;
      }

      this.setState(prevState => ({
        deviceInfo: {
          ...prevState.deviceInfo,
          hardware: {
            ...prevState.deviceInfo.hardware,
            freeDiskStorage: freeDiskStorage,
            totalDiskCapacity: totalDiskCapacity,
          },
        },
        loadingStep: 3
      }));

      // 第四步：加载网络和显示信息
      const [ipAddress, fontScale] = await Promise.all([
        DeviceInfo.getIpAddress().catch(() => '获取失败'),
        DeviceInfo.getFontScale().catch(() => 1),
      ]);

      const networkInfo = {
        carrier: DeviceInfo.getCarrierSync(),
        ipAddress: ipAddress,
      };

      const displayInfo = {
        screenWidth: Metrics.screenWidth,
        screenHeight: Metrics.screenHeight,
        fontScale: fontScale,
        hasNotch: DeviceInfo.hasNotch(),
        hasDynamicIsland: DeviceInfo.hasDynamicIsland(),
      };

      const otherInfo = {
        deviceType: DeviceInfo.getDeviceType(),
        isTablet: DeviceInfo.isTablet(),
        supportedAbis: DeviceInfo.supportedAbisSync(),
        installReferrer: DeviceInfo.getInstallReferrerSync(),
      };

      this.setState({
        deviceInfo: {
          ...this.state.deviceInfo,
          network: networkInfo,
          display: displayInfo,
          other: otherInfo,
        },
        loading: false,
        loadingStep: 4
      });

    } catch (error) {
      console.error('获取设备信息失败:', error);
      Alert.alert('错误', '获取设备信息失败，请稍后重试');
      this.setState({ loading: false });
    }
  };

  // 格式化字节大小
  formatBytes = (bytes) => {
    console.log('formatBytes input:', bytes, typeof bytes);

    if (bytes === null || bytes === undefined) {
      console.log('Memory value is null/undefined');
      return '获取失败';
    }

    // 转换为数字
    const numBytes = Number(bytes);
    if (isNaN(numBytes) || numBytes <= 0) {
      console.log('Memory value is not a valid positive number:', numBytes);
      return '获取失败';
    }

    // 检查是否在合理范围内 (1MB 到 128GB)
    const minMemory = 1024 * 1024; // 1MB
    const maxMemory = 128 * 1024 * 1024 * 1024; // 128GB
    if (numBytes < minMemory || numBytes > maxMemory) {
      console.log('Memory value out of reasonable range:', numBytes);
      return '获取失败';
    }

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    const formatted = parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    console.log('formatBytes output:', formatted);
    return formatted;
  };

  // 格式化电池电量
  formatBattery = (level) => {
    return level ? `${Math.round(level * 100)}%` : '未知';
  };

  // 准备数据用于 FlatList（带缓存优化）
  getInfoSections = () => {
    const { deviceInfo } = this.state;

    // 如果数据没有变化，返回缓存的结果
    if (this.cachedSections && JSON.stringify(deviceInfo) === JSON.stringify(this.lastDeviceInfo)) {
      return this.cachedSections;
    }

    const sections = [];

    if (deviceInfo.basic) {
      sections.push({
        id: 'basic',
        title: '基本信息',
        icon: 'mobile1',
        data: Object.entries(deviceInfo.basic).map(([key, value]) => ({
          key,
          label: this.getLabelText(key),
          value: this.formatValue(key, value),
        }))
      });
    }



    if (deviceInfo.hardware) {
      sections.push({
        id: 'hardware',
        title: '硬件信息',
        icon: 'setting',
        data: Object.entries(deviceInfo.hardware).map(([key, value]) => ({
          key,
          label: this.getLabelText(key),
          value: this.formatValue(key, value),
        }))
      });
    }

    if (deviceInfo.network) {
      sections.push({
        id: 'network',
        title: '网络信息',
        icon: 'wifi',
        data: Object.entries(deviceInfo.network).map(([key, value]) => ({
          key,
          label: this.getLabelText(key),
          value: this.formatValue(key, value),
        }))
      });
    }

    if (deviceInfo.display) {
      sections.push({
        id: 'display',
        title: '显示信息',
        icon: 'eyeo',
        data: Object.entries(deviceInfo.display).map(([key, value]) => ({
          key,
          label: this.getLabelText(key),
          value: this.formatValue(key, value),
        }))
      });
    }

    if (deviceInfo.other) {
      sections.push({
        id: 'other',
        title: '其他信息',
        icon: 'infocirlceo',
        data: Object.entries(deviceInfo.other).map(([key, value]) => ({
          key,
          label: this.getLabelText(key),
          value: this.formatValue(key, value),
        }))
      });
    }

    // 缓存结果
    this.cachedSections = sections;
    this.lastDeviceInfo = { ...deviceInfo };

    return sections;
  };

  // 渲染单个信息行
  renderInfoItem = ({ item }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{item.label}:</Text>
      <Text style={styles.infoValue}>{item.value}</Text>
    </View>
  );

  // 渲染信息卡片
  renderInfoCard = ({ item: section }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name={section.icon} size={20} color={Colors.subject} />
          <Text style={styles.cardTitle}>{section.title}</Text>
        </View>
        <View style={styles.cardContent}>
          <FlatList
            data={section.data}
            renderItem={this.renderInfoItem}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </View>
    );
  };

  // 获取字段显示名称
  getLabelText = (key) => {
    const labels = {
      // 基本信息
      brand: '设备品牌',
      model: '设备型号',
      deviceId: '设备ID',
      systemName: '系统名称',
      systemVersion: '系统版本',
      apiLevel: 'API等级',

      // 应用信息
      appVersion: '应用版本',
      buildNumber: '构建号',
      bundleId: '包名',
      appName: '应用名称',

      // 硬件信息
      totalMemory: '总内存',
      freeDiskStorage: '可用存储',
      totalDiskCapacity: '总存储',
      batteryLevel: '电池电量',
      isEmulator: '是否模拟器',

      // 网络信息
      carrier: '运营商',
      ipAddress: 'IP地址',

      // 显示信息
      screenWidth: '屏幕宽度',
      screenHeight: '屏幕高度',
      fontScale: '字体缩放',
      hasNotch: '是否有刘海',
      hasDynamicIsland: '是否有灵动岛',

      // 其他信息
      deviceType: '设备类型',
      isTablet: '是否平板',
      supportedAbis: '支持架构',
      installReferrer: '安装来源',
    };
    return labels[key] || key;
  };

  // 格式化值显示
  formatValue = (key, value) => {
    switch (key) {
      case 'totalMemory':
        // 内存信息格式化显示
        return this.formatBytes(value);
      case 'freeDiskStorage':
      case 'totalDiskCapacity':
        // 存储信息直接显示原始字节数，避免格式化问题
        if (value === null || value === undefined) return '获取失败';
        return `${value} 字节`;
      case 'batteryLevel':
        return this.formatBattery(value);
      case 'isEmulator':
      case 'hasNotch':
      case 'hasDynamicIsland':
      case 'isTablet':
        return value ? '是' : '否';
      case 'supportedAbis':
        return Array.isArray(value) ? value.join(', ') : value;
      default:
        return value || '未知';
    }
  };

  // 刷新设备信息
  refreshInfo = () => {
    this.hasLoadedData = false; // 重置加载标记
    this.setState({ loading: true, loadingStep: 0 });
    this.getDeviceInfo();
  };

  // 获取加载提示文本
  getLoadingText = () => {
    const { loadingStep } = this.state;
    const loadingTexts = [
      '正在获取设备信息...',
      '正在加载硬件信息...',
      '正在检查存储空间...',
      '正在获取网络信息...',
    ];
    return loadingTexts[loadingStep] || '正在加载...';
  };

  render() {
    const { loading } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => this.props.navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>设备信息</Text>
          <TouchableOpacity
            onPress={this.refreshInfo}
            style={styles.refreshButton}
            disabled={loading}
          >
            <Icon name="reload1" size={20} color={loading ? '#ccc' : Colors.subject} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{this.getLoadingText()}</Text>
          </View>
        ) : (
          <FlatList
            style={styles.scrollView}
            data={this.getInfoSections()}
            renderItem={this.renderInfoCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            initialNumToRender={3}
            maxToRenderPerBatch={2}
            windowSize={5}
            removeClippedSubviews={true}
            legacyImplementation={false}
          />
        )}
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(DeviceInfoPage);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.bai,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 15,
  },
  card: {
    backgroundColor: Colors.bai,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  cardContent: {
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});