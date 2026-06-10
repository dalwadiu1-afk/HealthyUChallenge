import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import { Wrapper, Header } from '../../../components';
import { colors, fontFamily } from '../../../constant';
import { useSelector } from 'react-redux';
import auth from '@react-native-firebase/auth';
import { generateUserChallengeData } from '../../../utils/helper';
import database from '@react-native-firebase/database';
import moment from 'moment';
import analytics from '@react-native-firebase/analytics';

const RING_SIZE = 110;
const RING_STROKE = 9;

function ScoreRing({ percent, score, total }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: percent,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [percent]);

  const rightRotation = progress.interpolate({
    inputRange: [0, 0.5],
    outputRange: ['-135deg', '45deg'],
    extrapolate: 'clamp',
  });

  const leftRotation = progress.interpolate({
    inputRange: [0.5, 1],
    outputRange: ['-135deg', '45deg'],
    extrapolate: 'clamp',
  });

  return (
    <View style={ringStyles.container}>
      {/* track */}
      <View style={ringStyles.track} />

      {/* RIGHT HALF */}
      <View style={ringStyles.halfContainer}>
        <Animated.View
          style={[
            ringStyles.halfCircle,
            ringStyles.rightHalf,
            {
              transform: [{ rotate: rightRotation }],
            },
          ]}
        />
      </View>

      {/* LEFT HALF */}
      {percent > 0.5 && (
        <View
          style={[
            ringStyles.halfContainer,
            { transform: [{ rotate: '180deg' }] },
          ]}
        >
          <Animated.View
            style={[
              ringStyles.halfCircle,
              ringStyles.rightHalf,
              {
                transform: [{ rotate: leftRotation }],
              },
            ]}
          />
        </View>
      )}

      {/* CENTER */}
      <View style={ringStyles.inner}>
        <Text style={ringStyles.scoreText}>
          {score}
          <Text style={ringStyles.scoreSmall}>/{total}</Text>
        </Text>

        <Text style={ringStyles.label}>your score</Text>
      </View>
    </View>
  );
}
const ringStyles = StyleSheet.create({
  container: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  track: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  halfContainer: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  halfCircle: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    position: 'absolute',
    borderWidth: RING_STROKE,
  },

  rightHalf: {
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: colors.secondary,
    borderRightColor: colors.secondary,
  },

  inner: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scoreText: {
    color: colors.white,
    fontSize: 26,
    fontFamily: fontFamily.montserratBold,
  },

  scoreSmall: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontFamily: fontFamily.montserratMedium,
  },

  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontFamily: fontFamily.montserratMedium,
    marginTop: 2,
  },
});

export default function QuizResult({ navigation, route }) {
  const {
    questions = [],
    answers = [],
    elapsedSeconds = 0,
    quizResultData = {},
    isBonus,
  } = route?.params || {};
  const [showRewardModal, setShowRewardModal] = useState(true);
  const userId = auth()?.currentUser?.uid;
  const userData = useSelector(state => state.user);
  const profile = userData?.profile;
  const goal = userData?.goal;
  const today = moment().format('YYYY-MM-DD');
  const week = moment().format('YYYY-[W]WW');
  const month = moment().format('YYYY-MM');

  const correct = questions.reduce(
    (acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0),
    0,
  );
  const total = questions.length;
  const wrong = total - correct;
  const percent = total ? correct / total : 0;
  const passed = percent >= 0.6;

  const totalSec = Math.max(0, Math.floor(elapsedSeconds));
  const avgSec = total ? Math.round(totalSec / total) : 0;

  const saveQuizResultToDB = async () => {
    if (!userId) return;

    try {
      await analytics().logEvent('quiz_active_user', {
        date: moment().format('YYYY-MM-DD'),
      });

      analytics().logEvent('quiz_completed', {
        type: isBonus ? 'bonus' : 'normal',
        correct_answers: correct,
        total_questions: total,
        percentage: Math.round((correct / total) * 100),
        passed: correct / total >= 0.6,

        // time grouping (for later BigQuery / admin dashboard)
        date: today,
        week,
        month,
      });
      const today = moment().format('YYYY-MM-DD');

      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

      const resultData = {
        quizTakenTime: totalSec,
        correctAnswers: correct,
        wrongAnswers: wrong,
        totalQuestions: total,
        percentage,
        submittedAt: moment().toISOString(),
        lastQuizAt: Date.now(),
        isBonus: !!isBonus,
        quizType: isBonus ? 'bonus' : 'normal',
      };

      const todayQuizData = isBonus
        ? { bonusQuizzes: resultData }
        : { normalQuiz: resultData };

      await database()
        .ref(`/users/${userId}/quizzes/days/${today}`)
        .update(todayQuizData);

      const snapshot = await database()
        .ref(`/users/${userId}/quizzes/days`)
        .once('value');

      const updatedDays = snapshot.val() || {};

      const leaderboardData = generateUserChallengeData({
        userId,
        profile,
        goal,
        days: updatedDays,
      });

      await database().ref(`/leaderboards/${userId}`).update(leaderboardData);

      console.log('QUIZ SAVED');
    } catch (error) {
      console.log('SAVE QUIZ ERROR:', error);
    }
  };

  useEffect(() => {
    saveQuizResultToDB();
  }, [route?.params]);

  const fmt = secs => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}sec`;
    return `${m}m ${String(s).padStart(2, '0')}sec`;
  };

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const streak = quizResultData?.streak || 1;

  // =====================================
  // CORRECT ANSWER POINTS
  // =====================================

  const answerPoints = correct * 100;

  // =====================================
  // STREAK BONUS
  // =====================================

  const streakPoints = streak * 10;

  // =====================================
  // SPEED BONUS
  // =====================================

  let speedPoints = 0;

  if (totalSec <= 30) {
    speedPoints = 100;
  } else if (totalSec <= 60) {
    speedPoints = 50;
  } else if (totalSec <= 120) {
    speedPoints = 20;
  }

  // =====================================
  // MULTIPLIER
  // =====================================

  let multiplier = 1;

  if (!isBonus) {
    let currentMultiplier = 1;

    if (streak >= 28) {
      currentMultiplier = 1.8;
    } else if (streak >= 21) {
      currentMultiplier = 1.6;
    } else if (streak >= 14) {
      currentMultiplier = 1.4;
    } else if (streak >= 7) {
      currentMultiplier = 1.2;
    }

    multiplier = currentMultiplier;
  }

  if (isBonus) {
    multiplier = streak >= 14 ? 2.2 : 2;
  }

  // =====================================
  // TOTAL
  // =====================================

  const basePoints = answerPoints + streakPoints + speedPoints;

  const earnedPoints = Math.round(basePoints * multiplier);

  return (
    <Wrapper scrollEnable={false} orbsRight>
      <Header header="Quiz Result" />

      <Animated.View style={[styles.body, { opacity: fade }]}>
        <View style={styles.titleCard}>
          <Text style={styles.titleText}>Healthy Habits Challenge</Text>
          <Text style={styles.subText}>Wellness / Mixed Habits</Text>
        </View>

        <View style={styles.scoreCard}>
          <ScoreRing percent={percent} score={correct} total={total} />
          <View style={styles.scoreCopy}>
            <Text style={styles.congrats}>
              {passed ? 'Congratulations!' : 'Nice try!'}
            </Text>
            <Text style={styles.scoreMsg}>
              {passed ? (
                <>
                  You have <Text style={styles.passWord}>passed</Text> this test
                  with{' '}
                  <Text style={styles.passWord}>
                    {Math.round(percent * 100)}%
                  </Text>
                  .
                </>
              ) : (
                <>
                  You scored{' '}
                  <Text style={styles.passWord}>
                    {Math.round(percent * 100)}%
                  </Text>
                  . Keep practicing!
                </>
              )}
            </Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={[styles.statBox, styles.statBoxGreen]}>
            <Text style={styles.statBigNum}>{correct}</Text>
            <Text style={styles.statBigLabel}>Correct Answers</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxRed]}>
            <Text style={styles.statBigNum}>{wrong}</Text>
            <Text style={styles.statBigLabel}>Wrong Answers</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={[styles.statBox, styles.statBoxBlue]}>
            <Text style={styles.statTimeIcon}>⏱</Text>
            <Text style={styles.statBigNum}>{fmt(totalSec)}</Text>
            <Text style={styles.statBigLabel}>Total Time</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxOrange]}>
            <Text style={styles.statTimeIcon}>⏱</Text>
            <Text style={styles.statBigNum}>{fmt(avgSec)}</Text>
            <Text style={styles.statBigLabel}>Avg. time / Answer</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtnSecondary}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('QuizReview', { questions, answers })
            }
          >
            <Text style={styles.actionBtnSecondaryText}>Check Answers</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Modal visible={showRewardModal} transparent animationType="fade">
        <View style={styles.rewardOverlay}>
          <Animated.View
            style={[
              styles.rewardModal,
              {
                transform: [
                  {
                    scale: fade.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.rewardEmoji}>{isBonus ? '⚡' : '🔥'}</Text>

            <Text style={styles.rewardTitle}>
              +{earnedPoints} Points Earned
            </Text>

            <Text style={styles.rewardSub}>
              Great work completing today’s quiz
            </Text>

            <View style={styles.rewardList}>
              <Text style={styles.rewardItem}>
                ✅ +{answerPoints} for {correct} correct answers
              </Text>

              <Text style={styles.rewardItem}>
                🔥 +{streakPoints} for {streak} day streak
              </Text>

              <Text style={styles.rewardItem}>
                ⏱ +{speedPoints} speed bonus
              </Text>

              {multiplier > 1 && (
                <Text style={styles.rewardBoost}>
                  {isBonus ? '⚡' : '🚀'} {multiplier}x multiplier active
                </Text>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.rewardButton}
              onPress={() => setShowRewardModal(false)}
            >
              <Text style={styles.rewardButtonText}>Awesome</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginTop: 6,
  },
  titleCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  titleText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratBold,
  },
  subText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    marginTop: 4,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    borderRadius: 18,
    marginTop: 14,
  },
  scoreCopy: {
    flex: 1,
    paddingLeft: 16,
  },
  congrats: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 4,
  },
  scoreMsg: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: fontFamily.montserratMedium,
  },
  passWord: {
    color: colors.secondary,
    fontFamily: fontFamily.montserratBold,
  },
  statRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  statBoxGreen: {
    backgroundColor: 'rgba(107,158,110,0.18)',
    borderColor: 'rgba(107,158,110,0.45)',
  },
  statBoxRed: {
    backgroundColor: 'rgba(192,108,91,0.18)',
    borderColor: 'rgba(192,108,91,0.45)',
  },
  statBoxBlue: {
    backgroundColor: 'rgba(90,150,255,0.14)',
    borderColor: 'rgba(90,150,255,0.4)',
  },
  statBoxOrange: {
    backgroundColor: 'rgba(255,165,90,0.16)',
    borderColor: 'rgba(255,165,90,0.42)',
  },
  statBigNum: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
  },
  statBigLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    marginTop: 2,
  },
  statTimeIcon: {
    fontSize: 14,
    marginBottom: 4,
  },
  actionsRow: {
    marginTop: 18,
    gap: 10,
  },
  actionBtnSecondary: {
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: 'rgba(90,150,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(90,150,255,0.4)',
    alignItems: 'center',
  },
  actionBtnSecondaryText: {
    color: '#8FB7FF',
    fontSize: 13.5,
    fontFamily: fontFamily.montserratSemiBold,
  },
  actionBtnPrimary: {
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  actionBtnPrimaryText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },
  backToHabits: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  backToHabitsText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12.5,
    fontFamily: fontFamily.montserratSemiBold,
    textDecorationLine: 'underline',
  },

  rewardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },

  rewardModal: {
    width: '100%',
    backgroundColor: '#111',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  rewardEmoji: {
    fontSize: 46,
    textAlign: 'center',
    marginBottom: 10,
  },

  rewardTitle: {
    color: colors.white,
    fontSize: 28,
    textAlign: 'center',
    fontFamily: fontFamily.montserratBold,
  },

  rewardSub: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 6,
    marginBottom: 24,
    fontFamily: fontFamily.montserratMedium,
  },

  rewardList: {
    gap: 14,
  },

  rewardItem: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fontFamily.montserratSemiBold,
  },

  rewardBoost: {
    color: '#FFD700',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fontFamily.montserratBold,
  },

  rewardButton: {
    marginTop: 26,
    backgroundColor: colors.secondary,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },

  rewardButtonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratBold,
  },
});
