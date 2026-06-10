import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Animated,
  Pressable,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors, fontFamily } from '../../constant';
import { Wrapper } from '../../components';
import { useSelector } from 'react-redux';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import Modal from 'react-native-modal';

const CATEGORIES = ['All', 'Fitness', 'Nutrition', 'Sleep', 'Wellness'];

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good Morning 🌿';
  if (hour < 17) return 'Good Afternoon ☀️';
  if (hour < 21) return 'Good Evening 🌙';
  return 'Good Night 🌌';
};

const CATEGORY_STYLE = {
  Fitness: {
    bg: 'rgba(90,150,255,0.12)',
    border: 'rgba(90,150,255,0.35)',
    dot: '#5A96FF',
    emoji: '🏃',
  },
  Nutrition: {
    bg: 'rgba(255,193,90,0.12)',
    border: 'rgba(255,193,90,0.35)',
    dot: '#FFC15A',
    emoji: '🥗',
  },
  Sleep: {
    bg: 'rgba(167,130,255,0.12)',
    border: 'rgba(167,130,255,0.35)',
    dot: '#A782FF',
    emoji: '😴',
  },
  Wellness: {
    bg: 'rgba(143,175,120,0.14)',
    border: 'rgba(143,175,120,0.4)',
    dot: '#8FAF78',
    emoji: '🌿',
  },
};

/* =======================
   RESTORED SCREEN NAMES
======================= */

/* =======================
   FLIP CARD
======================= */
function FlipCard({
  item,
  navigation,
  index,
  selectedGoals,
  setSelectedGoals,
  selectionMode,
  setConfirmVisible,
  uid,
  tempSelected,
  setTempSelected,
}) {
  const animVal = useRef(new Animated.Value(0)).current;
  const entranceVal = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);
  const selectedGoalData = selectedGoals.find(g => g.id === item.id);

  const [goalText, setGoalText] = useState(selectedGoalData?.goalText || '');

  const goalSaved = !!selectedGoalData?.goalText;
  const cs = CATEGORY_STYLE[item.category] || CATEGORY_STYLE.Wellness;

  useEffect(() => {
    Animated.timing(entranceVal, {
      toValue: 1,
      duration: 400,
      delay: (index % 2 === 0 ? 100 : 200) + Math.floor(index / 2) * 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const flipCard = () => {
    Animated.spring(animVal, {
      toValue: flipped ? 0 : 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setFlipped(p => !p);
  };

  const frontRotate = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotate = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const entranceStyle = {
    opacity: entranceVal,
    transform: [
      {
        translateY: entranceVal.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };

  const goalAlreadySet =
    selectedGoalData?.goalText &&
    selectedGoalData.goalText.toString().trim() !== '';

  const onFlipCard = () => {
    // ======================
    // SELECTION MODE
    // ======================
    if (selectionMode) {
      const alreadySelected = tempSelected.some(g => g.id === item.id);

      if (alreadySelected) {
        setTempSelected(prev => prev.filter(g => g.id !== item.id));

        return;
      }

      if (tempSelected.length >= 3 && !alreadySelected) return;

      const updated = [...tempSelected, item];

      setTempSelected(updated);

      // VISUAL TEMP FLIP
      flipCard();

      setTimeout(() => {
        Animated.spring(animVal, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }).start();

        setFlipped(false);
      }, 700);

      if (updated.length === 3) {
        setTimeout(() => {
          setConfirmVisible(true);
        }, 800);
      }

      return;
    }

    // ======================
    // AFTER CONFIRM
    // ======================

    // ======================
    // AFTER CONFIRM
    // ======================

    const allowed = selectedGoals.some(g => g.id === item.id);
    if (!allowed) return;

    // ======================
    // NO INPUT REQUIRED
    // DIRECT NAVIGATION
    // ======================

    if (!item?.showInput || goalAlreadySet) {
      flipCard();

      setTimeout(() => {
        navigation?.navigate(item.screenName, {
          goalTitle: item.title,
          goalId: item.id,
        });
      }, 300);

      return;
    }

    // ======================
    // INPUT REQUIRED
    // SHOW FLIP INPUT
    // ======================p

    flipCard();
  };

  const shouldShowGoalInput =
    selectedGoals?.length === 3 && item?.showInput && !goalAlreadySet;

  return (
    <Animated.View style={[styles.cardWrapper, entranceStyle]}>
      <Pressable style={{ flex: 1 }} onPress={onFlipCard}>
        {/* FRONT */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: cs.bg, borderColor: cs.border },
            { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
          ]}
        >
          <Text style={styles.cardEmoji}>{cs.emoji}</Text>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
          {selectionMode && tempSelected.some(g => g.id === item.id) && (
            <View
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: colors.secondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}
              >
                ✓
              </Text>
            </View>
          )}
          <View style={[styles.categoryDot, { backgroundColor: cs.dot }]} />
        </Animated.View>

        {/* BACK */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { borderColor: cs.border },
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: [{ perspective: 1000 }, { rotateY: backRotate }],
            },
          ]}
        >
          {shouldShowGoalInput ? (
            <>
              <Text style={styles.cardEmoji}>{cs.emoji}</Text>

              <Text style={[styles.cardTitle, { color: colors.white }]}>
                {item.title}
              </Text>

              <TextInput
                placeholder={item?.showInput}
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={goalText}
                onChangeText={setGoalText}
                style={{
                  marginTop: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  color: '#fff',
                  height: 50,
                }}
                keyboardType="number-pad"
              />

              <TouchableOpacity
                style={{
                  marginTop: 10,
                  backgroundColor: colors.secondary,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
                onPress={async () => {
                  try {
                    const updatedGoals = selectedGoals.map(goal => {
                      if (goal.id === item.id) {
                        return {
                          ...goal,
                          goalText,
                        };
                      }

                      return goal;
                    });

                    // save selected goals
                    await database().ref(`/users/${uid}/goal`).update({
                      selectedGoals: updatedGoals,
                    });

                    // month/year key
                    const monthName = moment().format('MMMM');
                    const year = moment().format('YYYY');

                    const habitKey = `${monthName}_${year}`;

                    // safe habit name
                    const habitName = item?.key;

                    // save inside habits
                    await database()
                      .ref(`/users/${uid}/habits/${habitName}/${habitKey}`)
                      .update({
                        goal: goalText,
                        title: item?.title,
                      });

                    setSelectedGoals(updatedGoals);

                    Animated.spring(animVal, {
                      toValue: 0,
                      friction: 8,
                      useNativeDriver: true,
                    }).start();

                    setFlipped(false);
                  } catch (e) {
                    console.log('SAVE GOAL ERROR => ', e);
                  }
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontFamily: fontFamily.montserratSemiBold,
                  }}
                >
                  Save Goal
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.cardEmoji}>{cs.emoji}</Text>

              <Text style={styles.cardTitle}>{item.title}</Text>

              <Text style={styles.cardDesc}>{item.description}</Text>

              <View style={[styles.categoryDot, { backgroundColor: cs.dot }]} />
            </>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/* =======================
   MAIN SCREEN
======================= */
export default function HabitsList({ navigation }) {
  const uid = auth().currentUser?.uid;
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [tempSelected, setTempSelected] = useState([]);
  const [selectionMode, setSelectionMode] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const ALL_HABITS = [
    {
      id: 1,
      title: 'Nutrition Session',
      description: 'Book and attend a free nutrition counseling session',
      screenName: 'BookAnAppointment',
      category: 'Nutrition',
      key: 'booking',
    },

    {
      id: 2,
      title: 'Daily Steps',
      description: 'Walk your target number of steps every day',
      screenName: 'WalkingRewardBoard',
      category: 'Fitness',
      key: 'steps',
      showInput: 'Enter daily steps target (max 30000)',
    },

    {
      id: 3,
      title: 'Fiber Goal',
      description: 'Eat 25–38g fiber daily for at least 20 days',
      screenName: 'DailyFiberCounts',
      category: 'Nutrition',
      key: 'fiber',
      showInput: 'Enter daily fiber goal in grams (max 50g)',
    },

    {
      id: 4,
      title: 'Sleep Well',
      description: 'Get 7–9 hours of sleep each night',
      screenName: 'SleepMeasure',
      category: 'Sleep',
      key: 'sleep',
      showInput: 'Enter sleep goal in hours (max 15)',
    },

    {
      id: 5,
      title: 'Fitness Class',
      description: 'Join a weekly fitness class',
      screenName: 'WeeklyFitnessClass',
      category: 'Fitness',
      key: 'fitness',
      showInput: 'Enter classes per week (max 9)',
    },

    {
      id: 6,
      title: 'Strength Training',
      description: 'Do weight training at least 2x per week',
      screenName: 'WeightResistanceTraining',
      category: 'Fitness',
      key: 'weightTraining',
      showInput: 'Enter workout days per week (2 - 6)',
    },

    {
      id: 7,
      title: 'Safe Weight Loss',
      description: 'Lose no more than 2 lbs per week for 4 weeks',
      screenName: 'WeightChallengeUI',
      category: 'Wellness',
      key: 'weightChallenge',
      showInput: 'Enter target weight loss (Max 1-3)',
    },

    {
      id: 8,
      title: 'Half Plate Veggies',
      description: 'Make half your plate fruits & veggies once daily',
      screenName: 'HalfPlateFruitsVeggies',
      category: 'Nutrition',
      key: 'halfPlateChallenge',
    },

    {
      id: 9,
      title: 'Meatless Day',
      description: 'Go meat-free at least once per week',
      screenName: 'MeatlessChallenge',
      category: 'Nutrition',
      key: 'meatLess',
      showInput: 'Enter meatless meals per week (4 - 6)',
    },

    {
      id: 10,
      title: 'Fermented Foods',
      description: 'Eat 1 fermented food daily for 7 days',
      screenName: 'FermentedFoodChallenge',
      category: 'Nutrition',
      key: 'fermentedFood',
    },

    {
      id: 11,
      title: 'Body Fat Progress',
      description: 'Improve body fat percentage over time',
      screenName: 'BodyFatGoalScreen',
      category: 'Wellness',
      key: 'bodyFatGoal',
    },

    {
      id: 12,
      title: 'Try New Veggies',
      description: 'Eat 1 new vegetable per week (2 weeks)',
      screenName: 'VeggieChallenge',
      category: 'Nutrition',
      key: 'newVeggie',
    },

    {
      id: 13,
      title: 'Limit Sugar',
      description: 'Stay under daily added sugar limit for 21 days',
      screenName: 'SugarChartDays',
      category: 'Nutrition',
      key: 'sugarIntake',
      showInput: 'Enter daily sugar limit in grams (max 50g)',
    },

    {
      id: 14,
      title: 'Workout Buddy',
      description: 'Exercise with a friend 4 times',
      screenName: 'FriendWorkoutChallenge',
      category: 'Fitness',
      key: 'exWithFriend',
      showInput: 'Enter workout days with friend (4 - 6) times',
    },

    {
      id: 15,
      title: 'Cardio Progress',
      description: 'Increase cardio time or intensity',
      screenName: 'CardioTrackerUI',
      category: 'Fitness',
      key: 'cardio',
      showInput: 'Enter cardio minutes per week (max 120 min)',
    },

    {
      id: 16,
      title: 'Healthy Drinks',
      description: 'Create a no-added-sugar drink combo',
      screenName: 'BeverageChallengeUI',
      category: 'Nutrition',
      key: 'beverage',
    },

    {
      id: 17,
      title: 'Snack Planning',
      description: 'Build and shop a healthy snack list',
      screenName: 'SnackListingUI',
      category: 'Nutrition',
      key: 'snacks',
    },

    {
      id: 18,
      title: 'Daily Fruits',
      description: 'Eat 2–3 servings of fruit every day',
      screenName: 'FruitTrackerUI',
      category: 'Nutrition',
      key: 'dailyFruits',
    },

    {
      id: 19,
      title: 'Personalized Goal 1',
      description: 'Add your own personal health goal',
      screenName: 'FutureIdeasUI',
      category: 'Wellness',
      key: 'Personalized Goal 1',
    },

    {
      id: 20,
      title: 'Personalized Goal 2',
      description: 'Add your own personal health goal',
      screenName: 'FutureIdeasUI',
      category: 'Wellness',
      key: 'Personalized Goal 2',
    },

    {
      id: 21,
      title: 'Personalized Goal 3',
      description: 'Add your own personal health goal',
      screenName: 'FutureIdeasUI',
      category: 'Wellness',
      key: 'Personalized Goal 3',
    },
  ];

  const profileData = useSelector(state => state.user);
  const profile = profileData?.profile;

  const visibleHabits = selectionMode
    ? ALL_HABITS
    : ALL_HABITS.filter(h => selectedGoals.some(g => g.id === h.id));

  const filtered =
    activeCategory === 'All'
      ? visibleHabits
      : visibleHabits.filter(h => h.category === activeCategory);

  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // checkAppointmentProgress();
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!uid) return;

    const ref = database().ref(`/users/${uid}/goal`);

    const listener = ref.on('value', async snap => {
      const data = snap.val() || {};

      const savedGoals = data?.selectedGoals || [];
      const createdAt = data?.createdAt;

      // no goals yet
      if (!savedGoals.length) {
        setSelectionMode(true);
        setSelectedGoals([]);
        return;
      }

      // check 30 days expiry
      const expired =
        createdAt && moment().diff(moment(createdAt), 'days') >= 30;

      if (expired) {
        const archiveMonth = moment(createdAt).format('MMMM_YYYY');

        const archiveData = {
          goals: savedGoals,
          startDate: createdAt,
          endDate: moment(createdAt).add(30, 'days').format('YYYY-MM-DD'),
          archivedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        };

        await database()
          .ref(`/users/${uid}/previousGoals/${archiveMonth}`)
          .set(archiveData);

        await ref.remove();

        setSelectedGoals([]);
        setSelectionMode(true);
        return;
      }

      setSelectedGoals(savedGoals);
      setSelectionMode(false);
    });

    return () => ref.off('value', listener);
  }, []);

  const confirmGoalSelection = async () => {
    if (tempSelected.length !== 3) return;

    setSelectedGoals(tempSelected);

    const currentMonth = moment().format('MMMM_YYYY');

    await database()
      .ref(`/users/${uid}/goal`)
      .set({
        selectedGoals: tempSelected,
        createdAt: moment().valueOf(),
        startDate: moment().format('YYYY-MM-DD'),
        goalNotes: {},
      });

    const habitUpdates = {};

    tempSelected.forEach(goal => {
      if (goal.goalText) {
        habitUpdates[`${goal.key}/${currentMonth}`] = {
          goal: goal.goalText,
          title: goal.title,
        };
      }
    });

    await database().ref(`/users/${uid}/habits`).update(habitUpdates);

    setSelectionMode(false);
    setConfirmVisible(false);
  };

  const greeting = getGreeting();
  const displayName = profile?.name || profile?.username || '';
  return (
    <View style={styles.container}>
      <Wrapper containerStyle={{ paddingHorizontal: 0 }} orbsRight>
        <FlatList
          key={selectionMode ? 'two-columns' : 'one-column'}
          data={filtered}
          numColumns={selectionMode ? 2 : 1}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <FlipCard
              item={item}
              navigation={navigation}
              index={index}
              selectedGoals={selectedGoals}
              setSelectedGoals={setSelectedGoals}
              selectionMode={selectionMode}
              setConfirmVisible={setConfirmVisible}
              uid={uid}
              tempSelected={tempSelected}
              setTempSelected={setTempSelected}
            />
          )}
          ListHeaderComponent={
            <Animated.View style={{ opacity: headerFade }}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerGreeting}>
                    {displayName ? `${greeting}, ${displayName}` : greeting}
                  </Text>
                  <Text style={styles.headerTitle}>Your Habits</Text>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statBadge}>
                    <Text style={styles.statNum}>
                      {selectedGoals.length > 0
                        ? selectedGoals?.length
                        : ALL_HABITS?.length}
                    </Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                  {/* <View style={[styles.statBadge, { marginLeft: 8 }]}>
                    <Text style={styles.statNum}>3</Text>
                    <Text style={styles.statLabel}>Done</Text>
                  </View>
                </View> */}
                </View>
              </View>

              {/* Category filter */}
              <FlatList
                data={CATEGORIES}
                horizontal
                keyExtractor={c => c}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                renderItem={({ item: cat }) => {
                  const isActive = cat === activeCategory;
                  const cs = CATEGORY_STYLE[cat];
                  return (
                    <TouchableOpacity
                      style={[
                        styles.filterChip,
                        isActive && {
                          backgroundColor: cs ? cs.bg : 'rgba(143,175,120,0.2)',
                          borderColor: cs ? cs.dot : colors.secondary,
                        },
                      ]}
                      onPress={() => setActiveCategory(cat)}
                      activeOpacity={0.75}
                    >
                      {cs && <Text style={styles.filterEmoji}>{cs.emoji}</Text>}
                      <Text
                        style={[
                          styles.filterText,
                          isActive && { color: cs ? cs.dot : colors.secondary },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </Animated.View>
          }
        />
      </Wrapper>
      <Modal isVisible={confirmVisible} backdropOpacity={0.6} useNativeDriver>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: '#1c1c1c',
              borderRadius: 20,
              padding: 20,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                fontFamily: fontFamily.montserratBold,
              }}
            >
              Select Goal?
            </Text>

            <Text
              style={{
                color: 'rgba(255,255,255,0.7)',
                marginTop: 10,
              }}
            >
              You selected {tempSelected.length} goals
            </Text>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: '#333',
                  marginRight: 8,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setConfirmVisible(false);
                  setTempSelected([]);
                }}
              >
                <Text style={{ color: '#fff' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: colors.secondary,
                  alignItems: 'center',
                }}
                onPress={confirmGoalSelection}
              >
                <Text style={{ color: '#fff' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // paddingHorizontal: 15,
  },
  headerGreeting: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 1,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 28,
    fontFamily: fontFamily.montserratBold,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statBadge: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  statNum: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
  },
  filterRow: {
    paddingBottom: 16,
    gap: 8,
    marginTop: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  filterText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
  },
  cardWrapper: {
    flex: 1,
    margin: 5,
    minHeight: 190,
    // maxWidth: '48%',
  },
  card: {
    flex: 1,
    minHeight: 190,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    backfaceVisibility: 'hidden',
    justifyContent: 'space-between',
  },
  cardBack: {
    backgroundColor: 'rgba(77,102,68,0.45)',
  },
  cardEmoji: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 14,
    color: colors.white,
    fontFamily: fontFamily.montserratBold,
  },
  cardDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: fontFamily.montserratMedium,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    alignSelf: 'flex-end',
  },
});
