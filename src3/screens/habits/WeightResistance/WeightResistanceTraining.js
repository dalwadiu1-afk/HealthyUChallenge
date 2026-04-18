import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';

const TOTAL = 8;
const WEEKLY_TARGET = 2;

function CameraIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
        stroke="rgba(143,175,120,0.6)"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx={12}
        cy={13}
        r={4}
        stroke="rgba(143,175,120,0.6)"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke="#fff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function WorkoutCard({ index, photo, timestamp, onUpload }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 380,
      delay: index * 70,
      useNativeDriver: true,
    }).start();
  }, []);

  const done = !!photo;
  const weekNum = Math.floor(index / WEEKLY_TARGET) + 1;
  const sessionNum = (index % WEEKLY_TARGET) + 1;

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [24, 0],
            }),
          },
        ],
      }}
    >
      <View style={[styles.card, done && styles.cardDone]}>
        {/* Card header */}
        <View style={styles.cardHeader}>
          <View style={[styles.numBadge, done && styles.numBadgeDone]}>
            {done ? (
              <CheckIcon />
            ) : (
              <Text style={styles.numText}>{index + 1}</Text>
            )}
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>Session #{index + 1}</Text>
            <Text style={styles.cardSub}>
              Week {weekNum} · Session {sessionNum}
              {done ? '  ✓ Uploaded' : ''}
            </Text>
          </View>
          {done && (
            <View style={styles.donePill}>
              <Text style={styles.donePillText}>Done</Text>
            </View>
          )}
        </View>

        {/* Upload */}
        <TouchableOpacity
          style={[styles.uploadBox, done && styles.uploadBoxDone]}
          onPress={() => onUpload(index)}
          activeOpacity={0.8}
        >
          {photo ? (
            <>
              <Image source={{ uri: photo }} style={styles.uploadImage} />
              <View style={styles.uploadOverlay}>
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => onUpload(index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <CameraIcon />
              <Text style={styles.uploadText}>+ Upload Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Timestamp */}
        {done && timestamp && (
          <Text style={styles.timestamp}>Uploaded {timestamp}</Text>
        )}
      </View>
    </Animated.View>
  );
}

export default function WeightTrainingUI({ navigation }) {
  const [sessions, setSessions] = useState(
    Array.from({ length: TOTAL }, () => ({ photo: null, timestamp: null })),
  );
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleUpload = index => {
    const updated = [...sessions];
    updated[index] = {
      photo:
        'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
      timestamp: new Date().toLocaleString(),
    };
    setSessions(updated);
  };

  const done = sessions.filter(s => s.photo).length;
  const weeksCompleted = Math.floor(done / WEEKLY_TARGET);

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Header */}
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
        <Text style={styles.headerTitle}>Weight Resistance{'\n'}Training</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Animated.View style={{ opacity: headerAnim }}>
          <Text style={styles.heroTitle}>🏋️ Weight Training Sessions</Text>
          <Text style={styles.heroSub}>
            Complete at least {WEEKLY_TARGET} workouts per week and upload your
            proof
          </Text>

          {/* Stats strip */}
          <View style={styles.statsStrip}>
            {[
              { label: 'Sessions Done', value: `${done}` },
              { label: 'Weeks Complete', value: `${weeksCompleted}` },
              { label: 'Target / Week', value: `${WEEKLY_TARGET}` },
            ].map((s, i) => (
              <View
                key={i}
                style={[styles.statItem, i < 2 && styles.statBorder]}
              >
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Progress bar */}
          <View style={styles.progressCard}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Overall progress</Text>
              <Text style={styles.progressCount}>
                {done} / {TOTAL}
              </Text>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(done / TOTAL) * 100}%` },
                ]}
              />
            </View>
            {/* Week markers */}
            <View style={styles.weekMarkers}>
              {Array.from({ length: TOTAL / WEEKLY_TARGET }).map((_, i) => {
                const weekDone = sessions
                  .slice(i * WEEKLY_TARGET, (i + 1) * WEEKLY_TARGET)
                  .every(s => s.photo);
                return (
                  <View
                    key={i}
                    style={[styles.weekChip, weekDone && styles.weekChipDone]}
                  >
                    <Text
                      style={[
                        styles.weekChipText,
                        weekDone && styles.weekChipTextDone,
                      ]}
                    >
                      W{i + 1}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Session cards */}
        {sessions.map((s, index) => (
          <WorkoutCard
            key={index}
            index={index}
            photo={s.photo}
            timestamp={s.timestamp}
            onUpload={handleUpload}
          />
        ))}

        <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Start Training</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 44) + 8,
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
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
    lineHeight: 22,
  },

  scroll: { paddingHorizontal: 18, paddingBottom: 48 },

  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 6,
    includeFontPadding: false,
  },
  heroSub: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 20,
    lineHeight: 20,
  },

  /* Stats strip */
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
    overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 2,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
  },

  /* Progress */
  progressCard: {
    backgroundColor: colors.bubbleDark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    padding: 16,
    marginBottom: 22,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },
  progressCount: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
  progressBg: {
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 6,
  },
  weekMarkers: { flexDirection: 'row', gap: 6 },
  weekChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  weekChipDone: {
    borderColor: 'rgba(143,175,120,0.4)',
    backgroundColor: 'rgba(143,175,120,0.12)',
  },
  weekChipText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },
  weekChipTextDone: { color: colors.secondary },

  /* Card */
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 12,
  },
  cardDone: {
    borderColor: 'rgba(143,175,120,0.3)',
    backgroundColor: 'rgba(143,175,120,0.06)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  numBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numBadgeDone: {
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
  },
  numText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },
  cardHeaderText: { flex: 1 },
  cardTitle: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 2,
  },
  cardSub: {
    color: colors.grey,
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },
  donePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 49,
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
  },
  donePillText: {
    color: colors.secondary,
    fontSize: 11,
    fontFamily: fontFamily.montserratSemiBold,
  },

  uploadBox: {
    height: 130,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  uploadBoxDone: { borderStyle: 'solid', borderColor: 'rgba(143,175,120,0.3)' },
  uploadPlaceholder: { alignItems: 'center', gap: 8 },
  uploadText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  uploadImage: { width: '100%', height: '100%' },
  uploadOverlay: { position: 'absolute', bottom: 8, right: 8 },
  retakeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 49,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  retakeText: {
    color: colors.white,
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },
  timestamp: {
    marginTop: 8,
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: fontFamily.montserratRegular,
  },

  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: 49,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },
});
