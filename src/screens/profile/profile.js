import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { colors, fontFamily } from '../../constant';
import { Wrapper } from '../../components';
import { calculateStreak, extractUserHabits } from '../../utils/helper';
import { useSelector } from 'react-redux';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const userId = auth().currentUser?.uid || 'USER_UID';
const MENU_ITEMS = [
  {
    emoji: '🪪',
    title: 'Profile Details',
    subtitle: 'Your personalized health overview',
    screenName: 'ProfileDetails',
    badge: 'Active',
  },
  {
    emoji: '🧠',
    title: 'Quiz Hub',
    subtitle: 'Track quizzes, streaks & performance',
    screenName: 'QuizBoard',
    badge: 'Live',
  },
  // {
  //   emoji: '🎯',
  //   title: 'Goals',
  //   subtitle: 'View & edit your health goals',
  //   screenName: 'ProfileDetails',
  //   badge: null,
  // },
  // {
  //   emoji: '💪',
  //   title: 'My Body',
  //   subtitle: 'BMI, weight, body measurements',
  //   screenName: 'ProfileDetails',
  //   badge: 'Missing Info',
  // },
  {
    emoji: '🏆',
    title: 'Leaderboard',
    subtitle: 'See how you rank with others',
    screenName: 'Leaderboard',
    badge: null,
  },
  {
    emoji: '📋',
    title: 'Instructions',
    subtitle: 'App guide and how-to tips',
    screenName: 'Instructions',
    badge: 'New',
  },
  // {
  //   emoji: '⚙️',
  //   title: 'Settings',
  //   subtitle: 'Notifications, privacy & more',
  //   screenName: 'ProfileDetails',
  //   badge: null,
  // },
];

const demo = {
  '2026-05-10': {},
  '2026-05-11': {},
  '2026-05-12': {},
  '2026-05-13': {},
  // '2026-05-17': {},
};

function MenuItem({ item, onPress, index }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 350,
      delay: 300 + index * 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const animStyle = {
    opacity: anim,
    transform: [
      {
        translateX: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={onPress}
        activeOpacity={0.82}
      >
        <View style={styles.menuIconBox}>
          <Text style={styles.menuEmoji}>{item.emoji}</Text>
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>
        {item.badge && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  item.badge === 'New'
                    ? 'rgba(143,175,120,0.2)'
                    : 'rgba(192,108,91,0.2)',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color:
                    item.badge === 'New' ? colors.secondary : colors.danger,
                },
              ]}
            >
              {item.badge}
            </Text>
          </View>
        )}
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Profile({ navigation }) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.85)).current;
  const userId =
    auth().currentUser?.uid || useSelector(state => state.user?.uid);
  const [profileData, setProfileData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(avatarScale, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const todayDate = new Date();

  // remaining days from start date -> next 30 days

  useEffect(() => {
    if (!userId) return;

    // USERS DATA
    const userRef = database().ref(`/users/${userId}`);

    // LEADERBOARD DATA
    const leaderboardRef = database().ref(`/leaderboards/${userId}`);

    const userListener = userRef.on('value', snapshot => {
      const data = snapshot.val();

      if (data) {
        setProfileData(data);
      }
    });

    const leaderboardListener = leaderboardRef.on('value', snapshot => {
      const data = snapshot.val();

      if (data) {
        setLeaderboardData(data);
      }

      setLoading(false);
    });

    return () => {
      userRef.off('value', userListener);
      leaderboardRef.off('value', leaderboardListener);
    };
  }, [userId]);

  // ----------------------
  // DYNAMIC VALUES
  // ----------------------

  const profile = profileData?.profile || {};
  const challenge = leaderboardData?.challenge || {};
  const status = leaderboardData?.status || {};

  const streak = challenge?.streak || 0;

  const longestStreak =
    challenge?.longestStreak || profileData?.stats?.longestStreak || 0;

  const consistency = status?.consistency || 0;

  const activeDays = status?.activeDays || 0;

  const totalPoints =
    challenge?.totalChallengePoints || leaderboardData?.points || 0;

  const challengeStartDate = challenge?.startDate;
  const challengeEndDate = challenge?.endDate;

  // DAYS LEFT
  let remainingDays = 0;

  if (challengeEndDate) {
    const today = new Date();
    const end = new Date(challengeEndDate);

    const diff = end - today;

    remainingDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // CURRENT DATE
  const todayKey = new Date().toISOString().split('T')[0];

  // TODAY QUIZ DATA
  const todayQuizData = challenge?.days?.[todayKey] || {};

  const todayPoints = todayQuizData?.points || 0;

  const todayQuiz =
    (todayQuizData?.normalQuiz ? 1 : 0) + (todayQuizData?.bonusQuizzes ? 1 : 0);

  // STATS FOR UI
  const STATS = [
    {
      label: 'Streak',
      value: streak,
      emoji: '🔥',
    },
    {
      label: 'Longest',
      value: longestStreak,
      emoji: '🏆',
    },
    {
      label: 'Days Left',
      value: remainingDays,
      emoji: '📅',
    },
    {
      label: 'Consistency',
      value: `${consistency}%`,
      emoji: '⚡',
    },
  ];

  // USER INITIALS
  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'US';

  // MEMBER SINCE
  const memberSince = profile?.memberSince || new Date().getFullYear();

  // GOALS TEXT
  const selectedGoalsText =
    profileData?.goal?.selectedGoals
      ?.map(item => item?.title)
      ?.filter(Boolean)
      ?.join(' • ') || 'No goals selected';

  console.log('PROFILE DATA => ', profileData);
  console.log('LEADERBOARD DATA => ', leaderboardData);

  return (
    <View style={styles.container}>
      <Wrapper>
        {/* Hero section */}
        <Animated.View style={[styles.hero, { opacity: headerAnim }]}>
          {/* Top row */}
          <View style={styles.heroTopRow}>
            <Text style={styles.heroLabel}>PROFILE</Text>
            <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.8}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
          {/* Avatar */}
          <Animated.View
            style={[
              styles.avatarWrapper,
              { transform: [{ scale: avatarScale }] },
            ]}
          >
            <Image
              style={styles.avatar}
              source={{
                uri:
                  profile?.avatar ||
                  'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
              }}
            />
          </Animated.View>

          <Text style={styles.userName}>{profile?.name || 'User'}</Text>

          <Text style={{ ...styles.userHandle, marginBottom: 0 }}>
            {selectedGoalsText || 'No habit set'}
          </Text>

          <Text style={styles.userHandle}>
            {profile?.username || '@username'} · Member since{' '}
            {memberSince || 2026}
          </Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {STATS.map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statEmoji}>{s?.emoji}</Text>
                <Text
                  style={styles.statValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {s.value}
                </Text>
                <Text style={styles.statLabel}>{s?.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.07)',
            marginVertical: 20,
          }}
        />

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuHeader}>Account</Text>
          {MENU_ITEMS.map((item, index) => (
            <MenuItem
              key={index}
              item={item}
              index={index}
              onPress={() => navigation.navigate(item.screenName)}
            />
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  scroll: {},
  hero: {
    alignItems: 'center',
  },
  heroTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroLabel: {
    color: colors.secondary,
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 4,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: { fontSize: 16 },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: width * 0.14,
    borderWidth: 3,
    borderColor: colors.secondary,
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
  userName: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 4,
  },
  userHandle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    marginBottom: 22,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
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
  },
  menuSection: {},
  menuHeader: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 2,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuEmoji: { fontSize: 20 },
  menuText: { flex: 1 },
  menuTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 2,
  },
  menuSubtitle: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },
  badge: {
    borderRadius: 49,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fontFamily.montserratSemiBold,
  },
  chevron: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 22,
    fontFamily: fontFamily.poppinsRegular,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(192,108,91,0.25)',
    backgroundColor: 'rgba(192,108,91,0.08)',
    gap: 8,
    marginBottom: height / 12,
  },
  logoutIcon: { fontSize: 16 },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
