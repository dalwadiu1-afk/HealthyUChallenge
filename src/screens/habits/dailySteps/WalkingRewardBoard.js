import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  StatusBar,
  Animated,
} from 'react-native';

import { SvgImg, Wrapper } from '../../../components';
import { badgeIcon, rewardIcon } from '../../../assets/images';
import { colors, fontFamily } from '../../../constant';

import Svg, { Path } from 'react-native-svg';

import ProfileHeader from '../../../components/profile/ProfileHeader';
import auth from '@react-native-firebase/auth';
/* 🔥 Firebase */
import {
  getDatabase,
  ref,
  onValue,
  off,
} from '@react-native-firebase/database';
import moment from 'moment';

const { height } = Dimensions.get('window');

const RANK_COLORS = {
  1: {
    bg: 'rgba(255,215,0,0.12)',
    border: 'rgba(255,215,0,0.4)',
    text: '#FFD700',
  },
  2: {
    bg: 'rgba(192,192,192,0.12)',
    border: 'rgba(192,192,192,0.4)',
    text: '#C0C0C0',
  },
  3: {
    bg: 'rgba(205,127,50,0.12)',
    border: 'rgba(205,127,50,0.4)',
    text: '#CD7F32',
  },
};

function FootprintIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 4v4M13 4l2 2M13 4l-2 2"
        stroke="#8FAF78"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11 12v4M11 12l2 2M11 12l-2 2"
        stroke="#8FAF78"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function WeekWinnerCard({ item, index }) {
  const anim = useRef(new Animated.Value(0)).current;
  const rc = RANK_COLORS[item?.rank];

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 350,
      delay: 300 + index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateX: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [40, 0],
            }),
          },
        ],
      }}
    >
      <View
        style={[
          styles.winnerCard,
          { borderColor: rc.border, backgroundColor: rc.bg },
        ]}
      >
        <View style={[styles.rankBadge, { borderColor: rc.border }]}>
          <Text style={[styles.rankNum, { color: rc.text }]}>{item?.rank}</Text>
        </View>

        <Image
          source={{ uri: item?.profile }}
          style={[styles.winnerAvatar, { borderColor: rc.text }]}
        />

        <View style={styles.winnerInfo}>
          <Text style={styles.winnerName} numberOfLines={1}>
            {item?.name}
          </Text>

          <Text
            style={styles.winnerWorkouts}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            🎯 {item?.quizCompleted || 0} quizzes · 🔥 {item?.streak || 0}{' '}
            streak · 📊 {item?.consistency || 0}% consistency
          </Text>
        </View>

        <View style={styles.winnerRight}>
          <SvgImg
            iconName={badgeIcon(
              item?.rank === 1 ? 'gold' : item?.rank === 2 ? 'white' : 'brown',
            )}
            height={20}
            width={14}
          />

          <Text
            style={[styles.winnerSteps, { color: rc.text }]}
            numberOfLines={1}
          >
            {item?.points} Pts
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function WalkingRewardBoard({ navigation }) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const userId = auth()?.currentUser?.uid;
  const [topPercent, setTopPercent] = useState(null);
  const [userRank, setUserRank] = useState(null);

  /* 🔥 Firebase state */
  const [weekWinners, setWeekWinners] = useState([]);
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(cardsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    setLoading(true);
    const db = getDatabase(
      undefined,
      'https://healthyuchallenge-45ec6-default-rtdb.firebaseio.com/',
    );

    const uid = auth()?.currentUser?.uid;
    if (!uid) return;

    const userRef = ref(db, `leaderboards/${uid}`);
    const usersRef = ref(db, `users/${uid}`);
    const leaderboardRef = ref(db, `leaderboards`);

    const unsubscribeUser = onValue(userRef, snapshot => {
      setUserData(snapshot.val());
    });

    const unsubscribeProfile = onValue(usersRef, snapshot => {
      setProfileData(snapshot.val());
      setLoading(false);
    });

    const unsubscribeLeaderboard = onValue(leaderboardRef, snapshot => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([uid, item]) => ({
        uid,
        ...item,
      }));
      const getWeeklyPoints = challenge => {
        const weekly = challenge?.weeklySummary || {};
        const values = Object.values(weekly);

        if (!values.length) return 0;

        const latestWeek = values.reduce((latest, current) => {
          const latestEnd = moment(latest?.end);
          const currentEnd = moment(current?.end);

          return currentEnd.isAfter(latestEnd) ? current : latest;
        });

        return latestWeek?.points || 0;
      };
      const sorted = list.sort((a, b) => {
        const pointsA = getWeeklyPoints(a.challenge);
        const pointsB = getWeeklyPoints(b.challenge);

        if (pointsB !== pointsA) {
          return pointsB - pointsA;
        }

        const consistencyA = a.status?.consistency || 0;
        const consistencyB = b.status?.consistency || 0;

        if (consistencyB !== consistencyA) {
          return consistencyB - consistencyA;
        }

        return (b.challenge?.streak || 0) - (a.challenge?.streak || 0);
      });

      const top3 = [...(sorted || [])]
  .sort(
    (a, b) =>
      (b?.challenge?.totalChallengePoints || 0) -
      (a?.challenge?.totalChallengePoints || 0)
  )
  .slice(0, 3)
  .map((u, index) => {
    const challenge = u?.challenge || {};
    const status = u?.status || {};

    return {
      rank: index + 1,
      profile: u?.avatar || 'https://i.pravatar.cc/300',
      name: u?.name || 'User',
      streak: challenge?.streak || 0,
      consistency: status?.consistency,
      quizCompleted: status?.quizCompleted,
      points: challenge?.totalChallengePoints || 0,
    };
  });
      const userIndex = sorted.findIndex(item => item.uid === uid);

      const totalUsers = sorted.length;

      let calculatedPercent = null;

      if (userIndex !== -1 && totalUsers > 0) {
        calculatedPercent = Math.max(
          1,
          Math.ceil(((userIndex + 1) / totalUsers) * 100),
        );
      }

      const userRank = userIndex !== -1 ? userIndex + 1 : null;
      setUserRank(userRank);
      setTopPercent(calculatedPercent);
      setWeekWinners(top3);
      setLoading(false);
    });
    return () => {
      unsubscribeUser();
      unsubscribeLeaderboard();
      unsubscribeProfile();
    };
  }, []);

  /* 🔥 derived values */

  const isCurrentWeek = dateString => {
    const date = moment(dateString);
    const today = moment();

    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');

    return date.isBetween(startOfWeek, endOfWeek, undefined, '[]');
  };

  const getCurrentWeekKey = challenge => {
    if (!challenge?.weeklySummary) return null;

    const today = moment();

    return Object.keys(challenge.weeklySummary).find(key => {
      const week = challenge.weeklySummary[key];

      const start = moment(week.start);
      const end = moment(week.end);

      return today.isBetween(start, end, undefined, '[]');
    });
  };

  const todaySteps = todayData?.steps || 0;
  const todayKey = moment().format('YYYY-MM-DD');

  const allDays =
    userData?.challenge?.days || profileData?.challenge?.days || {};

  const todayData = allDays?.[todayKey] || {};

  const todayPoints = todayData?.points || 0;

  const todayQuiz = [
    todayData?.normalQuiz,
    todayData?.bonusQuizzes,
    todayData?.normalQuizCompleted,
    todayData?.bonusQuizCompleted,
  ].filter(Boolean).length;

  // WEEK
  const weeklySteps = Object.entries(allDays).reduce((acc, [date, item]) => {
    if (!isCurrentWeek(date)) return acc;

    return acc + (item?.steps || 0);
  }, 0);

  const weeklyQuiz = Object.values(allDays).reduce((acc, item) => {
    const count = [
      item?.normalQuiz,
      item?.bonusQuizzes,
      item?.normalQuizCompleted,
      item?.bonusQuizCompleted,
    ].filter(Boolean).length;

    return acc + count;
  }, 0);

  // STREAK
  const streak =
    userData?.challenge?.streak ||
    userData?.stats?.streak ||
    profileData?.challenge?.streak ||
    profileData?.stats?.streak ||
    0;
  // WEEKLY POINTS
  const currentWeekKey = getCurrentWeekKey(
    userData?.challenge || profileData?.challenge,
  );
  const weeklyPoints = currentWeekKey
    ? userData?.challenge?.weeklySummary?.[currentWeekKey]?.points ||
      profileData?.challenge?.weeklySummary?.[currentWeekKey]?.points ||
      0
    : 0;
  // CONSISTENCY
  const consistency =
    userData?.status?.consistency ||
    userData?.stats?.completionRate ||
    userData?.stats?.consistency ||
    profileData?.status?.consistency ||
    profileData?.stats?.completionRate ||
    profileData?.stats?.consistency ||
    0;
  // TOTAL POINTS
  const totalPoints =
    userData?.points ||
    userData?.challenge?.totalChallengePoints ||
    userData?.challenge?.totalPoints ||
    profileData?.points ||
    profileData?.challenge?.totalChallengePoints ||
    profileData?.challenge?.totalPoints ||
    0;
  // PROGRESS
  const percent = todaySteps > 0 ? Math.min((todaySteps / 5000) * 100, 100) : 0;

  const weeklyPercent =
    weeklyPoints > 0 ? Math.min((weeklyPoints / 5000) * 100, 100) : 0;

  const leaderboardQuiz =
    userData?.quizzes?.days || userData?.challenge?.days || {};

  const profileQuiz =
    profileData?.quizzes?.days || profileData?.challenge?.days || {};

  const mergedQuiz = {
    ...leaderboardQuiz,
    ...profileQuiz,
  };
  const todayProgress =
    todayPoints > 0 ? Math.min((todayPoints / 50) * 100, 100) : 0;

  console.log(
    'moment(userData?.challenge?.startDate)?.format :>> ',
    // moment(userData?.challenge?.startDate)?.format('YYYY-MM-DD hh:mm:ss'),
    profileData?.profile?.memberSince,
  );

  return (
    <View style={styles.root}>
      {/* HEADER */}
      <View
        style={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 15,
          zIndex: 1,
        }}
      >
        <ProfileHeader
          userData={userData}
          profileData={profileData}
          startDate={
            moment(
              profileData?.profile?.memberSince
                ? profileData?.profile?.memberSince
                : userData?.challenge?.startDate,
            )?.format('YYYY-MM-DD') || ''
          }
          streakData={mergedQuiz}
          onPress={() => navigation.navigate('AvgSteps')}
        />
      </View>

      <Wrapper safeAreaPops={{ edges: [''] }}>
        {/* STATS */}
        <Animated.View style={[styles.statsStrip, { opacity: cardsAnim }]}>
          {[
            {
              label: 'Weekly',
              value: weeklyPoints,
              unit: 'pts',
              icon: '🏆',
            },
            {
              label: 'Rank',
              value: `#${userRank || '--'}`,
              unit: 'leaderboard',
              icon: '🥇',
            },
            {
              label: 'Streak',
              value: streak,
              unit: 'days',
              icon: '🔥',
            },
            {
              label: 'Consistency',
              value: consistency,
              unit: '%',
            },
          ].map((s, i) => (
            <View
              key={i}
              style={[styles.statPill, i < 3 && styles.statPillBorder]}
            >
              <Text style={styles.statPillValue}>{s?.value}</Text>
              <Text style={styles.statPillUnit}>{s?.unit}</Text>
              <Text style={styles.statPillLabel}>{s?.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* STEPS */}
        <Animated.View style={[styles.stepsCard, { opacity: cardsAnim }]}>
          <View style={styles.stepsIconWrap}>
            <FootprintIcon />
          </View>

          <View style={styles.stepsCardBody}>
            <Text style={styles.stepsLabel}>Today Activity</Text>
            <Text style={styles.stepsValue}>{todayQuiz}</Text>
          </View>

          <View style={styles.stepsGoalWrap}>
            <Text style={styles.stepsGoalPct}>{todayPoints}</Text>
            <Text style={styles.stepsGoalLabel}>points today</Text>
          </View>

          <View style={styles.stepsProgressBg}>
            <View
              style={[styles.stepsProgressFill, { width: `${todayProgress}%` }]}
            />
          </View>

          <View style={styles.stepsMsgRow}>
            <Text style={styles.stepsMsgTitle}>Keep the momentum 🔥</Text>
            <Text style={styles.stepsMsgSub}>
              Daily activity improves your weekly rank
            </Text>
          </View>
        </Animated.View>

        {/* POINTS */}
        <Animated.View style={[styles.pointsCard, { opacity: cardsAnim }]}>
          <View style={styles.pointsTopRow}>
            <View>
              <Text style={styles.pointsLabel}>Your Available Points</Text>
              <Text style={styles.pointsValue}>
                {totalPoints || 0}
                <Text style={styles.pointsPts}>pts.</Text>
              </Text>
            </View>

            <SvgImg iconName={rewardIcon} height={90} width={120} />
          </View>

          <View style={styles.pointsDivider} />

          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>The week points</Text>
            <Text style={styles.progressCount}>{weeklyPoints} / 5000</Text>
          </View>

          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${weeklyPercent}%`,
                },
              ]}
            />
            <View
              style={{ ...styles.progressThumb, left: `${weeklyPercent}%` }}
            />
          </View>

          <View style={styles.pointsTags}>
            <View style={styles.pointsTag}>
              <Text style={styles.pointsTagText}>
                {topPercent <= 10
                  ? '👑 Elite Challenger'
                  : topPercent <= 25
                  ? `🏅 Top ${topPercent}%`
                  : '🔥 Rising Challenger'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* WINNERS (UNCHANGED) */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Week Quiz Winner</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>Top 3</Text>
          </View>
        </View>

        <View style={{ paddingBottom: height / 9 }}>
          {weekWinners.map((item, index) => (
            <WeekWinnerCard key={index} item={item} index={index} />
          ))}
        </View>
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  scroll: {
    paddingTop: (StatusBar.currentHeight || 44) + 12,
    paddingHorizontal: 18,
    paddingBottom: 48,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  headerAvatarText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
  headerText: { flex: 1, marginLeft: 12 },
  headerGreeting: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
  },
  headerDate: {
    color: colors.white,
    fontSize: 17,
    fontFamily: fontFamily.montserratBold,
  },
  chatBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Stats strip ── */
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
    overflow: 'hidden',
    flexWrap: 'wrap',
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statPillBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
  },
  statPillValue: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
  },
  statPillUnit: {
    color: colors.secondary,
    fontSize: 10,
    fontFamily: fontFamily.montserratMedium,
    marginTop: 1,
  },
  statPillLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 2,
  },

  /* ── Steps card ── */
  stepsCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.25)',
    backgroundColor: 'rgba(143,175,120,0.07)',
    padding: 18,
    marginBottom: 14,
    overflow: 'hidden',
  },
  stepsIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(143,175,120,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepsCardBody: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 12,
  },
  stepsLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  stepsValue: {
    color: colors.secondary,
    fontSize: 26,
    fontFamily: fontFamily.montserratBold,
  },
  stepsGoalWrap: {
    position: 'absolute',
    top: 18,
    right: 18,
    alignItems: 'flex-end',
  },
  stepsGoalPct: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fontFamily.montserratBold,
  },
  stepsGoalLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
  },
  stepsProgressBg: {
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  stepsProgressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  stepsMsgRow: {},
  stepsMsgTitle: {
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
    marginBottom: 4,
  },
  stepsMsgSub: {
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
    color: colors.grey,
  },

  /* ── Points card ── */
  pointsCard: {
    borderRadius: 24,
    backgroundColor: colors.bubbleDark,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    padding: 20,
    marginBottom: 28,
  },
  pointsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsLabel: {
    color: colors.grey,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    marginBottom: 6,
  },
  pointsValue: {
    fontSize: 32,
    fontFamily: fontFamily.montserratBold,
    color: colors.white,
  },
  pointsPts: {
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
    color: colors.grey,
  },
  pointsDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginBottom: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
    color: 'rgba(255,255,255,0.5)',
  },
  progressCount: {
    fontSize: 13,
    fontFamily: fontFamily.montserratBold,
    color: colors.white,
  },
  progressBg: {
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'visible',
    marginBottom: 16,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    width: '50%',
    backgroundColor: colors.secondary,
    borderRadius: 8,
  },
  progressThumb: {
    position: 'absolute',

    top: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.secondary,
    borderWidth: 2.5,
    borderColor: colors.bubbleDark,
    marginLeft: -7,
  },
  pointsTags: {
    flexDirection: 'row',
    gap: 8,
  },
  pointsTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
    backgroundColor: 'rgba(143,175,120,0.08)',
  },
  pointsTagText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },

  /* ── Section header ── */
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
    color: colors.white,
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 49,
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
  },
  sectionBadgeText: {
    color: colors.secondary,
    fontSize: 11,
    fontFamily: fontFamily.montserratSemiBold,
  },

  /* ── Winner cards ── */
  winnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 10,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  rankNum: {
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },
  winnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
  },
  winnerInfo: {
    flex: 1,
    marginRight: 8,
  },
  winnerName: {
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
    marginBottom: 3,
  },
  winnerWorkouts: {
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
    color: 'rgba(255,255,255,0.4)',
  },
  winnerRight: {
    flexDirection: 'row',
  },
  winnerSteps: {
    fontSize: 13,
    fontFamily: fontFamily.montserratBold,
  },
  winnerStepsLabel: {
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    color: 'rgba(255,255,255,0.4)',
  },
});
