import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import Svg, {
  Path,
  Rect,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';

const CHART_HEIGHT = 200;
const PADDING = 20;
const BAR_WIDTH = 14;
const ITEM_WIDTH = 30;
const GOAL_HOURS = 8;

function GradientBg({ id, c1, c2, r = 16, horizontal = false }) {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient
          id={id}
          x1="0"
          y1="0"
          x2={horizontal ? '1' : '1'}
          y2={horizontal ? '0' : '1'}
        >
          <Stop offset="0" stopColor={c1} stopOpacity="1" />
          <Stop offset="1" stopColor={c2} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} rx={r} />
    </Svg>
  );
}

const RAW_DATA = [
  { dayIndex: 0, sleep: 6.5 },
  { dayIndex: 1, sleep: 7.2 },
  { dayIndex: 2, sleep: 5.8 },
  { dayIndex: 3, sleep: 8 },
  { dayIndex: 4, sleep: 7.5 },
  { dayIndex: 6, sleep: 6.2 },
  { dayIndex: 7, sleep: 7.8 },
  { dayIndex: 10, sleep: 6.9 },
  { dayIndex: 12, sleep: 8.2 },
  { dayIndex: 15, sleep: 7.1 },
];

const START_DATE = new Date('2026-03-25');

const getSleepColor = h => {
  if (h >= 7 && h <= 9) return '#22c55e';
  if (h >= 6) return '#f59e0b';
  return '#ef4444';
};

export default function SleepChart30Days({ navigation }) {
  const data = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const found = RAW_DATA.find(d => d.dayIndex === i);
      const date = new Date(START_DATE);
      date.setDate(START_DATE.getDate() + i);
      return { dayIndex: i, sleep: found?.sleep || 0, date };
    });
  }, []);

  const [selected, setSelected] = useState(10);

  const max = Math.max(...data.map(d => d.sleep), GOAL_HOURS);
  const graphH = CHART_HEIGHT - PADDING * 2;
  const getBarH = val => Math.max(val > 0 ? 4 : 0, (val / max) * graphH);

  const pastData = data.slice(0, selected + 1);
  const totalSleep = pastData.reduce((s, d) => s + d.sleep, 0);
  const avgSleep = totalSleep / (selected + 1);
  const remaining = 30 - (selected + 1);
  const requiredAvg =
    remaining > 0 ? Math.max(0, (30 * GOAL_HOURS - totalSleep) / remaining) : 0;

  const selectedItem = data[selected];

  const formatDate = date =>
    date.toLocaleDateString('en-US', { day: 'numeric' });

  const chartTotalWidth = ITEM_WIDTH * 30;

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Hero */}
      <View style={styles.heroBg}>
        <GradientBg id="sleepChartHero" c1="#1A2030" c2="#161D15" r={0} />
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
          <Text style={styles.headerTitle}>Sleep Tracker</Text>
          <View style={{ width: 44 }} />
        </View>
        <Text style={styles.heroTitle}>😴 30-Day Sleep Chart</Text>
        <Text style={styles.heroSub}>
          Goal: 7–9 hours per night · Tap a bar to see details
        </Text>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: getSleepColor(avgSleep) }]}>
              {avgSleep.toFixed(1)}h
            </Text>
            <Text style={styles.statLbl}>Avg / Night</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{GOAL_HOURS}h</Text>
            <Text style={styles.statLbl}>Daily Goal</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text
              style={[
                styles.statVal,
                {
                  color:
                    requiredAvg > GOAL_HOURS ? '#ef4444' : colors.secondary,
                },
              ]}
            >
              {requiredAvg.toFixed(1)}h
            </Text>
            <Text style={styles.statLbl}>Required Avg</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Selected day detail */}
        <View style={styles.selectedCard}>
          <View style={styles.selectedLeft}>
            <Text style={styles.selectedDate}>
              {selectedItem?.date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.selectedHours}>
              {selectedItem?.sleep > 0 ? `${selectedItem.sleep}h` : 'No data'}
            </Text>
          </View>
          {selectedItem?.sleep > 0 && (
            <View
              style={[
                styles.qualityPill,
                {
                  backgroundColor: `${getSleepColor(selectedItem.sleep)}22`,
                  borderColor: `${getSleepColor(selectedItem.sleep)}55`,
                },
              ]}
            >
              <Text
                style={[
                  styles.qualityText,
                  { color: getSleepColor(selectedItem.sleep) },
                ]}
              >
                {selectedItem.sleep >= 7 && selectedItem.sleep <= 9
                  ? 'Optimal'
                  : selectedItem.sleep >= 6
                  ? 'Fair'
                  : 'Poor'}
              </Text>
            </View>
          )}
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Sleep Duration (hrs)</Text>
            <View style={styles.legendRow}>
              <View
                style={[styles.legendDot, { backgroundColor: '#22c55e' }]}
              />
              <Text style={styles.legendText}>7–9h</Text>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: '#f59e0b', marginLeft: 8 },
                ]}
              />
              <Text style={styles.legendText}>6–7h</Text>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: '#ef4444', marginLeft: 8 },
                ]}
              />
              <Text style={styles.legendText}>&lt;6h</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View
              style={{
                width: chartTotalWidth,
                height: CHART_HEIGHT,
                position: 'relative',
              }}
            >
              {data.map((item, index) => {
                const barH = getBarH(item.sleep);
                const isSelected = selected === index;
                const barColor = isSelected
                  ? '#A782FF'
                  : item.sleep > 0
                  ? getSleepColor(item.sleep)
                  : 'rgba(255,255,255,0.06)';

                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    onPress={() => setSelected(index)}
                    style={{
                      position: 'absolute',
                      left: index * ITEM_WIDTH,
                      top: 0,
                      width: ITEM_WIDTH,
                      height: CHART_HEIGHT,
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingBottom: PADDING,
                    }}
                  >
                    {isSelected && item.sleep > 0 && (
                      <Text
                        style={[
                          styles.barLabel,
                          { position: 'absolute', bottom: PADDING + barH + 4 },
                        ]}
                      >
                        {item.sleep}h
                      </Text>
                    )}
                    <View
                      style={{
                        width: BAR_WIDTH,
                        height: Math.max(barH, item.sleep > 0 ? 4 : 0),
                        backgroundColor: barColor,
                        borderRadius: 5,
                      }}
                    />
                    <Text
                      style={[
                        styles.dateLabel,
                        isSelected && { color: '#A782FF' },
                      ]}
                    >
                      {formatDate(item.date)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Stats card */}
        <View style={styles.statsCard}>
          {[
            {
              icon: '😴',
              label: 'Avg Sleep',
              sub: `Based on ${selected + 1} days`,
              value: `${avgSleep.toFixed(1)} hrs`,
            },
            {
              icon: '🎯',
              label: 'Nightly Goal',
              sub: 'Recommended range',
              value: '7–9 hrs',
            },
            {
              icon: '🔮',
              label: 'Required Avg',
              sub: `${remaining} days remaining`,
              value: `${requiredAvg.toFixed(1)} hrs/night`,
            },
          ].map((row, i) => (
            <View key={i}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.statRow}>
                <Text style={styles.statRowIcon}>{row.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.statRowLabel}>{row.label}</Text>
                  <Text style={styles.statRowSub}>{row.sub}</Text>
                </View>
                <Text style={styles.statRowValue}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Share button */}
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85}>
          <GradientBg
            id="sleepShare"
            c1="#6A9455"
            c2="#3A5A2A"
            r={16}
            horizontal
          />
          <Svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginRight: 8 }}
          >
            <Path
              d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
              stroke="#fff"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.shareBtnText}>Share Sleep Progress</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  heroBg: { paddingBottom: 18, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    paddingHorizontal: 18,
    paddingBottom: 14,
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
  heroTitle: {
    color: colors.white,
    fontSize: 21,
    fontFamily: fontFamily.montserratBold,
    paddingHorizontal: 18,
    marginBottom: 4,
    includeFontPadding: false,
  },
  heroSub: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  statsStrip: {
    flexDirection: 'row',
    marginHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
  },
  statLbl: {
    color: colors.grey,
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 2,
  },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)' },

  scroll: { padding: 18, paddingTop: 16, paddingBottom: 48 },

  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(167,130,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(167,130,255,0.2)',
    padding: 14,
    marginBottom: 14,
  },
  selectedLeft: {},
  selectedDate: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },
  selectedHours: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fontFamily.montserratBold,
  },
  qualityPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  qualityText: { fontSize: 13, fontFamily: fontFamily.montserratSemiBold },

  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    fontFamily: fontFamily.montserratRegular,
  },

  barLabel: {
    color: '#A782FF',
    fontSize: 9,
    fontFamily: fontFamily.montserratSemiBold,
  },
  dateLabel: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 9,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 4,
    textAlign: 'center',
  },

  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  statRowIcon: { fontSize: 18, includeFontPadding: false },
  statRowLabel: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  statRowSub: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 1,
  },
  statRowValue: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 42,
  },

  shareBtn: {
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
