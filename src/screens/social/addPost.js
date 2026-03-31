import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Header, SvgImg, Wrapper } from '../../components';
import ChatCard from '../../components/social/chatCard';
import { colors } from '../../constant/colors';
import { attachIcon, chatIcon, uploadIcon } from '../../assets/images';

export default function AddPost() {
  const posts = [
    {
      id: 1,
      name: 'Linh Nguyen',
      message:
        'I am very happy to be with Cafit in training sessions and how about you?',
      time: '10:30 AM || 2s ago',
      picture:
        'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    },
    // {
    //   id: 2,
    //   name: 'John Doe',
    //   message:
    //     'I am very happy to be with Cafit in training sessions and how about you?',
    //   time: '10:30 AM || 2s ago',
    //   picture:
    //     'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    // },
  ];
  return (
    <Wrapper>
      <View style={{ flex: 1 }}>
        <Header
          header={`Linh's Post`}
          showRightBtn={true}
          textStyle={styles.textStyle}
        />
        <View style={{ flex: 1 }}>
          {posts.map((item, index) => (
            <ChatCard key={index} item={item} />
          ))}
        </View>
        <View style={styles.commentContainer}>
          <View style={styles.attachBtn}>
            <SvgImg iconName={attachIcon} height={24} width={24} />
          </View>
          <TextInput
            placeholder="Write a comment..."
            style={styles.textInput}
          />
          <View
            style={{
              ...styles.attachBtn,
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            <SvgImg iconName={uploadIcon} height={24} width={24} />
          </View>
        </View>
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
  attachBtn: {
    width: 45,
    height: 45,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textInput: {
    flex: 1,
    marginHorizontal: 12,
    backgroundColor: colors.white,
    paddingVertical: 15,
    borderRadius: 50,
    paddingHorizontal: 20,
  },
  commentContainer: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
});
