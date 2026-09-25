import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * 全局对话框服务（授权确认 / 钻石不足 / 通用确认）
 * 需在 App 根节点挂载 <AppDialogHost />
 */

const ROSE = '#E86B8A';
const ROSE_DEEP = '#D44D6E';
const GOLD = '#C19769';
const INK = '#2A1F24';
const MUTED = '#8A6F78';
const BG = '#FFF8F5';

let _handler = null;
let _seq = 0;

function emit(payload) {
  if (typeof _handler === 'function') {
    _handler(payload);
  }
}

const AppDialog = {
  /** 内部：给 Host 注册 */
  _bind(handler) {
    _handler = handler;
  },

  hide() {
    emit(null);
  },

  /**
   * 通用弹窗
   * @param {{ title, message?, type?: 'default'|'permission'|'diamond'|'confirm', buttons?: [{text, style?, onPress?}] }} opts
   */
  show(opts = {}) {
    const id = ++_seq;
    const buttons = (opts.buttons || [{ text: '我知道了' }]).map((b) => ({
      text: b.text || '确定',
      style: b.style || 'default',
      onPress: b.onPress,
    }));
    emit({
      id,
      title: opts.title || '提示',
      message: opts.message || '',
      type: opts.type || 'default',
      buttons,
    });
    return id;
  },

  /** Promise 版确认：resolve(true/false) */
  confirm({
    title = '请确认',
    message = '',
    type = 'confirm',
    cancelText = '取消',
    confirmText = '确定',
  } = {}) {
    return new Promise((resolve) => {
      AppDialog.show({
        title,
        message,
        type,
        buttons: [
          {
            text: cancelText,
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: confirmText,
            style: 'primary',
            onPress: () => resolve(true),
          },
        ],
      });
    });
  },

  /** 相册授权说明 */
  permission({
    title = '开启相册权限',
    message = '同城有约需要访问相册，方便你上传照片体验飞行棋互动与 AI 玩法。',
  } = {}) {
    return AppDialog.confirm({
      title,
      message,
      type: 'permission',
      cancelText: '暂不',
      confirmText: '同意开启',
    });
  },

  /** 钻石不足 */
  diamondInsufficient({
    title = '钻石不足',
    message = '当前钻石不够这次玩法啦，充值后就能继续和 Ta 互动。',
    cancelText = '再看看',
    confirmText = '去充值',
  } = {}) {
    return AppDialog.confirm({
      title,
      message,
      type: 'diamond',
      cancelText,
      confirmText,
    });
  },
};

const TYPE_META = {
  default: { icon: 'heart', color: ROSE, tint: 'rgba(232,107,138,0.12)' },
  confirm: { icon: 'star', color: GOLD, tint: 'rgba(193,151,105,0.14)' },
  permission: {
    icon: 'images-outline',
    color: ROSE,
    tint: 'rgba(232,107,138,0.12)',
  },
  diamond: {
    icon: 'diamond',
    color: GOLD,
    tint: 'rgba(193,151,105,0.16)',
  },
};

export class AppDialogHost extends React.Component {
  state = { payload: null };

  componentDidMount() {
    AppDialog._bind((payload) => {
      this.setState({ payload });
    });
  }

  componentWillUnmount() {
    AppDialog._bind(null);
  }

  onPressBtn = (btn) => {
    this.setState({ payload: null }, () => {
      if (typeof btn.onPress === 'function') {
        try {
          btn.onPress();
        } catch (e) {}
      }
    });
  };

  render() {
    const { payload } = this.state;
    if (!payload) return null;
    const meta = TYPE_META[payload.type] || TYPE_META.default;
    const buttons = payload.buttons || [];

    return (
      <Modal
        visible
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => this.setState({ payload: null })}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            /* 点遮罩不关闭，避免误触授权 */
          }}
        >
          <View style={styles.mask}>
            <TouchableWithoutFeedback>
              <View style={styles.card}>
                <View
                  style={[styles.iconWrap, { backgroundColor: meta.tint }]}
                >
                  <Ionicons name={meta.icon} size={28} color={meta.color} />
                </View>
                <Text style={styles.title}>{payload.title}</Text>
                {!!payload.message && (
                  <Text style={styles.message}>{payload.message}</Text>
                )}
                <View
                  style={[
                    styles.btnRow,
                    buttons.length === 1 && styles.btnRowSingle,
                  ]}
                >
                  {buttons.map((btn, idx) => {
                    const isPrimary =
                      btn.style === 'primary' ||
                      (buttons.length > 1 && idx === buttons.length - 1);
                    const isCancel = btn.style === 'cancel';
                    return (
                      <TouchableOpacity
                        key={`${btn.text}_${idx}`}
                        style={[
                          styles.btn,
                          isPrimary && styles.btnPrimary,
                          isCancel && styles.btnCancel,
                          buttons.length === 1 && styles.btnSolo,
                        ]}
                        activeOpacity={0.85}
                        onPress={() => this.onPressBtn(btn)}
                      >
                        <Text
                          style={[
                            styles.btnTxt,
                            isPrimary && styles.btnTxtPrimary,
                            isCancel && styles.btnTxtCancel,
                          ]}
                        >
                          {btn.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    backgroundColor: 'rgba(42, 31, 36, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: BG,
    borderRadius: 20,
    paddingTop: 28,
    paddingBottom: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 107, 138, 0.18)',
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: INK,
    textAlign: 'center',
  },
  message: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: MUTED,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 22,
    width: '100%',
  },
  btnRowSingle: {
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(193, 151, 105, 0.28)',
    marginHorizontal: 5,
  },
  btnSolo: {
    maxWidth: 180,
    alignSelf: 'center',
  },
  btnCancel: {
    backgroundColor: '#FFF',
    borderColor: 'rgba(138, 111, 120, 0.2)',
  },
  btnPrimary: {
    backgroundColor: ROSE,
    borderColor: ROSE,
  },
  btnTxt: {
    fontSize: 15,
    fontWeight: '700',
    color: GOLD,
  },
  btnTxtCancel: {
    color: MUTED,
    fontWeight: '600',
  },
  btnTxtPrimary: {
    color: '#FFF',
  },
});

export default AppDialog;
