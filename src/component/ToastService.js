import React from 'react';
import { Toast, Text } from 'native-base';
import { StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * 统一 Toast：默认顶部弹出，约会/情侣气质
 * type: default | success | warn | error | diamond
 */

const THEME = {
  default: {
    bg: '#2A1F24',
    color: '#FFF',
    icon: 'heart',
    iconColor: '#FFB4C4',
  },
  success: {
    bg: '#2A1F24',
    color: '#FFF',
    icon: 'checkmark-circle',
    iconColor: '#7DCEA0',
  },
  warn: {
    bg: '#2A1F24',
    color: '#FFF',
    icon: 'alert-circle',
    iconColor: '#F0A35A',
  },
  error: {
    bg: '#2A1F24',
    color: '#FFF',
    icon: 'close-circle',
    iconColor: '#E86B8A',
  },
  diamond: {
    bg: '#2A1F24',
    color: '#FFF',
    icon: 'diamond',
    iconColor: '#E8C07A',
  },
};

function ToastBubble({ title, type = 'default' }) {
  const t = THEME[type] || THEME.default;
  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }]}>
      <Ionicons
        name={t.icon}
        size={16}
        color={t.iconColor}
        style={styles.icon}
      />
      <Text style={[styles.txt, { color: t.color }]} numberOfLines={3}>
        {title}
      </Text>
    </View>
  );
}

const ToastService = {
  /**
   * @param {{ title: string, placement?: 'top'|'bottom', duration?: number, type?: string }} opts
   */
  showToast({
    title,
    placement = 'top',
    duration = 2600,
    type = 'default',
  } = {}) {
    if (!title) return;
    Toast.show({
      title,
      duration,
      placement,
      render: () => <ToastBubble title={String(title)} type={type} />,
    });
  },

  success(title, extra = {}) {
    ToastService.showToast({ title, type: 'success', ...extra });
  },

  warn(title, extra = {}) {
    ToastService.showToast({ title, type: 'warn', ...extra });
  },

  error(title, extra = {}) {
    ToastService.showToast({ title, type: 'error', ...extra });
  },

  diamond(title, extra = {}) {
    ToastService.showToast({ title, type: 'diamond', ...extra });
  },
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginHorizontal: 20,
    maxWidth: 340,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#2A1F24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  icon: {
    marginRight: 8,
  },
  txt: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});

export default ToastService;
