import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { backBtn, moreIcon } from '../../assets/images';
import { colors } from '../../constant/colors';
import { useNavigation } from '@react-navigation/native';
import { SvgImg } from './SvgImg';
import { fontFamily } from '../../constant';

const { width, height } = Dimensions.get('window');
export function Header({
  header = '',
  disableLeft = true,
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
  // const navController = useNavigation();
  return (
    <View
      style={{
        marginTop: StatusBar.currentHeight,
        flexDirection: 'row',
        paddingBottom: 8,
        ...headerContainer,
      }}
    >
      <TouchableOpacity
        disabled={disableLeft}
        style={{ ...styles.leftBtnStyle, ...leftBtnStyle }}
        onPress={onLeftPress ? onLeftPress : () => navController.goBack()}
        activeOpacity={1}
      >
        <SvgImg iconName={leftImg} height={18} width={9} />
      </TouchableOpacity>

      <Text style={{ ...styles.headerTextStyle, ...textStyle }}>{header}</Text>
      {showRightBtn ? (
        <TouchableOpacity
          disabled={disableRight}
          style={{ ...styles.leftBtnStyle, ...rightBtnStyle }}
          onPress={onRightPress}
        >
          <SvgImg iconName={rightImg} height={28} width={28} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 52, height: 52 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  leftBtnStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: height * 0.06,
    height: height * 0.06,
    borderWidth: 2,
    borderRadius: 13,
    borderColor: colors.white,
  },
  rightBtnStyle: {},
  headerTextStyle: {
    color: 'white',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: fontFamily.montserratBold,
  },
});
