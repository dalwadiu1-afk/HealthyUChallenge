import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors, fontFamily } from "../../constant";
import { Header, Hyperlink, SvgImg, Wrapper } from "../../components/index";
import { backBtn, eyeIcon } from "../../assets/images";
import InputBox from "../../components/common/InputBox";
import { AuthBtn } from "../../components/common/authBtn";

const { height, width } = Dimensions.get("window");

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
          position: "absolute",
        },
        style,
        animStyle,
      ]}
    />
  );
}

export default function Signup({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

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

  const headerAnimStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

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
            Hello!{"\n"}
            <Text style={styles.headlineAccent}>Register</Text> to{"\n"}get
            started.
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View style={[styles.formSection, formAnimStyle]}>
          {/* Username */}
          <View style={styles.inputGroup}>
            <InputBox
              label={"Username"}
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
              label={"Email"}
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

          {/* Password */}
          <View style={styles.inputGroup}>
            <InputBox
              label={" Password"}
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
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <InputBox
              label={" Confirm Password"}
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
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>

          {/* Register button */}
          <AuthBtn
            isComplete
            onPress={() => navigation.navigate("Main")}
            title="Create Account"
          />
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, footerAnimStyle]}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Hyperlink
            title="Login Now"
            onPress={() => navigation.navigate("login")}
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
    overflow: "hidden",
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
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  greetSection: {
    marginBottom: 28,
  },
  tagline: {
    color: colors.secondary,
    fontSize: 11,
    fontFamily: fontFamily.interMedium,
    letterSpacing: 4,
    marginBottom: 10,
  },
  headline: {
    color: colors.white,
    fontSize: 34,
    fontFamily: fontFamily.poppinsBold,
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
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontFamily: fontFamily.interMedium,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 49,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: "rgba(192, 108, 91, 0.6)",
  },
  textInput: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.interRegular,
    paddingVertical: 14,
  },
  eyeBtn: {
    paddingLeft: 10,
    paddingVertical: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 11,
    fontFamily: fontFamily.interRegular,
    marginTop: 5,
    marginLeft: 4,
  },
  registerBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 49,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  registerBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.poppinsSemiBold,
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
    alignItems: "flex-end",
  },
  footerText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    fontFamily: fontFamily.interRegular,
  },
  footerLink: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: fontFamily.interSemiBold,
  },
});
