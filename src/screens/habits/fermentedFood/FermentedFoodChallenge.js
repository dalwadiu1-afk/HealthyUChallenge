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
  Alert,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';
import { Header, Wrapper } from '../../../components';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import Modal from 'react-native-modal';
import storage from '@react-native-firebase/storage';

const TOTAL_DAYS = 7;
const TOTAL_WEEKS = 4;
const USER_ID = auth().currentUser?.uid;

const today = moment();

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

const FermentedFoodChallenge = ({ navigation, route }) => {
  const isArchive = !!route?.params?.monthKey;
  const CURRENT_MONTH_KEY =
    route?.params?.monthKey ?? today.format('MMMM_YYYY');
  const [weeks, setWeeks] = useState(
    Array(TOTAL_WEEKS)
      .fill(null)
      .map(() => Array(TOTAL_DAYS).fill(null)),
  );
  const [currentWeek, setCurrentWeek] = useState(
    route?.params?.monthKey ? 4 : 0,
  );
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const completed = weeks.flat().filter(Boolean).length;
  const total = TOTAL_WEEKS * TOTAL_DAYS;
  const progress = completed / total;

  useEffect(() => {
    if (!USER_ID) return;
    const goalRef = database().ref(`/users/${USER_ID}/goal`);

    const goalListener = goalRef.on('value', snap => {
      const data = snap.val();

      if (data?.startDate) {
        setStartDate(data.startDate);
      }
    });
    const ref = database().ref(`/users/${USER_ID}`);

    const listener = ref.on('value', snap => {
      const data = snap.val();

      const restored = Array.from({ length: TOTAL_WEEKS }, () =>
        Array(TOTAL_DAYS).fill(null),
      );

      const weeksData =
        data?.habits?.fermentedFood?.[CURRENT_MONTH_KEY]?.weeks || {};

      Object.entries(weeksData).forEach(([weekKey, weekValue]) => {
        const weekIndex = parseInt(weekKey.replace('week', ''), 10) - 1;

        const days = weekValue || {};

        Object.entries(days).forEach(([dayKey, value]) => {
          const dayIndex = parseInt(dayKey.replace('day', ''), 10) - 1;

          if (
            weekIndex >= 0 &&
            weekIndex < TOTAL_WEEKS &&
            dayIndex >= 0 &&
            dayIndex < TOTAL_DAYS
          ) {
            restored[weekIndex][dayIndex] = value;
          }
        });
      });

      setWeeks(restored);
    });

    return () => {
      return () => {
        goalRef.off();
        ref.off();
      };
    };
  }, []);

  useEffect(() => {
    if (!startDate) return;

    const start = moment(startDate, 'YYYY-MM-DD').startOf('day');

    const today = moment().startOf('day');

    const diffDays = today.diff(start, 'days');

    const week = Math.min(TOTAL_WEEKS - 1, Math.floor(diffDays / TOTAL_DAYS));

    const day = Math.min(TOTAL_DAYS - 1, diffDays % TOTAL_DAYS);

    setCurrentWeek(week);
    setCurrentDayIndex(day);
  }, [startDate]);

  const showImagePicker = dayIndex => {
    setSelectedDay(dayIndex);
    setPickerVisible(true);
  };

  const uploadImageToFirebase = async uri => {
    try {
      const fileName = `fermentedFood/${USER_ID}/${Date.now()}.jpg`;

      const reference = storage().ref(fileName);

      await reference.putFile(uri);

      const downloadURL = await reference.getDownloadURL();

      return downloadURL;
    } catch (error) {
      console.log('Image Upload Error:', error);
      return null;
    }
  };

  const saveToDB = async updatedWeeks => {
    if (!USER_ID) return;

    const basePath = `users/${USER_ID}/habits/fermentedFood/${CURRENT_MONTH_KEY}`;

    const updates = {
      [`${basePath}/title`]: 'fermented Food Challenge',
      [`${basePath}/target`]: 'Take Pic every',
    };
    updatedWeeks.forEach((week, weekIndex) => {
      const weekKey = `week${weekIndex + 1}`;

      week.forEach((meal, dayIndex) => {
        if (!meal) return;

        const mealKey = `day${dayIndex + 1}`;

        updates[`${basePath}/weeks/${weekKey}/${mealKey}`] = meal;
      });
    });

    await database().ref().update(updates);
  };

  const openCamera = async () => {
    const { canUpload } = getDayAccess(
      currentWeek,
      dayIndex,
      weeks[currentWeek][dayIndex],
    );

    if (!canUpload) return;
    setPickerVisible(false);

    const dayIndex = selectedDay;

    const { isToday } = getDayAccess(
      currentWeek,
      dayIndex,
      weeks[currentWeek][dayIndex],
    );

    const item = weeks[currentWeek][dayIndex];

    if (!isToday && !item) return;

    const granted = await requestCameraPermission();

    if (!granted) return;

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      },
      response => {
        if (response.didCancel || response.errorCode) return;

        const uri = response?.assets?.[0]?.uri;

        if (!uri) return;

        saveImage(dayIndex, uri);
      },
    );
  };

  const saveImage = async (dayIndex, localUri) => {
    try {
      const imageUrl = await uploadImageToFirebase(localUri);

      if (!imageUrl) return;

      const nw = weeks.map(w => [...w]);

      nw[currentWeek][dayIndex] = {
        uri: imageUrl,
        label: '',
        timestamp: moment().format('MMMM D, YYYY hh:mm A'),
        uploadedAt: database.ServerValue.TIMESTAMP,
      };

      setWeeks(nw);

      await saveToDB(nw);

      if (dayIndex < TOTAL_DAYS - 1) {
        setCurrentDayIndex(prev => prev + 1);
      } else if (currentWeek < TOTAL_WEEKS - 1) {
        setCurrentWeek(prev => prev + 1);
        setCurrentDayIndex(0);
      }
    } catch (error) {
      console.log('Save Image Error:', error);
    }
  };

  const openGallery = async () => {
    const { canUpload } = getDayAccess(
      currentWeek,
      dayIndex,
      weeks[currentWeek][dayIndex],
    );

    if (!canUpload) return;
    setPickerVisible(false);

    const dayIndex = selectedDay;

    const { isToday } = getDayAccess(
      currentWeek,
      dayIndex,
      weeks[currentWeek][dayIndex],
    );

    if (!isToday) return;

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      response => {
        if (response.didCancel || response.errorCode) return;

        const uri = response?.assets?.[0]?.uri;

        if (!uri) return;

        saveImage(dayIndex, uri);
      },
    );
  };

  const updateLabel = async (dayIndex, text) => {
    const nw = weeks.map(w => [...w]);

    nw[currentWeek][dayIndex] = {
      ...nw[currentWeek][dayIndex],
      label: text,
    };

    setWeeks(nw);

    const weekKey = `week${currentWeek + 1}`;
    const dayKey = `day${dayIndex + 1}`;

    await database()
      .ref(
        `users/${USER_ID}/habits/fermentedFood/${CURRENT_MONTH_KEY}/weeks/${weekKey}/${dayKey}`,
      )
      .update({
        label: text,
      });
  };

  const deletePhoto = async dayIndex => {
    const { canEditLabel } = getDayAccess(
      currentWeek,
      dayIndex,
      weeks[currentWeek][dayIndex],
    );

    if (!canEditLabel) return;

    const nw = weeks.map(w => [...w]);

    nw[currentWeek][dayIndex] = null;

    setWeeks(nw);

    const weekKey = `week${currentWeek + 1}`;
    const dayKey = `day${dayIndex + 1}`;

    await database()
      .ref(
        `users/${USER_ID}/habits/fermentedFood/${CURRENT_MONTH_KEY}/weeks/${weekKey}/${dayKey}`,
      )
      .remove();
  };

  const getDayAccess = (week, day, item) => {
    const isDone = !!item;

    // 🔥 ARCHIVE MODE (NO UPLOAD ALLOWED)
    if (isArchive) {
      return {
        isPast: true,
        isFuture: false,
        isToday: false,
        isDone,
        isMissed: !isDone, // 🔥 KEY FIX
        isLocked: true,
        canUpload: false,
        canEditLabel: false,
      };
    }

    // NORMAL MODE (ACTIVE MONTH)
    if (!startDate) {
      return {
        isPast: false,
        isFuture: false,
        isToday: false,
        isDone,
        isMissed: false,
        isLocked: true,
        canUpload: false,
        canEditLabel: false,
      };
    }

    const start = moment(startDate).startOf('day');
    const today = moment().startOf('day');

    const diffDays = today.diff(start, 'days');
    const globalIndex = week * TOTAL_DAYS + day;

    const isPast = globalIndex < diffDays;
    const isFuture = globalIndex > diffDays;
    const isToday = globalIndex === diffDays;

    const isMissed = isPast && !isDone;

    return {
      isPast,
      isFuture,
      isToday,
      isDone,
      isMissed,
      isLocked: isFuture,
      canUpload: isToday && !isDone,
      canEditLabel: isToday && isDone,
    };
  };

  const markMealDone = async (weekKey, mealKey, mealData) => {
    if (!USER_ID) return;

    await database()
      .ref(
        `users/${USER_ID}/habits/fermentedFood/${CURRENT_MONTH_KEY}/weeks/${weekKey}/${mealKey}`,
      )
      .update({
        ...mealData,
        done: true,
      });
  };

  return (
    <View style={styles.root}>
      <Header
        header={'🥒 Fermented Food'}
        headerContainer={{
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
              {weeks[currentWeek]?.filter(Boolean).length}/{TOTAL_DAYS} days
            </Text>
          </View>
          <View style={styles.dayDots}>
            {Array.from({ length: TOTAL_DAYS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dayDot,
                  weeks?.[currentWeek]?.[i] && styles.dayDotDone,
                  i === currentDayIndex &&
                    !weeks?.[currentWeek]?.[i] &&
                    styles.dayDotCurrent,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Day cards */}
        {Array.from({ length: TOTAL_DAYS }).map((_, dayIndex) => {
          const item = weeks?.[currentWeek]?.[dayIndex];
          const {
            isPast,
            isFuture,
            isDone,
            isMissed,
            canEditLabel,
            isToday,
            canUpload,
            isLocked,
          } = getDayAccess(currentWeek, dayIndex, item);
          const globalIndex = currentWeek * TOTAL_DAYS + dayIndex;
          const todayIndex = currentWeek * TOTAL_DAYS + currentDayIndex;

          const isCurrent = globalIndex === todayIndex;

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
                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => {
                      const weekKey = `week${currentWeek + 1}`;
                      const mealKey = `day${dayIndex + 1}`;

                      const mealData = weeks[currentWeek][dayIndex];

                      markMealDone(weekKey, mealKey, mealData);
                    }}
                  >
                    <Text style={styles.doneText}>Done</Text>
                  </TouchableOpacity>
                )}
                {isCurrent && !isDone && (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>Upload Now</Text>
                  </View>
                )}
                {isLocked && !isDone && (
                  <Text style={styles.lockIcon}>{isMissed ? '❌' : '🔒'}</Text>
                )}
              </View>

              {isDone ? (
                <View>
                  <Image source={{ uri: item.uri }} style={styles.photo} />

                  <TextInput
                    editable={canEditLabel} // ONLY TODAY editable after upload
                    value={item.label}
                    onChangeText={t => {
                      if (!canEditLabel) return;

                      const nw = weeks.map(w => [...w]);
                      nw[currentWeek][dayIndex] = {
                        ...nw[currentWeek][dayIndex],
                        label: t,
                      };
                      setWeeks(nw);
                    }}
                    onEndEditing={e => {
                      if (!canEditLabel) return;
                      updateLabel(dayIndex, e.nativeEvent.text);
                    }}
                    placeholder="e.g. Yogurt, Kimchi, Kombucha…"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    style={styles.labelInput}
                  />
                  <Text style={styles.timestamp}>{item?.timestamp}</Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.retakeBtn}
                      onPress={() => {
                        const { canUpload } = getDayAccess(
                          currentWeek,
                          dayIndex,
                          item,
                        );

                        if (!canUpload) return; // 🔥 BLOCKS archived + future

                        showImagePicker(dayIndex);
                      }}
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
              ) : isMissed ? (
                <View style={styles.missedBox}>
                  <Text style={styles.lockEmoji}>❌</Text>
                  <Text style={styles.lockedSub}>Missed Day</Text>
                </View>
              ) : isFuture ? (
                <View style={styles.lockedBox}>
                  <Text style={styles.lockEmoji}>🔒</Text>
                  <Text style={styles.lockedSub}>Not available yet</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => {
                    const { canUpload } = getDayAccess(
                      currentWeek,
                      dayIndex,
                      item,
                    );

                    if (!canUpload) return; // 🔥 BLOCKS archived + future

                    showImagePicker(dayIndex);
                  }}
                >
                  <CameraIcon />
                  <Text style={styles.uploadText}>Upload Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </Wrapper>
      <Modal
        isVisible={pickerVisible}
        onBackdropPress={() => setPickerVisible(false)}
        backdropOpacity={0.7}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Upload Photo</Text>

            <Text style={styles.modalSubtitle}>
              Choose where you'd like to get your photo from
            </Text>

            <TouchableOpacity style={styles.modalButton} onPress={openCamera}>
              <Text style={styles.modalButtonText}>📷 Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={openGallery}>
              <Text style={styles.modalButtonText}>🖼 Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setPickerVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },
  missedBox: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,0,0,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.2)',
  },
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

  doneBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 49,
    backgroundColor: 'rgba(143,175,120,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.4)',
  },

  doneText: {
    color: colors.secondary,
    fontSize: 11,
    fontFamily: fontFamily.interSemiBold,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  modalCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    backgroundColor: colors.bubbleDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  modalTitle: {
    color: colors.white,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: fontFamily.montserratBold,
  },

  modalSubtitle: {
    color: colors.grey,
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
  },

  modalButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(143,175,120,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.25)',
  },

  modalButtonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },

  cancelButton: {
    marginTop: 8,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  cancelText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
});

export default FermentedFoodChallenge;
