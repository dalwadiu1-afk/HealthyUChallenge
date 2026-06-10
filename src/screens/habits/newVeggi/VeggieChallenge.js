import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';
import { Header, Wrapper } from '../../../components';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import Modal from 'react-native-modal';
import storage from '@react-native-firebase/storage';

const MAX_WEEKS = 4;

function CameraIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
        stroke="rgba(143,175,120,0.7)"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx={12}
        cy={13}
        r={4}
        stroke="rgba(143,175,120,0.7)"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

const getWeekUnlockData = (goalStartDate, weekNumber) => {
  const unlockDate = moment(goalStartDate).add((weekNumber - 1) * 7, 'days');

  const unlocked = moment().isSameOrAfter(unlockDate);

  return {
    unlocked,
    unlockDate,
  };
};

const uploadImageToFirebase = async localUri => {
  try {
    const extension = localUri.split('.').pop();

    const fileName = `veggie_${Date.now()}.${extension}`;

    const storagePath = `users/${userId}/veggieChallenge/${CURRENT_MONTH_KEY}/${fileName}`;

    const reference = storage().ref(storagePath);

    await reference.putFile(localUri);

    return await reference.getDownloadURL();
  } catch (error) {
    console.log('UPLOAD ERROR', error);
    return null;
  }
};

const VeggieChallenge = ({ navigation, route }) => {
  const CURRENT_MONTH_KEY =
    route?.params?.monthKey ?? moment().format('MMMM_YYYY');
  const isArchivedMonth = CURRENT_MONTH_KEY !== moment().format('MMMM_YYYY');
  const userId = auth().currentUser?.uid;

  const [goalStartDate, setGoalStartDate] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [weeks, setWeeks] = useState({});
  const [labels, setLabels] = useState({});
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const goalRef = database().ref(`/users/${userId}/goal`);
    const veggieRef = database().ref(
      `/users/${userId}/habits/newVeggie/${CURRENT_MONTH_KEY}`,
    );

    goalRef.once('value').then(snap => {
      setGoalStartDate(snap.val()?.startDate || moment().valueOf());
    });

    const listener = veggieRef.on('value', snapshot => {
      if (!snapshot.exists()) {
        // first time user
        const starterWeeks = {
          week1: {
            uri: '',
            label: '',
            timestamp: null,
            locked: false,
          },
          week2: {
            uri: '',
            label: '',
            timestamp: null,
            locked: true,
          },
        };

        setWeeks(starterWeeks);

        veggieRef.update({
          weeks: starterWeeks,
          updatedAt: moment().valueOf(),
        });
        return;
      }

      const data = snapshot.val();

      let normalized = data?.weeks || {};

      const generatedWeeks = {};

      for (let i = 1; i <= MAX_WEEKS; i++) {
        const existingWeek = normalized[`week${i}`];

        if (isArchivedMonth) {
          generatedWeeks[`week${i}`] = {
            uri: existingWeek?.uri || '',
            label: existingWeek?.label || '',
            timestamp: existingWeek?.timestamp || null,
            locked: false,
          };

          continue;
        }

        const { unlocked, unlockDate } = getWeekUnlockData(
          goalStartDate || moment().valueOf(),
          i,
        );

        generatedWeeks[`week${i}`] = {
          uri: existingWeek?.uri || '',
          label: existingWeek?.label || '',
          timestamp: existingWeek?.timestamp || null,
          locked: !unlocked,
          unlockDate: unlockDate.valueOf(),
        };
      }

      setWeeks(generatedWeeks);
    });
    return () => veggieRef.off('value', listener);
  }, [goalStartDate]);

  const updateWeeks = async newWeeks => {
    try {
      await database()
        .ref(`/users/${userId}/habits/newVeggie/${CURRENT_MONTH_KEY}`)
        .update({
          weeks: newWeeks,
          updatedAt: moment().valueOf(),
        });

      console.log('SAVE SUCCESS');
    } catch (e) {
      console.log('SAVE ERROR', e);
    }
  };

  const updateLabel = async (weekKey, text) => {
    const updated = {
      ...weeks,
      [weekKey]: {
        ...weeks[weekKey],
        label: text,
      },
    };

    setWeeks(updated);

    await updateWeeks(updated);
  };

  const deleteEntry = async weekKey => {
    try {
      const imageUrl = weeks?.[weekKey]?.uri;

      if (imageUrl?.includes('firebasestorage')) {
        const storageRef = storage().refFromURL(imageUrl);
        await storageRef.delete();
      }

      const updated = { ...weeks };

      const currentWeekNumber = Number(weekKey.replace('week', ''));

      updated[weekKey] = {
        ...updated[weekKey],
        uri: '',
        label: '',
        timestamp: null,
      };

      for (let i = currentWeekNumber + 1; i <= MAX_WEEKS; i++) {
        delete updated[`week${i}`];
      }

      setWeeks(updated);

      await updateWeeks(updated);
    } catch (error) {
      console.log('DELETE ERROR', error);
    }
  };
  const saveImage = async localUri => {
    try {
      setUploading(true);

      const imageUrl = await uploadImageToFirebase(localUri);

      if (!imageUrl || !selectedWeek) {
        setUploading(false);
        return;
      }

      const updated = {
        ...weeks,
        [selectedWeek]: {
          ...weeks[selectedWeek],
          uri: imageUrl,
          label: weeks[selectedWeek]?.label || '',
          timestamp: moment().valueOf(),
          locked: false,
        },
      };

      setWeeks(updated);

      await updateWeeks(updated);

      setSelectedWeek(null);
    } catch (error) {
      console.log('SAVE IMAGE ERROR', error);
    } finally {
      setUploading(false);
    }
  };

  const openGallery = async () => {
    setPickerVisible(false);

    const granted = await requestCameraPermission();

    if (!granted) return;

    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      },
      async response => {
        if (response.didCancel || response.errorCode) return;

        const uri = response?.assets?.[0]?.uri;

        if (!uri) return;

        const uploadUri =
          Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

        await saveImage(uploadUri);
      },
    );
  };

  // there is issue with camera opening

  const openCamera = async () => {
    setPickerVisible(false);

    const granted = await requestCameraPermission();
    if (!granted) return;

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      async response => {
        if (response.didCancel || response.errorCode) return;

        const uri = response?.assets?.[0]?.uri;

        if (!uri) return;

        const uploadUri =
          Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

        await saveImage(uploadUri);
      },
    );
  };

  const safeWeeks = Object.values(weeks || {});
  const activeWeekIndex = Object.values(weeks).findIndex(
    item => !item?.uri && !item?.locked,
  );
  const completedWeeks = safeWeeks.filter(w => !!w?.uri).length;

  const progress = MAX_WEEKS ? completedWeeks / MAX_WEEKS : 0;
  return (
    <View style={styles.root}>
      <Header
        header={'Veggie Challenge'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />

      <Wrapper isForgot safeAreaPops={{ edges: ['bottom'] }}>
        <Text style={styles.heroTitle}>🥦 Weekly Veggie Challenge</Text>
        <Text style={styles.heroSub}>
          Upload 1 veggie meal per week — new week unlocks every 7 days
        </Text>

        <View style={styles.progressRow}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(progress * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {completedWeeks}/{MAX_WEEKS} weeks
          </Text>
        </View>
        <View style={{ marginBottom: 120 }}>
          {Object.entries(weeks)
            .filter(([weekKey, week], index) => {
              if (isArchivedMonth) return true;

              if (index < 2) return true;

              return !week?.locked;
            })
            .sort(([a], [b]) => {
              return (
                Number(a.replace('week', '')) - Number(b.replace('week', ''))
              );
            })
            .map(([weekKey, week], wi) => {
              const hasImage = !!week?.uri;
              const isCurrent = weekKey === `week${activeWeekIndex + 1}`;
              const unlocked = !week?.locked;
              const weekDone = hasImage;

              return (
                <View key={`week-${wi}`} style={styles.weekCard}>
                  {/* HEADER */}
                  <View style={styles.weekHeader}>
                    <Text style={styles.weekTitleText}>
                      Week {weekKey.replace('week', '')}
                    </Text>

                    {weekDone && (
                      <View style={styles.completedPill}>
                        <Text style={styles.completedPillText}>Completed</Text>
                      </View>
                    )}

                    {isCurrent && !weekDone && (
                      <View style={styles.currentPill}>
                        <Text style={styles.currentPillText}>Active</Text>
                      </View>
                    )}
                  </View>

                  {/* BODY */}
                  {hasImage ? (
                    <>
                      <View style={styles.entryCard}>
                        <Image
                          source={{
                            uri: week?.uri,
                          }}
                          style={styles.entryImg}
                        />
                        <TextInput
                          value={labels[weekKey] ?? week?.label}
                          onChangeText={t =>
                            setLabels(prev => ({ ...prev, [weekKey]: t }))
                          }
                          onEndEditing={() =>
                            updateLabel(weekKey, labels[weekKey])
                          }
                          style={styles.uploadText}
                        />
                      </View>

                      <View style={styles.entryActions}>
                        <TouchableOpacity
                          style={styles.retakeBtn}
                          onPress={() => {
                            setSelectedWeek(weekKey);
                            setPickerVisible(true);
                          }}
                        >
                          <Text style={styles.retakeText}>Retake</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => deleteEntry(weekKey)}
                        >
                          <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : isArchivedMonth ? (
                    <View style={styles.missedBox}>
                      <Text style={styles.missedEmoji}>❌</Text>
                      <Text style={styles.missedTitle}>Missed Week</Text>
                      <Text style={styles.missedSub}>
                        No veggie meal uploaded
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadBtn}
                      onPress={() => {
                        setSelectedWeek(weekKey);
                        setPickerVisible(true);
                      }}
                    >
                      <CameraIcon />
                      <Text style={styles.modalTitle}>Upload Veggie Meal</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
        </View>
      </Wrapper>
      <Modal
        isVisible={pickerVisible}
        onBackdropPress={() => setPickerVisible(false)}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {uploading ? 'Uploading...' : 'Upload Veggie Meal'}
          </Text>

          <TouchableOpacity style={styles.modalButton} onPress={openCamera}>
            <Text style={styles.modalButtonText}>📷 Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalButton} onPress={openGallery}>
            <Text style={styles.modalButtonText}>🖼 Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setPickerVisible(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  heroBg: { paddingBottom: 20, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  missedBox: {
    height: 100,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.25)',
  },

  missedEmoji: {
    fontSize: 22,
  },

  missedTitle: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
    marginTop: 4,
  },

  missedSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    marginTop: 2,
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
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fontFamily.montserratBold,
    paddingHorizontal: 18,
    marginBottom: 6,
    includeFontPadding: false,
  },
  heroSub: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  progressRow: {
    paddingHorizontal: 18,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBg: {
    flex: 1,
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 6,
  },
  progressLabel: {
    color: colors.grey,
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },

  scroll: { padding: 18, paddingTop: 16, paddingBottom: 48 },

  /* Week cards */
  weekCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  weekCardDone: { borderColor: 'rgba(143,175,120,0.3)' },
  weekCardLocked: {
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  weekNumBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekNumBadgeDone: {
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
  },
  weekNumBadgeLocked: { backgroundColor: 'rgba(255,255,255,0.04)' },
  weekNumText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: fontFamily.montserratBold,
  },
  weekTitleText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    flex: 1,
  },
  lockedText: { color: 'rgba(255,255,255,0.25)' },

  completedPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 49,
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.35)',
  },
  completedPillText: {
    color: colors.secondary,
    fontSize: 11,
    fontFamily: fontFamily.montserratSemiBold,
  },
  currentPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 49,
    backgroundColor: 'rgba(255,193,90,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,193,90,0.35)',
  },
  currentPillText: {
    color: '#FFC15A',
    fontSize: 11,
    fontFamily: fontFamily.montserratSemiBold,
  },
  lockedPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 49,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  lockedPillText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },

  lockedBox: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  lockEmoji: { fontSize: 22, includeFontPadding: false },
  lockedSub: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
  },

  /* Entry card */
  entryCard: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  entryImg: { width: '100%', height: 160, borderRadius: 0 },
  entryTime: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  entryInput: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginTop: 4,
  },
  entryActions: { flexDirection: 'row', gap: 8, padding: 12 },
  retakeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
    backgroundColor: 'rgba(143,175,120,0.1)',
    alignItems: 'center',
  },
  retakeText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    backgroundColor: 'rgba(255,107,107,0.08)',
    alignItems: 'center',
  },
  deleteText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },

  /* Upload */
  uploadBtn: {
    height: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.25)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(143,175,120,0.04)',
  },
  uploadText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 14,
    fontFamily: fontFamily.montserratMedium,
  },
  modalCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: colors.bubbleDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  modalTitle: {
    color: colors.white,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fontFamily.montserratBold,
  },

  modalButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(143,175,120,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.25)',
  },

  modalButtonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },

  cancelButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  cancelText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
});

export default VeggieChallenge;
