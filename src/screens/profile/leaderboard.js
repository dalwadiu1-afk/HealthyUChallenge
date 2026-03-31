import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { Header, SvgImg, Wrapper } from '../../components';
import { fontFamily } from '../../constant';
import { downIcon, upIcon } from '../../assets/images';

const { height, width } = Dimensions.get('window');
export default function Leaderboard() {
  const order = [3, 1, 2];
  const mineData = {
    currentRank: 12,
    name: 'Linh Nguyen',
    point: 4,
    previousRank: 12,
    me: true,
  };
  const topThree = [
    {
      rank: 1,
      name: 'Linh Nguyen',
      point: 100,
    },
    {
      rank: 2,
      name: 'Linh Nguyen',
      point: 90,
    },
    {
      rank: 3,
      name: 'Linh Nguyen',
      point: 80,
    },
  ];
  const data = [
    {
      currentRank: 4,
      name: 'Linh Nguyen',
      point: 70,
      previousRank: 2,
    },
    {
      currentRank: 5,
      name: 'Linh Nguyen',
      point: 60,
      previousRank: 5,
    },
    {
      currentRank: 6,
      name: 'Linh Nguyen',
      point: 50,
      previousRank: 7,
    },
    {
      currentRank: 7,
      name: 'Linh Nguyen Linh Nguyen  Linh Nguyen',
      point: 40,
      previousRank: 6,
    },
    {
      currentRank: 8,
      name: 'Linh Nguyen',
      point: 30,
      previousRank: 10,
    },

    {
      currentRank: 9,
      name: 'Linh Nguyen',
      point: 20,
      previousRank: 8,
    },
    {
      currentRank: 10,
      name: 'Linh Nguyen',
      point: 10,
      previousRank: 9,
    },
    { currentRank: 11, name: 'Linh Nguyen', point: 5, previousRank: 11 },
    {
      currentRank: 12,
      name: 'Linh Nguyen',
      point: 4,
      previousRank: 12,
      me: true,
    },
    {
      currentRank: 13,
      name: 'Linh Nguyen',
      point: 3,
      previousRank: 13,
    },
    {
      currentRank: 14,
      name: 'Linh Nguyen',
      point: 2,
      previousRank: 14,
    },
  ];
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const sortedData = order.map(rank =>
      topThree.find(item => item.rank === rank),
    );
    console.log('sortedData :>> ', sortedData);
    setRanking(sortedData);
  }, []);

  const TopRankingCard = ({ rank, name, point, profileContainer }) => {
    return (
      <View>
        <>
          <View style={{ ...styles.profileContainer, ...profileContainer }}>
            <Image
              source={{
                uri: 'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
              }}
              style={{
                width: '100%',
                height: '100%',
              }}
              resizeMode="cover"
            />
          </View>
          <Text
            style={{
              ...styles.profileText,
              fontSize: rank == 1 ? 14 : rank == 2 ? 12 : 11,
              width:
                rank == 1
                  ? height * 0.14
                  : rank == 2
                  ? height * 0.12
                  : height * 0.1,
            }}
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text
            style={{
              ...styles.profileText,
              fontSize: rank == 1 ? 14 : rank == 2 ? 12 : 11,
              fontFamily: fontFamily.montserratSemiBold,

              width:
                rank == 1
                  ? height * 0.14
                  : rank == 2
                  ? height * 0.12
                  : height * 0.1,
            }}
            numberOfLines={1}
          >
            {point} points
          </Text>
        </>
        <View
          style={{
            ...styles.tags,
            backgroundColor:
              rank == 1 ? 'gold' : rank == 2 ? 'silver' : 'brown',
            left: (rank == 1 && height * 0.01) || (rank == 3 && height * 0),
            right: rank == 2 && height * 0.01,
          }}
        >
          <Text
            style={{
              fontFamily: fontFamily.montserratSemiBold,
              fontSize: 12,
              color: rank == 2 || rank == 1 ? 'black' : 'white',
            }}
          >
            {rank}
          </Text>
        </View>
      </View>
    );
  };

  const RankingCard = ({ item, index }) => {
    return (
      <View
        key={index}
        style={{
          marginTop: index == 0 ? 20 : 0,
          ...styles.rankingContainer,
          backgroundColor: item?.me ? '#DBD9EC' : 'white',
        }}
      >
        <Text
          style={{
            fontFamily: fontFamily.montserratSemiBold,
            fontSize: 16,
          }}
        >
          {item.currentRank}
        </Text>
        <View style={styles.picContainer}>
          <Image
            source={{
              uri: 'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
            }}
            style={styles.profile}
          />
          <Text
            style={{
              fontFamily: fontFamily.montserratMedium,
              fontSize: 16,
              width: width * 0.4,
            }}
            numberOfLines={1}
          >
            {item?.name}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: fontFamily.montserratSemiBold,
              fontSize: 16,
              marginRight: 6,
            }}
          >
            {item.point}pts
          </Text>
          {item?.currentRank != item?.previousRank ? (
            <SvgImg
              iconName={
                item?.currentRank > item?.previousRank ? upIcon : downIcon
              }
              height={14}
              width={14}
            />
          ) : (
            <View style={{ width: 14, height: 14 }} />
          )}
        </View>
      </View>
    );
  };

  return (
    <Wrapper containerStyle={{ paddingHorizontal: 0 }}>
      <Header
        header={`Leaderboard`}
        showRightBtn={true}
        textStyle={styles.textStyle}
        disableLeft={false}
        headerContainer={{ paddingHorizontal: 23 }}
      />

      <View style={styles.container}>
        <View style={styles.topRankingContainer}>
          {ranking.map((player, index) => (
            <TopRankingCard
              key={index}
              rank={player.rank}
              name={player.name}
              point={player.point}
              profileContainer={{
                width:
                  player.rank == 1
                    ? height * 0.14
                    : player.rank == 2
                    ? height * 0.13
                    : height * 0.1,
                height:
                  player.rank == 1
                    ? height * 0.14
                    : player.rank == 2
                    ? height * 0.13
                    : height * 0.1,
                borderColor:
                  player.rank == 1
                    ? 'gold'
                    : player.rank == 2
                    ? 'silver'
                    : 'brown',
              }}
            />
          ))}
        </View>

        <View style={styles.content}>
          <FlatList
            data={data}
            renderItem={({ item, index }) => {
              return <RankingCard key={index} item={item} index={index} />;
            }}
            showsVerticalScrollIndicator={false}
            // hide current rank when scroll enough
          />
          <View style={{ position: 'absolute', bottom: 10, width: '100%' }}>
            {mineData && (
              <RankingCard item={mineData} index={mineData.currentRank} />
            )}
          </View>
        </View>
      </View>
    </Wrapper>
  );
}
const styles = StyleSheet.create({
  textStyle: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    fontFamily: fontFamily.montserratSemiBold,
  },
  container: {
    flex: 1,
  },
  profileContainer: {
    width: height * 0.15,
    height: height * 0.15,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 2,
  },
  profileText: {
    fontFamily: fontFamily.montserratLight,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  tags: {
    zIndex: 1,
    alignItems: 'center',
    position: 'absolute',
    height: 18,
    width: 18,
    borderRadius: 100,
    alignContent: 'center',
    top: height * 0.012,
  },
  profile: {
    height: height * 0.06,
    width: height * 0.06,
    borderRadius: 100,
    marginRight: 10,
  },
  topRankingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 23,
  },
  rankingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 17,
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 100,
    marginHorizontal: 17,
  },
  content: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#CAC8DB',
    borderRadius: 30,
  },
  picContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    flex: 1,
  },
});
