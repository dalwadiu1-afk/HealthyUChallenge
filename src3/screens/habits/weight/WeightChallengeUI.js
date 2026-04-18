import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const safeToFixed = num => (!num || isNaN(num) ? '0.0' : num.toFixed(1));

export default function WeightChallengeUI({ navigation }) {
  const [step, setStep] = useState(0);
  const [weights, setWeights] = useState({
    start: '',
    week1: '',
    week2: '',
    week3: '',
    week4: '',
    end: '',
  });

  const weightArray = LABELS.map(item => parseWeight(weights[item.key]));
  const validWeights = weightArray.filter(w => w > 0);

  let avgLoss = 0;
  if (validWeights.length > 1) {
    const totalLoss = validWeights[0] - validWeights[validWeights.length - 1];
    const weeksTracked = validWeights.length - 1;
    avgLoss = totalLoss / weeksTracked;
  }

  const getFeedback = () => {
    if (avgLoss === 0)
      return {
        text: 'Start logging your weight to track progress',
        icon: '📊',
        color: colors.grey,
      };
    if (avgLoss > 2)
      return {
        text: 'Losing weight too fast — consider a slower, sustainable pace.',
        icon: '⚠️',
        color: '#FFC15A',
      };
    if (avgLoss < 1)
      return {
        text: 'Progress slower than expected — adjust nutrition or activity.',
        icon: '🐢',
        color: '#FFC15A',
      };
    return {
      text: "You're on a healthy, sustainable pace. Keep it up!",
      icon: '✅',
      color: colors.secondary,
    };
  };

  const feedback = getFeedback();
  const updateWeight = (key, value) =>
    setWeights(prev => ({ ...prev, [key]: value }));

  const chartData = {
    labels: ['Start', 'W1', 'W2', 'W3', 'W4', 'End'],
    datasets: [{ data: weightArray.map(w => w || 0.01) }],
  };

  const completedSteps = LABELS.filter(
    l => parseWeight(weights[l.key]) > 0,
  ).length;

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
            <Path
              d="M8 1L1 8L8 15"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weight Challenge</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero */}
        <Text style={styles.heroSub}>
          Lose no more than 2 lbs per week over 4 weeks
        </Text>

        {/* Step progress dots */}
        <View style={styles.stepDots}>
          {LABELS.map((l, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i < completedSteps && styles.stepDotDone,
                i === step && styles.stepDotActive,
              ]}
            >
              {i < completedSteps ? (
                <Text style={styles.stepDotCheck}>✓</Text>
              ) : (
                <Text style={styles.stepDotNum}>{i + 1}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Chart */}
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
              color: (opacity = 1) => `rgba(143,175,120,${opacity})`,
              labelColor: () => 'rgba(255,255,255,0.35)',
              propsForDots: { r: '5', strokeWidth: '2', stroke: '#8FAF78' },
              propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.06)' },
            }}
            bezier
            style={{ borderRadius: 12, marginTop: 8 }}
            withInnerLines
            withOuterLines={false}
          />
        </View>

        {/* Stats card */}
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
            <Text style={styles.statLabel}>
              <Text style={{ includeFontPadding: false }}>
                {feedback.icon}{' '}
              </Text>
              Feedback
            </Text>
            <Text style={[styles.feedbackText, { color: feedback.color }]}>
              {feedback.text}
            </Text>
          </View>
        </View>

        {/* Step input card */}
        <View style={styles.inputCard}>
          <View style={styles.inputCardHeader}>
            <Text style={styles.inputCardTitle}>{LABELS[step].label}</Text>
            <Text style={styles.inputCardStep}>
              {step + 1} / {LABELS.length}
            </Text>
          </View>

          <TextInput
            value={weights[LABELS[step].key]}
            onChangeText={val => updateWeight(LABELS[step].key, val)}
            keyboardType="numeric"
            style={styles.input}
            placeholder={`Enter ${LABELS[step].label} (lbs)`}
            placeholderTextColor="rgba(255,255,255,0.25)"
          />

          <View style={styles.btnRow}>
            {step > 0 && (
              <TouchableOpacity
                style={styles.backStepBtn}
                onPress={() => setStep(s => s - 1)}
                activeOpacity={0.8}
              >
                <Text style={styles.backStepText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => {
                if (step < LABELS.length - 1) setStep(s => s + 1);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>
                {step === LABELS.length - 1 ? 'Done ✓' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatRow({ emoji, label, value }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>
        <Text style={{ includeFontPadding: false }}>{emoji} </Text>
        {label}
      </Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
  },

  scroll: { paddingHorizontal: 18, paddingBottom: 48 },

  heroSub: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 20,
    lineHeight: 20,
  },

  /* Step dots */
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
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
  stepDotCheck: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.montserratBold,
  },

  /* Chart */
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

  /* Stats */
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
  statDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
  feedbackRow: { paddingVertical: 14, gap: 6 },
  feedbackText: {
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    lineHeight: 20,
  },

  /* Input card */
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
  btnRow: { flexDirection: 'row', gap: 10 },
  backStepBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 49,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  backStepText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
  nextBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 49,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },
});
