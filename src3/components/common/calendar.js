import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fontFamily, colors } from '../../constant';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Helpers ──────────────────────────────────────────────

const formatDate = d =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

const parseLocalDate = dateStr => {
  const [y, m, d] = dateStr.split('-');
  return new Date(y, m - 1, d);
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const getMonthLabel = (startDate, cycle) => {
  const base = parseLocalDate(startDate);
  const date = addDays(base, cycle * 30);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

const get30DaysData = (startDate, cycle) => {
  const base = parseLocalDate(startDate);
  const offset = cycle * 30;
  const start = addDays(base, offset);
  const arr = [];

  const firstDay = start.getDay();
  for (let i = firstDay - 1; i >= 0; i--) {
    arr.push({ date: addDays(start, -i - 1), current: false });
  }
  for (let i = 0; i < 30; i++) {
    arr.push({ date: addDays(start, i), current: true });
  }
  while (arr.length % 7 !== 0) {
    arr.push({ date: addDays(arr[arr.length - 1].date, 1), current: false });
  }
  return arr;
};

// ── Component ─────────────────────────────────────────────

export function StreakCalendar({ startDate = '2026-04-10', container }) {
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

  // Auto advance cycle when all days are done
  useEffect(() => {
    const realDays = data.filter(d => d.current);
    const allDone =
      realDays.length > 0 &&
      realDays.every(d => completedSet.has(formatDate(d.date)));
    if (allDone) {
      setTimeout(() => setCycle(prev => prev + 1), 300);
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
          todayMatch && styles.todayBox,
        ]}
      >
        <Text
          style={[
            styles.dayText,
            current ? styles.currentText : styles.outsideText,
            completed && styles.completedText,
            todayMatch && styles.todayText,
          ]}
        >
          {date.getDate()}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, container]}>
      {/* Navigation row */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => setCycle(c => Math.max(0, c - 1))}
          style={styles.navBtn}
          activeOpacity={0.75}
        >
          <Svg width={9} height={14} viewBox="0 0 9 16" fill="none">
            <Path
              d="M8 1L1 8L8 15"
              stroke={colors.secondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        <Text style={styles.navTitle}>{getMonthLabel(startDate, cycle)}</Text>

        <TouchableOpacity
          onPress={() => setCycle(c => c + 1)}
          style={styles.navBtn}
          activeOpacity={0.75}
        >
          <Svg width={9} height={14} viewBox="0 0 9 16" fill="none">
            <Path
              d="M1 1L8 8L1 15"
              stroke={colors.secondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Week headers */}
      <View style={styles.weekRow}>
        {DAYS.map(d => (
          <Text key={d} style={styles.weekText}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Calendar grid */}
      <FlatList
        data={data}
        numColumns={7}
        scrollEnabled={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'absolute',
    zIndex: 2,
    width: '92%',
    alignSelf: 'center',
    elevation: 20,
  },

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 10,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.25)',
    backgroundColor: 'rgba(143,175,120,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
  },

  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekText: {
    flex: 1,
    textAlign: 'center',
    color: colors.secondary,
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },

  dayBox: {
    flex: 1,
    height: 40,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  dayText: {
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  outsideText: {
    color: 'rgba(255,255,255,0.2)',
  },
  currentText: {
    color: 'rgba(255,255,255,0.75)',
  },

  // Today highlight
  todayBox: {
    backgroundColor: 'rgba(167,130,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(167,130,255,0.45)',
    zIndex: 2,
  },
  todayText: {
    color: '#A782FF',
    fontFamily: fontFamily.montserratSemiBold,
  },

  // Completed / streak
  completedBox: {
    backgroundColor: 'rgba(143,175,120,0.25)',
  },
  completedText: {
    color: colors.secondary,
    fontFamily: fontFamily.montserratSemiBold,
  },

  streakStart: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  streakMiddle: {
    borderRadius: 0,
  },
  streakEnd: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
});
