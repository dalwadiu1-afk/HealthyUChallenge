// ===============================
// ONLY LOGIC UPDATED
// UI IS NOT CHANGED
// ===============================
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Image,
} from 'react-native';
import { colors, fontFamily } from '../../constant';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
} from 'react-native-reanimated';

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import database from '@react-native-firebase/database';
import ChatCard from '../../components/social/chatCard';
import Svg, { Path } from 'react-native-svg';
import auth from '@react-native-firebase/auth';
import { useSelector } from 'react-redux';
import { Header } from '../../components';
import moment from 'moment';

const userId = auth().currentUser?.uid;

const { height, width } = Dimensions.get('window');
const SHEET_MIN = height * 0.62;
const SHEET_MAX = height * 0.86;

const TAB_OPTIONS = ['Feeds', 'Stats', 'Progress'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ label, value }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const formatTime = timestamp => {
  if (!timestamp) return '';

  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return new Date(timestamp).toLocaleDateString();
};

function TabBar({ currentIndex, onPress }) {
  return (
    <View style={styles.tabBar}>
      {TAB_OPTIONS.map((label, i) => {
        const active = i === currentIndex;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => onPress(i)}
            style={[styles.tabBtn, active && styles.tabBtnActive]}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function StatsTab({ statsData = [] }) {
  return (
    <View style={styles.statsGrid}>
      {statsData.map(
        (s, i) =>
          !s?.value?.startsWith('0') && (
            <View key={i} style={styles.statsCard}>
              <Text style={styles.statsEmoji}>{s.emoji}</Text>
              <Text style={styles.statsCardValue}>{s.value}</Text>
              <Text style={styles.statsCardLabel}>{s.label}</Text>
            </View>
          ),
      )}
    </View>
  );
}

function ProgressTab({
  weeklyData = [],
  availableHabits = [],
  selectedHabit,
  setSelectedHabit,
}) {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const HABIT_META = {
    fiber: {
      emoji: '🥦',
      label: 'Fiber',
    },
    sleep: {
      emoji: '😴',
      label: 'Sleep',
    },
    fitness: {
      emoji: '💪',
      label: 'Fitness',
    },
    beverage: {
      emoji: '🥤',
      label: 'Beverage',
    },
    dailyFruits: {
      emoji: '🍎',
      label: 'Fruits',
    },
    snacks: {
      emoji: '🍪',
      label: 'Snacks',
    },
    cardio: {
      emoji: '🏃',
      label: 'Cardio',
    },
    sugarIntake: {
      emoji: '🍬',
      label: 'Sugar',
    },
    weightChallenge: {
      emoji: '⚖️',
      label: 'Weight',
    },
  };

  const cleanData = weeklyData.map(v => Number(v) || 0);
  const maxValue = Math.max(...cleanData, 1);
  return (
    <View style={styles.progressContainer}>
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View style={styles.progressHeader}>
        <View>
          <Text style={styles.progressTitle}>Weekly Progress</Text>

          <Text style={styles.progressSubtitle}>
            Track your habit consistency
          </Text>
        </View>

        <View style={styles.progressBadge}>
          <Text style={styles.progressBadgeText}>
            {weeklyData.reduce((a, b) => a + b, 0)}
          </Text>
        </View>
      </View>

      {/* ================================================= */}
      {/* HABIT SELECTOR */}
      {/* ================================================= */}

      <FlatList
        horizontal
        data={availableHabits}
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.habitSelectorList}
        renderItem={({ item }) => {
          const active = item === selectedHabit;

          const meta = HABIT_META[item] || {
            emoji: '✨',
            label: item,
          };

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSelectedHabit(item)}
              style={[styles.habitChip, active && styles.habitChipActive]}
            >
              <Text style={styles.habitEmoji}>{meta.emoji}</Text>

              <Text
                numberOfLines={1}
                style={[styles.habitLabel, active && styles.habitLabelActive]}
              >
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ================================================= */}
      {/* BAR CHART CARD */}
      {/* ================================================= */}

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>
            {HABIT_META[selectedHabit]?.emoji}{' '}
            {HABIT_META[selectedHabit]?.label}
          </Text>

          <Text style={styles.chartValue}>{Math.max(...weeklyData)}</Text>
        </View>

        <View style={styles.barChartModern}>
          {DAYS.map((day, i) => {
            const value = cleanData[i] || 0;

            const BAR_HEIGHT = 120;

            const normalizedHeight =
              maxValue > 0 ? (value / maxValue) * BAR_HEIGHT : 0;

            return (
              <View key={i} style={styles.barColumn}>
                <Text style={styles.barTopValue}>{value}</Text>

                <View style={styles.barTrackModern}>
                  <View
                    style={[
                      styles.barFillModern,
                      {
                        height: Math.max(normalizedHeight, 4), // minimum visible bar
                      },
                    ]}
                  />
                </View>

                <Text style={styles.barDay}>{day}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function ProfileDetails({ navigation }) {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState({});
  const [leaderboardData, setLeaderboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState('fiber');

  const reduxUser = useSelector(state => state.user);

  // =====================================================
  // ANIMATION VALUES
  // =====================================================

  const translateY = useSharedValue(0);

  // =====================================================
  // PAN GESTURE
  // =====================================================

  const panGesture = Gesture.Pan()
    .onChange(event => {
      let value = translateY.value + event.changeY;

      // LIMITS
      if (value < -300) {
        value = -300;
      }

      if (value > 0) {
        value = 0;
      }

      translateY.value = value;
    })

    .onEnd(() => {
      translateY.value = withSpring(translateY.value < -150 ? -300 : 0, {
        damping: 18,
        stiffness: 120,
      });
    });

  // =====================================================
  // AVATAR ANIMATION
  // =====================================================

  const avatarStyle = useAnimatedStyle(() => {
    const size = interpolate(
      translateY.value,
      [-300, 0],
      [width * 0.12, width * 0.26],
      'clamp',
    );

    const opacity = interpolate(translateY.value, [-200, -60], [0, 1], 'clamp');

    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      opacity,
    };
  });

  // =====================================================
  // NAME ANIMATION
  // =====================================================

  const nameStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(
      translateY.value,
      [-300, 0],
      [16, 22],
      'clamp',
    );

    const translateYAnim = interpolate(
      translateY.value,
      [-300, 0],
      [-height * 0.113, 0],
      'clamp',
    );

    return {
      fontSize,
      transform: [
        {
          translateY: translateYAnim,
        },
      ],
    };
  });

  // =====================================================
  // NAV TITLE ANIMATION
  // =====================================================

  const navTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateY.value, [-80, 0], [0, 1], 'clamp');

    return {
      opacity,
    };
  });

  // =====================================================
  // HERO INFO ANIMATION
  // =====================================================

  const heroInfoStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateY.value, [-120, 0], [0, 1], 'clamp');

    const translateYAnim = interpolate(
      translateY.value,
      [-300, 0],
      [-80, 0],
      'clamp',
    );

    return {
      opacity,
      transform: [
        {
          translateY: translateYAnim,
        },
      ],
    };
  });

  // =====================================================
  // BOTTOM SHEET HEIGHT
  // =====================================================

  const sheetStyle = useAnimatedStyle(() => {
    const heightAnim = interpolate(
      translateY.value,
      [-300, 0],
      [SHEET_MAX, SHEET_MIN],
      'clamp',
    );

    return {
      height: heightAnim,
    };
  });

  // =====================================================
  // FETCH COMPLETE USER DATA
  // =====================================================

  useEffect(() => {
    if (!userId) return;

    const userRef = database().ref(`/users/${userId}`);
    const leaderboardRef = database().ref(`/leaderboards/${userId}`);

    const userListener = userRef.on('value', snapshot => {
      const data = snapshot.val() || {};

      setUserData(data);
    });

    const leaderboardListener = leaderboardRef.on('value', snapshot => {
      const data = snapshot.val() || {};

      setLeaderboardData(data);
    });

    // =====================================================
    // POSTS
    // =====================================================

    const postsRef = database()
      .ref('posts')
      .orderByChild('userId')
      .equalTo(userId);

    const postsListener = postsRef.on('value', snapshot => {
      const data = snapshot.val() || {};

      const formatted = Object.keys(data)
        .map(key => {
          const item = data[key];

          const likes = item?.likes || {};
          const comments = item?.comments || {};

          return {
            id: key,
            ...item,

            likesCount: Object.keys(likes).length,
            commentsCount: Object.keys(comments).length,
            isLiked: !!likes[userId],
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt);

      setPosts(formatted);
    });

    setLoading(false);

    return () => {
      userRef.off('value', userListener);
      leaderboardRef.off('value', leaderboardListener);
      postsRef.off('value', postsListener);
    };
  }, []);

  // =====================================================
  // MAIN DATA
  // =====================================================

  // =====================================================
  // COMPLETE DYNAMIC STATS + PROGRESS LOGIC
  // SUPPORTS ALL HABITS STRUCTURES
  // =====================================================

  // =====================================================
  // MAIN DATA
  // =====================================================

  const profile = userData?.profile || {};
  const habits = userData?.habits || {};
  const stats = leaderboardData?.challenge || {};

  const currentMonthKey = moment().format('MMM_YYYY');

  const ALL_HABITS = Object.entries(habits || {});

  const AVAILABLE_HABITS = ALL_HABITS.filter(
    ([_, value]) => value?.[currentMonthKey],
  ).map(([key]) => key);

  // =====================================================
  // GLOBAL COUNTERS
  // =====================================================

  let totalCompleted = 0;
  let totalTracked = 0;
  let totalPhotos = 0;
  let totalWorkoutSessions = 0;
  let totalFruitEntries = 0;
  let totalSnackEntries = 0;
  let totalBeverages = 0;
  let totalSugar = 0;
  let totalWeightLogs = 0;
  let totalBodyFatLogs = 0;
  let totalSleepDays = 0;
  let totalSleepHours = 0;
  let totalGoalsCreated = 0;

  let weeklyProgressMap = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
  };

  let dynamicHabitStats = [];
  let dynamicBadges = [];

  const completedDates = [];

  // =====================================================
  // LOOP THROUGH ALL HABITS
  // =====================================================

  ALL_HABITS.forEach(([habitKey, habitValue]) => {
    const monthData = habitValue?.[currentMonthKey];

    if (!monthData) return;

    totalGoalsCreated += 1;

    // =====================================================
    // PERSONALIZED GOALS
    // =====================================================

    if (habitKey.includes('Personalized Goal')) {
      const entries = Object.values(monthData || {});

      totalTracked += entries.length;
      totalCompleted += entries.length;
      totalPhotos += entries.length;

      dynamicHabitStats.push({
        emoji: '🎯',
        label: habitKey,
        value: `${entries.length} uploads`,
      });

      entries.forEach(item => {
        if (item?.createdAt) {
          const day = moment(item.createdAt).format('ddd');

          if (weeklyProgressMap[day] !== undefined) {
            weeklyProgressMap[day] += 1;
          }

          completedDates.push(moment(item.createdAt).format('YYYY-MM-DD'));
        }
      });
    }

    // =====================================================
    // BEVERAGE
    // =====================================================

    if (habitKey === 'beverage') {
      const days = monthData?.days || {};

      Object.entries(days).forEach(([date, item]) => {
        totalTracked += 1;

        if (item?.photo || item?.name) {
          totalCompleted += 1;
          totalBeverages += 1;

          completedDates.push(date);

          const m = moment(date, ['YYYY-MM-DD', moment.ISO_8601], true);

          if (!m.isValid()) return;

          const day = m.format('ddd');

          if (weeklyProgressMap[day] !== undefined) {
            weeklyProgressMap[day] += 1;
          }
        }
      });

      dynamicHabitStats.push({
        emoji: '🥤',
        label: 'Beverages',
        value: `${totalBeverages} drinks`,
      });

      dynamicBadges.push({
        emoji: '🥤',
        label: 'Drink Logger',
      });
    }

    // =====================================================
    // BODY FAT
    // =====================================================

    if (habitKey === 'bodyFatGoal') {
      const logs = monthData?.logs || {};

      const totalLogs = Object.keys(logs).length;

      totalTracked += totalLogs;
      totalCompleted += totalLogs;
      totalBodyFatLogs += totalLogs;

      dynamicHabitStats.push({
        emoji: '📉',
        label: 'Body Fat',
        value: `${totalLogs} check-ins`,
      });

      if (totalLogs > 0) {
        dynamicBadges.push({
          emoji: '📉',
          label: 'Body Fat Tracker',
        });
      }
    }

    // =====================================================
    // CARDIO
    // =====================================================

    if (habitKey === 'cardio') {
      const weeks = monthData?.weeks || {};

      Object.values(weeks).forEach(week => {
        totalWorkoutSessions += Number(week?.sessions || 0);

        const days = week?.days || {};

        Object.entries(days).forEach(([date, item]) => {
          totalTracked += 1;

          if (item?.startPhoto || item?.endPhoto) {
            totalCompleted += 1;

            completedDates.push(date);

            const m = moment(date, ['YYYY-MM-DD', moment.ISO_8601], true);

            if (!m.isValid()) return;

            const day = m.format('ddd');

            if (weeklyProgressMap[day] !== undefined) {
              weeklyProgressMap[day] += 1;
            }
          }
        });
      });

      dynamicHabitStats.push({
        emoji: '🏃',
        label: 'Cardio',
        value: `${totalWorkoutSessions} sessions`,
      });

      dynamicBadges.push({
        emoji: '🏃',
        label: 'Cardio Active',
      });
    }

    // =====================================================
    // DAILY FRUITS
    // =====================================================

    if (habitKey === 'dailyFruits') {
      const weeks = monthData || {};

      Object.values(weeks).forEach(week => {
        Object.entries(week || {}).forEach(([date, item]) => {
          const entries = item?.entries || {};

          const fruitsCount = Object.keys(entries).length;

          totalFruitEntries += fruitsCount;
          totalTracked += fruitsCount;

          if (fruitsCount > 0) {
            totalCompleted += fruitsCount;

            completedDates.push(date);

            const m = moment(date, ['YYYY-MM-DD', moment.ISO_8601], true);

            if (!m.isValid()) return;

            const day = m.format('ddd');

            if (weeklyProgressMap[day] !== undefined) {
              weeklyProgressMap[day] += fruitsCount;
            }
          }
        });
      });

      dynamicHabitStats.push({
        emoji: '🍎',
        label: 'Fruit Intake',
        value: `${totalFruitEntries} fruits`,
      });

      dynamicBadges.push({
        emoji: '🍎',
        label: 'Fruit Lover',
      });
    }

    // =====================================================
    // EXERCISE WITH FRIEND
    // =====================================================

    if (habitKey === 'exWithFriend') {
      const weeks = monthData?.weeks || {};

      let friendSessions = 0;

      Object.values(weeks).forEach(week => {
        const photos = week?.workoutPhotos || [];

        friendSessions += photos.length;

        totalTracked += photos.length;
        totalCompleted += photos.length;
      });

      dynamicHabitStats.push({
        emoji: '🤝',
        label: 'Workout Buddy',
        value: `${friendSessions} sessions`,
      });
    }

    // =====================================================
    // FERMENTED FOOD
    // =====================================================

    if (habitKey === 'fermentedFood') {
      const weeks = monthData?.weeks || {};

      let fermentedCount = 0;

      Object.values(weeks).forEach(week => {
        Object.values(week || {}).forEach(item => {
          if (item?.done) {
            fermentedCount += 1;
            totalTracked += 1;
            totalCompleted += 1;
          }
        });
      });

      dynamicHabitStats.push({
        emoji: '🥬',
        label: 'Fermented Foods',
        value: `${fermentedCount} completed`,
      });
    }

    // =====================================================
    // FIBER
    // =====================================================

    if (habitKey === 'fiber') {
      const days = monthData?.days || {};

      let fiberTotal = 0;

      Object.entries(days).forEach(([date, item]) => {
        totalTracked += 1;

        const progress = Number(item?.progress || 0);

        fiberTotal += progress;

        if (progress > 0) {
          totalCompleted += 1;

          completedDates.push(date);

          const m = moment(date, ['YYYY-MM-DD', moment.ISO_8601], true);

          if (!m.isValid()) return;

          const day = m.format('ddd');

          if (weeklyProgressMap[day] !== undefined) {
            weeklyProgressMap[day] += 1;
          }
        }
      });

      dynamicHabitStats.push({
        emoji: '🥦',
        label: 'Fiber',
        value: `${fiberTotal}g tracked`,
      });

      dynamicBadges.push({
        emoji: '🥦',
        label: 'Fiber Goal',
      });
    }

    // =====================================================
    // FITNESS
    // =====================================================

    if (habitKey === 'fitness') {
      const weeks = monthData?.weeks || {};

      let workoutPhotos = 0;

      Object.values(weeks).forEach(week => {
        const photos = week?.workoutPhotos || [];

        workoutPhotos += photos.length;

        totalTracked += photos.length;
        totalCompleted += photos.length;
      });

      totalPhotos += workoutPhotos;

      dynamicHabitStats.push({
        emoji: '💪',
        label: 'Fitness',
        value: `${workoutPhotos} workouts`,
      });

      dynamicBadges.push({
        emoji: '💪',
        label: 'Fitness Active',
      });
    }

    // =====================================================
    // HALF PLATE
    // =====================================================

    if (habitKey === 'halfPlateChallenge') {
      const days = monthData?.days || {};

      let count = 0;

      Object.values(days).forEach(item => {
        totalTracked += 1;

        if (item?.completed) {
          count += 1;
          totalCompleted += 1;
        }
      });

      dynamicHabitStats.push({
        emoji: '🥗',
        label: 'Half Plate',
        value: `${count} meals`,
      });
    }

    // =====================================================
    // MEATLESS
    // =====================================================

    if (habitKey === 'meatLess') {
      const weeks = monthData?.weeks || {};

      let meatlessMeals = 0;

      Object.values(weeks).forEach(week => {
        meatlessMeals += Object.keys(week || {}).length;
      });

      totalTracked += meatlessMeals;
      totalCompleted += meatlessMeals;

      dynamicHabitStats.push({
        emoji: '🌱',
        label: 'Meatless Meals',
        value: `${meatlessMeals} meals`,
      });

      dynamicBadges.push({
        emoji: '🌱',
        label: 'Plant Powered',
      });
    }

    // =====================================================
    // NEW VEGGIE
    // =====================================================

    if (habitKey === 'newVeggie') {
      const weeks = monthData?.weeks || {};

      let veggieCount = 0;

      Object.values(weeks).forEach(item => {
        if (item?.uri) {
          veggieCount += 1;
        }
      });

      totalTracked += veggieCount;
      totalCompleted += veggieCount;

      dynamicHabitStats.push({
        emoji: '🥕',
        label: 'New Veggies',
        value: `${veggieCount} tried`,
      });
    }

    // =====================================================
    // SLEEP
    // =====================================================

    if (habitKey === 'sleep') {
      const days = monthData?.days || {};

      Object.entries(days).forEach(([date, item]) => {
        totalTracked += 1;

        if (item?.sleep) {
          totalCompleted += 1;
          totalSleepDays += 1;

          const hrs = parseFloat(item?.sleep || 0);

          totalSleepHours += hrs;

          completedDates.push(date);

          const m = moment(date, ['YYYY-MM-DD', moment.ISO_8601], true);

          if (!m.isValid()) return;

          const day = m.format('ddd');

          if (weeklyProgressMap[day] !== undefined) {
            weeklyProgressMap[day] += 1;
          }
        }
      });

      dynamicHabitStats.push({
        emoji: '😴',
        label: 'Sleep',
        value: `${totalSleepHours.toFixed(1)} hrs`,
      });

      dynamicBadges.push({
        emoji: '😴',
        label: 'Sleep Focus',
      });
    }

    // =====================================================
    // SNACKS
    // =====================================================

    if (habitKey === 'snacks') {
      const days = monthData?.days || {};

      Object.entries(days).forEach(([date, item]) => {
        const snacks = item?.snacks || [];

        totalSnackEntries += snacks.length;

        totalTracked += snacks.length;
        totalCompleted += snacks.length;

        if (snacks.length > 0) {
          completedDates.push(date);

          const m = moment(date, ['YYYY-MM-DD', moment.ISO_8601], true);

          if (!m.isValid()) return;

          const day = m.format('ddd');

          if (weeklyProgressMap[day] !== undefined) {
            weeklyProgressMap[day] += snacks.length;
          }
        }
      });

      dynamicHabitStats.push({
        emoji: '🍪',
        label: 'Snacks',
        value: `${totalSnackEntries} snacks`,
      });
    }

    // =====================================================
    // SUGAR
    // =====================================================

    if (habitKey === 'sugarIntake') {
      const days = monthData?.days || {};

      Object.entries(days).forEach(([date, item]) => {
        const items = item?.items || [];

        items.forEach(sugarItem => {
          totalSugar += Number(sugarItem?.sugar || 0);
        });

        totalTracked += items.length;
        totalCompleted += items.length;
      });

      dynamicHabitStats.push({
        emoji: '🍬',
        label: 'Sugar Intake',
        value: `${totalSugar}g`,
      });
    }

    // =====================================================
    // WEIGHT CHALLENGE
    // =====================================================

    if (habitKey === 'weightChallenge') {
      const weeks = monthData?.weeks || {};

      Object.values(weeks).forEach(item => {
        if (item?.weight) {
          totalWeightLogs += 1;
          totalTracked += 1;
          totalCompleted += 1;
        }
      });

      dynamicHabitStats.push({
        emoji: '⚖️',
        label: 'Weight Logs',
        value: `${totalWeightLogs} entries`,
      });

      dynamicBadges.push({
        emoji: '⚖️',
        label: 'Weight Tracker',
      });
    }
  });

  // =====================================================
  // UNIQUE DATES
  // =====================================================

  const uniqueDates = [...new Set(completedDates)].sort();

  // =====================================================
  // STREAK
  // =====================================================

  let currentStreak = 0;
  let longestStreak = 0;

  if (uniqueDates.length > 0) {
    let streak = 1;
    longestStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = moment(uniqueDates[i - 1]);
      const curr = moment(uniqueDates[i]);

      const diff = curr.diff(prev, 'days');

      if (diff === 1) {
        streak += 1;
      } else {
        streak = 1;
      }

      if (streak > longestStreak) {
        longestStreak = streak;
      }
    }

    currentStreak = streak;
  }

  // =====================================================
  // COMPLETION RATE
  // =====================================================

  const completionRate =
    totalTracked > 0 ? Math.round((totalCompleted / totalTracked) * 100) : 0;

  // =====================================================
  // PROFILE STATS
  // =====================================================

  const PROFILE_STATS = [
    {
      label: 'Streak',
      value: `${currentStreak} 🔥`,
    },

    {
      label: 'Goals',
      value: `${totalGoalsCreated} 🎯`,
    },

    {
      label: 'Completion',
      value: `${completionRate}% ✅`,
    },
  ];

  // =====================================================
  // ACTIVITY STATS
  // =====================================================

  const uniqueStatsMap = {};

  [
    {
      emoji: '🔥',
      label: 'Current Streak',
      value: `${currentStreak} days`,
    },

    {
      emoji: '🏆',
      label: 'Longest Streak',
      value: `${longestStreak} days`,
    },

    {
      emoji: '✅',
      label: 'Completed Tasks',
      value: `${totalCompleted}`,
    },

    {
      emoji: '📈',
      label: 'Completion Rate',
      value: `${completionRate}%`,
    },

    {
      emoji: '📸',
      label: 'Photos Uploaded',
      value: `${totalPhotos}`,
    },

    {
      emoji: '🍎',
      label: 'Fruit Entries',
      value: `${totalFruitEntries}`,
    },

    {
      emoji: '🍪',
      label: 'Snacks Logged',
      value: `${totalSnackEntries}`,
    },

    {
      emoji: '🥤',
      label: 'Beverages',
      value: `${totalBeverages}`,
    },

    {
      emoji: '😴',
      label: 'Sleep Hours',
      value: `${totalSleepHours.toFixed(1)} hrs`,
    },

    {
      emoji: '🍬',
      label: 'Sugar Intake',
      value: `${totalSugar}g`,
    },

    {
      emoji: '🏃',
      label: 'Workout Sessions',
      value: `${totalWorkoutSessions}`,
    },

    {
      emoji: '⚖️',
      label: 'Weight Logs',
      value: `${totalWeightLogs}`,
    },

    {
      emoji: '📉',
      label: 'Body Fat Logs',
      value: `${totalBodyFatLogs}`,
    },

    ...dynamicHabitStats,
  ].forEach(item => {
    // USE LABEL AS UNIQUE KEY
    if (!uniqueStatsMap[item.label]) {
      uniqueStatsMap[item.label] = item;
    }
  });

  const ACTIVITY_STATS_DYNAMIC = Object.values(uniqueStatsMap);

  // =====================================================
  // BADGES
  // =====================================================

  const PROGRESS_BADGES = [
    ...(currentStreak >= 3
      ? [
          {
            emoji: '🔥',
            label: `${currentStreak} Day Streak`,
          },
        ]
      : []),

    ...(completionRate >= 80
      ? [
          {
            emoji: '🏆',
            label: 'Consistency Master',
          },
        ]
      : []),

    ...(totalWorkoutSessions >= 3
      ? [
          {
            emoji: '💪',
            label: 'Workout Warrior',
          },
        ]
      : []),

    ...(totalFruitEntries >= 3
      ? [
          {
            emoji: '🍎',
            label: 'Fruit Lover',
          },
        ]
      : []),

    ...(totalSleepDays >= 3
      ? [
          {
            emoji: '😴',
            label: 'Sleep Tracker',
          },
        ]
      : []),

    ...dynamicBadges,
  ];

  // =====================================================
  // WEEKLY DATA
  // =====================================================

  const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // =====================================================
  // MEMBER SINCE
  // =====================================================

  const memberSince =
    profile?.memberSince ||
    Object.keys(habits || {})?.[0] ||
    moment().format('MMM YYYY');

  // =====================================================
  // LIKE
  // =====================================================

  const toggleLike = async postId => {
    const ref = database().ref(`posts/${postId}/likes/${userId}`);

    const snapshot = await ref.once('value');

    if (snapshot.exists()) {
      await ref.remove();
    } else {
      await ref.set(true);
    }
  };

  // =====================================================
  // FEED ITEM
  // =====================================================

  const renderFeed = ({ item, index }) => (
    <ChatCard
      item={{
        name: item?.name,
        message: item?.message || item?.text,
        picture: item?.image,
        time: formatTime(item?.createdAt),

        likes: item?.likesCount,
        comments: item?.commentsCount,
        isLiked: item?.isLiked,

        beverageName: item?.beverageName,
        snackName: item?.snackName,

        ingredients: item?.ingredients || [],

        qty: item?.qty,
        type: item?.type,
      }}
      index={index}
      onLikePress={() => toggleLike(item.id)}
      onCardPress={() =>
        navigation.navigate('SocialStack', {
          screen: 'FeedDetails',
          params: {
            postId: item?.id,
          },
        })
      }
      onCommentPress={() =>
        navigation.navigate('SocialStack', {
          screen: 'FeedDetails',
          params: {
            postId: item?.id,
            showComment: true,
          },
        })
      }
    />
  );

  const normalizeDate = date => {
    if (!date) return null;

    if (typeof date === 'number') {
      return moment(date).format('YYYY-MM-DD');
    }

    const m = moment(date, ['YYYY-MM-DD', moment.ISO_8601], true);
    return m.isValid() ? m.format('YYYY-MM-DD') : null;
  };

  const getLast7Days = () => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = moment().subtract(6 - i, 'days');

      return {
        key: date.format('YYYY-MM-DD'),
        label: date.format('ddd'), // Mon, Tue, etc
      };
    });
  };

  const getHabitWeeklyData = habitKey => {
    const days = getLast7Days();

    const result = {};
    days.forEach(d => {
      result[d.key] = 0;
    });

    const monthData = habits?.[habitKey]?.[currentMonthKey];

    if (!monthData) {
      return days.map(() => 0);
    }

    const add = (date, value = 1) => {
      if (!date || result[date] === undefined || isNaN(value)) return;
      result[date] += value;
    };

    // ---------------- FIBER ----------------
    if (habitKey === 'fiber') {
      Object.entries(monthData?.days || {}).forEach(([date, item]) => {
        const d = normalizeDate(date);
        if (!d) return;
        add(d, Number(item?.progress || 0));
      });
    }

    // ---------------- SLEEP ----------------
    if (habitKey === 'sleep') {
      Object.entries(monthData?.days || {}).forEach(([date, item]) => {
        const d = normalizeDate(date);
        if (!d) return;
        add(d, Number(item?.sleep || 0));
      });
    }

    // ---------------- FITNESS ----------------
    if (habitKey === 'fitness') {
      Object.values(monthData?.weeks || {}).forEach(week => {
        (week?.workoutPhotos || []).forEach(photo => {
          const d = normalizeDate(photo?.createdAt);
          if (!d) return;
          add(d, 1);
        });
      });
    }

    // ---------------- BEVERAGE ----------------
    if (habitKey === 'beverage') {
      Object.entries(monthData?.days || {}).forEach(([date, item]) => {
        const d = normalizeDate(date);
        if (!d) return;
        if (item?.photo || item?.name) add(d, 1);
      });
    }

    // IMPORTANT: return ARRAY ONLY (NOT object)
    return days.map(d => result[d.key] || 0);
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.heroContent}>
        <Header
          header={'Profile Details'}
          headerContainer={{
            marginTop: StatusBar.currentHeight,
          }}
          textStyle={[styles.navTitle, navTitleStyle]}
          showRightBtn
        />

        {/* ================================================= */}
        {/* AVATAR */}
        {/* ================================================= */}

        <Animated.View style={[styles.avatarWrap, avatarStyle]}>
          <Image
            source={{
              uri:
                profile?.avatar ||
                profile?.image ||
                'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
            }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 999,
            }}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.editAvatarBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
              <Path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                stroke="#8FAF78"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="#8FAF78"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </Animated.View>

        {/* ================================================= */}
        {/* NAME */}
        {/* ================================================= */}

        <Animated.Text style={[styles.heroName, nameStyle]}>
          {profile?.name || profile?.fullName || profile?.displayName || 'User'}
        </Animated.Text>

        {/* ================================================= */}
        {/* PROFILE INFO */}
        {/* ================================================= */}

        <Animated.View style={[styles.heroInfo, heroInfoStyle]}>
          <Text style={styles.heroHandle}>
            @{profile?.username || profile?.userName || 'healthyu'}
            {'  '}·{'  '}
            Member since {memberSince}
          </Text>

          {/* ================================================= */}
          {/* PROFILE STATS */}
          {/* ================================================= */}

          <View style={styles.statRow}>
            {PROFILE_STATS.map((item, index) => (
              <React.Fragment key={index}>
                <StatPill label={item?.label} value={item?.value} />

                {index < PROFILE_STATS.length - 1 && (
                  <View style={styles.statDivider} />
                )}
              </React.Fragment>
            ))}
          </View>
        </Animated.View>
      </View>

      {/* ================================================= */}
      {/* BOTTOM SHEET */}
      {/* ================================================= */}

      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* ================================================= */}
        {/* HANDLE */}
        {/* ================================================= */}

        <GestureDetector gesture={panGesture}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
        </GestureDetector>

        {/* ================================================= */}
        {/* TABS */}
        {/* ================================================= */}

        <TabBar currentIndex={currentTabIndex} onPress={setCurrentTabIndex} />

        {/* ================================================= */}
        {/* FEEDS */}
        {/* ================================================= */}

        {currentTabIndex === 0 && (
          <FlatList
            data={posts || []}
            renderItem={renderFeed}
            keyExtractor={(item, index) =>
              item?.id?.toString() || index.toString()
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedList}
            ListEmptyComponent={() => (
              <View
                style={{
                  alignItems: 'center',
                  marginTop: 40,
                }}
              >
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: fontFamily.montserratMedium,
                  }}
                >
                  No posts yet
                </Text>
              </View>
            )}
          />
        )}

        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        {currentTabIndex === 1 && (
          <FlatList
            data={[{ key: 'stats' }]}
            renderItem={() => (
              <StatsTab statsData={ACTIVITY_STATS_DYNAMIC || []} />
            )}
            keyExtractor={(item, index) => item?.key || index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedList}
          />
        )}

        {/* ================================================= */}
        {/* PROGRESS */}
        {/* ================================================= */}

        {currentTabIndex === 2 && (
          <FlatList
            data={[{ key: 'progress' }]}
            renderItem={() => (
              <ProgressTab
                selectedHabit={selectedHabit}
                setSelectedHabit={setSelectedHabit}
                availableHabits={AVAILABLE_HABITS}
                weeklyData={getHabitWeeklyData(selectedHabit)}
              />
            )}
            keyExtractor={(item, index) => item?.key || index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedList}
          />
        )}
      </Animated.View>
    </GestureHandlerRootView>
  );
}
// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
  },

  // Hero
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.dark,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 8,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.dark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    color: colors.white,
    fontSize: 22,
    lineHeight: 26,
    fontFamily: fontFamily.montserratSemiBold,
  },
  navTitle: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
  },

  heroContent: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  avatarWrap: {
    borderWidth: 3,
    borderColor: colors.secondary,
    marginBottom: 8,
  },
  heroName: {
    color: colors.white,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 2,
    textAlign: 'center',
  },
  heroInfo: {
    width: '100%',
    alignItems: 'center',
  },
  heroHandle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 12,
  },

  // Stat pills
  statRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 10,
    width: '100%',
    marginBottom: 12,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
    lineHeight: 20,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },
  progressContainer: {
    paddingTop: 6,
    paddingBottom: 30,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  progressTitle: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
  },

  progressSubtitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    marginTop: 4,
    fontFamily: fontFamily.montserratMedium,
  },

  progressBadge: {
    backgroundColor: 'rgba(143,175,120,0.14)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
  },

  progressBadgeText: {
    color: colors.secondary,
    fontFamily: fontFamily.montserratBold,
    fontSize: 13,
  },

  habitSelectorList: {
    paddingBottom: 18,
    gap: 10,
  },

  habitChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 82,
  },

  habitChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },

  habitEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },

  habitLabel: {
    color: colors.white,
    fontSize: 11,
    fontFamily: fontFamily.montserratSemiBold,
  },

  habitLabelActive: {
    color: colors.dark,
  },

  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 18,
  },

  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  chartTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratBold,
  },

  chartValue: {
    color: colors.secondary,
    fontSize: 22,
    fontFamily: fontFamily.montserratBold,
  },

  barChartModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
  },

  barColumn: {
    alignItems: 'center',
    flex: 1,
  },

  barTopValue: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginBottom: 8,
    fontFamily: fontFamily.montserratSemiBold,
  },

  barTrackModern: {
    width: 26,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  barFillModern: {
    width: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 20,
  },

  barDay: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    marginTop: 10,
    fontFamily: fontFamily.montserratMedium,
  },
  // CTA buttons
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btnFollow: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnFollowText: {
    color: colors.dark,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
  btnMessage: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btnMessageText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },

  // Bottom sheet
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A2219',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  handleWrap: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  handle: {
    width: width * 0.12,
    height: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: colors.secondary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
    color: 'rgba(255,255,255,0.4)',
  },
  tabTextActive: {
    color: colors.dark,
  },

  feedList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // Stats tab
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 8,
  },
  statsCard: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
    alignItems: 'flex-start',
  },
  statsEmoji: { fontSize: 22, marginBottom: 8 },
  statsCardValue: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 3,
  },
  statsCardLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },

  // Progress tab
  progressTitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 2,
  },
  barChart: {
    flexDirection: 'row',
    // height: 110,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: 16,
    marginTop: 10,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    height: 100,
    width: '70%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 6,
  },
  barLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 5,
  },
  progressBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progressBadge: {
    backgroundColor: 'rgba(143,175,120,0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  progressBadgeText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
