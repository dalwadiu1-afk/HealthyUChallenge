import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  TextInput,
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
import { Header, Wrapper } from '../../../components';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import moment from 'moment';

const getMonthKey = () => moment().format('MMMM_YYYY');

const getWeekKey = startDate => getWeekFromStart(startDate);

const getDateKey = (startDate, date = moment()) =>
  moment(date).format('YYYY-MM-DD');

const getWeekFromStart = (startDate, currentDate = moment()) => {
  const start = moment(startDate);
  const now = moment(currentDate);

  const diffDays = now.diff(start, 'days');
  const weekNumber = Math.floor(diffDays / 7) + 1;

  return `week${weekNumber}`;
};

const DAILY_GOAL = 3;
const user = auth().currentUser;
const USER_ID = user?.uid || 'USER_UID';

const FRUITS = [
  { name: 'Apple', serving: '1 medium (182g)', emoji: '🍎' },
  { name: 'Banana', serving: '1 medium (118g)', emoji: '🍌' },
  { name: 'Orange', serving: '1 medium (131g)', emoji: '🍊' },
  { name: 'Strawberries', serving: '1 cup (150g)', emoji: '🍓' },
  { name: 'Grapes', serving: '1 cup (92g)', emoji: '🍇' },
  { name: 'Mango', serving: '1 cup sliced (165g)', emoji: '🥭' },
  { name: 'Watermelon', serving: '2 cups (280g)', emoji: '🍉' },
  { name: 'Blueberries', serving: '1 cup (148g)', emoji: '🫐' },
];

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

const uploadImageToFirebase = async uri => {
  try {
    const uid = auth().currentUser?.uid;

    if (!uid) {
      throw new Error('User not logged in');
    }

    const fileName = `fruit_${Date.now()}.jpg`;

    const reference = storage().ref(`dailyFruits/${uid}/${fileName}`);

    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

    await reference.putFile(uploadUri);

    const downloadURL = await reference.getDownloadURL();

    return downloadURL;
  } catch (error) {
    console.log('IMAGE UPLOAD ERROR:', error);
    throw error;
  }
};

export default function FruitTrackerUI({ navigation, route }) {
  const today = moment();
  const CURRENT_MONTH_KEY =
    route?.params?.monthKey ?? today.format('MMMM_YYYY');
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [logs, setLogs] = useState([]);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [customServing, setCustomServing] = useState('');
  const [weeksData, setWeeksData] = useState({});
  const [fruits, setFruits] = useState(FRUITS);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [expandedDays, setExpandedDays] = useState({});
  const [dayMeta, setDayMeta] = useState({
    total: 0,
    completed: false,
  });

  const toggleWeek = weekKey => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekKey]: !prev[weekKey],
    }));
  };

  const toggleDay = (weekKey, date) => {
    const key = `${weekKey}_${date}`;

    setExpandedDays(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    if (!USER_ID) return;

    const ref = database().ref(`users/${USER_ID}/goal/startDate`);

    ref.once('value').then(snapshot => {
      const val = snapshot.val();

      if (val) {
        setStartDate(val); // should be ISO string or timestamp
      } else {
        const today = moment().toISOString();
        ref.update(today);
        setStartDate(today);
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('fruits')
      .onSnapshot(snapshot => {
        const extra = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFruits([
          ...FRUITS,
          ...extra,
          {
            name: 'Other',
            serving: 'Custom',
            emoji: '➕',
          },
        ]);
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!USER_ID || !startDate) return;

    const dateKey = getDateKey(startDate);

    const ref = database().ref(
      `users/${USER_ID}/habits/dailyFruits/${CURRENT_MONTH_KEY}`,
    );

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();

      if (data?.[dateKey]) {
        setDayMeta({
          total: data?.[dateKey].total || 0,
          completed: data?.[dateKey].completed || false,
        });
      }
      console.log('data?.entries :>> ', data);
      if (data) {
        setWeeksData(data);
      } else {
        setLogs([]);
      }
    });

    return () => ref.off('value', listener);
  }, [startDate]);

  const openCamera = async () => {
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

            const imageUri = response.assets[0].uri;

            const downloadURL = await uploadImageToFirebase(imageUri);

            setPhoto(downloadURL);
          } catch (error) {
            Alert.alert('Upload Failed', 'Could not upload image.');
          } finally {
            setUploading(false);
            setImagePickerVisible(false);
          }
        }
      },
    );
  };

  const openGallery = async () => {
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

            const imageUri = response.assets[0].uri;

            const downloadURL = await uploadImageToFirebase(imageUri);

            setPhoto(downloadURL);
          } catch (error) {
            Alert.alert('Upload Failed', 'Could not upload image.');
          } finally {
            setUploading(false);
            setImagePickerVisible(false);
          }
        }
      },
    );
  };

  const addLog = async () => {
    if (!selectedFruit || !startDate) {
      Alert.alert('Missing Data', 'Please select a fruit.');
      return;
    }

    if (selectedFruit.name === 'Other' && !customServing.trim()) {
      Alert.alert('Serving Required', 'Please enter serving amount.');
      return;
    }

    // PHOTO VALIDATION
    if (!photo) {
      Alert.alert(
        'Photo Required',
        'Please take a photo before logging your fruit.',
      );
      return;
    }

    try {
      const weekKey = getWeekKey(startDate);
      const dateKey = getDateKey(startDate);

      const dayRef = database().ref(
        `users/${USER_ID}/habits/dailyFruits/${CURRENT_MONTH_KEY}/${weekKey}/${dateKey}`,
      );

      const entryRef = dayRef.child('entries').push();

      const snapshot = await dayRef.once('value');
      const existing = snapshot.val();

      const currentTotal = existing?.total || 0;
      const newTotal = currentTotal + 1;

      await entryRef.update({
        fruit: selectedFruit.name,
        serving:
          selectedFruit.name === 'Other'
            ? `${customServing} g`
            : selectedFruit.serving,
        emoji: selectedFruit.emoji,
        photo,
        createdAt: moment().valueOf(),
        createdDate: moment().format('YYYY-MM-DD'),
        createdTime: moment().format('hh:mm A'),
      });

      await dayRef.update({
        total: newTotal,
        completed: newTotal >= DAILY_GOAL,
        updatedAt: moment().valueOf(),
      });

      setSelectedFruit(null);
      setPhoto(null);
      setCustomServing('');
      setImagePickerVisible(false);
      setUploading(false);
    } catch (e) {
      console.log('Error saving fruit log:', e);
    }
  };

  const renderWeeks = () => {
    if (!weeksData) return null;

    const weeks = Object.entries(weeksData || {}).sort((a, b) => {
      return (
        parseInt(b[0].replace('week', '')) - parseInt(a[0].replace('week', ''))
      );
    });

    return weeks.map(([weekKey, weekDays]) => {
      const isWeekOpen = expandedWeeks[weekKey];

      return (
        <View key={weekKey} style={styles.card}>
          {/* WEEK HEADER */}
          <TouchableOpacity onPress={() => toggleWeek(weekKey)}>
            <View style={styles.weekHeader}>
              <Text style={styles.cardDate}>📅 {weekKey.toUpperCase()}</Text>
              <Text style={styles.expandIcon}>{isWeekOpen ? '▲' : '▼'}</Text>
            </View>
          </TouchableOpacity>

          {/* WEEK CONTENT */}
          {isWeekOpen &&
            Object.entries(weekDays || {})
              .sort((a, b) => moment(b[0]).valueOf() - moment(a[0]).valueOf())
              .map(([date, day]) => {
                const dayKey = `${weekKey}_${date}`;
                const isDayOpen = expandedDays[dayKey];

                const entries = day?.entries ? Object.values(day.entries) : [];

                return (
                  <View key={date} style={{ marginTop: 10 }}>
                    {/* DAY HEADER (CLICKABLE) */}
                    <TouchableOpacity onPress={() => toggleDay(weekKey, date)}>
                      <Text style={styles.cardSub}>
                        {moment(date).format('DD MMM YYYY')} • {day?.total || 0}{' '}
                        servings
                        {isDayOpen ? ' ▲' : ' ▼'}
                      </Text>
                    </TouchableOpacity>

                    {/* DAY DETAILS */}
                    {isDayOpen &&
                      entries.map((item, i) => (
                        <View key={i} style={styles.entryRow}>
                          <Text style={styles.entryLeft}>
                            {item.emoji} {item.fruit}
                          </Text>
                          <Text style={styles.entryRight}>{item.serving}</Text>
                        </View>
                      ))}
                  </View>
                );
              })}
        </View>
      );
    });
  };

  const todayCount = dayMeta.total;
  const goalMet = dayMeta.completed;
  const progress = Math.min(todayCount / DAILY_GOAL, 1);

  return (
    <View style={styles.root}>
      <Header
        header={'🍎 Daily Fruit'}
        headerContainer={{
          paddingHorizontal: 24,
        }}
      />

      {/* <Text style={styles.heroTitle}>🍎 Daily Fruit Tracker</Text> */}
      <Text style={styles.heroSub}>Eat 2–3 servings of fruit every day</Text>

      {/* Progress bar */}
      {!route?.params?.monthKey && (
        <View style={styles.progressRow}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: goalMet ? '#22c55e' : colors.secondary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, goalMet && { color: '#22c55e' }]}>
            {todayCount}/{DAILY_GOAL} {goalMet ? '✓' : 'servings'}
          </Text>
        </View>
      )}
      <Wrapper safeAreaPops={{ edges: ['bottom'] }}>
        {/* Goal banner */}
        {!route?.params?.monthKey && (
          <>
            {goalMet && (
              <View style={styles.goalBanner}>
                <GradientBg
                  id="goalBanner"
                  c1="rgba(34,197,94,0.2)"
                  c2="rgba(21,128,61,0.1)"
                  r={14}
                  horizontal
                />
                <Text style={styles.goalBannerText}>
                  🎉 Daily goal reached! Great job!
                </Text>
              </View>
            )}

            {/* Add card */}

            <View style={styles.addCard}>
              <Text style={styles.addTitle}>Log a Serving</Text>

              {/* Fruit picker */}
              <Text style={styles.sectionLabel}>Select Fruit</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.fruitRow}
              >
                {fruits.map(f => (
                  <TouchableOpacity
                    key={f.name}
                    style={[
                      styles.fruitChip,
                      selectedFruit?.name === f.name && styles.fruitChipActive,
                    ]}
                    onPress={() => setSelectedFruit(f)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.fruitEmoji}>{f.emoji || '🍏'}</Text>
                    <Text
                      style={[
                        styles.fruitName,
                        selectedFruit?.name === f.name &&
                          styles.fruitNameActive,
                      ]}
                    >
                      {f.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Serving info */}
              {/* Serving info */}
              {selectedFruit && (
                <>
                  <View style={styles.servingRow}>
                    <Text style={styles.servingLabel}>1 Serving =</Text>

                    {selectedFruit.name === 'Other' ? (
                      <TextInput
                        value={customServing}
                        onChangeText={text => {
                          // numbers only + max 3 digits
                          const cleaned = text
                            .replace(/[^0-9]/g, '')
                            .slice(0, 3);
                          setCustomServing(cleaned);
                        }}
                        placeholder="Enter grams"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="number-pad"
                        maxLength={3}
                        style={styles.customInput}
                      />
                    ) : (
                      <Text style={styles.servingValue}>
                        {selectedFruit.serving}
                      </Text>
                    )}
                  </View>
                </>
              )}

              {/* Photo */}
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
                  <Image source={{ uri: photo }} style={styles.photoImg} />
                ) : (
                  <View style={styles.photoBtnInner}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                        stroke="rgba(143,175,120,0.6)"
                        strokeWidth={1.8}
                      />
                      <Circle
                        cx={12}
                        cy={13}
                        r={4}
                        stroke="rgba(143,175,120,0.6)"
                        strokeWidth={1.8}
                      />
                    </Svg>

                    <Text style={styles.photoBtnText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Log button */}
              <TouchableOpacity
                style={[styles.logBtn, !selectedFruit && styles.logBtnDisabled]}
                onPress={addLog}
                activeOpacity={0.85}
              >
                {selectedFruit && (
                  <GradientBg
                    id="logBtnGrad"
                    c1="#6A9455"
                    c2="#3A5A2A"
                    r={14}
                    horizontal
                  />
                )}
                <Text
                  style={[
                    styles.logBtnText,
                    !selectedFruit && styles.logBtnTextDisabled,
                  ]}
                >
                  Log Serving
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Today's log */}
        <View style={{ ...styles.card, marginBottom: 110 }}>
          <Text style={styles.cardTitle}>Fruit Progress</Text>

          <ScrollView>
            {Object.keys(weeksData || {}).length > 0 ? (
              renderWeeks()
            ) : (
              <Text style={{ color: '#fff' }}>No data yet</Text>
            )}
          </ScrollView>
        </View>
      </Wrapper>
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
    marginBottom: 16,
  },
  progressRow: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  progressBg: {
    flex: 1,
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  expandIcon: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },
  progressFill: { height: '100%', borderRadius: 6 },
  progressLabel: {
    color: colors.grey,
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 4,
  },
  scroll: { padding: 18, paddingTop: 16, paddingBottom: 48 },

  goalBanner: {
    height: 46,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    marginBottom: 14,
  },
  goalBannerText: {
    color: '#22c55e',
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },

  addCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    marginBottom: 18,
  },
  addTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 16,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  fruitRow: { marginHorizontal: -4, marginBottom: 14 },
  fruitChip: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 72,
  },
  fruitChipActive: {
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderColor: 'rgba(143,175,120,0.4)',
  },
  fruitEmoji: { fontSize: 22, includeFontPadding: false, marginBottom: 5 },
  fruitName: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },
  fruitNameActive: { color: colors.secondary },

  servingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(143,175,120,0.08)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
  },
  servingLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
  },
  servingValue: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },

  photoBtn: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(143,175,120,0.25)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  photoBtnFilled: {
    borderStyle: 'solid',
    borderColor: 'rgba(143,175,120,0.3)',
  },
  photoBtnInner: {
    height: 80,
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
  photoImg: { width: '100%', height: 120 },

  logBtn: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  logBtnDisabled: {},
  logBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
  logBtnTextDisabled: { color: 'rgba(255,255,255,0.3)' },

  logTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  customInput: {
    flex: 1,
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 12,
    marginBottom: 10,
  },
  logImg: { width: 54, height: 54, borderRadius: 12 },
  logEmojiBox: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logEmoji: { fontSize: 24, includeFontPadding: false },
  logInfo: { flex: 1 },
  logFruit: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
  logServing: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 2,
  },
  logTime: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  cardDate: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 6,
  },

  cardSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginBottom: 10,
    fontFamily: fontFamily.montserratRegular,
  },

  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },

  entryLeft: {
    color: colors.white,
    fontSize: 13,
  },

  entryRight: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },

  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    marginTop: 6,
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
