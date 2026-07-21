import React, { useEffect, useMemo, useRef, useState } from 'react';

import { View, FlatList, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { Button, Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import moment from 'moment';

const formatKey = date => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function SleepChart30Days({ navigation }) {
  const [selected, setSelected] = useState(0);
  const [goalStartDate, setGoalStartDate] = useState(new Date());
  const [sleepData, setSleepData] = useState({});
  const chartHeight = 220;
  const padding = 20;
  const barWidth = 14;
  const itemWidth = 30;
  const scrollRef = useRef(null);

  // 📅 Start date

  const graph = Array.from({ length: 30 }, (_, i) => {
    const d = moment(goalStartDate).add(i, 'days');

    return {
      date: d.toDate(),
      key: d.format('YYYY-MM-DD'),
    };
  });

  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const ref = database().ref(`users/${uid}`);

    const listener = ref.on('value', snapshot => {
      const user = snapshot.val() || {};

      setGoalStartDate(
        user.goal?.startDate
          ? moment(user.goal.startDate).toDate()
          : new Date(),
      );

      setSleepData(user.habits?.sleep || {});
    });

    return () => ref.off('value', listener);
  }, []);

  const TODAY_KEY = formatKey(new Date());

  useEffect(() => {
    if (!data.length) return;

    const todayIndex = data.findIndex(
      item => formatKey(item.date) === TODAY_KEY,
    );

    if (todayIndex === -1) return;

    setSelected(todayIndex);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollToOffset({
        offset: todayIndex * itemWidth,
        animated: true,
      });
    });
  }, [data]);

  // 🌙 Sleep data (hours)
  const rawData = useMemo(() => {
    const result = [];

    Object.values(sleepData).forEach(month => {
      const days = month?.days || {};

      Object.entries(days).forEach(([date, value]) => {
        const sleepHours = parseFloat(value?.sleep) || 0;

        result.push({
          date,
          sleep: sleepHours,
        });
      });
    });

    return result;
  }, [sleepData]);

  const data = useMemo(() => {
    if (!goalStartDate) return [];

    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(goalStartDate);

      date.setDate(date.getDate() + i);

      const key = formatKey(date);

      const entry = rawData.find(x => x.date === key);

      return {
        date,
        sleep: entry?.sleep ?? 0,
      };
    });
  }, [goalStartDate, rawData]);

  const formatDate = date =>
    date.toLocaleDateString('en-US', { day: 'numeric' });

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

  const ITEM_WIDTH = 30;
  // -------------------------
  // UI
  // -------------------------
  return (
    <View style={{ flex: 1, backgroundColor: colors.dark }}>
      <Header
        header={'Sleep Tracker'}
        headerContainer={{ paddingHorizontal: 23 }}
      />
      <Wrapper orbsRight safeAreaPops={{ edges: ['bottom'] }}>
        <View style={{ flex: 1 }}>
          <View style={styles.chartContainer}>
            <FlatList
              ref={scrollRef}
              data={data}
              horizontal
              keyExtractor={item => formatKey(item.date)}
              renderItem={renderItem}
              getItemLayout={(_, index) => ({
                length: itemWidth,
                offset: itemWidth * index,
                index,
              })}
              onContentSizeChange={() => {
                if (selected >= 0) {
                  scrollRef.current?.scrollToIndex({
                    index: selected,
                    animated: false,
                    viewPosition: 0.5,
                  });
                }
              }}
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

            {/* <View style={styles.row}>
            <Text style={styles.label}>🔮 Required Avg</Text>
            <Text style={styles.value}>{requiredAvg.toFixed(1)} hrs/day</Text>
          </View> */}
          </View>
        </View>
        <Button
          title="Add Sleep Data Manually"
          onPress={() => navigation.navigate('SleepMeasure')}
        />
      </Wrapper>
    </View>
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
