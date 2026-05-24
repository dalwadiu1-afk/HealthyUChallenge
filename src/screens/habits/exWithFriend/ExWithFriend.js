import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
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
import Share from 'react-native-share';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';
import { Header, Wrapper } from '../../../components';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
const user = auth().currentUser;
const USER_ID = user?.uid;
const getMonthKey = () => {
  const date = new Date();

  const month = date.toLocaleString('default', {
    month: 'long',
  });

  const year = date.getFullYear();

  return `${month}_${year}`;
};

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

const CAPTIONS = (friend, timestamp) => [
  `💪 Workout with ${friend}!\n⏱ ${timestamp}\n🔥 No excuses today!\n\n#WorkoutWithFriend`,
  `🏋️‍♂️ Stronger together with ${friend}!\n⏱ ${timestamp}\n💯 Keep pushing!\n\n#FitnessLife`,
  `👊 ${friend} and I showed up!\n⏱ ${timestamp}\n🚀 Progress!\n\n#NoDaysOff`,
];

export default function FriendWorkoutChallenge({ navigation }) {
  const TOTAL_WEEKS = 4;
  const WORKOUTS_PER_WEEK = 4;
  const [startDate, setStartDate] = useState(null);
  const [weekError, setWeekError] = useState({});
  const [weeks, setWeeks] = useState(
    Array.from({ length: TOTAL_WEEKS }, (_, i) => ({
      week: i + 1,
      completed: false,
      workoutPhotos: [],
    })),
  );

  useEffect(() => {
    if (!USER_ID) return;

    const monthKey = getMonthKey();

    const ref = database().ref(`users/${USER_ID}`);

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val() || {};

      // ------------------------
      // START DATE
      // ------------------------
      const startDateRaw = data?.goal?.startDate;
      if (startDateRaw) {
        setStartDate(moment(startDateRaw));
      }

      // ------------------------
      // WEEKS DATA
      // ------------------------
      const weeksData = data?.habits?.exWithFriend?.[monthKey]?.weeks || {};

      const formattedWeeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => {
        const weekData = weeksData[`week${i + 1}`] || {};

        return {
          week: i + 1,
          completed: weekData.completed || false,
          workoutPhotos: weekData.workoutPhotos || [],
        };
      });

      setWeeks(formattedWeeks);
    });

    return () => ref.off('value', listener);
  }, []);

  const handleCamera = async weekNumber => {
    const week = weeks.find(w => w.week === weekNumber);

    if (!week) return;

    const weekIndex = week.week - 1;

    if (weekIndex !== currentWeekIndex) {
      setWeekError(prev => ({
        ...prev,
        [week.week]: '🔒 Only current week is accessible',
      }));

      return;
    }

    if (week.workoutPhotos.length >= WORKOUTS_PER_WEEK) {
      setWeekError(prev => ({
        ...prev,
        [week.week]: '✅ Week already completed',
      }));

      return;
    }

    setWeekError(prev => ({
      ...prev,
      [week.week]: '',
    }));

    const granted = await requestCameraPermission();

    if (!granted) return;

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.7,
      },
      async response => {
        if (response.didCancel || response.errorCode) return;

        const uri = response?.assets?.[0]?.uri;

        if (!uri) return;

        const newWorkout = {
          uri,
          friend: '',
          timestamp: moment().toISOString(),
        };

        const updatedPhotos = [...week.workoutPhotos, newWorkout];

        const updatedWeek = {
          ...week,
          workoutPhotos: updatedPhotos,
          completed: updatedPhotos.length === WORKOUTS_PER_WEEK,
        };

        const updatedWeeks = weeks.map(w =>
          w.week === week.week ? updatedWeek : w,
        );

        setWeeks(updatedWeeks);

        await saveWeek(week.week, updatedWeek);
      },
    );
  };

  const getCurrentWeekIndex = () => {
    if (!startDate) return 0;

    const now = moment();

    const diffWeeks = now.diff(startDate, 'weeks');

    return Math.min(diffWeeks, TOTAL_WEEKS - 1);
  };

  const updateFriendName = async (weekNumber, photoIndex, name) => {
    const updatedWeeks = weeks.map(week => {
      if (week.week !== weekNumber) return week;

      return {
        ...week,
        workoutPhotos: week.workoutPhotos.map((photo, index) => {
          if (index !== photoIndex) return photo;

          return {
            ...photo,
            friend: name,
          };
        }),
      };
    });

    setWeeks(updatedWeeks);

    const updatedWeek = updatedWeeks.find(w => w.week === weekNumber);

    await saveWeek(weekNumber, updatedWeek);
  };

  const saveWeek = async (weekNumber, weekData) => {
    try {
      const monthKey = getMonthKey();

      await database()
        .ref(
          `users/${USER_ID}/habits/exWithFriend/${monthKey}/weeks/week${weekNumber}`,
        )
        .update({
          completed: weekData.completed,
          updatedAt: database.ServerValue.TIMESTAMP,
          workoutPhotos: weekData.workoutPhotos,
        });
    } catch (e) {
      console.log('SAVE ERROR:', e);
    }
  };

  const deletePhoto = async (weekNumber, photoIndex) => {
    const updatedWeeks = weeks.map(w => {
      if (w.week !== weekNumber) return w;

      const updatedPhotos = w.workoutPhotos.filter((_, i) => i !== photoIndex);

      return {
        ...w,
        workoutPhotos: updatedPhotos,
        completed: updatedPhotos.length === WORKOUTS_PER_WEEK,
      };
    });

    setWeeks(updatedWeeks);

    const updatedWeek = updatedWeeks.find(w => w.week === weekNumber);
    await saveWeek(weekNumber, updatedWeek);
  };

  const retakePhoto = async (weekNumber, photoIndex) => {
    const granted = await requestCameraPermission();
    if (!granted) return;

    launchCamera({ mediaType: 'photo', quality: 0.7 }, async res => {
      const uri = res?.assets?.[0]?.uri;
      if (!uri) return;

      const updatedWeeks = weeks.map(w => {
        if (w.week !== weekNumber) return w;

        const updatedPhotos = [...w.workoutPhotos];
        updatedPhotos[photoIndex].uri = uri;

        return { ...w, workoutPhotos: updatedPhotos };
      });

      setWeeks(updatedWeeks);

      const updatedWeek = updatedWeeks.find(w => w.week === weekNumber);
      await saveWeek(weekNumber, updatedWeek);
    });
  };

  const handleShare = async photoItem => {
    if (!photoItem?.uri) {
      Alert.alert('Please take a photo first 📸');
      return;
    }

    if (!photoItem?.friend?.trim()) {
      Alert.alert("Enter friend's name 👤");
      return;
    }

    const caps = CAPTIONS(photoItem.friend, photoItem.timestamp);

    const message = caps[Math.floor(Math.random() * caps.length)];

    try {
      let imagePath = photoItem.uri;

      if (Platform.OS === 'android' && !imagePath.startsWith('file://')) {
        imagePath = 'file://' + imagePath;
      }

      await Share.open({
        message,
        url: imagePath,
        type: 'image/jpeg',
      });
    } catch (e) {
      console.log(e);
    }
  };
  const completedWeeks = weeks.filter(w => w.completed).length;
  const activeWeekIndex = weeks.findIndex(
    w => w.workoutPhotos.length < WORKOUTS_PER_WEEK,
  );

  const activeWeek = activeWeekIndex === -1 ? null : weeks[activeWeekIndex];
  const currentWeekIndex = getCurrentWeekIndex();

  const isWeekMissed = weekIndex => {
    if (!startDate) return false;

    const now = moment();

    const weekEnd = moment(startDate).add(weekIndex + 1, 'weeks');

    return (
      now.isAfter(weekEnd) &&
      weeks[weekIndex]?.workoutPhotos?.length < WORKOUTS_PER_WEEK
    );
  };

  return (
    <View style={styles.root}>
      <Header
        header={'Workout with Friend'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />
      <Text style={styles.heroTitle}>💪 Friend Workout Challenge</Text>
      <Text style={styles.heroSub}>
        Complete 4 workouts with a friend, take a photo & share each session
      </Text>

      {/* Progress dots */}
      <View style={styles.progressDots}>
        {weeks.map((week, i) => {
          const done = week.completed;

          return (
            <View key={i} style={[styles.dot, done && styles.dotDone]}>
              {done ? (
                <Text style={styles.dotCheck}>✓</Text>
              ) : (
                <Text style={styles.dotNum}>{i + 1}</Text>
              )}
            </View>
          );
        })}
        <Text style={styles.progressLabel}>{completedWeeks}/4 weeks done</Text>
      </View>
      <Wrapper isForgot safeAreaPops={{ edges: ['bottom'] }}>
        {weeks.map((weekItem, weekIndex) => {
          const missed = isWeekMissed(weekIndex);

          const isLocked = weekIndex > currentWeekIndex || missed;

          const isEditableWeek = weekIndex === currentWeekIndex && !missed;
          return (
            <View
              key={weekIndex}
              style={[styles.card, weekItem.completed && styles.cardDone]}
            >
              {isLocked && (
                <View style={styles.lockOverlay}>
                  <Text style={styles.lockText}>🔒 Future Week</Text>
                </View>
              )}
              {missed && (
                <Text style={styles.weekErrorText}>
                  ❌ You missed this week
                </Text>
              )}
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Week {weekItem.week}</Text>

                <Text style={styles.progressLabel}>
                  {weekItem.workoutPhotos.length}/4 workouts
                </Text>
              </View>

              {weekItem.completed && (
                <Text style={styles.donePillText}>✅ Week Completed</Text>
              )}

              {isLocked && (
                <Text style={styles.hint}>🔒 Complete previous week first</Text>
              )}

              {weekItem.workoutPhotos.map((photoItem, photoIndex) => (
                <View key={photoIndex} style={styles.workoutCard}>
                  {/* IMAGE SECTION */}
                  <View style={styles.imageWrap}>
                    <Image
                      source={{ uri: photoItem.uri }}
                      style={styles.photo}
                    />

                    <View style={styles.imageOverlay}>
                      <Text style={styles.workoutLabel}>
                        Workout #{photoIndex + 1}
                      </Text>

                      <View style={styles.timeBadge}>
                        <Text style={styles.timeBadgeText}>
                          {isEditableWeek ? '🟢 Active' : '🔒 Locked'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* INPUT SECTION */}
                  <View style={styles.friendInputWrap}>
                    <Text style={styles.inputLabel}>Workout Partner</Text>

                    <TextInput
                      placeholder="Enter friend's name"
                      value={photoItem.friend}
                      editable={isEditableWeek}
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      style={[
                        styles.friendInputEnhanced,
                        !isEditableWeek && { opacity: 0.5 },
                      ]}
                      onChangeText={text =>
                        updateFriendName(weekItem.week, photoIndex, text)
                      }
                    />
                  </View>

                  {/* ACTION BUTTONS */}
                  {isEditableWeek && (
                    <View style={styles.actionRow}>
                      {/* RETAKE */}
                      <TouchableOpacity
                        style={[
                          styles.smallBtn,
                          { backgroundColor: '#2a2a2a' },
                        ]}
                        onPress={() => retakePhoto(weekItem.week, photoIndex)}
                      >
                        <Text style={styles.smallBtnText}>🔄 Retake</Text>
                      </TouchableOpacity>

                      {/* DELETE */}
                      <TouchableOpacity
                        style={[
                          styles.smallBtn,
                          { backgroundColor: '#3a1f1f' },
                        ]}
                        onPress={() => deletePhoto(weekItem.week, photoIndex)}
                      >
                        <Text style={styles.smallBtnText}>🗑 Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* SHARE BUTTON */}
                  <TouchableOpacity
                    style={[
                      styles.shareWorkoutBtn,
                      !photoItem.friend && { opacity: 0.4 },
                    ]}
                    disabled={!photoItem.friend || !isEditableWeek}
                    onPress={() => handleShare(photoItem)}
                  >
                    <GradientBg
                      id={`share${weekIndex}${photoIndex}`}
                      c1="#4f8cff"
                      c2="#2457d6"
                      r={16}
                    />

                    <Text style={styles.shareWorkoutText}>Share Workout</Text>
                  </TouchableOpacity>

                  {/* TIMESTAMP */}
                  <Text style={styles.timestampText}>
                    {moment(photoItem.timestamp).format('MMM D, YYYY • h:mm A')}
                  </Text>

                  {weekError?.[weekItem?.week] ? (
                    <Text style={styles.weekErrorText}>
                      {weekError[weekItem?.week]}
                    </Text>
                  ) : null}
                </View>
              ))}

              {!isLocked && weekItem.workoutPhotos.length < 4 && (
                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={() => handleCamera(weekItem.week)}
                >
                  <Text style={styles.shareText}>Add Workout</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Submit button */}
        {/* <TouchableOpacity
          style={[
            styles.submitBtn,
            completedWeeks < 4 && styles.submitBtnDisabled,
          ]}
          activeOpacity={completedWeeks < 4 ? 1 : 0.85}
        >
          <Text style={styles.submitText}>
            {completedWeeks < 4
              ? `Complete ${4 - completedWeeks} more workout${
                  4 - completedWeeks > 1 ? 's' : ''
                }`
              : '🎉 Submit Challenge'}
          </Text>
        </TouchableOpacity> */}
      </Wrapper>
    </View>
  );
}

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
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fontFamily.montserratBold,
    paddingHorizontal: 18,
    marginBottom: 4,
    includeFontPadding: false,
  },
  heroSub: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    paddingHorizontal: 18,
    marginBottom: 16,
    lineHeight: 20,
  },
  workoutCard: {
    marginBottom: 22,
    borderRadius: 20,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  weekErrorText: {
    marginTop: 10,
    color: '#ef4444',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: fontFamily.montserratMedium,
  },
  imageWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
  },
  smallBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  smallBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  workoutLabel: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },

  timeBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
  },

  timeBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: fontFamily.montserratMedium,
  },

  friendInputWrap: {
    marginBottom: 14,
  },

  inputLabel: {
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },

  friendInputEnhanced: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    color: colors.white,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    fontFamily: fontFamily.montserratMedium,
    fontSize: 14,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  shareWorkoutBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shareWorkoutText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },

  timestampWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  timestampText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontFamily: fontFamily.montserratMedium,
  },
  /* Progress dots */
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 10,
    gap: 8,
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotDone: { backgroundColor: colors.primary, borderColor: colors.secondary },
  dotNum: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
  dotCheck: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.montserratBold,
  },
  progressLabel: {
    color: colors.grey,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    marginLeft: 4,
  },

  scroll: { padding: 18, paddingTop: 16, paddingBottom: 48 },

  /* Workout cards */
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardDone: { borderColor: 'rgba(143,175,120,0.3)' },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  numBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
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
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: fontFamily.montserratBold,
  },
  cardTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
  donePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 49,
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.35)',
  },
  donePillText: {
    color: '#60a5fa',
    fontSize: 11,
    fontFamily: fontFamily.montserratSemiBold,
  },

  /* Photo */
  photoBox: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.2)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 10,
  },
  photoBoxFilled: {
    borderStyle: 'solid',
    borderColor: 'rgba(143,175,120,0.3)',
  },
  photo: { width: '100%', height: 160, borderRadius: 14 },
  photoPlaceholder: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(143,175,120,0.04)',
  },
  photoPlaceholderText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },

  timestamp: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 12,
  },

  /* Friend input */
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  friendInput: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
  },

  /* Share button */
  shareBtn: {
    height: 48,
    borderRadius: 49,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shareText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },

  hint: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    textAlign: 'center',
  },

  /* Submit */
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 49,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(77,102,68,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    zIndex: 10,
  },

  lockText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
  },
  submitText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },
});
