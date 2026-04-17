import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { Button, Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';
import InputBox from '../../../components/common/InputBox';
import { AuthBtn } from '../../../components/common/authBtn';

export default function BeverageChallengeUI() {
  const [photo, setPhoto] = useState(null);
  const [label, setLabel] = useState('');
  const [timestamp, setTimestamp] = useState('');

  // 📸 TAKE PHOTO
  const handleCamera = () => {
    launchCamera({ mediaType: 'photo' }, response => {
      if (response.didCancel || response.errorCode) return;

      const uri = response.assets[0].uri;
      setPhoto(uri);
      setTimestamp(new Date().toLocaleString());
    });
  };

  // 🚀 POST TO SOCIAL TAB
  const handlePost = () => {
    if (!photo) {
      Alert.alert('Please upload a photo 📸');
      return;
    }

    if (!label) {
      Alert.alert('Add a label for your drink 🏷');
      return;
    }

    const postData = {
      image: photo,
      caption: `${label}\n⏱ ${timestamp}\n#beverage`,
    };

    console.log('Posting to Social Tab:', postData);

    Alert.alert('Posted to Social Tab 🎉');

    // reset
    setPhoto(null);
    setLabel('');
    setTimestamp('');
  };

  return (
    <Wrapper>
      <Header header="No Sugar Beverage 🍹" />

      <ScrollView>
        <View style={styles.card}>
          {/* 📸 IMAGE */}
          <TouchableOpacity style={styles.imageBox} onPress={handleCamera}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.image} />
            ) : (
              <Text
                style={{
                  color: colors.white,
                  fontFamily: fontFamily.montserratMedium,
                }}
              >
                📸 Upload Beverage Photo
              </Text>
            )}
          </TouchableOpacity>

          {/* ⏱ TIMESTAMP */}
          {timestamp ? (
            <Text style={styles.timestamp}>⏱ {timestamp}</Text>
          ) : null}

          {/* 🏷 LABEL INPUT */}
          <InputBox
            placeholder="Name your beverage (e.g. Mint Lemon Detox)"
            value={label}
            onChangeText={setLabel}
            style={styles.input}
          />

          {/* 👀 PREVIEW */}
          {photo && label ? (
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>Preview Post</Text>
              <Text style={styles.previewText}>{label}</Text>
              <Text style={styles.previewText}>⏱ {timestamp}</Text>
              <Text style={styles.previewHash}>#beverage</Text>
            </View>
          ) : null}

          {/* 🚀 POST */}
          <AuthBtn
            btnStyle={{ marginTop: 10 }}
            title="Post to Social Tab"
            onPress={handlePost}
          />
        </View>
      </ScrollView>
    </Wrapper>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(143, 175, 120,0.16)',
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
  },

  imageBox: {
    height: 160,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(143, 175, 120,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  timestamp: {
    marginTop: 8,
    fontSize: 12,
    color: colors.white,
  },

  input: {
    borderRadius: 10,
    paddingHorizontal: 10,
    fontFamily: fontFamily.montserratMedium,
    height: 50,
  },

  preview: {
    marginTop: 14,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
  },

  previewTitle: {
    fontSize: 13,
    marginBottom: 6,
    fontFamily: fontFamily?.montserratSemiBold,
  },

  previewText: {
    fontSize: 12,
    color: colors.white,
  },

  previewHash: {
    fontSize: 12,
    color: '#0284c7',
    marginTop: 4,
  },
});
