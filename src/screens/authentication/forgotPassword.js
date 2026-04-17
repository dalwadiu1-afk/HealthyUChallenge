import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
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
import { colors, fontFamily } from '../../constant';
import { Header, Hyperlink, SvgImg, Wrapper } from '../../components/index';
import { backBtn } from '../../assets/images';
import { AuthBtn } from '../../components/common/authBtn';
import InputBox from '../../components/common/InputBox';

const { height, width } = Dimensions.get('window');

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(35);
  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(40);
  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    contentY.value = withDelay(
      200,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );

    formOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    formY.value = withDelay(
      400,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );

    footerOpacity.value = withDelay(650, withTiming(1, { duration: 600 }));
  }, []);

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  const formAnimStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }));

  const footerAnimStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Wrapper isForgot>
        <Header disableLeft={false} />
        <View style={styles.inner}>
          {/* Back button */}

          {/* Icon + Content */}
          <Animated.View style={[styles.contentSection, contentAnimStyle]}>
            {/* Lock icon placeholder */}
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🔐</Text>
            </View>

            <Text style={styles.tagline}>ACCOUNT RECOVERY</Text>
            <Text style={styles.headline}>Forgot{'\n'}Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter the email address linked{'\n'}
              with your account and we'll send{'\n'}
              you a reset code.
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.formSection, formAnimStyle]}>
            <View style={styles.inputGroup}>
              <InputBox
                label={'Email'}
                labelStyle={styles.inputLabel}
                inputContainerStyle={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            <AuthBtn
              isComplete
              onPress={() => navigation.navigate('otp')}
              title="Send Reset Code"
            />
          </Animated.View>
        </View>
        {/* Footer */}
        <Animated.View style={[styles.footer, footerAnimStyle]}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <Hyperlink
            title="Login"
            onPress={() => navigation.navigate('login')}
            activeOpacity={0.7}
            textStyle={styles.footerLink}
          />
        </Animated.View>
      </Wrapper>
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
    marginBottom: 36,
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
    marginBottom: 14,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 14,
    fontFamily: fontFamily.montserratMedium,
    lineHeight: 22,
  },
  formSection: {},
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: fontFamily.interMedium,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.interRegular,
    paddingVertical: 14,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 49,
    alignItems: 'center',
    marginBottom: 24,
  },
  sendBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.poppinsSemiBold,
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    alignItems: 'flex-end',
  },
  footerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
  },
  footerLink: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: fontFamily.interSemiBold,
  },
});
