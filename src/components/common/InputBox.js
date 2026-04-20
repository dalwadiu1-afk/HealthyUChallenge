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
import { eyeIcon } from '../../assets/images';

export default function InputBox({
  label,
  isRequired,
  errorMessage = '',
  value,
  onChangeText,
  editable = true,
  keyboardType = 'default',
  maxLength,
  secureText,
  labelStyle,
  inputContainerStyle,
  placeHolder = '',
  mainContainer,
  returnKeyType,
  multiline = false,
  textIcon,
  btnStyle,
  otherSvgProps,
  textInputView,
  onRightIconPress = () => {},
  ...otherProps
}) {
  return (
    <View style={{ flex: 1, ...mainContainer }}>
      {label && (
        <Text style={{ ...styles.inputLabel, labelStyle }}>{label}</Text>
      )}
      <View
        style={{
          ...styles.mainContainer,
          ...textInputView,
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
        {errorMessage ? (
          <Text
            style={{
              color: 'red',
              marginTop: 4,
              fontFamily: fontFamily.montserratMedium,
            }}
          >
            {errorMessage}
          </Text>
        ) : null}
        {textIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{
              justifyContent: 'center',
              padding: 10,
              ...btnStyle,
            }}
          >
            <SvgImg
              iconName={textIcon}
              width={22}
              height={22}
              {...otherSvgProps}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputStyle: {
    backgroundColor: 'white',
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: fontFamily.montserratBold,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  mainContainer: {
    flexDirection: 'row',
    // alignItems: "center",
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    padding: 5,
  },
});
