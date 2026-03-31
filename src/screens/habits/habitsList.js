import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Animated,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Header, Wrapper } from '../../components';
import { fontFamily } from '../../constant';

/* =========================
   Flip Card Component
========================= */
const FlipCard = ({ item, index }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const flipCard = () => {
    Animated.timing(animatedValue, {
      toValue: flipped ? 0 : 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const isEven = index % 2 === 0;

  // Rotation values
  const frontRotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', isEven ? '180deg' : '180deg'],
  });

  const backRotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [isEven ? '180deg' : '180deg', '360deg'],
  });

  return (
    <Pressable style={{ flex: 1 }} onPress={flipCard}>
      <View style={styles.cardContainer}>
        {/* FRONT */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { perspective: 1000 },
                isEven
                  ? !isEven
                    ? { rotateY: frontRotate }
                    : { rotateX: frontRotate }
                  : { rotateY: frontRotate },
              ],
            },
          ]}
        >
          <Text style={styles.title}>{item?.title}</Text>
          <Text style={styles.description}>{item?.description}</Text>
        </Animated.View>

        {/* BACK */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            {
              position: 'absolute',
              top: 0,
              transform: [
                { perspective: 1000 },
                isEven ? { rotateY: backRotate } : { rotateX: backRotate },
              ],
            },
          ]}
        >
          {/* 👇 TEXT DOES NOT ROTATE NOW */}
          <View style={styles.innerContent}>
            <Text style={styles.title}>{item?.title}</Text>
            <Text style={styles.description}>{item?.description}</Text>
          </View>
        </Animated.View>
      </View>
    </Pressable>
  );
};

/* =========================
   Main Screen
========================= */
export default function HabitsList() {
  const data = [
    {
      id: 1,
      title: 'Nutrition Session',
      description: 'Book and attend a free nutrition counseling session',
      completed: false,
      progress: 0,
      target: 1,
      category: 'nutrition',
    },
    {
      id: 2,
      title: 'Daily Steps',
      description: 'Walk your target number of steps every day',
    },
    {
      id: 3,
      title: 'Fiber Goal',
      description: 'Eat 25–38g fiber daily for at least 20 days',
    },
    {
      id: 4,
      title: 'Sleep Well',
      description: 'Get 7–9 hours of sleep each night',
    },
    {
      id: 5,
      title: 'Fitness Class',
      description: 'Join a weekly fitness class',
    },
    {
      id: 6,
      title: 'Strength Training',
      description: 'Do weight training at least 2x per week',
    },
    {
      id: 7,
      title: 'Safe Weight Loss',
      description: 'Lose no more than 2 lbs per week for 4 weeks',
    },
    {
      id: 8,
      title: 'Half Plate Veggies',
      description: 'Make half your plate fruits & veggies once daily',
    },
    {
      id: 9,
      title: 'Meatless Day',
      description: 'Go meat-free at least once per week',
    },
    {
      id: 10,
      title: 'Fermented Foods',
      description: 'Eat 1 fermented food daily for 7 days',
    },
    {
      id: 11,
      title: 'Body Fat Progress',
      description: 'Improve body fat percentage over time',
    },
    {
      id: 12,
      title: 'Try New Veggies',
      description: 'Eat 1 new vegetable per week (2 weeks)',
    },
    {
      id: 13,
      title: 'Limit Sugar',
      description: 'Stay under daily added sugar limit for 21 days',
    },
    {
      id: 14,
      title: 'Workout Buddy',
      description: 'Exercise with a friend 4 times',
    },
    {
      id: 15,
      title: 'Cardio Progress',
      description: 'Increase cardio time or intensity',
    },
    {
      id: 16,
      title: 'Healthy Drinks',
      description: 'Create a no-added-sugar drink combo',
    },
    {
      id: 17,
      title: 'Snack Planning',
      description: 'Build and shop a healthy snack list',
    },
    {
      id: 18,
      title: 'Daily Fruits',
      description: 'Eat 2–3 servings of fruit every day',
    },
    {
      id: 19,
      title: 'Custom Goal',
      description: 'Add your own personal health goal',
    },
  ];

  return (
    <Wrapper>
      <Header header="Habits" />

      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.container}
        renderItem={({ item, index }) => <FlipCard item={item} index={index} />}
      />
    </Wrapper>
  );
}

/* =========================
   Styles
========================= */
const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  cardContainer: {
    flex: 1,
    margin: 5,
    // height: 120,
  },
  card: {
    flexGrow: 1,
    backgroundColor: '#DBD9EC',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backgroundColor: '#B8B5E3',
    height: '100%',
  },
  innerContent: {
    flex: 1,
    // keeps text stable visually
  },
  title: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: fontFamily?.montserratMedium || 'System',
  },
  description: {
    fontSize: 14,
    color: '#333',
    fontFamily: fontFamily?.CircularRegular || 'System',
  },
});
