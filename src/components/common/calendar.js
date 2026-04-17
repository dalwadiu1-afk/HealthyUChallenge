import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SvgImg } from '../../components/common/SvgImg';
import { leftIcon, rightIcon } from '../../assets/images';
import { fontFamily, colors } from '../../constant';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const { height } = Dimensions.get('window');
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

export function StreakCalendar({
  startDate = '2026-04-10',
  showInsight = false,
  setShowInsight,
  container,
}) {
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
        <TouchableOpacity
        // onPress={() => setShowInsight(!showInsight)}
        >
          {/* {!showInsight ? ( */}
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
          {/* ) : (
            <View />
          )} */}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ ...styles.container, ...container }}>
      {/* NAV */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => setCycle(c => Math.max(0, c - 1))}
          style={{ padding: 12, backgroundColor: '#DBD9EC', borderRadius: 5 }}
        >
          <SvgImg iconName={leftIcon} height={15} width={15} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>{getMonthLabel(startDate, cycle)}</Text>

        <TouchableOpacity
          onPress={() => setCycle(c => Math.max(0, c + 1))}
          style={{ padding: 12, backgroundColor: '#DBD9EC', borderRadius: 5 }}
        >
          <SvgImg iconName={rightIcon} height={15} width={15} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          marginTop: 10,
          borderBottomWidth: 1,
          borderColor: colors.primary,
        }}
      />

      {/* WEEK HEADER */}
      <View style={styles.weekRow}>
        {DAYS.map(d => (
          <Text key={d} style={styles.weekText}>
            {d}
          </Text>
        ))}
      </View>

      <View
        style={{
          borderBottomWidth: 1,
          borderColor: colors.primary,
        }}
      />

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
    top: height * 0.12,
    alignSelf: 'center',
    // marginHorizontal: 10,
    backgroundColor: '#DBD9EC',
    borderRadius: 10,
    position: 'absolute',
    zIndex: 2,
    width: '90%',
    elevation: 100,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#262135',
  },

  weekRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },

  weekText: {
    flex: 1,
    textAlign: 'center',
    color: colors.primary,
    fontFamily: fontFamily.CircularRegular,
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
    fontFamily: fontFamily.montserratBold,
  },

  outsideText: {
    color: '#727179',
    fontFamily: fontFamily.montserratMedium,
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
    fontFamily: fontFamily.montserratSemiBold,
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
