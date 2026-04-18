import React from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ChatCard from '../../components/social/chatCard';
import { colors, fontFamily } from '../../constant';
import { SvgImg } from '../../components';
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

  const comments = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: 'Linh Nguyen',
    message:
      'I am very happy to be with Cafit in training sessions and how about you?',
    time: '10:30 AM · 2s ago',
    picture:
      'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
  }));

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
        <Text style={styles.headerTitle}>Linh's Post</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Feed post */}
        <View style={styles.postWrap}>
          <ChatCard item={feed} />
        </View>

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsLabel}>Comments</Text>

          {comments.map((item, index) => (
            <View key={index} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                  }}
                >
                  <View style={styles.commentAvatar} />
                  <View style={{ marginLeft: 12, justifyContent: 'center' }}>
                    <Text style={styles.commentName}>{item?.name}</Text>
                    <Text style={styles.commentTime}>{item?.time}</Text>
                  </View>
                </View>
                <TouchableOpacity activeOpacity={0.75}>
                  <SvgImg iconName={heartIcon} height={20} width={20} />
                </TouchableOpacity>
              </View>
              <Text style={styles.commentMsg}>{item?.message}</Text>
              {index < comments.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <SvgImg iconName={chatIcon} height={28} width={28} />
      </TouchableOpacity>
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
    marginBottom: 16,
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

  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  postWrap: {
    marginBottom: 24,
  },

  commentsSection: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
  },
  commentsLabel: {
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
    marginBottom: 16,
  },

  commentItem: {
    marginBottom: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.3)',
  },
  commentName: {
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
  },
  commentTime: {
    fontFamily: fontFamily.montserratRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 1,
  },
  commentMsg: {
    fontFamily: fontFamily.montserratRegular,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginBottom: 12,
  },

  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});
