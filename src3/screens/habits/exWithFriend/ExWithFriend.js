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
import { launchCamera } from 'react-native-image-picker';
import Share from 'react-native-share';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';

function GradientBg({ id, c1, c2, r = 20 }) {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={c1} stopOpacity="1" />
          <Stop offset="1" stopColor={c2} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} rx={r} />
    </Svg>
  );
}

function CameraIcon({ size = 24, color = 'rgba(143,175,120,0.7)' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={13} r={4} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

const CAPTIONS = (friend, timestamp) => [
  `💪 Workout with ${friend}!\n⏱ ${timestamp}\n🔥 No excuses today!\n\n#WorkoutWithFriend`,
  `🏋️‍♂️ Stronger together with ${friend}!\n⏱ ${timestamp}\n💯 Keep pushing!\n\n#FitnessLife`,
  `👊 ${friend} and I showed up!\n⏱ ${timestamp}\n🚀 Progress!\n\n#NoDaysOff`,
];

export default function FriendWorkoutChallenge({ navigation }) {
  const [entries, setEntries] = useState([
    { photo: null, friend: '', timestamp: '' },
    { photo: null, friend: '', timestamp: '' },
    { photo: null, friend: '', timestamp: '' },
    { photo: null, friend: '', timestamp: '' },
  ]);

  const handleCamera = async index => {
    const granted = await requestCameraPermission();
    if (!granted) return;

    launchCamera({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel || response.errorCode) return;
      const uri = response?.assets?.[0]?.uri;
      if (!uri) return;

      setEntries(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          photo: uri,
          timestamp: new Date().toLocaleString(),
        };
        return updated;
      });
    });
  };

  const handleFriendChange = (index, name) => {
    setEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], friend: name };
      return updated;
    });
  };

  const handleShare = async index => {
    const item = entries[index];
    if (!item.photo) {
      Alert.alert('Please take a photo first 📸');
      return;
    }
    if (!item.friend.trim()) {
      Alert.alert("Enter your friend's name 👤");
      return;
    }

    const caps = CAPTIONS(item.friend, item.timestamp);
    const message = caps[Math.floor(Math.random() * caps.length)];

    try {
      let imagePath = item.photo;
      if (Platform.OS === 'android' && !imagePath.startsWith('file://')) {
        imagePath = 'file://' + imagePath;
      }
      await Share.open({ message, url: imagePath, type: 'image/jpeg' });
    } catch (error) {
      console.log(error);
    }
  };

  const completedCount = entries.filter(e => e.photo && e.friend.trim()).length;

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Hero */}
      <View style={styles.heroBg}>
        <GradientBg id="friendHero" c1="#2D4A25" c2="#161D15" r={0} />
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
          <Text style={styles.headerTitle}>Workout with a Friend</Text>
          <View style={{ width: 44 }} />
        </View>

        <Text style={styles.heroTitle}>💪 Friend Workout Challenge</Text>
        <Text style={styles.heroSub}>
          Complete 4 workouts with a friend, take a photo & share each session
        </Text>

        {/* Progress dots */}
        <View style={styles.progressDots}>
          {entries.map((e, i) => {
            const done = !!(e.photo && e.friend.trim());
            return (
              <View key={i} style={[styles.dot, done && styles.dotDone]}>
                {done ? (
                  <Text style={styles.dotCheck}>✓</Text>
                ) : (
                  <Text style={styles.dotNum}>{i + 1}</Text>
                )}
              </View>
            );
          })}
          <Text style={styles.progressLabel}>{completedCount}/4 done</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {entries.map((item, index) => {
          const done = !!(item.photo && item.friend.trim());
          return (
            <View key={index} style={[styles.card, done && styles.cardDone]}>
              {done && (
                <GradientBg
                  id={`fg${index}`}
                  c1="rgba(77,102,68,0.15)"
                  c2="rgba(45,74,37,0.05)"
                />
              )}

              {/* Card header */}
              <View style={styles.cardHeader}>
                <View style={[styles.numBadge, done && styles.numBadgeDone]}>
                  <Text
                    style={[styles.numText, done && { color: colors.white }]}
                  >
                    {done ? '✓' : index + 1}
                  </Text>
                </View>
                <Text style={styles.cardTitle}>Workout #{index + 1}</Text>
                {done && (
                  <View style={styles.donePill}>
                    <Text style={styles.donePillText}>Shared</Text>
                  </View>
                )}
              </View>

              {/* Photo section */}
              <TouchableOpacity
                style={[styles.photoBox, item.photo && styles.photoBoxFilled]}
                onPress={() => handleCamera(index)}
                activeOpacity={0.8}
              >
                {item.photo ? (
                  <Image source={{ uri: item.photo }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <CameraIcon size={28} />
                    <Text style={styles.photoPlaceholderText}>
                      Tap to take a photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {item.timestamp ? (
                <Text style={styles.timestamp}>⏱ {item.timestamp}</Text>
              ) : null}

              {/* Friend input */}
              <View style={styles.inputWrap}>
                <Svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: 8 }}
                >
                  <Path
                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Circle
                    cx={12}
                    cy={7}
                    r={4}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={1.8}
                  />
                </Svg>
                <TextInput
                  placeholder="Friend's name"
                  value={item.friend}
                  onChangeText={text => handleFriendChange(index, text)}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  style={styles.friendInput}
                />
              </View>

              {/* Share button */}
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => handleShare(index)}
                activeOpacity={0.85}
              >
                <GradientBg
                  id={`sgr${index}`}
                  c1="#3b6b9e"
                  c2="#1e3a5f"
                  r={49}
                />
                <Svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: 8 }}
                >
                  <Path
                    d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
                    stroke="#ffffff"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.shareText}>Share & Tag Friend</Text>
              </TouchableOpacity>

              <Text style={styles.hint}>
                After sharing, tag your friend on Instagram
              </Text>
            </View>
          );
        })}

        {/* Submit button */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            completedCount < 4 && styles.submitBtnDisabled,
          ]}
          activeOpacity={completedCount < 4 ? 1 : 0.85}
        >
          <Text style={styles.submitText}>
            {completedCount < 4
              ? `Complete ${4 - completedCount} more workout${
                  4 - completedCount > 1 ? 's' : ''
                }`
              : '🎉 Submit Challenge'}
          </Text>
        </TouchableOpacity>
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
    paddingBottom: 16,
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
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
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
    lineHeight: 20,
  },

  /* Progress dots */
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 8,
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotDone: { backgroundColor: colors.primary, borderColor: colors.secondary },
  dotNum: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
  dotCheck: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.montserratBold,
  },
  progressLabel: {
    color: colors.grey,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    marginLeft: 4,
  },

  scroll: { padding: 18, paddingTop: 16, paddingBottom: 48 },

  /* Workout cards */
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardDone: { borderColor: 'rgba(143,175,120,0.3)' },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  numBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
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
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: fontFamily.montserratBold,
  },
  cardTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
  donePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 49,
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.35)',
  },
  donePillText: {
    color: '#60a5fa',
    fontSize: 11,
    fontFamily: fontFamily.montserratSemiBold,
  },

  /* Photo */
  photoBox: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.2)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 10,
  },
  photoBoxFilled: {
    borderStyle: 'solid',
    borderColor: 'rgba(143,175,120,0.3)',
  },
  photo: { width: '100%', height: 160, borderRadius: 14 },
  photoPlaceholder: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(143,175,120,0.04)',
  },
  photoPlaceholderText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },

  timestamp: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 12,
  },

  /* Friend input */
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  friendInput: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
  },

  /* Share button */
  shareBtn: {
    height: 48,
    borderRadius: 49,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shareText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },

  hint: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    textAlign: 'center',
  },

  /* Submit */
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 49,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(77,102,68,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  submitText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    letterSpacing: 0.3,
  },
});
