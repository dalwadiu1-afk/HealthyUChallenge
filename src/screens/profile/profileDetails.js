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
import { LineChart } from 'react-native-chart-kit';

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
import { Header, Wrapper } from '../../components';
import moment from 'moment';
import { logo } from '../../assets/images';

const userId = auth().currentUser?.uid;
// const currentMonthKey = 'June_2026';
const currentMonthKey = moment().format('MMMM_YYYY');
const { height, width } = Dimensions.get('window');
const SHEET_MIN = height * 0.6;
const SHEET_MAX = height * 0.86;

const TAB_OPTIONS = ['Feeds', 'Stats'];
// const TAB_OPTIONS = ['Feeds', 'Stats', 'Progress'];

// ─── Sub-components ───────────────────────────────────────────────────────────

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

const buildHabitChartData = (habitKey, habits, monthKey = currentMonthKey) => {
  const data = habits?.[habitKey]?.[monthKey] || {};
  const parseValue = val => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const match = String(val).match(/[\d.]+/);
    return match ? Number(match[0]) : 0;
  };

  const daysObj = data?.days || {};
  const weeksObj = data?.weeks || {};

  console.log('data :>> ', daysObj);
  // =========================
  // DAILY (UNCHANGED LOGIC)
  // =========================
  const dailyMap = new Map(
    Object.entries(daysObj).map(([date, item]) => [
      date,
      item?.uri ? 1 : parseValue(item?.progress || item?.sleep || item?.count),
    ]),
  );

  const daily = Array.from({ length: 7 }).map((_, i) => {
    const d = moment().subtract(6 - i, 'days');
    const key = d.format('YYYY-MM-DD');

    return {
      date: key,
      label: `${d.format('DD')}`,
      value: dailyMap.get(key) || 0,
    };
  });

  // =========================
  // WEEKLY (FIXED)
  // =========================

  const weekValueMap = new Map();

  Object.entries(weeksObj).forEach(([weekKey, week]) => {
    let value = 0;

    // 🥇 CARDIO PRIORITY (IMPORTANT FIX)
    // cardio should ALWAYS use totalMinutes
    if (week?.totalMinutes !== undefined) {
      value = Number(week.totalMinutes);
    }

    // ARRAY TYPE
    else if (Array.isArray(week)) {
      value = week.length;
    }

    // SESSIONS TYPE (non-cardio trackers)
    else if (week?.sessions !== undefined) {
      value = Number(week.sessions);
    }

    // PHOTO ARRAY TYPE
    else if (week?.workoutPhotos?.length) {
      value = week.workoutPhotos.length;
    }

    // DAYS OBJECT TYPE
    else if (week?.days) {
      value = Object.keys(week.days || {}).length;
    }

    // WEIGHT TYPE (optional tracker)
    else if (week?.weight !== undefined) {
      value = Number(data?.goal || 0);
    }

    // GENERIC FALLBACK
    else {
      value = Object.keys(week || {}).length;
    }

    weekValueMap.set(weekKey, value);
  });

  const weekKeys = Object.keys(weeksObj);

  if (weekKeys.length === 0) {
    return {
      type: 'daily',
      daily,
      weekly: [],
    };
  }

  // Sort weeks properly (W1, W2, W3...)
  const sortedWeeks = Object.entries(weeksObj).sort((a, b) => {
    const aNum = Number(a[0].replace(/\D/g, '')) || 0;
    const bNum = Number(b[0].replace(/\D/g, '')) || 0;
    return aNum - bNum;
  });

  const values = sortedWeeks.map(([_, week]) => {
    // 🥇 CARDIO FIRST
    if (week?.totalMinutes !== undefined) {
      return Number(week.totalMinutes);
    }

    // ARRAY TYPE
    if (Array.isArray(week)) {
      return week.length;
    }

    // SESSIONS TYPE
    if (week?.sessions !== undefined) {
      return Number(week.sessions);
    }

    // PHOTO TYPE
    if (week?.workoutPhotos?.length) {
      return week.workoutPhotos.length;
    }

    // DAYS TYPE
    if (week?.days) {
      return Object.keys(week.days || {}).length;
    }

    // WEIGHT TYPE
    if (week?.weight !== undefined) {
      return Number(data?.goal || 0);
    }

    // FALLBACK
    return Object.keys(week || {}).length || 0;
  });

  // minimum 4 bars so UI never collapses
  const weekly = Array.from({
    length: Math.max(values.length, 4),
  }).map((_, i) => ({
    label: `W${i + 1}`,
    value: values[i] || 0,
  }));

  return {
    type:
      weekKeys.length && Object.keys(daysObj).length
        ? 'mixed'
        : weekKeys.length
        ? 'weekly'
        : 'daily',
    daily,
    weekly,
  };
};

function ProgressTab({
  badges,
  availableHabits = [],
  selectedHabit,
  setSelectedHabit,
  habitTargets = {},
  habits,
  currentMonthKey,
  chartMode,
  setChartMode,
}) {
  const HABIT_META = {
    fiber: { emoji: '🥦', label: 'Fiber' },
    sleep: { emoji: '😴', label: 'Sleep' },
    fitness: { emoji: '💪', label: 'Fitness' },
    beverage: { emoji: '🥤', label: 'Beverage' },
    dailyFruits: { emoji: '🍎', label: 'Fruits' },
    snacks: { emoji: '🍪', label: 'Snacks' },
    cardio: { emoji: '🏃', label: 'Cardio' },
    sugarIntake: { emoji: '🍬', label: 'Sugar' },
    weightChallenge: { emoji: '⚖️', label: 'Weight' },
  };

  // ✅ SAFE BUILD (critical fix)
  const chartPack =
    typeof buildHabitChartData === 'function'
      ? buildHabitChartData(selectedHabit, habits, currentMonthKey)
      : { type: 'daily', daily: [], weekly: [] };

  const isMixed = chartPack?.type === 'mixed';

  // ✅ SAFE MODE
  const effectiveMode =
    chartPack?.type === 'weekly'
      ? 'weekly'
      : chartPack?.type === 'daily'
      ? 'daily'
      : chartMode === 'weekly'
      ? 'weekly'
      : 'daily';

  // ✅ SAFE DATA (THIS IS WHAT FIXES BLANK CHART)
  const chartData =
    effectiveMode === 'weekly'
      ? chartPack?.weekly || []
      : chartPack?.daily || [];

  // 🔥 fallback if empty (prevents blank UI)
  const safeChartData =
    Array.isArray(chartData) && chartData.length > 0
      ? chartData
      : Array.from({ length: 7 }).map((_, i) => ({
          label: `D${i + 1}`,
          value: 0,
        }));

  const values = safeChartData.map(v => Number(v?.value) || 0);

  const rawTarget = habitTargets?.[selectedHabit];

  const targetValue = (() => {
    const num =
      typeof rawTarget === 'number'
        ? rawTarget
        : parseFloat(String(rawTarget).match(/[\d.]+/)?.[0]);

    return Number.isFinite(num) ? num : 8; // 👈 FINAL fallback = 8
  })();

  const MAX_BAR_HEIGHT = 120;

  return (
    <View style={styles.progressContainer}>
      {/* ================= TOGGLE ================= */}
      {isMixed && (
        <View style={styles.modeToggle}>
          <TouchableOpacity
            onPress={() => setChartMode('daily')}
            style={[styles.modeBtn, chartMode === 'daily' && styles.modeActive]}
          >
            <Text style={styles.modeText}>Daily</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setChartMode('weekly')}
            style={[
              styles.modeBtn,
              chartMode === 'weekly' && styles.modeActive,
            ]}
          >
            <Text style={styles.modeText}>Weekly</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= HEADER ================= */}
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>
            {effectiveMode === 'weekly' ? 'Weekly Progress' : 'Daily Progress'}
          </Text>
          <Text style={styles.chartSubtitle}>Track your habit consistency</Text>
        </View>

        <View style={styles.progressBadge}>
          <Text style={styles.progressBadgeText}>
            {values.reduce((a, b) => a + b, 0)}
          </Text>
        </View>
      </View>

      {/* ================= HABIT SELECTOR ================= */}
      <FlatList
        horizontal
        data={availableHabits}
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const active = item === selectedHabit;
          const meta = HABIT_META[item] || {
            emoji: '✨',
            label: item,
          };

          return (
            <TouchableOpacity
              onPress={() => setSelectedHabit(item)}
              style={[styles.habitChip, active && styles.habitChipActive]}
            >
              <Text style={styles.habitEmoji}>{meta.emoji}</Text>
              <Text
                style={[styles.habitLabel, active && styles.habitLabelActive]}
              >
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ================= CHART ================= */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          {HABIT_META[selectedHabit]?.emoji}{' '}
          {effectiveMode === 'weekly' ? 'Weekly Progress' : 'Daily Progress'}
        </Text>

        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <LineChart
            data={{
              labels: safeChartData.map(item => item.label),
              datasets: [
                {
                  data: safeChartData.map(item => Number(item.value) || 0),
                  color: () => colors.secondary,
                  strokeWidth: 3,
                },
              ],
            }}
            width={width - 70}
            height={250}
            withShadow={false}
            withInnerLines
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines
            fromZero
            bezier
            chartConfig={{
              backgroundGradientFrom: colors.dark,
              backgroundGradientTo: colors.dark,
              decimalPlaces: 0,

              color: () => colors.secondary,

              labelColor: () => colors.white,

              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: colors.secondary,
              },

              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: '#2d2d2d',
              },
            }}
            style={{
              borderRadius: 20,
            }}
          />
        </View>
      </View>

      <View style={styles.badgesContainer}>
        <Text style={styles.sectionTitle}>Progress Badges</Text>

        <View style={styles.badgesWrap}>
          {badges?.map((item, index) => (
            <View key={index} style={styles.badgeCard}>
              <Text style={styles.badgeEmoji}>{item.emoji}</Text>

              <Text style={styles.badgeLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function ProfileDetails({ navigation }) {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [progressMode, setProgressMode] = useState('weekly');
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

  const excludeKeys = [
    'booking',
    'newVeggie',
    'personalized goal 1',
    'personalized goal 2',
    'personalized goal 3',
    'bodyFatGoal',
    'fruits',
    'Snacks',
    'Beverage',
    'weightChallenge',
  ];

  const ALL_HABITS = Object.entries(habits || {}).filter(
    ([key]) =>
      !excludeKeys.some(
        excluded => key?.toLowerCase().trim() === excluded.toLowerCase().trim(),
      ),
  );

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
        label: 'Workout With Friend',
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
        emoji: '🧀 || 🥣',
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
        label: 'Half Plate Fruits/Veg',
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

  let currentStreak = leaderboardData?.challenge?.streak;
  let longestStreak = leaderboardData?.challenge?.longestStreak;

  // =====================================================
  // COMPLETION RATE
  // =====================================================

  const completionRate = leaderboardData?.status?.quizCompleted;

  // =====================================================
  // PROFILE STATS
  // ===========
  // ==========================================
  let remainingDays = 0;
  const TOTAL_CHALLENGE_DAYS = 30;
  const startDay = userData?.goal?.startDate;
  if (startDay) {
    const start = new Date(startDay);
    const today = new Date();

    const diffInMs = today - start;
    const daysPassed = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    remainingDays = Math.max(0, TOTAL_CHALLENGE_DAYS - daysPassed);
  }

  const PROFILE_STATS = [
    {
      label: 'Goals',
      value: `${totalGoalsCreated}`,
      emoji: '🔥',
    },
    {
      showLogo: true,
    },
    {
      label: 'Days Left of\nChallenge',
      value: remainingDays,
      emoji: '📅',
    },
  ];

  // =====================================================
  // ACTIVITY STATS
  // =====================================================

  const uniqueStatsMap = {};

  [
    {
      emoji: '🔥',
      label: 'Quiz Streak',
      value: `${currentStreak} days`,
    },

    {
      emoji: '🏆',
      label: 'Longest Streak',
      value: `${longestStreak} days`,
    },

    // {
    //   emoji: '✅',
    //   label: 'Completed Tasks',
    //   value: `${totalCompleted}`,
    // },

    // {
    //   emoji: '📈',
    //   label: 'Completion Rate',
    //   value: `${completionRate}%`,
    // },

    {
      emoji: '📸',
      label: 'Photos Uploaded',
      value: `${totalPhotos}`,
    },

    // {
    //   emoji: '🍎',
    //   label: 'Fruit Entries',
    //   value: `${totalFruitEntries}`,
    // },

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
      label: 'Strength Training Workout',
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
        ...item,
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
      isUser={userId == item?.userId || userData?.profile?.role == 'admin'}
      onDeletePress={() => deletePost(item?.id)}
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

  const getCurrentWeekDays = () => {
    const startOfWeek = moment().startOf('isoWeek');

    return Array.from({ length: 7 }).map((_, i) => {
      const date = moment(startOfWeek).add(i, 'days');

      return {
        key: date.format('YYYY-MM-DD'),
        label: date.format('ddd'),
        isToday: date.isSame(moment(), 'day'),
      };
    });
  };

  const HABIT_STRUCTURE = {
    fiber: 'days',
    sleep: 'days',
    snacks: 'days_array',
    fitness: 'weeks',
    cardio: 'weeks_days',
    fruits: 'weeks_days',
  };

  const normalizeHabitData = (habitKey, monthData) => {
    if (!monthData) return [];

    // 1. DAYS OBJECT (fiber, sleep)
    if (HABIT_STRUCTURE[habitKey] === 'days') {
      return Object.entries(monthData?.days || {}).map(([date, item]) => ({
        date,
        value: Number(item?.progress || item?.sleep || 0),
      }));
    }

    // 2. DAYS ARRAY (snacks)
    if (HABIT_STRUCTURE[habitKey] === 'days_array') {
      return (monthData?.days || []).map(item => ({
        // date: item?.date,
        // value: item?.snacks?.length || 0,
      }));
    }

    // 3. WEEKS ONLY TOTAL (fitness)
    if (HABIT_STRUCTURE[habitKey] === 'weeks') {
      return Object.values(monthData?.weeks || {}).map((week, i) => ({
        date: `W${i + 1}`,
        value: week?.workoutPhotos?.length || 0,
      }));
    }

    // 4. WEEKS + DAYS (cardio, fruits)
    if (HABIT_STRUCTURE[habitKey] === 'weeks_days') {
      const result = [];

      Object.values(monthData?.weeks || {}).forEach((week, wi) => {
        const days = week?.days || {};

        let total = 0;

        Object.entries(days).forEach(([date, item]) => {
          total += item?.count || 1;
        });

        result.push({
          date: `W${wi + 1}`,
          value: total,
        });
      });

      return result;
    }

    return [];
  };

  const getHabitWeeklyData = habitKey => {
    const monthData = habits?.[habitKey]?.[currentMonthKey];

    const raw = normalizeHabitData(habitKey, monthData);

    const weekDays = getCurrentWeekDays();

    // create map
    const map = {};

    weekDays.forEach(d => {
      map[d.key] = 0;
    });

    raw.forEach(item => {
      const key = normalizeDate(item.date);

      if (map[key] !== undefined) {
        map[key] += Number(item.value || 0);
      }
    });

    return weekDays.map(d => ({
      value: map[d.key] || 0,
      label: d.label,
      isToday: d.isToday,
      date: d.key,
    }));
  };

  // =====================================================
  // HABIT TARGETS
  // =====================================================

  const habitTargets = {};

  ALL_HABITS.forEach(([habitKey, habitValue]) => {
    const monthData = habitValue?.[currentMonthKey];

    if (!monthData) return;
    console.log('monthData?.target :>> ', monthData);
    // direct target

    // nested config target
    if (monthData?.config?.target) {
      habitTargets[habitKey] = monthData.config.target;
    }

    // sleep
    else if (habitKey === 'sleep') {
      habitTargets[habitKey] = monthData.goal || monthData.target || '8';
    }

    // fiber
    else if (habitKey === 'weightTraining') {
      habitTargets[habitKey] = monthData.goal || monthData.target || '25';
    } else if (habitKey === 'fitness') {
      habitTargets[habitKey] = monthData.goal || monthData.target || '25';
    }

    // fiber
    else if (habitKey === 'fiber') {
      habitTargets[habitKey] = monthData.goal || monthData.target || '25';
    }

    // cardio
    else if (habitKey === 'cardio') {
      habitTargets[habitKey] =
        monthData?.weeklyGoal || monthData.goal || monthData.target || '5';
    }

    // beverage
    else if (habitKey === 'beverage') {
      habitTargets[habitKey] =
        monthData?.dailyGoal || monthData.goal || monthData.target || '8';
    } else if (monthData?.target) {
      habitTargets[habitKey] = monthData.goal || monthData.target;
    }
  });

  const deletePost = async postId => {
    try {
      if (!postId) return;

      await database().ref(`/posts/${postId}`).remove();

      console.log('Post deleted:', postId);
    } catch (error) {
      console.log('Delete error:', error);
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <Header
        header={'Profile Details'}
        headerContainer={{
          paddingHorizontal: 23,
        }}
        textStyle={[styles.navTitle, navTitleStyle]}
        showRightBtn
      />

      <View style={styles.heroContent}>
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
            {profile?.username || profile?.userName || 'healthyu'}
            {'  '}·{'  '}
            Member since {moment(memberSince).format('YYYY')}
          </Text>

          {/* ================================================= */}
          {/* PROFILE STATS */}
          {/* ================================================= */}

          <View style={styles.statRow}>
            {PROFILE_STATS.map((item, index) => (
              <View key={index} style={styles.statItem}>
                {item?.showLogo ? (
                  <Image
                    source={logo}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                ) : (
                  <>
                    <Text style={styles.statEmoji}>{item?.emoji}</Text>
                    <Text
                      style={styles.statValue}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {item.value}
                    </Text>
                    <Text style={styles.statLabel}>{item?.label}</Text>
                  </>
                )}
              </View>
            ))}
          </View>
        </Animated.View>
      </View>

      {/* ================================================= */}
      {/* BOTTOM SHEET */}
      {/* ================================================= */}
      <Wrapper
        safeAreaPops={{ edges: ['top'] }}
        scrollEnable={false}
        disableLayout
        containerStyle={{ flex: 1 }}
      >
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
                  mode={progressMode}
                  setMode={setProgressMode}
                  selectedHabit={selectedHabit}
                  setSelectedHabit={setSelectedHabit}
                  availableHabits={AVAILABLE_HABITS}
                  weeklyData={getHabitWeeklyData(selectedHabit)}
                  habitTargets={habitTargets}
                  habits={habits}
                  badges={PROGRESS_BADGES}
                />
              )}
              keyExtractor={(item, index) => item?.key || index.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.feedList}
            />
          )}
        </Animated.View>
      </Wrapper>
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
  badgesContainer: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 14,
  },

  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  badgeLabel: {
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
    marginLeft: 10,
  },

  badgeCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    height: height / 20,
    width: height / 20,
    borderRadius: 50,
  },
  statEmoji: { fontSize: 18, marginBottom: 4 },
  statValue: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
    lineHeight: 22,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontFamily: fontFamily.montserratMedium,
    marginTop: 2,
    textAlign: 'center',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
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
    marginRight: 10,
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
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },

  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },

  modeActive: {
    backgroundColor: '#8FAF78',
  },

  modeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },

  modeTextActive: {
    color: '#000',
  },
  barFillModern: {
    width: '100%',

    borderRadius: 20,
  },
  targetText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: fontFamily?.montserratMedium,
  },

  barValueText: {
    fontSize: 10,
    color: '#fff',
    textAlign: 'center',
    fontFamily: fontFamily?.montserratSemiBold,
  },
  barDay: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    marginTop: 10,
    fontFamily: fontFamily.montserratMedium,
    textAlign: 'center',
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
    backgroundColor: 'rgba(14, 39, 5, 0.4)',
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

  barChartModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    marginTop: 10,
  },

  barColumn: {
    alignItems: 'center',
    flex: 1,
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
    borderRadius: 20,
  },

  barDay: {
    fontSize: 10,
    marginTop: 8,
    color: 'rgba(255,255,255,0.35)',
    fontFamily: fontFamily.montserratMedium,
  },

  emptyBarText: {
    alignSelf: 'center',
    marginTop: 8,
    fontSize: 9,
    color: 'rgba(255,255,255,0.25)',
    fontFamily: fontFamily.montserratSemiBold,
  },

  innerBarText: {
    color: colors.dark,
    fontSize: 9,
    textAlign: 'center',
    fontFamily: fontFamily.montserratBold,
    marginTop: 5,
  },

  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  chartTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratBold,
  },

  chartSubtitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    marginTop: 4,
    fontFamily: fontFamily.montserratMedium,
  },

  progressBadge: {
    backgroundColor: 'rgba(143,175,120,0.14)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
  },

  progressBadgeText: {
    color: colors.secondary,
    fontFamily: fontFamily.montserratBold,
  },
});
