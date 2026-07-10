import React, { useEffect, useRef, useState } from 'react';
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
  Dimensions,
  Alert,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { Header } from '../../../components';
import { Wrapper } from '../../../components/index';
import moment from 'moment';

const { height } = Dimensions.get('window');

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

const monthKey = new Date()
  .toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  .replace(' ', '_');

export default function ConfirmationCode({ navigation, route }) {
  const { doctor } = route.params || {};
  console.log('route?.params :>> ', route?.params);
  const uid = auth().currentUser.uid;

  const [showOtp, setShowOtp] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [booking, setBooking] = useState(null);
  const [bookingKey, setBookingKey] = useState(null);

  const verifyAppointment = async () => {
    try {
      const enteredCode = verificationCode.trim().toUpperCase();

      const adminUsers = await database()
        .ref('/users')
        .orderByChild('profile/role')
        .equalTo('admin')
        .once('value');

      let adminUid = null;
      let adminName = '';
      let adminEmail = '';
      let validCode = false;

      adminUsers.forEach(child => {
        const profile = child.val()?.profile || {};
        const codeData = profile?.verificationCode;

        if (codeData?.code === enteredCode && !codeData?.used) {
          validCode = true;
          adminUid = child.key;
          adminName = profile?.name || profile?.fullName || 'Administrator';
          adminEmail = profile?.email || '';
        }
      });

      if (!validCode) {
        Alert.alert(
          'Invalid Code',
          'Please enter a valid practitioner verification code.',
        );
        return;
      }

      await database()
        .ref(`/users/${uid}/habits/booking/${monthKey}/${bookingKey}`)
        .update({
          status: 'attended',
          attended: true,
          verified: true,
          verifiedAt: moment().format('YYYY-MM-DD HH:mm:ss'),

          verifiedBy: adminUid,
          verifiedByName: adminName,
          verifiedByEmail: adminEmail,
        });
      // Generate next code for practitioner
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      await database()
        .ref(`/users/${adminUid}/profile/verificationCode`)
        .set({
          code: newCode,
          used: false,
          createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        });

      Alert.alert('Success', 'Appointment attendance verified.');

      closeOtp();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchBooking = async () => {
    const snap = await database()
      .ref(`/users/${uid}/habits/booking/${monthKey}`)
      .once('value');
    console.log('auth :>> ', snap);

    if (snap.exists()) {
      const data = snap.val();

      // get latest booking (or first one)
      const latestKey = Object.keys(data)[0];
      console.log('latestKey :>> ', latestKey);
      setBookingKey(latestKey);
      setBooking(data[latestKey]);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, []);

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

  const panelTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <Wrapper containerStyle={{ paddingHorizontal: 0 }}>
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
              uri:
                doctor?.image ||
                'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
            }}
            style={styles.photo}
            resizeMode="stretch"
          />
          <Header
            headerContainer={{
              paddingHorizontal: 23,
              zIndex: 2,
              width: '100%',
              top: -height / 25,
            }}
            leftBtnStyle={{ backgroundColor: 'rgba(7, 4, 19, 0.6)' }}
          />
        </View>
        {/* Doctor info card */}
        <View style={styles.doctorCard}>
          <GradientBg id="docCard2" c1="#2D4A25" c2="#1A2818" r={20} />
          <Text style={styles.doctorName}>{doctor?.name}</Text>
          <Text style={styles.doctorSpec}>{doctor?.specialty}</Text>
          <Text style={styles.doctorOrg}>Montclair State University</Text>
        </View>

        <View style={styles.bookingCard}>
          {/* STATUS */}
          <View style={styles.bookingRow}>
            <View style={styles.bookingIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M5 13l4 4L19 7"
                  stroke={colors.secondary}
                  strokeWidth={2}
                />
              </Svg>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.bookingLabel}>Session Status</Text>
              <Text
                style={[
                  styles.bookingValue,
                  {
                    color:
                      booking?.status === 'attended'
                        ? colors.secondary
                        : '#fff',
                  },
                ]}
              >
                {booking?.status === 'attended'
                  ? 'Attended'
                  : 'Pending Attendance'}
              </Text>
            </View>
          </View>

          <View style={styles.bookingDivider} />

          {/* TIMER */}
          {/* DOCTOR EMAIL */}
          <View style={styles.bookingRow}>
            <View style={styles.bookingIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M4 6h16v12H4z"
                  stroke={colors.secondary}
                  strokeWidth={1.5}
                />
                <Path
                  d="M4 7l8 6 8-6"
                  stroke={colors.secondary}
                  strokeWidth={1.5}
                />
              </Svg>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.bookingLabel}>Dietitian Email</Text>

              <Text
                selectable
                selectionColor={colors.secondary}
                style={styles.bookingValue}
              >
                {doctor?.email || 'No email available'}
              </Text>
            </View>
          </View>

          <View style={styles.bookingDivider} />

          {/* OTP */}
          <View style={styles.bookingRow}>
            <View style={styles.bookingIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2v20" stroke={colors.secondary} strokeWidth={2} />
              </Svg>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.bookingLabel}>Session Status</Text>

              <Text
                style={[
                  styles.bookingValue,
                  {
                    color: booking?.verified ? colors.secondary : '#fff',
                  },
                ]}
              >
                {booking?.verified ? 'Completed' : 'Awaiting Verification'}
              </Text>
            </View>
          </View>

          <View style={styles.bookingDivider} />

          <View style={styles.bookingRow}>
            <View style={styles.bookingIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 12a4 4 0 100-8 4 4 0 000 8z"
                  stroke={colors.secondary}
                  strokeWidth={1.5}
                />
                <Path
                  d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6"
                  stroke={colors.secondary}
                  strokeWidth={1.5}
                />
              </Svg>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.bookingLabel}>Verified By</Text>

              <Text
                selectable
                selectionColor={colors.secondary}
                style={styles.bookingValue}
              >
                {booking?.verifiedByName || 'Not Verified Yet'}
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

              <Text style={styles.otpTitle}>Verify Appointment</Text>

              <Text style={styles.otpSub}>
                Ask your practitioner for the verification code to confirm
                attendance.
              </Text>

              <TextInput
                value={verificationCode}
                onChangeText={text => setVerificationCode(text.toUpperCase())}
                placeholder="ENTER CODE"
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCapitalize="characters"
                style={styles.codeInput}
              />

              <TouchableOpacity
                style={[
                  styles.otpConfirmBtn,
                  !verificationCode.trim() && styles.otpConfirmBtnDisabled,
                ]}
                activeOpacity={0.85}
                onPress={verifyAppointment}
                disabled={!verificationCode.trim()}
              >
                {verificationCode.trim() && (
                  <GradientBg
                    id="otpConfirm"
                    c1="#6A9455"
                    c2="#3A5A2A"
                    r={14}
                    horizontal
                  />
                )}
                <Text style={[styles.otpConfirmText]}>Confirm</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </KeyboardAvoidingView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  photoWrap: { height: height / 2.2, width: '100%' },
  photo: { width: '100%', height: '100%', position: 'absolute' },
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
  codeInput: {
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.25)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: colors.white,
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 6,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 24,
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
