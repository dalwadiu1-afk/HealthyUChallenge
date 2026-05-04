import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

import { colors, fontFamily } from '../../constant';
import { Wrapper } from '../../components';

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
    emoji: '🎯',
    title: 'Goals',
    subtitle: 'View & edit your health goals',
    screenName: 'ProfileDetails',
    badge: null,
  },
  {
    emoji: '💪',
    title: 'My Body',
    subtitle: 'BMI, weight, body measurements',
    screenName: 'ProfileDetails',
    badge: 'Missing Info',
  },
  {
    emoji: '📋',
    title: 'Instructions',
    subtitle: 'App guide and how-to tips',
    screenName: 'Instructions',
    badge: 'New',
  },
  {
    emoji: '🏆',
    title: 'Leaderboard',
    subtitle: 'See how you rank with others',
    screenName: 'Leaderboard',
    badge: null,
  },
  {
    emoji: '⚙️',
    title: 'Settings',
    subtitle: 'Notifications, privacy & more',
    screenName: 'ProfileDetails',
    badge: null,
  },
];

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
  const [profile, setProfile] = useState({});
  const userRef = database().ref(`users/${userId}/profile`);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.85)).current;

  const calculateStreak = habit => {
    if (!habit) return 0;

    const allDays = [];

    Object.values(habit).forEach(month => {
      if (month?.days) {
        Object.entries(month?.days).forEach(([day, data]) => {
          if (data?.completed) {
            allDays.push(day);
          }
        });
      }
    });

    return allDays.length; // simple version (can upgrade later)
  };

  useEffect(() => {
    const listener = userRef.on('value', snapshot => {
      const data = snapshot.val();

      if (data) {
        setProfile(data);
      }
    });

    return () => userRef.off('value', listener);
  }, []);

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
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });
  const year = new Date().getFullYear();
  const monthKey = `${currentMonth}_${year}`;

  const days = profile?.habit?.[monthKey]?.days || {};

  const activeDays = Object.keys(days).length;

  const streak = calculateStreak(profile?.habit);
  const today = String(new Date().getDate()).padStart(2, '0');

  const currentHabit = profile?.habit?.[monthKey] || {};
  const todayData = currentHabit?.days?.[today] || {};

  const STATS = [
    {
      label: 'Streak',
      value: streak || 0,
      emoji: '🔥',
    },
    {
      label: 'Active Days',
      value: activeDays || 0,
      emoji: '📅',
    },
    // {
    //   label: 'Habit',
    //   value: currentHabit?.title || 'None',
    //   emoji: '🎯',
    // },
    // {
    //   label: 'Target',
    //   value: currentHabit?.target || '--',
    //   emoji: '🥅',
    // },
    {
      label: 'Today',
      value: todayData?.progress || '0',
      emoji: '📊',
    },
    // {
    //   label: 'Done',
    //   value: todayData?.completed ? 'Yes' : 'No',
    //   emoji: '✅',
    // },
  ];

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
            {profile?.habit?.[monthKey]?.title || 'No habit set'}
          </Text>

          <Text style={styles.userHandle}>
            {profile?.username || '@username'} · Member since{' '}
            {profile?.memberSince || '2024'}
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
  },
  logoutIcon: { fontSize: 16 },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
