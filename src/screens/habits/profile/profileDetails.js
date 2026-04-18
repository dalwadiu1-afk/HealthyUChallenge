// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   TouchableOpacity,
//   FlatList,
// } from "react-native";
// import { Header, Wrapper } from "../../components";
// import { colors, fontFamily } from "../../constant";

// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   interpolate,
//   Extrapolate,
//   withSpring,
// } from "react-native-reanimated";

// import {
//   Gesture,
//   GestureDetector,
//   GestureHandlerRootView,
// } from "react-native-gesture-handler";

// import ChatCard from "../../components/social/chatCard";

// const { height, width } = Dimensions.get("window");

// export default function ProfileDetails({ navigation }) {
//   const [currentTabIndex, setCurrentTabIndex] = useState(0);
//   const options = [
//     { label: "Feeds" },
//     { label: "Stats" },
//     { label: "Progress" },
//   ];

//   const translateY = useSharedValue(0);

//   // Reanimated v4 + Gesture Handler v2 — Pan gesture
//   const panGesture = Gesture.Pan()
//     .onStart(() => {
//       // ctx equivalent: capture start value via closure
//     })
//     .onChange((event) => {
//       let value = translateY.value + event.changeY;
//       if (value < -300) value = -300;
//       if (value > 0) value = 0;
//       translateY.value = value;
//     })
//     .onEnd(() => {
//       if (translateY.value < -150) {
//         translateY.value = withSpring(-300);
//       } else {
//         translateY.value = withSpring(0);
//       }
//     });

//   const imageStyle = useAnimatedStyle(() => {
//     const size = interpolate(
//       translateY.value,
//       [-800, 0],
//       [height * 0.07, width * 0.3],
//       Extrapolate.CLAMP,
//     );
//     const translateX = interpolate(
//       translateY.value,
//       [-300, 0],
//       [-width * 0.35, 0],
//       Extrapolate.CLAMP,
//     );
//     return {
//       width: size,
//       height: size,
//       borderRadius: size / 2,
//       transform: [{ translateX }],
//     };
//   });

//   const nameStyle = useAnimatedStyle(() => {
//     const translateX = interpolate(
//       translateY.value,
//       [-300, 0],
//       [-width * 0.05, 0],
//       Extrapolate.CLAMP,
//     );
//     const translateYAnim = interpolate(
//       translateY.value,
//       [-300, 0],
//       [-height * 0.14, 0],
//       Extrapolate.CLAMP,
//     );
//     const fontSize = interpolate(
//       translateY.value,
//       [-300, 0],
//       [18, 24],
//       Extrapolate.CLAMP,
//     );
//     return {
//       transform: [{ translateX }, { translateY: translateYAnim }],
//       fontSize,
//     };
//   });

//   const sheetStyle = useAnimatedStyle(() => {
//     const sheetHeight = interpolate(
//       translateY.value,
//       [-height * 0.3, height * 0.8],
//       [height * 0.75, height * 0.5],
//       Extrapolate.CLAMP,
//     );
//     return { height: sheetHeight };
//   });

//   const chats = [
//     {
//       id: 1,
//       name: "Linh Nguyen",
//       message:
//         "I am very happy to be with Cafit in training sessions and how about you?",
//       time: "10:30 AM · 2 min ago",
//       picture:
//         "https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=",
//       likes: 20,
//       comments: 10,
//     },
//     {
//       id: 2,
//       name: "Linh Nguyen",
//       message:
//         "I am very happy to be with Cafit in training sessions and how about you?",
//       time: "10:30 AM · 2 min ago",
//       picture:
//         "https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=",
//       likes: 14,
//       comments: 6,
//     },
//     {
//       id: 3,
//       name: "Linh Nguyen",
//       message:
//         "I am very happy to be with Cafit in training sessions and how about you?",
//       time: "Yesterday",
//       picture:
//         "https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=",
//       likes: 9,
//       comments: 3,
//     },
//   ];

//   const TabOption = ({ option, index }) => (
//     <TouchableOpacity
//       onPress={() => setCurrentTabIndex(index)}
//       style={{
//         flex: 1,
//         alignItems: "center",
//         backgroundColor:
//           index !== currentTabIndex ? "transparent" : colors.accent,
//         padding: 5,
//         borderRadius: 100,
//       }}
//     >
//       <Text
//         style={{
//           fontFamily: fontFamily.montserratSemiBold,
//           color:
//             index !== currentTabIndex ? colors.textPrimary : colors.secondary,
//           fontSize: 14,
//         }}
//       >
//         {option.label}
//       </Text>
//     </TouchableOpacity>
//   );

//   const renderChats = ({ item, index }) => (
//     <ChatCard
//       key={index}
//       item={item}
//       index={index}
//       onCardPress={() => {}}
//     />
//   );

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <Wrapper containerStyle={{ paddingHorizontal: 0 }}>
//         <Header
//           header="Profile"
//           showRightBtn={true}
//           textStyle={styles.textStyle}
//           disableLeft={false}
//           headerContainer={{ paddingHorizontal: 23 }}
//         />

//         <View style={{ flex: 1 }}>
//           {/* Profile image */}
//           <Animated.View style={[styles.profileContainer, imageStyle]}>
//             <Animated.Image
//               source={{
//                 uri: "https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg",
//               }}
//               style={{ width: "100%", height: "100%", borderRadius: 100 }}
//             />
//           </Animated.View>

//           {/* Name */}
//           <Animated.Text style={[styles.nameTag, nameStyle]}>
//             Linh Nguyen
//           </Animated.Text>

//           {/* Bottom sheet */}
//           <Animated.View style={[styles.sheet, sheetStyle]}>
//             <GestureDetector gesture={panGesture}>
//               <Animated.View style={styles.notch} />
//             </GestureDetector>

//             <View style={{ padding: 20, flex: 1 }}>
//               <View style={[styles.tabContainer, { marginBottom: 20 }]}>
//                 {options.map((option, index) => (
//                   <TabOption key={index} option={option} index={index} />
//                 ))}
//               </View>
//               <FlatList
//                 style={{ flex: 1 }}
//                 data={chats}
//                 renderItem={renderChats}
//                 keyExtractor={item => item.id.toString()}
//                 showsVerticalScrollIndicator={false}
//               />
//             </View>
//           </Animated.View>
//         </View>
//       </Wrapper>
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   textStyle: {
//     fontSize: 16,
//     lineHeight: 26,
//     textAlign: "center",
//     fontFamily: fontFamily.montserratSemiBold,
//   },
//   profileContainer: {
//     position: "absolute",
//     top: height * 0.02,
//     alignSelf: "center",
//     height: height * 0.08,
//     width: height * 0.08,
//   },
//   nameTag: {
//     position: "absolute",
//     top: height * 0.16,
//     alignSelf: "center",
//     fontFamily: fontFamily.montserratBold,
//     color: colors.white,
//   },
//   sheet: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: colors.white,
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//   },
//   notch: {
//     height: 6,
//     width: width * 0.15,
//     backgroundColor: colors.grey,
//     alignSelf: "center",
//     borderRadius: 10,
//     marginTop: 10,
//     marginBottom: 4,
//   },
//   tabContainer: {
//     backgroundColor: colors.accent,
//     padding: 5,
//     width: "100%",
//     borderRadius: 100,
//     flexDirection: "row",
//     justifyContent: "space-around",
//   },
// });
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Image,
} from 'react-native';
import { colors, fontFamily } from '../../constant';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
} from 'react-native-reanimated';

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import ChatCard from '../../components/social/chatCard';

const { height, width } = Dimensions.get('window');

const SHEET_MIN = height * 0.47;
const SHEET_MAX = height * 0.81;

const PROFILE_STATS = [
  { label: 'Posts', value: '24' },
  { label: 'Followers', value: '1.2K' },
  { label: 'Following', value: '318' },
];

const TAB_OPTIONS = ['Feeds', 'Stats', 'Progress'];

const CHATS = [
  {
    id: 1,
    name: 'Linh Nguyen',
    message:
      'I am very happy to be with Cafit in training sessions and how about you?',
    time: '10:30 AM · 2 min ago',
    picture:
      'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    likes: 20,
    comments: 10,
  },
  {
    id: 2,
    name: 'Linh Nguyen',
    message: 'Just finished a 5K run! Feeling amazing today 🏃‍♀️',
    time: '10:30 AM · 2 min ago',
    picture:
      'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    likes: 14,
    comments: 6,
  },
  {
    id: 3,
    name: 'Linh Nguyen',
    message: 'Hit my weekly fiber goal for the third week in a row! 🥦',
    time: 'Yesterday',
    picture:
      'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    likes: 9,
    comments: 3,
  },
];

const ACTIVITY_STATS = [
  { emoji: '🔥', label: 'Day Streak', value: '14 days' },
  { emoji: '✅', label: 'Habits Done', value: '87 total' },
  { emoji: '📅', label: 'Active Days', value: '31 days' },
  { emoji: '🏃', label: 'Steps Avg', value: '8,240 / day' },
  { emoji: '💤', label: 'Sleep Avg', value: '7.2 hrs' },
  { emoji: '🥦', label: 'Fiber Goal', value: '3× streak' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ label, value }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TabBar({ currentIndex, onPress }) {
  return (
    <View style={styles.tabBar}>
      {TAB_OPTIONS.map((label, i) => {
        const active = i === currentIndex;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => onPress(i)}
            style={[styles.tabBtn, active && styles.tabBtnActive]}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function StatsTab() {
  return (
    <View style={styles.statsGrid}>
      {ACTIVITY_STATS.map((s, i) => (
        <View key={i} style={styles.statsCard}>
          <Text style={styles.statsEmoji}>{s.emoji}</Text>
          <Text style={styles.statsCardValue}>{s.value}</Text>
          <Text style={styles.statsCardLabel}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

function ProgressTab() {
  const WEEKS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const DATA = [60, 85, 40, 100, 75, 90, 55];
  return (
    <View style={{ paddingTop: 4 }}>
      <Text style={styles.progressTitle}>Weekly Activity</Text>
      <View style={styles.barChart}>
        {WEEKS.map((day, i) => (
          <View key={i} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { height: `${DATA[i]}%` }]} />
            </View>
            <Text style={styles.barLabel}>{day}</Text>
          </View>
        ))}
      </View>
      <View style={styles.progressBadgesRow}>
        {['🥇 14-day streak', '💪 Top 10%', '🏆 Level 5'].map((badge, i) => (
          <View key={i} style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>{badge}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileDetails({ navigation }) {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onChange(event => {
      let val = translateY.value + event.changeY;
      if (val < -300) val = -300;
      if (val > 0) val = 0;
      translateY.value = val;
    })
    .onEnd(() => {
      translateY.value = withSpring(translateY.value < -150 ? -300 : 0, {
        damping: 18,
        stiffness: 120,
      });
    });

  // Avatar: shrinks in place + fades out as sheet rises (no left slide to avoid back button overlap)
  const avatarStyle = useAnimatedStyle(() => {
    const size = interpolate(
      translateY.value,
      [-300, 0],
      [width * 0.12, width * 0.26],
      'clamp',
    );
    const opacity = interpolate(translateY.value, [-200, -60], [0, 1], 'clamp');
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      opacity,
    };
  });

  // Name: slides straight up into the nav bar + font shrinks
  const nameStyle = useAnimatedStyle(() => {
    const fs = interpolate(translateY.value, [-300, 0], [16, 22], 'clamp');
    const ty = interpolate(
      translateY.value,
      [-300, 0],
      [-height * 0.113, 0],
      'clamp',
    );
    return { fontSize: fs, transform: [{ translateY: ty }] };
  });

  // "Profile" nav title: fades out as sheet rises so the animated name takes its place
  const navTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateY.value, [-80, 0], [0, 1], 'clamp');
    return { opacity };
  });

  // Hero info (handle + stats + buttons): fades out as sheet rises
  const heroInfoStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateY.value, [-100, 0], [0, 1], 'clamp');
    return { opacity };
  });

  // Sheet height
  const sheetStyle = useAnimatedStyle(() => {
    const h = interpolate(
      translateY.value,
      [-300, 0],
      [SHEET_MAX, SHEET_MIN],
      'clamp',
    );
    return { height: h };
  });

  const renderFeed = ({ item, index }) => (
    <ChatCard key={index} item={item} index={index} onCardPress={() => {}} />
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* ── Hero background ── */}
      <View style={styles.heroBg} />

      {/* ── Top nav ── */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.75}
        >
          <Text style={styles.navIcon}>‹</Text>
        </TouchableOpacity>
        <Animated.Text style={[styles.navTitle, navTitleStyle]}>
          Profile
        </Animated.Text>
        <TouchableOpacity style={styles.navBtn} activeOpacity={0.75}>
          <Text style={styles.navIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* ── Hero content ── */}
      <View style={styles.heroContent}>
        {/* Avatar */}
        <Animated.View style={[styles.avatarWrap, avatarStyle]}>
          <Image
            source={{
              uri: 'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
            }}
            style={{ width: '100%', height: '100%', borderRadius: 999 }}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Name */}
        <Animated.Text style={[styles.heroName, nameStyle]}>
          Linh Nguyen
        </Animated.Text>

        {/* Handle + stats + buttons — fade out when sheet rises */}
        <Animated.View style={[styles.heroInfo, heroInfoStyle]}>
          <Text style={styles.heroHandle}>
            @linh.nguyen · Member since 2024
          </Text>

          {/* Stat pills */}
          <View style={styles.statRow}>
            {PROFILE_STATS.map((s, i) => (
              <React.Fragment key={i}>
                <StatPill label={s.label} value={s.value} />
                {i < PROFILE_STATS.length - 1 && (
                  <View style={styles.statDivider} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* CTA buttons */}
          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.btnFollow} activeOpacity={0.82}>
              <Text style={styles.btnFollowText}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnMessage} activeOpacity={0.82}>
              <Text style={styles.btnMessageText}>Message</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* ── Bottom sheet ── */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* Drag handle */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
        </GestureDetector>

        {/* Tabs */}
        <TabBar currentIndex={currentTabIndex} onPress={setCurrentTabIndex} />

        {/* Content */}
        {currentTabIndex === 0 && (
          <FlatList
            data={CHATS}
            renderItem={renderFeed}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedList}
          />
        )}
        {currentTabIndex === 1 && (
          <FlatList
            data={[{ key: 'stats' }]}
            renderItem={() => <StatsTab />}
            keyExtractor={item => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedList}
          />
        )}
        {currentTabIndex === 2 && (
          <FlatList
            data={[{ key: 'progress' }]}
            renderItem={() => <ProgressTab />}
            keyExtractor={item => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedList}
          />
        )}
      </Animated.View>
    </GestureHandlerRootView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
  },

  // Hero
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.dark,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 8,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    color: colors.white,
    fontSize: 22,
    lineHeight: 26,
    fontFamily: fontFamily.montserratSemiBold,
  },
  navTitle: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
  },

  heroContent: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  avatarWrap: {
    borderWidth: 3,
    borderColor: colors.secondary,
    marginBottom: 8,
    overflow: 'hidden',
  },
  heroName: {
    color: colors.white,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 2,
    textAlign: 'center',
  },
  heroInfo: {
    width: '100%',
    alignItems: 'center',
  },
  heroHandle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 12,
  },

  // Stat pills
  statRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 10,
    width: '100%',
    marginBottom: 12,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
    lineHeight: 20,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },

  // CTA buttons
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btnFollow: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnFollowText: {
    color: colors.dark,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
  btnMessage: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btnMessageText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },

  // Bottom sheet
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A2219',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  handleWrap: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  handle: {
    width: width * 0.12,
    height: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: colors.secondary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
    color: 'rgba(255,255,255,0.4)',
  },
  tabTextActive: {
    color: colors.dark,
  },

  feedList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // Stats tab
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 8,
  },
  statsCard: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
    alignItems: 'flex-start',
  },
  statsEmoji: { fontSize: 22, marginBottom: 8 },
  statsCardValue: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 3,
  },
  statsCardLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },

  // Progress tab
  progressTitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 2,
    marginBottom: 14,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 110,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
    marginBottom: 16,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    flex: 1,
    width: '70%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 6,
  },
  barLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 5,
  },
  progressBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progressBadge: {
    backgroundColor: 'rgba(143,175,120,0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  progressBadgeText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
