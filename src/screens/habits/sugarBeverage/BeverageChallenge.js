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

export default function BeverageChallengeUI({ navigation }) {
  const [photo, setPhoto] = useState(null);
  const [label, setLabel] = useState('');
  const [timestamp, setTimestamp] = useState('');

  const handleCamera = async () => {
    const granted = await requestCameraPermission();
    if (!granted) return;
    launchCamera({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel || response.errorCode) return;
      const uri = response?.assets?.[0]?.uri;
      if (!uri) return;
      setPhoto(uri);
      setTimestamp(new Date().toLocaleString());
    });
  };

  const handlePost = () => {
    if (!photo) {
      Alert.alert('Please upload a photo 📸');
      return;
    }
    if (!label.trim()) {
      Alert.alert('Add a label for your drink 🏷');
      return;
    }
    Alert.alert('Posted to Social Tab 🎉');
    setPhoto(null);
    setLabel('');
    setTimestamp('');
  };

  const isReady = !!(photo && label.trim());

  return (
    <View style={styles.root}>
      <Header
        header={'Healthy Beverage'}
        headerContainer={{
          marginTop: StatusBar.currentHeight,
          paddingHorizontal: 24,
        }}
      />
      <View style={{ marginVertical: 10 }}>
        <Text style={styles.heroTitle}>🍹 No-Sugar Beverage Challenge</Text>
        <Text style={styles.heroSub}>
          Create your own healthy, no-added-sugar drink combo and share it
        </Text>
      </View>
      <Wrapper isForgot safeAreaPops={{ edges: ['bottom'] }}>
        {/* Photo section */}
        <TouchableOpacity
          style={[styles.photoBox, photo && styles.photoBoxFilled]}
          onPress={handleCamera}
          activeOpacity={0.85}
        >
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                  stroke="rgba(143,175,120,0.6)"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle
                  cx={12}
                  cy={13}
                  r={4}
                  stroke="rgba(143,175,120,0.6)"
                  strokeWidth={1.6}
                />
              </Svg>
              <Text style={styles.photoPlaceholderText}>
                Tap to photograph your drink
              </Text>
            </View>
          )}
          {photo && (
            <View style={styles.retakeOverlay}>
              <Text style={styles.retakeOverlayText}>Tap to retake</Text>
            </View>
          )}
        </TouchableOpacity>

        {timestamp ? <Text style={styles.timestamp}>⏱ {timestamp}</Text> : null}

        {/* Label input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Beverage Name</Text>
          <TextInput
            placeholder="e.g. Mint Lemon Detox, Green Ginger Splash…"
            value={label}
            onChangeText={setLabel}
            placeholderTextColor="rgba(255,255,255,0.25)"
            style={styles.input}
          />
        </View>

        {/* Preview */}
        {isReady && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Post Preview</Text>
            <View style={styles.previewRow}>
              <Image source={{ uri: photo }} style={styles.previewThumb} />
              <View style={styles.previewText}>
                <Text style={styles.previewName}>{label}</Text>
                <Text style={styles.previewTime}>{timestamp}</Text>
                <View style={styles.hashPill}>
                  <Text style={styles.hashText}>#beverage #healthydrinks</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Post button */}
        <TouchableOpacity
          style={[styles.postBtn, !isReady && styles.postBtnDisabled]}
          onPress={handlePost}
          activeOpacity={0.85}
        >
          {isReady && (
            <GradientBg
              id="postGrad"
              c1="#6A9455"
              c2="#3A5A2A"
              r={14}
              horizontal
            />
          )}
          <Svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginRight: 8 }}
          >
            <Path
              d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
              stroke={isReady ? '#fff' : 'rgba(255,255,255,0.3)'}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text
            style={[styles.postBtnText, !isReady && styles.postBtnTextDisabled]}
          >
            Post to Social Tab
          </Text>
        </TouchableOpacity>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Healthy Drink Ideas</Text>
          {[
            'Infused water with lemon & mint',
            'Green tea with honey & ginger',
            'Cucumber & lime sparkling water',
            'Cold brew hibiscus tea (unsweetened)',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
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
    fontSize: 20,
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
    lineHeight: 20,
  },

  scroll: { padding: 18, paddingTop: 16, paddingBottom: 48 },

  photoBox: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.25)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 10,
  },
  photoBoxFilled: {
    borderStyle: 'solid',
    borderColor: 'rgba(143,175,120,0.3)',
  },
  photo: { width: '100%', height: 200 },
  photoPlaceholder: {
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(143,175,120,0.04)',
  },
  photoPlaceholderText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  retakeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  retakeOverlayText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },

  timestamp: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 14,
  },

  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 14,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
  },

  /* Preview */
  previewCard: {
    backgroundColor: 'rgba(143,175,120,0.06)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    padding: 16,
    marginBottom: 14,
  },
  previewTitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  previewRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  previewThumb: { width: 72, height: 72, borderRadius: 12 },
  previewText: { flex: 1 },
  previewName: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 3,
  },
  previewTime: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 8,
  },
  hashPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(90,150,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(90,150,255,0.3)',
  },
  hashText: {
    color: '#60a5fa',
    fontSize: 10,
    fontFamily: fontFamily.montserratMedium,
  },

  /* Post button */
  postBtn: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 18,
  },
  postBtnDisabled: { borderColor: 'rgba(255,255,255,0.06)' },
  postBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
  postBtnTextDisabled: { color: 'rgba(255,255,255,0.3)' },

  /* Tips */
  tipsCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
  },
  tipsTitle: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
  },
  tipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    flex: 1,
  },
});
