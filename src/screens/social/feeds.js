import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors, fontFamily } from '../../constant/colors';
import { fontFamily as ff } from '../../constant';
import ChatCard from '../../components/social/chatCard';
import auth from '@react-native-firebase/auth';
import ProfileHeader from '../../components/profile/ProfileHeader';
import { Wrapper } from '../../components';
import database from '@react-native-firebase/database';

const { width } = Dimensions.get('window');

const POSTS = [
  {
    id: 1,
    name: 'Linh Nguyen',
    message:
      'Just finished a 5K morning run — feeling incredible! Who else is keeping up with their daily steps? 🏃‍♀️',
    time: '10:30 AM · 2 min ago',
    picture:
      'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    likes: 24,
    comments: 8,
  },
  {
    id: 2,
    name: 'Marcus Lee',
    message:
      'Hit a new personal best at the gym today. Consistency is everything — keep going everyone! 💪',
    time: '9:15 AM · 1 hr ago',
    picture:
      'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    likes: 41,
    comments: 12,
  },
  {
    id: 3,
    name: 'Sara Kim',
    message:
      'Meal prepped for the whole week — all balanced, all clean 🥗 Drop a 🙌 if you meal prep too!',
    time: 'Yesterday · 8:00 PM',
    picture:
      'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    likes: 33,
    comments: 5,
  },
];

const STORIES = [
  { id: 0, name: 'Your Story', color: '#4D6644', isOwn: true },
  { id: 1, name: 'Linh', color: '#5A96FF' },
  { id: 2, name: 'Marcus', color: '#A782FF' },
  { id: 3, name: 'Sara', color: '#FFC15A' },
  { id: 4, name: 'James', color: '#6B9E6E' },
  { id: 5, name: 'Priya', color: '#FF7A7A' },
];

const formatTime = timestamp => {
  if (!timestamp) return '';

  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return new Date(timestamp).toLocaleDateString();
};

function StoryItem({ story }) {
  return (
    <TouchableOpacity style={styles.storyItem} activeOpacity={0.8}>
      <View
        style={[
          styles.storyRing,
          story.isOwn && {
            borderColor: 'rgba(255,255,255,0.2)',
            borderStyle: 'dashed',
          },
        ]}
      >
        <View style={[styles.storyAvatar, { backgroundColor: story.color }]}>
          {story.isOwn ? (
            <Text style={styles.storyPlus}>+</Text>
          ) : (
            <Text style={styles.storyInitial}>{story.name[0]}</Text>
          )}
        </View>
      </View>
      <Text style={styles.storyName} numberOfLines={1}>
        {story.name}
      </Text>
    </TouchableOpacity>
  );
}

export default function Feeds({ navigation }) {
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState([]);
  const [hideStories, setHideStories] = useState(false);
  const [loading, setLoading] = useState(true);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const userId = auth().currentUser?.uid || 'USER_UID';

  useEffect(() => {
    const postsRef = database().ref('posts').limitToLast(20);

    const listener = postsRef.on('value', snapshot => {
      const data = snapshot.val();

      if (!data) {
        setPosts([]);
        return;
      }
      const formatted = Object.keys(data)
        .map(key => {
          const post = data[key];

          return {
            id: key,
            ...post,

            // 🔥 count from object
            likesCount: post.likes ? Object.keys(post.likes).length : 0,
            commentsCount: post.comments
              ? Object.keys(post.comments).length
              : 0,

            // 🔥 detect if current user liked
            isLiked: userId ? !!post.likes?.[userId] : false,
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt);

      setPosts(formatted);
      setLoading(false);
    });

    return () => postsRef.off('value', listener);
  }, []);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const headerStyle = {
    opacity: headerAnim,
    transform: [
      {
        translateY: headerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-16, 0],
        }),
      },
    ],
  };

  const filteredPosts = posts.filter(
    p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.message?.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleLike = async postId => {
    const likeRef = database().ref(`posts/${postId}/likes/${userId}`);

    const snapshot = await likeRef.once('value');

    if (snapshot.exists()) {
      await likeRef.remove(); // 🔴 unlike
    } else {
      await likeRef.set(true); // 🟢 like
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 15,
          zIndex: 1,
        }}
      >
        <ProfileHeader onPress={() => navigation.navigate('AvgSteps')} />
      </View>
      <Wrapper
        orbsRight
        safeAreaPops={{ edges: ['bottom'] }}
        containerStyle={{ paddingHorizontal: 0 }}
      >
        <FlatList
          data={filteredPosts}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* Search */}
              {!hideStories ? (
                <>
                  <View style={styles.searchRow}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search friends or posts…"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={search}
                      onChangeText={setSearch}
                    />
                  </View>

                  {/* Stories */}
                  <Text style={styles.sectionLabel}>Stories</Text>
                  <FlatList
                    data={STORIES}
                    horizontal
                    keyExtractor={s => s.id.toString()}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.storiesRow}
                    renderItem={({ item }) => <StoryItem story={item} />}
                  />
                </>
              ) : (
                <View />
              )}

              {/* Feed label */}
              <View style={styles.feedLabelRow}>
                <Text style={styles.sectionLabel}>Community Feed</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setHideStories(!hideStories)}
                >
                  <Text style={styles.seeAll}>
                    {hideStories ? 'See Less' : 'See all'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          }
          renderItem={({ item, index }) => {
            console.log('object :>> ', item);
            return (
              <ChatCard
                item={{
                  name: item?.name,
                  message: item?.message,
                  picture: item?.image,
                  time: formatTime(item?.createdAt),
                  likes: item?.likesCount,
                  comments: item?.commentsCount,
                  isLiked: item?.isLiked,
                }}
                index={index}
                onLikePress={() => toggleLike(item.id)}
                onCardPress={() =>
                  navigation.navigate('FeedDetails', { postId: item?.id })
                }
                onCommentPress={() =>
                  navigation.navigate('FeedDetails', {
                    postId: item?.id,
                    showComment: true,
                  })
                }
              />
            );
          }}
          ListEmptyComponent={
            <Text
              style={{ color: 'white', textAlign: 'center', marginTop: 40 }}
            >
              No posts yet 🚀
            </Text>
          }
        />
      </Wrapper>
      {/* FAB — add post (outside FlatList so absolute positioning is relative to root View) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddPost')}
        activeOpacity={0.85}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
            stroke={colors.white}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
            stroke={colors.white}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarBtn: {},
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
    fontFamily: ff.montserratSemiBold,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerGreeting: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontFamily: ff.montserratRegular,
  },
  headerDate: {
    color: colors.white,
    fontSize: 17,
    fontFamily: ff.montserratBold,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifIcon: { fontSize: 18 },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B8A',
    borderWidth: 1.5,
    borderColor: colors.dark,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    marginBottom: 22,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    color: colors.white,
    fontSize: 14,
    fontFamily: ff.montserratRegular,
  },
  sectionLabel: {
    color: colors.white,
    fontSize: 15,
    fontFamily: ff.montserratSemiBold,
    marginBottom: 12,
  },
  storiesRow: {
    gap: 14,
    paddingBottom: 20,
    paddingRight: 4,
  },
  storyItem: {
    alignItems: 'center',
    width: 62,
  },
  storyRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    borderColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  storyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyInitial: {
    color: colors.white,
    fontSize: 18,
    fontFamily: ff.montserratBold,
  },
  storyPlus: {
    color: colors.white,
    fontSize: 22,
    fontFamily: ff.montserratBold,
  },
  storyName: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontFamily: ff.montserratRegular,
    textAlign: 'center',
  },
  feedLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: ff.montserratMedium,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.4)',
  },
});
