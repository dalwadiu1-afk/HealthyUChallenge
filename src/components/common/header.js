import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { backBtn, moreIcon } from '../../assets/images';
import { colors } from '../../constant/colors';
import { useNavigation } from '@react-navigation/native';
import { SvgImg } from './SvgImg';
import { fontFamily } from '../../constant';
import Animated from 'react-native-reanimated';

const { height } = Dimensions.get('window');

export function Header({
  header = '',
  disableLeft = false,
  disableRight = true,
  textStyle = {},
  leftBtnStyle = {},
  rightBtnStyle = {},
  headerContainer = {},
  onLeftPress,
  onRightPress = () => {},
  showRightBtn = false,
  leftImg = backBtn,
  rightImg = moreIcon,
}) {
  const navigation = useNavigation();

  return (
    <View style={[styles.wrapper, headerContainer]}>
      {/* LEFT BUTTON */}
      <TouchableOpacity
        disabled={disableLeft}
        style={[styles.btn, leftBtnStyle]}
        onPress={onLeftPress ? onLeftPress : () => navigation.goBack()}
        activeOpacity={0.75}
      >
        <SvgImg iconName={leftImg} height={20} width={9} />
      </TouchableOpacity>

      {/* ✅ ANIMATED HEADER TEXT */}
      <Animated.Text
        style={[
          styles.headerText,
          { fontFamily: fontFamily.montserratBold },
          textStyle, // <-- animated style comes here safely
        ]}
        numberOfLines={1}
      >
        {header}
      </Animated.Text>

      {/* RIGHT BUTTON */}
      {showRightBtn ? (
        <TouchableOpacity
          disabled={disableRight}
          style={[styles.btn, rightBtnStyle]}
          onPress={onRightPress}
          activeOpacity={0.75}
        >
          <SvgImg iconName={rightImg} height={28} width={28} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: height * 0.06 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    color: colors.white,
    fontSize: 20,
  },
  btn: {
    width: height * 0.06,
    height: height * 0.06,
    borderRadius: 49,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
