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

export default function FitnessClassUI() {
  const [photos, setPhotos] = useState([null, null, null, null]);

  const handleUpload = index => {
    // 👉 Replace with Image Picker logic later
    const dummyImage =
      'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg';

    const updated = [...photos];
    updated[index] = dummyImage;
    setPhotos(updated);
  };

  return (
    <Wrapper containerStyle={{ paddingHorizontal: 0 }}>
      <Header header="WorkOut Session" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🏋️ Weekly Fitness Class</Text>
        <Text style={styles.subtitle}>
          Complete 4 workouts and upload your proof
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
          </View>
        ))}

        <Button title="Join Weekly Fitness Class" />
      </ScrollView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
    color: '#777',
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
    fontWeight: '600',
    marginBottom: 10,
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
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
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
