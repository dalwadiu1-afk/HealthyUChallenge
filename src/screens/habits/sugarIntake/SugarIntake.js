import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import Svg, {
  Path,
  Rect,
  Text as SvgText,
  G,
  Polyline,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';
import { Header, Wrapper } from '../../../components';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

const { width: SW } = Dimensions.get('window');
const CHART_HEIGHT = 220;
const PADDING = 20;
const BAR_WIDTH = 14;
const ITEM_WIDTH = 30;
const USER_ID = auth().currentUser?.uid;

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`; // "2026-04-01"
};

export default function SugarChart30Days({ navigation }) {
  const [product, setProduct] = useState('');
  const [sugarInput, setSugarInput] = useState('');
  const [selected, setSelected] = useState(10);
  const [rawData, setRawData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [todayString, setTodayString] = useState(new Date().toDateString());
  const [startDate, setStartDate] = useState(new Date());

  const gender = 'female';
  const goal = gender === 'female' ? 24 : 36;
  const todayKey = getDateKey();
  const selectedKey = data[selected]?.key;
  const isToday = selectedKey === todayKey;
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const base = new Date(startDate);
  base.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((todayDate - base) / (1000 * 60 * 60 * 24));

  // 👉 cycle index (0 = first 30 days, 1 = next 30 days, etc)
  const cycle = Math.floor(diffDays / 30);

  // 👉 start of current cycle
  const cycleStart = new Date(base);
  cycleStart.setDate(base.getDate() + cycle * 30);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toDateString();
      if (now !== todayString) setToday(now);
    }, 60000);
    return () => clearInterval(interval);
  }, [todayString]);

  useEffect(() => {
    if (!USER_ID) return;

    // refs
    const logsRef = database().ref(`users/${USER_ID}/sugarLogs`);
    const startDateRef = database().ref(`users/${USER_ID}/goal/startDate`);

    // 1️⃣ Get start date ONCE
    startDateRef.once('value').then(snapshot => {
      const value = snapshot.val();

      if (value) {
        setStartDate(new Date(value));
      } else {
        const fallback = new Date();
        fallback.setDate(fallback.getDate() - 29);
        setStartDate(fallback);
      }
    });

    // 2️⃣ Listen to sugar logs LIVE
    const listener = logsRef.on('value', snapshot => {
      const data = snapshot.val();

      if (data) {
        const parsed = Object.keys(data).map(key => ({
          date: key,
          items: data[key]?.items || [],
        }));

        setRawData(parsed);
      } else {
        setRawData([]);
      }

      setIsLoaded(true);
    });

    // cleanup
    return () => logsRef.off('value', listener);
  }, [USER_ID]);

  const formatDate = date =>
    date.toLocaleDateString('en-US', { day: 'numeric' });

  const data = useMemo(() => {
    if (!startDate) return [];

    const base = new Date(cycleStart);
    base.setHours(0, 0, 0, 0);

    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(base);
      date.setDate(base.getDate() + i);

      const key = getDateKey(date);

      const found = rawData.find(d => d.date === key);

      const totalSugar =
        found?.items?.reduce((s, item) => s + item.sugar, 0) || 0;

      return {
        date,
        sugar: totalSugar,
        items: found?.items || [],
        key,
      };
    });
  }, [rawData, cycleStart]);

  const max = Math.max(...data.map(d => d.sugar), goal);
  const graphHeight = CHART_HEIGHT - PADDING * 2;
  const getBarHeight = val => (val / max) * graphHeight;

  const getColor = val => {
    if (val > goal) return '#ef4444';
    if (val === goal) return '#f59e0b';
    return '#22c55e';
  };

  const pastData = data.slice(0, selected + 1);
  const total = pastData.reduce((s, d) => s + d.sugar, 0);
  const avg = total / (selected + 1);
  const remainingDays = 30 - (selected + 1);
  const requiredAvg =
    remainingDays > 0 ? Math.max(0, (goal * 30 - total) / remainingDays) : 0;

  const todayIndex = Math.floor(
    (new Date() - startDate) / (1000 * 60 * 60 * 24),
  );
  const todayIndexSafe = todayIndex >= 0 && todayIndex < 30 ? todayIndex : -1;
  const todayExceeded =
    todayIndexSafe !== -1 && data[todayIndexSafe]?.sugar > goal;
  const trendPoints = data
    .map((d, i) => {
      const x = i * ITEM_WIDTH + ITEM_WIDTH / 2;
      const y = CHART_HEIGHT - PADDING - getBarHeight(d.sugar);
      return `${x},${y}`;
    })
    .join(' ');

  const handleAddSugar = async () => {
    if (!product || !sugarInput) return;

    const newItem = {
      name: product,
      sugar: Number(sugarInput),
    };

    await saveSugarData(newItem);

    setProduct('');
    setSugarInput('');
  };

  const saveSugarData = async newItem => {
    try {
      const dateKey = getDateKey();

      const ref = database().ref(`users/${USER_ID}/sugarLogs/${dateKey}`);

      const snapshot = await ref.once('value');
      const existing = snapshot.val();

      if (existing) {
        await ref.update({
          items: [...(existing.items || []), newItem],
        });
      } else {
        await ref.set({
          date: dateKey,
          items: [newItem],
        });
      }
    } catch (e) {
      console.log('Save error:', e);
    }
  };

  const chartTotalWidth = ITEM_WIDTH * 30;

  return (
    <View style={styles.root}>
      <Header
        header={'Sugar Intake'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />
      <Text style={styles.heroTitle}>🍬 30-Day Sugar Tracker</Text>
      <Text style={styles.heroSub}>
        Daily limit: {goal}g · Tap a bar to see day details
      </Text>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Text style={styles.statVal}>{avg.toFixed(1)}g</Text>
          <Text style={styles.statLbl}>Avg / Day</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statVal}>{goal}g</Text>
          <Text style={styles.statLbl}>Daily Limit</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statVal,
              { color: requiredAvg > goal ? '#ef4444' : colors.secondary },
            ]}
          >
            {requiredAvg.toFixed(1)}g
          </Text>
          <Text style={styles.statLbl}>Required Avg</Text>
        </View>
      </View>
      <Wrapper isForgot safeAreaPops={{ edges: ['bottom'] }}>
        {/* Today exceeded warning */}
        {todayExceeded && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Today exceeded your {goal}g sugar limit!
            </Text>
          </View>
        )}

        {/* Chart card */}
        <View style={styles.chartCard}>
          <View style={styles.chartLabelRow}>
            <Text style={styles.chartTitle}>Daily Sugar (g)</Text>
            <View style={styles.legendRow}>
              <View
                style={[styles.legendDot, { backgroundColor: '#22c55e' }]}
              />
              <Text style={styles.legendText}>Under</Text>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: '#f59e0b', marginLeft: 8 },
                ]}
              />
              <Text style={styles.legendText}>At limit</Text>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: '#ef4444', marginLeft: 8 },
                ]}
              />
              <Text style={styles.legendText}>Over</Text>
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
              {/* Bars */}
              {data.map((item, index) => {
                const barHeight = getBarHeight(item.sugar);
                const barColor =
                  selected === index ? '#60a5fa' : getColor(item.sugar);
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
                    {/* Selected value label */}
                    {selected === index && item.sugar > 0 && (
                      <Text
                        style={[
                          styles.barLabel,
                          {
                            position: 'absolute',
                            bottom: PADDING + barHeight + 4,
                          },
                        ]}
                      >
                        {item.sugar}g
                      </Text>
                    )}
                    {/* Bar */}
                    <View
                      style={{
                        width: BAR_WIDTH,
                        height: Math.max(barHeight, 2),
                        backgroundColor: barColor,
                        borderRadius: 6,
                      }}
                    />
                    {/* Date label */}
                    <Text style={styles.dateLabel}>
                      {formatDate(item.date)}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Trend line overlay */}
              <Svg
                pointerEvents="none"
                height={CHART_HEIGHT}
                width={chartTotalWidth}
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                <Polyline
                  points={trendPoints}
                  fill="none"
                  stroke="rgba(96,165,250,0.5)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              </Svg>
            </View>
          </ScrollView>
        </View>

        {/* Selected day detail */}
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>
              🍽{' '}
              {data[selected]?.date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <View
              style={[
                styles.sugarPill,
                {
                  backgroundColor: `${getColor(data[selected]?.sugar)}22`,
                  borderColor: `${getColor(data[selected]?.sugar)}55`,
                },
              ]}
            >
              <Text
                style={[
                  styles.sugarPillText,
                  { color: getColor(data[selected]?.sugar) },
                ]}
              >
                {data[selected]?.sugar || 0}g
              </Text>
            </View>
          </View>

          {data[selected]?.items.length === 0 ? (
            <Text style={styles.emptyText}>No items recorded for this day</Text>
          ) : (
            data[selected]?.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text
                  style={[styles.itemSugar, { color: getColor(item.sugar) }]}
                >
                  {item.sugar}g
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Add sugar card */}
        {isToday && (
          <View style={styles.addCard}>
            <Text style={styles.addTitle}>🍬 Add Sugar Entry</Text>
            <Text style={styles.addSub}>
              Entries are added to todayDate 's data
            </Text>

            <TextInput
              value={product}
              onChangeText={setProduct}
              placeholder="Product name (e.g. Coke)"
              placeholderTextColor="rgba(255,255,255,0.25)"
              style={styles.input}
            />
            <TextInput
              value={sugarInput}
              onChangeText={setSugarInput}
              keyboardType="numeric"
              placeholder="Sugar amount (g)"
              placeholderTextColor="rgba(255,255,255,0.25)"
              style={[styles.input, { marginBottom: 0 }]}
            />

            <TouchableOpacity
              style={[
                styles.addBtn,
                (!product || !sugarInput) && styles.addBtnDisabled,
              ]}
              onPress={handleAddSugar}
              activeOpacity={0.85}
            >
              <Text style={styles.addBtnText}>Add Entry</Text>
            </TouchableOpacity>
          </View>
        )}
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  heroBg: { paddingBottom: 20, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    paddingHorizontal: 18,
    paddingBottom: 16,
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
    fontSize: 22,
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
    marginBottom: 10,
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

  warningBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    padding: 14,
    marginBottom: 14,
  },
  warningText: {
    color: '#ef4444',
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },

  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  chartLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
  },

  barLabel: {
    color: colors.white,
    fontSize: 9,
    fontFamily: fontFamily.montserratSemiBold,
  },
  dateLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 4,
    textAlign: 'center',
  },

  /* Detail card */
  detailCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 14,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailTitle: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
  sugarPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 49,
    borderWidth: 1,
  },
  sugarPillText: { fontSize: 12, fontFamily: fontFamily.montserratSemiBold },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    textAlign: 'center',
    paddingVertical: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  itemName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  itemSugar: { fontSize: 13, fontFamily: fontFamily.montserratSemiBold },

  /* Add card */
  addCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
  },
  addTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 2,
  },
  addSub: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 14,
  },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 12,
  },
  addBtn: {
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 49,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnDisabled: { backgroundColor: 'rgba(77,102,68,0.4)' },
  addBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
