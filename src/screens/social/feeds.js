/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SearchBar, SvgImg, Wrapper } from '../../components';
import { colors } from '../../constant/colors';
import { chatIcon, heartIcon, shareIcon } from '../../assets/images';
import ChatCard from '../../components/social/chatCard';
import { fontFamily } from '../../constant';

const { height } = Dimensions.get('window');

export default function Feeds({ navigation }) {
  const chats = [
    {
      id: 1,
      name: 'Linh Nguyen',
      message:
        'I am very happy to be with Cafit in training sessions and how about you and how about youand how about youand how about youand how about you?',
      time: '10:30 AM || 2s ago',
      picture:
        'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
      likes: 20,
      comments: 10,
    },
    {
      id: 2,
      name: 'Linh Nguyen',
      message:
        'I am very happy to be with Cafit in training sessions and how about you?',
      time: '10:30 AM || 2s ago',
      picture:
        'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
      likes: 20,
      comments: 10,
    },
    {
      id: 3,
      name: 'Linh Nguyen',
      message:
        'I am very happy to be with Cafit in training sessions and how about you?',
      time: '10:30 AM || 2s ago',
      picture:
        'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
      likes: 20,
      comments: 10,
    },
  ];

  const onCardPress = () => {
    navigation.navigate('FeedStack', { screen: 'FeedDetails' });
  };

  const renderChats = ({ item, index }) => {
    return (
      <ChatCard
        key={index}
        item={item}
        index={index}
        onCardPress={onCardPress}
      />
    );
  };

  return (
    <Wrapper>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ProfileStack', {
              screen: 'ProfileDetails',
            })
          }
          style={styles.leftPhoto}
        />
        <View style={{ marginLeft: 12, justifyContent: 'center', flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              color: colors.white,
              fontFamily: fontFamily.montserratMedium,
            }}
          >
            Hello Linh!
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontFamily: fontFamily.montserratBold,
              color: colors.white,
            }}
          >
            Thursday, 08 July
          </Text>
        </View>
        <View style={styles.chatBtn}>
          <SvgImg iconName={chatIcon} height={35} width={35} />
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchBoxContainer}>
        <SearchBar />
      </View>

      {/* Chats */}
      <FlatList
        data={chats}
        renderItem={renderChats}
        showsVerticalScrollIndicator={false}
      />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight,
    flexDirection: 'row',
    paddingBottom: 10,
  },
  leftPhoto: {
    backgroundColor: 'blue',
    width: 68,
    height: 68,
    borderRadius: 50,
  },
  rightPhoto: {
    backgroundColor: 'blue',
    width: 68,
    height: 68,
    borderRadius: 50,
  },
  chatBtn: {
    width: 68,
    height: 68,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    marginBottom: 12,
    padding: 24,
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 36,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 100,
    backgroundColor: 'green',
  },
  time: {
    fontWeight: 400,
    fontSize: 14,
    lineHeight: 24,
    letterSpacing: 0,
  },
  message: {
    fontWeight: 400,
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counts: {
    fontSize: 14,
    color: colors.black,
    paddingHorizontal: 10,
    fontWeight: 400,
    lineHeight: 24,
    letterSpacing: 0,
  },
  searchBoxContainer: {
    marginTop: height * 0.14,
    position: 'absolute',
    flex: 1,
    width: '112.3%',
    paddingHorizontal: 24,
    zIndex: 1,
  },
});
