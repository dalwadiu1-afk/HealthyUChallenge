import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';
import { Header, Wrapper } from '../../../components';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import firestore, { FieldValue } from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { launchCamera } from 'react-native-image-picker';
import { requestCameraPermission } from '../../../utils/helper';

const TOTAL = 8;
const WEEKLY_TARGET = 2;
const USER_ID = auth().currentUser?.uid;

const getLocalDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
};

const emptySessions = () =>
  Array.from({ length: TOTAL }, () => ({
    photo: null,
    timestamp: null,
  }));

function CameraIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
        stroke="rgba(143,175,120,0.6)"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx={12}
        cy={13}
        r={4}
        stroke="rgba(143,175,120,0.6)"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke="#fff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function WeightTrainingUI({ navigation, route }) {
  const [workoutData, setWorkoutData] = useState({});
  const [sessions, setSessions] = useState(
    Array.from({ length: TOTAL }, () => ({ photo: null, timestamp: null })),
  );

  const tempPhotos = useRef({});

  const headerAnim = useRef(new Animated.Value(0)).current;

  const today = getLocalDateKey();

  let weeksPassed = 0;

  if (workoutData?.goal?.startDate) {
    const startDate = new Date(workoutData.goal.startDate);
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    weeksPassed = Math.max(0, Math.floor(diffDays / 7));
  }

  const isFocused = useIsFocused();
  const unsubscribeRef = useRef(null);
  const firstLoadRef = useRef(true);

  const todayRef = useRef(new Date().toISOString().split('T')[0]).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const today = getLocalDateKey();
    const ref = database().ref(`users/${USER_ID}/logs/${today}`);

    const onValueChange = ref.on('value', snapshot => {
      const data = snapshot.val();

      const rawPhotos = data?.workoutPhotos || [];

      const normalized = Array.from({ length: TOTAL }, (_, i) => ({
        photo: rawPhotos?.[i]?.photo || null,
        timestamp: rawPhotos?.[i]?.timestamp || null,
      }));

      setSessions(normalized);
    });

    return () => ref.off('value', onValueChange);
  }, []);

  /* =========================
     SAFE STATS (NO CRASHES)
  ========================= */
  const done = sessions.filter(s => s?.photo).length;
  const weeksCompleted = Math.floor(done / WEEKLY_TARGET);
  const totalWeeks = TOTAL / WEEKLY_TARGET;

  const getWeeklyProgress = (list = []) => {
    const weeks = Array.from({ length: totalWeeks }, () => 0);

    list.forEach((s, index) => {
      if (!s?.photo) return;

      const weekIndex = Math.floor(index / WEEKLY_TARGET);
      if (weekIndex < totalWeeks) {
        weeks[weekIndex] += 1;
      }
    });

    return weeks.map((done, i) => ({
      week: i + 1,
      done,
    }));
  };
  /* =========================
     SAVE STATS (OPTIMIZED)
  ========================= */
  const saveWorkoutStats = async stats => {
    try {
      await database()
        .ref(`users/${USER_ID}/activities/workout`)
        .update({
          ...stats,
          updatedAt: database.ServerValue.TIMESTAMP,
        });
    } catch (e) {
      console.log('stats save error:', e);
    }
  };

  useEffect(() => {
    saveWorkoutStats({
      sessionsDone: done,
      weeksCompleted,
      weeklyProgress: getWeeklyProgress(sessions),
    });
  }, [sessions]);

  /* 📸 PICK IMAGE */
  const handleUpload = async index => {
    const granted = await requestCameraPermission();
    if (!granted) return;

    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.7,
      saveToPhotos: true,
    });

    if (result.didCancel) return;

    const uri = result?.assets?.[0]?.uri;
    if (!uri) return;

    const photoData = {
      photo: uri,
      timestamp: new Date().toISOString(),
    };

    tempPhotos.current[index] = photoData;

    setSessions(prev => {
      const updated = [...prev];
      updated[index] = photoData;
      return updated;
    });
  };

  /* 🔥 SAVE SESSION */
  const handleDone = async index => {
    try {
      const photoData = tempPhotos.current[index];
      if (!photoData) return;

      const today = getLocalDateKey();
      const ref = database().ref(`users/${USER_ID}/logs/${today}`);

      const snapshot = await ref.once('value');
      const data = snapshot.val() || {};

      // ALWAYS normalize to array
      let workoutPhotos = data?.workoutPhotos || [];

      if (!Array.isArray(workoutPhotos)) {
        workoutPhotos = Object.values(workoutPhotos || {});
      }

      workoutPhotos = Array(TOTAL)
        .fill(null)
        .map((_, i) => workoutPhotos[i] || null);

      workoutPhotos[index] = photoData;
      console.log('photoData :>> ', photoData);
      await ref.set({
        ...data,
        workoutWeek: weeksPassed + 1,
        workoutPhotos,
        updatedAt: database.ServerValue.TIMESTAMP,
      });

      setSessions(workoutPhotos);

      delete tempPhotos.current[index];
    } catch (e) {
      console.log('Upload error:', e);
    }
  };

  /* =========================
   UI COMPONENT (UNCHANGED)
========================= */
  function WorkoutCard({ index, photo, timestamp, onUpload, weeksPassed }) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 380,
        delay: index * 70,
        useNativeDriver: true,
      }).start();
    }, []);

    const done = photo;
    const weekNum = Math.floor(index / WEEKLY_TARGET) + 1;
    const sessionNum = (index % WEEKLY_TARGET) + 1;

    const totalWeeks = TOTAL / WEEKLY_TARGET;
    const currentWeek = weeksPassed;
    const startIndex = currentWeek * WEEKLY_TARGET;
    const endIndex = startIndex + WEEKLY_TARGET - 1;

    const isLocked =
      weeksPassed >= totalWeeks ? true : index < startIndex || index > endIndex;

    return (
      <Animated.View
        style={{
          opacity: isLocked ? 0.6 : anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [24, 0],
              }),
            },
          ],
        }}
      >
        <View style={[styles.card, done && styles.cardDone]}>
          <View style={styles.cardHeader}>
            <View style={[styles.numBadge, done && styles.numBadgeDone]}>
              {done ? (
                <CheckIcon />
              ) : (
                <Text style={styles.numText}>{index + 1}</Text>
              )}
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Session #{index + 1}</Text>
              <Text style={styles.cardSub}>
                Week {weekNum} · Session {sessionNum}{' '}
                {isLocked
                  ? 'Locked 🔒'
                  : done
                  ? 'Photo uploaded ✓'
                  : 'Tap to upload proof'}
              </Text>
            </View>

            {done && !isLocked && (
              <TouchableOpacity
                onPress={() => handleDone(index)}
                style={styles.donePill}
              >
                <Text style={styles.donePillText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.uploadBox, done && styles.uploadBoxDone]}
            onPress={() => {
              if (!isLocked) onUpload(index);
            }}
          >
            {photo ? (
              <>
                <Image source={{ uri: photo }} style={styles.uploadImage} />
              </>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <CameraIcon />
                <Text style={styles.uploadText}>+ Upload Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {done && timestamp && (
            <Text style={styles.timestamp}>Uploaded {timestamp}</Text>
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.root}>
      <Header
        header={'Weight Training'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />

      <Wrapper isForgot safeAreaPops={{ edges: ['bottom'] }}>
        <Animated.View style={{ opacity: headerAnim }}>
          <Text style={styles.heroTitle}>🏋️ Weight Training Sessions</Text>
          <Text style={styles.heroSub}>
            Complete at least {WEEKLY_TARGET} workouts per week and upload your
            proof
          </Text>

          <View style={styles.statsStrip}>
            {[
              { label: 'Sessions Done', value: `${done}` },
              { label: 'Weeks Complete', value: `${weeksCompleted}` },
              { label: 'Target / Week', value: `${WEEKLY_TARGET}` },
            ].map((s, i) => (
              <View
                key={i}
                style={[styles.statItem, i < 2 && styles.statBorder]}
              >
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Overall progress</Text>
              <Text style={styles.progressCount}>
                {done} / {TOTAL}
              </Text>
            </View>

            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(done / TOTAL) * 100}%` },
                ]}
              />
            </View>

            <View style={styles.weekMarkers}>
              {Array.from({ length: totalWeeks }).map((_, i) => {
                const weekDone = i < Math.min(weeksPassed, totalWeeks);

                return (
                  <View
                    key={i}
                    style={[styles.weekChip, weekDone && styles.weekChipDone]}
                  >
                    <Text
                      style={[
                        styles.weekChipText,
                        weekDone && styles.weekChipTextDone,
                      ]}
                    >
                      W{i + 1}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {sessions.map((s, index) => (
          <WorkoutCard
            key={index}
            index={index}
            photo={s?.photo}
            timestamp={s?.timestamp}
            onUpload={handleUpload}
            weeksPassed={weeksPassed}
          />
        ))}
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

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
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
    lineHeight: 22,
  },

  scroll: { paddingHorizontal: 18, paddingBottom: 48 },

  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 6,
    includeFontPadding: false,
  },
  heroSub: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 20,
    lineHeight: 20,
  },

  /* Stats strip */
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
    overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 2,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontFamily: fontFamily.montserratMedium,
  },

  /* Progress */
  progressCard: {
    backgroundColor: colors.bubbleDark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    padding: 16,
    marginBottom: 22,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },
  progressCount: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
  progressBg: {
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 6,
  },
  weekMarkers: { flexDirection: 'row', gap: 6 },
  weekChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  weekChipDone: {
    borderColor: 'rgba(143,175,120,0.4)',
    backgroundColor: 'rgba(104, 250, 0, 0.12)',
  },
  weekChipText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },
  weekChipTextDone: { color: colors.secondary },

  /* Card */
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 12,
  },
  cardDone: {
    borderColor: 'rgba(143,175,120,0.3)',
    backgroundColor: 'rgba(143,175,120,0.06)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  numBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numBadgeDone: {
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
  },
  numText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },
  cardHeaderText: { flex: 1 },
  cardTitle: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 2,
  },
  cardSub: {
    color: colors.grey,
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },
  donePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 49,
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
  },
  donePillText: {
    color: colors.secondary,
    fontSize: 11,
    fontFamily: fontFamily.montserratSemiBold,
  },

  uploadBox: {
    height: 130,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  uploadBoxDone: { borderStyle: 'solid', borderColor: 'rgba(143,175,120,0.3)' },
  uploadPlaceholder: { alignItems: 'center', gap: 8 },
  uploadText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  uploadImage: { width: '100%', height: '100%' },
  uploadOverlay: { position: 'absolute', bottom: 8, right: 8 },
  retakeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 49,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  retakeText: {
    color: colors.white,
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },
  timestamp: {
    marginTop: 8,
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: fontFamily.montserratRegular,
  },

  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: 49,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },
});
