import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { fontFamily } from '../../constant';

export function Hyperlink({
  title = '',
  linkStyle = {},
  textStyle = {},
  onPress = () => {},
}) {
  return (
    <TouchableOpacity
      style={{
        ...linkStyle,
      }}
      onPress={onPress}
    >
      <Text
        style={{
          fontSize: 15,
          color: 'white',
          // alignSelf: 'center',
          textDecorationLine: 'underline',
          ...textStyle,
          fontFamily: fontFamily.montserratSemiBold,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
