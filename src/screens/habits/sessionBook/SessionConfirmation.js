import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';
import { generateDaysFromToday } from '../../../utils/helper';

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

export default function SessionConfirmation({ navigation }) {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(0);

  useEffect(() => {
    setDates(generateDaysFromToday());
  }, []);

  const selectedDateObj = dates[selectedDate];

  return (
    <View style={styles.root}>
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
        {/* Dark overlay gradient */}
        <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="photoFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.4" stopColor="transparent" stopOpacity="0" />
              <Stop offset="1" stopColor={colors.dark} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#photoFade)" />
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

      {/* Doctor info card overlapping photo */}
      <View style={styles.doctorCard}>
        <GradientBg id="docCard" c1="#2D4A25" c2="#1A2818" r={20} />
        <Text style={styles.doctorName}>Dr. Smith Sras</Text>
        <Text style={styles.doctorSpec}>Cardiologist Specialist</Text>
        <Text style={styles.doctorOrg}>Montclair State University</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Date picker */}
        <Text style={styles.sectionLabel}>Select Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
        >
          {dates.map((item, index) => {
            const isActive = selectedDate === index;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedDate(index);
                  setSelectedTime(0);
                }}
                style={[styles.dateChip, isActive && styles.dateChipActive]}
                activeOpacity={0.75}
              >
                {isActive && (
                  <GradientBg
                    id={`dc${index}`}
                    c1="#6A9455"
                    c2="#3A5A2A"
                    r={12}
                    horizontal
                  />
                )}
                <Text
                  style={[
                    styles.dateChipDay,
                    isActive && styles.dateChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.dateChipNum,
                    isActive && styles.dateChipTextActive,
                  ]}
                >
                  {item.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time picker */}
        <Text style={[styles.sectionLabel, { marginTop: 22 }]}>
          Available Time
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
        >
          {selectedDateObj?.timeSlots.map((slot, index) => {
            const isActive = selectedTime === index;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedTime(index)}
                style={[styles.timeChip, isActive && styles.timeChipActive]}
                activeOpacity={0.75}
              >
                {isActive && (
                  <GradientBg
                    id={`tc${index}`}
                    c1="#6A9455"
                    c2="#3A5A2A"
                    r={12}
                    horizontal
                  />
                )}
                <Text
                  style={[
                    styles.timeChipText,
                    isActive && styles.timeChipTextActive,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected summary */}
        {selectedDateObj && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  stroke={colors.secondary}
                  strokeWidth={1.8}
                />
                <Path
                  d="M16 2v4M8 2v4M3 10h18"
                  stroke={colors.secondary}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.summaryText}>
                {selectedDateObj.label}, {selectedDateObj.date} ·{' '}
                {selectedDateObj.fullDate}
              </Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 8 }]}>
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
              <Text style={styles.summaryText}>
                {selectedDateObj.timeSlots[selectedTime]}
              </Text>
            </View>
          </View>
        )}

        {/* Confirm button */}
        <TouchableOpacity
          style={styles.confirmBtn}
          activeOpacity={0.85}
          onPress={() => navigation?.navigate('ConfirmationCode')}
        >
          <GradientBg
            id="confirmGrad"
            c1="#6A9455"
            c2="#3A5A2A"
            r={16}
            horizontal
          />
          <Text style={styles.confirmBtnText}>Confirm Appointment</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  photoWrap: { height: 280, width: '100%' },
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
    marginTop: -60,
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    zIndex: 1,
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
    fontFamily: fontFamily.montserratMedium,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 48 },

  sectionLabel: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 12,
  },
  chipScroll: { marginBottom: 4 },

  dateChip: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
    minWidth: 56,
    overflow: 'hidden',
  },
  dateChipActive: {
    borderColor: 'rgba(143,175,120,0.4)',
  },
  dateChipDay: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    marginBottom: 4,
  },
  dateChipNum: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
  },
  dateChipTextActive: { color: colors.white },

  timeChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeChipActive: { borderColor: 'rgba(143,175,120,0.4)' },
  timeChipText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  timeChipTextActive: { color: colors.white },

  summaryCard: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },

  confirmBtn: {
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
