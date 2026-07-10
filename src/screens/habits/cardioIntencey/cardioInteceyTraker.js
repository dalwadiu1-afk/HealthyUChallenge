import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { launchCamera } from 'react-native-image-picker';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';
import { Header, Wrapper } from '../../../components';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import { CustomDropdown } from '../../../components/index';

const USER_ID = auth().currentUser?.uid;

const getDateKey = () => moment().format('YYYY-MM-DD');

const getMonthKey = () => moment().format('MMMM_YYYY'); // May_2026

function GradientBg({ id, c1, c2, r = 16, horizontal = false }) {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      {/* progress bar */}
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

const getIntensity = minutes => {
  if (minutes >= 30) return { label: 'High', color: '#22c55e' };
  if (minutes >= 15) return { label: 'Medium', color: '#f59e0b' };
  return { label: 'Low', color: '#ef4444' };
};

const uploadImageToFirebase = async (imageUri, type = 'photo') => {
  try {
    const uid = auth().currentUser?.uid;

    if (!uid) {
      throw new Error('User not logged in');
    }

    const fileName = `cardio/${uid}/${type}_${Date.now()}.jpg`;

    const reference = storage().ref(fileName);

    const uploadUri =
      Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;

    await reference.putFile(uploadUri);

    return await reference.getDownloadURL();
  } catch (error) {
    console.log('UPLOAD ERROR:', error);
    throw error;
  }
};

export default function CardioTrackerUI({ navigation, route }) {
  const today = moment();

  const CURRENT_MONTH_KEY =
    route?.params?.monthKey ?? today.format('MMMM_YYYY');
  const [activeTab, setActiveTab] = useState('timer');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [startPhoto, setStartPhoto] = useState(null);
  const [goal, setGoal] = useState(null);
  const [weeksData, setWeeksData] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endPhoto, setEndPhoto] = useState(null);
  const [manualTime, setManualTime] = useState('');
  const [manualIntensity, setManualIntensity] = useState('');
  const [manualSaved, setManualSaved] = useState(false);

  const openCamera = async type => {
    const granted = await requestCameraPermission();
    if (!granted) return null;

    return new Promise(resolve => {
      launchCamera({ mediaType: 'photo', quality: 0.7 }, result => {
        if (result.assets?.length > 0) {
          const uri = result.assets[0].uri;

          if (type === 'start') setStartPhoto(uri);
          else setEndPhoto(uri);

          resolve(uri); // ✅ return image
        } else {
          resolve(null);
        }
      });
    });
  };

  const getWeekIndex = startDate => {
    if (!startDate) return 1;

    const diffDays = moment().diff(moment(startDate), 'days');
    const week = Math.floor(diffDays / 7) + 1;
    return Math.min(Math.max(week, 1), 4);
  };

  const getWeekRef = () => {
    const week = getWeekIndex(startDate || today);

    return database().ref(
      `users/${USER_ID}/habits/cardio/${CURRENT_MONTH_KEY}/weeks/week${week}`,
    );
  };

  useEffect(() => {
    if (!USER_ID) return;

    const rootRef = database().ref(`users/${USER_ID}`);

    const listener = rootRef.on('value', snap => {
      const data = snap.val() || {};

      // goal

      // startDate
      if (data?.goal?.startDate) {
        setStartDate(
          data?.goal?.startDate ? moment(data.goal.startDate) : null,
        );
      }

      // cardio weeks
      const weeks = data?.habits?.cardio?.[CURRENT_MONTH_KEY]?.weeks || {};
      const goals = data?.habits?.cardio?.[CURRENT_MONTH_KEY] || {};
      setGoal({ goal: goals, title: goals?.title } || null);

      setWeeksData(weeks);
    });

    return () => rootRef.off('value', listener);
  }, []);

  const handleStart = async () => {
    try {
      const localUri = await openCamera('start');

      if (!localUri) return;

      const imageUrl = await uploadImageToFirebase(localUri, 'start');

      setStartPhoto(imageUrl);
      setStartTime(moment());
      setSessionStarted(true);
    } catch (error) {
      console.log('Start Upload Error:', error);
    }
  };

  const appendDaySession = async (weekRef, dateKey, entry) => {
    const snap = await weekRef.once('value');
    const prev = snap.val() || {};

    const prevDay = prev?.days?.[dateKey] || {};
    const prevSessions = prevDay.sessions || [];

    const updatedDay = {
      ...prevDay,
      sessions: [...prevSessions, entry],
    };

    await weekRef.update({
      days: {
        ...prev.days,
        [dateKey]: updatedDay,
      },
    });
  };

  const saveManual = async () => {
    if (!manualTime) return;
    if (!USER_ID) return;

    try {
      const dateKey = getDateKey();
      const minutes = parseInt(manualTime, 10);

      if (isNaN(minutes) || minutes <= 0) return;

      const entry = {
        type: 'manual',
        duration: minutes,
        intensity: manualIntensity || getIntensity(minutes).label,
        createdAt: moment().toISOString(),
      };

      const weekRef = getWeekRef(CURRENT_MONTH_KEY);

      if (!weekRef) {
        console.log('Invalid weekRef');
        return;
      }

      const snapshot = await weekRef.once('value');
      const prev = snapshot.val() || {};
      await weekRef.update({
        title: goal?.title || 'Cardio',
        target: `${goal?.goal?.goal} min/week` || '150 min/week',
        totalMinutes: (prev.totalMinutes || 0) + minutes,
        sessions: (prev.sessions || 0) + 1,
        avgIntensity: entry.intensity,
      });

      await appendDaySession(weekRef, dateKey, entry);

      setManualSaved(true);
      setTimeout(() => setManualSaved(false), 2000);
    } catch (e) {
      console.log('Manual save error:', e);
    }
  };

  const renderWeeks = () => {
    return Object.entries(weeksData || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekKey, week]) => (
        <View key={weekKey} style={styles.weekCard}>
          <Text style={styles.weekTitle}>
            {week.title || 'Cardio Progress'}
          </Text>

          <Text style={styles.weekSub}>🎯 {week.target || '150 min/week'}</Text>

          <Text style={styles.weekSub}>
            ⏱ {week.totalMinutes || 0} min • 📊 {week.sessions || 0} Sessions
          </Text>

          {week.days &&
            Object.entries(week.days)
              .sort(([a], [b]) => moment(b).diff(moment(a)))
              .map(([date, day]) => (
                <View key={date} style={styles.dayCard}>
                  <Text style={styles.dayTitle}>
                    {moment(date).format('DD MMM YYYY')}
                  </Text>

                  {(day.sessions || []).map((session, index) => (
                    <View key={index} style={styles.sessionCard}>
                      <View style={styles.sessionRow}>
                        <Text style={styles.sessionType}>
                          {session.type === 'timer'
                            ? '⏱ Timer Session'
                            : '✏️ Manual Entry'}
                        </Text>

                        <Text
                          style={[
                            styles.sessionIntensity,
                            {
                              color:
                                session.intensity === 'High'
                                  ? '#22c55e'
                                  : session.intensity === 'Medium'
                                  ? '#f59e0b'
                                  : '#ef4444',
                            },
                          ]}
                        >
                          {session.intensity}
                        </Text>
                      </View>

                      <Text style={styles.sessionMeta}>
                        Duration: {session.duration || 0} min
                      </Text>

                      <Text style={styles.sessionMeta}>
                        {moment(session.createdAt).format('hh:mm A')}
                      </Text>

                      {session.startPhoto && (
                        <View style={styles.photoPreviewRow}>
                          <Image
                            source={{ uri: session.startPhoto }}
                            style={styles.previewImage}
                          />

                          {session.endPhoto && (
                            <Image
                              source={{ uri: session.endPhoto }}
                              style={styles.previewImage}
                            />
                          )}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ))}
        </View>
      ));
  };

  const handleStop = async () => {
    try {
      setSessionStarted(false);

      const end = moment();

      const localUri = await openCamera('end');

      let uploadedEndPhoto = null;

      if (localUri) {
        uploadedEndPhoto = await uploadImageToFirebase(localUri, 'end');
      }

      const duration = startTime
        ? moment(end).diff(moment(startTime), 'minutes')
        : 0;

      const intensity = getIntensity(duration).label;

      const entry = {
        type: 'timer',
        duration,
        intensity,
        startTime: moment(startTime).toISOString(),
        endTime: end.toISOString(),
        startPhoto,
        endPhoto: uploadedEndPhoto,
        createdAt: moment().toISOString(),
      };

      // save to firebase database...

      const dateKey = end.format('YYYY-MM-DD');
      const weekRef = database().ref(
        `users/${USER_ID}/habits/cardio/${CURRENT_MONTH_KEY}/weeks/week${week}`,
      );
      const week = getWeekIndex(startDate);

      const snapshot = await weekRef.once('value');
      const prev = snapshot.val() || {};

      await weekRef.update({
        title: goal?.title || 'Cardio Challenge',
        target: `${goal?.goal?.goal || 150} min/week`,
        totalMinutes: (prev.totalMinutes || 0) + duration,
        sessions: (prev.sessions || 0) + 1,
        avgIntensity: intensity,
      });

      await appendDaySession(weekRef, dateKey, entry);

      setEndPhoto(uploadedEndPhoto);
      setEndTime(end);
    } catch (e) {
      console.log('Stop Upload Error:', e);
    }
  };

  const duration =
    startTime && endTime
      ? moment(endTime).diff(moment(startTime), 'minutes')
      : 0;
  const intensity = getIntensity(duration);

  return (
    <View style={styles.root}>
      <Header
        header={'Cardio Tracker'}
        headerContainer={{
          paddingHorizontal: 24,
        }}
      />
      <Text style={styles.heroTitle}>🏃 Cardio Session Tracker</Text>
      <Text style={styles.heroSub}>Track your workout time and intensity</Text>

      {/* Tab switcher */}
      {!route?.params?.monthKey && (
        <View style={styles.tabWrap}>
          {[
            { key: 'timer', label: '⏱ Time Tracker' },
            { key: 'manual', label: '✏️ Manual Entry' },
          ].map(t => (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.tabBtn,
                activeTab === t.key && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab(t.key)}
            >
              {activeTab === t.key && (
                <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]}>
                  <GradientBg
                    id={`ct${t.key}`}
                    c1="#6A9455"
                    c2="#3A5A2A"
                    r={12}
                    horizontal
                  />
                </View>
              )}

              <Text
                style={[
                  styles.tabText,
                  activeTab === t.key && styles.tabTextActive,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <Wrapper orbsRight safeAreaPops={{ edges: ['bottom'] }}>
        {!route?.params?.monthKey && (
          <View>
            {activeTab === 'timer' ? (
              <>
                {/* Session card */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Cardio Session</Text>

                  {/* Start / Stop */}
                  <TouchableOpacity
                    style={[
                      styles.sessionBtn,
                      sessionStarted && styles.sessionBtnStop,
                    ]}
                    onPress={sessionStarted ? handleStop : handleStart}
                    activeOpacity={0.85}
                  >
                    {!sessionStarted && (
                      <GradientBg
                        id="startGrad"
                        c1="#22c55e"
                        c2="#15803d"
                        r={14}
                        horizontal
                      />
                    )}
                    {sessionStarted && (
                      <GradientBg
                        id="stopGrad"
                        c1="#ef4444"
                        c2="#b91c1c"
                        r={14}
                        horizontal
                      />
                    )}
                    <Text style={styles.sessionBtnText}>
                      {sessionStarted ? '⏹  Stop Session' : '▶  Start Session'}
                    </Text>
                  </TouchableOpacity>

                  {/* Times */}
                  {startTime && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Start</Text>
                      <Text style={styles.infoValue}>
                        {moment(startTime).format('hh:mm A')}
                      </Text>
                    </View>
                  )}
                  {endTime && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>End</Text>
                      <Text style={styles.infoValue}>
                        {moment(endTime).format('hh:mm A')}
                      </Text>
                    </View>
                  )}

                  {/* Duration & Intensity */}
                  {duration > 0 && (
                    <View style={styles.statsStrip}>
                      <View style={styles.statItem}>
                        <Text style={styles.statVal}>{duration}</Text>
                        <Text style={styles.statLbl}>Minutes</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text
                          style={[styles.statVal, { color: intensity.color }]}
                        >
                          {intensity.label}
                        </Text>
                        <Text style={styles.statLbl}>Intensity</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statVal}>
                          {duration >= 30 ? '🔥' : duration >= 15 ? '💪' : '🐢'}
                        </Text>
                        <Text style={styles.statLbl}>Status</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Proof photos */}
                {(startPhoto || endPhoto) && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Proof Photos</Text>
                    <View style={styles.photosRow}>
                      {startPhoto && (
                        <View style={styles.photoWrap}>
                          <Image
                            source={{ uri: startPhoto }}
                            style={styles.photo}
                          />
                          <Text style={styles.photoLabel}>Start</Text>
                        </View>
                      )}
                      {endPhoto && (
                        <View style={styles.photoWrap}>
                          <Image
                            source={{ uri: endPhoto }}
                            style={styles.photo}
                          />
                          <Text style={styles.photoLabel}>End</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Manual Entry</Text>
                <Text style={styles.cardSub}>
                  Didn't use the timer? Log your session manually.
                </Text>
                <TextInput
                  placeholder="Duration (minutes)"
                  keyboardType="numeric"
                  value={manualTime}
                  onChangeText={setManualTime}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  style={styles.input}
                />
                <CustomDropdown
                  value={manualIntensity}
                  onSelect={setManualIntensity}
                  placeholder="Select Intensity"
                  options={['Low', 'Medium', 'High']}
                />
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={saveManual}
                  activeOpacity={0.85}
                >
                  <GradientBg
                    id="manualSave"
                    c1="#6A9455"
                    c2="#3A5A2A"
                    r={14}
                    horizontal
                  />
                  <Text style={styles.saveBtnText}>
                    {manualSaved ? '✓ Saved!' : 'Save Entry'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        <View style={{ ...styles.card, marginBottom: 110 }}>
          <Text style={styles.cardTitle}>Weekly Progress</Text>
          <ScrollView contentContainerStyle={{}}>
            {Object.keys(weeksData || {}).length > 0 ? (
              renderWeeks()
            ) : (
              <Text style={{ color: '#fff' }}>No data yet</Text>
            )}
          </ScrollView>
        </View>
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },

  heroBg: { paddingBottom: 18, overflow: 'hidden' },
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
  weekCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  weekCard: {
    padding: 12,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  weekCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sessionCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sessionType: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },

  sessionIntensity: {
    fontSize: 12,
    fontFamily: fontFamily.montserratBold,
  },

  sessionMeta: {
    color: colors.grey,
    fontSize: 11,
    marginTop: 4,
  },

  photoPreviewRow: {
    flexDirection: 'row',
    marginTop: 8,
  },

  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  weekTitle: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },

  weekSub: {
    color: colors.grey,
    fontSize: 11,
    marginTop: 4,
  },

  dayCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  dayTitle: {
    color: colors.white,
    fontSize: 12,
  },

  dayText: {
    color: colors.grey,
    fontSize: 11,
    marginTop: 2,
  },
  weekTitle: {
    color: colors.white,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 6,
  },

  weekText: {
    color: colors.grey,
    fontSize: 12,
    marginBottom: 2,
  },

  dayRow: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  dayDate: {
    color: colors.white,
    fontSize: 12,
  },

  dayMeta: {
    color: colors.grey,
    fontSize: 11,
  },
  weekTitle: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },

  weekSub: {
    color: colors.grey,
    fontSize: 11,
    marginTop: 4,
  },

  dayCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  dayTitle: {
    color: colors.white,
    fontSize: 12,
  },

  dayText: {
    color: colors.grey,
    fontSize: 11,
    marginTop: 2,
  },
  /* Tab switcher */
  tabWrap: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginBottom: 15,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    position: 'relative', // ✅ IMPORTANT
    zIndex: 1,
  },
  tabBtnActive: { borderColor: 'rgba(143,175,120,0.4)' },
  tabText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  tabTextActive: {
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
  },
  scroll: { padding: 18, paddingTop: 16, paddingBottom: 48 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 4,
  },
  cardSub: {
    color: colors.grey,
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 14,
  },
  /* Session button */
  sessionBtn: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  sessionBtnStop: {},
  sessionBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  infoValue: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },

  statsStrip: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
  },
  statLbl: {
    color: colors.grey,
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 3,
  },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)' },

  /* Photos */
  photosRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  photoWrap: { flex: 1, alignItems: 'center' },
  photo: { width: '100%', height: 130, borderRadius: 12 },
  photoLabel: {
    color: colors.grey,
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 6,
  },

  /* Manual entry */
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 12,
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
