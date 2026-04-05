import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import globalStyle from '../../styles/styles';
import { scale } from '../../utils/helper';
import { colors, fontFamily } from '../../constant';
import { SvgImg } from './SvgImg';

export default function InputBox({
  label,
  isRequired,
  errorMessge = '',
  value,
  onChangeText,
  editable = true,
  keyboardType = 'default',
  maxLength,
  maskInput = false,
  maskFormat = [],
  labelStyle,
  inputContainerStyle,
  placeHolder = '',
  mainContainer,
  returnKeyType,
  multiline = false,
  textIcon,
  ...otherProps
}) {
  return (
    <View
      style={{
        ...globalStyle.IBMainContainer,
        ...mainContainer,
      }}
    >
      <TextInput
        style={[
          globalStyle.IBTextInput,
          !editable && globalStyle.disableIBTextInput,
          inputContainerStyle,
          { fontFamily: fontFamily.montserratRegular, color: colors.white },
        ]}
        value={value}
        maxLength={maxLength}
        editable={editable}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeHolder ? placeHolder : label}
        returnKeyType={returnKeyType}
        multiline={multiline}
        placeholderTextColor={colors.white}
        {...otherProps}
      />
      {textIcon && (
        <TouchableOpacity
          style={{
            justifyContent: 'center',
            paddingHorizontal: scale(15),
          }}
        >
          <SvgImg iconName={textIcon} width={22} height={22} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputStyle: {
    backgroundColor: 'white',
  },
});
