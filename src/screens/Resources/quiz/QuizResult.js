import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Wrapper, Header } from '../../../components';
import { colors, fontFamily } from '../../../constant';

const RING_SIZE = 110;
const RING_STROKE = 9;

function ScoreRing({ percent, score, total }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: percent,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const id = anim.addListener(({ value }) => {
      setDisplayed(Math.round(value * 100));
    });
    return () => anim.removeListener(id);
  }, [percent]);

  const rotateRight = anim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: ['0deg', '180deg', '180deg', '180deg'],
  });
  const rotateLeft = anim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: ['0deg', '0deg', '0deg', '180deg'],
  });

  return (
    <View style={ringStyles.outer}>
      <View style={ringStyles.track} />
      <View style={ringStyles.halfBox}>
        <Animated.View
          style={[
            ringStyles.halfFill,
            ringStyles.halfRight,
            { transform: [{ rotate: rotateRight }] },
          ]}
        />
      </View>
      <View style={[ringStyles.halfBox, ringStyles.halfBoxLeft]}>
        <Animated.View
          style={[
            ringStyles.halfFill,
            ringStyles.halfLeft,
            { transform: [{ rotate: rotateLeft }] },
          ]}
        />
      </View>
      <View style={ringStyles.center}>
        <Text style={ringStyles.scoreText}>
          {score}
          <Text style={ringStyles.scoreTextSmall}>/{total}</Text>
        </Text>
        <Text style={ringStyles.scoreLabel}>your score</Text>
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  outer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  halfBox: {
    position: 'absolute',
    width: RING_SIZE / 2,
    height: RING_SIZE,
    overflow: 'hidden',
    right: 0,
  },
  halfBoxLeft: {
    left: 0,
    right: undefined,
  },
  halfFill: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderColor: 'transparent',
  },
  halfRight: {
    borderTopColor: colors.secondary,
    borderRightColor: colors.secondary,
    transform: [{ rotate: '0deg' }],
    marginLeft: -RING_SIZE / 2,
  },
  halfLeft: {
    borderBottomColor: colors.secondary,
    borderLeftColor: colors.secondary,
    marginLeft: 0,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    color: colors.white,
    fontSize: 26,
    fontFamily: fontFamily.montserratBold,
    lineHeight: 30,
  },
  scoreTextSmall: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontFamily: fontFamily.montserratMedium,
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontFamily: fontFamily.montserratMedium,
    marginTop: 2,
  },
});

export default function QuizResult({ navigation, route }) {
  const { questions = [], answers = [], elapsedSeconds = 0 } = route?.params || {};

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
                  You have{' '}
                  <Text style={styles.passWord}>passed</Text> this test with{' '}
                  <Text style={styles.passWord}>{Math.round(percent * 100)}%</Text>
                  .
                </>
              ) : (
                <>
                  You scored{' '}
                  <Text style={styles.passWord}>{Math.round(percent * 100)}%</Text>
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
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            activeOpacity={0.85}
            onPress={() => navigation.replace('Quiz', { totalSeconds: 5 * 60 })}
          >
            <Text style={styles.actionBtnPrimaryText}>↻  Try Quiz Again</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backToHabits}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('HabitsList')}
        >
          <Text style={styles.backToHabitsText}>Back to Habits</Text>
        </TouchableOpacity>
      </Animated.View>
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
});
