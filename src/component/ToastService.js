import { Toast, Text } from 'native-base';

// 创建一个 Toast 服务，用于触发 Toast
const ToastService = {
  showToast: ({ title, placement = 'bottom', duration = 3000 }) => {
    console.log('title', title)
    Toast.show({
      title: {title},
      duration: duration,
      placement: placement,
      render: () => {
        return <Text style={{
          height: 45, lineHeight: 45, borderRadius: 45, backgroundColor: '#F0F0F0', color: "#333333", paddingHorizontal: 20,
          // iOS阴影样式
          shadowColor: '#333',           // 阴影颜色
          shadowOffset: { width: 0, height: 4 },  // 阴影偏移
          shadowOpacity: 0.1,            // 阴影透明度
          shadowRadius: 5,               // 阴影模糊度
          // Android阴影样式
          elevation: 5,                  // 阴影深度
        }}>
          {title}
        </Text>;
      }
    })
  }
};

export default ToastService;