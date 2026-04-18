import React, { useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors, fontFamily } from '../../constant';
import { SvgImg } from '../../components/index';
import { appIcon } from '../../assets/images/index';

const { height, width } = Dimensions.get('window');

function GradientButton({ onPress, title, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.gradBtn, style]}
      activeOpacity={0.82}
    >
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#2D4A25" stopOpacity="1" />
            <Stop offset="0.5" stopColor="#4D6644" stopOpacity="1" />
            <Stop offset="1" stopColor="#8FAF78" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#btnGrad)" rx={14} />
      </Svg>
      <Text style={styles.gradBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

function FloatingOrb({ size, color, style, delay = 0 }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 1200 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-18, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
          withTiming(18, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          position: 'absolute',
        },
        style,
        animStyle,
      ]}
    />
  );
}

export default function Welcome({ navigation }) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const logoPulse = useSharedValue(1);

  const labelOpacity = useSharedValue(0);
  const labelY = useSharedValue(20);

  const headlineOpacity = useSharedValue(0);
  const headlineY = useSharedValue(40);

  const subtitleOpacity = useSharedValue(0);
  const subtitleY = useSharedValue(30);

  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(60);

  useEffect(() => {
    // Logo entrance
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.back(1.2)),
    });

    // Logo gentle pulse (after entrance)
    logoPulse.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1.06, {
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(1.0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );

    // Label
    labelOpacity.value = withDelay(350, withTiming(1, { duration: 600 }));
    labelY.value = withDelay(
      350,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );

    // Headline
    headlineOpacity.value = withDelay(550, withTiming(1, { duration: 700 }));
    headlineY.value = withDelay(
      550,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );

    // Subtitle
    subtitleOpacity.value = withDelay(750, withTiming(1, { duration: 600 }));
    subtitleY.value = withDelay(
      750,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );

    // Bottom card
    cardOpacity.value = withDelay(1000, withTiming(1, { duration: 700 }));
    cardY.value = withDelay(
      1000,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value * logoPulse.value }],
  }));

  const labelAnimStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateY: labelY.value }],
  }));

  const headlineAnimStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
    transform: [{ translateY: headlineY.value }],
  }));

  const subtitleAnimStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleY.value }],
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Background decorative orbs */}
      <FloatingOrb
        size={width * 0.75}
        color="rgba(77, 102, 68, 0.28)"
        style={{ top: -width * 0.22, right: -width * 0.18 }}
        delay={100}
      />
      <FloatingOrb
        size={width * 0.55}
        color="rgba(45, 70, 38, 0.22)"
        style={{ bottom: height * 0.18, left: -width * 0.22 }}
        delay={800}
      />
      <FloatingOrb
        size={width * 0.28}
        color="rgba(143, 175, 120, 0.16)"
        style={{ top: height * 0.28, right: width * 0.04 }}
        delay={500}
      />
      <FloatingOrb
        size={width * 0.16}
        color="rgba(77, 102, 68, 0.32)"
        style={{ top: height * 0.42, left: width * 0.08 }}
        delay={1200}
      />
      <FloatingOrb
        size={width * 0.1}
        color="rgba(143, 175, 120, 0.35)"
        style={{ top: height * 0.18, left: width * 0.18 }}
        delay={1600}
      />

      <SafeAreaProvider>
        <View style={styles.inner}>
          {/* Top content */}
          <View style={styles.topSection}>
            {/* Logo */}
            <Animated.View style={[styles.logoWrapper, logoAnimStyle]}>
              <SvgImg
                iconName={appIcon}
                height={height * 0.065}
                width={width * 0.15}
              />
            </Animated.View>

            {/* App label */}
            <Animated.View style={labelAnimStyle}>
              <Text style={styles.appLabel}>HEALTHYU</Text>
            </Animated.View>

            {/* Divider */}
            <Animated.View style={[styles.divider, subtitleAnimStyle]} />

            {/* Headline */}
            <Animated.View style={headlineAnimStyle}>
              <Text style={styles.headline}>
                Find Balance{'\n'}in your life with{'\n'}
                <Text style={styles.headlineAccent}>Equilibrium.</Text>
              </Text>
            </Animated.View>

            {/* Subtitle */}
            <Animated.View style={subtitleAnimStyle}>
              <Text style={styles.subtitle}>
                Take a moment for yourself.{'\n'}
                Reflect, recharge, and realign.{'\n'}
                Your balance starts here.
              </Text>
            </Animated.View>
          </View>

          {/* Bottom CTA card */}
          <Animated.View style={[styles.cardWrapper, cardAnimStyle]}>
            <GradientButton
              title="Get Started"
              onPress={() => navigation.navigate('login')}
            />

            <TouchableOpacity
              style={[styles.btn, styles.outlineBtn]}
              onPress={() => navigation.navigate('signup')}
              activeOpacity={0.82}
            >
              <Text style={styles.outlineBtnText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => {}}
              activeOpacity={0.65}
            >
              <Text style={styles.guestText}>Continue as a guest</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 26,
    justifyContent: 'space-between',
    paddingTop: height * 0.07,
    paddingBottom: 32,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
  },
  logoWrapper: {
    width: width * 0.19,
    height: width * 0.19,
    borderRadius: width * 0.095,
    backgroundColor: colors.glass,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appLabel: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 5,
    marginBottom: 20,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginBottom: 22,
  },
  headline: {
    color: colors.white,
    fontSize: 36,
    fontFamily: fontFamily.montserratBold,
    lineHeight: 44,
    marginBottom: 18,
  },
  headlineAccent: {
    color: colors.secondary,
    fontFamily: fontFamily.montserratBold,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
    lineHeight: 22,
  },
  cardWrapper: {
    marginTop: 24,
  },
  gradBtn: {
    overflow: 'hidden',
    borderRadius: 49,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gradBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.5,
  },
  btn: {
    paddingVertical: 13,
    borderRadius: 49,
    alignItems: 'center',
    marginBottom: 10,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
    marginBottom: 4,
  },
  outlineBtnText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 2,
  },
  guestText: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    textDecorationLine: 'underline',
  },
});
