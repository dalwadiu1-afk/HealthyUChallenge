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
import { Header, Wrapper } from '../../../components';

const TOTAL = 4;

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

function WorkoutCard({ index, photo, onUpload }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 380,
      delay: index * 90,
      useNativeDriver: true,
    }).start();
  }, []);

  const done = !!photo;

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
            <Text style={styles.cardTitle}>Workout #{index + 1}</Text>
            <Text style={styles.cardSub}>
              {done ? 'Photo uploaded ✓' : 'Tap to upload proof'}
            </Text>
          </View>
          {done && (
            <View style={styles.donePill}>
              <Text style={styles.donePillText}>Done</Text>
            </View>
          )}
        </View>

        {/* Upload area */}
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
      </View>
    </Animated.View>
  );
}

export default function FitnessClassUI({ navigation }) {
  const [photos, setPhotos] = useState(Array(TOTAL).fill(null));
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleUpload = index => {
    const updated = [...photos];
    updated[index] =
      'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg';
    setPhotos(updated);
  };

  const done = photos.filter(Boolean).length;
  const progress = done / TOTAL;

  return (
    <View style={styles.root}>
      <Header
        header="Weekly Classes"
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />

      <Wrapper isForgot safeAreaPops={{ edges: ['bottom'] }}>
        {/* Hero section */}
        <Animated.View style={{ opacity: headerAnim }}>
          <Text style={styles.heroTitle}>🏋️ Weekly Fitness Class</Text>
          <Text style={styles.heroSub}>
            Complete 4 workouts and upload your proof
          </Text>

          {/* Progress bar */}
          <View style={styles.progressCard}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressCount}>
                {done} / {TOTAL} workouts
              </Text>
            </View>
            <View style={styles.progressBg}>
              <Animated.View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <View style={styles.progressDots}>
              {Array.from({ length: TOTAL }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i < done && styles.dotFilled]}
                />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Workout cards */}
        {photos.map((photo, index) => (
          <WorkoutCard
            key={index}
            index={index}
            photo={photo}
            onUpload={handleUpload}
          />
        ))}

        {/* CTA */}
        <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Join Weekly Fitness Class</Text>
        </TouchableOpacity>
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  /* Header */
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
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
  },

  scroll: { paddingHorizontal: 18, paddingBottom: 48 },

  /* Hero */
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
    fontFamily: fontFamily.montserratMedium,
    marginBottom: 20,
    lineHeight: 20,
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
  progressDots: { flexDirection: 'row', gap: 8 },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dotFilled: { backgroundColor: colors.secondary },

  /* Workout card */
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
    fontFamily: fontFamily.montserratMedium,
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

  /* Upload */
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
  uploadOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
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

  /* CTA */
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
