import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';

const { height } = Dimensions.get('window');

const HERO_HEIGHT = height * 0.46;

const STATS = [
  { label: 'Patients', value: '116+' },
  { label: 'Experience', value: '8 Yrs' },
  { label: 'Reviews', value: '4.9★' },
  { label: 'Awards', value: '12' },
];

export default function BookAnAppointment({ navigation }) {
  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Static hero image — sits behind everything */}
      <Image
        source={{
          uri: 'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
        }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* Scrollable content — starts below the hero, slides up over it */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        {/* Spacer so card starts at the bottom of the hero */}
        <View style={{ height: HERO_HEIGHT - 32 }} />

        {/* Details card */}
        <View style={styles.card}>
          <Text style={styles.doctorName}>Dr. Smith Sras</Text>
          <Text style={styles.specialty}>Senior Nutrition Specialist</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {STATS.map((item, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* About */}
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.aboutText}>
            Dr. Smith Sras is a top-ranked nutrition specialist at Crist
            Hospital in London, UK. She has received several awards for her
            outstanding contribution to patient care and wellness coaching.{' '}
            <Text style={styles.readMore}>Read More…</Text>
          </Text>

          {/* Available days */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Available Days
          </Text>
          <View style={styles.daysRow}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
              <View key={day} style={styles.dayChip}>
                <Text style={styles.dayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Book button */}
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => navigation.navigate('SessionConfirmation')}
            activeOpacity={0.85}
          >
            <Text style={styles.bookBtnText}>Book An Appointment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Back button — fixed over the hero, never scrolls */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
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
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
  },

  /* ── Hero (static, behind scroll) ── */
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    width: '100%',
  },

  /* ── ScrollView transparent so hero shows through ── */
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* ── Card that slides up over the hero ── */
  card: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: colors.dark,
    paddingHorizontal: 22,
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

  /* ── Stats ── */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.bubbleDark,
    marginBottom: 8,
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

  /* ── About ── */
  sectionTitle: {
    color: colors.white,
    fontSize: 17,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 10,
  },
  aboutText: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    lineHeight: 21,
  },
  readMore: {
    color: colors.secondary,
    fontFamily: fontFamily.montserratMedium,
  },

  /* ── Days ── */
  daysRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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

  /* ── Book button ── */
  bookBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 49,
    alignItems: 'center',
    marginBottom: 8,
  },
  bookBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },

  /* ── Back button (fixed, over everything) ── */
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
});
