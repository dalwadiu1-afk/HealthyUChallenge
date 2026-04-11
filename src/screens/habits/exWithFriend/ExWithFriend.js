import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Share from 'react-native-share';

import { Button, Header, Wrapper } from '../../../components';
import { fontFamily } from '../../../constant';

export default function FriendWorkoutChallenge() {
  const [entries, setEntries] = useState([
    { photo: null, friend: '', timestamp: '' },
    { photo: null, friend: '', timestamp: '' },
    { photo: null, friend: '', timestamp: '' },
    { photo: null, friend: '', timestamp: '' },
  ]);

  // 📸 TAKE PHOTO
  const handleCamera = index => {
    launchCamera({ mediaType: 'photo' }, response => {
      if (response.didCancel || response.errorCode) return;

      const uri = response.assets[0].uri;

      const updated = [...entries];
      updated[index].photo = uri;
      updated[index].timestamp = new Date().toLocaleString();

      setEntries(updated);
    });
  };

  // 👤 FRIEND INPUT
  const handleFriendChange = (index, name) => {
    const updated = [...entries];
    updated[index].friend = name;
    setEntries(updated);
  };

  // 🚀 SHARE FUNCTION (FIXED IMAGE ISSUE)
  const handleShare = async index => {
    const item = entries[index];

    if (!item.photo) {
      Alert.alert('Please take a photo first 📸');
      return;
    }

    if (!item.friend) {
      Alert.alert('Enter your friend name 👤');
      return;
    }

    // 🔥 CAPTIONS
    const captions = [
      `💪 Workout with ${item.friend}!\n⏱ ${item.timestamp}\n🔥 No excuses today!\n\n#WorkoutWithFriend`,
      `🏋️‍♂️ Stronger together with ${item.friend}!\n⏱ ${item.timestamp}\n💯 Keep pushing!\n\n#FitnessLife`,
      `👊 ${item.friend} and I showed up!\n⏱ ${item.timestamp}\n🚀 Progress!\n\n#NoDaysOff`,
    ];

    const message = captions[Math.floor(Math.random() * captions.length)];

    try {
      let imagePath = item.photo;

      // ⚠️ Android fix (important)
      if (Platform.OS === 'android' && !imagePath.startsWith('file://')) {
        imagePath = 'file://' + imagePath;
      }

      await Share.open({
        message,
        url: imagePath,
        type: 'image/jpeg',
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Wrapper>
      <Header header="Workout with a Friend 💪" />

      <ScrollView>
        {entries.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.title}>Workout #{index + 1}</Text>

            {/* 📸 PHOTO */}
            <TouchableOpacity
              style={styles.imageBox}
              onPress={() => handleCamera(index)}
            >
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.image} />
              ) : (
                <Text style={{ color: '#666' }}>📸 Take Photo</Text>
              )}
            </TouchableOpacity>

            {/* ⏱ TIMESTAMP */}
            {item.timestamp ? (
              <Text style={styles.timestamp}>⏱ {item.timestamp}</Text>
            ) : null}

            {/* 👤 FRIEND INPUT */}
            <TextInput
              placeholder="Enter friend's name"
              value={item.friend}
              onChangeText={text => handleFriendChange(index, text)}
              style={styles.input}
            />

            {/* 🚀 SHARE BUTTON */}
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() => handleShare(index)}
            >
              <Text style={styles.shareText}>🚀 Share & Tag Friend</Text>
            </TouchableOpacity>

            {/* 💡 HINT */}
            <Text style={styles.hint}>
              After sharing, tag your friend on Instagram
            </Text>
          </View>
        ))}

        <Button title="Submit Challenge" />
      </ScrollView>
    </Wrapper>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 14,
    borderRadius: 14,
  },

  title: {
    fontSize: 14,
    marginBottom: 10,
    fontFamily: fontFamily?.montserratSemiBold,
  },

  imageBox: {
    height: 140,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
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
    color: '#666',
  },

  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
  },

  shareBtn: {
    marginTop: 10,
    backgroundColor: '#e0f2fe',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  shareText: {
    color: '#0284c7',
    fontFamily: fontFamily?.montserratMedium,
  },

  hint: {
    marginTop: 6,
    fontSize: 11,
    color: '#888',
  },
});
