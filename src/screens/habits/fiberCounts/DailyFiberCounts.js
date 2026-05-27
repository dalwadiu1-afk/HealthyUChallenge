import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import Svg, { Rect, Text as SvgText, G, Polyline } from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { getSmartTips } from '../../../utils/helper';
import { Header, Wrapper } from '../../../components';
import moment from 'moment';

const CHART_HEIGHT = 200;
const PADDING = 20;
const BAR_WIDTH = 14;
const ITEM_WIDTH = 30;

const buildFiberTemplate = startDate => {
  const start = moment(startDate).startOf('day');

  return Array.from({ length: 30 }, (_, i) => {
    const d = moment(start).add(i, 'days');

    return {
      key: d.format('YYYY-MM-DD'),
      fiber: 0,
      date: d,
    };
  });
};
// Fix this screen that data is not shoing even it saved in the db and also 
function StatRow({ emoji, label, value, last }) {
  return (
    <>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>
          <Text style={styles.statEmoji}>{emoji} </Text>
          {label}
        </Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      {!last && <View style={styles.statDivider} />}
    </>
  );
}

export const getDateKey = (date = new Date()) => {
  return moment(date).format('YYYY-MM-DD');
};

export default function FiberChartDays({ navigation }) {
  const [tips, setTips] = useState([]);
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState(10);
  const [fiberData, setFiberData] = useState([]);
  const [goalRange, setGoalRange] = useState({
    min: 25,
    max: 38,
  });

  /* ───────── FIRESTORE LIVE DATA ───────── */
  useEffect(() => {
    let userRef = null;

    const unsubscribeAuth = auth().onAuthStateChanged(user => {
      if (!user) {
        setFiberData(buildFiberTemplate('2026-04-15'));
        return;
      }

      const uid = user.uid;
      userRef = database().ref(`/users/${uid}`);

      userRef.on('value', snapshot => {
        const data = snapshot.val() || {};

        const startDate = data?.goal?.startDate || '2026-04-15';
        const habits = data?.habits || {};
        const gender = data?.profile?.gender;

        const goal =
          gender === 'male' ? { min: 30, max: 38 } : { min: 21, max: 25 };

        setGoalRange(goal);

        const baseData = buildFiberTemplate(startDate);

        const keys = Object.keys(habits);

        if (!keys.length) {
          setFiberData(baseData);
          setTips(getSmartTips(baseData));
          return;
        }

        const latestKey = keys.sort((a, b) => {
          const [, mA, yA] = a.split('_');
          const [, mB, yB] = b.split('_');
          return new Date(`${mB} 1, ${yB}`) - new Date(`${mA} 1, ${yA}`);
        })[0];

        const days = habits?.[latestKey]?.days || {};

        const formatted = baseData.map(item => ({
          ...item,
          fiber: Number(days?.[item.key]?.progress || 0),
        }));

        setFiberData(formatted);
        setTips(getSmartTips(formatted));
      });
    });

    return () => {
      if (userRef) userRef.off();
      unsubscribeAuth();
    };
  }, []);

  const max = fiberData.length
    ? Math.max(...fiberData.map(d => d.fiber), 40)
    : 40;
  const graphHeight = CHART_HEIGHT - PADDING * 2;
  const getBarH = val => {
    if (!max) return 0;
    return (val / max) * graphHeight;
  };

  const formatDate = date => moment(date).format('D');

  /* ───────── ADD FIBER ───────── */
  const addFiber = async () => {
    const val = Number(input || 0);
    if (!val) return;

    setInput('');

    const uid = auth().currentUser?.uid;
    const today = moment();

    const day = moment().format('YYYY-MM-DD');
    const monthName = today.format('MMMM');
    const year = today.format('YYYY');

    const habitKey = `${monthName}_${year}`;

    // find existing value
    const current = fiberData.find(
      d => moment(d.date).format('YYYY-MM-DD') === today.format('YYYY-MM-DD'),
    );
    const newFiber = (current?.fiber || 0) + val;

    try {
      await database()
        .ref(`users/${uid}/habits/fiber/${habitKey}/days/${day}`)
        .update({
          progress: String(newFiber),
          completed: newFiber >= goalRange.min,
        });

      // optional: set meta (only once)
      await database().ref(`users/${uid}/habits/fiber/${habitKey}`).update({
        title: 'Fiber Intake',
        target: '25-38g',
      });

      setFiberData(prev =>
        prev.map(d =>
          moment(d.date).format('YYYY-MM-DD') === today.format('YYYY-MM-DD')
            ? { ...d, fiber: newFiber }
            : d,
        ),
      );
    } catch (e) {
      console.log('Error updating fiber:', e);
    }
  };

  const pastData = fiberData.slice(0, selected + 1);
  const total = pastData.reduce((s, d) => s + d.fiber, 0);
  const avg = total / (selected + 1);

  const remainingDays = 30 - (selected + 1);
  const requiredAvg =
    remainingDays > 0 ? (goalRange.min * 30 - total) / remainingDays : 0;

  const trendPoints = fiberData
    .map((d, i) => {
      const x = i * ITEM_WIDTH + ITEM_WIDTH / 2;
      const y = CHART_HEIGHT - PADDING - getBarH(d.fiber);
      return `${x},${y}`;
    })
    .join(' ');

  const warning = useMemo(() => {
    const last7 = fiberData.slice(-7);
    const lowDays = last7.filter(d => d.fiber < goalRange.min).length;
    if (lowDays >= 4) return '⚠️ Severe low fiber trend detected';
    if (lowDays >= 2) return '⚠️ Fiber intake inconsistent';
    return null;
  }, [fiberData]);

  return (
    <View style={styles.root}>
      <Header
        header={'Fiber Tracker'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />

      <Wrapper orbsRight safeAreaPops={{ edges: ['bottom'] }}>
        <View style={styles.selectedPill}>
          <Text style={styles.selectedPillText}>
            Day {selected + 1} · {fiberData[selected]?.fiber || 0}g fiber
          </Text>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ width: ITEM_WIDTH * 30, height: CHART_HEIGHT }}>
              {fiberData.map((item, index) => {
                const barHeight = getBarH(item.fiber);
                const inRange =
                  item.fiber >= goalRange.min && item.fiber <= goalRange.max;

                return (
                  <View
                    key={index}
                    style={{
                      position: 'absolute',
                      left: index * ITEM_WIDTH,
                      width: ITEM_WIDTH,
                      height: CHART_HEIGHT,
                      alignItems: 'center',
                    }}
                  >
                    <Svg width={ITEM_WIDTH} height={CHART_HEIGHT}>
                      <G>
                        <Rect
                          x={(ITEM_WIDTH - BAR_WIDTH) / 2}
                          y={CHART_HEIGHT - PADDING - barHeight}
                          width={BAR_WIDTH}
                          height={barHeight}
                          fill={
                            selected === index
                              ? '#8FAF78'
                              : inRange
                              ? 'rgba(77,102,68,0.85)'
                              : 'rgba(255,255,255,0.15)'
                          }
                          rx={5}
                        />

                        <Rect
                          x={0}
                          y={PADDING}
                          width={ITEM_WIDTH}
                          height={graphHeight}
                          fill="transparent"
                          onPress={() => setSelected(index)}
                        />

                        <SvgText
                          x={ITEM_WIDTH / 2}
                          y={CHART_HEIGHT - 5}
                          fontSize="9"
                          fill="rgba(255,255,255,0.35)"
                          textAnchor="middle"
                          fontFamily={fontFamily.montserratRegular}
                        >
                          {formatDate(item.date)}
                        </SvgText>
                      </G>
                    </Svg>
                  </View>
                );
              })}

              <Svg
                pointerEvents="none"
                height={CHART_HEIGHT}
                width={ITEM_WIDTH * 30}
                style={{ position: 'absolute' }}
              >
                <Polyline
                  points={trendPoints}
                  fill="none"
                  stroke="rgba(143,175,120,0.6)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              </Svg>
            </View>
          </ScrollView>
        </View>

        {warning && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>{warning}</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsCard}>
          <StatRow emoji="📊" label="Avg Fiber" value={`${avg.toFixed(1)}g`} />
          <StatRow emoji="🎯" label="Target Range" value="25g – 38g" />
          <StatRow
            emoji="🔮"
            label="Required Avg"
            value={`${requiredAvg.toFixed(1)}g/day`}
            last
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Fiber Tips</Text>
          {tips.map((t, i) => (
            <Text key={i} style={styles.tipText}>
              • {t}
            </Text>
          ))}
        </View>

        {/* Add */}
        {selected ? (
          <View style={styles.addCard}>
            <Text style={styles.addLabel}>🍽 Add Fiber (g)</Text>
            <TextInput
              style={styles.addInput}
              value={input}
              onChangeText={setInput}
              keyboardType="numeric"
              placeholder="e.g. 10"
              placeholderTextColor="rgba(255,255,255,0.25)"
            />

            <TouchableOpacity style={styles.addBtn} onPress={addFiber}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View />
        )}

        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Share Progress</Text>
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

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 44) + 10,
    paddingHorizontal: 18,
    paddingBottom: 10,
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

  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 48,
  },

  /* ── Selected pill ── */
  selectedPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
    borderRadius: 49,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 14,
  },
  selectedPillText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },

  /* ── Chart ── */
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 14,
  },

  /* ── Warning ── */
  warningBox: {
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  warningText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },

  /* ── Stats card ── */
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  statEmoji: {
    fontSize: 15,
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fontFamily.montserratMedium,
  },
  statValue: {
    fontSize: 14,
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
  },
  statDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  /* ── Tips ── */
  tipsCard: {
    backgroundColor: colors.bubbleDark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    padding: 16,
    marginBottom: 14,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
    marginBottom: 10,
    includeFontPadding: false,
  },
  tipText: {
    fontSize: 12,
    color: colors.grey,
    fontFamily: fontFamily.montserratRegular,
    lineHeight: 22,
  },

  /* ── Add fiber ── */
  addCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 14,
  },
  addLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fontFamily.montserratMedium,
    marginBottom: 12,
    includeFontPadding: false,
  },
  addInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 49,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },

  /* ── Share ── */
  shareBtn: {
    borderRadius: 49,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.35)',
    backgroundColor: 'rgba(143,175,120,0.08)',
    marginBottom: 8,
  },
  shareBtnText: {
    color: colors.secondary,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },
});
