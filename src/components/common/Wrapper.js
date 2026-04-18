import { useEffect } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constant';

const { height, width } = Dimensions.get('window');
export function Wrapper({
  children,
  isLoading,
  bgColor = colors.primary,
  statusBarColor = 'transparent',
  barStyle = 'light-content',
  translucent = false,
  containerStyle = {},
  orbsRight = false,
  isForgot = false,
  isSignUp = false,
  scrollEnable = true,
  onlyTop = false,
  scrollProps = {},
  safeAreaPops,
}) {
  function FloatingOrb({ size, color, style, delay = 0 }) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
      opacity.value = withDelay(delay, withTiming(1, { duration: 1200 }));
      translateY.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-18, {
              duration: 3200,
              easing: Easing.inOut(Easing.sin),
            }),
            withTiming(18, {
              duration: 3200,
              easing: Easing.inOut(Easing.sin),
            }),
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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.dark,
      }}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Background orbs */}
      {orbsRight ? (
        <>
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
        </>
      ) : (
        <>
          <FloatingOrb
            size={isForgot ? width * 0.6 : width * 0.65}
            color="rgba(77, 102, 68, 0.24)"
            style={{
              top: isForgot
                ? -width * 0.15
                : isSignUp
                ? -width * 0.2
                : -width * 0.18,
              left: (!isForgot && -width * 0.2) || (isSignUp && -width * 0.18),
              right: isForgot && -width * 0.2,
            }}
            delay={0}
          />
          <FloatingOrb
            size={isForgot ? width * 0.4 : width * 0.45}
            color="rgba(45, 70, 38, 0.2)"
            style={{
              bottom: isForgot
                ? height * 0.2
                : isSignUp
                ? height * 0.12
                : height * 0.25,
              left: isForgot && -width * 0.15,
              right: isSignUp && -width * 0.2,
            }}
            delay={isForgot ? 800 : 900}
          />
          <FloatingOrb
            size={width * 0.2}
            color="rgba(143, 175, 120, 0.16)"
            style={{
              top: isForgot ? height * 0.4 : height * 0.35,
              right: isForgot ? width * 0.08 : width * 0.06,
            }}
            delay={isForgot ? 500 : 600}
          />
        </>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {scrollEnable ? (
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            {...scrollProps}
          >
            <SafeAreaView
              style={{ flex: 1 }}
              edges={['top', !onlyTop && 'bottom']}
              {...safeAreaPops}
            >
              <StatusBar
                translucent={translucent}
                backgroundColor={statusBarColor}
                barStyle={barStyle}
              />
              <View
                style={{ paddingHorizontal: 23, flex: 1, ...containerStyle }}
              >
                {children}
              </View>
            </SafeAreaView>
          </ScrollView>
        ) : (
          <SafeAreaView
            style={{ flex: 1 }}
            edges={['top', !onlyTop && 'bottom']}
            {...safeAreaPops}
          >
            <StatusBar
              translucent={translucent}
              backgroundColor={statusBarColor}
              barStyle={barStyle}
            />
            <View
              style={{
                paddingHorizontal: 23,
                flex: 1,
                ...containerStyle,
              }}
            >
              {children}
            </View>
          </SafeAreaView>
        )}
      </KeyboardAvoidingView>

      {/* <Loader isLoading={isLoading} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    // paddingTop: height * 0.07,
  },
});
