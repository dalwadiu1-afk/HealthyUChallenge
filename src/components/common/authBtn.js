import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontFamily } from '../../constant';

export function AuthBtn({
  isComplete = false,
  onPress = () => {},
  title = '',
  btnStyle = {},
  ...btnProps
}) {
  return (
    <TouchableOpacity
      style={[styles.verifyBtn, { ...btnStyle }]}
      onPress={onPress}
      activeOpacity={isComplete ? 0.82 : 1}
      {...btnProps}
    >
      <Text style={styles.verifyBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  verifyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 49,
    alignItems: 'center',
  },

  verifyBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },
});
