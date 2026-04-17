import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Button, Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';
import { AuthBtn } from '../../../components/common/authBtn';

const { height } = Dimensions.get('window');

export default function WeightTrainingUI() {
  const [photos, setPhotos] = useState(Array(8).fill(null));

  const handleUpload = index => {
    // 👉 Replace with Image Picker logic later
    const dummyImage =
      'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg';

    const updated = [...photos];
    updated[index] = dummyImage;
    setPhotos(updated);
  };

  return (
    <Wrapper>
      <Header header="Weight Resistance Training" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🏋️ Weight Training Sessions</Text>
        <Text style={styles.subtitle}>
          Complete at least 2 workouts per week and upload your proof
        </Text>

        {photos.map((photo, index) => (
          <View key={index} style={styles.card}>
            {/* Workout Title */}
            <Text style={styles.workoutTitle}>
              📸 I’m at workout #{index + 1}!
            </Text>

            {/* Upload Box */}
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => handleUpload(index)}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={styles.image} />
              ) : (
                <Text style={styles.uploadText}>+ Upload Photo</Text>
              )}
            </TouchableOpacity>

            {photo && (
              <Text style={styles.timestamp}>
                Uploaded: {new Date().toLocaleString()}
              </Text>
            )}
          </View>
        ))}

        <AuthBtn title="Start Training" />
      </ScrollView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {},

  title: {
    fontSize: 22,
    marginBottom: 5,
    color: colors.white,
    fontFamily: fontFamily.montserratBold,
  },

  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
  },

  card: {
    backgroundColor: 'rgba(143, 175, 120,0.16)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  workoutTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
  },

  uploadBox: {
    height: height * 0.15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.outline,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(143, 175, 120,0.16)',
  },

  uploadText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  timestamp: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fontFamily.montserratSemiBold,
  },

  button: {
    marginTop: 20,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
