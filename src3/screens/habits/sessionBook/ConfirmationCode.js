import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';
import moment from 'moment';

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

export default function ConfirmationCode({ navigation }) {
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const inputs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const openOtp = () => {
    setShowOtp(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeOtp = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setShowOtp(false));
  };

  const handleOtpChange = (val, index) => {
    const next = [...otp];
    next[index] = val;
    setOtp(next);
    if (val && index < 3) {
      inputs[index + 1].current?.focus();
    }
  };

  const handleOtpBackspace = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs[index - 1].current?.focus();
    }
  };

  const otpFilled = otp.every(c => c.length === 1);

  const panelTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Doctor Photo */}
      <View style={styles.photoWrap}>
        <Image
          source={{
            uri: 'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
          }}
          style={styles.photo}
          resizeMode="cover"
        />
        <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="photoFade2" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.4" stopColor="transparent" stopOpacity="0" />
              <Stop offset="1" stopColor={colors.dark} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#photoFade2)" />
        </Svg>

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
      </View>

      {/* Doctor info card */}
      <View style={styles.doctorCard}>
        <GradientBg id="docCard2" c1="#2D4A25" c2="#1A2818" r={20} />
        <Text style={styles.doctorName}>Dr. Smith Sras</Text>
        <Text style={styles.doctorSpec}>Cardiologist Specialist</Text>
        <Text style={styles.doctorOrg}>Montclair State University</Text>
      </View>

      {/* Booking info */}
      <View style={styles.bookingCard}>
        <View style={styles.bookingRow}>
          <View style={styles.bookingIcon}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M22 11.08V12a10 10 0 11-5.93-9.14"
                stroke={colors.secondary}
                strokeWidth={1.8}
                strokeLinecap="round"
              />
              <Path
                d="M22 4L12 14.01l-3-3"
                stroke={colors.secondary}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bookingLabel}>Appointment Booked</Text>
            <Text style={styles.bookingValue}>
              {moment().format('MMMM Do YYYY')}
            </Text>
          </View>
        </View>
        <View style={styles.bookingDivider} />
        <View style={styles.bookingRow}>
          <View style={styles.bookingIcon}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2a10 10 0 100 20A10 10 0 0012 2z"
                stroke={colors.secondary}
                strokeWidth={1.8}
              />
              <Path
                d="M12 6v6l4 2"
                stroke={colors.secondary}
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bookingLabel}>Time</Text>
            <Text style={styles.bookingValue}>
              {moment().format('hh:mm A')}
            </Text>
          </View>
        </View>
      </View>

      {/* Status badge */}
      <View style={styles.statusBadge}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Confirmed · Awaiting attendance</Text>
      </View>

      {/* Attended button */}
      <View style={styles.btnWrap}>
        <TouchableOpacity
          style={styles.attendedBtn}
          onPress={openOtp}
          activeOpacity={0.85}
        >
          <GradientBg
            id="attendGrad"
            c1="#6A9455"
            c2="#3A5A2A"
            r={16}
            horizontal
          />
          <Svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginRight: 8 }}
          >
            <Path
              d="M20 6L9 17l-5-5"
              stroke="#fff"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.attendedBtnText}>Mark as Attended</Text>
        </TouchableOpacity>
      </View>

      {/* OTP bottom sheet */}
      {showOtp && (
        <>
          <Pressable style={styles.overlay} onPress={closeOtp} />
          <Animated.View
            style={[
              styles.otpPanel,
              { transform: [{ translateY: panelTranslate }] },
            ]}
          >
            <GradientBg id="otpPanel" c1="#1E2D1A" c2="#161D15" r={24} />

            {/* Handle */}
            <View style={styles.panelHandle} />

            <Text style={styles.otpTitle}>Enter Confirmation Code</Text>
            <Text style={styles.otpSub}>
              Enter the 4-digit code provided by your practitioner
            </Text>

            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={inputs[i]}
                  style={[styles.otpBox, digit && styles.otpBoxFilled]}
                  value={digit}
                  onChangeText={val => handleOtpChange(val.slice(-1), i)}
                  onKeyPress={e => handleOtpBackspace(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  placeholderTextColor="rgba(255,255,255,0.15)"
                  placeholder="·"
                  selectionColor={colors.secondary}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.otpConfirmBtn,
                !otpFilled && styles.otpConfirmBtnDisabled,
              ]}
              activeOpacity={0.85}
              disabled={!otpFilled}
              onPress={closeOtp}
            >
              {otpFilled && (
                <GradientBg
                  id="otpConfirm"
                  c1="#6A9455"
                  c2="#3A5A2A"
                  r={14}
                  horizontal
                />
              )}
              <Text
                style={[
                  styles.otpConfirmText,
                  !otpFilled && styles.otpConfirmTextDisabled,
                ]}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  photoWrap: { height: 260, width: '100%' },
  photo: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 44) + 8,
    left: 18,
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  doctorCard: {
    marginHorizontal: 18,
    marginTop: -55,
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    zIndex: 1,
    marginBottom: 16,
  },
  doctorName: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 2,
  },
  doctorSpec: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
    marginBottom: 2,
  },
  doctorOrg: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
  },

  bookingCard: {
    marginHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  bookingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(143,175,120,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 2,
  },
  bookingValue: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
  bookingDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 48,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 18,
    marginBottom: 28,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(143,175,120,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  statusText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },

  btnWrap: { paddingHorizontal: 18 },
  attendedBtn: {
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendedBtnText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  otpPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  panelHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 22,
  },
  otpTitle: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 4,
  },
  otpSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 24,
    lineHeight: 18,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 28,
  },
  otpBox: {
    width: 58,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: colors.white,
    fontSize: 24,
    fontFamily: fontFamily.montserratBold,
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: 'rgba(143,175,120,0.5)',
    backgroundColor: 'rgba(143,175,120,0.08)',
  },
  otpConfirmBtn: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  otpConfirmBtnDisabled: {},
  otpConfirmText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
  },
  otpConfirmTextDisabled: { color: 'rgba(255,255,255,0.3)' },
});
