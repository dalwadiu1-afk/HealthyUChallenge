import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';

import { Wrapper, Header } from '../../../components';
import { colors, fontFamily } from '../../../constant';
import moment from 'moment';
import { getDynamicWeekId } from '../../../utils/helper';

const { height } = Dimensions.get('window');

export default function QuizStart({ navigation, route }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const monthKey = moment().format('MM_YYYY');
  const dynamicWeekId = getDynamicWeekId();
  const { isBonus, isCombine } = route?.params || {};

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      // 1. Get month document
      const docSnap = await firestore()
        .collection(isBonus ? 'BonusQuizes' : 'quizCategories')
        .doc(monthKey)
        .get();

      // 2. Pick category (fitness)
      const categoryData = docSnap.data() || {};
      if (!categoryData) {
        console.log('No quiz found for this category');
        setQuizData(null);
        return;
      }

      // 3. Global settings
      const settingsDoc = await firestore()
        .collection('quizSettings')
        .doc('global')
        .get();

      const settingsData = settingsDoc.data() || {};

      // 4. Merge instructions
      const instructions = [
        ...(categoryData.customInstructions || []),
        ...(settingsData.generalInstructions || []),
      ];

      // 5. Set final data
      setQuizData({
        ...categoryData,
        instructions,
      });
    } catch (error) {
      console.log('Fetch quiz error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    navigation.replace('Quiz', {
      isBonus: isBonus,
      showQues: quizData?.totalQuestions,
      isCombine: isCombine,
    });
  };

  if (loading) {
    return (
      <Wrapper>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper scrollEnable={false} orbsRight>
      <Header header="Start Quiz" />

      <Animated.View
        style={[
          styles.body,
          { opacity: fade, transform: [{ translateY: slide }] },
        ]}
      >
        <Text style={styles.intro}>{quizData?.description}</Text>

        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>{quizData?.title}</Text>

            <View style={styles.heroDivider} />

            <Text style={styles.heroMeta}>
              <Text style={styles.heroMetaLabel}>Subject: </Text>

              <Text style={styles.heroMetaValue}>{quizData?.subject}</Text>
            </Text>

            <Text style={styles.heroMeta}>
              <Text style={styles.heroMetaLabel}>Chapter: </Text>

              <Text style={styles.heroMetaValue}>{quizData?.chapter}</Text>
            </Text>
          </View>

          <View style={styles.heroEmojiWrap}>
            <Text style={styles.heroEmoji}>{quizData?.emoji}</Text>

            <Text style={styles.heroEmojiSmall}>
              {quizData?.secondaryEmoji}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Questions</Text>

            <Text style={styles.statValue}>{quizData?.totalQuestions}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Time</Text>

            <Text style={styles.statValue}>{quizData?.totalMinutes} min</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Instructions:</Text>

        <View style={styles.instructionList}>
          {quizData?.instructions?.map((item, index) => (
            <InstructionRow key={index} text={item} />
          ))}
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.timerPill}>
          <Text style={styles.timerIcon}>⏱</Text>

          <Text style={styles.timerText}>{quizData?.totalMinutes}:00</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.startBtn}
          onPress={startQuiz}
        >
          <Text style={styles.startBtnText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
    </Wrapper>
  );
}

function InstructionRow({ text }) {
  return (
    <View style={styles.instructionRow}>
      <View style={styles.bullet} />

      <Text style={styles.instructionText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginTop: 4,
  },
  intro: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fontFamily.montserratMedium,
    marginBottom: 18,
  },
  heroCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(143,175,120,0.14)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.35)',
    padding: 18,
    overflow: 'hidden',
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
    lineHeight: 24,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginVertical: 10,
  },
  heroMeta: {
    fontSize: 12,
    marginBottom: 4,
  },
  heroMetaLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontFamily: fontFamily.montserratMedium,
  },
  heroMetaValue: {
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
  },
  heroEmojiWrap: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 44,
  },
  heroEmojiSmall: {
    fontSize: 20,
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 0.5,
  },
  statValue: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratBold,
    marginTop: 22,
    marginBottom: 10,
  },
  instructionList: {
    gap: 10,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
    marginTop: 7,
    marginRight: 10,
  },
  instructionText: {
    flex: 1,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12.5,
    lineHeight: 19,
    fontFamily: fontFamily.montserratMedium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: height / 13,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    // paddingHorizontal: 20,
    minWidth: 100,
    // paddingVertical: 10,
    borderRadius: 30,
  },
  timerIcon: {
    fontSize: 40,
  },
  timerText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },
  startBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: colors.secondary,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  startBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratBold,
  },
});
