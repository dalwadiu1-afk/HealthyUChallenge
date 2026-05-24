import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { Header, Wrapper } from '../../../components';
import moment from 'moment';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const USER_ID = auth().currentUser?.uid;

const today = moment();
const CURRENT_MONTH_KEY = today.format('MMMM_YYYY');
const todayMoment = moment().format('YYYY-MM-DD');

const CARD_SIZE = (SCREEN_WIDTH - 18 * 2 - 10) / 2;

const HalfPlateFruitsVeggies = ({ navigation }) => {
  const [habitData, setHabitData] = useState({});
  const [startDate, setStartDate] = useState(null);

  useEffect(() => {
    if (!USER_ID) return;

    const ref = database().ref(`users/${USER_ID}/goal`);

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();

      if (data?.startDate) {
        setStartDate(data.startDate); // "2026-05-10"
      }
    });

    return () => ref.off('value', listener);
  }, []);

  useEffect(() => {
    if (!USER_ID) return;

    const ref = database().ref(
      `users/${USER_ID}/habits/halfPlateChallenge/${CURRENT_MONTH_KEY}`,
    );

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();

      if (data) {
        setHabitData(data);
      } else {
        setHabitData({
          title: 'Half Plate Fruits & Veggies',
          target: '1 Photo',
          days: {},
        });
      }
    });

    return () => ref.off('value', listener);
  }, []);

  const startMoment = startDate ? moment(startDate, 'YYYY-MM-DD') : null;

  const TOTAL_DAYS = startMoment ? moment().endOf('month').date() : 0;

  const saveDay = async (dayKey, uri) => {
    const ref = database().ref(
      `users/${USER_ID}/habits/halfPlateChallenge/${CURRENT_MONTH_KEY}`,
    );

    await ref.update({
      title: 'Half Plate Fruits & Veggies',
      target: '1 Photo',
      startedAt: habitData?.startedAt || moment().toISOString(),

      [`days/${dayKey}`]: {
        uri,
        completed: true,
        timestamp: moment().toISOString(),
      },

      updatedAt: database.ServerValue.TIMESTAMP,
    });
  };

  const pickImage = async dayKey => {
    const granted = await requestCameraPermission();
    if (!granted) return;

    launchCamera({ mediaType: 'photo', quality: 0.7 }, async res => {
      if (res.didCancel || res.errorCode) return;

      const uri = res?.assets?.[0]?.uri;
      if (!uri) return;

      await saveDay(dayKey, uri);
    });
  };

  const deletePhoto = async dayKey => {
    await database()
      .ref(
        `users/${USER_ID}/habits/halfPlateChallenge/${CURRENT_MONTH_KEY}/days/${dayKey}`,
      )
      .remove();
  };

  const days = habitData?.days || {};

  const completed = Object.values(days).filter(item => item?.completed).length;

  const progress = TOTAL_DAYS ? completed / TOTAL_DAYS : 0;

  // Pair days into rows of 2
  const rows = Array.from({ length: Math.ceil(TOTAL_DAYS / 2) }, (_, i) => {
    const day1 = i * 2 + 1;
    const day2 = i * 2 + 2;

    return [day1, day2 <= TOTAL_DAYS ? day2 : null];
  });

  const DayCard = ({ dayNumber }) => {
    if (!dayNumber) return <View style={{ width: CARD_SIZE }} />;

    const dateKey = startMoment
      ? moment(startMoment)
          .add(dayNumber - 1, 'days')
          .format('YYYY-MM-DD')
      : null;

    const item = days?.[dateKey];

    // LOCK OLD DAYS
    const dayMoment = startMoment
      ? moment(startMoment).add(dayNumber - 1, 'days')
      : null;

    const isToday = dayMoment ? dayMoment.isSame(moment(), 'day') : false;
    const isPastDay = dayMoment ? dayMoment.isBefore(moment(), 'day') : false;
    const isFuture = dayMoment ? dayMoment.isAfter(moment(), 'day') : false;

    const isLocked = isPastDay || isFuture;

    const isDone = !!item?.completed;

    return (
      <View
        style={[
          styles.card,
          isDone && styles.cardDone,
          isLocked && !isDone && styles.cardLocked,
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.dayLabel}>Day {dayNumber}</Text>

          {isDone && (
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>✓</Text>
            </View>
          )}
        </View>

        {isDone ? (
          <View style={styles.photoWrap}>
            <Image source={{ uri: item.uri }} style={styles.photo} />

            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleDateString()}
            </Text>

            {!isPastDay && (
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => pickImage(dateKey)}
                >
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deletePhoto(dateKey)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : isLocked ? (
          <View style={styles.lockedBox}>
            <Text style={styles.lockEmoji}>🔒</Text>

            <Text style={styles.lockedText}>
              {isPastDay ? 'Missed' : 'Locked'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => pickImage(dateKey)}
            activeOpacity={0.8}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                stroke="rgba(143,175,120,0.7)"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12 17a4 4 0 100-8 4 4 0 000 8z"
                stroke="rgba(143,175,120,0.7)"
                strokeWidth={1.8}
              />
            </Svg>

            <Text style={styles.uploadText}>Upload Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <Header
        header={'🥗 Half Fruit & Veggies'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />
      <Wrapper isForgot safeAreaPops={{ edges: ['bottom'] }}>
        <View style={styles.progressCard}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Daily Progress</Text>
            <Text style={styles.progressCount}>
              {completed} / {TOTAL_DAYS} days
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          {/* Week indicators */}
          <View style={styles.weekRow}>
            {[0, 1, 2, 3].map(i => {
              const start = i * 7 + 1;
              const end = Math.min(start + 6, TOTAL_DAYS);

              const weekDays = Array.from(
                { length: end - start + 1 },
                (_, idx) => {
                  const day = String(start + idx).padStart(2, '0');
                  return days?.[day];
                },
              );

              const weekDone =
                weekDays.filter(item => item?.completed).length ===
                weekDays.length;

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

        {/* Day grid */}
        {rows.map((pair, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            <DayCard dayNumber={pair[0]} />
            <DayCard dayNumber={pair[1]} />
          </View>
        ))}
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    paddingHorizontal: 18,
    paddingBottom: 10,
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
    fontSize: 15,
    fontFamily: fontFamily.montserratBold,
    lineHeight: 22,
  },

  scroll: { paddingHorizontal: 18, paddingBottom: 48 },

  heroTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 16,
    includeFontPadding: false,
  },

  /* Progress */
  progressCard: {
    backgroundColor: colors.bubbleDark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    padding: 16,
    marginBottom: 20,
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
  weekRow: { flexDirection: 'row', gap: 6 },
  weekChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  weekChipDone: {
    borderColor: 'rgba(143,175,120,0.4)',
    backgroundColor: 'rgba(143,175,120,0.12)',
  },
  weekChipText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },
  weekChipTextDone: { color: colors.secondary },

  /* Grid */
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },

  /* Cards */
  card: {
    width: CARD_SIZE,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    overflow: 'hidden',
  },
  cardDone: {
    borderColor: 'rgba(143,175,120,0.3)',
    backgroundColor: 'rgba(143,175,120,0.06)',
  },
  cardLocked: {
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },
  dayLabelLocked: { color: 'rgba(255,255,255,0.25)' },
  doneBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: fontFamily.montserratBold,
  },

  /* Upload */
  uploadBtn: {
    height: 110,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(143,175,120,0.04)',
  },
  uploadText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },

  /* Locked */
  lockedBox: {
    height: 110,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  lockEmoji: { fontSize: 20, includeFontPadding: false },
  lockedText: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },

  /* Photo */
  photoWrap: {},
  photo: { width: '100%', height: 100, borderRadius: 10, marginBottom: 6 },
  timestamp: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 9,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 8,
  },
  photoActions: { flexDirection: 'row', gap: 6 },
  retakeBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
    backgroundColor: 'rgba(143,175,120,0.1)',
    alignItems: 'center',
  },
  retakeText: {
    color: colors.secondary,
    fontSize: 10,
    fontFamily: fontFamily.montserratSemiBold,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    backgroundColor: 'rgba(255,107,107,0.08)',
    alignItems: 'center',
  },
  deleteText: {
    color: '#FF6B6B',
    fontSize: 10,
    fontFamily: fontFamily.montserratSemiBold,
  },
});

export default HalfPlateFruitsVeggies;
