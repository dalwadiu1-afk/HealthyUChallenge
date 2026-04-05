import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Button, Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';

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

        <Button title="Start Training" />
      </ScrollView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
    backgroundColor: colors.primary,
  },

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
    fontFamily: fontFamily.montserratBold,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  workoutTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontFamily: fontFamily.montserratBold,
  },

  uploadBox: {
    height: 140,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },

  uploadText: {
    color: '#999',
    fontSize: 13,
    fontFamily: fontFamily.montserratBold,
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  timestamp: {
    marginTop: 6,
    fontSize: 12,
    color: '#555',
    fontFamily: fontFamily.montserratBold,
  },

  button: {
    marginTop: 20,
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
