import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ===== HELPERS =====

// Fix timezone
const formatDate = d =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

// Safe parse
const parseLocalDate = dateStr => {
  const [y, m, d] = dateStr.split('-');
  return new Date(y, m - 1, d);
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Month label
const getMonthLabel = (startDate, cycle) => {
  const base = parseLocalDate(startDate);
  const date = addDays(base, cycle * 30);

  return date.toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

// 🔥 30 DAY DATA WITH OVERFLOW
const get30DaysData = (startDate, cycle) => {
  const base = parseLocalDate(startDate);
  const offset = cycle * 30;

  const start = addDays(base, offset);
  const arr = [];

  const firstDay = start.getDay();

  // previous days (grey)
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = addDays(start, -i - 1);
    arr.push({ date: d, current: false });
  }

  // current 30 days
  for (let i = 0; i < 30; i++) {
    const d = addDays(start, i);
    arr.push({ date: d, current: true });
  }

  // next days to fill grid
  while (arr.length % 7 !== 0) {
    const last = arr[arr.length - 1].date;
    const next = addDays(last, 1);
    arr.push({ date: next, current: false });
  }

  return arr;
};

export default function StreakCalendar({ startDate = '2026-04-10' }) {
  const [cycle, setCycle] = useState(0);

  const [completedDates, setCompletedDates] = useState([
    '2026-04-14',
    '2026-04-15',
    '2026-04-16',
    '2026-04-19',
    '2026-04-20',
  ]);

  const today = new Date();

  const completedSet = useMemo(() => new Set(completedDates), [completedDates]);

  const data = useMemo(
    () => get30DaysData(startDate, cycle),
    [startDate, cycle],
  );

  const isToday = date =>
    date &&
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isCompleted = date => date && completedSet.has(formatDate(date));

  // streak logic
  const getStreakType = date => {
    if (!date || !isCompleted(date)) return null;

    const prev = formatDate(addDays(date, -1));
    const next = formatDate(addDays(date, 1));

    const hasPrev = completedSet.has(prev);
    const hasNext = completedSet.has(next);

    if (!hasPrev && hasNext) return 'start';
    if (hasPrev && hasNext) return 'middle';
    if (hasPrev && !hasNext) return 'end';
    return 'single';
  };

  // auto next cycle
  useEffect(() => {
    const realDays = data.filter(d => d.current);

    const allDone =
      realDays.length > 0 &&
      realDays.every(d => completedSet.has(formatDate(d.date)));

    if (allDone) {
      setTimeout(() => {
        setCycle(prev => prev + 1);
      }, 300);
    }
  }, [completedDates, data]);

  const renderItem = ({ item }) => {
    const { date, current } = item;

    const todayMatch = isToday(date);
    const completed = current && isCompleted(date);
    const streakType = current ? getStreakType(date) : null;

    return (
      <View
        style={[
          styles.dayBox,
          completed && styles.completedBox,
          streakType === 'start' && styles.streakStart,
          streakType === 'middle' && styles.streakMiddle,
          streakType === 'end' && styles.streakEnd,
          todayMatch && styles.activeBox,
        ]}
      >
        <Text
          style={[
            styles.dayText,
            current ? styles.currentText : styles.outsideText,
            completed && styles.completedText,
            todayMatch && styles.activeText,
          ]}
        >
          {date.getDate()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* NAV */}
      <View style={styles.navRow}>
        <Text
          style={styles.navBtn}
          onPress={() => setCycle(c => Math.max(0, c - 1))}
        >
          ◀
        </Text>

        <Text style={styles.navTitle}>{getMonthLabel(startDate, cycle)}</Text>

        <Text style={styles.navBtn} onPress={() => setCycle(c => c + 1)}>
          ▶
        </Text>
      </View>

      {/* WEEK HEADER */}
      <View style={styles.weekRow}>
        {DAYS.map(d => (
          <Text key={d} style={styles.weekText}>
            {d}
          </Text>
        ))}
      </View>

      {/* GRID */}
      <FlatList
        data={data}
        numColumns={7}
        scrollEnabled={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginTop: 40,
  },

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },

  navBtn: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7B83FF',
  },

  navTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  weekRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  weekText: {
    flex: 1,
    textAlign: 'center',
    color: '#888',
    fontWeight: '600',
  },

  dayBox: {
    flex: 1,
    height: 44,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  dayText: {
    fontSize: 14,
  },

  outsideText: {
    color: '#ccc',
  },

  currentText: {
    color: '#444',
  },

  activeBox: {
    backgroundColor: '#7B83FF',
    zIndex: 2,
  },

  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  completedBox: {
    backgroundColor: '#2EE59D',
  },

  completedText: {
    color: '#06291d',
    fontWeight: '600',
  },

  streakStart: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },

  streakMiddle: {
    borderRadius: 0,
  },

  streakEnd: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
});
