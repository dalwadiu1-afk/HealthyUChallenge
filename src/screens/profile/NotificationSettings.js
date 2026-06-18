import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import moment from 'moment';
import { Header, Wrapper } from '../../components';
import { colors, fontFamily } from '../../constant';

/* =========================
   ALL 21 HABITS (YOUR DATA)
========================= */
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

export default function NotificationSettings() {
  const userId = auth()?.currentUser?.uid;
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [habitSettings, setHabitSettings] = useState({});
  const [quiz, setQuiz] = useState({
    enabled: true,
    time: '12:00',
  });
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeKey, setActiveKey] = useState(null);

  /* =========================
     LOAD USER DATA
  ========================= */
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const leaderboardSnap = await database().ref(`/leaderboards`).once('value');
    const leaderboard = leaderboardSnap.val() || null;
    const snap = await database().ref(`/users/${uid}`).once('value');
    const data = snap.val() || {};

    const normalizedGoals = (data?.goal?.selectedGoals || []).map(g =>
      typeof g === 'string' ? { key: g } : g,
    );
    setSelectedGoals(normalizedGoals);
    setHabitSettings(data?.notificationSettings?.habits || {});
    setLeaderboardData(leaderboard);
    getUserRank(leaderboard, userId);
    setQuiz(
      data?.notificationSettings?.quizReminder || {
        enabled: true,
        time: '12:00',
      },
    );
  };

  const getUserRank = (leaderboards, userId) => {
    if (!leaderboards || !userId) return null;

    // 1. Normalize users from RTDB object
    const users = Object.entries(leaderboards).map(([key, data]) => {
      // Firebase key is ALWAYS reliable uid
      const uid = key;
      console.log('data :>> ', data);
      const points = data?.challenge?.totalChallengePoints ?? data?.points ?? 0;

      return { uid, points };
    });

    // 2. Sort: points DESC, then uid ASC (stable ranking)
    users.sort((a, b) => {
      if (b.points === a.points) {
        return a.uid.localeCompare(b.uid);
      }
      return b.points - a.points;
    });
    console.log('users :>> ', users);

    // 3. Find rank
    const rankIndex = users.findIndex(u => u.uid === userId);

    if (rankIndex === -1) return null;

    const rank = rankIndex + 1;

    setLeaderboardData(prev => ({
      ...(prev || {}),
      rank,
    }));

    return rank;
  };
  /* =========================
     MAP SELECTED GOALS → FULL HABITS
  ========================= */
  const userHabits = selectedGoals
    .map(goal => {
      const key = typeof goal === 'string' ? goal : goal.key;
      return ALL_HABITS.find(h => h.key === key);
    })
    .filter(Boolean);

  /* =========================
     UPDATE HABIT SETTINGS
  ========================= */
  const updateHabit = (key, field, value) => {
    setHabitSettings(prev => ({
      ...prev,
      [key]: {
        enabled: true,
        time: '12:00',
        ...prev[key],
        [field]: value,
      },
    }));
  };

  /* =========================
     SAVE
  ========================= */
  const save = async () => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    await database().ref(`/users/${uid}/notificationSettings`).set({
      quizReminder: quiz,
      habits: habitSettings,
    });
  };

  /* =========================
     OPEN TIME PICKER
  ========================= */
  const openPicker = key => {
    setActiveKey(key);
    setPickerVisible(true);
  };

  const onTimeChange = (event, date) => {
    if (Platform.OS !== 'ios') setPickerVisible(false);
    if (!date) return;

    const time = moment(date).format('HH:mm');

    if (activeKey === 'quiz') {
      setQuiz(prev => ({ ...prev, time }));
    } else {
      updateHabit(activeKey, 'time', time);
    }
  };

  const HABIT_UI_CONFIG = {
    booking: {
      emoji: '🩺',
      titleColor: '#60A5FA',
      message:
        'Your health starts with guidance — book your nutrition session today.',
      accent: '#60A5FA',
      bg: 'rgba(96,165,250,0.10)',
    },

    steps: {
      emoji: '🚶',
      titleColor: '#7EE081',
      message: 'Step up your day — every step counts toward a stronger you.',
      accent: '#7EE081',
      bg: 'rgba(126,224,129,0.10)',
    },

    fiber: {
      emoji: '🥗',
      titleColor: '#34D399',
      message: 'Feed your gut, fuel your energy, feel lighter every day.',
      accent: '#34D399',
      bg: 'rgba(52,211,153,0.10)',
    },

    sleep: {
      emoji: '😴',
      titleColor: '#A78BFA',
      message: 'Rest deeply — your body repairs while you sleep.',
      accent: '#A78BFA',
      bg: 'rgba(167,139,250,0.10)',
    },

    fitness: {
      emoji: '🏃‍♂️',
      titleColor: '#3B82F6',
      message: 'Consistency beats intensity — show up for your fitness class.',
      accent: '#3B82F6',
      bg: 'rgba(59,130,246,0.10)',
    },

    weightTraining: {
      emoji: '🏋️',
      titleColor: '#FBBF24',
      message: 'Lift today, grow stronger tomorrow — build your foundation.',
      accent: '#FBBF24',
      bg: 'rgba(251,191,36,0.10)',
    },

    weightChallenge: {
      emoji: '⚖️',
      titleColor: '#FB7185',
      message: 'Slow progress is still progress — stay on your safe path.',
      accent: '#FB7185',
      bg: 'rgba(251,113,133,0.10)',
    },

    halfPlateChallenge: {
      emoji: '🥦',
      titleColor: '#84CC16',
      message: 'Half your plate, full nutrition — color your health today.',
      accent: '#84CC16',
      bg: 'rgba(132,204,22,0.10)',
    },

    meatLess: {
      emoji: '🌱',
      titleColor: '#22C55E',
      message: 'One meat-free day can reset your body and energy.',
      accent: '#22C55E',
      bg: 'rgba(34,197,94,0.10)',
    },

    fermentedFood: {
      emoji: '🦠',
      titleColor: '#14B8A6',
      message: 'Good bacteria = good mood — nourish your gut today.',
      accent: '#14B8A6',
      bg: 'rgba(20,184,166,0.10)',
    },

    bodyFatGoal: {
      emoji: '📉',
      titleColor: '#F43F5E',
      message: 'Progress is invisible daily, but powerful over time.',
      accent: '#F43F5E',
      bg: 'rgba(244,63,94,0.10)',
    },

    newVeggie: {
      emoji: '🥕',
      titleColor: '#F97316',
      message: 'Try something new — your body loves variety.',
      accent: '#F97316',
      bg: 'rgba(249,115,22,0.10)',
    },

    sugarIntake: {
      emoji: '🚫',
      titleColor: '#EF4444',
      message: 'Less sugar, more energy — protect your long-term health.',
      accent: '#EF4444',
      bg: 'rgba(239,68,68,0.10)',
    },

    exWithFriend: {
      emoji: '🤝',
      titleColor: '#6366F1',
      message: 'Work out together — motivation multiplies with friends.',
      accent: '#6366F1',
      bg: 'rgba(99,102,241,0.10)',
    },

    cardio: {
      emoji: '❤️',
      titleColor: '#EC4899',
      message: 'Push your heart — cardio builds endurance for life.',
      accent: '#EC4899',
      bg: 'rgba(236,72,153,0.10)',
    },

    beverage: {
      emoji: '🥤',
      titleColor: '#06B6D4',
      message: 'Hydrate smart — skip sugar drinks, choose energy.',
      accent: '#06B6D4',
      bg: 'rgba(6,182,212,0.10)',
    },

    snacks: {
      emoji: '🍎',
      titleColor: '#F59E0B',
      message: 'Smart snacking = steady energy throughout the day.',
      accent: '#F59E0B',
      bg: 'rgba(245,158,11,0.10)',
    },

    dailyFruits: {
      emoji: '🍓',
      titleColor: '#EF4444',
      message: 'Nature’s candy fuels your body better than anything else.',
      accent: '#EF4444',
      bg: 'rgba(239,68,68,0.10)',
    },

    PersonalisedGoal1: {
      emoji: '🎯',
      titleColor: '#8B5CF6',
      message: 'Your personal goal matters — stay focused and committed.',
      accent: '#8B5CF6',
      bg: 'rgba(139,92,246,0.10)',
    },

    PersonalisedGoal2: {
      emoji: '🔥',
      titleColor: '#F97316',
      message: 'Keep pushing your personal challenge — you set the rules.',
      accent: '#F97316',
      bg: 'rgba(249,115,22,0.10)',
    },

    PersonalisedGoal3: {
      emoji: '🚀',
      titleColor: '#0EA5E9',
      message: 'This is your journey — stay consistent and go beyond limits.',
      accent: '#0EA5E9',
      bg: 'rgba(14,165,233,0.10)',
    },

    default: {
      emoji: '🔔',
      titleColor: '#8FAF78',
      message: 'Stay consistent — small habits build big results.',
      accent: '#8FAF78',
      bg: 'rgba(143,175,120,0.10)',
    },
  };

  /* =========================
     UI
  ========================= */
  return (
    <View style={{backgroundColor:colors.dark ,flex:1,}}>
<Header
  header="Reminders"
  headerContainer={{ paddingHorizontal: 23 }}
  SafeAreaViewProps={{ edges: [] }}
/>
    <Wrapper>
      <ScrollView style={{}}>
        {/* ================= QUIZ ================= */}
        <View style={styles.quizCard}>
          {/* TOP HEADER */}
          <View style={styles.quizHeader}>
            <View style={styles.quizIconWrap}>
              <Text style={styles.quizIcon}>🧠</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.quizTitle}>Daily Brain Challenge</Text>
              <Text style={styles.quizSubtitle}>
                Compete, learn & climb the leaderboard
              </Text>
            </View>

            <View style={styles.quizBadge}>
              <Text style={styles.quizBadgeText}>XP +50</Text>
            </View>
          </View>
          {console.log('leaderboardData >> ', leaderboardData)}
          {/* LEADERBOARD STRIP (fake preview UI) */}
          <View style={styles.leaderboardRow}>
            <Text style={styles.leaderText}>
              🏆 Your Rank: {leaderboardData?.rank || '#12'}
            </Text>
            <Text style={styles.leaderText}>
              🔥Quiz Streak: {leaderboardData?.[userId]?.challenge?.streak || 0}{' '}
              attended
            </Text>
          </View>

          {/* SWITCH ROW */}
          <View style={styles.quizRow}>
            <Text style={styles.quizLabel}>Enable Quiz Challenge</Text>

            <Switch
              value={quiz.enabled}
              onValueChange={val =>
                setQuiz(prev => ({ ...prev, enabled: val }))
              }
              trackColor={{ false: '#2C2C2C', true: '#7C3AED' }}
              thumbColor={quiz.enabled ? '#A78BFA' : '#999'}
            />
          </View>

          {/* TIME PICKER BUTTON */}
          <TouchableOpacity
            style={styles.quizTimeBtn}
            onPress={() => openPicker('quiz')}
            activeOpacity={0.8}
          >
            <Text style={styles.quizTimeIcon}>⏰</Text>

            <Text style={styles.quizTimeText}>
              {moment(quiz.time, 'HH:mm').format('hh:mm A')}
            </Text>

            <Text style={styles.quizTimeHint}>Tap to change schedule</Text>
          </TouchableOpacity>

          {/* BOTTOM MOTIVATION STRIP */}
          <View style={styles.quizFooter}>
            <Text style={styles.quizFooterText}>
              🧩 1 quiz daily = faster leaderboard climb
            </Text>
          </View>
        </View>

        {/* ================= HABITS ================= */}
        <Text style={styles.sectionTitle}>Your Selected Habits (3 Max)</Text>

        {userHabits.map(habit => {
          const config = habitSettings?.[habit.key] || {
            enabled: true,
            time: '12:00',
          };

          const ui = HABIT_UI_CONFIG[habit.key] || HABIT_UI_CONFIG.default;

          return (
            <View
              key={habit.key}
              style={[
                styles.card,
                { backgroundColor: ui.bg, borderColor: ui.accent },
              ]}
            >
              {/* HEADER */}
              <View style={styles.headerRow}>
                <Text style={styles.emoji}>{ui.emoji}</Text>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: ui.titleColor }]}>
                    {habit.title}
                  </Text>

                  <Text style={styles.desc}>{habit.description}</Text>
                </View>
              </View>

              {/* UNIQUE MESSAGE */}
              <View style={[styles.messageBox, { borderColor: ui.accent }]}>
                <Text style={[styles.messageText, { color: ui.accent }]}>
                  {ui.message}
                </Text>
              </View>

              {/* ENABLE */}
              <View style={styles.row}>
                <Text
                  style={{
                    color: '#fff',
                    fontFamily: fontFamily.montserratMedium,
                  }}
                >
                  Enable Reminder
                </Text>

                <Switch
                  value={config.enabled}
                  onValueChange={val => updateHabit(habit.key, 'enabled', val)}
                  trackColor={{
                    false: '#444',
                    true: ui.accent,
                  }}
                />
              </View>

              {/* TIME */}
              <TouchableOpacity
                disabled={!config.enabled}
                style={[styles.timeBtn, { borderColor: ui.accent }]}
                onPress={() => openPicker(habit.key)}
              >
                <Text style={[styles.timeText, { color: ui.accent }]}>
                  {moment(config.time, 'HH:mm').format('hh:mm A')}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* ================= SAVE ================= */}
        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Text
            style={{ color: '#fff', fontFamily: fontFamily.montserratBold }}
          >
            Save Settings
          </Text>
        </TouchableOpacity>

        {/* ================= PICKER ================= */}
        {pickerVisible && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onValueChange={onTimeChange}
          />
        )}
      </ScrollView>
    </Wrapper>
    </View>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  title: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
  },

  message: {
    marginTop: 6,
    color: '#8FAF78',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  timeBtn: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },

  timeText: {
    color: '#8FAF78',
    fontFamily: fontFamily.montserratSemiBold,
  },

  saveBtn: {
    marginTop: 20,
    backgroundColor: '#8FAF78',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  sectionTitle: {
    color: '#fff',
    marginVertical: 10,
    fontSize: 13,
    opacity: 0.7,
    fontFamily: fontFamily.montserratMedium,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  emoji: {
    fontSize: 28,
    marginRight: 10,
  },

  messageBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    fontFamily: fontFamily.montserratSemiBold,
  },

  messageText: {
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors?.white,
  },

  desc: {
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors?.white,
  },

  quizCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    backgroundColor: 'rgba(124,58,237,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
    overflow: 'hidden',
  },

  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  quizIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  quizIcon: {
    fontSize: 22,
  },

  quizTitle: {
    color: '#C4B5FD',
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
  },

  quizSubtitle: {
    color: '#A78BFA',
    fontSize: 12,
    marginTop: 4,
    fontFamily: fontFamily.montserratRegular,
  },

  quizBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fontFamily.montserratSemiBold,
  },

  leaderText: {
    color: '#DDD6FE',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },

  quizLabel: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },

  quizTimeText: {
    color: '#C4B5FD',
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },

  quizTimeHint: {
    color: '#A78BFA',
    fontSize: 10,
    marginTop: 2,
    fontFamily: fontFamily.montserratRegular,
  },

  quizFooterText: {
    color: '#A78BFA',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },
});
