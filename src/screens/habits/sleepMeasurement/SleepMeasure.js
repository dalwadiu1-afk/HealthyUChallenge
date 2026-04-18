// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   Dimensions,
// } from 'react-native';

// import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// import { colors, fontFamily } from '../../../constant';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withRepeat,
//   withSequence,
//   withDelay,
//   withSpring,
//   Easing,
// } from 'react-native-reanimated';
// import { Button, Header, Wrapper } from '../../../components';
// import InputBox from '../../../components/common/InputBox';
// import { AuthBtn } from '../../../components/common/authBtn';
// import { SafeAreaProvider } from 'react-native-safe-area-context';

// const { height, width } = Dimensions.get('window');

// const SIZE = height * 0.35;
// const STROKE = 22;
// const RADIUS = (SIZE - STROKE) / 2;
// const CENTER = SIZE / 2;

// const SLEEP_START_KEY = 'SLEEP_START_TIME';
// const SLEEP_HISTORY_KEY = 'SLEEP_HISTORY';

// const toRad = deg => (deg * Math.PI) / 180;

// /* ================= HELPERS ================= */
// const polarToCartesian = angle => {
//   const a = toRad(angle - 90);
//   return {
//     x: CENTER + RADIUS * Math.cos(a),
//     y: CENTER + RADIUS * Math.sin(a),
//   };
// };

// const getClockPoint = (angle, offset = 0) => {
//   const a = toRad(angle - 90);
//   return {
//     x: CENTER + (RADIUS + offset) * Math.cos(a),
//     y: CENTER + (RADIUS + offset) * Math.sin(a),
//   };
// };

// const describeArc = (startAngle, endAngle) => {
//   let sweep = endAngle - startAngle;
//   if (sweep < 0) sweep += 360;

//   const largeArcFlag = sweep > 180 ? 1 : 0;

//   const start = polarToCartesian(startAngle);
//   const end = polarToCartesian(startAngle + sweep);

//   return `M ${start.x} ${start.y}
//           A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
// };

// const timeToMinutes = time => {
//   const [h, m] = time.split(':').map(Number);
//   return h * 60 + m;
// };

// /* 🔥 12H CLOCK */
// const minutesToAngle = min => {
//   const minutes12h = min % (12 * 60);
//   return (minutes12h / (12 * 60)) * 360;
// };

// const getNowTime = () => {
//   const d = new Date();
//   return d.toTimeString().slice(0, 5);
// };

// /* 🔥 AM / PM DETECTOR */
// const isAM = time => {
//   const [h] = time.split(':').map(Number);
//   return h < 12;
// };

// function FloatingOrb({ size, color, style, delay = 0 }) {
//   const translateY = useSharedValue(0);
//   const opacity = useSharedValue(0);

//   useEffect(() => {
//     opacity.value = withDelay(delay, withTiming(1, { duration: 1200 }));
//     translateY.value = withDelay(
//       delay,
//       withRepeat(
//         withSequence(
//           withTiming(-18, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
//           withTiming(18, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
//         ),
//         -1,
//         false,
//       ),
//     );
//   }, []);

//   const animStyle = useAnimatedStyle(() => ({
//     opacity: opacity.value,
//     transform: [{ translateY: translateY.value }],
//   }));

//   return (
//     <Animated.View
//       style={[
//         {
//           width: size,
//           height: size,
//           borderRadius: size / 2,
//           backgroundColor: color,
//           position: 'absolute',
//         },
//         style,
//         animStyle,
//       ]}
//     />
//   );
// }

// export default function SleepClock() {
//   const [bedTime, setBedTime] = useState('22:00');
//   const [wakeTime, setWakeTime] = useState('06:00');

//   const [sleepTime, setSleepTime] = useState(true);

//   const [bedAngle, setBedAngle] = useState(
//     minutesToAngle(timeToMinutes('22:00')),
//   );
//   const [wakeAngle, setWakeAngle] = useState(
//     minutesToAngle(timeToMinutes('06:00')),
//   );

//   const [startTime, setStartTime] = useState(null);
//   const [liveSeconds, setLiveSeconds] = useState(0);
//   const [avgSleep, setAvgSleep] = useState({ h: 0, m: 0 });

//   const [liveWakeTime, setLiveWakeTime] = useState(getNowTime());

//   /* ================= INIT ================= */
//   useEffect(() => {
//     const init = async () => {
//       const saved = await AsyncStorage.getItem(SLEEP_START_KEY);

//       if (saved) {
//         const start = new Date(saved);
//         setStartTime(start);
//         setSleepTime(false);

//         const t = start.toTimeString().slice(0, 5);
//         setBedTime(t);
//         setBedAngle(minutesToAngle(timeToMinutes(t)));
//       }
//     };

//     init();
//     loadAvg();
//   }, []);

//   const loadAvg = async () => {
//     const data = await AsyncStorage.getItem(SLEEP_HISTORY_KEY);
//     if (!data) return;

//     const history = JSON.parse(data);
//     const total = history.reduce((s, x) => s + x.totalMinutes, 0);
//     const avg = Math.floor(total / history.length);

//     setAvgSleep({
//       h: Math.floor(avg / 60),
//       m: avg % 60,
//     });
//   };

//   /* ================= LIVE TIMER ================= */
//   useEffect(() => {
//     let interval;

//     if (!sleepTime && startTime) {
//       interval = setInterval(() => {
//         const now = new Date();

//         setLiveSeconds(Math.floor((now - startTime) / 1000));

//         const t = now.toTimeString().slice(0, 5);
//         setLiveWakeTime(t);
//         setWakeTime(t);
//       }, 1000);
//     }
//     headerOpacity.value = withTiming(1, { duration: 500 });
//     headerY.value = withTiming(0, {
//       duration: 500,
//       easing: Easing.out(Easing.cubic),
//     });

//     return () => clearInterval(interval);
//   }, [sleepTime, startTime]);

//   /* ================= START / STOP ================= */
//   const handleSleepToggle = async () => {
//     const now = new Date();

//     if (sleepTime) {
//       await AsyncStorage.setItem(SLEEP_START_KEY, now.toISOString());

//       setStartTime(now);
//       setSleepTime(false);

//       const t = getNowTime();
//       setBedTime(t);

//       const m = timeToMinutes(t);
//       setBedAngle(minutesToAngle(m));
//       return;
//     }

//     const saved = await AsyncStorage.getItem(SLEEP_START_KEY);
//     if (!saved) return;

//     const start = new Date(saved);
//     const end = now;

//     const totalMinutes = Math.floor((end - start) / 60000);

//     const t = getNowTime();
//     setWakeTime(t);
//     setLiveWakeTime(t);

//     const m = timeToMinutes(t);
//     setWakeAngle(minutesToAngle(m));

//     const historyRaw = await AsyncStorage.getItem(SLEEP_HISTORY_KEY);
//     let history = historyRaw ? JSON.parse(historyRaw) : [];

//     history.push({ totalMinutes, date: end });

//     await AsyncStorage.setItem(SLEEP_HISTORY_KEY, JSON.stringify(history));
//     await AsyncStorage.removeItem(SLEEP_START_KEY);

//     setSleepTime(true);
//     setStartTime(null);
//     setLiveSeconds(0);
//   };

//   /* ================= PROGRESS ================= */
//   const liveMinutes = Math.floor(liveSeconds / 60);
//   // Entrance animations
//   const headerOpacity = useSharedValue(0);
//   const headerY = useSharedValue(-20);

//   const progressAngle = sleepTime
//     ? wakeAngle
//     : (bedAngle + minutesToAngle(liveMinutes)) % 360;

//   const bedPos = polarToCartesian(bedAngle);
//   const wakePos = polarToCartesian(progressAngle);

//   /* 🔥 CURRENT TIME FOR AM/PM */
//   const currentTime = sleepTime ? bedTime : liveWakeTime;
//   const amActive = isAM(currentTime);

//   return (
//     <View style={styles.container}>
//       <StatusBar
//         translucent
//         backgroundColor="transparent"
//         barStyle="light-content"
//       />

//       {/* Background orbs */}
//       <FloatingOrb
//         size={width * 0.62}
//         color="rgba(77, 102, 68, 0.24)"
//         style={{ top: -width * 0.16, right: -width * 0.2 }}
//         delay={0}
//       />
//       <FloatingOrb
//         size={width * 0.42}
//         color="rgba(45, 70, 38, 0.18)"
//         style={{ bottom: height * 0.22, left: -width * 0.16 }}
//         delay={800}
//       />
//       <FloatingOrb
//         size={width * 0.2}
//         color="rgba(143, 175, 120, 0.15)"
//         style={{ top: height * 0.38, right: width * 0.06 }}
//         delay={500}
//       />

//       <SafeAreaProvider style={styles.inner}>
//         <View style={{ flex: 1 }}>
//           <Header header="Sleep" />

//           {/* INPUTS */}
//           <View style={styles.row}>
//             <InputBox
//               value={bedTime}
//               inputContainerStyle={styles.input}
//               editable={false}
//             />
//             <InputBox
//               value={sleepTime ? wakeTime : liveWakeTime}
//               inputContainerStyle={styles.input}
//               editable={false}
//             />
//           </View>

//           {/* CLOCK */}
//           <View style={{ alignSelf: 'center', marginTop: 20 }}>
//             <Svg width={SIZE} height={SIZE}>
//               {/* Background */}
//               <Circle
//                 cx={CENTER}
//                 cy={CENTER}
//                 r={RADIUS}
//                 stroke="rgba(143, 175, 120, 0.5)"
//                 strokeWidth={STROKE}
//                 fill="none"
//               />

//               {/* TICKS */}
//               {[0, 90, 180, 270].map(angle => {
//                 const start = getClockPoint(angle, -10);
//                 const end = getClockPoint(angle, 10);
//                 return (
//                   <Path
//                     key={angle}
//                     d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
//                     stroke="#AAB3FF"
//                     strokeWidth={3}
//                   />
//                 );
//               })}

//               {/* NUMBERS */}
//               {[0, 90, 180, 270].map((angle, i) => {
//                 const labels = ['12', '3', '6', '9'];
//                 const pos = getClockPoint(angle, -30);

//                 return (
//                   <SvgText
//                     key={i}
//                     x={pos.x}
//                     y={pos.y}
//                     fill="#fff"
//                     fontSize="14"
//                     textAnchor="middle"
//                     dy="4"
//                   >
//                     {labels[i]}
//                   </SvgText>
//                 );
//               })}

//               {/* AM / PM */}
//               {(() => {
//                 const am = getClockPoint(300, -35);
//                 const pm = getClockPoint(120, -35);

//                 return (
//                   <>
//                     <SvgText
//                       x={am.x}
//                       y={am.y}
//                       fill={amActive ? '#fff' : '#8FA3B0'}
//                       fontSize={amActive ? '14' : '12'}
//                       fontWeight={amActive ? 'bold' : 'normal'}
//                       textAnchor="middle"
//                       dy="4"
//                     >
//                       AM
//                     </SvgText>

//                     <SvgText
//                       x={pm.x}
//                       y={pm.y}
//                       fill={!amActive ? '#fff' : '#8FA3B0'}
//                       fontSize={!amActive ? '14' : '12'}
//                       fontWeight={!amActive ? 'bold' : 'normal'}
//                       textAnchor="middle"
//                       dy="4"
//                     >
//                       PM
//                     </SvgText>
//                   </>
//                 );
//               })()}

//               {/* ARC */}
//               <Path
//                 d={describeArc(bedAngle, progressAngle)}
//                 stroke="#7B83FF"
//                 strokeWidth={STROKE}
//                 fill="none"
//                 strokeLinecap="round"
//               />

//               {/* DOTS */}
//               <G x={bedPos.x} y={bedPos.y}>
//                 <Circle r={10} fill="#fff" />
//               </G>

//               <G x={wakePos.x} y={wakePos.y}>
//                 <Circle r={10} fill="#fff" />
//               </G>
//             </Svg>

//             <View style={styles.center}>
//               <Text style={styles.duration}>
//                 {sleepTime
//                   ? `${avgSleep.h}h ${avgSleep.m}m`
//                   : `${Math.floor(liveMinutes / 60)}h ${liveMinutes % 60}m`}
//               </Text>

//               <Text style={styles.subtitle}>Sleep duration</Text>

//               <Text style={[styles.subtitle, { marginTop: 6 }]}>
//                 Avg: {avgSleep.h}h {avgSleep.m}m
//               </Text>
//             </View>
//           </View>

//           <TouchableOpacity onPress={handleSleepToggle} style={styles.timerBtn}>
//             <Text style={styles.timerText}>
//               {sleepTime ? 'Start' : 'Stop'} Sleeptime
//             </Text>
//           </TouchableOpacity>

//           <View style={{ marginTop: 20, flex: 1 }}>
//             <InputBox placeholder="Your Monthly Goal" />
//           </View>

//           <AuthBtn title="Set Goal" />
//         </View>
//       </SafeAreaProvider>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.dark,
//     overflow: 'hidden',
//   },
//   inner: {
//     flex: 1,
//     paddingHorizontal: 26,
//     marginTop: StatusBar.currentHeight,
//     paddingBottom: 32,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     gap: 10,
//     marginTop: 10,
//   },
//   input: {
//     color: '#fff',
//     borderRadius: 8,
//     textAlign: 'center',
//     flex: 1,
//   },
//   center: {
//     position: 'absolute',
//     alignItems: 'center',
//     alignSelf: 'center',
//     top: '40%',
//   },
//   duration: {
//     color: '#fff',
//     fontSize: 34,
//     fontFamily: fontFamily?.montserratSemiBold,
//   },
//   subtitle: {
//     color: '#8FA3B0',
//     marginTop: 4,
//     fontFamily: fontFamily?.montserratSemiBold,
//   },
//   timerBtn: {
//     paddingHorizontal: 16,
//     padding: 8,
//     marginTop: 30,
//     alignSelf: 'center',
//     borderRadius: 100,
//     backgroundColor: '#DBD9EC',
//   },
//   timerText: {
//     fontFamily: fontFamily?.montserratMedium,
//     fontSize: 15,
//   },
// });

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
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [started, setStarted] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [liveWakeTime, setLiveWakeTime] = useState(getNowTime());
  const [bedAngle, setBedAngle] = useState(timeToAngle('22:00'));
  const [wakeAngle, setWakeAngle] = useState(timeToAngle('06:00'));

  useEffect(() => {
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

  const handleSleepToggle = () => {
    const now = new Date();

    if (!started) {
      setStartTime(now);
      setStarted(true);

      const t = getNowTime();
      setBedTime(t);
      setBedAngle(timeToAngle(t));
      return;
    }

    setStarted(false);

    const t = getNowTime();
    setWakeTime(t);
    setWakeAngle(timeToAngle(t));

    setStartTime(null);
    setLiveSeconds(0);
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
          onPress={handleSleepToggle}
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
