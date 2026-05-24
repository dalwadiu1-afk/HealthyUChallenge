import { PermissionsAndroid, Platform, Dimensions } from 'react-native';
import moment from 'moment';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

const user = auth().currentUser;

const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;
const { width, height } = Dimensions.get('window');
const monthKey = moment().format('MMMM_YYYY');

const scale = size => (width / guidelineBaseWidth) * size;

const generateTimeSlots = (start = 10, end = 12) => {
  const slots = [];

  for (let hour = start; hour <= end; hour++) {
    slots.push(moment({ hour }).format('hh:00 A'));
  }

  return slots;
};

const generateDaysFromToday = (
  numDays = 30,
  timeRange = { from: 10, to: 13 },
) => {
  const daysArray = [];

  for (let i = 0; i < numDays; i++) {
    const currentDay = moment().add(i, 'days');

    daysArray.push({
      label: currentDay.format('ddd'),
      date: currentDay.format('DD'),
      fullDate: currentDay.format('YYYY-MM-DD'),
      timeSlots: generateTimeSlots(timeRange.from, timeRange.to),
    });
  }

  return daysArray;
};

const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);

    if (granted['android.permission.CAMERA'] === 'granted') {
      return true;
    } else {
      console.log('Permission denied');
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

const getSmartTips = fiberData => {
  if (!fiberData?.length) return [];

  const avg = fiberData.reduce((sum, d) => sum + d.fiber, 0) / fiberData.length;

  const lowDays = fiberData.filter(d => d.fiber < 25).length;

  if (avg < 20 || lowDays > 3) {
    return [
      'You are below fiber target — increase vegetables daily',
      'Eat oats or overnight oats for high fiber breakfast',
      'Add chia or flax seeds to meals or smoothies',
      'Eat apples with skin for extra fiber',
      'Include lentils, beans, and other legumes regularly',
      'Switch to whole grains instead of refined grains',
      'Eat a variety of vegetables like broccoli and carrots daily',
    ];
  }

  if (avg >= 25 && avg <= 35) {
    return [
      'Great consistency! Keep your fiber intake steady',
      'Try adding variety with fruits and vegetables',
    ];
  }

  return [
    'Balance your fiber intake with hydration',
    'Maintain daily vegetable intake',
  ];
};

const calculateStreak = (days = {}) => {
  console.log('days :>> ', days);
  const completedDates = Object.keys(days)
    .filter(date => days[date]?.completed)
    .map(date => new Date(date))
    .sort((a, b) => a - b);

  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const normalize = d => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };

  const dates = completedDates.map(normalize);

  // -----------------------
  // LONGEST STREAK
  // -----------------------
  let longest = 1;
  let temp = 1;

  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      temp++;
    } else {
      longest = Math.max(longest, temp);
      temp = 1;
    }
  }

  longest = Math.max(longest, temp);

  // -----------------------
  // CURRENT STREAK (from today)
  // -----------------------
  let current = 0;

  let today = new Date();
  today.setHours(0, 0, 0, 0);
  let check = today.getTime();

  const set = new Set(dates);

  // if today not completed, check yesterday
  if (!set.has(check)) {
    check -= 86400000; // go to yesterday
  }

  while (set.has(check)) {
    current++;
    check -= 86400000;
  }

  return {
    currentStreak: current,
    longestStreak: longest,
  };
};

export const calculateUserStats = user => {
  if (!user) return null;

  const habits = user?.habits || {};

  const year = new Date().getFullYear();

  const days = habits?.[monthKey]?.days || {};

  const allDays = Object.values(days);

  const activeDays = allDays.length;

  const completedDays = allDays.filter(d => d?.completed).length;

  const completionRate =
    activeDays > 0 ? Math.round((completedDays / activeDays) * 100) : 0;

  const { currentStreak, longestStreak } = calculateStreak(days);

  return {
    activeDays,
    completionRate,
    streak: currentStreak,
    longestStreak,
    completedDays: completedDays,
  };
};

const calculateGoalDifficulty = userData => {
  if (!userData) return 1;

  const target = Number(userData?.goal?.selectedGoal || 0);
  const category = userData?.habits?.[monthKey]?.title || '';

  let score = 0;

  switch (category) {
    case 'Fiber Intake':
      // extract numbers from "25-38g"
      const numbers = category.match(/\d+/g)?.map(Number) || [];

      const target = Math.max(...numbers, 0);
      if (target <= 20) score = 1;
      else if (target <= 35) score = 2;
      else if (target == 35) score = 3;
      else score = 3;
      break;

    case 'steps':
      if (target <= 5000) score = 1;
      else if (target <= 12000) score = 2;
      else score = 3;
      break;

    case 'workout':
      // mins/day
      if (target <= 20) score = 1;
      else if (target <= 60) score = 2;
      else score = 3;
      break;

    case 'reading':
      if (target <= 10) score = 1;
      else if (target <= 30) score = 2;
      else score = 3;
      break;

    case 'weightLoss':
      // kg target/month
      if (target <= 2) score = 1;
      else if (target <= 5) score = 2;
      else score = 3;
      break;

    default:
      // generic fallback
      if (target <= 10) score = 1;
      else if (target <= 50) score = 2;
      else score = 3;
  }

  return score;
};

const syncUserLeaderboardPoints = async (uid, userData) => {
  if (!uid || !userData) return;

  const stats = userData?.stats || {};

  const totalHabitsDone = Number(stats?.totalHabitsDone || 0);
  const streak = Number(stats?.streak || 0);
  const longestStreak = Number(stats?.longestStreak || 0);
  const activeDays = Number(stats?.activeDays || 0);
  const completionRate = Number(stats?.completionRate || 0);

  const postsCount = Object.keys(userData?.posts || {}).length;

  // 🧠 GOAL DIFFICULTY (you can store this in user profile)
  // const goalDifficulty = calculateGoalDifficulty(userData) || 1;
  // 1 = easy, 2 = medium, 3 = hard

  // 🔥 CORE POINTS
  const habitPoints = totalHabitsDone * 10;

  // streak reward (bigger reward for consistency)
  const streakPoints = streak * 8;

  // active days reward
  const activePoints = activeDays * 3;

  // completion quality (percentage based)
  const completionPoints = completionRate * 1.5;

  // longest streak reward (anti-break motivation)
  const longestStreakBonus = longestStreak * 2;

  // posting activity (social consistency)
  const postPoints = postsCount * 12;

  // difficulty multiplier
  // const difficultyMultiplier =
  //   goalDifficulty === 1 ? 1 : goalDifficulty === 2 ? 1.2 : 1.5;

  // consistency bonus (reward active + streak combo)
  const consistencyBonus = streak > 7 && activeDays > 20 ? 50 : 0;

  const rawPoints =
    habitPoints +
    streakPoints +
    activePoints +
    completionPoints +
    longestStreakBonus +
    postPoints +
    consistencyBonus;

  const finalPoints = Math.round(rawPoints);
  // const finalPoints = Math.round(rawPoints * difficultyMultiplier);

  await database()
    .ref(`/leaderboards/${uid}`)
    .update({
      uid,
      points: finalPoints,
      updatedAt: Date.now(),
      ...userData?.profile,
    });

  await database()
    .ref(`/users/${uid}/stats`)
    .update({
      ...rawPoints,
      finalPoints,
      updatedAt: Date.now(),
    });
};

// const syncUserLeaderboardPoints = async (uid, userData) => {
//   if (!uid || !userData) return;

//   const stats = userData?.stats || {};

//   const totalHabitsDone = Number(stats?.totalHabitsDone || 0);
//   const streak = Number(stats?.streak || 0);
//   const activeDays = Number(stats?.activeDays || 0);
//   const completionRate = Number(stats?.completionRate || 0);
//   const longestStreak = Number(stats?.longestStreak || 0);

//   const postsCount = Object.keys(userData?.posts || {}).length;

//   const goalDifficulty = Number(userData?.goal?.difficulty || 1);

//   const points =
//     totalHabitsDone * 10 +
//     streak * 8 +
//     activeDays * 3 +
//     longestStreak * 2 +
//     completionRate +
//     postsCount * 12;

//   const finalPoints = Math.round(points * (1 + goalDifficulty * 0.2));

//   // await database().ref(`/leaderboards/global/${uid}`).update({
//   await database().ref(`/leaderboards/${uid}`).update({
//     uid,
//     user: user,
//     points: finalPoints,
//     updatedAt: Date.now(),
//   });

//   await database().ref(`/user/${uid}/stats`).update({
//     points,
//     finalPoints,
//     updatedAt: Date.now(),
//   });
// };

export {
  scale,
  generateDaysFromToday,
  requestCameraPermission,
  getSmartTips,
  calculateStreak,
  syncUserLeaderboardPoints,
};
