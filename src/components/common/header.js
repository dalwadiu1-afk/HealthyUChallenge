import React, { useEffect } from 'react';
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
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
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-20);
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const navController = useNavigation();
  const headerAnimStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));
  return (
    <View
      style={{
        flexDirection: 'row',
        ...headerContainer,
        marginBottom: 10,
      }}
    >
      <Animated.View style={[styles.headerRow, headerAnimStyle]}>
        <TouchableOpacity
          disabled={disableLeft}
          style={{ ...styles.backBtn, ...leftBtnStyle }}
          onPress={onLeftPress ? onLeftPress : () => navController.goBack()}
          activeOpacity={0.75}
        >
          <SvgImg iconName={leftImg} height={20} width={9} />
        </TouchableOpacity>
      </Animated.View>

      <Text
        style={{
          ...styles.headerTextStyle,
          ...textStyle,
          fontFamily: fontFamily.montserratBold,
        }}
      >
        {header}
      </Text>
      {showRightBtn ? (
        <TouchableOpacity
          disabled={disableRight}
          style={{ ...styles.backBtn, ...rightBtnStyle }}
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
  headerTextStyle: {
    color: colors.white,
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  backBtn: {
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
