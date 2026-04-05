import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import Svg, { Circle, G, Text as SvgText, Path } from 'react-native-svg';
import { fontFamily } from '../../../constant';
import { Button, Header, Wrapper } from '../../../components';
import InputBox from '../../../components/common/InputBox';

const SIZE = 280;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;

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

// 🔁 TIME <-> ANGLE
const timeToAngle = time => {
  const [h, m] = time.split(':').map(Number);
  const hour12 = h % 12;
  const total = hour12 * 60 + m;
  return (total / (12 * 60)) * 360;
};

const angleToTime = angle => {
  const total = (angle / 360) * 12 * 60;

  let h = Math.floor(total / 60);
  let m = Math.floor(total % 60);

  if (h === 0) h = 12;

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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

export default function SleepClock() {
  // ✅ Inputs
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [sleepTime, setSleepTime] = useState(true);

  // ✅ Angles
  const [bedAngle, setBedAngle] = useState(timeToAngle('22:00'));
  const [wakeAngle, setWakeAngle] = useState(timeToAngle('06:00'));

  // 🔁 Sync TEXT → ANGLE
  const handleBedChange = text => {
    setBedTime(text);
    if (/^\d{2}:\d{2}$/.test(text)) {
      setBedAngle(timeToAngle(text));
    }
  };

  const handleWakeChange = text => {
    setWakeTime(text);
    if (/^\d{2}:\d{2}$/.test(text)) {
      setWakeAngle(timeToAngle(text));
    }
  };

  // 🔁 Sync DRAG → TEXT (only wake)
  const wakePan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: e => {
      const { locationX, locationY } = e.nativeEvent;

      const dx = locationX - CENTER;
      const dy = locationY - CENTER;

      let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;

      setWakeAngle(angle);
      setWakeTime(angleToTime(angle)); // 🔥 sync back to input
    },
  });

  const { hours, mins } = getDuration(bedAngle, wakeAngle);

  const bedPos = polarToCartesian(bedAngle);
  const wakePos = polarToCartesian(wakeAngle);

  return (
    <Wrapper>
      <Header header="Sleep" />

      {/* 🔥 INPUTS */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 10,
            marginTop: 10,
          }}
        >
          <InputBox
            value={bedTime}
            onChangeText={handleBedChange}
            mainContainer={styles.input}
            placeholder="Bed HH:mm"
            placeholderTextColor="#888"
          />
          <InputBox
            value={wakeTime}
            onChangeText={handleWakeChange}
            mainContainer={styles.input}
            placeholder="Wake HH:mm"
            placeholderTextColor="#888"
          />
        </View>

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
              d={describeArc(bedAngle, wakeAngle)}
              stroke="#7B83FF"
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
            />

            {/* labels */}
            <SvgText
              x={CENTER}
              y={24}
              fill="white"
              fontSize={18}
              textAnchor="middle"
              fontFamily={fontFamily?.montserratSemiBold}
            >
              12
            </SvgText>
            <SvgText
              x={SIZE - 20}
              y={CENTER}
              fill="white"
              fontSize={18}
              fontFamily={fontFamily?.montserratSemiBold}
            >
              3
            </SvgText>
            <SvgText
              x={CENTER}
              y={SIZE - 10}
              fill="white"
              fontSize={18}
              textAnchor="middle"
              fontFamily={fontFamily?.montserratSemiBold}
            >
              6
            </SvgText>
            <SvgText
              x={14}
              y={CENTER}
              fill="white"
              fontSize={18}
              fontFamily={fontFamily?.montserratSemiBold}
            >
              9
            </SvgText>

            {/* FIXED BED */}
            <G x={bedPos.x} y={bedPos.y}>
              <Circle r={10} fill="#fff" />
            </G>

            {/* DRAGGABLE WAKE */}
            <G x={wakePos.x} y={wakePos.y} {...wakePan.panHandlers}>
              <Circle r={10} fill="#fff" />
            </G>
          </Svg>

          {/* center */}
          <View style={styles.center}>
            <Text style={styles.duration}>
              {hours}h {mins}m
            </Text>
            <Text style={styles.subtitle}>Sleep duration</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setSleepTime(!sleepTime)}
          style={styles.timerBtn}
        >
          <Text style={styles.timerText}>
            {sleepTime ? 'Start' : 'Stop'} Sleeptime
          </Text>
        </TouchableOpacity>

        <View style={{ marginTop: 20 }}>
          <InputBox placeHolder="Your Monthly Goal" />
        </View>
      </View>
      <Button title="Set Goal" buttonStyle={{ marginBottom: 30 }} />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
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
