import React, { useState, useRef, useEffect } from 'react';
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

import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { launchCamera } from 'react-native-image-picker';
import { requestCameraPermission } from '../../../utils/helper';
import moment from 'moment';

const DEFAULT_WEEKLY_TARGET = 2;

const USER_ID = auth().currentUser?.uid;

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

export default function WeightTrainingUI({ route }) {
  const [weeklyTarget, setWeeklyTarget] = useState(DEFAULT_WEEKLY_TARGET);
  const CURRENT_MONTH_KEY = route?.params?.monthKey
    ? route.params.monthKey
    : moment().format('MMMM_YYYY');

  const selectedMonth = moment(CURRENT_MONTH_KEY, 'MMMM_YYYY');

  const isPastMonth = selectedMonth.isBefore(moment(), 'month');

  let TOTAL_WEEKS = Number(route?.params?.archivedGoal?.weeks) || 4;
  const TOTAL = weeklyTarget * 4;
  const [sessions, setSessions] = useState(
    Array.from({ length: TOTAL }, () => ({
      photo: null,
      timestamp: null,
    })),
  );
  const [startDate, setStartDate] = useState(null);
  const tempPhotos = useRef({});
  const headerAnim = useRef(new Animated.Value(0)).current;

  /* =========================================
      FETCH USER START DATE
  ========================================= */
  useEffect(() => {
    const ref = database().ref(`users/${USER_ID}/goal/startDate`);

    const listener = ref.on('value', snapshot => {
      const value = snapshot.val();

      if (value) {
        setStartDate(value);
      }
    });

    return () => ref.off('value', listener);
  }, []);

  /* =========================================
    FETCH GOAL TARGET FROM FIREBASE
  ========================================= */
  useEffect(() => {
    const ref = database().ref(`users/${USER_ID}/goal/selectedGoals`);

    const listener = ref.on('value', snapshot => {
      const goals = snapshot.val() || [];

      const weightTrainingGoal = Array.isArray(goals)
        ? goals.find(item => item?.key === 'weightTraining')
        : Object.values(goals).find(item => item?.key === 'weightTraining');

      const target =
        Number(weightTrainingGoal?.goalText) || DEFAULT_WEEKLY_TARGET;

      setWeeklyTarget(target);
    });

    return () => ref.off('value', listener);
  }, [weeklyTarget, CURRENT_MONTH_KEY]);

  /* =========================================
      WEEK UNLOCK LOGIC
      Week 1 => Day 0-6
      Week 2 => Day 7-13
      Week 3 => Day 14-20
      Week 4 => Day 21-27
  ========================================= */

  let currentUnlockedWeek = 0;

  if (isPastMonth) {
    currentUnlockedWeek = TOTAL_WEEKS - 1;
  } else if (startDate) {
    const start = moment(startDate).startOf('day');
    const now = moment().startOf('day');

    const diffDays = now.diff(start, 'days');

    currentUnlockedWeek = Math.floor(diffDays / 7);

    if (currentUnlockedWeek < 0) {
      currentUnlockedWeek = 0;
    }

    if (currentUnlockedWeek > TOTAL_WEEKS - 1) {
      currentUnlockedWeek = TOTAL_WEEKS - 1;
    }
  }

  /* =========================================
      FETCH SAVED WORKOUTS
  ========================================= */
  useEffect(() => {
    const ref = database().ref(
      `users/${USER_ID}/habits/weightTraining/${CURRENT_MONTH_KEY}`,
    );

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();

      const restored = [];

      for (let week = 1; week <= TOTAL_WEEKS; week++) {
        const weekData = data?.weeks?.[`week${week}`];

        const photosObj = weekData?.workoutPhotos || {};

        const photosArray = Array.isArray(photosObj)
          ? photosObj
          : Object.values(photosObj);

        for (let i = 0; i < weeklyTarget; i++) {
          restored.push({
            photo: photosArray?.[i]?.imageUrl || null,
            timestamp: photosArray?.[i]?.timestamp || null,
          });
        }
      }

      setSessions(restored);
    });

    return () => ref.off('value', listener);
  }, [weeklyTarget, CURRENT_MONTH_KEY]);

  /* =========================================
      HEADER ANIMATION
  ========================================= */
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  /* =========================================
      STATS
  ========================================= */
  const done = sessions.filter(s => s?.photo).length;

  const weeksCompleted = Math.floor(done / weeklyTarget);

  /* =========================================
      UPLOAD PHOTO
  ========================================= */
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
      timestamp: moment().toISOString(),
    };

    tempPhotos.current[index] = photoData;

    setSessions(prev => {
      const updated = [...prev];
      updated[index] = photoData;
      return updated;
    });
  };

  /* =========================================
      SAVE TO FIREBASE
  ========================================= */
  const handleDone = async index => {
    if (isPastMonth) return;

    try {
      const photoData = tempPhotos.current[index];

      if (!photoData) return;

      const weekNumber = Math.floor(index / weeklyTarget) + 1;

      const positionInsideWeek = index % weeklyTarget;

      // STORAGE PATH
      const storagePath = `weightTraining/${USER_ID}/${CURRENT_MONTH_KEY}/week${weekNumber}/${positionInsideWeek}.jpg`;
      const reference = storage().ref(storagePath);

      // Upload local image
      await reference.putFile(photoData.photo);

      // Download URL
      const downloadURL = await reference.getDownloadURL();

      // Database Path
      const ref = database().ref(
        `users/${USER_ID}/habits/weightTraining/${CURRENT_MONTH_KEY}/weeks/week${weekNumber}`,
      );

      const snapshot = await ref.once('value');

      const data = snapshot.val() || {};

      let workoutPhotos = Array.isArray(data?.workoutPhotos)
        ? data.workoutPhotos
        : Object.values(data?.workoutPhotos || {});

      console.log('downloadURL :>> ', downloadURL);
      workoutPhotos[positionInsideWeek] = {
        imageUrl: downloadURL,
        storagePath,
        timestamp: photoData.timestamp,
        uploadedAt: Date.now(),
      };

      const totalCompleted = workoutPhotos.filter(Boolean).length;

      await ref.update({
        completed: totalCompleted >= weeklyTarget,
        totalCompleted,
        updatedAt: database.ServerValue.TIMESTAMP,
        workoutPhotos,
      });

      delete tempPhotos.current[index];

      console.log('Upload Success');
    } catch (e) {
      console.log('UPLOAD ERROR:', e);
    }
  };

  /* =========================================
      CARD COMPONENT
  ========================================= */
  function WorkoutCard({ index, photo, timestamp }) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 380,
        delay: index * 70,
        useNativeDriver: true,
      }).start();
    }, []);

    const done = !!photo;

    const weekNum = Math.floor(index / weeklyTarget) + 1;

    const sessionNum = (index % weeklyTarget) + 1;

    const isLocked = isPastMonth ? false : weekNum - 1 !== currentUnlockedWeek;

    // Week is already over and user didn't upload
    const isMissed =
      !done && (isPastMonth || weekNum - 1 < currentUnlockedWeek);

    console.log({
      weekNum,
      currentUnlockedWeek,
      done,
      isMissed,
      isLocked,
    });
    return (
      <Animated.View
        style={{
          opacity: isLocked ? 0.5 : anim,
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
        <View
          style={[
            styles.card,
            done && styles.cardDone,
            isMissed && styles.cardMissed,
          ]}
        >
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
                {isMissed
                  ? 'Missed ❌'
                  : isLocked
                  ? 'Locked 🔒'
                  : done
                  ? 'Completed ✓'
                  : 'Tap to upload proof'}
              </Text>
            </View>

            {done && !isLocked && !isPastMonth && (
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
              if (!isLocked && !isPastMonth && !isMissed) {
                handleUpload(index);
              }
            }}
            activeOpacity={0.8}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={styles.uploadImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <CameraIcon />

                <Text style={styles.uploadText}>+ Upload Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {done && timestamp && (
            <Text style={styles.timestamp}>
              Uploaded {moment(timestamp).format('MMM D, YYYY • h:mm A')}
            </Text>
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
            Complete at least {weeklyTarget} workouts per week and upload your
            proof
          </Text>

          <View style={styles.statsStrip}>
            {[
              {
                label: 'Sessions Done',
                value: `${done}`,
              },
              {
                label: 'Weeks Complete',
                value: `${weeksCompleted}`,
              },
              {
                label: 'Target / Week',
                value: `${weeklyTarget}`,
              },
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
                  {
                    width: `${(done / TOTAL) * 100}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.weekMarkers}>
              {Array.from({
                length: TOTAL_WEEKS,
              }).map((_, i) => {
                const unlocked = isPastMonth ? true : i <= currentUnlockedWeek;

                return (
                  <View
                    key={i}
                    style={[styles.weekChip, unlocked && styles.weekChipDone]}
                  >
                    <Text
                      style={[
                        styles.weekChipText,
                        unlocked && styles.weekChipTextDone,
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
          />
        ))}
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 6,
  },

  heroSub: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 20,
    lineHeight: 20,
  },

  statsStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
    overflow: 'hidden',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },

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

  weekMarkers: {
    flexDirection: 'row',
    gap: 6,
  },

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

  weekChipTextDone: {
    color: colors.secondary,
  },
  cardMissed: {
    borderColor: 'rgba(255, 80, 80, 0.4)',
    backgroundColor: 'rgba(255, 80, 80, 0.08)',
  },

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

  cardHeaderText: {
    flex: 1,
  },

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

  uploadBoxDone: {
    borderStyle: 'solid',
    borderColor: 'rgba(143,175,120,0.3)',
  },

  uploadPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },

  uploadText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },

  uploadImage: {
    width: '100%',
    height: '100%',
  },

  timestamp: {
    marginTop: 8,
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: fontFamily.montserratRegular,
  },
});
