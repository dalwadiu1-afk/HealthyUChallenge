import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';

import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors, fontFamily } from '../../../constant';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Button, Header, Wrapper } from '../../../components';
import InputBox from '../../../components/common/InputBox';
import { AuthBtn } from '../../../components/common/authBtn';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const { height, width } = Dimensions.get('window');

const SIZE = height * 0.35;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;

const SLEEP_START_KEY = 'SLEEP_START_TIME';
const SLEEP_HISTORY_KEY = 'SLEEP_HISTORY';

const toRad = deg => (deg * Math.PI) / 180;

/* ================= HELPERS ================= */
const polarToCartesian = angle => {
  const a = toRad(angle - 90);
  return {
    x: CENTER + RADIUS * Math.cos(a),
    y: CENTER + RADIUS * Math.sin(a),
  };
};

const getClockPoint = (angle, offset = 0) => {
  const a = toRad(angle - 90);
  return {
    x: CENTER + (RADIUS + offset) * Math.cos(a),
    y: CENTER + (RADIUS + offset) * Math.sin(a),
  };
};

const describeArc = (startAngle, endAngle) => {
  let sweep = endAngle - startAngle;
  if (sweep < 0) sweep += 360;

  const largeArcFlag = sweep > 180 ? 1 : 0;

  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(startAngle + sweep);

  return `M ${start.x} ${start.y}
          A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
};

const timeToMinutes = time => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/* 🔥 12H CLOCK */
const minutesToAngle = min => {
  const minutes12h = min % (12 * 60);
  return (minutes12h / (12 * 60)) * 360;
};

const getNowTime = () => {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
};

/* 🔥 AM / PM DETECTOR */
const isAM = time => {
  const [h] = time.split(':').map(Number);
  return h < 12;
};

function FloatingOrb({ size, color, style, delay = 0 }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 1200 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-18, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
          withTiming(18, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          position: 'absolute',
        },
        style,
        animStyle,
      ]}
    />
  );
}

export default function SleepClock() {
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');

  const [sleepTime, setSleepTime] = useState(true);

  const [bedAngle, setBedAngle] = useState(
    minutesToAngle(timeToMinutes('22:00')),
  );
  const [wakeAngle, setWakeAngle] = useState(
    minutesToAngle(timeToMinutes('06:00')),
  );

  const [startTime, setStartTime] = useState(null);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [avgSleep, setAvgSleep] = useState({ h: 0, m: 0 });

  const [liveWakeTime, setLiveWakeTime] = useState(getNowTime());

  /* ================= INIT ================= */
  useEffect(() => {
    const init = async () => {
      const saved = await AsyncStorage.getItem(SLEEP_START_KEY);

      if (saved) {
        const start = new Date(saved);
        setStartTime(start);
        setSleepTime(false);

        const t = start.toTimeString().slice(0, 5);
        setBedTime(t);
        setBedAngle(minutesToAngle(timeToMinutes(t)));
      }
    };

    init();
    loadAvg();
  }, []);

  const loadAvg = async () => {
    const data = await AsyncStorage.getItem(SLEEP_HISTORY_KEY);
    if (!data) return;

    const history = JSON.parse(data);
    const total = history.reduce((s, x) => s + x.totalMinutes, 0);
    const avg = Math.floor(total / history.length);

    setAvgSleep({
      h: Math.floor(avg / 60),
      m: avg % 60,
    });
  };

  /* ================= LIVE TIMER ================= */
  useEffect(() => {
    let interval;

    if (!sleepTime && startTime) {
      interval = setInterval(() => {
        const now = new Date();

        setLiveSeconds(Math.floor((now - startTime) / 1000));

        const t = now.toTimeString().slice(0, 5);
        setLiveWakeTime(t);
        setWakeTime(t);
      }, 1000);
    }
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    return () => clearInterval(interval);
  }, [sleepTime, startTime]);

  /* ================= START / STOP ================= */
  const handleSleepToggle = async () => {
    const now = new Date();

    if (sleepTime) {
      await AsyncStorage.setItem(SLEEP_START_KEY, now.toISOString());

      setStartTime(now);
      setSleepTime(false);

      const t = getNowTime();
      setBedTime(t);

      const m = timeToMinutes(t);
      setBedAngle(minutesToAngle(m));
      return;
    }

    const saved = await AsyncStorage.getItem(SLEEP_START_KEY);
    if (!saved) return;

    const start = new Date(saved);
    const end = now;

    const totalMinutes = Math.floor((end - start) / 60000);

    const t = getNowTime();
    setWakeTime(t);
    setLiveWakeTime(t);

    const m = timeToMinutes(t);
    setWakeAngle(minutesToAngle(m));

    const historyRaw = await AsyncStorage.getItem(SLEEP_HISTORY_KEY);
    let history = historyRaw ? JSON.parse(historyRaw) : [];

    history.push({ totalMinutes, date: end });

    await AsyncStorage.setItem(SLEEP_HISTORY_KEY, JSON.stringify(history));
    await AsyncStorage.removeItem(SLEEP_START_KEY);

    setSleepTime(true);
    setStartTime(null);
    setLiveSeconds(0);
  };

  /* ================= PROGRESS ================= */
  const liveMinutes = Math.floor(liveSeconds / 60);
  // Entrance animations
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-20);

  const progressAngle = sleepTime
    ? wakeAngle
    : (bedAngle + minutesToAngle(liveMinutes)) % 360;

  const bedPos = polarToCartesian(bedAngle);
  const wakePos = polarToCartesian(progressAngle);

  /* 🔥 CURRENT TIME FOR AM/PM */
  const currentTime = sleepTime ? bedTime : liveWakeTime;
  const amActive = isAM(currentTime);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Background orbs */}
      <FloatingOrb
        size={width * 0.62}
        color="rgba(77, 102, 68, 0.24)"
        style={{ top: -width * 0.16, right: -width * 0.2 }}
        delay={0}
      />
      <FloatingOrb
        size={width * 0.42}
        color="rgba(45, 70, 38, 0.18)"
        style={{ bottom: height * 0.22, left: -width * 0.16 }}
        delay={800}
      />
      <FloatingOrb
        size={width * 0.2}
        color="rgba(143, 175, 120, 0.15)"
        style={{ top: height * 0.38, right: width * 0.06 }}
        delay={500}
      />

      <SafeAreaProvider style={styles.inner}>
        <View style={{ flex: 1 }}>
          <Header header="Sleep" />

          {/* INPUTS */}
          <View style={styles.row}>
            <InputBox
              value={bedTime}
              inputContainerStyle={styles.input}
              editable={false}
            />
            <InputBox
              value={sleepTime ? wakeTime : liveWakeTime}
              inputContainerStyle={styles.input}
              editable={false}
            />
          </View>

          {/* CLOCK */}
          <View style={{ alignSelf: 'center', marginTop: 20 }}>
            <Svg width={SIZE} height={SIZE}>
              {/* Background */}
              <Circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                stroke="rgba(143, 175, 120, 0.5)"
                strokeWidth={STROKE}
                fill="none"
              />

              {/* TICKS */}
              {[0, 90, 180, 270].map(angle => {
                const start = getClockPoint(angle, -10);
                const end = getClockPoint(angle, 10);
                return (
                  <Path
                    key={angle}
                    d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                    stroke="#AAB3FF"
                    strokeWidth={3}
                  />
                );
              })}

              {/* NUMBERS */}
              {[0, 90, 180, 270].map((angle, i) => {
                const labels = ['12', '3', '6', '9'];
                const pos = getClockPoint(angle, -30);

                return (
                  <SvgText
                    key={i}
                    x={pos.x}
                    y={pos.y}
                    fill="#fff"
                    fontSize="14"
                    textAnchor="middle"
                    dy="4"
                  >
                    {labels[i]}
                  </SvgText>
                );
              })}

              {/* AM / PM */}
              {(() => {
                const am = getClockPoint(300, -35);
                const pm = getClockPoint(120, -35);

                return (
                  <>
                    <SvgText
                      x={am.x}
                      y={am.y}
                      fill={amActive ? '#fff' : '#8FA3B0'}
                      fontSize={amActive ? '14' : '12'}
                      fontWeight={amActive ? 'bold' : 'normal'}
                      textAnchor="middle"
                      dy="4"
                    >
                      AM
                    </SvgText>

                    <SvgText
                      x={pm.x}
                      y={pm.y}
                      fill={!amActive ? '#fff' : '#8FA3B0'}
                      fontSize={!amActive ? '14' : '12'}
                      fontWeight={!amActive ? 'bold' : 'normal'}
                      textAnchor="middle"
                      dy="4"
                    >
                      PM
                    </SvgText>
                  </>
                );
              })()}

              {/* ARC */}
              <Path
                d={describeArc(bedAngle, progressAngle)}
                stroke="#7B83FF"
                strokeWidth={STROKE}
                fill="none"
                strokeLinecap="round"
              />

              {/* DOTS */}
              <G x={bedPos.x} y={bedPos.y}>
                <Circle r={10} fill="#fff" />
              </G>

              <G x={wakePos.x} y={wakePos.y}>
                <Circle r={10} fill="#fff" />
              </G>
            </Svg>

            <View style={styles.center}>
              <Text style={styles.duration}>
                {sleepTime
                  ? `${avgSleep.h}h ${avgSleep.m}m`
                  : `${Math.floor(liveMinutes / 60)}h ${liveMinutes % 60}m`}
              </Text>

              <Text style={styles.subtitle}>Sleep duration</Text>

              <Text style={[styles.subtitle, { marginTop: 6 }]}>
                Avg: {avgSleep.h}h {avgSleep.m}m
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleSleepToggle} style={styles.timerBtn}>
            <Text style={styles.timerText}>
              {sleepTime ? 'Start' : 'Stop'} Sleeptime
            </Text>
          </TouchableOpacity>

          <View style={{ marginTop: 20, flex: 1 }}>
            <InputBox placeholder="Your Monthly Goal" />
          </View>

          <AuthBtn title="Set Goal" />
        </View>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 26,
    marginTop: StatusBar.currentHeight,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  input: {
    color: '#fff',
    borderRadius: 8,
    textAlign: 'center',
    flex: 1,
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    alignSelf: 'center',
    top: '40%',
  },
  duration: {
    color: '#fff',
    fontSize: 34,
    fontFamily: fontFamily?.montserratSemiBold,
  },
  subtitle: {
    color: '#8FA3B0',
    marginTop: 4,
    fontFamily: fontFamily?.montserratSemiBold,
  },
  timerBtn: {
    paddingHorizontal: 16,
    padding: 8,
    marginTop: 30,
    alignSelf: 'center',
    borderRadius: 100,
    backgroundColor: '#DBD9EC',
  },
  timerText: {
    fontFamily: fontFamily?.montserratMedium,
    fontSize: 15,
  },
});
