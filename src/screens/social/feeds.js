import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../constant/colors';
import { fontFamily as ff } from '../../constant';
import ChatCard from '../../components/social/chatCard';
import auth from '@react-native-firebase/auth';
import ProfileHeader from '../../components/profile/ProfileHeader';
import { Wrapper } from '../../components';
import database, { onValue } from '@react-native-firebase/database';
import moment from 'moment';

const { height } = Dimensions.get('window');

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
  const [userData, setUserData] = useState(null);
  const userId = auth().currentUser?.uid || 'USER_UID';

  useEffect(() => {
    const postsRef = database().ref('posts').limitToLast(20);
    const userRef = database().ref(`users/${userId}`);

    const unsubscribe = onValue(userRef, snapshot => {
      if (snapshot.exists()) {
        setUserData(snapshot.val());

        console.log('User Data => ', snapshot.val());
      } else {
        console.log('No user found');
      }
    });

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

    return () => {
      postsRef.off('value', listener);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const deletePost = async postId => {
    try {
      if (!postId) return;

      await database().ref(`/posts/${postId}`).remove();

      console.log('Post deleted:', postId);
    } catch (error) {
      console.log('Delete error:', error);
    }
  };

  const mergedQuiz = userData?.quizzes?.days || {};

  return (
    <View style={styles.container}>
      <View
        style={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 15,
          zIndex: 1,
        }}
      >
        <ProfileHeader
          userData={userData?.profile}
          startDate={
            moment(userData?.goal?.startDate)?.format('YYYY-MM-DD') || ''
          }
          streakData={mergedQuiz}
        />
      </View>
      <Wrapper
        orbsRight
        safeAreaPops={{ edges: ['bottom'] }}
        containerStyle={{ paddingHorizontal: 0, paddingBottom: height / 12 }}
      >
        <FlatList
          data={filteredPosts}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          // ListHeaderComponent={
          //   <>
          //     {/* Search */}
          //     {!hideStories ? (
          //       <>
          //         <View style={styles.searchRow}>
          //           <Text style={styles.searchIcon}>🔍</Text>
          //           <TextInput
          //             style={styles.searchInput}
          //             placeholder="Search friends or posts…"
          //             placeholderTextColor="rgba(255,255,255,0.3)"
          //             value={search}
          //             onChangeText={setSearch}
          //           />
          //         </View>

          //         {/* Stories */}
          //         <Text style={styles.sectionLabel}>Stories</Text>
          //         <FlatList
          //           data={STORIES}
          //           horizontal
          //           keyExtractor={s => s.id.toString()}
          //           showsHorizontalScrollIndicator={false}
          //           contentContainerStyle={styles.storiesRow}
          //           renderItem={({ item }) => <StoryItem story={item} />}
          //         />
          //       </>
          //     ) : (
          //       <View />
          //     )}

          //     {/* Feed label */}
          //     <View style={styles.feedLabelRow}>
          //       <Text style={styles.sectionLabel}>Community Feed</Text>
          //       <TouchableOpacity
          //         activeOpacity={0.7}
          //         onPress={() => setHideStories(!hideStories)}
          //       >
          //         <Text style={styles.seeAll}>
          //           {hideStories ? 'See Less' : 'See all'}
          //         </Text>
          //       </TouchableOpacity>
          //     </View>
          //   </>
          // }

          renderItem={({ item, index }) => {
            return (
              <ChatCard
                item={{
                  ...item,
                  name: item?.name,
                  message: item?.message || item?.text,
                  picture: item?.image,
                  time: formatTime(item?.createdAt),
                  likes: item?.likesCount,
                  comments: item?.commentsCount,
                  isLiked: item?.isLiked,

                  beverageName: item.beverageName,
                  ingredients: item.ingredients || [],
                  type: item.type,

                  snackName: item?.snackName,
                  qty: item?.qty,
                  type: item?.type,
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
                isUser={
                  userId == item?.userId || userData?.profile?.role == 'admin'
                }
                onDeletePress={() => deletePost(item?.id)}
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
    bottom: height / 8,
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
