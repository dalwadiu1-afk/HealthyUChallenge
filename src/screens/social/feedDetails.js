import React from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { Header, SvgImg, Wrapper } from '../../components';
import ChatCard from '../../components/social/chatCard';
import { colors } from '../../constant/colors';
import { chatIcon, heartIcon } from '../../assets/images';

const { height } = Dimensions.get('window');

export default function FeedDetails({ navigation }) {
  const feed = {
    id: 1,
    name: 'Linh Nguyen',
    message:
      'I am very happy to be with Cafit in training sessions and how about you?',
    time: '10:30 AM || 2s ago',
    picture:
      'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    likes: 20,
    comments: 10,
  };

  const comments = [
    {
      id: 1,
      name: 'Linh Nguyen',
      message:
        'I am very happy to be with Cafit in training sessions and how about you?',
      time: '10:30 AM || 2s ago',
      picture:
        'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    },
    {
      id: 1,
      name: 'Linh Nguyen',
      message:
        'I am very happy to be with Cafit in training sessions and how about you?',
      time: '10:30 AM || 2s ago',
      picture:
        'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    },
    {
      id: 1,
      name: 'Linh Nguyen',
      message:
        'I am very happy to be with Cafit in training sessions and how about you?',
      time: '10:30 AM || 2s ago',
      picture:
        'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    },
    {
      id: 1,
      name: 'Linh Nguyen',
      message:
        'I am very happy to be with Cafit in training sessions and how about you?',
      time: '10:30 AM || 2s ago',
      picture:
        'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    },
    {
      id: 1,
      name: 'Linh Nguyen',
      message:
        'I am very happy to be with Cafit in training sessions and how about you?',
      time: '10:30 AM || 2s ago',
      picture:
        'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    },
    {
      id: 1,
      name: 'Linh Nguyen',
      message:
        'I am very happy to be with Cafit in training sessions and how about you?',
      time: '10:30 AM || 2s ago',
      picture:
        'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    },
    {
      id: 1,
      name: 'Linh Nguyen',
      message:
        'I am very happy to be with Cafit in training sessions and how about you?',
      time: '10:30 AM || 2s ago',
      picture:
        'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    },
    {
      id: 1,
      name: 'Linh Nguyen',
      message:
        'I am very happy to be with Cafit in training sessions and how about you?',
      time: '10:30 AM || 2s ago',
      picture:
        'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    },
  ];

  const renderComments = ({ item, index }) => {
    return (
      <View style={{ marginTop: index === 0 ? 0 : 16 }}>
        <View style={styles.commentContainer}>
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <View style={styles.icon} />
            <View style={{ marginLeft: 17, justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                {item?.name}
              </Text>
              <Text style={styles.time}>{item?.time}</Text>
            </View>
          </View>
          <SvgImg iconName={heartIcon} height={24} width={24} />
        </View>
        <View style={{ marginTop: 6 }}>
          <Text style={styles.message}>{item?.message}</Text>
        </View>
        <View
          style={{
            paddingTop: 12,
            borderBottomWidth: 1,
            borderColor: colors.white,
          }}
        />
      </View>
    );
  };

  return (
    <Wrapper>
      <View style={{ flex: 1 }}>
        <Header
          header={`Linh's Post`}
          showRightBtn={true}
          textStyle={styles.textStyle}
          onLeftPress={() =>
            navigation.navigate('BottomNavigation', { screen: 'SocialStack' })
          }
          disableLeft={false}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ marginTop: 24 }}>
            <ChatCard item={feed} />
          </View>

          <View style={{ marginTop: 24 }}>
            <Text
              style={{ fontSize: 16, fontWeight: 'bold', color: colors.white }}
            >
              Comments
            </Text>
            <View style={{ marginTop: 16 }}>
              {comments.map((item, index) => {
                return (
                  <View key={index}>{renderComments({ item, index })}</View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.chatBtn}>
          <SvgImg iconName={chatIcon} height={35} width={35} />
        </View>
        {/* </View> */}
      </View>
    </Wrapper>
  );
}
const styles = StyleSheet.create({
  textStyle: {
    fontWeight: 700,
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
    textAlign: 'center',
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
    color: colors.white,
  },
  message: {
    fontWeight: 400,
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
    color: colors.white,
  },
  commentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  chatBtn: {
    width: 68,
    height: 68,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    right: 0,
    backgroundColor: colors.white,
  },
});
