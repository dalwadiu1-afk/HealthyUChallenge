import React, { useRef, useEffect } from 'react';
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
import { colors, fontFamily } from '../../constant';

const { width, height } = Dimensions.get('window');

const MENU_ITEMS = [
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

const STATS = [
  { label: 'Day Streak', value: '14', emoji: '🔥' },
  { label: 'Habits Done', value: '87', emoji: '✅' },
  { label: 'Active Days', value: '31', emoji: '📅' },
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
  const headerAnim = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.85)).current;

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

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <SafeAreaProvider>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
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
                resizeMode="cover"
                source={{
                  uri: 'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
                }}
              />
              <TouchableOpacity
                style={styles.editAvatarBtn}
                activeOpacity={0.8}
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

            <Text style={styles.userName}>Linh Nguyen</Text>
            <Text style={styles.userHandle}>
              @linh.nguyen · Member since 2024
            </Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
              {STATS.map((s, i) => (
                <View key={i} style={styles.statItem}>
                  <Text style={styles.statEmoji}>{s.emoji}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

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
        </ScrollView>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  scroll: {
    paddingBottom: 110,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    marginBottom: 8,
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
  settingsIcon: {
    fontSize: 16,
    lineHeight: 22,
    includeFontPadding: false,
  },
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
    fontFamily: fontFamily.montserratBold,
    marginBottom: 4,
  },
  userHandle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
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
  statEmoji: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  statValue: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
    lineHeight: 22,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 2,
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
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
  menuEmoji: {
    fontSize: 20,
    lineHeight: 26,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
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
    fontFamily: fontFamily.montserratRegular,
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
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(192,108,91,0.25)',
    backgroundColor: 'rgba(192,108,91,0.08)',
    gap: 8,
  },
  logoutIcon: {
    fontSize: 16,
    lineHeight: 22,
    includeFontPadding: false,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
