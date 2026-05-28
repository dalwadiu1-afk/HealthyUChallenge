import React, { useState, useEffect } from 'react';
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
  Dimensions,
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
import moment from 'moment';

const user = auth().currentUser;
const USER_ID = user?.uid || 'USER_UID';

const TOTAL_WEEKS = 4;
const DEFAULT_MAX_MEALS = 4;

const today = moment();

const CURRENT_MONTH_KEY = today.format('MMMM_YYYY');

const getClosestMealGoal = value => {
  const num = Number(value) || 4;

  if (num <= 3) return 3;
  if (num >= 5) return 5;

  return Math.round(num);
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

export default function MeatlessChallenge({ navigation }) {
  const [habitData, setHabitData] = useState({
    title: 'Meatless Challenge',
    target: '4 Meals Per Week',
    weeks: {},
  });

  const [startDate, setStartDate] = useState(null);
  const [labels, setLabels] = useState({});

  const weeks = habitData?.weeks || {};

  const totalMeals = Object.values(weeks).reduce((sum, week) => {
    return sum + Object.keys(week || {}).length;
  }, 0);

  const progress = totalMeals / (TOTAL_WEEKS * MAX_MEALS);

  const getCurrentWeek = () => {
    if (!startDate) return 1;

    const diffDays = moment().diff(startDate, 'days');

    return Math.min(Math.max(Math.floor(diffDays / 7) + 1, 1), TOTAL_WEEKS);
  };

  const CURRENT_WEEK = getCurrentWeek();

  useEffect(() => {
    if (!USER_ID) return;

    const ref = database().ref(`users/${USER_ID}`);

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();

      // START DATE
      if (data?.goal?.startDate) {
        setStartDate(moment(data.goal.startDate, 'YYYY-MM-DD'));
      }

      // HABIT DATA
      const challenge = data?.habits?.meatLess?.[CURRENT_MONTH_KEY];
      const rawGoal = challenge?.goal || 4;

      const weeklyGoal = getClosestMealGoal(rawGoal);
      console.log('challenge :>> ', challenge?.weeks);
      if (challenge?.weeks != undefined) {
        setHabitData({
          ...challenge,
          goal: weeklyGoal,
          target: `${weeklyGoal} Meals Per Week`,
        });

        const tempLabels = {};

        Object.entries(challenge?.weeks || {}).forEach(([weekKey, week]) => {
          Object.entries(week || {}).forEach(([mealKey, meal]) => {
            tempLabels[`${weekKey}_${mealKey}`] = meal?.label || '';
          });
        });

        setLabels(tempLabels);
      } else {
        setHabitData({
          title: 'Meatless Challenge',
          target: `${weeklyGoal} Meals Per Week`,
          goal: weeklyGoal,
          weeks: {},
        });
      }
    });

    return () => ref.off('value', listener);
  }, []);

  const saveMeal = async (weekKey, mealData) => {
    const normalizedGoal = getClosestMealGoal(habitData?.goal || 4);

    const currentMeals = Object.values(weeks?.[weekKey] || {});

    const updatedMeals = [...currentMeals, mealData];

    await database()
      .ref(`users/${USER_ID}/habits/meatLess/${CURRENT_MONTH_KEY}`)
      .update({
        title: 'Meatless Challenge',
        target: `${normalizedGoal} Meals Per Week`,
        goal: normalizedGoal,

        [`weeks/${weekKey}`]: updatedMeals,
      });
  };
  const addMeal = async weekKey => {
    const weekNumber = Number(weekKey.replace('week', ''));

    if (weekNumber !== CURRENT_WEEK) return;

    const meals = weeks?.[weekKey] || {};

    if (Object.keys(meals).length >= MAX_MEALS) {
      Alert.alert('Limit reached', 'Max 4 meals per week');
      return;
    }

    const granted = await requestCameraPermission();

    if (!granted) return;

    launchCamera({ mediaType: 'photo', quality: 0.7 }, async res => {
      const uri = res?.assets?.[0]?.uri;

      if (!uri) return;

      await saveMeal(weekKey, {
        uri,
        label: '',
        timestamp: moment().toISOString(),
      });
    });
  };

  const updateLabel = async (weekKey, mealIndex, text) => {
    const currentMeals = Array.isArray(weeks?.[weekKey])
      ? [...weeks[weekKey]]
      : [];

    currentMeals[mealIndex] = {
      ...currentMeals[mealIndex],
      label: text,
    };

    await database()
      .ref(
        `users/${USER_ID}/habits/meatLess/${CURRENT_MONTH_KEY}/weeks/${weekKey}`,
      )
      .set(currentMeals);
  };

  const deleteMeal = async (weekKey, mealIndex) => {
    const currentMeals = Array.isArray(weeks?.[weekKey]) ? weeks[weekKey] : [];

    const updatedMeals = currentMeals.filter((_, index) => index !== mealIndex);

    await database()
      .ref(
        `users/${USER_ID}/habits/meatLess/${CURRENT_MONTH_KEY}/weeks/${weekKey}`,
      )
      .set(updatedMeals);
  };
  const MAX_MEALS = habitData?.goal || DEFAULT_MAX_MEALS;
  return (
    <View style={styles.root}>
      <Header
        header={'Meatless Challenge'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />

      <Wrapper isForgot safeAreaPops={{ edges: ['bottom'] }}>
        <View style={styles.heroBg}>
          <Text style={styles.heroTitle}>🌿 Meatless Day Challenge</Text>

          <Text style={styles.heroSub}>
            Upload meals for 1 meatless day each week (4 weeks)
          </Text>

          <View style={styles.progressRow}>
            <View style={styles.progressBg}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>

            <Text style={styles.progressLabel}>
              {totalMeals}/{TOTAL_WEEKS * MAX_MEALS} meals
            </Text>
          </View>
        </View>

        {Array.from({ length: TOTAL_WEEKS }).map((_, wi) => {
          const weekKey = `week${wi + 1}`;
          const weekNumber = wi + 1;

          const isPast = weekNumber < CURRENT_WEEK;
          const isCurrent = weekNumber === CURRENT_WEEK;
          const isLocked = weekNumber > CURRENT_WEEK;

          const mealsObject = weeks?.[weekKey] || {};

          const mealsArray = Array.isArray(mealsObject)
            ? mealsObject.map((item, index) => [index, item])
            : [];

          const weekDone = mealsArray.length >= MAX_MEALS;

          return (
            <View
              key={wi}
              style={[
                styles.weekCard,
                weekDone && styles.weekCardDone,
                isLocked && styles.weekCardLocked,
              ]}
            >
              {weekDone && !isLocked && (
                <GradientBg
                  id={`wg${wi}`}
                  c1="rgba(77,102,68,0.18)"
                  c2="rgba(45,74,37,0.08)"
                />
              )}

              <View style={styles.weekHeader}>
                <View
                  style={[
                    styles.weekNumBadge,
                    weekDone && styles.weekNumBadgeDone,
                    isLocked && styles.weekNumBadgeLocked,
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

                <Text style={[styles.weekTitle, isLocked && styles.lockedText]}>
                  Week {wi + 1}
                </Text>

                {weekDone && (
                  <View style={styles.completedPill}>
                    <Text style={styles.completedPillText}>Completed</Text>
                  </View>
                )}

                {isCurrent && (
                  <View style={styles.currentPill}>
                    <Text style={styles.currentPillText}>Active</Text>
                  </View>
                )}

                {isLocked && (
                  <View style={styles.lockedPill}>
                    <Text style={styles.lockedPillText}>🔒 Locked</Text>
                  </View>
                )}
              </View>

              {isLocked ? (
                <View style={styles.lockedBox}>
                  <Text style={styles.lockEmoji}>🔒</Text>

                  <Text style={styles.lockedSub}>Unlocks in a future week</Text>
                </View>
              ) : isPast && mealsArray?.length === 0 ? (
                <View style={styles.pastSummary}>
                  <View style={styles.pastIconWrap}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M20 6L9 17l-5-5"
                        stroke={colors.secondary}
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>

                  <View style={styles.pastTextWrap}>
                    <Text style={styles.pastTitle}>Week completed</Text>

                    <Text style={styles.pastSub}>
                      Meatless day challenge met for this week
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  {mealsArray?.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.mealsRow}
                    >
                      {mealsArray.map(([mealKey, meal], mi) => (
                        <View key={mi} style={styles.mealThumb}>
                          <Image
                            source={{ uri: meal?.uri }}
                            style={styles.mealImg}
                          />

                          {isCurrent && (
                            <TouchableOpacity
                              style={styles.mealDelete}
                              onPress={() => deleteMeal(weekKey, mealKey)}
                            >
                              <Text style={styles.mealDeleteText}>✕</Text>
                            </TouchableOpacity>
                          )}

                          <Text style={styles.mealDate}>
                            {meal?.timestamp
                              ? moment(meal.timestamp).format('DD MMM YYYY')
                              : ''}
                          </Text>

                          <TextInput
                            value={labels[`${weekKey}_${mealKey}`] || ''}
                            onChangeText={t => {
                              setLabels(prev => ({
                                ...prev,
                                [`${weekKey}_${mealKey}`]: t,
                              }));
                            }}
                            onEndEditing={() => {
                              updateLabel(
                                weekKey,
                                mealKey,
                                labels[`${weekKey}_${mealKey}`] || '',
                              );
                            }}
                            editable={isCurrent}
                            placeholder="Label…"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            style={styles.mealLabel}
                          />
                        </View>
                      ))}
                    </ScrollView>
                  )}

                  {isPast && mealsArray?.length > 0 && (
                    <View style={styles.mealsDoneBanner}>
                      <Text style={styles.mealsDoneText}>
                        ✅ {mealsArray?.length}/{MAX_MEALS} meals logged
                      </Text>
                    </View>
                  )}

                  {isCurrent && mealsArray?.length < MAX_MEALS && (
                    <TouchableOpacity
                      style={styles.uploadBtn}
                      onPress={() => addMeal(weekKey)}
                      activeOpacity={0.8}
                    >
                      <CameraIcon />

                      <Text style={styles.uploadText}>
                        {mealsArray.length === 0
                          ? 'Upload Meal Photo'
                          : `+ Add Meal (${mealsArray.length}/${MAX_MEALS})`}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {mealsArray?.length >= MAX_MEALS && isCurrent && (
                    <View style={styles.maxReachedRow}>
                      <Text style={styles.maxReachedText}>
                        ✅ All meals uploaded for this week
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          );
        })}
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },
  mealDate: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    fontFamily: fontFamily.montserratRegular,
  },
  heroBg: { paddingBottom: 20, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    // paddingHorizontal: 18,
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
  weekTitle: {
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

  /* Meal thumbnails */
  mealsRow: { marginBottom: 12 },
  mealThumb: {
    width: 110,
    marginRight: 10,
    position: 'relative',
  },
  mealImg: { width: 110, height: 90, borderRadius: 12 },
  mealDelete: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealDeleteText: { color: colors.white, fontSize: 10 },
  mealLabel: {
    marginTop: 6,
    color: colors.white,
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 3,
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
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },

  maxReachedRow: { alignItems: 'center', paddingVertical: 8 },
  maxReachedText: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },

  /* Past week completed summary */
  pastSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(143,175,120,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    padding: 14,
  },
  pastIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastTextWrap: { flex: 1 },
  pastTitle: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 2,
  },
  pastSub: {
    color: colors.grey,
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    lineHeight: 16,
  },

  mealsDoneBanner: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(143,175,120,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    marginTop: 4,
  },
  mealsDoneText: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
});
