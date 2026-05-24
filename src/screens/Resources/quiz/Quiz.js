import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';
import firestore from '@react-native-firebase/firestore';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function Quiz({ navigation, route }) {
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const startedAt = useRef(Date.now()).current;

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const doc = await firestore()
          .collection('quizCategories')
          .doc(route.params.categoryId)
          .get();

        const data = doc.data();

        if (!data) return;

        const qs = data.questions || [];

        setQuizData(data);
        setQuestions(qs);
        setAnswers(Array(qs.length).fill(null));

        setSecondsLeft((data.totalMinutes || 5) * 60);
        setLoaded(true);
      } catch (e) {
        console.log(e);
      }
    };

    fetchQuiz();
  }, []);
  // ---------------- TIMER ----------------
  useEffect(() => {
    if (!loaded || secondsLeft === null) return;

    if (secondsLeft <= 0) {
      finish();
      return;
    }

    const t = setTimeout(() => {
      setSecondsLeft(s => s - 1);
    }, 1000);

    return () => clearTimeout(t);
  }, [secondsLeft, loaded]);

  // ---------------- PROGRESS ----------------
  useEffect(() => {
    if (!questions.length) return;

    Animated.timing(progressAnim, {
      toValue: (index + 1) / questions.length,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [index, questions.length]);

  const animateSwap = direction => {
    fadeAnim.setValue(0);
    slideAnim.setValue(direction === 'next' ? 24 : -24);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const current = questions[index] || {};
  const selected = answers[index];

  const selectOption = optIdx => {
    setAnswers(prev => {
      const copy = [...prev];
      copy[index] = optIdx;
      return copy;
    });
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex(i => i + 1);
      animateSwap('next');
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(i => i - 1);
      animateSwap('prev');
    }
  };

  const finish = () => {
    const elapsed = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));

    navigation.replace('QuizResult', {
      quizData,
      questions,
      answers,
      elapsedSeconds: elapsed,
    });
  };

  const isLast = index === questions.length - 1;
  const timerLow = secondsLeft <= 30;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <Wrapper scrollEnable={false} orbsRight>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Quiz</Text>
        <TouchableOpacity
          onPress={finish}
          style={styles.submitChip}
          activeOpacity={0.85}
        >
          <Text style={styles.submitChipText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.quizTitle}>Healthy Habits Challenge</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Wellness / Mixed Habits</Text>
        <View style={[styles.timerBadge, timerLow && styles.timerBadgeWarn]}>
          <Text style={styles.timerBadgeIcon}>⏱</Text>
          <Text
            style={[
              styles.timerBadgeText,
              timerLow && { color: colors.danger },
            ]}
          >
            {mm}:{ss}
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[styles.progressFill, { width: progressWidth }]}
        />
      </View>

      <Animated.View
        style={[
          styles.questionWrap,
          { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
        ]}
      >
        <Text style={styles.qIndex}>
          Q.{index + 1}
          <Text style={styles.qIndexDim}> / {questions.length}</Text>
        </Text>
        <Text style={styles.qText}>{current.question}</Text>

        <View style={styles.optionsList}>
          {(current.options || []).map((opt, i) => {
            const isSelected = selected === i;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => selectOption(i)}
                activeOpacity={0.85}
                style={[styles.optionRow, isSelected && styles.optionRowActive]}
              >
                <View
                  style={[
                    styles.letterBubble,
                    isSelected && styles.letterBubbleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.letterText,
                      isSelected && styles.letterTextActive,
                    ]}
                  >
                    {OPTION_LETTERS[i]}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={prev}
          disabled={index === 0}
          activeOpacity={0.8}
          style={[styles.prevBtn, index === 0 && styles.prevBtnDisabled]}
        >
          <Text
            style={[
              styles.prevBtnText,
              index === 0 && { color: 'rgba(255,255,255,0.3)' },
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={isLast ? finish : next}
          activeOpacity={0.85}
          style={styles.nextBtn}
        >
          <Text style={styles.nextBtnText}>{isLast ? 'Submit' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: colors.white,
    fontSize: 18,
    marginTop: -2,
  },
  topTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fontFamily.montserratBold,
  },
  submitChip: {
    borderWidth: 1.2,
    borderColor: colors.secondary,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(143,175,120,0.12)',
  },
  submitChipText: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },
  quizTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fontFamily.montserratBold,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 10,
  },
  metaText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  timerBadgeWarn: {
    borderColor: 'rgba(192,108,91,0.5)',
    backgroundColor: 'rgba(192,108,91,0.12)',
  },
  timerBadgeIcon: {
    fontSize: 11,
  },
  timerBadgeText: {
    color: colors.white,
    fontSize: 11.5,
    fontFamily: fontFamily.montserratSemiBold,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 22,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  questionWrap: {
    flex: 1,
  },
  qIndex: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },
  qIndexDim: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: fontFamily.montserratMedium,
  },
  qText: {
    color: colors.white,
    fontSize: 15.5,
    lineHeight: 23,
    fontFamily: fontFamily.montserratSemiBold,
    marginTop: 10,
    marginBottom: 18,
  },
  optionsList: {
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
  },
  optionRowActive: {
    borderColor: colors.secondary,
    backgroundColor: 'rgba(143,175,120,0.14)',
  },
  letterBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  letterBubbleActive: {
    backgroundColor: colors.secondary,
  },
  letterText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: fontFamily.montserratBold,
  },
  letterTextActive: {
    color: colors.white,
  },
  optionText: {
    flex: 1,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13.5,
    fontFamily: fontFamily.montserratMedium,
  },
  optionTextActive: {
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  prevBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 28,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  prevBtnDisabled: {
    opacity: 0.5,
  },
  prevBtnText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },
  nextBtn: {
    paddingHorizontal: 32,
    paddingVertical: 13,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  nextBtnText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },
});
