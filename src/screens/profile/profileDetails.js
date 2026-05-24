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
import { Header } from '../../components';
import { useSelector } from 'react-redux';
import { calculateStreak } from '../../utils/helper';
import moment from 'moment';

const { height, width } = Dimensions.get('window');
const userId = auth().currentUser?.uid || 'USER_UID';
const SHEET_MIN = height * 0.55;
const SHEET_MAX = height * 0.81;

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

function ProgressTab({ monthData = {}, badges = [] }) {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const MAX_BAR_HEIGHT = 100; // or 100

  const daysData = monthData?.days || {};

  const target = monthData?.target || '25-38g';

  const targetMatch = target.match(/\d+/);

  const targetValue = Number(targetMatch?.[0] || 1);

  const getPercent = item => {
    if (!item) return 0;

    const progress = Number(item.progress || 0);

    return Math.min((progress / targetValue) * 100, 100);
  };

  // Current week Monday
  const today = new Date();

  const monday = moment().isoWeekday(1);

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    moment(monday).add(i, 'days').format('YYYY-MM-DD'),
  );
  console.log('weekDates :>> ', weekDates);

  // Create graph data
  const DATA = weekDates.map(date => {
    const item = daysData?.[date];

    if (!item?.progress) return 0;

    return getPercent(item);
  });
  console.log('DATA :>> ', DATA);
  return (
    <View style={{ paddingTop: 4 }}>
      <Text style={styles.progressTitle}>Weekly Activity</Text>

      <View style={styles.barChart}>
        {DAYS.map((day, i) => (
          <View key={i} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${DATA[i]}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.barLabel}>{day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const demo = {
  '2026-05-10': {},
  '2026-05-11': {},
  '2026-05-12': {},
  '2026-05-13': {},
  // '2026-05-17': {},
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileDetails({ navigation }) {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const startDate = useSelector(state => state.user?.goal?.startDate);
  const data = useSelector(state => state.user);
  const profile = data?.profile;
  const habitsData = data?.habits;
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onChange(event => {
      let val = translateY.value + event.changeY;
      if (val < -300) val = -300;
      if (val > 0) val = 0;
      translateY.value = val;
    })
    .onEnd(() => {
      translateY.value = withSpring(translateY.value < -150 ? -300 : 0, {
        damping: 18,
        stiffness: 120,
      });
    });

  // Avatar: shrinks in place + fades out as sheet rises (no left slide to avoid back button overlap)
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

  useEffect(() => {
    // 🔹 Profile + stats + activities
    const userRef = database().ref(`users/${userId}`);

    const userListener = userRef.on('value', snapshot => {
      const data = snapshot.val();
      if (!data) return;

      setStats(data?.stats);

      // weekly progress
      const weekly = data?.activities?.workout?.weeklyProgress || {};
      const formatted = Object.keys(weekly).map(key => ({
        week: key,
        done: weekly[key].done,
      }));

      console.log('formatted check this :>> ', formatted);

      setWeeklyData(formatted);
    });

    // 🔹 Posts (GLOBAL)
    const postRef = database()
      .ref('posts')
      .orderByChild('userId')
      .equalTo(userId);

    const postListener = postRef.on('value', snapshot => {
      const data = snapshot.val();
      if (!data) return setPosts([]);

      const formatted = Object.keys(data)
        .map(key => {
          const post = data[key];

          const likesObj = post.likes || {};
          const commentsObj = post.comments || {};

          return {
            id: key,
            ...post,

            likesCount: Object.keys(likesObj).length,
            commentsCount: Object.keys(commentsObj).length,

            isLiked: !!likesObj[userId], // check if current user liked
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt);

      setPosts(formatted);
    });

    return () => {
      userRef.off('value', userListener);
      postRef.off('value', postListener);
    };
  }, []);

  const currentMonth = new Date().toLocaleString('default', { month: 'short' });
  const year = new Date().getFullYear();
  const monthKey = `${currentMonth}_${year}`;

  const days = habitsData?.[monthKey]?.days || {};

  const allDays = Object.values(days || {});

  const activeDays = allDays.length;

  const completedDays = allDays.filter(d => d?.completed).length;

  const completionRate =
    activeDays > 0 ? Math.round((completedDays / activeDays) * 100) : 0;
  const { currentStreak, longestStreak } = calculateStreak(days || {});

  // format => YYYY-MM-DD
  const todayDate = new Date();
  const todayKey = todayDate.toISOString().split('T')[0];

  const currentHabit = profile?.habit?.[monthKey] || {};
  const todayData = currentHabit?.days?.[todayKey] || {};

  // remaining days from start date -> next 30 days
  let remainingDays = 0;

  if (startDate) {
    const start = new Date(startDate);

    // end date = start + 30 days
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + 30);

    // difference between today and end date
    const diffTime = endDate - todayDate;

    remainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // get first month key from habits
  const memberSinceKey = Object.keys(habitsData || {})?.[0];

  const PROFILE_STATS = [
    {
      label: 'Streak',
      value: `${currentStreak || 0} 🔥`,
    },
    {
      label: 'Active Days',
      value: `${activeDays || 0} 📅`,
    },
    {
      label: 'Completion',
      value: `${completionRate}% ✅`,
    },
  ];

  const ACTIVITY_STATS_DYNAMIC = [
    {
      emoji: '🔥',
      label: 'Day Streak',
      value: `${currentStreak || 0} days`,
    },
    {
      emoji: '🔥',
      label: 'Longest Streak',
      value: `${longestStreak || 0} days`,
    },
    {
      emoji: '✅',
      label: 'Habits Done',
      value: `${stats?.totalHabitsDone || 0} total`,
    },
    {
      emoji: '📅',
      label: 'Active Days',
      value: `${activeDays || 0} days`,
    },
    {
      emoji: '🏃',
      label: 'Steps Avg',
      value: `${stats?.stepsAvg || 0} / day`, // optional field
    },
    {
      emoji: '💤',
      label: 'Sleep Avg',
      value: `${stats?.sleepAvg || 0} hrs`, // optional field
    },
    {
      emoji: '🥦',
      label: 'Fiber Goal',
      value: `${stats?.fiberStreak || 0}× streak`, // optional field
    },
  ];

  const PROGRESS_BADGES = [
    {
      emoji: '🥇',
      label: `${currentStreak || 0}-day streak`,
      show: currentStreak >= 1,
    },
    {
      emoji: '💪',
      label: 'Top 10%',
      show: completionRate >= 90,
    },
    {
      emoji: '🏆',
      label: `Level ${Math.floor((stats?.totalHabitsDone || 0) / 20)}`,
      show: stats?.totalHabitsDone > 0,
    },
  ];

  const formatMonthKey = monthKey => {
    if (!monthKey) return 'May 2024';

    const [month, year] = monthKey.split('_');
    console.log('monthKey :>> ', `${month} ${year}`);
    return `${month} ${year}`;
  };

  // Name: slides straight up into the nav bar + font shrinks
  const nameStyle = useAnimatedStyle(() => {
    const fs = interpolate(translateY.value, [-300, 0], [16, 22], 'clamp');
    const ty = interpolate(
      translateY.value,
      [-300, 0],
      [-height * 0.113, 0],
      'clamp',
    );
    return { fontSize: fs, transform: [{ translateY: ty }] };
  });

  // "Profile" nav title: fades out as sheet rises so the animated name takes its place
  const navTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateY.value, [-80, 0], [0, 1], 'clamp');
    return { opacity };
  });

  // Hero info (handle + stats + buttons): fades out as sheet rises
  const heroInfoStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateY.value, [-120, 0], [0, 1], 'clamp');

    const translateYAnim = interpolate(
      translateY.value,
      [-300, 0],
      [-80, 0], // move up when collapsing
      'clamp',
    );

    return {
      opacity,
      transform: [{ translateY: translateYAnim }],
    };
  });

  // Sheet height
  const sheetStyle = useAnimatedStyle(() => {
    const h = interpolate(
      translateY.value,
      [-300, 0],
      [SHEET_MAX, SHEET_MIN],
      'clamp',
    );
    return { height: h };
  });

  const toggleLike = async postId => {
    const likeRef = database().ref(`posts/${postId}/likes/${userId}`);

    const snapshot = await likeRef.once('value');

    if (snapshot.exists()) {
      await likeRef.remove(); // 🔴 unlike
    } else {
      await likeRef.update(true); // 🟢 like
    }
  };

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

        beverageName: item.beverageName,
        ingredients: item.ingredients || [],
        type: item.type,

        snackName: item?.snackName,
        qty: item?.qty,
        type: item?.type,
      }}
      index={index}
      onLikePress={() => toggleLike(item.id)}
      onCardPress={() =>
        navigation.navigate('SocialStack', {
          screen: 'FeedDetails',
          params: { postId: item?.id },
        })
      }
      onCommentPress={() =>
        navigation.navigate('SocialStack', {
          screen: 'FeedDetails',
          params: { postId: item?.id, showComment: true },
        })
      }
    />
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.heroContent}>
        {/* Avatar */}
        <Header
          header={'Profile Details'}
          headerContainer={{
            marginTop: StatusBar.currentHeight,
          }}
          textStyle={[styles.navTitle, navTitleStyle]}
          showRightBtn
        />

        <Animated.View style={[styles.avatarWrap, avatarStyle]}>
          <Image
            source={{
              uri:
                profile?.avatar ||
                'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
            }}
            style={{ width: '100%', height: '100%', borderRadius: 999 }}
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

        {/* Name */}
        <Animated.Text style={[styles.heroName, nameStyle]}>
          {profile?.name || 'User'}
        </Animated.Text>

        {/* Handle + stats + buttons — fade out when sheet rises */}
        <Animated.View style={[styles.heroInfo, heroInfoStyle]}>
          <Text style={styles.heroHandle}>
            {profile?.username}· Member since {formatMonthKey(memberSinceKey)}
          </Text>

          {/* Stat pills */}
          <View style={styles.statRow}>
            {PROFILE_STATS.map((s, i) => (
              <React.Fragment key={i}>
                <StatPill label={s.label} value={s.value} />
                {i < PROFILE_STATS.length - 1 && (
                  <View style={styles.statDivider} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* CTA buttons */}
          {/* <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.btnFollow} activeOpacity={0.82}>
              <Text style={styles.btnFollowText}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnMessage} activeOpacity={0.82}>
              <Text style={styles.btnMessageText}>Message</Text>
            </TouchableOpacity>
          </View> */}
        </Animated.View>
      </View>

      {/* ── Bottom sheet ── */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* Drag handle */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
        </GestureDetector>

        {/* Tabs */}
        <TabBar currentIndex={currentTabIndex} onPress={setCurrentTabIndex} />

        {/* Content */}
        {currentTabIndex === 0 && (
          <FlatList
            data={posts}
            renderItem={renderFeed}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedList}
          />
        )}
        {currentTabIndex === 1 && (
          <FlatList
            data={[{ key: 'stats' }]}
            renderItem={() => <StatsTab statsData={ACTIVITY_STATS_DYNAMIC} />}
            keyExtractor={item => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedList}
          />
        )}
        {currentTabIndex === 2 && (
          <FlatList
            data={[{ key: 'progress' }]}
            renderItem={() => (
              <ProgressTab
                monthData={habitsData?.[monthKey] || {}}
                badges={PROGRESS_BADGES}
              />
            )}
            keyExtractor={item => item.key}
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
