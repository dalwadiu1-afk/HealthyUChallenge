import React, { useState } from 'react';
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
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [started, setStarted] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const [bedAngle, setBedAngle] = useState(timeToAngle('22:00'));
  const [wakeAngle, setWakeAngle] = useState(timeToAngle('06:00'));

  const handleBedChange = text => {
    setBedTime(text);
    if (/^\d{2}:\d{2}$/.test(text)) setBedAngle(timeToAngle(text));
  };

  const handleWakeChange = text => {
    setWakeTime(text);
    if (/^\d{2}:\d{2}$/.test(text)) setWakeAngle(timeToAngle(text));
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

  const { hours, mins } = getDuration(bedAngle, wakeAngle);
  const bedPos = polarToCartesian(bedAngle);
  const wakePos = polarToCartesian(wakeAngle);
  const quality = getSleepQuality(hours);

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.8}
          >
            <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
              <Path
                d="M8 1L1 8L8 15"
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sleep</Text>
          <View style={styles.headerRight} />
        </View>

        {/* ── Time inputs ── */}
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
            />
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
                fill="rgba(255,255,255,0.35)"
                fontSize={13}
                textAnchor={n.anchor}
                fontFamily={fontFamily.montserratSemiBold}
              >
                {n.label}
              </SvgText>
            ))}

            {/* Bed handle (fixed) */}
            <G x={bedPos.x} y={bedPos.y}>
              <Circle r={13} fill={colors.primary} />
              <Circle r={5} fill="rgba(255,255,255,0.9)" />
            </G>

            {/* Wake handle (draggable) */}
            <G x={wakePos.x} y={wakePos.y} {...wakePan.panHandlers}>
              <Circle r={13} fill={colors.secondary} />
              <Circle r={5} fill="rgba(255,255,255,0.9)" />
            </G>
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
        <TouchableOpacity
          style={[styles.startBtn, started && styles.startBtnActive]}
          onPress={() => setStarted(p => !p)}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>
            {started ? 'Stop Sleeptime' : 'Start Sleeptime'}
          </Text>
        </TouchableOpacity>

        {/* ── Info strip ── */}
        <View style={styles.infoStrip}>
          {[
            { label: 'Bedtime', value: bedTime },
            { label: 'Wake up', value: wakeTime },
            { label: 'Goal', value: '8h 0m' },
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

        {/* ── Set Goal button ── */}
        <TouchableOpacity style={styles.setGoalBtn} activeOpacity={0.85}>
          <GradientBg
            id="sleepGoalBtn"
            c1="#6A9455"
            c2="#3A5A2A"
            r={16}
            horizontal
          />
          <Text style={styles.setGoalText}>Set Goal</Text>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 28,
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
