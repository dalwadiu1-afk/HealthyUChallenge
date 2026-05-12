import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Linking,
  AppState,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { colors, fontFamily } from '../../../constant';
import { Header, Wrapper } from '../../../components';
import database from '@react-native-firebase/database';
import ActionSheet from 'react-native-actions-sheet';

const { height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.46;
const user = auth().currentUser;
const fullName = user?.displayName || '';
const email = user?.email || '';
const uid = user?.uid || '';

export default function BookAnAppointment({ navigation, route }) {
  const { doctorId = '1' } = route.params || {};

  const actionSheetRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);
  const [emailOpened, setEmailOpened] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        emailOpened
      ) {
        // User came back from Gmail
        showConfirmation();
      }

      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [emailOpened]);

  const showConfirmation = () => {
    setEmailOpened(false);
    actionSheetRef.current?.show();
  };

  const fetchData = async () => {
    try {
      const snapshot = await firestore().collection('doctors').doc('1').get();
      setDoctor(snapshot?.data());
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false); // ✅ correct
    }
  };

  const openEmail = () => {
    const professorEmail = 'professor@example.com';
    const subject = 'Request for Appointment';

    const selectedDaysText =
      selectedDay.length > 0 ? selectedDay.join(', ') : 'your available times';

    const body = `Dear Professor [Last Name],

I hope you are doing well.

I am ${fullName}, a student. I wanted to ask about your availability for an appointment.

Please let me know a time that works best for you. I am generally available on ${selectedDaysText}, but I can adjust to fit your schedule.

Thank you for your time and consideration.

Best regards,
${fullName}
${uid}
Email: ${email}`;

    const url = `mailto:${professorEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    setEmailOpened(true); // 👈 important
    Linking.openURL(url);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveAppointment = async () => {
    try {
      const userId = uid;

      const now = new Date();
      const monthKey = now
        .toLocaleString('en-US', {
          month: 'long',
          year: 'numeric',
        })
        .replace(' ', '_'); // May_2026

      const appointmentId = database().ref().push().key;

      const updates = {};

      updates[`users/${userId}/habits/${monthKey}/${appointmentId}`] = {
        doctorId,
        doctorName: doctor?.name || '',
        days: selectedDay,
        status: 'requested',
        createdAt: Date.now(),
      };

      await database().ref().update(updates);
      navigation.navigate('SessionConfirmation', { doctorId });
    } catch (e) {
      console.log('error:', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: colors.white }}>Doctor not found</Text>
      </View>
    );
  }

  return (
    <Wrapper containerStyle={{ paddingHorizontal: 0 }}>
      <View style={styles.root}>
        {/* HERO IMAGE */}
        {console.log('doctor.image :>> ', doctor.image)}
        <Image
          source={{
            uri:
              doctor.image ||
              'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* CONTENT */}

        <Header
          headerContainer={{
            paddingHorizontal: 23,
            zIndex: 1,
            paddingTop: 20,
          }}
          leftBtnStyle={{ backgroundColor: 'rgba(7, 4, 19, 0.6)' }}
        />
        <View
          style={{
            height: HERO_HEIGHT - 32,
            position: 'absolute',
            width: '100%',
          }}
        />

        <View style={styles.card}>
          {/* NAME */}
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>

          {/* STATS */}
          <View style={styles.statsRow}>
            <Stat value={`${doctor.patients}+`} label="Patients" />
            <Stat value={doctor.experience} label="Experience" />
            <Stat value={`${doctor.rating}★`} label="Reviews" />
            <Stat value={doctor.awards} label="Awards" />
          </View>

          <View style={styles.divider} />

          {/* ABOUT */}
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.aboutText}>
            {doctor.about}
            <Text style={styles.readMore}> Read More…</Text>
          </Text>

          {/* AVAILABLE DAYS */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Available Days
          </Text>

          <View style={styles.daysRow}>
            {doctor.availableDays?.map((day, index) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedDay(prev => {
                    if (prev.includes(day)) {
                      // remove if already selected
                      return prev.filter(d => d !== day);
                    } else {
                      // add if not selected
                      return [...prev, day];
                    }
                  });
                }}
                key={index}
                style={[
                  styles.dayChip,
                  selectedDay.includes(day) && {
                    backgroundColor: colors.secondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDay.includes(day) && {
                      color: colors.primary,
                      fontFamily: fontFamily.montserratBold,
                    },
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* BOOK BUTTON */}
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={
              () => openEmail()
              // navigation.navigate('SessionConfirmation', { doctorId })
            }
          >
            <Text style={styles.bookBtnText}>Book An Appointment</Text>
          </TouchableOpacity>
        </View>

        {/* BACK BUTTON */}
        <ActionSheet ref={actionSheetRef}>
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 16, marginBottom: 20 }}>
              Did you send the appointment email?
            </Text>

            <TouchableOpacity
              style={{
                padding: 14,
                backgroundColor: colors.secondary,
                borderRadius: 10,
                marginBottom: 10,
              }}
              onPress={async () => {
                actionSheetRef.current?.hide();
                await saveAppointment();
              }}
            >
              <Text style={{ color: '#000', textAlign: 'center' }}>
                Yes, Sent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                padding: 14,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#ccc',
              }}
              onPress={() => actionSheetRef.current?.hide()}
            >
              <Text style={{ textAlign: 'center' }}>Not Yet</Text>
            </TouchableOpacity>
          </View>
        </ActionSheet>
      </View>
    </Wrapper>
  );
}

/* 🔁 Reusable Stat Component */
const Stat = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.dark,
  },

  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    width: '100%',
  },

  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  card: {
    paddingHorizontal: 23,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: colors.dark,
    paddingTop: 28,
    minHeight: height * 0.6,
    top: height / 3,
  },

  doctorName: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 4,
  },

  specialty: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
    marginBottom: 24,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statValue: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },

  statLabel: {
    color: colors.grey,
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: 24,
  },

  sectionTitle: {
    color: colors.white,
    fontSize: 17,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 10,
  },

  aboutText: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
    lineHeight: 21,
  },

  readMore: {
    color: colors.secondary,
  },

  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },

  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.35)',
    backgroundColor: 'rgba(143,175,120,0.08)',
  },

  dayText: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },

  bookBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 49,
    alignItems: 'center',
  },

  bookBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },

  backBtn: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 44) + 10,
    left: 18,
    width: 44,
    height: 44,
    borderRadius: 49,
    borderWidth: 1.5,
    borderColor: '#8FAF78',
    backgroundColor: '#4D6644',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
