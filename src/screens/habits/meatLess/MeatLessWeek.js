import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';

const TOTAL_WEEKS = 4;
const MAX_MEALS = 4;

const { height, width } = Dimensions.get('window');

const MeatlessChallenge = () => {
  const [weeks, setWeeks] = useState(
    Array.from({ length: TOTAL_WEEKS }, () => []),
  );

  const [startDate] = useState(new Date('2026-04-01')); // ⚠️ Persist this in backend later

  // 🔢 Calculate days passed
  const getDaysPassed = () => {
    const now = new Date();
    return Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  };

  const getUnlockedWeek = () => {
    return Math.floor(getDaysPassed() / 7);
  };

  // 📸 Add Meal
  const addMeal = async weekIndex => {
    const unlockedWeek = getUnlockedWeek();

    if (weekIndex !== unlockedWeek) return;

    if (weeks[weekIndex].length >= MAX_MEALS) {
      Alert.alert('Limit reached', 'Max 4 meals allowed for this week');
      return;
    }

    const granted = await requestCameraPermission();
    if (!granted) return;

    launchCamera({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel || response.errorCode) return;

      if (response?.assets?.length > 0) {
        const newWeeks = [...weeks];

        newWeeks[weekIndex].push({
          uri: response.assets[0].uri,
          label: '',
          timestamp: new Date().toLocaleString(),
        });

        setWeeks(newWeeks);
      }
    });
  };

  // 📝 Update Label
  const updateLabel = (weekIndex, mealIndex, text) => {
    const newWeeks = [...weeks];
    newWeeks[weekIndex][mealIndex].label = text;
    setWeeks(newWeeks);
  };

  // 🗑️ Delete Meal
  const deleteMeal = (weekIndex, mealIndex) => {
    const newWeeks = [...weeks];
    newWeeks[weekIndex].splice(mealIndex, 1);
    setWeeks(newWeeks);
  };

  // 🍽️ Meal Card
  const renderMeal = (weekIndex, meal, mealIndex, isCurrent) => (
    <View style={styles.mealCard}>
      <Image
        source={{ uri: meal.uri }}
        style={styles.photo}
        resizeMode="stretch"
      />

      <TextInput
        placeholder="Label (e.g. Veg Salad)"
        value={meal.label}
        editable={isCurrent}
        onChangeText={text => updateLabel(weekIndex, mealIndex, text)}
        style={styles.input}
      />

      <Text style={styles.time}>{meal.timestamp}</Text>

      {isCurrent && (
        <View style={styles.row}>
          <TouchableOpacity onPress={() => addMeal(weekIndex)}>
            <Text style={styles.retake}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => deleteMeal(weekIndex, mealIndex)}>
            <Text style={styles.delete}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // 📅 Week Card
  const renderWeek = ({ item, index }) => {
    const unlockedWeek = getUnlockedWeek();

    const isLocked = index > unlockedWeek;
    const isPast = index < unlockedWeek;
    const isCurrent = index === unlockedWeek;

    return (
      <View style={styles.weekCard}>
        <Text style={styles.weekTitle}>Week {index + 1}</Text>

        {isLocked ? (
          <View style={styles.lockedBox}>
            <Text style={styles.lockText}>🔒 Unlocks in future</Text>
          </View>
        ) : item.length === 0 ? (
          <TouchableOpacity
            style={[
              styles.uploadBtn,
              !isCurrent && { backgroundColor: '#ccc' },
            ]}
            onPress={() => addMeal(index)}
            disabled={!isCurrent}
          >
            <Text style={styles.uploadText}>
              {isCurrent ? 'Upload Meals' : 'Completed'}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <FlatList
              data={item}
              renderItem={({ item: meal, index: mealIndex }) =>
                renderMeal(index, meal, mealIndex, isCurrent)
              }
              keyExtractor={(item, i) => i.toString()}
            />

            {isCurrent && item.length < MAX_MEALS && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => addMeal(index)}
              >
                <Text style={styles.addText}>+ Add Meal</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <Wrapper>
      <Header header="" />

      <View style={styles.container}>
        <Text style={styles.title}>🥦 Meatless Day Challenge</Text>
        <Text style={styles.subtitle}>
          Upload meals for 1 meatless day each week (4 weeks)
        </Text>

        <FlatList
          data={weeks}
          renderItem={renderWeek}
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
    marginBottom: 12,
    fontFamily: fontFamily.montserratMedium,
  },

  weekCard: {
    backgroundColor: 'rgba(143, 175, 120,0.16)',
    margin: 10,
    padding: 12,
    borderRadius: 12,
  },

  weekTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
  },

  uploadBtn: {
    height: 100,
    backgroundColor: 'rgba(143, 175, 120)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  uploadText: {
    fontWeight: 'bold',
    color: '#2d6a4f',
    fontFamily: fontFamily.montserratMedium,
  },

  addBtn: {
    marginTop: 10,
    alignItems: 'center',
  },

  addText: {
    color: '#007bff',
    fontFamily: fontFamily.montserratMedium,
  },

  mealCard: {
    marginBottom: 10,
    backgroundColor: 'rgba(143, 175, 120,0.16)',
    padding: 8,
    borderRadius: 10,
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
    fontFamily: fontFamily.montserratMedium,
  },

  time: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontFamily: fontFamily.montserratMedium,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  retake: {
    color: '#007bff',
    fontFamily: fontFamily.montserratMedium,
  },

  delete: {
    color: 'red',
    fontFamily: fontFamily.montserratMedium,
  },

  lockedBox: {
    height: height * 0.15,
    backgroundColor: 'rgba(143, 175, 120,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  lockText: {
    fontFamily: fontFamily.montserratMedium,
    color: 'rgba(143, 175, 122)',
  },
});

export default MeatlessChallenge;
