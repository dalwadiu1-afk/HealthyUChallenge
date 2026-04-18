import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors, fontFamily } from '../../constant';
import { SvgImg } from '../../components';
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
  const order = [3, 1, 2];

  const mineData = {
    currentRank: 12,
    name: 'Linh Nguyen',
    point: 4,
    previousRank: 12,
    me: true,
  };

  const topThree = [
    { rank: 1, name: 'Linh Nguyen', point: 100 },
    { rank: 2, name: 'Linh Nguyen', point: 90 },
    { rank: 3, name: 'Linh Nguyen', point: 80 },
  ];

  const data = [
    { currentRank: 4, name: 'Linh Nguyen', point: 70, previousRank: 2 },
    { currentRank: 5, name: 'Linh Nguyen', point: 60, previousRank: 5 },
    { currentRank: 6, name: 'Linh Nguyen', point: 50, previousRank: 7 },
    {
      currentRank: 7,
      name: 'Linh Nguyen Linh Nguyen',
      point: 40,
      previousRank: 6,
    },
    { currentRank: 8, name: 'Linh Nguyen', point: 30, previousRank: 10 },
    { currentRank: 9, name: 'Linh Nguyen', point: 20, previousRank: 8 },
    { currentRank: 10, name: 'Linh Nguyen', point: 10, previousRank: 9 },
    { currentRank: 11, name: 'Linh Nguyen', point: 5, previousRank: 11 },
    {
      currentRank: 12,
      name: 'Linh Nguyen',
      point: 4,
      previousRank: 12,
      me: true,
    },
    { currentRank: 13, name: 'Linh Nguyen', point: 3, previousRank: 13 },
    { currentRank: 14, name: 'Linh Nguyen', point: 2, previousRank: 14 },
  ];

  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const sorted = order.map(rank => topThree.find(item => item.rank === rank));
    setRanking(sorted);
  }, []);

  const medalColor = rank =>
    rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32';

  const TopRankingCard = ({ rank, name, point, profileContainer }) => {
    const size =
      rank === 1 ? height * 0.13 : rank === 2 ? height * 0.11 : height * 0.09;
    return (
      <View style={styles.topCard}>
        <View
          style={[
            styles.topAvatarWrap,
            profileContainer,
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
              uri: 'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
            }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          <View
            style={[styles.medalTag, { backgroundColor: medalColor(rank) }]}
          >
            <Text
              style={[
                styles.medalNum,
                { color: rank === 3 ? colors.white : '#1A1A1A' },
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
          {name}
        </Text>
        <Text
          style={[styles.topPts, { fontSize: rank === 1 ? 13 : 11 }]}
          numberOfLines={1}
        >
          {point} pts
        </Text>
      </View>
    );
  };

  const RankingRow = ({ item, isMe }) => (
    <View style={[styles.rankRow, isMe && styles.rankRowMe]}>
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
            uri: 'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
          }}
          style={styles.rankAvatar}
          resizeMode="cover"
        />
      </View>
      <Text
        style={[styles.rankName, isMe && styles.rankNameMe]}
        numberOfLines={1}
      >
        {item?.name}
      </Text>
      <View style={styles.rankRight}>
        <Text style={[styles.rankPts, isMe && styles.rankPtsMe]}>
          {item.point} pts
        </Text>
        {item?.currentRank !== item?.previousRank ? (
          <SvgImg
            iconName={
              item?.currentRank > item?.previousRank ? upIcon : downIcon
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

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
            <Path
              d="M8 1L1 8L8 15"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Top 3 podium */}
      <View style={styles.podium}>
        {ranking.map(
          (player, index) =>
            player && (
              <TopRankingCard
                key={index}
                rank={player.rank}
                name={player.name}
                point={player.point}
              />
            ),
        )}
      </View>

      {/* List */}
      <View style={styles.listCard}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {data.map((item, index) => (
            <RankingRow key={index} item={item} isMe={!!item.me} />
          ))}
        </ScrollView>

        {/* Pinned "me" row */}
        <View style={styles.pinnedMe}>
          <RankingRow item={mineData} isMe />
        </View>
      </View>
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
    overflow: 'hidden',
    borderWidth: 2,
    marginBottom: 6,
  },
  medalTag: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalNum: {
    fontSize: 10,
    fontFamily: fontFamily.montserratSemiBold,
  },
  topName: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fontFamily.montserratMedium,
    textAlign: 'center',
    width: width * 0.25,
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
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
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
    fontFamily: fontFamily.poppinsMedium,
    color: 'rgba(255,255,255,0.8)',
  },
  rankNameMe: {
    color: colors.white,
  },
  rankRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    bottom: 12,
    left: 16,
    right: 16,
  },
});
