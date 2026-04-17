import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors, fontFamily } from '../../constant';
import { SvgImg } from '../../components/index';
import { backBtn } from '../../assets/images';
import { AuthBtn } from '../../components/common/authBtn';

const { height, width } = Dimensions.get('window');
const OTP_LENGTH = 4;

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

// Single animated OTP box
function OtpBox({ value, isFocused }) {
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(0.12);

  useEffect(() => {
    if (isFocused) {
      scale.value = withSpring(1.08, { damping: 12 });
      borderOpacity.value = withTiming(0.75, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 12 });
      borderOpacity.value = withTiming(value ? 0.45 : 0.12, { duration: 200 });
    }
  }, [isFocused, value]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: `rgba(183, 169, 154, ${borderOpacity.value})`,
  }));

  return (
    <Animated.View style={[styles.otpBox, animStyle]}>
      <Text style={styles.otpText}>{value ? '•' : ''}</Text>
    </Animated.View>
  );
}

export default function OTP({ navigation }) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [count, setCount] = useState(120);
  const [timerActive, setTimerActive] = useState(true);

  const inputRefs = useRef([]);
  const intervalRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (timerActive && count > 0) {
      intervalRef.current = setInterval(() => {
        setCount(c => c - 1);
      }, 1000);
    } else if (count === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerActive, count]);

  const formatTimer = seconds => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleResend = () => {
    setCount(120);
    setTimerActive(true);
    setOtp(['', '', '', '']);
    setFocusedIndex(0);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const handleChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every(d => d !== '');

  // Entrance animations
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-20);
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(30);
  const boxesOpacity = useSharedValue(0);
  const boxesY = useSharedValue(40);
  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    contentOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    contentY.value = withDelay(
      200,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );

    boxesOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    boxesY.value = withDelay(
      400,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );

    footerOpacity.value = withDelay(650, withTiming(1, { duration: 600 }));

    // Auto-focus first box
    setTimeout(() => inputRefs.current[0]?.focus(), 700);
  }, []);

  const headerAnimStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));
  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));
  const boxesAnimStyle = useAnimatedStyle(() => ({
    opacity: boxesOpacity.value,
    transform: [{ translateY: boxesY.value }],
  }));
  const footerAnimStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Background orbs */}
      <FloatingOrb
        size={width * 0.62}
        color="rgba(77, 102, 68, 0.24)"
        style={{ top: -width * 0.16, right: -width * 0.2 }}
        delay={0}
      />
      <FloatingOrb
        size={width * 0.42}
        color="rgba(45, 70, 38, 0.18)"
        style={{ bottom: height * 0.22, left: -width * 0.16 }}
        delay={800}
      />
      <FloatingOrb
        size={width * 0.2}
        color="rgba(143, 175, 120, 0.15)"
        style={{ top: height * 0.38, right: width * 0.06 }}
        delay={500}
      />

      <SafeAreaProvider>
        <View style={styles.inner}>
          {/* Back button */}
          <Animated.View style={[styles.headerRow, headerAnimStyle]}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.75}
            >
              <SvgImg iconName={backBtn} height={16} width={9} />
            </TouchableOpacity>
          </Animated.View>

          {/* Content */}
          <Animated.View style={[styles.contentSection, contentAnimStyle]}>
            {/* Icon */}
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>✉️</Text>
            </View>

            <Text style={styles.tagline}>VERIFICATION</Text>
            <Text style={styles.headline}>OTP{'\n'}Verification</Text>
            <Text style={styles.subtitle}>
              Enter the 4-digit code we sent to{'\n'}your email address.
            </Text>
          </Animated.View>

          {/* OTP Boxes */}
          <Animated.View style={[styles.otpSection, boxesAnimStyle]}>
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={1}
                  onPress={() => inputRefs.current[index]?.focus()}
                >
                  <OtpBox value={digit} isFocused={focusedIndex === index} />
                  <TextInput
                    ref={ref => (inputRefs.current[index] = ref)}
                    style={styles.hiddenInput}
                    value={digit}
                    onChangeText={text => handleChange(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(-1)}
                    keyboardType="number-pad"
                    maxLength={1}
                    caretHidden
                  />
                </TouchableOpacity>
              ))}
            </View>

            <AuthBtn
              isComplete={isComplete}
              onPress={() => isComplete && navigation.navigate('newPassword')}
              title="Verify Code"
              btnStyle={{ backgroundColor: 'rgba(142, 124, 109, 0.35)' }}
            />
          </Animated.View>

          {/* Footer timer / resend */}
          <Animated.View style={[styles.footer, footerAnimStyle]}>
            {count > 0 ? (
              <View style={styles.timerRow}>
                <Text style={styles.footerText}>Resend code in </Text>
                <View style={styles.timerBadge}>
                  <Text style={styles.timerText}>{formatTimer(count)}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.timerRow}>
                <Text style={styles.footerText}>Didn't receive the code? </Text>
                <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                  <Text style={styles.resendText}>Resend</Text>
                </TouchableOpacity>
              </View>
            )}
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
    paddingTop: height * 0.07,
    paddingBottom: 32,
  },
  headerRow: {
    marginBottom: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 49,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentSection: {
    marginBottom: 44,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 49,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconEmoji: {
    fontSize: 28,
  },
  tagline: {
    color: colors.secondary,
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 4,
    marginBottom: 10,
  },
  headline: {
    color: colors.white,
    fontSize: 36,
    fontFamily: fontFamily.montserratSemiBold,
    lineHeight: 44,
    marginBottom: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 14,
    fontFamily: fontFamily.montserratMedium,
    lineHeight: 22,
  },
  otpSection: {},
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  otpBox: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: 49,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpText: {
    color: colors.white,
    fontSize: 26,
    fontFamily: fontFamily.montserratMedium,
    lineHeight: 32,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  verifyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 49,
    alignItems: 'center',
  },
  verifyBtnDisabled: {
    backgroundColor: 'rgba(142, 124, 109, 0.35)',
  },
  verifyBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.poppinsSemiBold,
    letterSpacing: 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  timerBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 49,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timerText: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },
  resendText: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: fontFamily.interSemiBold,
  },
});
