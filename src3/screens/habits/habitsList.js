import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Animated,
  Pressable,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { colors, fontFamily } from '../../constant';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const CATEGORIES = ['All', 'Fitness', 'Nutrition', 'Sleep', 'Wellness'];

const CATEGORY_STYLE = {
  Fitness: {
    bg: 'rgba(90,150,255,0.12)',
    border: 'rgba(90,150,255,0.35)',
    dot: '#5A96FF',
    emoji: '🏃',
  },
  Nutrition: {
    bg: 'rgba(255,193,90,0.12)',
    border: 'rgba(255,193,90,0.35)',
    dot: '#FFC15A',
    emoji: '🥗',
  },
  Sleep: {
    bg: 'rgba(167,130,255,0.12)',
    border: 'rgba(167,130,255,0.35)',
    dot: '#A782FF',
    emoji: '😴',
  },
  Wellness: {
    bg: 'rgba(143,175,120,0.14)',
    border: 'rgba(143,175,120,0.4)',
    dot: '#8FAF78',
    emoji: '🌿',
  },
};

const ALL_HABITS = [
  {
    id: 1,
    title: 'Nutrition Session',
    description: 'Book and attend a free nutrition counseling session',
    screenName: 'BookAnAppointment',
    category: 'Nutrition',
  },
  {
    id: 2,
    title: 'Daily Steps',
    description: 'Walk your target number of steps every day',
    screenName: 'WalkingRewardBoard',
    category: 'Fitness',
  },
  {
    id: 3,
    title: 'Fiber Goal',
    description: 'Eat 25–38g fiber daily for at least 20 days',
    screenName: 'FiberChartDays',
    category: 'Nutrition',
  },
  {
    id: 4,
    title: 'Sleep Well',
    description: 'Get 7–9 hours of sleep each night',
    screenName: 'SleepClock',
    category: 'Sleep',
  },
  {
    id: 5,
    title: 'Fitness Class',
    description: 'Join a weekly fitness class',
    screenName: 'FitnessClassUI',
    category: 'Fitness',
  },
  {
    id: 6,
    title: 'Strength Training',
    description: 'Do weight training at least 2x per week',
    screenName: 'WeightTrainingUI',
    category: 'Fitness',
  },
  {
    id: 7,
    title: 'Safe Weight Loss',
    description: 'Lose no more than 2 lbs per week for 4 weeks',
    screenName: 'WeightChallengeUI',
    category: 'Wellness',
  },
  {
    id: 8,
    title: 'Half Plate Veggies',
    description: 'Make half your plate fruits & veggies once daily',
    screenName: 'HalfPlateFruitsVeggies',
    category: 'Nutrition',
  },
  {
    id: 9,
    title: 'Meatless Day',
    description: 'Go meat-free at least once per week',
    screenName: 'MeatlessChallenge',
    category: 'Nutrition',
  },
  {
    id: 10,
    title: 'Fermented Foods',
    description: 'Eat 1 fermented food daily for 7 days',
    screenName: 'FermentedFoodChallenge',
    category: 'Nutrition',
  },
  {
    id: 11,
    title: 'Body Fat Progress',
    description: 'Improve body fat percentage over time',
    screenName: 'BodyFatGoalScreen',
    category: 'Wellness',
  },
  {
    id: 12,
    title: 'Try New Veggies',
    description: 'Eat 1 new vegetable per week (2 weeks)',
    screenName: 'VeggieChallenge',
    category: 'Nutrition',
  },
  {
    id: 13,
    title: 'Limit Sugar',
    description: 'Stay under daily added sugar limit for 21 days',
    screenName: 'SugarChartDays',
    category: 'Nutrition',
  },
  {
    id: 14,
    title: 'Workout Buddy',
    description: 'Exercise with a friend 4 times',
    screenName: 'FriendWorkoutChallenge',
    category: 'Fitness',
  },
  {
    id: 15,
    title: 'Cardio Progress',
    description: 'Increase cardio time or intensity',
    screenName: 'CardioTrackerUI',
    category: 'Fitness',
  },
  {
    id: 16,
    title: 'Healthy Drinks',
    description: 'Create a no-added-sugar drink combo',
    screenName: 'BeverageChallengeUI',
    category: 'Nutrition',
  },
  {
    id: 17,
    title: 'Snack Planning',
    description: 'Build and shop a healthy snack list',
    screenName: 'SnackListingUI',
    category: 'Nutrition',
  },
  {
    id: 18,
    title: 'Daily Fruits',
    description: 'Eat 2–3 servings of fruit every day',
    screenName: 'FruitTrackerUI',
    category: 'Nutrition',
  },
  {
    id: 19,
    title: 'Custom Goal',
    description: 'Add your own personal health goal',
    screenName: 'FutureIdeasUI',
    category: 'Wellness',
  },
];

/* ── Flip Card ── */
function FlipCard({ item, navigation, index }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const entranceVal = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);
  const cs = CATEGORY_STYLE[item.category] || CATEGORY_STYLE.Wellness;

  useEffect(() => {
    Animated.timing(entranceVal, {
      toValue: 1,
      duration: 400,
      delay: (index % 2 === 0 ? 100 : 200) + Math.floor(index / 2) * 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const flipCard = () => {
    Animated.spring(animVal, {
      toValue: flipped ? 0 : 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setFlipped(p => !p);
  };

  const frontRotate = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const entranceStyle = {
    opacity: entranceVal,
    transform: [
      {
        translateY: entranceVal.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.cardWrapper, entranceStyle]}>
      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          flipCard();
          if (item.screenName !== 'HabitsList') {
            setTimeout(() => navigation?.navigate(item.screenName), 300);
          }
        }}
      >
        {/* FRONT */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: cs.bg, borderColor: cs.border },
            { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
          ]}
        >
          <Text style={styles.cardEmoji}>{cs.emoji}</Text>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
          <View style={[styles.categoryDot, { backgroundColor: cs.dot }]} />
        </Animated.View>

        {/* BACK */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { borderColor: cs.border },
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: [{ perspective: 1000 }, { rotateY: backRotate }],
            },
          ]}
        >
          <Text style={styles.cardEmoji}>{cs.emoji}</Text>
          <Text style={[styles.cardTitle, { color: colors.white }]}>
            {item.title}
          </Text>
          <Text style={[styles.cardDesc, { color: 'rgba(255,255,255,0.7)' }]}>
            {item.description}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/* ── Main Screen ── */
export default function HabitsList({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered =
    activeCategory === 'All'
      ? ALL_HABITS
      : ALL_HABITS.filter(h => h.category === activeCategory);

  const headerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <SafeAreaProvider>
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Animated.View style={{ opacity: headerFade }}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerGreeting}>Good Morning 🌿</Text>
                  <Text style={styles.headerTitle}>Your Habits</Text>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statBadge}>
                    <Text style={styles.statNum}>{ALL_HABITS.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                  <View style={[styles.statBadge, { marginLeft: 8 }]}>
                    <Text style={styles.statNum}>3</Text>
                    <Text style={styles.statLabel}>Done</Text>
                  </View>
                </View>
              </View>

              {/* Category filter */}
              <FlatList
                data={CATEGORIES}
                horizontal
                keyExtractor={c => c}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                renderItem={({ item: cat }) => {
                  const isActive = cat === activeCategory;
                  const cs = CATEGORY_STYLE[cat];
                  return (
                    <TouchableOpacity
                      style={[
                        styles.filterChip,
                        isActive && {
                          backgroundColor: cs ? cs.bg : 'rgba(143,175,120,0.2)',
                          borderColor: cs ? cs.dot : colors.secondary,
                        },
                      ]}
                      onPress={() => setActiveCategory(cat)}
                      activeOpacity={0.75}
                    >
                      {cs && <Text style={styles.filterEmoji}>{cs.emoji}</Text>}
                      <Text
                        style={[
                          styles.filterText,
                          isActive && { color: cs ? cs.dot : colors.secondary },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </Animated.View>
          }
          renderItem={({ item, index }) => (
            <FlipCard item={item} navigation={navigation} index={index} />
          )}
        />
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 4,
  },
  headerGreeting: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 28,
    fontFamily: fontFamily.montserratBold,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statBadge: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  statNum: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
  },
  filterRow: {
    paddingHorizontal: 4,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 4,
  },
  filterEmoji: {
    fontSize: 12,
  },
  filterText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  cardWrapper: {
    flex: 1,
    margin: 5,
    height: 148,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    backfaceVisibility: 'hidden',
    justifyContent: 'space-between',
  },
  cardBack: {
    backgroundColor: 'rgba(77,102,68,0.45)',
  },
  cardEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
    marginBottom: 4,
    lineHeight: 20,
  },
  cardDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fontFamily.montserratRegular,
    lineHeight: 16,
    flex: 1,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
});
