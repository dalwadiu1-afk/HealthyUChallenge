import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
} from 'react-native';
import Svg, {
  Circle,
  G,
  Text as SvgText,
  Path,
  Defs,
  LinearGradient,
  Stop,
  Rect,
} from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';
import { Header, Wrapper } from '../../../components';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import moment from 'moment';
import auth from '@react-native-firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';

function GradientBg({ id, c1, c2, r = 16, horizontal = false }) {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient
          id={id}
          x1="0"
          y1="0"
          x2={horizontal ? '1' : '0'}
          y2={horizontal ? '0' : '1'}
        >
          <Stop offset="0" stopColor={c1} stopOpacity="1" />
          <Stop offset="1" stopColor={c2} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} rx={r} />
    </Svg>
  );
}

const SIZE = 280;
const STROKE = 24;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;
const USER_ID = auth().currentUser?.uid;

const toRad = deg => (deg * Math.PI) / 180;

const polarToCartesian = angle => {
  const a = toRad(angle - 90);
  return {
    x: CENTER + RADIUS * Math.cos(a),
    y: CENTER + RADIUS * Math.sin(a),
  };
};

const describeArc = (startAngle, endAngle) => {
  let sweep = endAngle - startAngle;
  if (sweep < 0) sweep += 360;
  const largeArcFlag = sweep > 180 ? 1 : 0;
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(startAngle + sweep);
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
};

const timeToAngle = time => {
  const [h, m] = time.split(':').map(Number);
  const hour12 = h % 12;
  return ((hour12 * 60 + m) / (12 * 60)) * 360;
};

const angleToTime = angle => {
  const total = (angle / 360) * 12 * 60;
  let h = Math.floor(total / 60);
  let m = Math.floor(total % 60);
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const minutesToAngle = min => {
  const minutes12h = min % (12 * 60);
  return (minutes12h / (12 * 60)) * 360;
};

const getNowTime = () => {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
};

const isAM = time => {
  const [h] = time.split(':').map(Number);
  return h < 12;
};
const getDuration = (startAngle, endAngle) => {
  let diff = endAngle - startAngle;
  if (diff < 0) diff += 360;
  const totalMinutes = (diff / 360) * 12 * 60;
  return {
    hours: Math.floor(totalMinutes / 60),
    mins: Math.floor(totalMinutes % 60),
  };
};

const getSleepQuality = hours => {
  if (hours >= 7 && hours <= 9) return { label: 'Excellent', color: '#8FAF78' };
  if (hours >= 6) return { label: 'Good', color: '#FFC15A' };
  return { label: 'Poor', color: '#FF6B6B' };
};

export default function SleepClock({ navigation }) {
  const [sleepData, setSleepData] = useState(null);
  const [sleepLogs, setSleepLogs] = useState({});
  const [date, setDate] = useState(moment().format('ddd, MMMM Do'));
  const [show, setShow] = useState(false);
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [started, setStarted] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [liveWakeTime, setLiveWakeTime] = useState(getNowTime());
  const [bedAngle, setBedAngle] = useState(timeToAngle('22:00'));
  const [wakeAngle, setWakeAngle] = useState(timeToAngle('06:00'));
  const [sleepDateKey, setSleepDateKey] = useState(null);
  const [tab, setTab] = useState('timer');
  const tabs = [
    { key: 'timer', label: 'Timer' },
    { key: 'manually', label: 'Manually' },
  ];

  const init = async () => {
    const ref = database().ref(`users/${USER_ID}`);
    const snapshot = await ref.once('value');
    const data = snapshot.val();
    // create if not exists
    if (!data) {
      await ref.set({
        goal: {
          selectedGoal: '8',
          startDate: new Date().toISOString().split('T')[0],
        },
        activities: {
          sleep: `${hours}h ${mins}m`,
        },
        logs: {},
      });
    }

    // live listener
    ref.on('value', snapshot => {
      const data = snapshot.val() || {};

      setSleepData(data);

      if (data?.goal?.selectedGoal) {
        setGoalInput(String(data.goal.selectedGoal));
      }

      const today = new Date().toISOString().split('T')[0];
      const todayLog = data.sleepLogs?.[today];

      if (todayLog) {
        setBedTime(todayLog.bedTime || '22:00');
        setWakeTime(todayLog.wakeTime || '06:00');
      }
    });

    return () => ref.off();
  };

  useEffect(() => {
    init();

    let interval;

    if (started && startTime) {
      interval = setInterval(() => {
        const now = new Date();

        const seconds = Math.floor((now - startTime) / 1000);
        setLiveSeconds(seconds);

        const t = getNowTime();
        setLiveWakeTime(t);
        setWakeTime(t);

        const minutes = Math.floor(seconds / 60);
        const angle = (bedAngle + minutesToAngle(minutes)) % 360;

        setWakeAngle(angle);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [started, startTime]);

  const handleBedChange = text => {
    setBedTime(text);
    if (/^\d{2}:\d{2}$/.test(text)) setBedAngle(timeToAngle(text));
  };

  const handleWakeChange = text => {
    setWakeTime(text);
    if (/^\d{2}:\d{2}$/.test(text)) setWakeAngle(timeToAngle(text));
  };

  const handleManualSave = async () => {
    if (!bedTime || !wakeTime) return;

    const selectedDate = moment(date, 'ddd, MMMM Do').format('YYYY-MM-DD');

    const ref = database().ref(`users/${USER_ID}/sleepLogs/${selectedDate}`);

    const startAngle = timeToAngle(bedTime);
    const endAngle = timeToAngle(wakeTime);

    const duration = getDuration(startAngle, endAngle);
    const totalHours = duration.hours + duration.mins / 60;

    await ref.set({
      bedTime,
      wakeTime,
      duration: totalHours,
      type: 'manual',
      updatedAt: Date.now(),
    });
  };
  const handleSleepToggle = async () => {
    const now = new Date();

    // ✅ LOCAL DATE (fixes May 1 bug)
    const getLocalDateKey = () => {
      return (
        now.getFullYear() +
        '-' +
        String(now.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(now.getDate()).padStart(2, '0')
      );
    };

    // ───── START ─────
    if (!started) {
      const startKey = getLocalDateKey(); // ✅ FIXED

      setSleepDateKey(startKey);

      const ref = database().ref(`users/${USER_ID}/sleepLogs/${startKey}`);

      setStartTime(now);
      setStarted(true);

      const t = getNowTime();
      setBedTime(t);
      setBedAngle(timeToAngle(t));

      await ref.update({
        bedTime: t,
      });

      return;
    }

    // ───── STOP ─────
    const ref = database().ref(`users/${USER_ID}/sleepLogs/${sleepDateKey}`);

    setStarted(false);

    const wake = getNowTime();
    setWakeTime(wake);
    setWakeAngle(timeToAngle(wake));

    const duration = getDuration(bedAngle, wakeAngle);
    const totalHours = duration.hours + duration.mins / 60;

    await ref.update({
      bedTime,
      wakeTime: wake,
      duration: totalHours,
    });

    setStartTime(null);
    setLiveSeconds(0);
    setSleepDateKey(null);
  };

  const wakePan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: e => {
      const { locationX, locationY } = e.nativeEvent;
      let angle =
        Math.atan2(locationY - CENTER, locationX - CENTER) * (180 / Math.PI) +
        90;
      if (angle < 0) angle += 360;
      setWakeAngle(angle);
      setWakeTime(angleToTime(angle));
    },
  });

  const liveMinutes = Math.floor(liveSeconds / 60);

  const { hours, mins } = started
    ? {
        hours: Math.floor(liveMinutes / 60),
        mins: liveMinutes % 60,
      }
    : getDuration(bedAngle, wakeAngle);
  const bedPos = polarToCartesian(bedAngle);
  const wakePos = polarToCartesian(wakeAngle);
  const quality = getSleepQuality(hours);

  async function setGoal() {
    await database().ref(`users/${USER_ID}/goal`).update({
      selectedGoal: goalInput,
    });
  }

  const onChange = (event, selectedDate) => {
    setShow(false);

    console.log('event type:', event.type);

    if (selectedDate?.toString()) {
      setDate(moment(selectedDate.toString()).format('ddd, MMMM Do'));
    }
  };

  const getAverageSleep = logs => {
    if (!logs) return '0h 0m';

    const entries = Object.values(logs);
    const valid = entries.filter(l => l?.sleep != null);

    if (valid.length === 0) return '0h 0m';

    const total = valid.reduce((sum, l) => sum + Number(l.sleep), 0);

    const avg = total / valid.length;

    const hours = Math.floor(avg);
    const mins = Math.floor((avg - hours) * 60);

    return `${hours}h ${mins}m`;
  };

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <Header
        header="Sleep"
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />
      <Wrapper orbsRight safeAreaPops={{ edges: ['bottom'] }}>
        {/* Tabs */}
        <View style={styles.tabRow}>
          {tabs.map((t, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setTab(t?.key)}
              style={[styles.tab, tab == t?.key && styles.activeTab]}
            >
              <Text
                style={[styles.tabText, tab === t?.key && styles.activeText]}
              >
                {t?.label?.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* ── Time inputs ── */}
        <View
          style={{
            flexDirection: 'column',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            marginBottom: 28,
          }}
        >
          {tab != 'timer' ? (
            <TouchableOpacity
              onPress={() => setShow(true)}
              style={{
                ...styles.inputRow,
              }}
            >
              <View
                style={{
                  ...styles.inputWrap,
                  paddingBottom: 0,
                }}
              >
                <Text style={styles.inputLabel}>Date</Text>
                <Text style={styles.timeInput}>{date}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View />
          )}
          <View style={styles.inputRow}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Bedtime</Text>
              <TextInput
                style={styles.timeInput}
                value={bedTime}
                onChangeText={handleBedChange}
                placeholder="22:00"
                placeholderTextColor="rgba(255,255,255,0.25)"
                keyboardType="numbers-and-punctuation"
                editable={tab == 'timer' ? false : true}
              />
            </View>
            <View style={styles.inputDivider} />
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Wake up</Text>
              <TextInput
                style={styles.timeInput}
                value={wakeTime}
                onChangeText={handleWakeChange}
                placeholder="06:00"
                placeholderTextColor="rgba(255,255,255,0.25)"
                keyboardType="numbers-and-punctuation"
                editable={tab == 'timer' ? false : true}
              />
            </View>
          </View>
        </View>

        {/* ── Clock ring ── */}
        <View style={styles.clockWrap}>
          <Svg width={SIZE} height={SIZE}>
            <Defs>
              <LinearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#8FAF78" stopOpacity="1" />
                <Stop offset="1" stopColor="#4D6644" stopOpacity="1" />
              </LinearGradient>
            </Defs>

            {/* Track circle */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={STROKE}
              fill="none"
            />

            {/* Sleep arc */}
            <Path
              d={describeArc(bedAngle, wakeAngle)}
              stroke="url(#arcGrad)"
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
            />

            {/* Clock numbers */}
            {[
              { label: '12', x: CENTER, y: 22, anchor: 'middle' },
              { label: '3', x: SIZE - 18, y: CENTER + 6, anchor: 'end' },
              { label: '6', x: CENTER, y: SIZE - 8, anchor: 'middle' },
              { label: '9', x: 18, y: CENTER + 6, anchor: 'start' },
            ].map(n => (
              <SvgText
                key={n.label}
                x={n.x}
                y={n.y}
                fill="rgba(255,255,255,0.8)"
                fontSize={20}
                textAnchor={n.anchor}
                fontFamily={fontFamily.montserratSemiBold}
              >
                {n.label}
              </SvgText>
            ))}

            {(() => {
              const currentTime = started ? liveWakeTime : bedTime;
              const amActive = isAM(currentTime);

              const getClockPoint = (angle, offset = -30) => {
                const a = toRad(angle - 90);
                return {
                  x: CENTER + (RADIUS + offset) * Math.cos(a),
                  y: CENTER + (RADIUS + offset) * Math.sin(a),
                };
              };

              const am = getClockPoint(300);
              const pm = getClockPoint(120);

              return (
                <>
                  <SvgText
                    x={am.x}
                    y={am.y}
                    fill={amActive ? '#fff' : 'rgba(255,255,255,0.35)'}
                    fontSize={amActive ? '14' : '12'}
                    fontWeight={amActive ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    AM
                  </SvgText>

                  <SvgText
                    x={pm.x}
                    y={pm.y}
                    fill={!amActive ? '#fff' : 'rgba(255,255,255,0.35)'}
                    fontSize={!amActive ? '14' : '12'}
                    fontWeight={!amActive ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    PM
                  </SvgText>
                </>
              );
            })()}

            {/* Bed handle (fixed) */}
            <G x={bedPos.x} y={bedPos.y}>
              <Circle r={13} fill={colors.primary} />
              <Circle r={5} fill="rgba(255,255,255,0.9)" />
            </G>

            {/* Wake handle (draggable) */}
            {tab == 'timer' ? (
              <G x={wakePos.x} y={wakePos.y}>
                <Circle r={13} fill={colors.secondary} />
                <Circle r={5} fill="rgba(255,255,255,0.9)" />
              </G>
            ) : (
              <G x={wakePos.x} y={wakePos.y} {...wakePan.panHandlers}>
                <Circle r={13} fill={colors.secondary} />
                <Circle r={5} fill="rgba(255,255,255,0.9)" />
              </G>
            )}
          </Svg>

          {/* Center overlay */}
          <View style={styles.clockCenter} pointerEvents="none">
            <Text style={styles.durationText}>
              {hours}h {mins}m
            </Text>
            <Text style={styles.durationSub}>Sleep duration</Text>
            <View
              style={[
                styles.qualityPill,
                {
                  borderColor: quality.color,
                  backgroundColor: quality.color + '1A',
                },
              ]}
            >
              <Text style={[styles.qualityText, { color: quality.color }]}>
                {quality.label}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Start / Stop button ── */}
        {tab == 'timer' ? (
          <TouchableOpacity
            style={[styles.startBtn, started && styles.startBtnActive]}
            onPress={handleSleepToggle}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>
              {started ? 'Stop Sleeptime' : 'Start Sleeptime'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        {/* ── Info strip ── */}
        <View style={styles.infoStrip}>
          {[
            {
              label: 'Avg Sleep',
              value: getAverageSleep(sleepData?.logs),
            },
            { label: 'Goal', value: sleepData?.goal?.selectedGoal + ' Hrs' },
          ].map((item, i) => (
            <View
              key={i}
              style={[styles.infoItem, i < 2 && styles.infoItemBorder]}
            >
              <Text style={styles.infoValue}>{item.value}</Text>
              <Text style={styles.infoLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Monthly goal input ── */}
        {!sleepData?.goal?.selectedGoal ? (
          <View style={styles.goalCard}>
            <Text style={styles.goalCardLabel}>Monthly Goal</Text>
            <TextInput
              style={styles.goalInput}
              value={goalInput}
              onChangeText={setGoalInput}
              placeholder="e.g. Sleep 8h every night"
              placeholderTextColor="rgba(255,255,255,0.25)"
            />
          </View>
        ) : (
          <View />
        )}

        {/* ── Set Goal button ── */}
        {(tab == 'manually' || !sleepData?.goal?.selectedGoal) && (
          <TouchableOpacity
            style={styles.setGoalBtn}
            activeOpacity={0.85}
            onPress={tab == 'timer' ? setGoal : handleManualSave}
          >
            <GradientBg
              id="sleepGoalBtn"
              c1="#6A9455"
              c2="#3A5A2A"
              r={16}
              horizontal
            />
            <Text style={styles.setGoalText}>
              {sleepData?.goal?.selectedGoal ? 'Upload Sleep Data' : 'Set Goal'}
            </Text>
          </TouchableOpacity>
        )}
        {show && (
          <DateTimePicker
            onValueChange={onChange}
            value={new Date()}
            minimumDate={new Date()?.setDate(new Date()?.getDate() - 1)}
            maximumDate={new Date()}
            mode={'date'}
            display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
          />
        )}
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  scroll: {
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  headerRight: { width: 44 },

  /* ── Time inputs ── */
  inputRow: {
    flexDirection: 'row',

    overflow: 'hidden',
  },
  inputWrap: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  timeInput: {
    color: colors.white,
    fontSize: 26,
    fontFamily: fontFamily.montserratBold,
    textAlign: 'center',
    letterSpacing: 1,
  },
  inputDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 12,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.glass,
    borderRadius: 50,
    padding: 5,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    padding: 10,
    borderRadius: 50,
    // backgroundColor: colors.primary,
  },
  activeTab: { backgroundColor: colors.secondary },

  tabText: {
    textAlign: 'center',
    color: colors.secondary,
    fontFamily: fontFamily.montserratBold,
  },
  activeText: { color: '#fff' },
  /* ── Clock ── */
  clockWrap: {
    alignSelf: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  clockCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationText: {
    color: colors.white,
    fontSize: 36,
    fontFamily: fontFamily.montserratBold,
    letterSpacing: -0.5,
  },
  durationSub: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 4,
    marginBottom: 10,
  },
  qualityPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  qualityText: {
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },

  /* ── Start button ── */
  startBtn: {
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 13,
    borderRadius: 49,
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.35)',
    backgroundColor: 'rgba(143,175,120,0.08)',
    marginBottom: 24,
  },
  startBtnActive: {
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderColor: 'rgba(255,107,107,0.35)',
  },
  startBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },

  /* ── Info strip ── */
  infoStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoItemBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
  },
  infoValue: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 4,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },

  /* ── Goal card ── */
  goalCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 16,
  },
  goalCardLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  goalInput: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratRegular,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 8,
  },

  /* ── Set Goal button ── */
  setGoalBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    overflow: 'hidden',
  },
  setGoalText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },
});
