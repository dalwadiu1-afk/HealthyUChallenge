import React, { useMemo, useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, Text as SvgText, G, Polyline } from 'react-native-svg';

import { Button, Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';
import InputBox from '../../../components/common/InputBox';

export default function SugarChart30Days() {
  const [product, setProduct] = useState('');
  const [sugarInput, setSugarInput] = useState('');

  const chartHeight = 220;
  const padding = 20;
  const barWidth = 14;
  const itemWidth = 30;

  // 🎯 GENDER THRESHOLD
  const gender = 'female';
  const goal = gender === 'female' ? 24 : 36;

  // 🔄 TRACK TODAY
  const [today, setToday] = useState(new Date().toDateString());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toDateString();
      if (now !== today) {
        setToday(now);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [today]);

  // 📅 START DATE
  const startDate = new Date('2026-03-25');

  // 🍬 RAW DATA (UPDATED STRUCTURE)
  const [rawData, setRawData] = useState([
    { dayIndex: 0, items: [{ name: 'Tea', sugar: 12 }] },
    { dayIndex: 1, items: [{ name: 'Juice', sugar: 18 }] },
    { dayIndex: 2, items: [{ name: 'Cake', sugar: 28 }] },
  ]);

  const formatDate = date =>
    date.toLocaleDateString('en-US', { day: 'numeric' });

  // 📊 FORCE 30 DAYS
  const data = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const found = rawData.find(d => d.dayIndex === i);

      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const totalSugar =
        found?.items?.reduce((s, item) => s + item.sugar, 0) || 0;

      return {
        dayIndex: i,
        sugar: totalSugar,
        date,
        items: found?.items || [],
      };
    });
  }, [rawData]);

  const [selected, setSelected] = useState(10);

  const max = Math.max(...data.map(d => d.sugar), goal);
  const graphHeight = chartHeight - padding * 2;

  const getBarHeight = val => (val / max) * graphHeight;

  // 🎨 COLOR RULES
  const getColor = val => {
    if (val > goal) return '#ef4444';
    if (val === goal) return '#f59e0b';
    return '#22c55e';
  };

  // 📊 STATS
  const pastData = data.slice(0, selected + 1);
  const total = pastData.reduce((s, d) => s + d.sugar, 0);
  const avg = total / (selected + 1);

  const remainingDays = 30 - (selected + 1);
  const requiredAvg =
    remainingDays > 0 ? Math.max(0, (goal * 30 - total) / remainingDays) : 0;

  // ⚠️ TODAY CHECK
  const todayIndex = data.findIndex(d => d.date.toDateString() === today);

  const todayExceeded = todayIndex !== -1 && data[todayIndex].sugar > goal;

  // 📈 TREND LINE
  const trendPoints = data
    .map((d, i) => {
      const x = i * itemWidth + itemWidth / 2;
      const y = chartHeight - padding - getBarHeight(d.sugar);
      return `${x},${y}`;
    })
    .join(' ');

  // ➕ ADD ENTRY
  const handleAddSugar = () => {
    if (!product || !sugarInput) return;
    if (todayIndex === -1) return;

    setRawData(prev => {
      const updated = [...prev];
      const index = updated.findIndex(d => d.dayIndex === todayIndex);

      if (index !== -1) {
        updated[index].items.push({
          name: product,
          sugar: Number(sugarInput),
        });
      } else {
        updated.push({
          dayIndex: todayIndex,
          items: [{ name: product, sugar: Number(sugarInput) }],
        });
      }

      return updated;
    });

    setProduct('');
    setSugarInput('');
  };

  // ---------------- RENDER ----------------
  const renderItem = ({ item, index }) => {
    const barHeight = getBarHeight(item.sugar);
    const color = getColor(item.sugar);

    return (
      <View style={{ width: itemWidth, alignItems: 'center' }}>
        <Svg width={itemWidth} height={chartHeight}>
          <G>
            <Rect
              x={(itemWidth - barWidth) / 2}
              y={chartHeight - padding - barHeight}
              width={barWidth}
              height={barHeight}
              fill={selected === index ? '#3b82f6' : color}
              rx={6}
            />

            <Rect
              x={0}
              y={0}
              width={itemWidth}
              height={chartHeight}
              fill="transparent"
              onPress={() => setSelected(index)}
            />

            {selected === index && (
              <SvgText
                x={itemWidth / 2}
                y={chartHeight - padding - barHeight - 8}
                fontSize="10"
                fill="#000"
                textAnchor="middle"
                fontFamily={fontFamily?.montserratSemiBold}
              >
                {item.sugar}g
              </SvgText>
            )}

            <SvgText
              x={itemWidth / 2}
              y={chartHeight - 5}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
              fontFamily={fontFamily?.montserratSemiBold}
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
      <Header header="Sugar Intake Tracker" />

      <ScrollView>
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

            <Svg
              pointerEvents="none"
              height={chartHeight}
              width={itemWidth * 30}
              style={{ position: 'absolute' }}
            >
              <Polyline
                points={trendPoints}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
            </Svg>
          </View>
        </ScrollView>

        {/* STATS */}
        <View style={styles.card}>
          <Row label="📊 Avg Sugar" value={`${avg.toFixed(1)}g`} />
          <Divider />
          <Row label="🎯 Daily Limit" value={`${goal}g`} />
          <Divider />
          <Row
            label="🔮 Required Avg"
            value={`${requiredAvg.toFixed(1)}g/day`}
          />
        </View>

        {/* TODAY WARNING */}
        {todayExceeded && (
          <View style={{ padding: 10 }}>
            <Text style={{ color: 'red', fontWeight: 'bold' }}>
              ⚠️ Today exceeded sugar limit!
            </Text>
          </View>
        )}

        {/* 🧾 ITEMS LIST */}
        <View style={styles.card}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
            🍽️ Items for Selected Day
          </Text>

          {data[selected]?.items.length === 0 ? (
            <Text style={{ color: '#666' }}>No items added</Text>
          ) : (
            data[selected].items.map((item, idx) => (
              <View key={idx} style={styles.row}>
                <Text style={styles.label}>{item.name}</Text>
                <Text style={styles.value}>{item.sugar}g</Text>
              </View>
            ))
          )}
        </View>

        {/* INPUT */}
        <View style={styles.inputBox}>
          <Text>🍬 Add Sugar</Text>

          <InputBox
            value={product}
            onChangeText={setProduct}
            placeholder="Product name (e.g. Coke)"
            mainContainer={{ marginVertical: 10 }}
          />

          <InputBox
            value={sugarInput}
            onChangeText={setSugarInput}
            keyboardType="numeric"
            placeholder="Sugar (g)"
            mainContainer={{ marginBottom: 10 }}
          />

          <Button title="Add" onPress={handleAddSugar} />
        </View>
      </ScrollView>
    </Wrapper>
  );
}

/* ---------------- HELPERS ---------------- */

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  chartBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    marginTop: 20,
    overflow: 'hidden',
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
    fontFamily: fontFamily?.montserratMedium,
  },

  value: {
    fontSize: 14,
    color: '#111',
    fontFamily: fontFamily?.montserratSemiBold,
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
});
