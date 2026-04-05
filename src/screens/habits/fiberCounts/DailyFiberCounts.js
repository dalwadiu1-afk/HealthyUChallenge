import React, { useMemo, useState } from 'react';
import { View, FlatList, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, Text as SvgText, G, Polyline } from 'react-native-svg';

import { Button, Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';
import InputBox from '../../../components/common/InputBox';

export default function FiberChart30Days() {
  const [input, setInput] = useState('');
  const chartHeight = 220;
  const padding = 20;
  const barWidth = 14;
  const itemWidth = 30;

  // 📅 START DATE
  const startDate = new Date('2026-03-25');

  // 🌾 Fiber raw log (grams per day)
  const rawData = [
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

  const addFiber = () => {
    data[selected].fiber += Number(input || 0);
    setInput('');
  };

  const formatDate = date =>
    date.toLocaleDateString('en-US', { day: 'numeric' });

  // 📊 30-day cycle
  const data = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const found = rawData.find(d => d.dayIndex === i);

      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      return {
        dayIndex: i,
        fiber: found?.fiber || 0,
        date,
      };
    });
  }, []);

  const [selected, setSelected] = useState(10);

  const max = Math.max(...data.map(d => d.fiber), 40);
  const graphHeight = chartHeight - padding * 2;

  const getBarHeight = val => (val / max) * graphHeight;

  // 📊 STATS
  const pastData = data.slice(0, selected + 1);
  const total = pastData.reduce((s, d) => s + d.fiber, 0);
  const avg = total / (selected + 1);

  const goalMin = 25;
  const goalMax = 38;

  const remainingDays = 30 - (selected + 1);
  const remainingGoalMin = goalMin * 30 - total;
  const requiredAvg = remainingDays > 0 ? remainingGoalMin / remainingDays : 0;

  // 🍎 Fiber Tips
  const tips = [
    'Eat oats or overnight oats',
    'Add chia or flax seeds',
    'Eat apples with skin',
    'Include lentils or beans',
    'Switch to whole grains',
    'Eat broccoli, carrots daily',
  ];

  const trendPoints = data
    .map((d, i) => {
      const x = i * itemWidth + itemWidth / 2;
      const y = chartHeight - padding - getBarHeight(d.fiber);
      return `${x},${y}`;
    })
    .join(' ');

  const warning = useMemo(() => {
    const last7 = data.slice(-7);
    const lowDays = last7.filter(d => d.fiber < goalMin).length;

    if (lowDays >= 4) return '⚠️ Severe low fiber trend detected';
    if (lowDays >= 2) return '⚠️ Fiber intake inconsistent';
    return null;
  }, [data]);

  const renderItem = ({ item, index }) => {
    const barHeight = getBarHeight(item.fiber);
    const inRange = item.fiber >= goalMin && item.fiber <= goalMax;

    return (
      <View style={{ width: itemWidth, alignItems: 'center' }}>
        <Svg width={itemWidth} height={chartHeight}>
          <G>
            {/* BAR */}
            <Rect
              x={(itemWidth - barWidth) / 2}
              y={chartHeight - padding - barHeight}
              width={barWidth}
              height={barHeight}
              fill={
                selected === index
                  ? colors.secondary
                  : inRange
                  ? '#16a34a'
                  : '#94a3b8'
              }
              rx={6}
            />

            {/* TOUCH AREA */}
            <Rect
              x={0}
              y={padding}
              width={itemWidth}
              height={graphHeight}
              fill="transparent"
              onPress={() => setSelected(index)}
            />

            {/* VALUE */}
            {selected === index && (
              <SvgText
                x={itemWidth / 2}
                y={chartHeight - padding - barHeight - 8}
                fontSize="10"
                fill="#000"
                textAnchor="middle"
                fontFamily={fontFamily.montserratSemiBold}
              >
                {item.fiber}g
              </SvgText>
            )}

            {/* DATE */}
            <SvgText
              x={itemWidth / 2}
              y={chartHeight - 5}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
              fontFamily={fontFamily.montserratSemiBold}
            >
              {formatDate(item.date)}
            </SvgText>
          </G>
        </Svg>
      </View>
    );
  };

  return (
    <Wrapper>
      <Header header="Fiber Tracker" />

      <ScrollView style={{ flexGrow: 1 }}>
        {/* CHART */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartBox}>
            <FlatList
              data={data}
              horizontal
              keyExtractor={i => i.dayIndex.toString()}
              renderItem={renderItem}
              showsHorizontalScrollIndicator={false}
            />

            {/* TREND LINE */}
            <Svg
              pointerEvents="none"
              height={chartHeight}
              width={itemWidth * 30}
              style={{
                position: 'absolute',
              }}
            >
              <Polyline
                pointerEvents="none"
                points={trendPoints}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
              />
            </Svg>
          </View>
        </ScrollView>

        {/* STATS */}
        <View style={styles.card}>
          <Row label="📊 Avg Fiber" value={`${avg.toFixed(1)}g`} />
          <Divider />
          <Row label="🎯 Target Range" value="25g – 38g" />
          <Divider />
          <Row
            label="🔮 Required Avg"
            value={`${requiredAvg.toFixed(1)}g/day`}
          />
        </View>

        {/* TIPS */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Fiber Tips</Text>
          {tips.map((t, i) => (
            <Text key={i} style={styles.tipText}>
              • {t}
            </Text>
          ))}
        </View>

        {/* INPUT */}
        <View style={styles.inputBox}>
          <Text>🍽 Add Fiber (g)</Text>

          <InputBox
            value={input}
            onChangeText={setInput}
            keyboardType="numeric"
            placeholder="e.g. 10"
            mainContainer={{ marginVertical: 10 }}
          />
          <Button title="Add" onPress={addFiber} />
        </View>

        <Button title="Share Progress" buttonStyle={{ marginVertical: 20 }} />
      </ScrollView>
    </Wrapper>
  );
}

/* ---------------- UI Helpers ---------------- */

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  chartBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    marginTop: 20,
    overflow: 'hidden',
  },
  warning: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 10,
  },
  card: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
  },
  inputBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontFamily: fontFamily.montserratMedium,
  },
  value: {
    fontSize: 14,
    color: '#111',
    fontFamily: fontFamily.montserratSemiBold,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },

  tipBox: {
    marginTop: 10,
    padding: 14,
    backgroundColor: '#ecfdf5',
    borderRadius: 14,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#065f46',
    marginVertical: 2,
  },
});
