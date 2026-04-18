import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Text as SvgText,
} from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';

function GradientBg({ id, c1, c2, r = 20, horizontal = false }) {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient
          id={id}
          x1="0"
          y1="0"
          x2={horizontal ? '1' : '1'}
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

function RingChart({ value, max = 50, size = 100, color, label }) {
  const r = (size - 12) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const filled = (value / max) * circ;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cx}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={10}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cx}
          r={r}
          stroke={color}
          strokeWidth={10}
          fill="none"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          rotation={-90}
          originX={cx}
          originY={cx}
        />
        <SvgText
          x={cx}
          y={cx + 5}
          fill={colors.white}
          fontSize={16}
          textAnchor="middle"
          fontFamily={fontFamily.montserratBold}
        >
          {`${value.toFixed(1)}%`}
        </SvgText>
      </Svg>
      <Text
        style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: 11,
          fontFamily: fontFamily.montserratRegular,
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const RANGES = [
  { label: 'Essential', min: 2, max: 5, color: '#FF6B6B' },
  { label: 'Athletic', min: 6, max: 13, color: '#FFC15A' },
  { label: 'Fitness', min: 14, max: 17, color: '#8FAF78' },
  { label: 'Acceptable', min: 18, max: 24, color: '#5A96FF' },
  { label: 'Obese', min: 25, max: 50, color: '#A782FF' },
];

const getCategory = pct =>
  RANGES.find(r => pct >= r.min && pct <= r.max) || RANGES[RANGES.length - 1];

const BodyFatGoalScreen = ({ navigation }) => {
  const [goalType, setGoalType] = useState('decrease');
  const [startBFP, setStartBFP] = useState(25);
  const [targetBFP, setTargetBFP] = useState(18);

  const difference = Math.abs(targetBFP - startBFP);

  const getValidation = () => {
    if (difference === 0) return '⚠️ Start and target cannot be the same';
    if (difference > 15)
      return '⚠️ This goal is very aggressive — consider a smaller target';
    if (goalType === 'decrease' && targetBFP >= startBFP)
      return '⚠️ Target should be lower than current for Cut Fat';
    if (goalType === 'increase' && targetBFP <= startBFP)
      return '⚠️ Target should be higher than current for Gain Fat';
    return null;
  };

  const validationMsg = getValidation();
  const currentCat = getCategory(startBFP);
  const targetCat = getCategory(targetBFP);
  const isCut = goalType === 'decrease';

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Gradient header */}
      <View style={styles.heroBg}>
        <GradientBg id="bfHero" c1="#1A2818" c2="#161D15" r={0} />
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
          <Text style={styles.headerTitle}>Body Fat Goal</Text>
          <View style={{ width: 44 }} />
        </View>
        <Text style={styles.heroSub}>Set Your Body Fat Goal</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Goal type toggle */}
        <View style={styles.toggleRow}>
          {[
            {
              key: 'decrease',
              label: '↓ Cut Fat',
              grad: ['#4D6644', '#2D4020'],
            },
            {
              key: 'increase',
              label: '↑ Gain Fat',
              grad: ['#5A4A7A', '#3A2F52'],
            },
          ].map(opt => {
            const isActive = goalType === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.toggleBtn, isActive && styles.toggleBtnActive]}
                onPress={() => setGoalType(opt.key)}
                activeOpacity={0.85}
              >
                {isActive && (
                  <GradientBg
                    id={`tgl${opt.key}`}
                    c1={opt.grad[0]}
                    c2={opt.grad[1]}
                    r={14}
                    horizontal
                  />
                )}
                <Text
                  style={[
                    styles.toggleText,
                    isActive && styles.toggleTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Ring charts */}
        <View style={styles.ringsCard}>
          <GradientBg
            id="ringCard"
            c1="rgba(77,102,68,0.2)"
            c2="rgba(22,29,21,0.1)"
            r={22}
          />
          <View style={styles.ringsRow}>
            <RingChart
              value={startBFP}
              color={currentCat.color}
              label="Current"
            />
            <View style={styles.ringsDivider} />
            <RingChart
              value={targetBFP}
              color={targetCat.color}
              label="Target"
            />
          </View>
          <View style={styles.ringsFooter}>
            <View
              style={[
                styles.catChip,
                {
                  borderColor: currentCat.color + '55',
                  backgroundColor: currentCat.color + '18',
                },
              ]}
            >
              <Text style={[styles.catChipText, { color: currentCat.color }]}>
                {currentCat.label}
              </Text>
            </View>
            <Svg width={28} height={16} viewBox="0 0 28 16">
              <Path
                d={isCut ? 'M4 8h20M16 2l8 6-8 6' : 'M24 8H4M12 2L4 8l8 6'}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <View
              style={[
                styles.catChip,
                {
                  borderColor: targetCat.color + '55',
                  backgroundColor: targetCat.color + '18',
                },
              ]}
            >
              <Text style={[styles.catChipText, { color: targetCat.color }]}>
                {targetCat.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Sliders card */}
        <View style={styles.slidersCard}>
          {/* Current slider */}
          <View style={styles.sliderBlock}>
            <View style={styles.sliderLabelRow}>
              <Text style={styles.sliderLabel}>Current Body Fat</Text>
              <View
                style={[
                  styles.pctBadge,
                  {
                    backgroundColor: currentCat.color + '25',
                    borderColor: currentCat.color + '55',
                  },
                ]}
              >
                <Text
                  style={[styles.pctBadgeText, { color: currentCat.color }]}
                >
                  {startBFP.toFixed(1)}%
                </Text>
              </View>
            </View>
            <Slider
              value={startBFP}
              onValueChange={setStartBFP}
              minimumValue={5}
              maximumValue={50}
              step={0.5}
              minimumTrackTintColor={currentCat.color}
              maximumTrackTintColor="rgba(255,255,255,0.12)"
              thumbTintColor={currentCat.color}
            />
            <View style={styles.sliderRange}>
              <Text style={styles.sliderRangeText}>5%</Text>
              <Text style={styles.sliderRangeText}>50%</Text>
            </View>
          </View>

          <View style={styles.sliderDivider} />

          {/* Target slider */}
          <View style={styles.sliderBlock}>
            <View style={styles.sliderLabelRow}>
              <Text style={styles.sliderLabel}>Target Body Fat</Text>
              <View
                style={[
                  styles.pctBadge,
                  {
                    backgroundColor: targetCat.color + '25',
                    borderColor: targetCat.color + '55',
                  },
                ]}
              >
                <Text style={[styles.pctBadgeText, { color: targetCat.color }]}>
                  {targetBFP.toFixed(1)}%
                </Text>
              </View>
            </View>
            <Slider
              value={targetBFP}
              onValueChange={setTargetBFP}
              minimumValue={5}
              maximumValue={50}
              step={0.5}
              minimumTrackTintColor={targetCat.color}
              maximumTrackTintColor="rgba(255,255,255,0.12)"
              thumbTintColor={targetCat.color}
            />
            <View style={styles.sliderRange}>
              <Text style={styles.sliderRangeText}>5%</Text>
              <Text style={styles.sliderRangeText}>50%</Text>
            </View>
          </View>

          {/* Result */}
          <View style={styles.resultRow}>
            <GradientBg
              id="resultGrad"
              c1={isCut ? 'rgba(106,148,85,0.22)' : 'rgba(167,130,255,0.22)'}
              c2={isCut ? 'rgba(58,90,42,0.22)' : 'rgba(90,70,140,0.22)'}
              r={14}
              horizontal
            />
            <Text
              style={[
                styles.resultIcon,
                {
                  includeFontPadding: false,
                  color: isCut ? colors.secondary : '#A782FF',
                },
              ]}
            >
              {isCut ? '↓' : '↑'}
            </Text>
            <Text
              style={[
                styles.resultText,
                { color: isCut ? colors.secondary : '#A782FF' },
              ]}
            >
              {isCut ? 'Reduce' : 'Increase'} {difference.toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Validation */}
        {validationMsg && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>{validationMsg}</Text>
          </View>
        )}

        {/* Category guide */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Body Fat Categories</Text>
          <View style={styles.guideRow}>
            {RANGES.map((r, i) => (
              <View
                key={i}
                style={[
                  styles.guideChip,
                  {
                    borderColor: r.color + '55',
                    backgroundColor: r.color + '15',
                  },
                ]}
              >
                <Text style={[styles.guideChipText, { color: r.color }]}>
                  {r.label}
                </Text>
                <Text
                  style={[styles.guideChipRange, { color: r.color + 'AA' }]}
                >
                  {r.min}–{r.max}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, !!validationMsg && styles.saveBtnDisabled]}
          disabled={!!validationMsg}
          activeOpacity={0.85}
        >
          {!validationMsg && (
            <GradientBg
              id="saveGrad"
              c1="#6A9455"
              c2="#3A5A2A"
              r={16}
              horizontal
            />
          )}
          <Text style={styles.saveBtnText}>Save Goal</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  heroBg: { paddingBottom: 18, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    paddingHorizontal: 18,
    paddingBottom: 12,
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
  heroSub: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    paddingHorizontal: 18,
  },

  scroll: { padding: 18, paddingTop: 16, paddingBottom: 48 },

  /* Toggle */
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  toggleBtnActive: { borderColor: 'rgba(143,175,120,0.4)' },
  toggleText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
  toggleTextActive: { color: colors.white },

  /* Rings */
  ringsCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    padding: 20,
    marginBottom: 14,
    overflow: 'hidden',
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  ringsDivider: {
    width: 1,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  ringsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  catChipText: { fontSize: 11, fontFamily: fontFamily.montserratSemiBold },

  /* Sliders */
  slidersCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    marginBottom: 14,
  },
  sliderBlock: { marginBottom: 4 },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sliderLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  pctBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  pctBadgeText: { fontSize: 12, fontFamily: fontFamily.montserratBold },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  sliderRangeText: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
  },
  sliderDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: 16,
  },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 14,
    overflow: 'hidden',
    gap: 8,
  },
  resultIcon: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
  },
  resultText: { fontSize: 16, fontFamily: fontFamily.montserratBold },

  /* Warning */
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

  /* Category guide */
  guideCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 14,
    marginBottom: 18,
  },
  guideTitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  guideRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  guideChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  guideChipText: { fontSize: 11, fontFamily: fontFamily.montserratSemiBold },
  guideChipRange: {
    fontSize: 9,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 1,
  },

  /* Save */
  saveBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
  },
  saveBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },
});

export default BodyFatGoalScreen;
