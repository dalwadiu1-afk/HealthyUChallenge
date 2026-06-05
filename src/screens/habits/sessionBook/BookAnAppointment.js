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

const generateCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const monthKey = new Date()
  .toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  .replace(' ', '_');

export default function BookAnAppointment({ navigation, route }) {
  const { doctorId = '1' } = route.params || {};

  const actionSheetRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [seeMore, setSeeMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);
  const [emailOpened, setEmailOpened] = useState(false);
  // Need to fix this fun
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
      const doctorSnapshot = await firestore()
        .collection('doctors')
        .doc('1')
        .get();

      const doctorData = doctorSnapshot?.data();

      setDoctor(doctorData);

      const ref = database().ref(`/users/${uid}/habits/booking`);

      const listener = ref.on('value', snapshot => {
        const data = snapshot.val();
        console.log('data :>> ', data);
        if (!data) {
          setLoading(false);
          return;
        }
        const latest = Object.values(data).reduce((latest, current) => {
          console.log('object :>> ', latest, current);
          return current.createdAt > latest.createdAt ? current : latest;
        });
        console.log('latest?.status :>> ', data, latest?.status);
        // if (latest?.status === 'requested') {
        navigation.replace('ConfirmationCode', {
          doctor: {
            ...latest,
            ...doctorData,
          },
        });
        // }

        setLoading(false);
      });

      return () => ref.off('value', listener);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const openEmail = () => {
    const professorEmail = doctor?.email;
    const subject = 'Request for Appointment';

    const selectedDaysText =
      selectedDay.length > 0 ? selectedDay.join(', ') : 'your available times';

    const body = `Dear Professor [Last Name],

I hope you are doing well.

I am ${fullName}, a student. I wanted to ask about your availability for an appointment.

Please let me know a time that works best for you.

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

      const monthKey = new Date()
        .toLocaleString('en-US', {
          month: 'long',
          year: 'numeric',
        })
        .replace(' ', '_');

      // ==========================
      // CHECK EXISTING APPOINTMENT
      // ==========================
      const bookingSnap = await database()
        .ref(`/users/${userId}/habits/booking/${monthKey}`)
        .once('value');

      const bookings = bookingSnap.val();

      if (bookings) {
        const latest = Object.values(bookings).reduce((a, b) =>
          a.createdAt > b.createdAt ? a : b,
        );

        if (latest?.status === 'requested') {
          Alert.alert(
            'Appointment Pending',
            'Please complete your current appointment before booking another one.',
          );
          return;
        }
      }

      // ==========================
      // CREATE NEW APPOINTMENT
      // ==========================
      const now = Date.now();

      const appointmentId = database().ref().push().key;

      const code = generateCode();

      const updates = {};

      updates[`users/${userId}/habits/booking/${monthKey}/${appointmentId}`] = {
        code,
        doctorId,
        doctorName: doctor?.name || '',
        days: selectedDay,
        status: 'requested',
        bookingId: appointmentId,
        createdAt: now,
        used: false,
      };

      await database().ref().update(updates);

      navigation.navigate('ConfirmationCode', {
        doctor: {
          ...doctor,
          ...updates[
            `users/${userId}/habits/booking/${monthKey}/${appointmentId}`
          ],
        },
      });
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
    <View style={styles.root}>
      {/* FIXED HERO IMAGE */}
      <Image
        source={{
          uri:
            doctor.image ||
            'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
        }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      <Header
        headerContainer={{
          paddingHorizontal: 23,
          zIndex: 2,
          position: 'absolute',
          width: '100%',
          paddingTop: StatusBar.currentHeight,
        }}
        leftBtnStyle={{ backgroundColor: 'rgba(7, 4, 19, 0.6)' }}
      />

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        // scrollEnabled={seeMore}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HERO_HEIGHT - 40,
          flexGrow: 1,
        }}
      >
        <View style={styles.card}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>

          <View style={styles.statsRow}>
            <Stat value={`${doctor.patients}+`} label="Patients" />
            <Stat value={doctor.experience} label="Experience" />
            <Stat value={`${doctor.rating}★`} label="Reviews" />
            <Stat value={doctor.awards} label="Awards" />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>About Me</Text>

          <Text style={styles.aboutText} numberOfLines={seeMore ? 0 : 3}>
            {doctor.about}
          </Text>

          <TouchableOpacity
            style={{ marginTop: 10, alignSelf: 'flex-end' }}
            onPress={() => setSeeMore(!seeMore)}
          >
            <Text style={styles.readMore}>
              {!seeMore ? '...Read More' : '...Read Less'}
            </Text>
          </TouchableOpacity>

          <View style={{ marginTop: 20, justifyContent: 'flex-end' }}>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => openEmail()}
            >
              <Text style={styles.bookBtnText}>Book An Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
    backgroundColor: colors.dark,
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
    paddingBottom: 40,
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
    textAlign: 'justify',
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
    justifyContent: 'flex-end',
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
