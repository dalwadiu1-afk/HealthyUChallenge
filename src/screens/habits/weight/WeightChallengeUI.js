import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  StyleSheet,
} from 'react-native';

import { LineChart } from 'react-native-chart-kit';
import { colors, fontFamily } from '../../../constant';
import { Header, Wrapper } from '../../../components';

import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const USER_ID = auth().currentUser?.uid;

const MONTH_KEY = 'May_2026';

const LABELS = [
  { key: 'start', label: 'Start Weight' },
  { key: 'week1', label: 'Week 1' },
  { key: 'week2', label: 'Week 2' },
  { key: 'week3', label: 'Week 3' },
  { key: 'week4', label: 'Week 4' },
  { key: 'end', label: 'End Weight' },
];

const parseWeight = val => {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

const safeToFixed = num => {
  if (!num || isNaN(num)) return '0.0';
  return num.toFixed(1);
};

export default function WeightChallengeUI() {
  const [step, setStep] = useState(0);
  const [startDate, setStartDate] = useState(null);

  const [weights, setWeights] = useState({
    start: '',
    week1: '',
    week2: '',
    week3: '',
    week4: '',
    end: '',
  });

  /* ======================================================
      FIREBASE PATHS
  ====================================================== */

  const habitRef = database().ref(`users/${USER_ID}/habits/${MONTH_KEY}`);

  const goalRef = database().ref(`users/${USER_ID}/goal`);

  /* ======================================================
      FETCH DATA
  ====================================================== */

  useEffect(() => {
    const goalListener = goalRef.on('value', snapshot => {
      const data = snapshot.val();

      if (data?.startDate) {
        setStartDate(data.startDate);
      }
    });

    const listener = habitRef.on('value', snapshot => {
      const data = snapshot.val();

      if (!data) return;

      const mappedWeights = {
        start: data?.weight?.start || '',
        week1: data?.weight?.week1 || '',
        week2: data?.weight?.week2 || '',
        week3: data?.weight?.week3 || '',
        week4: data?.weight?.week4 || '',
        end: data?.weight?.end || '',
      };

      setWeights(mappedWeights);

      let nextStep = 0;

      for (let i = 0; i < LABELS.length; i++) {
        if (!mappedWeights[LABELS[i].key]) {
          nextStep = i;
          break;
        }

        nextStep = i + 1;
      }

      setStep(Math.min(nextStep, LABELS.length - 1));
    });

    return () => {
      goalRef.off('value', goalListener);
      habitRef.off('value', listener);
    };
  }, []);

  /* ======================================================
      WEEK LOCK SYSTEM
  ====================================================== */

  const getAllowedStepByDate = () => {
    if (!startDate) return 0;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));

    // 0-6 days => start
    // 7-13 => week1
    // 14-20 => week2
    // 21-27 => week3
    // 28-34 => week4
    // 35+ => end

    if (diffDays < 7) return 0;
    if (diffDays < 14) return 1;
    if (diffDays < 21) return 2;
    if (diffDays < 28) return 3;
    if (diffDays < 35) return 4;

    return 5;
  };

  const allowedStep = getAllowedStepByDate();

  /* ======================================================
      CALCULATIONS
  ====================================================== */

  const weightArray = LABELS.map(item => parseWeight(weights[item.key]));

  const validWeights = weightArray.filter(w => w > 0);

  let avgLoss = 0;

  if (validWeights.length > 1) {
    const totalLoss = validWeights[0] - validWeights[validWeights.length - 1];

    const weeksTracked = validWeights.length - 1;

    avgLoss = totalLoss / weeksTracked;
  }

  const completedSteps = LABELS.filter(
    l => parseWeight(weights[l.key]) > 0,
  ).length;

  const chartData = {
    labels: ['Start', 'W1', 'W2', 'W3', 'W4', 'End'],
    datasets: [
      {
        data: weightArray.map(v => v || 0.01),
      },
    ],
  };

  /* ======================================================
      SAVE DATA
  ====================================================== */

  const saveWeight = async () => {
    try {
      const currentKey = LABELS[step].key;

      const currentValue = weights[currentKey];

      if (!currentValue) return;

      let weekKey = 'week1';

      if (currentKey === 'week2') weekKey = 'week2';
      if (currentKey === 'week3') weekKey = 'week3';
      if (currentKey === 'week4') weekKey = 'week4';
      if (currentKey === 'end') weekKey = 'week4';

      const snapshot = await habitRef.once('value');

      const existingData = snapshot.val() || {};

      const updatedData = {
        ...existingData,

        title: 'Weight Challenge',

        target: 'Lose ≤ 2 lbs/week',

        weight: {
          ...(existingData.weight || {}),
          [currentKey]: currentValue,
        },

        weeks: {
          ...(existingData.weeks || {}),

          [weekKey]: {
            ...(existingData.weeks?.[weekKey] || {}),

            completed: true,

            updatedAt: database.ServerValue.TIMESTAMP,
          },
        },
      };

      await habitRef.set(updatedData);

      if (step < LABELS.length - 1) {
        setStep(prev => prev + 1);
      }
    } catch (e) {
      console.log('SAVE ERROR:', e);
    }
  };

  /* ======================================================
      FEEDBACK
  ====================================================== */

  const getFeedback = () => {
    if (avgLoss === 0) {
      return {
        text: 'Start tracking your progress',
        icon: '📊',
        color: colors.grey,
      };
    }

    if (avgLoss > 2) {
      return {
        text: 'Losing weight too fast',
        icon: '⚠️',
        color: '#FFC15A',
      };
    }

    if (avgLoss < 1) {
      return {
        text: 'Progress slower than expected',
        icon: '🐢',
        color: '#FFC15A',
      };
    }

    return {
      text: 'Healthy sustainable pace',
      icon: '✅',
      color: colors.secondary,
    };
  };

  const feedback = getFeedback();

  /* ======================================================
      UI
  ====================================================== */

  return (
    <View style={styles.root}>
      <Header
        header={'Weight Challenge'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />

      <Wrapper isForgot safeAreaPops={{ edges: ['bottom'] }}>
        <Text style={styles.heroSub}>Lose no more than 2 lbs per week</Text>

        {/* STEP DOTS */}

        <View style={styles.stepDots}>
          {LABELS.map((l, i) => {
            const locked = i !== allowedStep;

            return (
              <View
                key={i}
                style={[
                  styles.stepDot,

                  i < completedSteps && styles.stepDotDone,

                  i === step && styles.stepDotActive,

                  locked && {
                    opacity: 0.4,
                  },
                ]}
              >
                <Text style={styles.stepDotNum}>{locked ? '🔒' : i + 1}</Text>
              </View>
            );
          })}
        </View>

        {/* CHART */}

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weight Progress</Text>

          <LineChart
            data={chartData}
            width={SCREEN_WIDTH - 64}
            height={180}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: '#1E2A1D',
              backgroundGradientTo: '#1E2A1D',
              decimalPlaces: 0,
              color: opacity => `rgba(143,175,120,${opacity})`,
              labelColor: () => 'rgba(255,255,255,0.35)',
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#8FAF78',
              },
            }}
            bezier
            style={{
              borderRadius: 12,
              marginTop: 8,
            }}
          />
        </View>

        {/* STATS */}

        <View style={styles.statsCard}>
          <StatRow
            emoji="📉"
            label="Avg Loss / Week"
            value={`${safeToFixed(avgLoss)} lbs`}
          />

          <View style={styles.statDivider} />

          <StatRow emoji="🎯" label="Goal" value="≤ 2 lbs/week" />

          <View style={styles.statDivider} />

          <View style={styles.feedbackRow}>
            <Text style={styles.statLabel}>{feedback.icon} Feedback</Text>

            <Text style={[styles.feedbackText, { color: feedback.color }]}>
              {feedback.text}
            </Text>
          </View>
        </View>

        {/* INPUT */}

        <View style={styles.inputCard}>
          <View style={styles.inputCardHeader}>
            <Text style={styles.inputCardTitle}>{LABELS[step].label}</Text>

            <Text style={styles.inputCardStep}>
              {step + 1} / {LABELS.length}
            </Text>
          </View>

          <TextInput
            value={weights[LABELS[step].key]}
            onChangeText={val => {
              if (step !== allowedStep) return;

              setWeights(prev => ({
                ...prev,
                [LABELS[step].key]: val,
              }));
            }}
            editable={step === allowedStep}
            keyboardType="numeric"
            style={styles.input}
            placeholder={`Enter ${LABELS[step].label}`}
            placeholderTextColor="rgba(255,255,255,0.25)"
          />

          <TouchableOpacity
            style={[
              styles.nextBtn,

              step !== allowedStep && {
                opacity: 0.5,
              },
            ]}
            disabled={step !== allowedStep}
            onPress={saveWeight}
          >
            <Text style={styles.nextBtnText}>
              {step !== allowedStep
                ? '🔒 Locked'
                : step === LABELS.length - 1
                ? 'Done ✓'
                : 'Save & Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </Wrapper>
    </View>
  );
}

function StatRow({ emoji, label, value }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>
        {emoji} {label}
      </Text>

      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
  },

  heroSub: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 20,
    lineHeight: 20,
  },

  stepDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },

  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepDotActive: {
    borderColor: colors.secondary,
    backgroundColor: 'rgba(143,175,120,0.15)',
  },

  stepDotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
  },

  stepDotNum: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },

  chartCard: {
    backgroundColor: '#1E2A1D',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    padding: 16,
    marginBottom: 14,
  },

  chartTitle: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },

  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },

  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },

  statValue: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },

  statDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  feedbackRow: {
    paddingVertical: 14,
    gap: 6,
  },

  feedbackText: {
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    lineHeight: 20,
  },

  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
  },

  inputCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  inputCardTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },

  inputCardStep: {
    color: colors.grey,
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
  },

  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 14,
  },

  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: 49,
    paddingVertical: 14,
    alignItems: 'center',
  },

  nextBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
