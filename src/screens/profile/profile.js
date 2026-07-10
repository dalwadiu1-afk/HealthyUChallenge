import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  Alert,
  TextInput,
  StatusBar,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { colors, fontFamily } from '../../constant';
import { Wrapper } from '../../components';
import { useSelector } from 'react-redux';
import moment from 'moment';
import analytics from '@react-native-firebase/analytics';

import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get('window');

const generateRandomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
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
                  item.badge === 'New' || 'Admin' || 'Live'
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
                    item.badge === 'New' || 'Admin' || 'Live'
                      ? colors.secondary
                      : colors.danger,
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
  const profile = profileData?.profile || {};

  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const challengeCode = profile?.verificationCode?.code || 'Generating...';

  const generateCodeIfNeeded = async () => {
    try {
      if (profile?.role !== 'admin') return;

      const ref = database().ref(`users/${userId}/profile/verificationCode`);

      const snap = await ref.once('value');

      const data = snap.val();

      if (!data || data.used === true) {
        const newCode = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

        await ref.set({
          code: newCode,
          used: false,
          createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        });
      }
    } catch (error) {
      console.log('Generate Code Error:', error);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const adminUsers = await database()
        .ref('/users')
        .orderByChild('profile/role')
        .equalTo('admin')
        .once('value');

      let validCode = null;
      let adminUid = null;

      adminUsers.forEach(child => {
        const codeData = child.val()?.profile?.verificationCode;

        if (
          codeData?.code === verificationCode.trim().toUpperCase() &&
          !codeData?.used
        ) {
          validCode = codeData;
          adminUid = child.key;
        }
      });

      if (!validCode) {
        Alert.alert('Invalid Code', 'Please enter a valid code.');
        return;
      }

      const uid = auth().currentUser?.uid;

      // VERIFY USER
      await database()
        .ref(`/users/${uid}/profile`)
        .update({
          challengeVerified: true,
          challengeVerifiedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        });

      // GENERATE NEW ADMIN CODE
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      await database()
        .ref(`/users/${adminUid}/profile/verificationCode`)
        .set({
          code: newCode,
          used: false,
          createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        });

      setVerifyModalVisible(false);
      setVerificationCode('');

      Alert.alert(
        '🎉 Challenge Completed',
        'Your challenge completion has been verified.',
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    generateCodeIfNeeded();
  }, [profile?.role]);

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

  const challenge = leaderboardData?.challenge || {};
  const status = leaderboardData?.status || {};

  const streak = challenge?.streak || 0;

  const longestStreak =
    challenge?.longestStreak || profileData?.stats?.longestStreak || 0;

  const consistency = status?.consistency || 0;

  const startDay = profileData?.goal?.startDate;
  const TOTAL_CHALLENGE_DAYS = 30;
  let remainingDays = 0;

  if (startDay) {
    const start = new Date(startDay);
    const today = new Date();

    const diffInMs = today - start;
    const daysPassed = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    remainingDays = Math.max(0, TOTAL_CHALLENGE_DAYS - daysPassed);
  }

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
      label: 'Days Left of\nChallenge',
      value: remainingDays,
      emoji: '📅',
    },
    // {
    //   label: 'Consistency',
    //   value: `${consistency}%`,
    //   emoji: '⚡',
    // },
  ];
  const handleLogout = async () => {
    try {
      await auth().signOut();
      console.log('User logged out');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };
  // GOALS TEXT
  const selectedGoalsText =
    profileData?.goal?.selectedGoals
      ?.map(item => item?.title)
      ?.filter(Boolean)
      ?.join(' • ') || 'No goals selected';

  const MENU_ITEMS = [
    {
      emoji: '🪪',
      title: 'Profile Details',
      subtitle: 'Your personalized health overview',
      screenName: 'ProfileDetails',
    },
    profile?.role === 'admin'
      ? {
          emoji: '🔑',
          title: 'Challenge Verification Code',
          subtitle: challengeCode || 'Generate code',
          screenName: 'VerificationAdmin',
          badge: 'Admin',
        }
      : {
          emoji: '✅',
          title: 'Challenge Verification',
          subtitle: 'Verify completion of your challenge',
          screenName: 'ChallengeVerification',
          badge: profileData?.profile?.challengeVerified
            ? 'Verified'
            : 'Pending',
        },
    {
      emoji: '🏋️',
      title: 'Workout History',
      subtitle: 'View completed workouts and progress',
      screenName: 'ArchivedGoals',
    },
    {
      emoji: '🧠',
      title: 'Quiz Hub',
      subtitle: 'Track quizzes, streaks & performance',
      screenName: 'QuizBoard',
      badge: 'Live',
    },
    {
      emoji: '🏆',
      title: 'Quiz Leaderboard',
      subtitle: 'See how you rank with others',
      screenName: 'Leaderboard',
      badge: null,
    },

    profileData?.profile?.role === 'admin' && {
      emoji: '📊',
      title: 'Quiz Analytics',
      subtitle: 'View quiz performance insights',
      screenName: 'QuizAnalytics',
      badge: 'Admin',
    },

    {
      emoji: '👥',
      title: 'Social',
      subtitle: 'Connect with our dietitian',
      screenName: 'Social',
    },
    // { // emoji: '🎯', // title: 'Goals', // subtitle: 'View & edit your health goals', // screenName: 'ProfileDetails', // badge: null, // },
    // { // emoji: '💪', // title: 'My Body', // subtitle: 'BMI, weight, body measurements', // screenName: 'ProfileDetails', // badge: 'Missing Info', // },
    // { // emoji: '📋', // title: 'Instructions', // subtitle: 'App guide and how-to tips', // screenName: 'Instructions', // badge: 'New', // },
    // { // emoji: '⚙️', // title: 'Settings', // subtitle: 'Notifications, privacy & more', // screenName: 'ProfileDetails', // badge: null, // },
  ].filter(Boolean);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.dark }}
      edges={['top']}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.container}>
        {/* Hero section */}
        <Animated.View style={[styles.hero, { opacity: headerAnim }]}>
          {/* Top row */}
          <View style={styles.heroTopRow}>
            <Text style={styles.heroLabel}>PROFILE</Text>
            <TouchableOpacity
              style={styles.settingsBtn}
              activeOpacity={0.8}
              onPress={() => navigation?.navigate('NotificationSettings')}
            >
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
            {moment(profile?.memberSince).format('YYYY') || '2026'}
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

        <Wrapper
          safeAreaPops={{ edges: ['bottom'] }}
          containerStyle={{ paddingBottom: height / 6 }}
        >
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
                onPress={() => {
                  // NON ADMIN VERIFICATION
                  if (
                    item.title === 'Challenge Verification' &&
                    profile?.role !== 'admin'
                  ) {
                    setVerifyModalVisible(true);
                    return;
                  } else {
                    if (item?.screenName != 'VerificationAdmin')
                      navigation.navigate(item.screenName);
                  }
                }}
              />
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <Modal
            isVisible={verifyModalVisible}
            onBackdropPress={() => setVerifyModalVisible(false)}
            backdropOpacity={0.8}
            animationIn="zoomIn"
            animationOut="zoomOut"
            useNativeDriver
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalEmoji}>🏆</Text>

              <Text style={styles.modalTitle}>Verify Challenge</Text>

              <Text style={styles.modalSubtitle}>
                Enter the verification code provided by your administrator.
              </Text>

              <TextInput
                value={verificationCode}
                onChangeText={text => setVerificationCode(text.toUpperCase())}
                placeholder="ENTER CODE"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.codeInput}
                autoCapitalize="characters"
              />

              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={handleVerifyCode}
              >
                <Text style={styles.verifyBtnText}>Verify Completion</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setVerifyModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Wrapper>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 23,
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
    textAlign: 'center',
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
    // gap: 8,
  },
  logoutIcon: { fontSize: 16 },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '88%',
    backgroundColor: '#151515',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },

  modalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },

  modalTitle: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 8,
  },

  modalSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  codeInput: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 4,
    fontSize: 20,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 20,
  },

  verifyBtn: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  verifyBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratBold,
  },

  cancelText: {
    color: 'rgba(255,255,255,0.45)',
    marginTop: 18,
  },

  codeDisplay: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.35)',
    marginBottom: 20,
  },

  codeDisplayText: {
    color: colors.secondary,
    textAlign: 'center',
    fontSize: 28,
    letterSpacing: 6,
    fontFamily: fontFamily.montserratBold,
  },
});
