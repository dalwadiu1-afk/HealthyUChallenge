// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   FlatList,
// } from 'react-native';

// import { Button, Header, Wrapper } from '../../../components';
// import { colors, fontFamily } from '../../../constant';

// // 🍎 Fruit Data (serving sizes)
// const FRUITS = [
//   { name: 'Apple', serving: '1 medium (182g)' },
//   { name: 'Banana', serving: '1 medium (118g)' },
//   { name: 'Orange', serving: '1 medium (131g)' },
//   { name: 'Strawberries', serving: '1 cup (150g)' },
//   { name: 'Grapes', serving: '1 cup (92g)' },
//   { name: 'Mango', serving: '1 cup sliced (165g)' },
// ];

// export default function FruitTrackerUI() {
//   const [selectedFruit, setSelectedFruit] = useState(null);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [image, setImage] = useState(null);

//   const [logs, setLogs] = useState([]);

//   // 🔥 MOCK image (replace with your picker)
//   const pickImage = () => {
//     setImage('https://images.unsplash.com/photo-1567306226416-28f0efdc88ce');
//   };

//   const addLog = () => {
//     if (!selectedFruit) return;

//     const newLog = {
//       id: Date.now().toString(),
//       fruit: selectedFruit.name,
//       serving: selectedFruit.serving,
//       image,
//     };

//     setLogs(prev => [newLog, ...prev]);

//     setSelectedFruit(null);
//     setImage(null);
//   };

//   // ---------------- UI ----------------

//   return (
//     <Wrapper>
//       <Header header="Fruit Tracker 🍎" />

//       <View style={styles.card}>
//         <Text style={styles.title}>Consume 2–3 servings of fruit per day</Text>

//         {/* DROPDOWN */}
//         <TouchableOpacity
//           style={styles.dropdown}
//           onPress={() => setDropdownOpen(!dropdownOpen)}
//         >
//           <Text style={styles.dropdownText}>
//             {selectedFruit ? selectedFruit.name : 'Select Fruit'}
//           </Text>
//         </TouchableOpacity>

//         {/* DROPDOWN LIST */}
//         {dropdownOpen && (
//           <View style={styles.dropdownList}>
//             {FRUITS.map(item => (
//               <TouchableOpacity
//                 key={item.name}
//                 style={styles.option}
//                 onPress={() => {
//                   setSelectedFruit(item);
//                   setDropdownOpen(false);
//                 }}
//               >
//                 <Text style={styles.optionText}>{item.name}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}

//         {/* SERVING INFO */}
//         {selectedFruit && (
//           <Text style={styles.serving}>
//             1 Serving = {selectedFruit.serving}
//           </Text>
//         )}

//         {/* IMAGE */}
//         <TouchableOpacity style={styles.upload} onPress={pickImage}>
//           <Text style={styles.uploadText}>
//             {image ? 'Change Photo' : 'Upload Photo'}
//           </Text>
//         </TouchableOpacity>

//         {image && <Image source={{ uri: image }} style={styles.image} />}

//         <Button
//           title="Log Serving"
//           onPress={addLog}
//           buttonStyle={{ marginTop: 15 }}
//         />
//       </View>

//       {/* LOG LIST */}
//       <Text style={styles.sectionTitle}>Today’s Servings</Text>

//       <FlatList
//         data={logs}
//         keyExtractor={i => i.id}
//         renderItem={({ item }) => (
//           <View style={styles.logCard}>
//             {item.image && (
//               <Image source={{ uri: item.image }} style={styles.logImg} />
//             )}
//             <View>
//               <Text style={styles.logTitle}>{item.fruit}</Text>
//               <Text style={styles.logSub}>{item.serving}</Text>
//             </View>
//           </View>
//         )}
//       />
//     </Wrapper>
//   );
// }

// // ---------------- STYLES ----------------

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: 'rgba(143, 175, 120,0.16)',
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 15,
//   },

//   title: {
//     fontSize: 16,
//     fontFamily: fontFamily.montserratBold,
//     marginBottom: 10,
//     color: colors.white,
//   },

//   dropdown: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     padding: 12,
//     borderRadius: 10,
//   },

//   dropdownText: {
//     fontFamily: fontFamily.montserratMedium,
//     color: colors.white,
//   },

//   dropdownList: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginTop: 5,
//     borderWidth: 1,
//     borderColor: '#eee',
//   },

//   option: {
//     padding: 12,
//   },

//   optionText: {
//     fontFamily: fontFamily.montserratMedium,
//   },

//   serving: {
//     marginTop: 10,
//     color: colors.white,
//     fontFamily: fontFamily.montserratSemiBold,
//   },

//   upload: {
//     marginTop: 15,
//     padding: 12,
//     backgroundColor: '#eee',
//     borderRadius: 10,
//     alignItems: 'center',
//   },

//   uploadText: {
//     fontFamily: fontFamily.montserratMedium,
//   },

//   image: {
//     height: 120,
//     borderRadius: 10,
//     marginTop: 10,
//   },

//   sectionTitle: {
//     marginVertical: 10,
//     fontSize: 16,
//     fontFamily: fontFamily.montserratBold,
//     color: colors.white,
//   },

//   logCard: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 10,
//     alignItems: 'center',
//   },

//   logImg: {
//     width: 60,
//     height: 60,
//     borderRadius: 10,
//     marginRight: 10,
//   },

//   logTitle: {
//     fontFamily: fontFamily.montserratSemiBold,
//   },

//   logSub: {
//     color: '#666',
//     fontSize: 12,
//   },
// });
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';
import { launchCamera } from 'react-native-image-picker';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';
import { Header, Wrapper } from '../../../components';

const DAILY_GOAL = 3;

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

export default function FruitTrackerUI({ navigation }) {
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [logs, setLogs] = useState([]);

  const pickPhoto = async () => {
    const granted = await requestCameraPermission();
    if (!granted) return;
    launchCamera({ mediaType: 'photo', quality: 0.7 }, res => {
      if (res.assets?.length > 0) setPhoto(res.assets[0].uri);
    });
  };

  const addLog = () => {
    if (!selectedFruit) return;
    setLogs(prev => [
      {
        id: Date.now().toString(),
        fruit: selectedFruit.name,
        serving: selectedFruit.serving,
        emoji: selectedFruit.emoji,
        photo,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
      ...prev,
    ]);
    setSelectedFruit(null);
    setPhoto(null);
  };

  const todayCount = logs.length;
  const progress = Math.min(todayCount / DAILY_GOAL, 1);
  const goalMet = todayCount >= DAILY_GOAL;

  return (
    <View style={styles.root}>
      <Header
        header={'🍎 Daily Fruit'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />

      {/* <Text style={styles.heroTitle}>🍎 Daily Fruit Tracker</Text> */}
      <Text style={styles.heroSub}>Eat 2–3 servings of fruit every day</Text>

      {/* Progress bar */}
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
      <Wrapper isForgot safeAreaPops={{ edges: ['bottom'] }}>
        {/* Goal banner */}
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
            {FRUITS.map(f => (
              <TouchableOpacity
                key={f.name}
                style={[
                  styles.fruitChip,
                  selectedFruit?.name === f.name && styles.fruitChipActive,
                ]}
                onPress={() => setSelectedFruit(f)}
                activeOpacity={0.8}
              >
                <Text style={styles.fruitEmoji}>{f.emoji}</Text>
                <Text
                  style={[
                    styles.fruitName,
                    selectedFruit?.name === f.name && styles.fruitNameActive,
                  ]}
                >
                  {f.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Serving info */}
          {selectedFruit && (
            <View style={styles.servingRow}>
              <Text style={styles.servingLabel}>1 Serving =</Text>
              <Text style={styles.servingValue}>{selectedFruit.serving}</Text>
            </View>
          )}

          {/* Photo */}
          <TouchableOpacity
            style={[styles.photoBtn, photo && styles.photoBtnFilled]}
            onPress={pickPhoto}
            activeOpacity={0.8}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoImg} />
            ) : (
              <View style={styles.photoBtnInner}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
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
                <Text style={styles.photoBtnText}>Add Photo (optional)</Text>
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

        {/* Today's log */}
        {logs.length > 0 && (
          <>
            <Text style={styles.logTitle}>Today's Servings</Text>
            {logs.map(item => (
              <View key={item.id} style={styles.logCard}>
                {item.photo ? (
                  <Image source={{ uri: item.photo }} style={styles.logImg} />
                ) : (
                  <View style={styles.logEmojiBox}>
                    <Text style={styles.logEmoji}>{item.emoji}</Text>
                  </View>
                )}
                <View style={styles.logInfo}>
                  <Text style={styles.logFruit}>{item.fruit}</Text>
                  <Text style={styles.logServing}>{item.serving}</Text>
                </View>
                <Text style={styles.logTime}>{item.time}</Text>
              </View>
            ))}
          </>
        )}
      </Wrapper>
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
  progressFill: { height: '100%', borderRadius: 6 },
  progressLabel: {
    color: colors.grey,
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
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
});
