import React from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { SvgImg, Wrapper } from '../../../components';
import ProfileHeader from '../../../components/profile/ProfileHeader';
import { badgeIcon, chatIcon, rewardIcon } from '../../../assets/images';
import { colors, fontFamily } from '../../../constant';

const { height, width } = Dimensions.get('window');
export default function WalkingRewardBoard({ navigation }) {
  const weekWinners = [
    {
      rank: 1,
      profile:
        'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
      name: ' Alfred Owen',
      workouts: '8 workouts',
      steps: '151665',
    },
    {
      rank: 2,
      profile:
        'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
      name: ' Alfred Owen',
      workouts: '8 workouts',
      steps: '15169',
    },
    {
      rank: 3,
      profile:
        'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
      name: ' Alfred Owen',
      workouts: '8 workouts',
      steps: '15165',
    },
  ];

  const WeekWinnerCard = ({ item, index }) => {
    return (
      <View key={index} style={styles.cardView}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <View
            style={{
              ...styles.profileContainer,
              borderColor:
                item?.rank == 1 ? 'gold' : item?.rank == 2 ? 'silver' : 'brown',
            }}
          >
            <Image
              source={{
                uri: item?.profile,
              }}
              style={{
                width: '100%',
                height: '100%',
              }}
              resizeMode="cover"
            />
          </View>

          <View style={{ marginLeft: 17, justifyContent: 'center' }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: fontFamily.montserratSemiBold,
              }}
            >
              {item?.name}
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontSize: 14,
                fontFamily: fontFamily.montserratMedium,
                color: colors.grey,
              }}
            >
              {item?.workouts}
            </Text>
          </View>
        </View>

        <View
          style={{
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <SvgImg
            iconName={badgeIcon(
              item?.rank == 1 ? 'gold' : item?.rank == 2 ? '#8a8a8a' : 'brown',
            )}
            height={30}
            width={20}
          />
          <Text
            style={{
              marginLeft: 5,
              fontSize: 14,
              fontFamily: fontFamily.montserratSemiBold,
              // color: colors.grey,
            }}
          >
            {item?.steps} Steps
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Wrapper>
      <ProfileHeader
        profile={{ date: 'Thursday, 08 July', name: 'Hello Linh!' }}
        onProfileClick={() =>
          navigation.navigate('ProfileStack', {
            screen: 'ProfileDetails',
          })
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1 }}>
          <View style={styles.walkingTileContainer}>
            <View style={{ flexDirection: 'row' }}>
              <SvgImg iconName={chatIcon} height={56} width={56} />
              <Text style={styles.stepsText}>
                Steps{'  '}
                <Text style={{ fontFamily: fontFamily.montserratSemiBold }}>
                  2000 +
                </Text>
              </Text>
            </View>

            <View style={{ marginTop: 16 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: fontFamily.montserratSemiBold,
                  color: colors.white,
                }}
              >
                Let's keep going
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: fontFamily.montserratSemiBold,
                  color: colors.grey,
                }}
              >
                Keep participating in weekly challenges
              </Text>
            </View>
          </View>

          <View
            style={{
              ...styles.walkingTileContainer,
              padding: 0,
              paddingVertical: 12,
              backgroundColor: '#DBD9EC',
            }}
          >
            <SvgImg
              iconName={badgeIcon('#000')}
              height={24}
              width={24}
              style={{ marginLeft: 17 }}
            />
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: 23,
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text
                  style={{
                    color: colors.grey,
                    fontSize: 12,
                    fontFamily: fontFamily.montserratMedium,
                  }}
                >
                  Your Available Points
                </Text>
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 24,
                    fontFamily: fontFamily.montserratSemiBold,
                  }}
                >
                  8951 <Text style={{ fontSize: 14 }}>pts.</Text>
                </Text>
              </View>
              <SvgImg iconName={rewardIcon} height={130} width={180} />
            </View>

            {/* Pointing card */}
            <View style={{ marginHorizontal: 23 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: fontFamily.montserratLight,
                    color: colors.primary,
                  }}
                >
                  The week points
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: fontFamily.montserratBold,
                    color: '#  ',
                  }}
                >
                  25/50
                </Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.fillContainer}></View>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: fontFamily.montserratSemiBold,
                color: colors.white,
              }}
            >
              Week Winner
            </Text>

            {weekWinners?.map((item, index) => {
              return <WeekWinnerCard key={index} item={item} index={index} />;
            })}
          </View>
        </View>
      </ScrollView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  walkingTileContainer: {
    borderRadius: 24,
    marginTop: 35,
    padding: height * 0.03,
    borderWidth: 2,
    borderColor: colors.grey,
  },
  stepsText: {
    marginTop: 15,
    marginLeft: 24,
    fontFamily: fontFamily.montserratMedium,
    fontSize: 16,
    color: colors.white,
  },
  fillContainer: {
    height: '100%',
    width: '69%',
    backgroundColor: 'green',
    borderRadius: 100,
  },
  progressContainer: {
    marginTop: 10,
    height: 5,
    borderRadius: 50,
    marginHorizontal: 0,
    backgroundColor: 'red',
    overflow: 'hidden',
  },
  profileContainer: {
    width: height * 0.08,
    height: height * 0.08,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 2,
  },
  cardView: {
    padding: 10,
    marginTop: 15,
    backgroundColor: colors.white,
    borderRadius: 100,
    flexDirection: 'row',
  },
});
