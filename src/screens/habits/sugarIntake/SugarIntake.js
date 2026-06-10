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
import moment from 'moment';

const { width: SW } = Dimensions.get('window');
const CHART_HEIGHT = 220;
const PADDING = 20;
const BAR_WIDTH = 14;
const ITEM_WIDTH = 30;

const getDateKey = (date = moment()) => {
  return moment(date).format('YYYY-MM-DD');
};

export default function SugarChart30Days({ route }) {
  const today = moment();
  const CURRENT_MONTH_KEY =
    route?.params?.monthKey ?? today.format('MMMM_YYYY');

  const [product, setProduct] = useState('');
  const [sugarInput, setSugarInput] = useState('');
  const [selected, setSelected] = useState(10);
  const [gender, setGender] = useState('female');
  const [errorMsg, setErrorMsg] = useState('');
  const [habitDays, setHabitDays] = useState({});
  const [todayString, setTodayString] = useState(moment().format('YYYY-MM-DD'));
  const [startDate, setStartDate] = useState(moment().toDate());
  const goal = gender?.toLowerCase() === 'female' ? 24 : 38;
  const cycleStart = useMemo(() => {
    const todayDate = moment().startOf('day');

    const base = moment(startDate).startOf('day');

    const diffDays = todayDate.diff(base, 'days');

    const cycle = Math.floor(diffDays / 30);

    return moment(base).add(cycle * 30, 'days');
  }, [startDate]);

  const rawData = useMemo(() => {
    const monthStart = moment(CURRENT_MONTH_KEY, 'MMMM_YYYY').startOf('month');

    console.log('CURRENT_MONTH_KEY =>', CURRENT_MONTH_KEY);
    console.log('habitDays =>', habitDays);

    const daysInMonth = monthStart.daysInMonth();

    const baseData = Array.from({ length: daysInMonth }, (_, i) => {
      const date = monthStart.clone().add(i, 'days');

      return {
        key: date.format('YYYY-MM-DD'),
        date: date.toDate(),
        sugar: 0,
      };
    });

    console.log(
      'Matching day sample =>',
      baseData[0]?.key,
      habitDays?.[baseData[0]?.key],
    );

    return baseData.map(item => {
      const day = habitDays?.[item.key] || {};

      const items = Array.isArray(day.items)
        ? day.items
        : Object.values(day.items || {});

      const totalSugar =
        day.progress ??
        items.reduce((sum, i) => sum + Number(i?.sugar || 0), 0);

      return {
        ...item,
        items,
        sugar: Number(totalSugar),
      };
    });
  }, [CURRENT_MONTH_KEY, habitDays]);

  useEffect(() => {
    if (!rawData.length) return;

    const todayIndex = rawData.findIndex(d =>
      moment(d.date).isSame(moment(), 'day'),
    );

    if (todayIndex !== -1) {
      setSelected(todayIndex);
    }
  }, [rawData]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = moment().format('YYYY-MM-DD');
      if (now !== todayString) {
        setTodayString(now);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [todayString]);

  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const userRef = database().ref(`/users/${uid}`);

    const onValueChange = snapshot => {
      const data = snapshot.val() || {};

      const startDateRaw = data?.goal?.startDate;
      const dbStartDate = startDateRaw
        ? moment(startDateRaw).toDate()
        : moment().toDate();

      setStartDate(dbStartDate);

      const habits = data?.habits?.sugarIntake || {};

      const gen = data?.profile?.gender;
      setGender(gen);

      // 👇 Add this here
      const monthData = habits?.[CURRENT_MONTH_KEY];

      const days = monthData?.days || monthData?.Days || {};

      setHabitDays(days);
    };

    userRef.on('value', onValueChange);

    return () => userRef.off('value', onValueChange);
  }, [CURRENT_MONTH_KEY]);

  const formatDate = date => moment(date).format('D');
  const data = useMemo(() => {
    console.log('rawData :>> ', rawData);
    return rawData.map(d => ({
      ...d,
      sugar: Number(d.sugar || 0),
    }));
  }, [rawData]);

  const max = Math.max(...data.map(d => d.sugar), goal, 1);
  const graphHeight = CHART_HEIGHT - PADDING * 2;
  const getBarHeight = val => {
    if (!max) return 0;
    return (val / max) * graphHeight;
  };

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
  const selectedDate = rawData?.[selected]?.date;
  const isToday = selectedDate && moment(selectedDate).isSame(moment(), 'day');

  const todayIndex = data.findIndex(d =>
    moment(d.date).isSame(moment(), 'day'),
  );
  const todayExceeded = todayIndex !== -1 && data[todayIndex]?.sugar > goal;
  const trendPoints = data
    .map((d, i) => {
      const x = i * ITEM_WIDTH + ITEM_WIDTH / 2;
      const y = CHART_HEIGHT - PADDING - getBarHeight(d.sugar);
      return `${x},${y}`;
    })
    .join(' ');

  const handleAddSugar = async () => {
    const sugarValue = Number(sugarInput);

    if (!product?.trim() || !sugarInput || sugarValue <= 0) {
      return;
    }

    if (sugarValue > 40) {
      setErrorMsg('You cannot add more than 40g of sugar at one time.');
      return;
    }

    const newItem = {
      name: product.trim(),
      sugar: sugarValue,
    };

    await saveSugarData(newItem);

    setProduct('');
    setSugarInput('');
    setErrorMsg('');
  };

  const saveSugarData = async newItem => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const dateKey = getDateKey();
    const monthName = moment().format('MMMM');
    const year = moment().format('YYYY');
    const habitKey = `${monthName}_${year}`;

    const ref = database().ref(
      `users/${uid}/habits/sugarIntake/${habitKey}/days/${dateKey}`,
    );

    const snapshot = await ref.once('value');
    const existing = snapshot.val() || {};

    // ✅ existing items array
    const existingItems = existing.items || [];

    const updatedItems = [
      ...existingItems,
      {
        name: newItem.name,
        sugar: Number(newItem.sugar),
        createdAt: moment().valueOf(),
      },
    ];

    const totalProgress = updatedItems.reduce(
      (sum, item) => sum + item.sugar,
      0,
    );

    await ref.update({
      items: updatedItems,
      progress: totalProgress,
    });
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
                            // bottom: PADDING + barHeight + 4,
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
              🍽 {moment(data[selected]?.date).format('MMM D')}
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
          {!data[selected]?.items || data[selected]?.items.length === 0 ? (
            <Text style={styles.emptyText}>No items recorded for this day</Text>
          ) : (
            data[selected]?.items?.map((item, idx) => (
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

            {errorMsg && (
              <Text
                style={{
                  color: colors.danger,
                  fontFamily: fontFamily.montserratRegular,
                  fontSize: 11,
                }}
              >
                {errorMsg}
              </Text>
            )}

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
