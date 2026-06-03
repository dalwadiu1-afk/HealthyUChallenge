import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Image,
  Easing,
} from 'react-native';

import { colors, fontFamily } from '../../constant/index';
import { Wrapper } from '../../components';

const SplashScreen = () => {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(20)).current;

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),

      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),

      Animated.timing(textTranslate, {
        toValue: 0,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1500,
          useNativeDriver: true,
        }),

        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Wrapper>
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        {/* Background Glow */}
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        {/* Rotating Ring */}
        <Animated.View
          style={[
            styles.ring,
            {
              transform: [{ rotate }],
            },
          ]}
        />

        {/* Logo */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }, { translateY: floatAnim }],
          }}
        >
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslate }],
          }}
        >
          <Text style={styles.title}>Healthy U Challenge</Text>

          <Text style={styles.subtitle}>Healthy Habits • Better Living</Text>
        </Animated.View>

        {/* Loading Dots */}
        <View style={styles.loadingRow}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Powered by Montclair State University</Text>
      </View>
    </Wrapper>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#081207',
    justifyContent: 'center',
    alignItems: 'center',
  },

  glowTop: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: 'rgba(143,175,120,0.12)',
  },

  glowBottom: {
    position: 'absolute',
    bottom: -120,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 999,
    backgroundColor: 'rgba(143,175,120,0.08)',
  },

  ring: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: 'rgba(143,175,120,0.25)',
  },

  logo: {
    width: 130,
    height: 130,
    marginBottom: 25,
    borderRadius: 100,
  },

  title: {
    color: colors.white,
    fontSize: 30,
    textAlign: 'center',
    fontFamily: fontFamily?.montserratBold,
  },

  subtitle: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: fontFamily?.montserratMedium,
  },

  loadingRow: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#8FAF78',
  },

  footer: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontFamily: fontFamily?.montserratMedium,
  },
});
