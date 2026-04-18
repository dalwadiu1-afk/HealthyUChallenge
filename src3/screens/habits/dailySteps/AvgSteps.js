import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';
import useStepCount from '../../../hooks/useStepCount';

const CHART_HEIGHT = 148;
const PADDING = 16;
const GOAL = 200000;

function buildEmptyData(startDate) {
  const base = startDate ?? new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(base);
    date.setDate(base.getDate() + i);
    return { dayIndex: i, steps: 0, date };
  });
}

function formatDay(date) {
  return date.toLocaleDateString('en-US', { day: 'numeric' });
}

// Circular progress ring
function RingProgress({ percent }) {
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;
  const strokeDash = circumference * Math.min(percent, 1);

  return (
    <Svg width={140} height={140}>
      <Defs>
        <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#2D4A25" stopOpacity="1" />
          <Stop offset="1" stopColor="#8FAF78" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      {/* Track */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={10}
        fill="none"
      />
      {/* Progress */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="url(#ringGrad)"
        strokeWidth={10}
        fill="none"
        strokeDasharray={`${strokeDash} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90, ${cx}, ${cy})`}
      />
    </Svg>
  );
}

// Refresh icon
function RefreshIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 4v6h-6M1 20v-6h6"
        stroke="#8FAF78"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
        stroke="#8FAF78"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Back chevron icon
function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke="#FFFFFF"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Stat row icon components
function AvgIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 20V10M12 20V4M6 20v-6"
        stroke="#8FAF78"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
function GoalIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke="#FFC15A" strokeWidth={2} />
      <Circle cx={12} cy={12} r={6} stroke="#FFC15A" strokeWidth={2} />
      <Circle cx={12} cy={12} r={2} fill="#FFC15A" />
    </Svg>
  );
}
function ReqIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        stroke="#A782FF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function StepsChart30Days({ navigation }) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const {
    data: rawData,
    todaySteps,
    loading,
    startDate,
    refetch,
  } = useStepCount();

  const [selected, setSelected] = useState(0);

  // Use real HealthKit data, fall back to empty skeleton while loading
  const data = rawData ?? buildEmptyData(startDate);

  // Auto-select the most recent day that has steps once data loads
  useEffect(() => {
    if (!rawData) return;
    const lastActiveIdx = [...rawData].reverse().findIndex(d => d.steps > 0);
    if (lastActiveIdx !== -1) setSelected(rawData.length - 1 - lastActiveIdx);
  }, [rawData]);

  const displayedTodaySteps =
    todaySteps > 0 ? todaySteps : rawData?.[0]?.steps ?? 0;

  // Bar height logic
  const MAX_STEPS = Math.max(...data.map(d => d.steps), 1);
  const graphH = CHART_HEIGHT - PADDING * 2;
  const MIN_BAR = 8;
  const getBarH = val => Math.max(MIN_BAR, (val / MAX_STEPS) * graphH);

  const pastData = data.slice(0, selected + 1);
  const pastTotal = pastData.reduce((sum, d) => sum + d.steps, 0);
  const pastAvg = pastTotal / (selected + 1);
  const remaining = 30 - (selected + 1);
  const reqAvg =
    remaining > 0 ? Math.max(0, (GOAL - pastTotal) / remaining) : 0;
  const goalPct = Math.min(pastTotal / GOAL, 1);
  const selectedItem = data[selected];

  const renderBar = (item, index) => {
    const barH = getBarH(item.steps);
    const isActive = selected === index;
    const hasData = item.steps > 0;
    const barColor = isActive ? '#8FAF78' : hasData ? '#3D5235' : '#2A3428';

    return (
      <TouchableOpacity
        key={item.dayIndex}
        activeOpacity={0.8}
        onPress={() => setSelected(index)}
        style={styles.barWrapper}
      >
        {/* Step count label above bar (only when selected) */}
        <Text style={[styles.barLabel, { opacity: isActive ? 1 : 0 }]}>
          {item.steps >= 1000
            ? `${(item.steps / 1000).toFixed(1)}k`
            : String(item.steps)}
        </Text>

        {/* Bar itself */}
        <View
          style={[
            styles.bar,
            {
              height: barH,
              backgroundColor: barColor,
              borderRadius: 5,
            },
          ]}
        />

        {/* Date label below bar */}
        <Text style={[styles.barDate, isActive && styles.barDateActive]}>
          {formatDay(item.date)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerAnim }]}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.8}
            onPress={() => navigation?.goBack()}
          >
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Step Count</Text>
            <Text style={styles.headerSub}>
              {data.length > 0 && data[0].date
                ? `${data[0].date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })} — ${data[data.length - 1].date.toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric' },
                  )}`
                : '30-day cycle'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            activeOpacity={0.8}
            onPress={refetch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size={16} color={colors.secondary} />
            ) : (
              <RefreshIcon />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Hero — ring + selected day */}
        <Animated.View style={[styles.heroCard, { opacity: headerAnim }]}>
          <View style={styles.ringWrapper}>
            <RingProgress percent={goalPct} />
            <View style={styles.ringCenter}>
              <Text style={styles.ringPct}>{Math.round(goalPct * 100)}%</Text>
              <Text style={styles.ringLabel}>of goal</Text>
            </View>
          </View>

          <View style={styles.heroRight}>
            <Text style={styles.heroStepsVal}>
              {selectedItem?.steps?.toLocaleString() ?? '0'}
            </Text>
            <Text style={styles.heroStepsUnit}>steps</Text>
            <Text style={styles.heroDate}>
              {selectedItem?.date?.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>

            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {selectedItem?.steps >= 8000
                  ? '🔥 Great day!'
                  : selectedItem?.steps >= 5000
                  ? '✅ On track'
                  : '📈 Keep going'}
              </Text>
            </View>

            {/* Today's live step count from HealthKit */}
            <View style={styles.todayRow}>
              <Text style={styles.todayLabel}>Today </Text>
              <Text style={styles.todayVal}>
                {displayedTodaySteps.toLocaleString()}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Chart */}
        <Animated.View style={[styles.chartCard, { opacity: cardAnim }]}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Daily Steps</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScroll}
          >
            {data.map((item, index) => renderBar(item, index))}
          </ScrollView>
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[styles.statsCard, { opacity: cardAnim }]}>
          <Text style={styles.statsTitle}>Summary</Text>

          <View style={styles.statRow}>
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: 'rgba(143,175,120,0.15)' },
              ]}
            >
              <AvgIcon />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Avg (Start → Today)</Text>
              <Text style={styles.statSub}>Based on {selected + 1} days</Text>
            </View>
            <Text style={styles.statValue}>
              {pastAvg.toFixed(0)}
              <Text style={styles.statUnit}> steps</Text>
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statRow}>
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: 'rgba(255,193,90,0.15)' },
              ]}
            >
              <GoalIcon />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Goal</Text>
              <Text style={styles.statSub}>30-day target</Text>
            </View>
            <Text style={styles.statValue}>
              {(GOAL / 1000).toFixed(0)}k
              <Text style={styles.statUnit}> steps</Text>
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statRow}>
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: 'rgba(167,130,255,0.15)' },
              ]}
            >
              <ReqIcon />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Required Daily Avg</Text>
              <Text style={styles.statSub}>{remaining} days remaining</Text>
            </View>
            <Text style={styles.statValue}>
              {reqAvg.toFixed(0)}
              <Text style={styles.statUnit}>/day</Text>
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Goal Progress</Text>
              <Text style={styles.progressPct}>
                {(goalPct * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${goalPct * 100}%` }]}
              />
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressSub}>
                {pastTotal.toLocaleString()} steps done
              </Text>
              <Text style={styles.progressSub}>
                {GOAL.toLocaleString()} total
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Share button */}
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85}>
          <Svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginRight: 8 }}
          >
            <Path
              d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.shareBtnText}>Share Progress</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(143,175,120,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 1,
  },

  // Hero card
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    marginBottom: 16,
    gap: 16,
  },
  ringWrapper: {
    position: 'relative',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringPct: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fontFamily.montserratBold,
  },
  ringLabel: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
  },
  heroRight: {
    flex: 1,
  },
  heroStepsVal: {
    color: colors.white,
    fontSize: 32,
    fontFamily: fontFamily.montserratBold,
    lineHeight: 36,
  },
  heroStepsUnit: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 4,
  },
  heroDate: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    marginBottom: 10,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.25)',
  },
  heroBadgeText: {
    color: colors.secondary,
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(143,175,120,0.08)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  todayLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },
  todayVal: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },

  // Chart
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  legendText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },
  chartScroll: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  barWrapper: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: CHART_HEIGHT + 32,
  },
  bar: {
    width: 12,
    marginBottom: 4,
  },
  barLabel: {
    color: '#8FAF78',
    fontSize: 8,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 3,
    textAlign: 'center',
  },
  barDate: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontFamily: fontFamily.montserratRegular,
    textAlign: 'center',
    marginTop: 3,
  },
  barDateActive: {
    color: '#8FAF78',
  },

  // Stats
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  statSub: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 1,
  },
  statValue: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratBold,
  },
  statUnit: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },
  statDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 48,
  },

  // Progress bar
  progressSection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },
  progressPct: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 6,
  },
  progressSub: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
  },

  // Share button
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
  },
  shareBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
