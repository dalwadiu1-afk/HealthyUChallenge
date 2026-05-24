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
const RING_SIZE = 38;
const RING_BORDER = 4;

// Replace hardcoded stroke color inside SVG string so icon renders white
const whiteIcon = svg => svg.replace(/stroke="[^"]+"/g, 'stroke="#FFFFFF"');
const leftIconWhite = whiteIcon(leftIcon);
const rightIconWhite = whiteIcon(rightIcon);

// ===== HELPERS =====

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
    const d = addDays(start, -i - 1);
    arr.push({ date: d, current: false });
  }
  for (let i = 0; i < 30; i++) {
    const d = addDays(start, i);
    arr.push({ date: d, current: true });
  }
  while (arr.length % 7 !== 0) {
    const last = arr[arr.length - 1].date;
    arr.push({ date: addDays(last, 1), current: false });
  }

  return arr;
};

export function StreakCalendar({
  startDate = '2026-04-01',
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

    return (
      <View style={styles.dayBox}>
        {/* Date number */}
        {todayMatch ? (
          <View style={styles.todayCircle}>
            <Text style={styles.todayText}>{date.getDate()}</Text>
          </View>
        ) : (
          <Text
            style={[
              styles.dateText,
              current ? styles.currentText : styles.outsideText,
            ]}
          >
            {date.getDate()}
          </Text>
        )}

        {/* Ring */}
        <View
          style={[
            styles.ring,
            current
              ? completed
                ? styles.ringOn
                : styles.ringOff
              : styles.ringHidden,
          ]}
        />

        {/* Today dot */}
        {todayMatch && <View style={styles.todayDot} />}
      </View>
    );
  };

  return (
    <View style={{ ...styles.container, ...container }}>
      {/* NAV */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => setCycle(c => Math.max(0, c - 1))}
          style={styles.navBtn}
        >
          <SvgImg iconName={leftIconWhite} height={14} width={14} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>{getMonthLabel(startDate, cycle)}</Text>

        <TouchableOpacity
          onPress={() => setCycle(c => c + 1)}
          style={styles.navBtn}
        >
          <SvgImg iconName={rightIconWhite} height={14} width={14} />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* WEEK HEADER */}
      <View style={styles.weekRow}>
        {DAYS.map(d => (
          <Text key={d} style={styles.weekText}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.divider} />

      {/* GRID */}
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

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    padding: 10,
    top: height * 0.069,
    alignSelf: 'center',
    backgroundColor: colors.dark,
    borderRadius: 10,
    position: 'absolute',
    zIndex: 1,
    width: '100%',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(143, 175, 120, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(143, 175, 120, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  navTitle: {
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
  },

  divider: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderColor: colors.bubbleDark,
  },

  weekRow: {
    flexDirection: 'row',
    marginVertical: 8,
  },

  weekText: {
    flex: 1,
    textAlign: 'center',
    color: colors.grey,
    fontSize: 11,
    fontFamily: fontFamily.CircularRegular,
  },

  // Each day cell: column with date number + ring
  dayBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    minHeight: RING_SIZE + 28,
  },

  dateText: {
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    marginBottom: 4,
    lineHeight: 14,
  },

  currentText: {
    color: colors.white,
  },

  outsideText: {
    color: colors.grey,
    fontFamily: fontFamily.montserratMedium,
  },

  todayCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  todayText: {
    fontSize: 11,
    fontFamily: fontFamily.montserratBold,
    color: colors.dark,
    lineHeight: 14,
  },

  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.secondary,
    marginTop: 3,
  },

  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_BORDER,
  },

  ringOn: {
    borderColor: colors.secondary,
  },

  ringOff: {
    borderColor: 'rgba(77, 102, 68, 0.3)',
  },

  ringHidden: {
    borderColor: 'transparent',
  },
});
