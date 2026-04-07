import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';

const TOTAL_DAYS = 28;

const HalfPlateFruitsVeggies = () => {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pickImage = async index => {
    const granted = await requestCameraPermission();
    if (!granted) return;

    launchCamera({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) return;

      if (response?.assets?.length > 0) {
        const newPhotos = [...photos];

        newPhotos[index] = {
          uri: response.assets[0].uri,
          timestamp: new Date().toLocaleString(),
        };

        setPhotos(newPhotos);

        if (index === currentIndex && currentIndex < TOTAL_DAYS - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      }
    });
  };

  const deletePhoto = index => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);

    // Move progress back if deleting latest
    if (index === currentIndex - 1) {
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const renderItem = ({ index }) => {
    const item = photos[index];
    const isLocked = index > currentIndex;

    return (
      <View style={styles.card}>
        <Text style={styles.mealLabel}>Day {index + 1}</Text>

        {item ? (
          <>
            <Image source={{ uri: item.uri }} style={styles.photo} />
            <Text style={styles.timeText}>{item.timestamp}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => pickImage(index)}>
                <Text style={styles.retake}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deletePhoto(index)}>
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.uploadBtn, isLocked && { backgroundColor: '#ccc' }]}
            disabled={isLocked}
            onPress={() => pickImage(index)}
          >
            <Text style={styles.uploadText}>
              {isLocked ? '🔒 Locked' : 'Upload Photo'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const completed = photos.filter(p => p).length;
  const progress = (completed / TOTAL_DAYS) * 100;

  return (
    <Wrapper>
      <Header header="" />

      <View style={styles.container}>
        <Text style={styles.title}>🥗 Half Plate Fruits & Veggies</Text>

        {/* ✅ Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completed}/{TOTAL_DAYS} completed
          </Text>
        </View>

        <FlatList
          data={Array.from({ length: TOTAL_DAYS })}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  title: {
    fontSize: 22,
    marginVertical: 8,
    textAlign: 'center',
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
  },

  progressContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

  progressBarBg: {
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 10,
  },

  progressFill: {
    height: 10,
    backgroundColor: '#4caf50',
    borderRadius: 10,
  },

  progressText: {
    textAlign: 'center',
    marginTop: 6,
    color: colors.white,
    fontSize: 12,
  },

  card: {
    flex: 1,
    marginBottom: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
  },

  mealLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  uploadBtn: {
    width: '100%',
    height: 120,
    backgroundColor: '#d3f4d1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  uploadText: {
    color: '#2d6a4f',
    fontWeight: 'bold',
  },

  photo: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },

  timeText: {
    marginTop: 6,
    fontSize: 12,
    color: '#555',
  },

  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },

  retake: {
    color: '#007bff',
    fontWeight: '600',
  },

  delete: {
    color: 'red',
    fontWeight: '600',
  },
});

export default HalfPlateFruitsVeggies;
