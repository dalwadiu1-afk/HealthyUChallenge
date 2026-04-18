// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   FlatList,
// } from 'react-native';

// import { Button, Header, Wrapper } from '../../../components';
// import { colors, fontFamily } from '../../../constant';

// export default function FutureIdeasUI() {
//   const [idea, setIdea] = useState('');
//   const [image, setImage] = useState(null);
//   const [ideas, setIdeas] = useState([]);

//   // 🔥 mock image picker
//   const pickImage = () => {
//     setImage('https://images.unsplash.com/photo-1521737604893-d14cc237f11d');
//   };

//   const submitIdea = () => {
//     if (!idea) return;

//     const newIdea = {
//       id: Date.now().toString(),
//       text: idea,
//       image,
//       time: new Date().toLocaleString(),
//     };

//     setIdeas(prev => [newIdea, ...prev]);

//     setIdea('');
//     setImage(null);
//   };

//   return (
//     <Wrapper>
//       <Header header="Future Ideas 💡" />

//       {/* INPUT CARD */}
//       <View style={styles.card}>
//         <Text style={styles.title}>Share your ideas for the future</Text>

//         <TextInput
//           placeholder="Type your idea... (e.g. new feature, product, app idea)"
//           value={idea}
//           onChangeText={setIdea}
//           style={styles.input}
//           multiline
//           placeholderTextColor={colors.white}
//         />

//         {/* IMAGE UPLOAD */}
//         <TouchableOpacity style={styles.upload} onPress={pickImage}>
//           <Text style={styles.uploadText}>
//             {image ? 'Change Image' : 'Upload Image (Optional)'}
//           </Text>
//         </TouchableOpacity>

//         {image && <Image source={{ uri: image }} style={styles.image} />}

//         <Button
//           title="Submit Idea"
//           onPress={submitIdea}
//           buttonStyle={{ marginTop: 15 }}
//         />
//       </View>

//       {/* LIST */}
//       <Text style={styles.sectionTitle}>Community Ideas</Text>

//       <FlatList
//         data={ideas}
//         keyExtractor={i => i.id}
//         renderItem={({ item }) => (
//           <View style={styles.ideaCard}>
//             {item.image && (
//               <Image source={{ uri: item.image }} style={styles.ideaImg} />
//             )}

//             <View style={{ flex: 1 }}>
//               <Text style={styles.ideaText}>{item.text}</Text>
//               <Text style={styles.time}>{item.time}</Text>
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
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 15,
//   },

//   title: {
//     fontSize: 16,
//     fontFamily: fontFamily.montserratBold,
//     marginBottom: 10,
//     color: colors.white,
//   },

//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 12,
//     minHeight: 80,
//     textAlignVertical: 'top',
//     fontFamily: fontFamily.montserratMedium,
//   },

//   upload: {
//     marginTop: 12,
//     padding: 12,
//     backgroundColor: '#eee',
//     borderRadius: 10,
//     alignItems: 'center',
//   },

//   uploadText: {
//     fontFamily: fontFamily.montserratMedium,
//     color: '#555',
//   },

//   image: {
//     height: 140,
//     borderRadius: 10,
//     marginTop: 10,
//   },

//   sectionTitle: {
//     marginVertical: 10,
//     fontSize: 16,
//     fontFamily: fontFamily.montserratBold,
//     color: colors.white,
//   },

//   ideaCard: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 10,
//     alignItems: 'center',
//   },

//   ideaImg: {
//     width: 60,
//     height: 60,
//     borderRadius: 10,
//     marginRight: 10,
//   },

//   ideaText: {
//     fontSize: 14,
//     fontFamily: fontFamily.montserratSemiBold,
//   },

//   time: {
//     fontSize: 11,
//     color: '#888',
//     marginTop: 4,
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

export default function FutureIdeasUI({ navigation }) {
  const [goalText, setGoalText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [goals, setGoals] = useState([]);

  const pickPhoto = async () => {
    const granted = await requestCameraPermission();
    if (!granted) return;
    launchCamera({ mediaType: 'photo', quality: 0.7 }, res => {
      if (res.assets?.length > 0) setPhoto(res.assets[0].uri);
    });
  };

  const submitGoal = () => {
    if (!goalText.trim()) return;
    setGoals(prev => [
      {
        id: Date.now().toString(),
        text: goalText.trim(),
        photo,
        time: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      },
      ...prev,
    ]);
    setGoalText('');
    setPhoto(null);
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
          <Text style={styles.headerTitle}>Custom Goal</Text>
          <View style={{ width: 44 }} />
        </View>
        <Text style={styles.heroTitle}>💡 Add Your Personal Goal</Text>
        <Text style={styles.heroSub}>
          Set your own health goals and track your journey your way
        </Text>

        {/* Count badge */}
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
        {/* Input card */}
        <View style={styles.inputCard}>
          <Text style={styles.inputCardTitle}>New Goal</Text>
          <Text style={styles.inputCardSub}>
            What health habit do you want to build?
          </Text>

          <TextInput
            placeholder="e.g. Drink 8 glasses of water daily, meditate for 10 minutes…"
            value={goalText}
            onChangeText={setGoalText}
            placeholderTextColor="rgba(255,255,255,0.2)"
            style={styles.textArea}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Optional photo */}
          <TouchableOpacity
            style={[styles.photoBtn, photo && styles.photoBtnFilled]}
            onPress={pickPhoto}
            activeOpacity={0.8}
          >
            {photo ? (
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
                <Text style={styles.photoBtnText}>
                  Add Inspiration Photo (optional)
                </Text>
              </View>
            )}
          </TouchableOpacity>

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

        {/* Goals list */}
        {goals.length > 0 && (
          <>
            <Text style={styles.listLabel}>Your Goals</Text>
            {goals.map((item, idx) => (
              <View key={item.id} style={styles.goalCard}>
                <View style={styles.goalCardHeader}>
                  <View style={styles.goalNumBadge}>
                    <Text style={styles.goalNumText}>{goals.length - idx}</Text>
                  </View>
                  <Text style={styles.goalTime}>{item.time}</Text>
                </View>
                {item.photo && (
                  <Image source={{ uri: item.photo }} style={styles.goalImg} />
                )}
                <Text style={styles.goalText}>{item.text}</Text>
              </View>
            ))}
          </>
        )}

        {goals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptySub}>
              Add your first personal health goal above to get started
            </Text>
          </View>
        )}
      </ScrollView>
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

  scroll: { padding: 18, paddingTop: 16, paddingBottom: 48 },

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
});
