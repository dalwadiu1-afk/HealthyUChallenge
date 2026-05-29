import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { useSelector } from 'react-redux';

import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { colors, fontFamily } from '../../constant';
import { Header, SvgImg, Wrapper } from '../../components';
import { downIcon, upIcon } from '../../assets/images';

const { height, width } = Dimensions.get('window');

function GradientBg({ id, c1, c2, r = 16, horizontal = false }) {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient
          id={id}
          x1="0"
          y1="0"
          x2={horizontal ? '1' : '0'}
          y2={horizontal ? '0' : '1'}
        >
          <Stop offset="0" stopColor={c1} stopOpacity="1" />
          <Stop offset="1" stopColor={c2} stopOpacity="1" />
        </LinearGradient>
      </Defs>

      <Rect width="100%" height="100%" fill={`url(#${id})`} rx={r} />
    </Svg>
  );
}

export default function Leaderboard({ navigation }) {
  const userId =
    useSelector(state => state.user?.uid) || auth()?.currentUser?.uid;
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED: previousRank logic (NO OVERWRITE LOOP)
  useEffect(() => {
    const leaderboardRef = database().ref('/leaderboards');

    const onValueChange = leaderboardRef.on('value', snapshot => {
      const data = snapshot.val() || {};

      if (!snapshot.exists()) {
        setLeaderboardData([]);
        setLoading(false);
        return;
      }

      const formatted = Object.entries(data).map(([uid, item]) => {
        const challenge = item?.challenge || {};
        const days = challenge?.days || {};

        const todayKey = new Date().toISOString().split('T')[0];
        const todayData = days?.[todayKey] || {};

        // total quizzes completed

        const quizCompleted = item?.status?.quizCompleted || 0;

        // completed active days
        const completedDays = item?.status?.completedDays || 0;

        // consistency
        const consistency = item?.status?.consistency || 0;
        const durationDays = challenge?.durationDays || 1;

        // weekly points
        const weeklyPoints = Object.values(days).reduce((acc, day) => {
          return acc + (day?.points || 0);
        }, 0);

        return {
          uid,

          name: item?.name || 'User',

          avatar: item?.avatar || item?.profile || 'https://i.pravatar.cc/300',

          // MAIN TOTAL
          totalPoints: challenge?.totalChallengePoints || 0,

          // STREAKS
          streak: challenge?.streak || 0,
          longestStreak: challenge?.longestStreak || 0,

          // TODAY
          todayPoints: todayData?.points || 0,
          todayNormalPoints: todayData?.normalPoints || 0,
          todayBonusPoints: todayData?.bonusPoints || 0,

          // QUIZZES
          quizCompleted,

          // CONSISTENCY
          consistency,
          completedDays,

          // WEEK
          weeklyPoints,

          // CHALLENGE
          durationDays: challenge?.durationDays || 0,
          startDate: challenge?.startDate || '',
          endDate: challenge?.endDate || '',

          previousRank:
            typeof item?.previousRank === 'number' ? item.previousRank : null,

          challenge,
        };
      });

      // SORT
      const sorted = formatted.sort(
        (a, b) => (b.totalPoints || 0) - (a.totalPoints || 0),
      );

      // ADD RANK
      const ranked = sorted.map((item, index) => ({
        ...item,
        currentRank: index + 1,
        previousRank: item.previousRank == null ? index + 1 : item.previousRank,
      }));

      setLeaderboardData(ranked);
      setLoading(false);
    });

    return () => leaderboardRef.off('value', onValueChange);
  }, []);

  const order = [3, 1, 2];

  const topThree = useMemo(
    () => leaderboardData.slice(0, 3),
    [leaderboardData],
  );

  const data1 = useMemo(() => leaderboardData.slice(3), [leaderboardData]);

  const mineData = useMemo(
    () => leaderboardData.find(item => item.uid === userId),
    [leaderboardData, userId],
  );

  const ranking = useMemo(() => {
    return order
      .map(rank => topThree.find(item => item.currentRank === rank))
      .filter(Boolean);
  }, [topThree]);

  const medalColor = rank =>
    rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32';

  const TopRankingCard = ({ rank, item }) => {
    const isMe = item?.uid === userId;
    const size =
      rank === 1 ? height * 0.13 : rank === 2 ? height * 0.11 : height * 0.09;

    return (
      <View style={styles.topCard}>
        <View
          style={[
            styles.topAvatarWrap,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: medalColor(rank),
            },
          ]}
        >
          <Image
            source={{
              uri: item?.avatar || 'https://i.pravatar.cc/300',
            }}
            style={{ width: '100%', height: '100%', borderRadius: 100 }}
            resizeMode="cover"
          />

          <View
            style={[styles.medalTag, { backgroundColor: medalColor(rank) }]}
          >
            <Text
              style={[
                styles.medalNum,
                {
                  color: rank === 3 ? colors.white : '#1A1A1A',
                },
              ]}
            >
              {rank}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.topName, { fontSize: rank === 1 ? 13 : 11 }]}
          numberOfLines={1}
        >
          {item?.name}
        </Text>

        <Text style={[styles.topPts, { fontSize: rank === 1 ? 13 : 11 }]}>
          {item?.totalPoints || 0} pts
        </Text>
      </View>
    );
  };

  const RankingRow = ({ item, isMe, index }) => {
    const hasMoved =
      typeof item.previousRank === 'number' &&
      item.previousRank !== item.currentRank;
    return (
      <View
        style={[
          styles.rankRow,
          { marginBottom: index == data1?.length - 1 ? height / 13 : 10 },
          isMe && styles.rankRowMe,
        ]}
      >
        {isMe && (
          <GradientBg
            id={`me${item.currentRank}`}
            c1="rgba(106,148,85,0.3)"
            c2="rgba(58,90,42,0.2)"
            r={14}
          />
        )}

        <Text style={[styles.rankNum, isMe && styles.rankNumMe]}>
          {item.currentRank}
        </Text>

        <View style={styles.rankAvatarWrap}>
          <Image
            source={{
              uri: item?.avatar || 'https://i.pravatar.cc/300',
            }}
            style={styles.rankAvatar}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={[styles.rankName, isMe && styles.rankNameMe]}
            numberOfLines={1}
          >
            {item?.name}
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontFamily: fontFamily.montserratRegular,
              color: colors.white,
            }}
            numberOfLines={2}
          >
            🎯 {item?.quizCompleted || 0} quizzes · 🔥 {item?.streak || 0}{' '}
            streak ·{'\n'}
            📊 {item?.consistency || 0}% consistency
          </Text>
        </View>

        <View style={styles.rankRight}>
          <Text style={[styles.rankPts, isMe && styles.rankPtsMe]}>
            {item?.totalPoints || 0} pts
          </Text>

          {hasMoved ? (
            <SvgImg
              iconName={
                item.currentRank < item.previousRank ? upIcon : downIcon
              }
              height={12}
              width={12}
            />
          ) : (
            <View style={{ width: 12, height: 12 }} />
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.root,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Wrapper
        orbsRight
        containerStyle={{ paddingHorizontal: 0 }}
        scrollEnable={false}
      >
        <Header
          header="Quiz Leaderboard"
          headerContainer={{ paddingHorizontal: 23 }}
        />

        <View style={styles.podium}>
          {ranking.map(item => (
            <TopRankingCard
              key={item.uid}
              rank={item.currentRank}
              item={item}
            />
          ))}
        </View>

        <View style={styles.listCard}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {data1.map((item, index) => (
              <RankingRow
                key={item.uid}
                item={item}
                index={index}
                isMe={false}
              />
            ))}
          </ScrollView>
        </View>
      </Wrapper>
      {mineData && (
        <View style={styles.pinnedMe}>
          <RankingRow item={mineData} isMe />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
    paddingTop: (StatusBar.currentHeight || 44) + 8,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
  },

  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 20,
  },

  topCard: {
    alignItems: 'center',
    flex: 1,
  },
  topAvatarWrap: {
    borderWidth: 2,
    marginBottom: 6,
  },
  medalTag: {
    zIndex: 1,
    alignItems: 'center',
    position: 'absolute',
    height: 18,
    width: 18,
    borderRadius: 100,
    alignContent: 'center',
    top: height * 0.012,
  },
  medalNum: {
    fontSize: 10,
    fontFamily: fontFamily.montserratSemiBold,
  },

  topPts: {
    color: colors.secondary,
    fontFamily: fontFamily.montserratSemiBold,
    textAlign: 'center',
  },

  listCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingTop: 12,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },

  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
    minHeight: 74,
  },
  rankRowMe: {
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
  },
  rankNum: {
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
    color: 'rgba(255,255,255,0.5)',
    width: 28,
  },
  rankNumMe: {
    color: colors.secondary,
  },
  rankAvatarWrap: {
    width: height * 0.05,
    height: height * 0.05,
    borderRadius: height * 0.025,
    overflow: 'hidden',
    marginRight: 10,
  },
  rankAvatar: {
    width: '100%',
    height: '100%',
  },
  rankName: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.CircularRegular,
    color: 'rgba(255,255,255,0.8)',
  },
  rankNameMe: {
    color: colors.white,
  },
  rankRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  rankPts: {
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
    color: 'rgba(255,255,255,0.55)',
    marginRight: 4,
  },
  rankPtsMe: {
    color: colors.secondary,
  },

  pinnedMe: {
    position: 'absolute',
    bottom: height / 10,
    width: '100%',
    paddingHorizontal: 18,
  },
  topSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: fontFamily.montserratRegular,
    marginTop: 2,
    marginBottom: 2,
  },

  rankInfo: {
    flex: 1,
    marginRight: 10,
  },

  rankSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: fontFamily.montserratRegular,
    marginTop: 2,
  },
  topName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: fontFamily.montserratMedium,
  },
});
