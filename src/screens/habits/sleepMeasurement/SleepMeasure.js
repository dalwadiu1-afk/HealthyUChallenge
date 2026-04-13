import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import Svg, { Circle, G, Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { fontFamily } from '../../../constant';
import { Button, Header, Wrapper } from '../../../components';
import InputBox from '../../../components/common/InputBox';

const SIZE = 280;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;

const SLEEP_START_KEY = 'SLEEP_START_TIME';
const SLEEP_HISTORY_KEY = 'SLEEP_HISTORY';

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

  return `
    M ${start.x} ${start.y}
    A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
  `;
};

const timeToMinutes = time => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToAngle = min => {
  return (min / (24 * 60)) * 360;
};

const getNowTime = () => {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
};

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

  // 🔥 LIVE WAKE TIME
  const [liveWakeTime, setLiveWakeTime] = useState(getNowTime());

  // ================= INIT =================
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

  // ================= LIVE TIMER =================
  useEffect(() => {
    let interval;

    if (!sleepTime && startTime) {
      interval = setInterval(() => {
        const now = new Date();

        setLiveSeconds(Math.floor((now - startTime) / 1000));

        // 🔥 LIVE WAKE TIME UPDATE (24h format)
        const t = now.toTimeString().slice(0, 5);
        setLiveWakeTime(t);
        setWakeTime(t);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [sleepTime, startTime]);

  // ================= START / STOP =================
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

    history.push({
      totalMinutes,
      date: end,
    });

    await AsyncStorage.setItem(SLEEP_HISTORY_KEY, JSON.stringify(history));
    await AsyncStorage.removeItem(SLEEP_START_KEY);

    setSleepTime(true);
    setStartTime(null);
    setLiveSeconds(0);
  };

  // ================= PROGRESS =================
  const liveMinutes = Math.floor(liveSeconds / 60);

  const progressAngle = sleepTime
    ? wakeAngle
    : (bedAngle + minutesToAngle(liveMinutes)) % 360;

  const bedPos = polarToCartesian(bedAngle);
  const wakePos = polarToCartesian(progressAngle);

  return (
    <Wrapper>
      <Header header="Sleep" />

      {/* INPUTS */}
      <View style={styles.row}>
        <InputBox
          value={bedTime}
          onChangeText={text => {
            setBedTime(text);
            if (/^\d{2}:\d{2}$/.test(text)) {
              setBedAngle(minutesToAngle(timeToMinutes(text)));
            }
          }}
          mainContainer={styles.input}
          placeholder="Bed HH:mm"
          editable={false}
        />

        <InputBox
          value={sleepTime ? wakeTime : liveWakeTime}
          mainContainer={styles.input}
          placeholder="Wake HH:mm"
          editable={false}
        />
      </View>

      {/* CLOCK */}
      <View style={{ alignSelf: 'center', marginTop: 20 }}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="#3D4166"
            strokeWidth={STROKE}
            fill="none"
          />

          <Path
            d={describeArc(bedAngle, progressAngle)}
            stroke="#7B83FF"
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
          />

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
              ? bedTime
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

      <Button title="Set Goal" buttonStyle={{ marginBottom: 30 }} />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#555',
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
