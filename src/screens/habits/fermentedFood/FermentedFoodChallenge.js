import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';

const TOTAL_DAYS = 7;
const TOTAL_WEEKS = 4;

const FermentedFoodChallenge = () => {
  const [weeks, setWeeks] = useState(
    Array(TOTAL_WEEKS)
      .fill(null)
      .map(() => Array(TOTAL_DAYS).fill(null)),
  );

  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // 📸 Capture Photo
  const pickImage = async dayIndex => {
    if (dayIndex !== currentDayIndex) return;

    const granted = await requestCameraPermission();
    if (!granted) return;

    launchCamera({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel || response.errorCode) return;

      if (response?.assets?.length > 0) {
        const updatedWeeks = [...weeks];

        updatedWeeks[currentWeek][dayIndex] = {
          uri: response.assets[0].uri,
          label: '',
          timestamp: new Date().toLocaleString(),
        };

        setWeeks(updatedWeeks);

        // 👉 Move forward
        if (dayIndex < TOTAL_DAYS - 1) {
          setCurrentDayIndex(prev => prev + 1);
        } else if (currentWeek < TOTAL_WEEKS - 1) {
          setCurrentWeek(prev => prev + 1);
          setCurrentDayIndex(0);
        }
      }
    });
  };

  // 📝 Update label
  const updateLabel = (dayIndex, text) => {
    const updatedWeeks = [...weeks];
    updatedWeeks[currentWeek][dayIndex].label = text;
    setWeeks(updatedWeeks);
  };

  // 🗑️ Delete
  const deletePhoto = dayIndex => {
    const updatedWeeks = [...weeks];
    updatedWeeks[currentWeek][dayIndex] = null;

    setWeeks(updatedWeeks);

    if (dayIndex === currentDayIndex - 1) {
      setCurrentDayIndex(prev => Math.max(prev - 1, 0));
    }
  };

  // 📊 Progress
  const completed = weeks.flat().filter(d => d).length;
  const total = TOTAL_WEEKS * TOTAL_DAYS;

  // 🎨 Render each day
  const renderItem = ({ index }) => {
    const item = weeks[currentWeek][index];
    const isLocked = index > currentDayIndex;
    const isCurrent = index === currentDayIndex;

    return (
      <View style={styles.card}>
        <Text style={styles.dayLabel}>
          Week {currentWeek + 1} - Day {index + 1}
        </Text>

        {item ? (
          <>
            <Image source={{ uri: item.uri }} style={styles.photo} />

            <TextInput
              placeholder="Label (e.g. Yogurt, Kimchi)"
              value={item.label}
              onChangeText={text => updateLabel(index, text)}
              style={styles.input}
            />

            <Text style={styles.time}>{item.timestamp}</Text>

            <View style={styles.row}>
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
            disabled={!isCurrent}
            onPress={() => pickImage(index)}
          >
            <Text style={styles.uploadText}>
              {isLocked ? '🔒 Locked' : 'Upload Photo'}
            </Text>
          </TouchableOpacity>
        )}

        {/* 🤖 AI Placeholder */}
        {item && (
          <TouchableOpacity style={styles.aiBtn}>
            <Text style={styles.aiText}>🤖 Try AI</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Wrapper>
      <Header header="" />

      <View style={styles.container}>
        <Text style={styles.title}>🥒 Fermented Food Challenge</Text>
        <Text style={styles.subtitle}>
          Eat one fermented food daily for 4 weeks
        </Text>

        {/* <Text style={styles.progress}>
          Week {currentWeek + 1} | {completed}/{total} completed
        </Text> */}

        <FlatList
          data={Array.from({ length: TOTAL_DAYS })}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  title: {
    fontSize: 22,
    textAlign: 'center',
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
    marginVertical: 8,
  },

  subtitle: {
    textAlign: 'center',
    color: colors.white,
    marginBottom: 10,
    fontFamily: fontFamily.montserratMedium,
  },

  progress: {
    textAlign: 'center',
    color: colors.white,
    marginBottom: 10,
  },

  card: {
    backgroundColor: '#f0f8ff',
    margin: 10,
    padding: 12,
    borderRadius: 12,
  },

  dayLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  uploadBtn: {
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

  input: {
    borderBottomWidth: 1,
    marginTop: 6,
    padding: 4,
  },

  time: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  retake: {
    color: '#007bff',
    fontWeight: '600',
  },

  delete: {
    color: 'red',
    fontWeight: '600',
  },

  aiBtn: {
    marginTop: 8,
    alignItems: 'center',
  },

  aiText: {
    color: '#6a4c93',
    fontWeight: '600',
  },
});

export default FermentedFoodChallenge;
