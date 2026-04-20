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

export default function Signup({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [error, setError] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  });
  const [loading, setLoading] = useState(false);

  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-20);

  const greetOpacity = useSharedValue(0);
  const greetY = useSharedValue(30);

  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(40);

  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    greetOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    greetY.value = withDelay(
      200,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );

    formOpacity.value = withDelay(400, withTiming(1, { duration: 650 }));
    formY.value = withDelay(
      400,
      withTiming(0, { duration: 650, easing: Easing.out(Easing.cubic) }),
    );

    footerOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
  }, []);

  const isValidEmail = email => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPassword = password => {
    return password.length >= 6;
  };

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

  const handleSignup = async () => {
    // Reset errors
    setError({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      general: '',
    });

    let valid = true;

    // USERNAME
    if (!username.trim()) {
      setError(prev => ({
        ...prev,
        username: 'Username is required.',
      }));
      valid = false;
    }

    // EMAIL
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

    // PASSWORD
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

    // CONFIRM PASSWORD
    if (!confirmPassword) {
      setError(prev => ({
        ...prev,
        confirmPassword: 'Please confirm your password.',
      }));
      valid = false;
    } else if (password !== confirmPassword) {
      setError(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match.',
      }));
      valid = false;
    }

    if (!valid) return;

    try {
      setLoading(true);

      const userCredential = await auth().createUserWithEmailAndPassword(
        email.trim(),
        password,
      );

      // Optional: set display name
      await userCredential.user.updateProfile({
        displayName: username,
      });

      console.log('User created:', userCredential.user);

      navigation.replace('Main');
    } catch (err) {
      console.log(err);

      switch (err.code) {
        case 'auth/email-already-in-use':
          setError(prev => ({
            ...prev,
            email: 'This email is already registered. Try logging in.',
          }));
          break;

        case 'auth/invalid-email':
          setError(prev => ({
            ...prev,
            email: 'Invalid email address.',
          }));
          break;

        case 'auth/weak-password':
          setError(prev => ({
            ...prev,
            password: 'Password is too weak. Use at least 6 characters.',
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
            general: 'Unable to create account. Please try again.',
          }));
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Wrapper isSignUp>
        {/* Back button */}
        {/* <Animated.View style={[styles.headerRow, headerAnimStyle]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <SvgImg iconName={backBtn} height={16} width={9} />
          </TouchableOpacity>
        </Animated.View> */}
        <Header disableLeft={false} />

        {/* Greeting */}
        <Animated.View style={[styles.greetSection, greetAnimStyle]}>
          <Text style={styles.tagline}>CREATE ACCOUNT</Text>
          <Text style={styles.headline}>
            Hello!{'\n'}
            <Text style={styles.headlineAccent}>Register</Text> to{'\n'}get
            started.
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View style={[styles.formSection, formAnimStyle]}>
          {/* Username */}
          <View style={styles.inputGroup}>
            <InputBox
              label={'Username'}
              labelStyle={styles.inputLabel}
              inputContainerStyle={styles.textInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

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
              errorMessage={error?.email}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <InputBox
              label={'Password'}
              labelStyle={styles.inputLabel}
              inputContainerStyle={[styles.textInput, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry={securePassword}
              returnKeyType="next"
              onRightIconPress={() => setSecurePassword(!securePassword)}
              textIcon={eyeIcon}
              errorMessage={error?.password}
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <InputBox
              label={'Confirm Password'}
              labelStyle={styles.inputLabel}
              inputContainerStyle={[styles.textInput, { flex: 1 }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your Password"
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry={secureConfirm}
              returnKeyType="done"
              onRightIconPress={() => setSecureConfirm(!secureConfirm)}
              textIcon={eyeIcon}
              errorMessage={error?.confirmPassword}
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>

          {/* Register button */}
          <AuthBtn
            isComplete
            onPress={handleSignup}
            title={loading ? 'Creating...' : 'Create Account'}
          />
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, footerAnimStyle]}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Hyperlink
            title="Login Now"
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: height * 0.07,
    paddingBottom: 32,
  },
  headerRow: {
    marginBottom: 32,
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
  greetSection: {
    marginBottom: 28,
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
    fontSize: 34,
    fontFamily: fontFamily.montserratBold,
    lineHeight: 42,
  },
  headlineAccent: {
    color: colors.secondary,
  },
  formSection: { flex: 1 },
  inputGroup: {
    marginBottom: 14,
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
  inputError: {
    borderColor: 'rgba(192, 108, 91, 0.6)',
  },
  textInput: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
    paddingVertical: 14,
  },
  eyeBtn: {
    paddingLeft: 10,
    paddingVertical: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 5,
    marginLeft: 4,
  },
  registerBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 49,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  registerBtnText: {
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
