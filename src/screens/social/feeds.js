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
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ChatCard from '../../components/social/chatCard';
import { StreakCalendar, Wrapper } from '../../components';
import { colors, fontFamily } from '../../constant';

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
  const [showCalender, setShowCalender] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  function ProfileHeader({}) {
    return (
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() =>
            navigation.navigate('Profile', { screen: 'ProfileDetails' })
          }
          activeOpacity={0.8}
        >
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>LN</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerGreeting}>Hello Linh 👋</Text>
          <TouchableOpacity onPress={() => setShowCalender(!showCalender)}>
            <Text style={styles.headerDate}>Thursday, 08 July</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.notifBtn} activeOpacity={0.8}>
          <Text style={styles.notifIcon}>🔔</Text>
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </Animated.View>
    );
  }

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

  return (
    <View style={styles.container}>
      <Wrapper containerStyle={{ flex: 1 }} scrollEnable={false} onlyTop>
        {/* Header */}

        <ProfileHeader />

        <FlatList
          style={{ flex: 1 }}
          data={POSTS}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => {
            return (
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

                {/* Feed label */}
                <View style={styles.feedLabelRow}>
                  <Text style={styles.sectionLabel}>Community Feed</Text>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
              </>
            );
          }}
          renderItem={({ item, index }) => (
            <ChatCard
              item={item}
              index={index}
              onCardPress={() => navigation.navigate('FeedDetails')}
            />
          )}
        />

        {/* FAB — add post */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddPost')}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>✏️</Text>
        </TouchableOpacity>
        {showCalender ? (
          <StreakCalendar
            showInsight={showInsight}
            setShowInsight={setShowInsight}
          />
        ) : (
          <View />
        )}
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  listContent: {
    flex: 1,
    // flexGrow: 1,
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
    fontFamily: fontFamily.montserratSemiBold,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
  headerGreeting: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },
  headerDate: {
    color: colors.white,
    fontSize: 17,
    fontFamily: fontFamily.montserratBold,
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
    fontFamily: fontFamily.montserratMedium,
  },
  sectionLabel: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratMedium,
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
    fontFamily: fontFamily.montserratBold,
  },
  storyPlus: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fontFamily.montserratBold,
  },
  storyName: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
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
    fontFamily: fontFamily.montserratMedium,
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
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
  },
  fabIcon: { fontSize: 20 },
});
