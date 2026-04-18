import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';
import { colors, fontFamily } from '../../constant';
import { SvgImg } from '../../components';
import { success } from '../../assets/images';

const { height, width } = Dimensions.get('window');

function GradientBg({ id, c1, c2, r = 16, horizontal = false }) {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient
          id={id}
          x1="0"
          y1="0"
          x2={horizontal ? '1' : '0'}
          y2={horizontal ? '0' : '1'}
        >
          <Stop offset="0" stopColor={c1} stopOpacity="1" />
          <Stop offset="1" stopColor={c2} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} rx={r} />
    </Svg>
  );
}

export default function Success({ navigation }) {
  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Back button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation?.goBack()}
        activeOpacity={0.8}
      >
        <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
          <Path
            d="M8 1L1 8L8 15"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>

      <View style={styles.center}>
        {/* Success icon ring */}
        <View style={styles.iconRing}>
          <GradientBg
            id="successRing"
            c1="rgba(106,148,85,0.25)"
            c2="rgba(58,90,42,0.15)"
            r={56}
          />
          <SvgImg
            iconName={success}
            height={height * 0.12}
            width={width * 0.25}
            style={{ alignSelf: 'center' }}
          />
        </View>

        <Text style={styles.title}>Password Changed!</Text>
        <Text style={styles.desc}>
          Your password has been changed{'\n'}successfully.
        </Text>

        {/* Back to Login button */}
        <TouchableOpacity
          style={styles.loginBtn}
          activeOpacity={0.85}
          onPress={() => navigation?.navigate('login')}
        >
          <GradientBg
            id="loginGrad"
            c1="#6A9455"
            c2="#3A5A2A"
            r={16}
            horizontal
          />
          <Text style={styles.loginBtnText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
    paddingTop: (StatusBar.currentHeight || 44) + 12,
    paddingHorizontal: 24,
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },

  iconRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.3)',
    marginBottom: 32,
  },

  title: {
    color: colors.white,
    fontSize: 30,
    textAlign: 'center',
    fontFamily: fontFamily.montserratBold,
    marginBottom: 10,
  },
  desc: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: fontFamily.montserratRegular,
    lineHeight: 22,
    marginBottom: 40,
  },

  loginBtn: {
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  loginBtnText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
