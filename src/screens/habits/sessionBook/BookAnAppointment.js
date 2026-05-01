import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import firestore from '@react-native-firebase/firestore';

import { colors, fontFamily } from '../../../constant';
import { Wrapper } from '../../../components';

const { height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.46;

export default function BookAnAppointment({ navigation, route }) {
  const { doctorId = '1' } = route.params || {};

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(false);
    try {
      const snapshot = await firestore().collection('doctors').doc('1').get();

      console.log('snapshot :>> ', snapshot.data());
      setDoctor(snapshot?.data());
    } catch (e) {
      console.log('error :>> ', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      {/* HERO IMAGE */}
      <Image
        source={{ uri: doctor.image }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        <View style={{ height: HERO_HEIGHT - 32 }} />

        <View style={styles.card}>
          <Wrapper style={{ paddingHorizontal: 0 }}>
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
                <View key={index} style={styles.dayChip}>
                  <Text style={styles.dayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* BOOK BUTTON */}
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() =>
                navigation.navigate('SessionConfirmation', { doctorId })
              }
            >
              <Text style={styles.bookBtnText}>Book An Appointment</Text>
            </TouchableOpacity>
          </Wrapper>
        </View>
      </ScrollView>

      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: colors.dark,
    paddingTop: 28,
    minHeight: height * 0.6,
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
