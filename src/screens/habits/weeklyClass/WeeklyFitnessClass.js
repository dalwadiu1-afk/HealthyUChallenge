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

const USER_ID = auth().currentUser?.uid;

const MONTH_KEY = moment().format('MMMM_YYYY');
const CURRENT_WEEK = 'week1';

const WEEK_PATH = `users/${USER_ID}/habits/fitness/${MONTH_KEY}/weeks/${CURRENT_WEEK}`;
const PATH = `users/${USER_ID}/habits/fitness/${MONTH_KEY}`;

const DAY_MS = 24 * 60 * 60 * 1000;
const { height } = Dimensions.get('window');
/* ICONS */
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

export default function FitnessClassUI() {
  const [TOTAL, setTOTAL] = useState(4);

  const [weekData, setWeekData] = useState({});
  const [photos, setPhotos] = useState(Array(TOTAL).fill(null));

  const tempPhotos = useRef(Array(TOTAL).fill(null)).current;

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  /* LIVE LISTENER */
  /* LIVE LISTENER */
  useEffect(() => {
    const rootRef = database().ref(PATH);
    const weekRef = database().ref(WEEK_PATH);

    const listener = rootRef.on('value', async snapshot => {
      const rootData = snapshot.val() || {};

      // GET GOAL FROM ROOT
      const firebaseGoal =
        Number(rootData?.goal) ||
        Number(rootData?.total) ||
        parseInt(rootData?.target) ||
        0;

      // MINIMUM 4
      const totalTarget = Math.max(firebaseGoal, 4);

      setTOTAL(totalTarget);

      // NOW GET WEEK DATA
      const weekSnapshot = await weekRef.once('value');

      const weekData = weekSnapshot.val() || {};

      setWeekData(weekData);

      const firebasePhotos = weekData?.workoutPhotos || {};

      const formattedPhotos = Array.from(
        { length: totalTarget },
        (_, i) => firebasePhotos[i] || null,
      );

      setPhotos(formattedPhotos);

      // AUTO LOCK
      if (
        weekData?.expiresAt &&
        moment().valueOf() > weekData.expiresAt &&
        !weekData?.locked
      ) {
        weekRef.update({
          locked: true,
        });
      }
    });

    return () => {
      rootRef.off('value', listener);
    };
  }, []);

  console.log('TOTAL :>> ', TOTAL);

  const isExpired =
    weekData?.expiresAt && moment().valueOf() > weekData?.expiresAt;

  const isLocked = weekData?.locked || isExpired;

  /* 📸 PICK IMAGE */
  const handleUpload = async index => {
    try {
      if (isLocked) {
        Alert.alert('Week Locked', 'This fitness session has expired.');
        return;
      }

      const granted = await requestCameraPermission();
      if (!granted) return;

      return new Promise(async resolve => {
        launchCamera({ mediaType: 'photo', quality: 0.7 }, response => {
          // change save path and camera is not working

          if (response.didCancel) return;

          const uri = response.assets?.[0]?.uri;

          if (!uri) return;

          tempPhotos[index] = uri;

          /* instant UI */
          setPhotos(prev => {
            const updated = [...prev];

            updated[index] = {
              uri,
              caption: `I'm at workout #${index + 1}!`,
              uploadedAt: moment().valueOf(),
            };

            return updated;
          });

          saveWorkout(index, uri);
        });
      });
    } catch (e) {
      console.log(e);
    }
  };

  /* SAVE TO FIREBASE */
  const saveWorkout = async (index, uri) => {
    try {
      const ref = database().ref(WEEK_PATH);

      const snapshot = await ref.once('value');

      const data = snapshot.val() || {};

      const now = moment().valueOf();

      /* LOCK CHECK */
      if (data?.locked) {
        Alert.alert('Locked', 'Week already locked.');
        return;
      }

      /* EXPIRE CHECK */
      if (data?.expiresAt && now > data.expiresAt) {
        await ref.update({
          locked: true,
        });

        Alert.alert('Expired', '24 hour workout window expired.');

        return;
      }

      /* INIT START */
      let startedAt = data?.startedAt || now;

      let expiresAt = data?.expiresAt || startedAt + DAY_MS;

      const existingPhotos = data?.workoutPhotos || {};

      const workoutPhotos = Array.from(
        { length: TOTAL },
        (_, i) => existingPhotos[i] || null,
      );

      workoutPhotos[index] = {
        uri,
        caption: `I'm at workout #${index + 1}!`,
        uploadedAt: now,
      };

      const totalCompleted = workoutPhotos.filter(Boolean).length;

      const completed = totalCompleted === TOTAL;

      await ref.update({
        target: `${TOTAL} workout photos weekly`,

        startedAt,
        expiresAt,

        completed,
        locked: completed,

        totalCompleted,
        updatedAt: now,

        workoutPhotos,
      });

      tempPhotos[index] = null;
    } catch (e) {
      console.log('SAVE ERROR:', e);
    }
  };

  const done = photos.filter(Boolean).length;

  const progress = done / TOTAL;

  const getRemainingTime = () => {
    if (!weekData?.expiresAt) return '24h remaining';

    const diff = weekData.expiresAt - moment().valueOf();

    if (diff <= 0) return 'Expired';

    const duration = moment.duration(diff);

    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    return `${hours}h ${minutes}m remaining`;
  };

  /* CARD */
  const WorkoutCard = ({ index, photo }) => {
    console.log('photo :>> ', photo);
    const anim = useRef(new Animated.Value(0)).current;
    const done = !!photo;

    useEffect(() => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 380,
        delay: index * 90,
        useNativeDriver: true,
      }).start();
    }, []);

    const isDone = !!photo;

    return (
      <Animated.View
        style={{
          opacity: anim,
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
        <View style={[styles.card, isDone && styles.cardDone]}>
          <View style={styles.cardHeader}>
            <View style={[styles.numBadge, isDone && styles.numBadgeDone]}>
              {isDone ? (
                <CheckIcon />
              ) : (
                <Text style={styles.numText}>{index + 1}</Text>
              )}
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Workout #{index + 1}</Text>

              <Text style={styles.cardSub}>
                {isDone ? photo?.caption : 'Tap to upload proof'}
              </Text>
            </View>

            {isDone && (
              <View style={styles.donePill}>
                <Text style={styles.donePillText}>Uploaded</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            disabled={isLocked || isDone}
            style={[
              styles.uploadBox,
              isDone && styles.uploadBoxDone,
              isLocked && styles.lockedBox,
            ]}
            onPress={() => handleUpload(index)}
            activeOpacity={0.8}
          >
            {photo?.uri ? (
              <Image source={{ uri: photo.uri }} style={styles.uploadImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <CameraIcon />

                <Text style={styles.uploadText}>
                  {isLocked ? 'Session Locked' : '+ Upload Photo'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {done && photo?.uploadedAt && (
            <Text style={styles.timestamp}>
              Uploaded{' '}
              {moment(photo?.uploadedAt).format('MMM D, YYYY • h:mm A')}
            </Text>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <Wrapper isForgot>
      <View style={styles.root}>
        <Header header="Weekly Classes" />

        <Animated.View style={{ opacity: headerAnim }}>
          <Text style={styles.heroTitle}>🏋️ Weekly Fitness Class</Text>

          <Text style={styles.heroSub}>
            Upload {TOTAL} workout proofs within 24 hours
          </Text>

          <View style={styles.progressCard}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Progress</Text>

              <Text style={styles.progressCount}>
                {done} / {TOTAL} workouts
              </Text>
            </View>

            <View style={styles.progressBg}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.progressDots}>
              {Array.from({ length: TOTAL }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i < done && styles.dotFilled]}
                />
              ))}
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusText}>
                {weekData?.completed
                  ? 'Completed ✓'
                  : isLocked
                  ? 'Locked'
                  : getRemainingTime()}
              </Text>
            </View>
          </View>
        </Animated.View>

        {photos.map((photo, index) => (
          <WorkoutCard key={index} index={index} photo={photo} />
        ))}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    marginBottom: height / 12,
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
    marginTop: 8,
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: fontFamily.montserratRegular,
  },
});
