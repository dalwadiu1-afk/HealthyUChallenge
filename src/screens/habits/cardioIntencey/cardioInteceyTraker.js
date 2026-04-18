// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   TextInput,
//   ScrollView,
//   Dimensions,
// } from 'react-native';
// import { launchCamera } from 'react-native-image-picker';
// import { Button, Header, Wrapper } from '../../../components';
// import { colors, fontFamily } from '../../../constant';

// const { height, width } = Dimensions.get('window');
// export default function CardioTrackerUI() {
//   const [sessionStarted, setSessionStarted] = useState(false);
//   const [startTime, setStartTime] = useState(null);
//   const [endTime, setEndTime] = useState(null);
//   const [selectedTab, setSelectedTab] = useState(true);

//   const [startPhoto, setStartPhoto] = useState(null);
//   const [endPhoto, setEndPhoto] = useState(null);

//   const [manualTime, setManualTime] = useState('');
//   const [manualIntensity, setManualIntensity] = useState('');

//   // 📸 Camera handler
//   const openCamera = async type => {
//     const result = await launchCamera({ mediaType: 'photo' });

//     if (result.assets && result.assets.length > 0) {
//       const uri = result.assets[0].uri;

//       if (type === 'start') setStartPhoto(uri);
//       else setEndPhoto(uri);
//     }
//   };

//   // ▶️ Start session
//   const handleStart = async () => {
//     const now = new Date();
//     setStartTime(now);
//     setSessionStarted(true);

//     await openCamera('start');
//   };

//   // ⏹ Stop session
//   const handleStop = async () => {
//     const now = new Date();
//     setEndTime(now);
//     setSessionStarted(false);

//     await openCamera('end');
//   };

//   // ⏱ Duration (minutes)
//   const getDuration = () => {
//     if (!startTime || !endTime) return 0;
//     return Math.floor((endTime - startTime) / 60000);
//   };

//   // 🔥 Auto Intensity Logic
//   const getIntensity = minutes => {
//     if (minutes >= 30) return 'High';
//     if (minutes >= 15) return 'Medium';
//     return 'Low';
//   };

//   const duration = getDuration();
//   const intensity = getIntensity(duration);

//   return (
//     <Wrapper>
//       <Header header="Cardio Session Tracker" />

//       <View
//         style={{
//           backgroundColor: '#DBD9EC',
//           flexDirection: 'row',
//           alignContent: 'center',
//           borderRadius: 50,
//           overflow: 'hidden',
//           padding: 5,
//         }}
//       >
//         <TouchableOpacity
//           onPress={() => setSelectedTab(true)}
//           style={{
//             ...styles.radioBtn,
//             backgroundColor: selectedTab ? colors.primary : 'transparent',
//           }}
//         >
//           <Text
//             style={{
//               ...styles.tabText,
//               color: selectedTab ? '#DBD9EC' : colors.primary,
//             }}
//           >
//             Time Tracker
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => setSelectedTab(false)}
//           style={{
//             ...styles.radioBtn,

//             backgroundColor: !selectedTab ? colors.primary : 'transparent',
//           }}
//         >
//           <Text
//             style={{
//               ...styles.tabText,
//               color: !selectedTab ? '#DBD9EC' : colors.primary,
//             }}
//           >
//             Manual Entry
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={{ paddingTop: 10 }}>
//         {/* SESSION CARD */}
//         {selectedTab ? (
//           <View>
//             <View style={styles.card}>
//               <Text style={styles.label}>Cardio Session</Text>

//               {!sessionStarted ? (
//                 <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
//                   <Text style={styles.btnText}>▶ Start Cardio</Text>
//                 </TouchableOpacity>
//               ) : (
//                 <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
//                   <Text style={styles.btnText}>⏹ Stop Cardio</Text>
//                 </TouchableOpacity>
//               )}

//               {startTime && (
//                 <Text style={styles.value}>
//                   Start: {startTime.toLocaleTimeString()}
//                 </Text>
//               )}

//               {endTime && (
//                 <Text style={styles.value}>
//                   End: {endTime.toLocaleTimeString()}
//                 </Text>
//               )}

//               {duration > 0 && (
//                 <>
//                   <Text style={styles.value}>Duration: {duration} min</Text>

//                   <Text
//                     style={{
//                       ...styles.value,
//                       color:
//                         intensity === 'High'
//                           ? '#22c55e'
//                           : intensity === 'Low'
//                           ? '#f10505'
//                           : '#e4b005',
//                     }}
//                   >
//                     Intensity: {intensity}
//                   </Text>
//                 </>
//               )}
//             </View>

//             <View style={styles.card}>
//               <Text style={styles.label}>Proof Photos</Text>

//               <View style={styles.imageRow}>
//                 {startPhoto && (
//                   <View>
//                     <Text style={styles.small}>Start</Text>
//                     <Image source={{ uri: startPhoto }} style={styles.image} />
//                   </View>
//                 )}

//                 {endPhoto && (
//                   <View>
//                     <Text style={styles.small}>End</Text>
//                     <Image source={{ uri: endPhoto }} style={styles.image} />
//                   </View>
//                 )}
//               </View>
//             </View>
//           </View>
//         ) : (
//           <View style={styles.card}>
//             <Text style={styles.label}>Manual Entry (Optional)</Text>

//             <TextInput
//               placeholder="Time (minutes)"
//               keyboardType="numeric"
//               value={manualTime}
//               onChangeText={setManualTime}
//               style={styles.input}
//             />

//             <TextInput
//               placeholder="Intensity (Low / Medium / High)"
//               value={manualIntensity}
//               onChangeText={setManualIntensity}
//               style={styles.input}
//             />

//             <Button
//               title="Save Manual Entry"
//               onPress={() =>
//                 alert(`Manual: ${manualTime} min, ${manualIntensity}`)
//               }
//               buttonStyle={{ marginTop: 10 }}
//             />
//           </View>
//         )}

//         {/* LIST TAB */}
//         {selectedTab === 'list' && (
//           <FlatList
//             data={snacks}
//             keyExtractor={item => item.id}
//             renderItem={({ item }) => <SnackCard item={item} />}
//           />
//         )}

//         {/* APPROVED TAB */}
//         {selectedTab === 'approved' && (
//           <FlatList
//             data={approvedSnacks}
//             keyExtractor={item => item.id}
//             renderItem={({ item }) => (
//               <View style={styles.card}>
//                 <Text style={styles.title}>{item.name}</Text>
//                 <Text style={styles.small}>Qty: {item.qty}</Text>

//                 {item.image && (
//                   <Image source={{ uri: item.image }} style={styles.image} />
//                 )}
//               </View>
//             )}
//           />
//         )}
//       </ScrollView>
//     </Wrapper>
//   );
// }

// const styles = StyleSheet.create({
//   tabContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#DBD9EC',
//     borderRadius: 50,
//     padding: 5,
//     marginBottom: 10,
//   },
//   tabBtn: {
//     flex: 1,
//     padding: 10,
//     borderRadius: 50,
//   },
//   activeTab: {
//     backgroundColor: colors.primary,
//   },
//   tabText: {
//     textAlign: 'center',
//     color: colors.primary,
//     fontFamily: fontFamily.montserratBold,
//   },
//   activeText: {
//     color: '#fff',
//   },
//   card: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 14,
//     color: '#666',
//     fontFamily: fontFamily?.montserratMedium,
//   },
//   value: {
//     fontSize: 16,
//     marginTop: 6,
//     fontFamily: fontFamily?.montserratSemiBold,
//   },
//   startBtn: {
//     marginTop: 10,
//     backgroundColor: '#22c55e',
//     padding: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   stopBtn: {
//     marginTop: 10,
//     backgroundColor: '#ef4444',
//     padding: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   btnText: {
//     color: '#fff',
//     fontFamily: fontFamily?.montserratSemiBold,
//   },
//   imageRow: {
//     flexDirection: 'row',
//     gap: 10,
//     marginTop: 10,
//   },
//   image: {
//     width: width / 2.5,
//     height: width / 2.5,
//     borderRadius: 10,
//     marginTop: 5,
//   },
//   small: {
//     fontSize: 12,
//     color: '#888',
//     fontFamily: fontFamily.montserratMedium,
//   },
//   input: {
//     marginTop: 10,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 10,
//     fontSize: 13,
//     fontFamily: fontFamily?.montserratMedium,
//   },
//   radioBtn: {
//     flex: 1,
//     backgroundColor: 'green',
//     padding: 10,
//     borderRadius: 50,
//   },
//   tabText: {
//     textAlign: 'center',
//     fontFamily: fontFamily.montserratBold,
//   },
// });

import React, { useState } from 'react';
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
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { launchCamera } from 'react-native-image-picker';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';
import { Header, Wrapper } from '../../../components';

const { width: SW } = Dimensions.get('window');
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

export default function CardioTrackerUI({ navigation }) {
  const [activeTab, setActiveTab] = useState('timer');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [startPhoto, setStartPhoto] = useState(null);
  const [endPhoto, setEndPhoto] = useState(null);
  const [manualTime, setManualTime] = useState('');
  const [manualIntensity, setManualIntensity] = useState('');
  const [manualSaved, setManualSaved] = useState(false);

  const openCamera = async type => {
    const granted = await requestCameraPermission();
    if (!granted) return;
    launchCamera({ mediaType: 'photo', quality: 0.7 }, result => {
      if (result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        if (type === 'start') setStartPhoto(uri);
        else setEndPhoto(uri);
      }
    });
  };

  const handleStart = async () => {
    setStartTime(new Date());
    setSessionStarted(true);
    await openCamera('start');
  };

  const handleStop = async () => {
    setEndTime(new Date());
    setSessionStarted(false);
    await openCamera('end');
  };

  const duration =
    startTime && endTime ? Math.floor((endTime - startTime) / 60000) : 0;
  const intensity = getIntensity(duration);

  const saveManual = () => {
    if (!manualTime) return;
    setManualSaved(true);
    setTimeout(() => setManualSaved(false), 2000);
  };

  return (
    <View style={styles.root}>
      <Header
        header={'Cardio Tracker'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />
      <Text style={styles.heroTitle}>🏃 Cardio Session Tracker</Text>
      <Text style={styles.heroSub}>Track your workout time and intensity</Text>

      {/* Tab switcher */}
      <View style={styles.tabWrap}>
        {[
          { key: 'timer', label: '⏱ Time Tracker' },
          { key: 'manual', label: '✏️ Manual Entry' },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, activeTab === t.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(t.key)}
            activeOpacity={0.8}
          >
            {activeTab === t.key && (
              <GradientBg
                id={`ct${t.key}`}
                c1="#6A9455"
                c2="#3A5A2A"
                r={12}
                horizontal
              />
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
      <Wrapper orbsRight safeAreaPops={{ edges: ['bottom'] }}>
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
                    {startTime.toLocaleTimeString()}
                  </Text>
                </View>
              )}
              {endTime && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>End</Text>
                  <Text style={styles.infoValue}>
                    {endTime.toLocaleTimeString()}
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
                    <Text style={[styles.statVal, { color: intensity.color }]}>
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
                      <Image source={{ uri: endPhoto }} style={styles.photo} />
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
            <TextInput
              placeholder="Intensity — Low / Medium / High"
              value={manualIntensity}
              onChangeText={setManualIntensity}
              placeholderTextColor="rgba(255,255,255,0.25)"
              style={styles.input}
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
