import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, fontFamily } from '../../constant';
import { Header, Hyperlink, Wrapper } from '../../components/index';
import { AuthBtn } from '../../components/common/authBtn';
import InputBox from '../../components/common/InputBox';
import auth from '@react-native-firebase/auth';

const { height, width } = Dimensions.get('window');

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(35);
  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(40);
  const footerOpacity = useSharedValue(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    email: '',
    general: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

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

  const isValidEmail = email => {
    const regex = /^[a-zA-Z0-9._%+-]+@montclair\.edu$/;
    return regex.test(email.trim().toLowerCase());
  };

  const handleForgotPassword = async () => {
    setError({
      email: '',
      general: '',
    });
    setSuccessMessage('');

    if (!email.trim()) {
      setError(prev => ({
        ...prev,
        email: 'Email is required.',
      }));
      return;
    }

    if (!isValidEmail(email)) {
      setError(prev => ({
        ...prev,
        email:
          'Only users with a montclair.edu email address can access this feature.',
      }));
      return;
    }

    try {
      setLoading(true);

      await auth().sendPasswordResetEmail(email.trim());

      setSuccessMessage(
        'Password reset link has been sent to your email address.',
      );
    } catch (err) {
      console.log(err);

      switch (err.code) {
        case 'auth/user-not-found':
          setError(prev => ({
            ...prev,
            email: 'No account found with this email address.',
          }));
          break;

        case 'auth/invalid-email':
          setError(prev => ({
            ...prev,
            email: 'Invalid email address.',
          }));
          break;

        case 'auth/network-request-failed':
          setError(prev => ({
            ...prev,
            general: 'Network error. Please check your internet connection.',
          }));
          break;

        default:
          setError(prev => ({
            ...prev,
            general: 'Unable to send reset email. Please try again later.',
          }));
          break;
      }
    } finally {
      setLoading(false);
    }
  };

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
                onChangeText={text => {
                  setEmail(text);

                  if (error.email) {
                    setError(prev => ({
                      ...prev,
                      email: '',
                    }));
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                errorMessage={error.email}
              />
            </View>

            {successMessage ? (
              <Text
                style={{
                  color: '#4CAF50',
                  marginBottom: 12,
                  textAlign: 'center',
                  fontFamily: fontFamily.montserratMedium,
                }}
              >
                {successMessage}
              </Text>
            ) : null}

            {error.general ? (
              <Text
                style={{
                  color: '#FF6B6B',
                  marginBottom: 12,
                  textAlign: 'center',
                  fontFamily: fontFamily.montserratMedium,
                }}
              >
                {error.general}
              </Text>
            ) : null}

            <AuthBtn
              isComplete={email.length > 0}
              onPress={handleForgotPassword}
              // onPress={() => navigation.navigate('otp')}
              title={loading ? 'Sending...' : 'Send Reset Link'}
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
    fontFamily: fontFamily.montserratMedium,
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
    fontFamily: fontFamily.montserratRegular,
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
    fontFamily: fontFamily.montserratSemiBold,
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
    fontFamily: fontFamily.montserratSemiBold,
  },
});
