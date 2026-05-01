import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';
import { launchCamera } from 'react-native-image-picker';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';
import { Header, Wrapper } from '../../../components';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

const TOTAL_DAYS = 7;
const TOTAL_WEEKS = 4;
const USER_ID = auth().currentUser?.uid;

function GradientBg({ id, c1, c2, r = 20, horizontal = false }) {
  const x2 = horizontal ? '1' : '1';
  const y2 = horizontal ? '0' : '1';
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
          <Stop offset="0" stopColor={c1} stopOpacity="1" />
          <Stop offset="1" stopColor={c2} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} rx={r} />
    </Svg>
  );
}

function CameraIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
        stroke="rgba(143,175,120,0.7)"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx={12}
        cy={13}
        r={4}
        stroke="rgba(143,175,120,0.7)"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

const FermentedFoodChallenge = ({ navigation }) => {
  const [weeks, setWeeks] = useState(
    Array(TOTAL_WEEKS)
      .fill(null)
      .map(() => Array(TOTAL_DAYS).fill(null)),
  );
  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const completed = weeks.flat().filter(Boolean).length;
  const total = TOTAL_WEEKS * TOTAL_DAYS;
  const progress = completed / total;
  const userRef = database().ref(`/users/${USER_ID}`);

  useEffect(() => {
    if (!USER_ID) return;

    const ref = database().ref(`/users/${USER_ID}`);

    const listener = ref.on('value', snap => {
      const data = snap.val();

      if (!data?.logs) return;

      const restored = Array.from({ length: TOTAL_WEEKS }, () =>
        Array(TOTAL_DAYS).fill(null),
      );

      Object.entries(data.logs || {}).forEach(([weekKey, days]) => {
        const weekIndex = parseInt(weekKey.replace('week', ''), 10) - 1;

        if (isNaN(weekIndex) || weekIndex < 0 || weekIndex >= TOTAL_WEEKS)
          return;

        Object.entries(days || {}).forEach(([dayKey, value]) => {
          const dayIndex = parseInt(dayKey.replace('day', ''), 10);

          if (isNaN(dayIndex) || dayIndex < 0 || dayIndex >= TOTAL_DAYS) return;

          if (!restored[weekIndex]) return;

          restored[weekIndex][dayIndex] = value;
        });
      });

      setWeeks(restored);
    });

    return () => ref.off('value', listener);
  }, []);

  const saveToDB = async updatedWeeks => {
    if (!USER_ID) return;

    const updates = {};

    updatedWeeks.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        if (!day) return;

        updates[`logs/week${weekIndex + 1}/day${dayIndex}`] = day;
      });
    });

    await database().ref(`/users/${USER_ID}`).update(updates);
  };

  const pickImage = async dayIndex => {
    if (dayIndex !== currentDayIndex) return;
    const granted = await requestCameraPermission();
    if (!granted) return;

    launchCamera({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel || response.errorCode) return;
      if (response?.assets?.length > 0) {
        const nw = weeks.map(w => [...w]);
        nw[currentWeek][dayIndex] = {
          uri: response.assets[0].uri,
          label: '',
          timestamp: new Date().toLocaleString(),
        };
        setWeeks(nw);
        saveToDB(nw);
        if (dayIndex < TOTAL_DAYS - 1) {
          setCurrentDayIndex(p => p + 1);
        } else if (currentWeek < TOTAL_WEEKS - 1) {
          setCurrentWeek(p => p + 1);
          setCurrentDayIndex(0);
        }
      }
    });
  };

  const updateLabel = (dayIndex, text) => {
    const nw = weeks.map(w => [...w]);

    nw[currentWeek][dayIndex] = {
      ...nw[currentWeek][dayIndex],
      label: text,
    };

    setWeeks(nw);
    saveToDB(nw);
  };

  const deletePhoto = dayIndex => {
    const nw = weeks.map(w => [...w]);

    nw[currentWeek][dayIndex] = null;

    setWeeks(nw);
    saveToDB(nw);
  };

  return (
    <View style={styles.root}>
      <Header
        header={'🥒 Fermented Food'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />
      {/* <Text style={styles.heroTitle}>🥒 Fermented Food Challenge</Text> */}
      <Text style={styles.heroSub}>
        Eat one fermented food daily for 4 weeks
      </Text>

      {/* Overall progress */}
      <View style={styles.progressRow}>
        <View style={styles.progressBg}>
          <View
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {completed}/{total}
        </Text>
      </View>

      <Wrapper
        containerStyle={{ marginTop: 20 }}
        isForgot
        safeAreaPops={{ edges: ['bottom'] }}
      >
        {/* Week tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsWrap}
        >
          {Array.from({ length: TOTAL_WEEKS }).map((_, i) => {
            const weekDone = weeks[i]?.every(Boolean);
            const isActive = currentWeek === i;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.tab,
                  isActive && styles.tabActive,
                  weekDone && styles.tabDone,
                ]}
                onPress={() => {
                  setCurrentWeek(i);
                  setCurrentDayIndex(0);
                }}
                activeOpacity={0.8}
              >
                {isActive && (
                  <GradientBg
                    id={`tab${i}`}
                    c1="#6A9455"
                    c2="#3A5A2A"
                    r={12}
                    horizontal
                  />
                )}
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {weekDone ? '✓ ' : ''}Week {i + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Week progress mini bar */}
        <View style={styles.weekProgressCard}>
          <GradientBg
            id="wpCard"
            c1="rgba(106,148,85,0.22)"
            c2="rgba(30,48,24,0.12)"
            r={18}
            horizontal
          />
          <View style={styles.weekProgressHeader}>
            <Text style={styles.weekProgressTitle}>
              Week {currentWeek + 1} Progress
            </Text>
            <Text style={styles.weekProgressCount}>
              {weeks[currentWeek].filter(Boolean).length}/{TOTAL_DAYS} days
            </Text>
          </View>
          <View style={styles.dayDots}>
            {Array.from({ length: TOTAL_DAYS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dayDot,
                  weeks[currentWeek][i] && styles.dayDotDone,
                  i === currentDayIndex &&
                    !weeks[currentWeek][i] &&
                    styles.dayDotCurrent,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Day cards */}
        {Array.from({ length: TOTAL_DAYS }).map((_, dayIndex) => {
          const item = weeks[currentWeek][dayIndex];
          const isLocked = dayIndex > currentDayIndex;
          const isCurrent = dayIndex === currentDayIndex;
          const isDone = !!item;

          return (
            <View
              key={dayIndex}
              style={[
                styles.card,
                isDone && styles.cardDone,
                isLocked && styles.cardLocked,
              ]}
            >
              {/* Card header */}
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.dayBadge,
                    isDone && styles.dayBadgeDone,
                    isLocked && styles.dayBadgeLocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayBadgeText,
                      isDone && { color: colors.white },
                    ]}
                  >
                    {isDone ? '✓' : dayIndex + 1}
                  </Text>
                </View>
                <Text style={[styles.cardTitle, isLocked && styles.lockedText]}>
                  Week {currentWeek + 1} · Day {dayIndex + 1}
                </Text>
                {isDone && (
                  <View style={styles.donePill}>
                    <Text style={styles.donePillText}>Done</Text>
                  </View>
                )}
                {isCurrent && !isDone && (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>Upload Now</Text>
                  </View>
                )}
                {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
              </View>

              {isDone ? (
                <View>
                  <Image source={{ uri: item.uri }} style={styles.photo} />
                  <TextInput
                    value={item.label}
                    onChangeText={t => updateLabel(dayIndex, t)}
                    placeholder="e.g. Yogurt, Kimchi, Kombucha…"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    style={styles.labelInput}
                  />
                  <Text style={styles.timestamp}>{item.timestamp}</Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.retakeBtn}
                      onPress={() => pickImage(dayIndex)}
                    >
                      <Text style={styles.retakeText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => deletePhoto(dayIndex)}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.aiBtn}>
                      <Text style={styles.aiText}>🤖 AI Identify</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : isLocked ? (
                <View style={styles.lockedBox}>
                  <Text style={styles.lockEmoji}>🔒</Text>
                  <Text style={styles.lockedSub}>
                    Complete previous days first
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => pickImage(dayIndex)}
                  activeOpacity={0.8}
                >
                  <CameraIcon />
                  <Text style={styles.uploadText}>Upload Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  heroBg: { paddingBottom: 20, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 21,
    fontFamily: fontFamily.montserratBold,
    paddingHorizontal: 18,
    marginBottom: 5,
    includeFontPadding: false,
  },
  heroSub: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.interRegular,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  progressRow: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBg: {
    flex: 1,
    height: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 5,
  },
  progressLabel: {
    color: colors.grey,
    fontSize: 11,
    fontFamily: fontFamily.interRegular,
  },

  scroll: { padding: 18, paddingTop: 14, paddingBottom: 48 },

  /* Tabs */
  tabsWrap: { marginBottom: 14 },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  tabActive: { borderColor: '#8FAF78', borderWidth: 1.5 },
  tabDone: { borderColor: 'rgba(143,175,120,0.3)' },
  tabText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  tabTextActive: {
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
  },

  /* Week progress card */
  weekProgressCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    padding: 14,
    marginBottom: 16,
    overflow: 'hidden',
  },
  weekProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekProgressTitle: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },
  weekProgressCount: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },
  dayDots: { flexDirection: 'row', gap: 6 },
  dayDot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dayDotDone: { backgroundColor: colors.secondary },
  dayDotCurrent: { backgroundColor: '#FFC15A' },

  /* Day cards */
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardDone: {
    borderColor: 'rgba(143,175,120,0.3)',
    backgroundColor: 'rgba(143,175,120,0.06)',
  },
  cardLocked: {
    borderColor: 'rgba(255,255,255,0.04)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  dayBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBadgeDone: {
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
  },
  dayBadgeLocked: { backgroundColor: 'rgba(255,255,255,0.04)' },
  dayBadgeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: fontFamily.montserratBold,
  },
  cardTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
  lockedText: { color: 'rgba(255,255,255,0.25)' },

  donePill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 49,
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
  },
  donePillText: {
    color: colors.secondary,
    fontSize: 10,
    fontFamily: fontFamily.interSemiBold,
  },
  activePill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 49,
    backgroundColor: 'rgba(255,193,90,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,193,90,0.35)',
  },
  activePillText: {
    color: '#FFC15A',
    fontSize: 10,
    fontFamily: fontFamily.interSemiBold,
  },
  lockIcon: { fontSize: 14, includeFontPadding: false },

  photo: { width: '100%', height: 140, borderRadius: 12, marginBottom: 10 },
  labelInput: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.interRegular,
    paddingBottom: 6,
    marginBottom: 8,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
    fontFamily: fontFamily.interRegular,
    marginBottom: 10,
  },
  actionRow: { flexDirection: 'row', gap: 8 },
  retakeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
    backgroundColor: 'rgba(143,175,120,0.1)',
  },
  retakeText: {
    color: colors.secondary,
    fontSize: 11,
    fontFamily: fontFamily.interSemiBold,
  },
  deleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    backgroundColor: 'rgba(255,107,107,0.08)',
  },
  deleteText: {
    color: '#FF6B6B',
    fontSize: 11,
    fontFamily: fontFamily.interSemiBold,
  },
  aiBtn: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(167,130,255,0.3)',
    backgroundColor: 'rgba(167,130,255,0.08)',
    alignItems: 'center',
  },
  aiText: {
    color: '#A782FF',
    fontSize: 11,
    fontFamily: fontFamily.interSemiBold,
  },

  uploadBtn: {
    height: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.25)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(143,175,120,0.04)',
  },
  uploadText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },

  lockedBox: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  lockEmoji: { fontSize: 20, includeFontPadding: false },
  lockedSub: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    fontFamily: fontFamily.interRegular,
  },
});

export default FermentedFoodChallenge;
