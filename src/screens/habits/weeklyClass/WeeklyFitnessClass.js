import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';
import { Header, Wrapper } from '../../../components';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { launchCamera } from 'react-native-image-picker';
import moment from 'moment';
import { requestCameraPermission } from '../../../utils/helper';
import storage from '@react-native-firebase/storage';

const USER_ID = auth().currentUser?.uid;

const DAY_MS = 24 * 60 * 60 * 1000;
const { height } = Dimensions.get('window');

/* ICONS unchanged */
function CameraIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
        stroke="rgba(143,175,120,0.6)"
        strokeWidth={1.8}
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
      />
    </Svg>
  );
}

function MissedIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18"
        stroke="#FF6B6B"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path
        d="M6 6L18 18"
        stroke="#FF6B6B"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function FitnessClassUI({ route }) {
  const today = moment();

  const CURRENT_MONTH_KEY = route?.params?.monthKey
    ? route?.params?.monthKey
    : today.format('MMMM_YYYY');

  const MONTH_KEY = CURRENT_MONTH_KEY;
  const PATH = `users/${USER_ID}/habits/fitness/${MONTH_KEY}`;
  const getWeekRef = weekKey => database().ref(`${PATH}/weeks/${weekKey}`);

  const [TOTAL, SetTOTAL] = useState(4);
  const [goal, setGoal] = useState(4);

  const [weekData, setWeekData] = useState([]);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [photos, setPhotos] = useState(Array(TOTAL).fill(null));

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    setWeekData([]);
  }, [MONTH_KEY]);

  /* =========================
     FIREBASE LIVE LISTENER
  ========================== */
  useEffect(() => {
    const rootRef = database().ref(
      `users/${USER_ID}/habits/fitness/${MONTH_KEY}`,
    );

    const listener = rootRef.on('value', snapshot => {
      const rootData = snapshot.val() || {};

      SetTOTAL(Number(rootData.goal || 4));

      const weeks = rootData.weeks || {};

      const weekArray = Object.keys(weeks)
        .sort((a, b) => {
          const n1 = parseInt(a.replace('week', ''));
          const n2 = parseInt(b.replace('week', ''));
          return n1 - n2;
        })
        .map(key => {
          const w = weeks[key];

          const isCompleted = w?.completed === true;

          return {
            weekKey: key,
            ...w,
            status: isCompleted ? 'completed' : 'in-progress',
          };
        });

      setWeekData(weekArray);
    });

    return () => rootRef.off('value', listener);
  }, []);

  /* =========================
     CURRENT WEEK LOGIC FIX
  ========================== */
  const getCurrentWeekKey = (monthKey = CURRENT_MONTH_KEY) => {
    const now = moment(monthKey, 'MMMM_YYYY');
    const todayDate = moment().date();

    return `week${Math.ceil(todayDate / 7)}`;
  };

  const currentWeek = getCurrentWeekKey();
  const getWeekData = weekKey =>
    weekData.find(w => w.weekKey === weekKey) || null;

  const currentWeekData = getWeekData(currentWeek);

  /* =========================
     LOCK LOGIC FIXED
  ========================== */
  const isWeekLocked = weekKey => {
    return weekKey !== currentWeek;
  };

  const completedWeeks = weekData.filter(
    w => Object.keys(w?.workoutPhotos || {}).length > 0,
  ).length;

  const progress = completedWeeks / 4;

  /* =========================
     REMAINING TIME FIX
  ========================== */
  const getRemainingTime = () => {
    if (!currentWeekData?.expiresAt) return '24h remaining';

    const diff = currentWeekData.expiresAt - moment().valueOf();
    if (diff <= 0) return 'Expired';

    const duration = moment.duration(diff);

    return `${Math.floor(
      duration.asHours(),
    )}h ${duration.minutes()}m remaining`;
  };

  /* =========================
     UPLOAD (ONLY CURRENT WEEK)
  ========================== */
  const handleUpload = async (index, weekKey) => {
    try {
      // ❌ BLOCK OLD WEEKS
      if (weekKey !== currentWeek) {
        Alert.alert('Locked', 'Past weeks cannot be edited');
        return;
      }

      const ref = getWeekRef(weekKey);
      const snap = await ref.once('value');
      const data = snap.val() || {};

      const granted = await requestCameraPermission();
      if (!granted) return;

      launchCamera({ mediaType: 'photo' }, async res => {
        const uri = res.assets?.[0]?.uri;
        if (!uri) return;

        const now = moment().valueOf();

        const storagePath = `fitness/${USER_ID}/${MONTH_KEY}/${weekKey}/${index}.jpg`;
        const storageRef = storage().ref(storagePath);

        await storageRef.putFile(uri);
        const url = await storageRef.getDownloadURL();

        const existing = data.workoutPhotos || {};

        const updatedPhotos = {
          ...existing,
          [`day${index + 1}`]: {
            imageUrl: url,
            uploadedAt: now,
          },
        };

        const totalPhotos = Object.keys(updatedPhotos).length;

        await ref.update({
          workoutPhotos: updatedPhotos,
          totalPhotos,
          completed: totalPhotos >= 1,
          firstCompletionTime:
            data.firstCompletionTime || (totalPhotos >= 1 ? now : null),
          startedAt: data.startedAt || now,
          updatedAt: now,
        });
      });
    } catch (e) {
      console.log(e);
    }
  };

  /* =========================
     WORKOUT CARD FIX
  ========================== */
  const WorkoutCard = ({ index, weekKey, monthKey }) => {
    const anim = useRef(new Animated.Value(0)).current;
    console.log('moment().format() :>> ', monthKey);
    useEffect(() => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, []);

    const week = getWeekData(weekKey);

    const photos = week?.workoutPhotos || {};
    const photo = photos[`day${index + 1}`]?.imageUrl;

    const isCompleted = !!photo;

    const isCurrentWeek = weekKey === currentWeek;

    const isCurrentMonth = monthKey === CURRENT_MONTH_KEY;
    // 🔥 FINAL TRUTH LOGIC
    const isMissed = !isCurrentMonth && !photo;

    const locked = !isCurrentWeek || !isCurrentMonth;

    return (
      <Animated.View style={{ opacity: anim }}>
        <View
          style={[
            styles.card,
            isMissed && {
              borderColor: '#FF6B6B',
              backgroundColor: 'rgba(255,107,107,0.05)',
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.numBadge,
                isCompleted && styles.completedBadge,
                isMissed && styles.missedBadge,
              ]}
            >
              {isCompleted ? (
                <CheckIcon />
              ) : isMissed ? (
                <MissedIcon />
              ) : (
                <Text style={styles.numText}>{index + 1}</Text>
              )}
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Workout #{index + 1}</Text>
            </View>
          </View>

          <TouchableOpacity
            disabled={locked || !!photo}
            style={styles.uploadBox}
            onPress={() => handleUpload(index, weekKey)}
          >
            {photo ? (
              <View style={{ flex: 1, width: '100%' }}>
                <Image source={{ uri: photo }} style={styles.uploadImage} />

                <Text style={styles.timestamp}>
                  {moment(photos[`day${index + 1}`]?.uploadedAt).format(
                    'MMM D, YYYY • h:mm A',
                  )}
                </Text>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <CameraIcon />
                <Text style={styles.uploadText}>
                  {isCompleted
                    ? 'Completed'
                    : isMissed
                    ? 'Missed'
                    : locked
                    ? 'Locked'
                    : '+ Upload Photo'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  /* =========================
     UI MAPPING FIX
  ========================== */
  return (
    <View style={styles.root}>
      <Header
        header="Weekly Classes"
        headerContainer={{ paddingHorizontal: 23 }}
      />
      <Wrapper isForgot safeAreaPops={{ edges: ['bottom'] }}>
        <Animated.View style={{ opacity: headerAnim }}>
          <Text style={styles.heroTitle}>🏋️ Weekly Fitness Class</Text>
          <Text style={styles.heroSub}>
            Upload at least 1 workout photo each week. Additional photos are
            optional.
          </Text>

          <View style={styles.progressCard}>
            <Text style={styles.progressCount}>
              {completedWeeks} / 4 Weeks Completed
            </Text>

            <Text style={styles.statusText}>
              Upload 1 Photo To Complete This Week
            </Text>
          </View>
        </Animated.View>

        {/* =====================
            WEEK HISTORY (FIXED)
        ====================== */}
        {weekData.map((week, i) => (
          <View key={week.weekKey} style={styles.weekCard}>
            <Text style={styles.weekTitle}>
              Week {week.weekKey.replace('week', '')}
            </Text>

            <Text style={styles.weekSub}>
              {Object.keys(week.workoutPhotos || {}).length} Photos Uploaded
            </Text>

            <Text
              style={{
                color: week.completed ? '#4CAF50' : '#FFB84D',
                marginTop: 5,
              }}
            >
              {week.completed ? 'Week Completed ✅' : 'Waiting For First Photo'}
            </Text>

            {/* preview */}
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              {week.workoutPhotos &&
                Object.values(week.workoutPhotos)
                  .slice(0, 3)
                  .map((p, i) => (
                    <Image
                      key={i}
                      source={{ uri: p?.imageUrl }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        marginRight: 6,
                      }}
                    />
                  ))}
            </View>
          </View>
        ))}

        {/* =====================
            CURRENT WEEK CARDS
        ====================== */}
        {/* {Array.from({ length: TOTAL }).map((_, i) => (
          <WorkoutCard
            key={i}
            index={i}
            weekKey={currentWeek}
            monthKey={moment().format('MMMM_YYYY')}
          />
        ))} */}
        {(() => {
          const uploadedCount = Object.keys(
            currentWeekData?.workoutPhotos || {},
          ).length;

          const visibleSlots = Math.min(uploadedCount + 1, 7);

          return (
            <>
              <View style={styles.currentWeekHeader}>
                <Text style={styles.currentWeekTitle}>
                  Week {currentWeek.replace('week', '')} • Current Week
                </Text>

                {uploadedCount > 0 && (
                  <Text style={styles.completedText}>Week Completed ✅</Text>
                )}
              </View>

              {Array.from({ length: visibleSlots }).map((_, i) => (
                <WorkoutCard
                  key={i}
                  index={i}
                  weekKey={currentWeek}
                  monthKey={moment().format('MMMM_YYYY')}
                />
              ))}

              <View style={styles.slotProgress}>
                {Array.from({ length: 7 }).map((_, i) => {
                  const completed = i < uploadedCount;

                  return (
                    <View
                      key={i}
                      style={[
                        styles.slotDot,
                        completed && styles.slotDotCompleted,
                      ]}
                    />
                  );
                })}
              </View>
            </>
          );
        })()}
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  completedBadge: {
    backgroundColor: 'rgba(76,175,80,0.2)',
    borderColor: '#4CAF50',
  },

  missedBadge: {
    backgroundColor: 'rgba(255,107,107,0.15)',
    borderColor: '#FF6B6B',
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 6,
  },

  heroSub: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
    marginBottom: 20,
  },

  progressCard: {
    backgroundColor: colors.bubbleDark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    padding: 16,
    marginBottom: 22,
  },
  weekCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  weekTitle: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },

  weekSub: {
    color: colors.grey,
    fontSize: 12,
    marginTop: 4,
  },

  weekStatus: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
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

  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },

  dot: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  dotFilled: {
    backgroundColor: colors.secondary,
  },

  statusRow: {
    marginTop: 14,
    alignItems: 'center',
  },

  statusText: {
    color: colors.secondary,
    fontFamily: fontFamily.montserratSemiBold,
    fontSize: 12,
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
    fontFamily: fontFamily.montserratMedium,
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

  lockedBox: {
    opacity: 0.5,
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
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 6,
    fontFamily: fontFamily.montserratMedium,
  },

  currentWeekHeader: {
    marginBottom: 15,
  },

  currentWeekTitle: {
    color: colors.white,
    fontSize: 16,
    marginBottom: 4,
    fontFamily: fontFamily.montserratBold,
  },

  completedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },

  slotProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },

  slotDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  slotDotCompleted: {
    backgroundColor: colors.secondary,
  },
});
