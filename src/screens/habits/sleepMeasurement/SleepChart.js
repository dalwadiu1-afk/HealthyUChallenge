import React, { useMemo, useState } from 'react';

import { View, FlatList, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { Button, Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';

export default function SleepChart30Days() {
  const chartHeight = 220;
  const padding = 20;
  const barWidth = 14;
  const itemWidth = 30;

  // 📅 Start date
  const startDate = new Date('2026-03-25');

  // 🌙 Sleep data (hours)
  const rawData = [
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

  const formatDate = date =>
    date.toLocaleDateString('en-US', { day: 'numeric' });

  // ✅ FIXED DATE LOGIC
  const data = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const found = rawData.find(d => d.dayIndex === i);

      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i); // ✅ FIXED

      return {
        dayIndex: i,
        sleep: found?.sleep || 0,
        date,
      };
    });
  }, []);

  const [selected, setSelected] = useState(10);

  // 📊 scale
  const max = Math.max(...data.map(d => d.sleep), 8); // min scale = 8h
  const graphHeight = chartHeight - padding * 2;

  const getBarHeight = val => (val / max) * graphHeight;

  // -------------------------
  // 📊 STATS
  // -------------------------
  const todayIndex = selected;

  const pastData = data.slice(0, todayIndex + 1);

  const totalSleep = pastData.reduce((sum, d) => sum + d.sleep, 0);

  const avgSleep = totalSleep / (todayIndex + 1);

  const goalPerDay = 8; // 8 hours
  const totalGoal = 30 * goalPerDay;

  const remainingDays = 30 - (todayIndex + 1);
  const remainingSleep = totalGoal - totalSleep;

  const requiredAvg =
    remainingDays > 0 ? Math.max(0, remainingSleep / remainingDays) : 0;

  // -------------------------
  // 📊 RENDER ITEM
  // -------------------------
  const renderItem = ({ item, index }) => {
    const barHeight = getBarHeight(item.sleep);

    return (
      <View
        style={{ width: itemWidth, alignItems: 'center' }}
        onTouchEnd={() => setSelected(index)}
      >
        <Svg width={itemWidth} height={chartHeight}>
          <G>
            {/* BAR */}
            <Rect
              x={(itemWidth - barWidth) / 2}
              y={chartHeight - padding - barHeight}
              width={barWidth}
              height={barHeight}
              fill={selected === index ? colors.primary : colors.textPrimary}
              rx={6}
            />

            {/* DATE */}
            <SvgText
              x={itemWidth / 2}
              y={chartHeight - 5}
              fontSize="12"
              fill={colors.textSecondary}
              textAnchor="middle"
              fontFamily={fontFamily.montserratRegular}
            >
              {formatDate(item.date)}
            </SvgText>

            {/* VALUE */}
            {selected === index && (
              <SvgText
                x={itemWidth / 3}
                y={chartHeight - padding - barHeight - 8}
                fontSize="10"
                fill={colors.textPrimary}
                fontFamily={fontFamily.montserratBold}
                textAnchor="middle"
              >
                {item.sleep}h
              </SvgText>
            )}
          </G>
        </Svg>
      </View>
    );
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <Wrapper>
      <Header header={'Sleep Tracker'} />

      <View style={{ flex: 1 }}>
        <View style={styles.chartContainer}>
          <FlatList
            data={data}
            horizontal
            keyExtractor={item => item.dayIndex.toString()}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* STATS */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>😴 Avg Sleep</Text>
            <Text style={styles.value}>{avgSleep.toFixed(1)} hrs</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>🎯 Goal</Text>
            <Text style={styles.value}>8 hrs/day</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>🔮 Required Avg</Text>
            <Text style={styles.value}>{requiredAvg.toFixed(1)} hrs/day</Text>
          </View>
        </View>
      </View>

      <Button title="Share" buttonStyle={{ marginVertical: 30 }} />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: colors.accent,
    borderRadius: 24,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  card: {
    padding: 14,
    backgroundColor: colors.white,
    borderRadius: 14,
    marginTop: 25,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fontFamily.poppinsMedium,
  },
  value: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: fontFamily.montserratSemiBold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outline,
  },
});
