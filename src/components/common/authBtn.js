import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontFamily } from '../../constant';

export function AuthBtn({
  isComplete = false,
  onPress = () => {},
  title = '',
  btnStyle = {},
}) {
  return (
    <TouchableOpacity
      style={[
        styles.verifyBtn,
        !isComplete && styles.verifyBtnDisabled,
        { ...btnStyle },
      ]}
      onPress={onPress}
      activeOpacity={isComplete ? 0.82 : 1}
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
  verifyBtnDisabled: {
    backgroundColor: colors.primary,
  },
  verifyBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },
});
