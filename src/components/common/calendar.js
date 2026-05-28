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
import { fontFamily, colors, BONUS_DAY } from '../../constant';
import Svg, { Circle } from 'react-native-svg';
import moment from 'moment';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const { height } = Dimensions.get('window');
const RING_SIZE = 44;
const RING_BORDER = 4;
// ===== PREMIUM DARK THEME COLORS =====

// base ring track
const TRACK_COLOR = 'rgba(255,255,255,0.07)';

// ✅ completed / correct
const SUCCESS_COLOR = colors.secondary; // vibrant emerald green

// ⚠️ attempted but wrong
const WARNING_COLOR = 'rgba(77, 102, 68, 0.3)'; // rich amber-orange

// ❌ missed day
const MISSED_COLOR = '#EF4444'; // vivid soft red

// subtle missed background
const MISSED_BG = 'rgba(239,68,68,0.16)';

// Replace hardcoded stroke color inside SVG string so icon renders white
const whiteIcon = svg => svg.replace(/stroke="[^"]+"/g, 'stroke="#FFFFFF"');
const leftIconWhite = whiteIcon(leftIcon);
const rightIconWhite = whiteIcon(rightIcon);

// ===== HELPERS =====

const formatDate = d => moment(d).format('YYYY-MM-DD');

const parseLocalDate = dateStr => moment(dateStr, 'YYYY-MM-DD');

const addDays = (date, days) => moment(date).add(days, 'days');

const today = moment();

const getMonthLabel = (startDate, cycle) => {
  return moment(startDate)
    .add(cycle * 30, 'days')
    .format('MMM YYYY');
};

const get30DaysData = (startDate, cycle) => {
  const start = moment(startDate).add(cycle * 30, 'days');

  const arr = [];

  const firstDay = start.day();

  for (let i = firstDay - 1; i >= 0; i--) {
    arr.push({
      date: moment(start).subtract(i + 1, 'days'),
      current: false,
    });
  }

  for (let i = 0; i < 30; i++) {
    arr.push({
      date: moment(start).add(i, 'days'),
      current: true,
    });
  }

  while (arr.length % 7 !== 0) {
    const last = arr[arr.length - 1].date;

    arr.push({
      date: moment(last).add(1, 'days'),
      current: false,
    });
  }

  return arr;
};

export function StreakCalendar({
  startDate = '2026-04-01',
  streakData,
  container,
}) {
  const [cycle, setCycle] = useState(0);

  console.log('streakData :>> ', streakData);
  const completedDates = useMemo(() => {
    if (!streakData) return [];

    return Object.entries(streakData)
      .filter(([_, value]) => value?.normalQuiz)
      .map(([date]) => date);
  }, [streakData]);

  const completedSet = useMemo(() => new Set(completedDates), [completedDates]);

  const data = useMemo(
    () => get30DaysData(startDate, cycle),
    [startDate, cycle],
  );
  const isToday = date => moment(date).isSame(today, 'day');

  useEffect(() => {
    const realDays = data.filter(d => d.current);
    const allDone =
      realDays.length > 0 &&
      realDays.every(d => completedSet.has(formatDate(d.date)));
    if (allDone) {
      setTimeout(() => setCycle(prev => prev + 1), 300);
    }
  }, [completedDates, data]);

  const latestQuizDate = useMemo(() => {
    const dates = Object.keys(streakData || {});

    if (!dates.length) return null;

    return dates.sort().pop();
  }, [streakData]);

  const getQuizStats = date => {
    const key = formatDate(date);

    const dayData = streakData?.[key];

    const quiz = dayData?.normalQuiz;
    const bonusQuiz = dayData?.bonusQuizzes;

    // latest existing quiz date
    const latest = latestQuizDate ? parseLocalDate(latestQuizDate) : null;

    const currentDate = moment(key, 'YYYY-MM-DD');

    // ❌ only mark missed IF date is before/equal latest quiz date
    const shouldMarkMissed =
      latest && currentDate.isSameOrBefore(latest, 'day');
    if (!quiz) {
      return {
        total: 0,
        correct: 0,
        wrong: 0,

        bonusTotal: 0,
        bonusCorrect: 0,
        bonusWrong: 0,

        missed: shouldMarkMissed,
      };
    }

    return {
      total: quiz?.totalQuestions || 0,
      correct: quiz?.correctAnswers || 0,
      wrong: quiz?.wrongAnswers || 0,

      bonusTotal: bonusQuiz?.totalQuestions || 0,
      bonusCorrect: bonusQuiz?.correctAnswers || 0,
      bonusWrong: bonusQuiz?.wrongAnswers || 0,

      missed: false,
    };
  };

  const isBonusDay = date => {
    return moment(date).day() === BONUS_DAY;
  };

  const renderItem = ({ item }) => {
    const { date, current } = item;
    const todayMatch = isToday(date);
    const { missed } = getQuizStats(date);

    return (
      <View style={styles.dayBox}>
        {/* Date number */}
        {todayMatch ? (
          <View style={styles.todayCircle}>
            <Text style={styles.todayText}>{moment(date).date()}</Text>
          </View>
        ) : (
          <Text
            style={[
              styles.dateText,
              current ? styles.currentText : styles.outsideText,
            ]}
          >
            {moment(date).date()}
          </Text>
        )}

        {/* Ring */}
        {current ? (
          (() => {
            const {
              total,
              correct,
              wrong,

              bonusTotal,
              bonusCorrect,
              bonusWrong,

              missed,
            } = getQuizStats(date);

            // bigger ring now
            const size = 44;

            const outerStroke = 4;
            const innerStroke = 3;

            const outerRadius = (size - outerStroke) / 2;

            // inner bonus ring
            const innerRadius = outerRadius - 7;

            const outerCircumference = outerRadius * 2 * Math.PI;
            const innerCircumference = innerRadius * 2 * Math.PI;

            // normal progress
            const correctProgress =
              total > 0 ? (correct / total) * outerCircumference : 0;

            const wrongProgress =
              total > 0 ? (wrong / total) * outerCircumference : 0;

            // bonus progress
            const bonusCorrectProgress =
              bonusTotal > 0
                ? (bonusCorrect / bonusTotal) * innerCircumference
                : 0;

            const bonusWrongProgress =
              bonusTotal > 0
                ? (bonusWrong / bonusTotal) * innerCircumference
                : 0;

            const hasBonusQuiz = bonusTotal > 0;

            // if it's bonus weekday but no bonus quiz submitted
            const latest = latestQuizDate
              ? parseLocalDate(latestQuizDate)
              : null;

            const currentDate = parseLocalDate(formatDate(date));

            const isPastOrTodayBonusDay =
              latest &&
              currentDate.isSameOrBefore(latest, 'day') &&
              isBonusDay(date);
            // also mark today instantly if today is bonus day
            const isTodayBonusMissing =
              isToday(date) && isBonusDay(date) && !hasBonusQuiz;

            const missedBonusDay =
              (!hasBonusQuiz && isPastOrTodayBonusDay) || isTodayBonusMissing;

            // ❌ missed entire day
            const showOuterMissed = missed;

            return (
              <Svg
                width={size}
                height={size}
                style={{
                  transform: [{ rotate: '-90deg' }],
                }}
              >
                {/* ========================= */}
                {/* OUTER RING → NORMAL QUIZ */}
                {/* ========================= */}

                <Circle
                  stroke={showOuterMissed ? MISSED_BG : TRACK_COLOR}
                  fill="transparent"
                  cx={size / 2}
                  cy={size / 2}
                  r={outerRadius}
                  strokeWidth={outerStroke}
                />

                {/* normal correct */}
                {showOuterMissed ? (
                  <Circle
                    stroke={MISSED_COLOR}
                    fill="transparent"
                    cx={size / 2}
                    cy={size / 2}
                    r={outerRadius}
                    strokeWidth={outerStroke}
                    strokeLinecap="round"
                  />
                ) : (
                  <>
                    {correct > 0 && (
                      <Circle
                        stroke={SUCCESS_COLOR}
                        fill="transparent"
                        cx={size / 2}
                        cy={size / 2}
                        r={outerRadius}
                        strokeWidth={outerStroke}
                        strokeDasharray={`${correctProgress} ${outerCircumference}`}
                        strokeLinecap="round"
                      />
                    )}

                    {wrong > 0 && (
                      <Circle
                        stroke={WARNING_COLOR}
                        fill="transparent"
                        cx={size / 2}
                        cy={size / 2}
                        r={outerRadius}
                        strokeWidth={outerStroke}
                        strokeDasharray={`${wrongProgress} ${outerCircumference}`}
                        strokeDashoffset={-correctProgress}
                        strokeLinecap="round"
                      />
                    )}
                  </>
                )}

                {/* ======================== */}
                {/* INNER RING → BONUS QUIZ */}
                {/* ======================== */}

                {(hasBonusQuiz || isBonusDay(date)) && (
                  <>
                    {/* bonus background */}
                    <Circle
                      stroke="rgba(255,255,255,0.05)"
                      fill="transparent"
                      cx={size / 2}
                      cy={size / 2}
                      r={innerRadius}
                      strokeWidth={innerStroke}
                    />

                    {/* ❌ MISSED BONUS DAY */}
                    {missedBonusDay ? (
                      <Circle
                        stroke={MISSED_COLOR}
                        fill="transparent"
                        cx={size / 2}
                        cy={size / 2}
                        r={innerRadius}
                        strokeWidth={innerStroke}
                        strokeLinecap="round"
                      />
                    ) : (
                      <>
                        {/* bonus correct */}
                        {bonusCorrect > 0 && (
                          <Circle
                            stroke={colors.secondary}
                            fill="transparent"
                            cx={size / 2}
                            cy={size / 2}
                            r={innerRadius}
                            strokeWidth={innerStroke}
                            strokeDasharray={`${bonusCorrectProgress} ${innerCircumference}`}
                            strokeLinecap="round"
                          />
                        )}

                        {/* bonus wrong */}
                        {bonusWrong > 0 && (
                          <Circle
                            stroke="rgba(77, 102, 68, 0.3)"
                            fill="transparent"
                            cx={size / 2}
                            cy={size / 2}
                            r={innerRadius}
                            strokeWidth={innerStroke}
                            strokeDasharray={`${bonusWrongProgress} ${innerCircumference}`}
                            strokeDashoffset={-bonusCorrectProgress}
                            strokeLinecap="round"
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </Svg>
            );
          })()
        ) : (
          <View style={[styles.ring, styles.ringHidden]} />
        )}

        {/* Today dot */}
        {todayMatch && (
          <View
            style={{
              ...styles.todayDot,
              backgroundColor: missed ? 'red' : colors.secondary,
            }}
          />
        )}
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
    zIndex: 5,
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
    minHeight: RING_SIZE + 34,
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
