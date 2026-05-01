import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { Header, Wrapper } from '../../../components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const USER_ID = auth().currentUser?.uid;

const getToday = () => new Date().toISOString().split('T')[0];
const TOTAL_DAYS = 30;
const CARD_SIZE = (SCREEN_WIDTH - 18 * 2 - 10) / 2;

const HalfPlateFruitsVeggies = ({ navigation }) => {
  const [photos, setPhotos] = useState(Array(TOTAL_DAYS).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startDate, setStartDate] = useState(null);

  useEffect(() => {
    if (!USER_ID) return;

    const ref = database().ref(`users/${USER_ID}/logs/halfPlateChallenge`);

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();

      if (!data) return;

      // restore start date
      if (data.startDate) {
        const sd = new Date(data.startDate);
        setStartDate(sd);

        const diff = Math.floor((new Date() - sd) / (1000 * 60 * 60 * 24));

        setCurrentIndex(Math.min(diff, TOTAL_DAYS - 1));
      }

      // restore days safely
      const serverDays = data?.days || {};
      const restored = Array(TOTAL_DAYS).fill(null);

      Object.entries(serverDays).forEach(([day, value]) => {
        restored[Number(day) - 1] = value;
      });

      setPhotos(restored);
    });

    return () => ref.off('value', listener);
  }, []);

  const saveDay = async (index, uri) => {
    const ref = database().ref(`users/${USER_ID}/logs/halfPlateChallenge`);

    const timestamp = new Date().toISOString();

    await ref.update({
      startDate: startDate?.toISOString() || new Date().toISOString(),

      [`days/${index + 1}`]: {
        uri,
        timestamp,
      },

      updatedAt: database.ServerValue.TIMESTAMP,
    });
  };

  const pickImage = async index => {
    const granted = await requestCameraPermission();
    if (!granted) return;

    launchCamera({ mediaType: 'photo', quality: 0.7 }, async res => {
      if (res.didCancel || res.errorCode) return;

      const uri = res?.assets?.[0]?.uri;
      if (!uri) return;

      const updated = [...photos];
      updated[index] = {
        uri,
        timestamp: new Date().toISOString(),
      };

      setPhotos(updated);

      await saveDay(index, uri);
    });
  };

  const deletePhoto = async index => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);

    const docRef = doc(db, 'users', USER_ID);

    await setDoc(
      docRef,
      {
        logs: {
          halfPlateChallenge: {
            days: {
              [index + 1]: null,
            },
          },
        },
      },
      { merge: true },
    );
  };

  const completed = photos.filter(Boolean).length;
  const progress = completed / TOTAL_DAYS;

  // Pair days into rows of 2
  const rows = Array.from({ length: Math.ceil(TOTAL_DAYS / 2) }, (_, i) => [
    i * 2,
    i * 2 + 1 < TOTAL_DAYS ? i * 2 + 1 : null,
  ]);

  const DayCard = ({ index }) => {
    if (index === null) return <View style={{ width: CARD_SIZE }} />;

    const item = photos[index];
    const isLocked = index > currentIndex;
    const isDone = !!item;

    return (
      <View
        style={[
          styles.card,
          isDone && styles.cardDone,
          isLocked && styles.cardLocked,
        ]}
      >
        {/* Day label */}
        <View style={styles.cardHeader}>
          <Text style={[styles.dayLabel, isLocked && styles.dayLabelLocked]}>
            Day {index + 1}
          </Text>
          {isDone && (
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>✓</Text>
            </View>
          )}
        </View>

        {/* Content */}
        {isDone ? (
          <View style={styles.photoWrap}>
            <Image source={{ uri: item.uri }} style={styles.photo} />
            <Text style={styles.timestamp}>{item.timestamp}</Text>
            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={() => pickImage(index)}
              >
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deletePhoto(index)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : isLocked ? (
          <View style={styles.lockedBox}>
            <Text style={styles.lockEmoji}>🔒</Text>
            <Text style={styles.lockedText}>Locked</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => pickImage(index)}
            activeOpacity={0.8}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                stroke="rgba(143,175,120,0.7)"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12 17a4 4 0 100-8 4 4 0 000 8z"
                stroke="rgba(143,175,120,0.7)"
                strokeWidth={1.8}
              />
            </Svg>
            <Text style={styles.uploadText}>Upload Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <Header
        header={'🥗 Half Fruit & Veggies'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />
      <Wrapper isForgot safeAreaPops={{ edges: ['bottom'] }}>
        <View style={styles.progressCard}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Daily Progress</Text>
            <Text style={styles.progressCount}>
              {completed} / {TOTAL_DAYS} days
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          {/* Week indicators */}
          <View style={styles.weekRow}>
            {['W1', 'W2', 'W3', 'W4'].map((w, i) => {
              const weekDone =
                photos.slice(i * 7, (i + 1) * 7).filter(Boolean).length === 7;
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
                    {w}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Day grid */}
        {rows.map((pair, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            <DayCard index={pair[0]} />
            <DayCard index={pair[1]} />
          </View>
        ))}
      </Wrapper>
    </View>
  );
};

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
    fontSize: 15,
    fontFamily: fontFamily.montserratBold,
    lineHeight: 22,
  },

  scroll: { paddingHorizontal: 18, paddingBottom: 48 },

  heroTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 16,
    includeFontPadding: false,
  },

  /* Progress */
  progressCard: {
    backgroundColor: colors.bubbleDark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    padding: 16,
    marginBottom: 20,
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
  weekRow: { flexDirection: 'row', gap: 6 },
  weekChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
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

  /* Grid */
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },

  /* Cards */
  card: {
    width: CARD_SIZE,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    overflow: 'hidden',
  },
  cardDone: {
    borderColor: 'rgba(143,175,120,0.3)',
    backgroundColor: 'rgba(143,175,120,0.06)',
  },
  cardLocked: {
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },
  dayLabelLocked: { color: 'rgba(255,255,255,0.25)' },
  doneBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: fontFamily.montserratBold,
  },

  /* Upload */
  uploadBtn: {
    height: 110,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(143,175,120,0.04)',
  },
  uploadText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },

  /* Locked */
  lockedBox: {
    height: 110,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  lockEmoji: { fontSize: 20, includeFontPadding: false },
  lockedText: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },

  /* Photo */
  photoWrap: {},
  photo: { width: '100%', height: 100, borderRadius: 10, marginBottom: 6 },
  timestamp: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 9,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 8,
  },
  photoActions: { flexDirection: 'row', gap: 6 },
  retakeBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
    backgroundColor: 'rgba(143,175,120,0.1)',
    alignItems: 'center',
  },
  retakeText: {
    color: colors.secondary,
    fontSize: 10,
    fontFamily: fontFamily.montserratSemiBold,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    backgroundColor: 'rgba(255,107,107,0.08)',
    alignItems: 'center',
  },
  deleteText: {
    color: '#FF6B6B',
    fontSize: 10,
    fontFamily: fontFamily.montserratSemiBold,
  },
});

export default HalfPlateFruitsVeggies;
