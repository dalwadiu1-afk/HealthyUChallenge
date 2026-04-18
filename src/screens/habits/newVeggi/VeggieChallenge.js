import React, { useState } from 'react';
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

const DAYS_PER_WEEK = 1;

function GradientBg({ id, c1, c2, r = 20 }) {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
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

const VeggieChallenge = ({ navigation }) => {
  const [weeks, setWeeks] = useState([
    {
      startDate: new Date().toISOString(),
      entries: Array(DAYS_PER_WEEK).fill(null),
    },
  ]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentDay, setCurrentDay] = useState(0);

  const isWeekUnlocked = weekIndex => {
    if (weekIndex === 0) return true;
    const week = weeks[weekIndex];
    if (!week?.startDate) return false;
    return (new Date() - new Date(week.startDate)) / 86400000 >= 7;
  };

  const pickImage = async (weekIndex, dayIndex) => {
    if (weekIndex !== currentWeek || !isWeekUnlocked(weekIndex)) return;
    const granted = await requestCameraPermission();
    if (!granted) return;

    launchCamera({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel || response.errorCode) return;
      const uri = response?.assets?.[0]?.uri;
      if (!uri) return;

      setWeeks(prev => {
        const updated = [...prev];
        if (!updated[weekIndex]) return prev;
        updated[weekIndex] = {
          ...updated[weekIndex],
          entries: updated[weekIndex].entries.map((e, i) =>
            i === dayIndex
              ? { uri, label: '', timestamp: new Date().toLocaleString() }
              : e,
          ),
        };
        return updated;
      });

      if (dayIndex < DAYS_PER_WEEK - 1) {
        setCurrentDay(prev => prev + 1);
      } else {
        const nextWeek = currentWeek + 1;
        setWeeks(old => {
          const copy = [...old];
          if (!copy[nextWeek]) {
            copy.push({
              startDate: new Date().toISOString(),
              entries: Array(DAYS_PER_WEEK).fill(null),
            });
          }
          return copy;
        });
        setCurrentDay(0);
        setCurrentWeek(nextWeek);
      }
    });
  };

  const updateLabel = (weekIndex, dayIndex, text) => {
    if (weekIndex !== currentWeek) return;
    setWeeks(prev => {
      const updated = [...prev];
      if (!updated[weekIndex]?.entries?.[dayIndex]) return prev;
      updated[weekIndex] = {
        ...updated[weekIndex],
        entries: updated[weekIndex].entries.map((e, i) =>
          i === dayIndex ? { ...e, label: text } : e,
        ),
      };
      return updated;
    });
  };

  const deleteEntry = (weekIndex, dayIndex) => {
    if (weekIndex !== currentWeek) return;
    setWeeks(prev => {
      const updated = [...prev];
      if (!updated[weekIndex]) return prev;
      updated[weekIndex] = {
        ...updated[weekIndex],
        entries: updated[weekIndex].entries.map((e, i) =>
          i === dayIndex ? null : e,
        ),
      };
      return updated;
    });
  };

  const isEditable = (weekIndex, dayIndex) =>
    weekIndex === currentWeek &&
    isWeekUnlocked(weekIndex) &&
    dayIndex === currentDay;

  const completedWeeks = weeks.filter(w =>
    w.entries.every(e => e !== null),
  ).length;
  const progress = weeks.length > 0 ? completedWeeks / weeks.length : 0;

  return (
    <View style={styles.root}>
      <Header
        header={'Veggie Challenge'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />
      <Wrapper isForgot safeAreaPops={{ edges: ['bottom'] }}>
        {/* Hero */}

        <Text style={styles.heroTitle}>🥦 Weekly Veggie Challenge</Text>
        <Text style={styles.heroSub}>
          Upload 1 veggie meal per week — new week unlocks every 7 days
        </Text>

        <View style={styles.progressRow}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(progress * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {completedWeeks}/{weeks.length} weeks
          </Text>
        </View>

        {weeks.map((week, wi) => {
          const unlocked = isWeekUnlocked(wi);
          const isCurrent = wi === currentWeek;
          const weekDone = week.entries.every(e => e !== null);

          return (
            <View
              key={wi}
              style={[
                styles.weekCard,
                weekDone && styles.weekCardDone,
                !unlocked && styles.weekCardLocked,
              ]}
            >
              {weekDone && unlocked && (
                <GradientBg
                  id={`vwg${wi}`}
                  c1="rgba(77,102,68,0.18)"
                  c2="rgba(45,74,37,0.08)"
                />
              )}

              {/* Week header row */}
              <View style={styles.weekHeader}>
                <View
                  style={[
                    styles.weekNumBadge,
                    weekDone && styles.weekNumBadgeDone,
                    !unlocked && styles.weekNumBadgeLocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.weekNumText,
                      weekDone && { color: colors.white },
                    ]}
                  >
                    {weekDone ? '✓' : wi + 1}
                  </Text>
                </View>
                <Text
                  style={[styles.weekTitleText, !unlocked && styles.lockedText]}
                >
                  Week {wi + 1}
                </Text>
                {weekDone && (
                  <View style={styles.completedPill}>
                    <Text style={styles.completedPillText}>Completed</Text>
                  </View>
                )}
                {isCurrent && !weekDone && (
                  <View style={styles.currentPill}>
                    <Text style={styles.currentPillText}>Active</Text>
                  </View>
                )}
                {!unlocked && (
                  <View style={styles.lockedPill}>
                    <Text style={styles.lockedPillText}>🔒 Locked</Text>
                  </View>
                )}
              </View>

              {/* Locked */}
              {!unlocked ? (
                <View style={styles.lockedBox}>
                  <Text style={styles.lockEmoji}>🔒</Text>
                  <Text style={styles.lockedSub}>Unlocks after 7 days</Text>
                </View>
              ) : (
                <>
                  {week.entries.map((entry, di) => {
                    const editable = isEditable(wi, di);
                    return (
                      <View key={di}>
                        {entry ? (
                          <View style={styles.entryCard}>
                            <Image
                              source={{ uri: entry.uri }}
                              style={styles.entryImg}
                            />
                            <Text style={styles.entryTime}>
                              {entry.timestamp}
                            </Text>
                            <TextInput
                              value={entry.label}
                              onChangeText={t => updateLabel(wi, di, t)}
                              editable={editable}
                              placeholder="Vegetable name…"
                              placeholderTextColor="rgba(255,255,255,0.3)"
                              style={styles.entryInput}
                            />
                            {editable && (
                              <View style={styles.entryActions}>
                                <TouchableOpacity
                                  style={styles.retakeBtn}
                                  onPress={() => pickImage(wi, di)}
                                >
                                  <Text style={styles.retakeText}>Retake</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.deleteBtn}
                                  onPress={() => deleteEntry(wi, di)}
                                >
                                  <Text style={styles.deleteText}>Delete</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        ) : isCurrent && di === currentDay ? (
                          <TouchableOpacity
                            style={styles.uploadBtn}
                            onPress={() => pickImage(wi, di)}
                            activeOpacity={0.8}
                          >
                            <CameraIcon />
                            <Text style={styles.uploadText}>
                              Upload Veggie Meal Photo
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    );
                  })}
                </>
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
    paddingBottom: 16,
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
    fontSize: 22,
    fontFamily: fontFamily.montserratBold,
    paddingHorizontal: 18,
    marginBottom: 6,
    includeFontPadding: false,
  },
  heroSub: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  progressRow: {
    paddingHorizontal: 18,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBg: {
    flex: 1,
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 6,
  },
  progressLabel: {
    color: colors.grey,
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },

  scroll: { padding: 18, paddingTop: 16, paddingBottom: 48 },

  /* Week cards */
  weekCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  weekCardDone: { borderColor: 'rgba(143,175,120,0.3)' },
  weekCardLocked: {
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  weekNumBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekNumBadgeDone: {
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
  },
  weekNumBadgeLocked: { backgroundColor: 'rgba(255,255,255,0.04)' },
  weekNumText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: fontFamily.montserratBold,
  },
  weekTitleText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    flex: 1,
  },
  lockedText: { color: 'rgba(255,255,255,0.25)' },

  completedPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 49,
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.35)',
  },
  completedPillText: {
    color: colors.secondary,
    fontSize: 11,
    fontFamily: fontFamily.montserratSemiBold,
  },
  currentPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 49,
    backgroundColor: 'rgba(255,193,90,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,193,90,0.35)',
  },
  currentPillText: {
    color: '#FFC15A',
    fontSize: 11,
    fontFamily: fontFamily.montserratSemiBold,
  },
  lockedPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 49,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  lockedPillText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },

  lockedBox: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  lockEmoji: { fontSize: 22, includeFontPadding: false },
  lockedSub: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
  },

  /* Entry card */
  entryCard: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  entryImg: { width: '100%', height: 160, borderRadius: 0 },
  entryTime: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  entryInput: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginTop: 4,
  },
  entryActions: { flexDirection: 'row', gap: 8, padding: 12 },
  retakeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
    backgroundColor: 'rgba(143,175,120,0.1)',
    alignItems: 'center',
  },
  retakeText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    backgroundColor: 'rgba(255,107,107,0.08)',
    alignItems: 'center',
  },
  deleteText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },

  /* Upload */
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
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
});

export default VeggieChallenge;
