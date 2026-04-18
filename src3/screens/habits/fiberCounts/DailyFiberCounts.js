import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
} from 'react-native';
import Svg, {
  Rect,
  Text as SvgText,
  G,
  Polyline,
  Path,
} from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CHART_HEIGHT = 200;
const PADDING = 20;
const BAR_WIDTH = 14;
const ITEM_WIDTH = 30;

const START_DATE = new Date('2026-03-25');

const RAW_DATA = [
  { dayIndex: 0, fiber: 12 },
  { dayIndex: 1, fiber: 18 },
  { dayIndex: 2, fiber: 22 },
  { dayIndex: 3, fiber: 15 },
  { dayIndex: 4, fiber: 10 },
  { dayIndex: 5, fiber: 28 },
  { dayIndex: 6, fiber: 30 },
  { dayIndex: 7, fiber: 26 },
  { dayIndex: 8, fiber: 18 },
  { dayIndex: 10, fiber: 35 },
  { dayIndex: 12, fiber: 40 },
  { dayIndex: 14, fiber: 20 },
  { dayIndex: 16, fiber: 27 },
  { dayIndex: 18, fiber: 32 },
  { dayIndex: 20, fiber: 25 },
  { dayIndex: 22, fiber: 29 },
  { dayIndex: 25, fiber: 38 },
  { dayIndex: 27, fiber: 31 },
  { dayIndex: 29, fiber: 26 },
];

const TIPS = [
  'Eat oats or overnight oats',
  'Add chia or flax seeds',
  'Eat apples with skin',
  'Include lentils or beans',
  'Switch to whole grains',
  'Eat broccoli, carrots daily',
];

const GOAL_MIN = 25;
const GOAL_MAX = 38;

function BackIcon() {
  return (
    <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
      <Path
        d="M8 1L1 8L8 15"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StatRow({ emoji, label, value, last }) {
  return (
    <>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>
          <Text style={styles.statEmoji}>{emoji} </Text>
          {label}
        </Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      {!last && <View style={styles.statDivider} />}
    </>
  );
}

export default function FiberChartDays({ navigation }) {
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState(10);
  const [fiberData, setFiberData] = useState(() =>
    Array.from({ length: 30 }, (_, i) => {
      const found = RAW_DATA.find(d => d.dayIndex === i);
      const date = new Date(START_DATE);
      date.setDate(START_DATE.getDate() + i);
      return { dayIndex: i, fiber: found?.fiber || 0, date };
    }),
  );

  const max = Math.max(...fiberData.map(d => d.fiber), 40);
  const graphHeight = CHART_HEIGHT - PADDING * 2;
  const getBarH = val => (val / max) * graphHeight;

  const formatDate = date =>
    date.toLocaleDateString('en-US', { day: 'numeric' });

  const addFiber = () => {
    const val = Number(input || 0);
    if (!val) return;
    const updated = [...fiberData];
    updated[selected] = {
      ...updated[selected],
      fiber: updated[selected].fiber + val,
    };
    setFiberData(updated);
    setInput('');
  };

  // Stats
  const pastData = fiberData.slice(0, selected + 1);
  const total = pastData.reduce((s, d) => s + d.fiber, 0);
  const avg = total / (selected + 1);
  const remainingDays = 30 - (selected + 1);
  const requiredAvg =
    remainingDays > 0 ? (GOAL_MIN * 30 - total) / remainingDays : 0;

  const trendPoints = fiberData
    .map((d, i) => {
      const x = i * ITEM_WIDTH + ITEM_WIDTH / 2;
      const y = CHART_HEIGHT - PADDING - getBarH(d.fiber);
      return `${x},${y}`;
    })
    .join(' ');

  const warning = useMemo(() => {
    const last7 = fiberData.slice(-7);
    const lowDays = last7.filter(d => d.fiber < GOAL_MIN).length;
    if (lowDays >= 4) return '⚠️ Severe low fiber trend detected';
    if (lowDays >= 2) return '⚠️ Fiber intake inconsistent';
    return null;
  }, [fiberData]);

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
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fiber Tracker</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Selected day pill */}
        <View style={styles.selectedPill}>
          <Text style={styles.selectedPillText}>
            Day {selected + 1} · {fiberData[selected].fiber}g fiber
          </Text>
        </View>

        {/* ── Chart ── */}
        <View style={styles.chartCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ width: ITEM_WIDTH * 30, height: CHART_HEIGHT }}>
              {/* Bars */}
              {fiberData.map((item, index) => {
                const barHeight = getBarH(item.fiber);
                const inRange =
                  item.fiber >= GOAL_MIN && item.fiber <= GOAL_MAX;
                return (
                  <View
                    key={item.dayIndex}
                    style={{
                      position: 'absolute',
                      left: index * ITEM_WIDTH,
                      width: ITEM_WIDTH,
                      height: CHART_HEIGHT,
                      alignItems: 'center',
                    }}
                  >
                    <Svg width={ITEM_WIDTH} height={CHART_HEIGHT}>
                      <G>
                        <Rect
                          x={(ITEM_WIDTH - BAR_WIDTH) / 2}
                          y={CHART_HEIGHT - PADDING - barHeight}
                          width={BAR_WIDTH}
                          height={barHeight}
                          fill={
                            selected === index
                              ? '#8FAF78'
                              : inRange
                              ? 'rgba(77,102,68,0.85)'
                              : 'rgba(255,255,255,0.15)'
                          }
                          rx={5}
                        />
                        <Rect
                          x={0}
                          y={PADDING}
                          width={ITEM_WIDTH}
                          height={graphHeight}
                          fill="transparent"
                          onPress={() => setSelected(index)}
                        />
                        {selected === index && item.fiber > 0 && (
                          <SvgText
                            x={ITEM_WIDTH / 2}
                            y={CHART_HEIGHT - PADDING - barHeight - 8}
                            fontSize="10"
                            fill="#FFFFFF"
                            textAnchor="middle"
                            fontFamily={fontFamily.montserratSemiBold}
                          >
                            {item.fiber}g
                          </SvgText>
                        )}
                        <SvgText
                          x={ITEM_WIDTH / 2}
                          y={CHART_HEIGHT - 5}
                          fontSize="9"
                          fill="rgba(255,255,255,0.35)"
                          textAnchor="middle"
                          fontFamily={fontFamily.montserratRegular}
                        >
                          {formatDate(item.date)}
                        </SvgText>
                      </G>
                    </Svg>
                  </View>
                );
              })}

              {/* Trend line overlay */}
              <Svg
                pointerEvents="none"
                height={CHART_HEIGHT}
                width={ITEM_WIDTH * 30}
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                <Polyline
                  points={trendPoints}
                  fill="none"
                  stroke="rgba(143,175,120,0.6)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              </Svg>
            </View>
          </ScrollView>
        </View>

        {/* Warning */}
        {warning && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>{warning}</Text>
          </View>
        )}

        {/* ── Stats card ── */}
        <View style={styles.statsCard}>
          <StatRow emoji="📊" label="Avg Fiber" value={`${avg.toFixed(1)}g`} />
          <StatRow emoji="🎯" label="Target Range" value="25g – 38g" />
          <StatRow
            emoji="🔮"
            label="Required Avg"
            value={`${requiredAvg.toFixed(1)}g/day`}
            last
          />
        </View>

        {/* ── Tips card ── */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Fiber Tips</Text>
          {TIPS.map((t, i) => (
            <Text key={i} style={styles.tipText}>
              • {t}
            </Text>
          ))}
        </View>

        {/* ── Add Fiber ── */}
        <View style={styles.addCard}>
          <Text style={styles.addLabel}>🍽 Add Fiber (g)</Text>
          <TextInput
            style={styles.addInput}
            value={input}
            onChangeText={setInput}
            keyboardType="numeric"
            placeholder="e.g. 10"
            placeholderTextColor="rgba(255,255,255,0.25)"
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={addFiber}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Share */}
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85}>
          <Text style={styles.shareBtnText}>Share Progress</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 44) + 10,
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
  headerRight: { width: 44 },

  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 48,
  },

  /* ── Selected pill ── */
  selectedPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
    borderRadius: 49,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 14,
  },
  selectedPillText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },

  /* ── Chart ── */
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 14,
  },

  /* ── Warning ── */
  warningBox: {
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  warningText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },

  /* ── Stats card ── */
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
  statEmoji: {
    fontSize: 15,
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fontFamily.montserratMedium,
  },
  statValue: {
    fontSize: 14,
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
  },
  statDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  /* ── Tips ── */
  tipsCard: {
    backgroundColor: colors.bubbleDark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    padding: 16,
    marginBottom: 14,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
    marginBottom: 10,
    includeFontPadding: false,
  },
  tipText: {
    fontSize: 12,
    color: colors.grey,
    fontFamily: fontFamily.montserratRegular,
    lineHeight: 22,
  },

  /* ── Add fiber ── */
  addCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 14,
  },
  addLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fontFamily.montserratMedium,
    marginBottom: 12,
    includeFontPadding: false,
  },
  addInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 49,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },

  /* ── Share ── */
  shareBtn: {
    borderRadius: 49,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.35)',
    backgroundColor: 'rgba(143,175,120,0.08)',
    marginBottom: 8,
  },
  shareBtnText: {
    color: colors.secondary,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },
});
