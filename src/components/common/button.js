import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { fontFamily } from '../../constant';

export function Button({
  backgroundColor = 'rgba(143, 175, 120)',
  buttonStyle = {},
  textStyle = {},
  title = '',
  onPress = () => {},
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: backgroundColor,
        padding: 20,
        borderRadius: 27.5,

        ...buttonStyle,
      }}
    >
      <Text
        style={{
          alignSelf: 'center',
          fontSize: 15,
          color: 'white',
          fontFamily: fontFamily.montserratSemiBold,
          ...textStyle,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
