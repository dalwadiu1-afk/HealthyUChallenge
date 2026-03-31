import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Header, Wrapper } from '../../components';
import { colors, fontFamily } from '../../constant';
import { chatIcon } from '../../assets/images';
import ProfileCard from '../../components/profile/ProfileCard';

const { height, width } = Dimensions.get('window');
export default function Profile({ navigation }) {
  const options = [
    {
      icon: chatIcon,
      isMissingInfo: false,
      title: 'Goals',
      screenName: 'PersonalProfile',
      onPress: item => onCardPress(item, user),
    },
    {
      icon: chatIcon,
      title: 'My Body',
      isMissingInfo: true,
      screenName: 'ShippingInfo',
      onPress: item => onCardPress(item),
    },
    {
      icon: chatIcon,
      title: 'Instructions',
      isMissingInfo: true,
      screenName: 'Instructions',
      onPress: item => onCardPress(item),
    },
    {
      icon: chatIcon,
      title: 'Leaderboard',
      isMissingInfo: true,
      screenName: 'Leaderboard',
      onPress: item => onCardPress(item),
    },
  ];

  const onCardPress = (item, user) => {
    navigation?.navigate('ProfileStack', { screen: item?.screenName });
  };
  return (
    <Wrapper>
      <Header
        header={`Account`}
        showRightBtn={true}
        textStyle={styles.textStyle}
        // onLeftPress={() =>
        // navigation.navigate('BottomNavigation', { screen: 'SocialStack' })
        // }
        disableLeft={false}
      />

      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ProfileStack', { screen: 'ProfileDetails' })
          }
          style={styles.profileContainer}
        >
          <Image
            style={styles.profile}
            resizeMode="cover"
            source={{
              uri: 'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
            }}
          />
        </TouchableOpacity>
        <Text style={styles.nameTag}>Linh Nguyen</Text>
        <View style={styles.divider} />
        <View>
          {options.map((option, index) => {
            return <ProfileCard key={index} option={option} index={index} />;
          })}
        </View>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
    textAlign: 'center',
    fontFamily: fontFamily.montserratSemiBold,
  },
  nameTag: {
    fontSize: 24,
    lineHeight: 34,
    letterSpacing: 0,
    textAlign: 'center',
    marginTop: height * 0.01,
    fontFamily: fontFamily.montserratBold,
    color: colors.white,
  },
  divider: {
    marginTop: 40,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: colors.grey,
  },
  profile: {
    height: '100%',
    width: '100%',
    borderRadius: 100,
  },
  profileContainer: {
    height: height * 0.15,
    width: height * 0.15,
    marginTop: height * 0.05,
    alignSelf: 'center',
  },
});
