import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';
import storage from '@react-native-firebase/storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Modal from 'react-native-modal';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';

import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import moment from 'moment';

const user = auth().currentUser;
const USER_ID = user?.uid;

function GradientBg({ id, c1, c2, r = 16, horizontal = false }) {
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

export default function FutureIdeasUI({ navigation, route }) {
  const [goalText, setGoalText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [goals, setGoals] = useState([]);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const today = moment();
  const goalTitle = route?.params?.goalTitle || 'Custom Goal';
  const CURRENT_MONTH_KEY =
    route?.params?.monthKey ?? today.format('MMMM_YYYY');

  const uploadImageToFirebase = async imageUri => {
    try {
      const uid = auth().currentUser?.uid;

      if (!uid) {
        throw new Error('User not authenticated');
      }

      const fileName = `${Date.now()}_${Math.floor(
        Math.random() * 1000000,
      )}.jpg`;

      const reference = storage().ref(`${goalTitle}/${uid}/${fileName}`);

      const pathToFile =
        Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;

      await reference.putFile(pathToFile);

      const downloadURL = await reference.getDownloadURL();

      return downloadURL;
    } catch (error) {
      console.log('Firebase Upload Error:', error);
      throw error;
    }
  };

  // FETCH GOALS
  useEffect(() => {
    if (!USER_ID) return;

    const ref = database().ref(
      `users/${USER_ID}/habits/${goalTitle}/${CURRENT_MONTH_KEY}`,
    );

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();

      if (data) {
        const formatted = Object.entries(data)
          .map(([id, value]) => ({
            id,
            ...value,
          }))
          .sort((a, b) => b.createdAt - a.createdAt);

        setGoals(formatted);
      } else {
        setGoals([]);
      }
    });

    return () => ref.off('value', listener);
  }, []);

  const pickPhoto = async () => {
    const granted = await requestCameraPermission();

    if (!granted) return;

    launchCamera({ mediaType: 'photo', quality: 0.7 }, res => {
      if (res.assets?.length > 0) {
        setPhoto(res.assets[0].uri);
      }
    });
  };

  const openCamera = async () => {
    try {
      const granted = await requestCameraPermission();

      if (!granted) return;

      launchCamera(
        {
          mediaType: 'photo',
          quality: 0.8,
        },
        async response => {
          if (response.didCancel) return;

          if (response.assets?.length > 0) {
            try {
              setUploading(true);

              const localUri = response.assets[0].uri;

              const imageUrl = await uploadImageToFirebase(localUri);

              setPhoto(imageUrl);
            } catch (error) {
              Alert.alert('Error', 'Failed to upload image');
            } finally {
              setUploading(false);
              setImagePickerVisible(false);
            }
          }
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  const openGallery = async () => {
    const granted = await requestCameraPermission();

    if (!granted) return;
    try {
      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
        },
        async response => {
          if (response.didCancel) return;

          if (response.assets?.length > 0) {
            try {
              setUploading(true);

              const localUri = response.assets[0].uri;

              const imageUrl = await uploadImageToFirebase(localUri);

              setPhoto(imageUrl);
            } catch (error) {
              Alert.alert('Error', 'Failed to upload image');
            } finally {
              setUploading(false);
              setImagePickerVisible(false);
            }
          }
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  // SAVE GOAL
  const submitGoal = async () => {
    if (!goalText.trim()) return;

    try {
      const ref = database()
        .ref(`users/${USER_ID}/habits/${goalTitle}/${CURRENT_MONTH_KEY}`)
        .push();

      const payload = {
        text: goalText.trim(),
        photo: photo || '',
        createdAt: moment().valueOf(),
        time: moment().format('MMM DD, YYYY'),
      };

      // SAVE TO FIREBASE
      await ref.set(payload);

      // RESET
      setGoalText('');
      setPhoto(null);
    } catch (error) {
      console.log('SAVE GOAL ERROR :>> ', error);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Hero */}
      <View style={styles.heroBg}>
        <GradientBg id="goalsHero" c1="#1A2818" c2="#161D15" r={0} />

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

          <Text style={styles.headerTitle}>{goalTitle}</Text>

          <View style={{ width: 44 }} />
        </View>

        <Text style={styles.heroTitle}>💡 Add Your Personal Goal</Text>

        <Text style={styles.heroSub}>
          Set your own health goals and track your journey your way
        </Text>

        {goals.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {goals.length} goal{goals.length > 1 ? 's' : ''} added
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Input Card */}
        {!route?.params?.monthKey && (
          <View style={styles.inputCard}>
            <Text style={styles.inputCardTitle}>New Goal</Text>

            <Text style={styles.inputCardSub}>
              What health habit do you want to build?
            </Text>

            <TextInput
              placeholder="e.g. Drink 8 glasses of water daily..."
              value={goalText}
              onChangeText={setGoalText}
              placeholderTextColor="rgba(255,255,255,0.2)"
              style={styles.textArea}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* PHOTO */}
            <TouchableOpacity
              style={[styles.photoBtn, photo && styles.photoBtnFilled]}
              onPress={() => setImagePickerVisible(true)}
              activeOpacity={0.8}
            >
              {uploading ? (
                <View style={styles.photoBtnInner}>
                  <Text style={styles.photoBtnText}>Uploading...</Text>
                </View>
              ) : photo ? (
                <>
                  <Image source={{ uri: photo }} style={styles.photoImg} />

                  <View style={styles.retakeOverlay}>
                    <Text style={styles.retakeText}>Tap to change</Text>
                  </View>
                </>
              ) : (
                <View style={styles.photoBtnInner}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                      stroke="rgba(143,175,120,0.5)"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Circle
                      cx={12}
                      cy={13}
                      r={4}
                      stroke="rgba(143,175,120,0.5)"
                      strokeWidth={1.8}
                    />
                  </Svg>

                  <Text style={styles.photoBtnText}>Add Inspiration Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* SUBMIT */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                !goalText.trim() && styles.submitBtnDisabled,
              ]}
              onPress={submitGoal}
              activeOpacity={0.85}
            >
              {goalText.trim() && (
                <GradientBg
                  id="submitGrad"
                  c1="#6A9455"
                  c2="#3A5A2A"
                  r={14}
                  horizontal
                />
              )}

              <Text
                style={[
                  styles.submitBtnText,
                  !goalText.trim() && styles.submitBtnTextDisabled,
                ]}
              >
                Add Goal
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* GOALS */}
        {goals.length > 0 ? (
          <>
            <Text style={styles.listLabel}>Your Goals</Text>

            {goals.map((item, idx) => (
              <View key={item.id} style={styles.goalCard}>
                <View style={styles.goalCardHeader}>
                  <View style={styles.goalNumBadge}>
                    <Text style={styles.goalNumText}>{goals.length - idx}</Text>
                  </View>
                  <Text style={styles.goalTime}>
                    {item?.time ||
                      moment(item?.createdAt).format('MMM DD, YYYY hh:mm A')}
                  </Text>
                </View>

                {!!item.photo && (
                  <Image source={{ uri: item.photo }} style={styles.goalImg} />
                )}

                <Text style={styles.goalText}>{item.text}</Text>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>

            <Text style={styles.emptyTitle}>No goals yet</Text>

            <Text style={styles.emptySub}>
              Add your first personal health goal above to get started
            </Text>
          </View>
        )}
      </ScrollView>
      <Modal
        isVisible={imagePickerVisible}
        onBackdropPress={() => setImagePickerVisible(false)}
        onBackButtonPress={() => setImagePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose Image</Text>

            <TouchableOpacity style={styles.modalBtn} onPress={openCamera}>
              <Text style={styles.modalBtnText}>📸 Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn} onPress={openGallery}>
              <Text style={styles.modalBtnText}>🖼 Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setImagePickerVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  heroBg: { paddingBottom: 20, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    paddingHorizontal: 18,
    paddingBottom: 14,
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
    fontSize: 21,
    fontFamily: fontFamily.montserratBold,
    paddingHorizontal: 18,
    marginBottom: 4,
    includeFontPadding: false,
  },
  heroSub: {
    color: colors.grey,
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    paddingHorizontal: 18,
    marginBottom: 14,
    lineHeight: 20,
  },
  countBadge: {
    alignSelf: 'flex-start',
    marginHorizontal: 18,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
  },
  countText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },

  scroll: { padding: 18, paddingTop: 16, paddingBottom: 120 },

  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    marginBottom: 24,
  },
  inputCardTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 3,
  },
  inputCardSub: {
    color: colors.grey,
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 14,
  },

  textArea: {
    minHeight: 90,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    paddingTop: 12,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 12,
    lineHeight: 22,
  },

  photoBtn: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(143,175,120,0.2)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  photoBtnFilled: {
    borderStyle: 'solid',
    borderColor: 'rgba(143,175,120,0.3)',
  },
  photoBtnInner: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(143,175,120,0.04)',
  },
  photoBtnText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  photoImg: { width: '100%', height: 140 },
  retakeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  retakeText: {
    color: colors.white,
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },

  submitBtn: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  submitBtnDisabled: {},
  submitBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
  submitBtnTextDisabled: { color: 'rgba(255,255,255,0.3)' },

  listLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  goalCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  goalNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalNumText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratBold,
  },
  goalTime: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },
  goalImg: { width: '100%', height: 130, borderRadius: 12, marginBottom: 10 },
  goalText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
    lineHeight: 22,
  },

  emptyState: { alignItems: 'center', paddingTop: 32, paddingBottom: 16 },
  emptyEmoji: { fontSize: 44, includeFontPadding: false, marginBottom: 12 },
  emptyTitle: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 6,
  },
  emptySub: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    width: '85%',
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    color: colors.white,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fontFamily.montserratBold,
  },

  modalBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  modalBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },

  cancelBtn: {
    marginTop: 5,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelText: {
    color: '#ef4444',
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
