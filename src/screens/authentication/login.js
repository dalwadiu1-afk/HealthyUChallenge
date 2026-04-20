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
import { eyeIcon } from '../../assets/images';
import InputBox from '../../components/common/InputBox';
import { AuthBtn } from '../../components/common/authBtn';
import auth from '@react-native-firebase/auth';

const { height, width } = Dimensions.get('window');

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [error, setError] = useState({
    email: '',
    password: '',
    general: '',
  });
  const [loading, setLoading] = useState(false);

  const greetOpacity = useSharedValue(0);
  const greetY = useSharedValue(30);

  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(40);

  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    greetOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    greetY.value = withDelay(
      200,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );

    formOpacity.value = withDelay(450, withTiming(1, { duration: 600 }));
    formY.value = withDelay(
      450,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );

    footerOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
  }, []);

  const greetAnimStyle = useAnimatedStyle(() => ({
    opacity: greetOpacity.value,
    transform: [{ translateY: greetY.value }],
  }));

  const formAnimStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }));

  const footerAnimStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  const isValidEmail = email => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isValidPassword = password => {
    return password.length >= 6;
  };
  const isFormValid =
    email && password && isValidEmail(email) && isValidPassword(password);

  const handleLogin = async () => {
    // Reset all errors
    setError({ email: '', password: '', general: '' });

    let valid = true;

    // EMAIL VALIDATION
    if (!email) {
      setError(prev => ({
        ...prev,
        email: 'Email is required.',
      }));
      valid = false;
    } else if (!isValidEmail(email)) {
      setError(prev => ({
        ...prev,
        email: 'Enter a valid email (e.g. name@example.com).',
      }));
      valid = false;
    }

    // PASSWORD VALIDATION
    if (!password) {
      setError(prev => ({
        ...prev,
        password: 'Password is required.',
      }));
      valid = false;
    } else if (!isValidPassword(password)) {
      setError(prev => ({
        ...prev,
        password: 'Password must be at least 6 characters.',
      }));
      valid = false;
    }

    if (!valid) return;

    try {
      setLoading(true);

      const userCredential = await auth().signInWithEmailAndPassword(
        email.trim(),
        password,
      );

      console.log('User signed in:', userCredential.user);

      navigation.replace('Main');
    } catch (err) {
      console.log(err);

      switch (err.code) {
        case 'auth/user-not-found':
          setError(prev => ({
            ...prev,
            email: 'No account found with this email. Try registering.',
          }));
          break;

        case 'auth/wrong-password':
          setError(prev => ({
            ...prev,
            password: 'Incorrect password. Try again or reset it.',
          }));
          break;

        case 'auth/invalid-email':
          setError(prev => ({
            ...prev,
            email: 'This email address is not valid.',
          }));
          break;

        case 'auth/user-disabled':
          setError(prev => ({
            ...prev,
            general: 'This account has been disabled. Contact support.',
          }));
          break;

        case 'auth/too-many-requests':
          setError(prev => ({
            ...prev,
            general:
              'Too many failed attempts. Please wait a moment and try again.',
          }));
          break;

        case 'auth/network-request-failed':
          setError(prev => ({
            ...prev,
            general:
              'Network error. Check your internet connection and try again.',
          }));
          break;

        default:
          setError(prev => ({
            ...prev,
            general: 'Unable to log in right now. Please try again shortly.',
          }));
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <Wrapper containerStyle={{ flex: 1 }}>
        <Header disableLeft={false} />

        {/* Greeting */}
        <Animated.View style={[styles.greetSection, greetAnimStyle]}>
          <Text style={styles.tagline}>WELCOME BACK</Text>
          <Text style={styles.headline}>
            Glad to see{'\n'}you,{' '}
            {/* <Text style={styles.headlineAccent}>Again!</Text> */}
          </Text>
          <Text style={styles.subtitle}>
            Log in to continue your wellness journey.
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View style={[styles.formSection, formAnimStyle]}>
          {/* Email */}
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
              errorMessage={error?.general ? error?.general : error?.email}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <InputBox
              label={' Password'}
              labelStyle={styles.inputLabel}
              inputContainerStyle={[styles.textInput, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry={secureText}
              returnKeyType="done"
              onRightIconPress={() => setSecureText(!secureText)}
              textIcon={eyeIcon}
              otherSvgProps={{
                color: secureText
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(255,255,255,0.8)',
              }}
              errorMessage={error?.general ? error?.general : error?.email}
            />
          </View>

          {/* Forgot password */}

          <Hyperlink
            title="Forgot Password?"
            linkStyle={styles.forgotWrapper}
            onPress={() => navigation.navigate('forgotPassword')}
            activeOpacity={0.7}
            textStyle={styles.forgotText}
          />

          {/* Login button */}

          <AuthBtn
            isComplete={isFormValid}
            onPress={handleLogin}
            title={loading ? 'Logging in...' : 'Login'}
          />
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, footerAnimStyle]}>
          <Text style={styles.footerText}>Don't have an account? </Text>

          <Hyperlink
            title="Register Now"
            onPress={() => navigation.navigate('signup')}
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
    overflow: 'hidden',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 26,
  },
  headerRow: {},
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
  textInput: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
    paddingVertical: 14,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  greetSection: {
    marginBottom: 36,
  },
  tagline: {
    color: colors.secondary,
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 4,
    marginBottom: 10,
    marginTop: 36,
  },
  headline: {
    color: colors.white,
    fontSize: 36,
    fontFamily: fontFamily.montserratSemiBold,
    lineHeight: 44,
    marginBottom: 10,
  },
  headlineAccent: {
    color: colors.secondary,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 14,
    fontFamily: fontFamily.montserratMedium,
    lineHeight: 21,
  },
  formSection: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },

  textInput: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
    // paddingVertical: 14,
  },
  eyeBtn: {
    paddingLeft: 10,
    paddingVertical: 14,
  },
  forgotWrapper: {
    alignSelf: 'flex-end',
    marginBottom: 28,
    marginTop: 4,
  },
  forgotText: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 49,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginBtnText: {
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
    fontFamily: fontFamily.montserratMedium,
  },
  footerLink: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
