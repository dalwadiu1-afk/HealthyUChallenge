import React, { useMemo, useState } from 'react';
import { View, Dimensions, FlatList, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { Button, Header, Wrapper } from '../../../components';
import { fontFamily } from '../../../constant';

const { width } = Dimensions.get('window');

export default function StepsChart30Days() {
  const chartHeight = 220;

  const padding = 20;
  const barWidth = 14;
  const itemWidth = 30;

  // 📅 START DATE (fixed cycle start)
  const startDate = new Date('2026-03-25');

  const rawData = [
    { dayIndex: 0, steps: 3200 },
    { dayIndex: 1, steps: 4200 },
    { dayIndex: 2, steps: 2800 },
    { dayIndex: 3, steps: 5000 },
    { dayIndex: 4, steps: 6100 },
    { dayIndex: 6, steps: 4000 },
    { dayIndex: 7, steps: 7000 },
    { dayIndex: 10, steps: 5200 },
    { dayIndex: 12, steps: 8000 },
    { dayIndex: 15, steps: 6500 },
  ];

  // 📌 format date
  const formatDate = date => {
    return date.toLocaleDateString('en-US', {
      // month: 'short',
      day: 'numeric',
    });
  };

  // 🔥 FORCE 30 DAY CYCLE WITH REAL DATES
  const data = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const found = rawData.find(d => d.dayIndex === i);

      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i + 1);

      return {
        dayIndex: i,
        steps: found?.steps || 0,
        date, // ✅ REAL DATE
      };
    });
  }, []);

  const [selected, setSelected] = useState(10);

  const max = Math.max(...data.map(d => d.steps), 1);
  const graphHeight = chartHeight - padding * 2;

  const getBarHeight = val => (val / max) * graphHeight;

  // -------------------------
  // 📊 STATS (optional but ready)
  // -------------------------
  const todayIndex = selected;

  const pastData = data.slice(0, todayIndex + 1);

  const pastTotal = pastData.reduce((sum, d) => sum + d.steps, 0);

  const pastAvg = pastTotal / (todayIndex + 1);

  const goal = 200000;

  const remainingDays = 30 - (todayIndex + 1);

  const remainingGoal = goal - pastTotal;

  const requiredAvg =
    remainingDays > 0 ? Math.max(0, remainingGoal / remainingDays) : 0;

  // -------------------------
  // 📊 RENDER ITEM
  // -------------------------
  const renderItem = ({ item, index }) => {
    const barHeight = getBarHeight(item.steps);

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
              fill={selected === index ? '#ff4d6d' : '#111'}
              rx={6}
              onPress={() => setSelected(index)}
            />

            {/* TOUCH AREA */}
            <Rect
              x={0}
              y={padding}
              width={itemWidth}
              height={graphHeight}
              fill="transparent"
              fontFamily={fontFamily.montserratBold}
              onPress={() => setSelected(index)}
            />

            {/* DATE LABEL */}
            <SvgText
              x={itemWidth / 2}
              y={chartHeight - 5}
              fontSize="12"
              fill="#888"
              textAnchor="middle"
              fontFamily={fontFamily.montserratBold}
            >
              {formatDate(item?.date)}
            </SvgText>

            {/* VALUE */}
            {selected === index && (
              <SvgText
                x={itemWidth / 2}
                y={chartHeight - padding - barHeight - 8}
                fontSize="10"
                fill="#000"
                fontFamily={fontFamily.montserratBold}
                textAnchor="middle"
              >
                {item.steps}
              </SvgText>
            )}
          </G>
        </Svg>
      </View>
    );
  };

  // -------------------------
  // 📊 UI
  // -------------------------
  return (
    <Wrapper>
      {/* CHART */}
      <Header
        disableLeft={false}
        header={'StepsCounts'}
        leftBtnStyle={styles.leftBtnStyle}
      />
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: '#DBD9EC',
            borderRadius: 24,
            marginTop: 20,
            overflow: 'hidden',
          }}
        >
          <FlatList
            data={data}
            horizontal
            keyExtractor={item => item.dayIndex.toString()}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 10,
            }}
          />
        </View>

        {/* STATS */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>📊 Avg (Start → Today)</Text>
            <Text style={styles.value}>{pastAvg.toFixed(0)} steps</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>🎯 Goal</Text>
            <Text style={styles.value}>{goal} steps</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>🔮 Required Avg</Text>
            <Text style={styles.value}>{requiredAvg.toFixed(0)} steps/day</Text>
          </View>
        </View>
      </View>
      <Button title="Share" buttonStyle={{ marginVertical: 30 }} />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginTop: 25,
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
});
