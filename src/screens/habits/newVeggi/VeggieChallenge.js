import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  FlatList,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';
import { requestCameraPermission } from '../../../utils/helper';

const DAYS_PER_WEEK = 1;

const VeggieChallenge = () => {
  const [weeks, setWeeks] = useState([
    {
      startDate: new Date().toISOString(),
      entries: Array(DAYS_PER_WEEK).fill(null),
    },
  ]);

  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentDay, setCurrentDay] = useState(0);

  // ⏱ WEEK UNLOCK LOGIC
  const isWeekUnlocked = weekIndex => {
    // ✅ Week 1 always unlocked
    if (weekIndex === 0) return true;

    const week = weeks[weekIndex];

    if (!week?.startDate) return false;

    const start = new Date(week.startDate);
    const now = new Date();

    const diffDays = (now - start) / (1000 * 60 * 60 * 24);

    return diffDays >= 7;
  };

  // 📸 CAMERA HANDLER
  const pickImage = async (weekIndex, dayIndex) => {
    if (weekIndex !== currentWeek) return;
    if (!isWeekUnlocked(weekIndex)) return;

    const granted = await requestCameraPermission();
    if (!granted) return;

    launchCamera({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel || response.errorCode) return;

      const uri = response?.assets?.[0]?.uri;
      if (!uri) return;

      setWeeks(prev => {
        const updated = [...prev];

        if (!updated[weekIndex]) return prev;

        updated[weekIndex].entries[dayIndex] = {
          uri,
          label: '',
          timestamp: new Date().toLocaleString(),
        };

        return updated;
      });

      // 👉 MOVE PROGRESS
      if (dayIndex < DAYS_PER_WEEK - 1) {
        setCurrentDay(prev => prev + 1);
      } else {
        setCurrentWeek(prev => {
          const nextWeek = prev + 1;

          setWeeks(old => {
            const copy = [...old];

            // create next week only if missing
            if (!copy[nextWeek]) {
              copy.push({
                startDate: new Date().toISOString(),
                entries: Array(DAYS_PER_WEEK).fill(null),
              });
            }

            return copy;
          });

          setCurrentDay(0);
          return nextWeek;
        });
      }
    });
  };

  // ✏️ LABEL UPDATE
  const updateLabel = (weekIndex, dayIndex, text) => {
    if (weekIndex !== currentWeek) return;

    setWeeks(prev => {
      const updated = [...prev];

      if (!updated[weekIndex]?.entries?.[dayIndex]) return prev;

      updated[weekIndex].entries[dayIndex].label = text;
      return updated;
    });
  };

  // 🗑 DELETE ENTRY
  const deleteEntry = (weekIndex, dayIndex) => {
    if (weekIndex !== currentWeek) return;

    setWeeks(prev => {
      const updated = [...prev];

      if (!updated[weekIndex]) return prev;

      updated[weekIndex].entries[dayIndex] = null;
      return updated;
    });
  };

  // 🔒 CHECK EDIT ACCESS
  const isEditable = (weekIndex, dayIndex) => {
    return (
      weekIndex === currentWeek &&
      isWeekUnlocked(weekIndex) &&
      dayIndex === currentDay
    );
  };

  return (
    <Wrapper>
      <Header header="Veggie Challenge" />

      <View style={styles.container}>
        <Text style={styles.title}>🥦 Weekly Veggie Challenge</Text>

        <Text style={styles.subtitle}>Week {currentWeek + 1}</Text>

        <FlatList
          data={weeks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index: weekIndex }) => {
            const unlocked = isWeekUnlocked(weekIndex);

            return (
              <View style={styles.card}>
                <Text style={styles.weekTitle}>
                  Week {weekIndex + 1} {unlocked ? '🔥 Unlocked' : '🔒 Locked'}
                </Text>

                {item.entries.map((entry, dayIndex) => {
                  const editable = isEditable(weekIndex, dayIndex);

                  return (
                    <View key={dayIndex} style={styles.dayBox}>
                      <Text style={styles.dayText}>Day {dayIndex + 1}</Text>

                      {/* LOCKED WEEK VIEW */}
                      {!unlocked ? (
                        entry ? (
                          <>
                            <Image
                              source={{ uri: entry.uri }}
                              style={styles.photo}
                            />
                            <Text>🔒 Unlocks after 7 days</Text>
                          </>
                        ) : (
                          <Text>🔒 Locked</Text>
                        )
                      ) : entry ? (
                        <>
                          <Image
                            source={{ uri: entry.uri }}
                            style={styles.photo}
                          />

                          <TextInput
                            value={entry.label}
                            placeholder="Vegetable Name"
                            onChangeText={text =>
                              updateLabel(weekIndex, dayIndex, text)
                            }
                            style={styles.input}
                          />

                          <Text style={styles.time}>⏰ {entry.timestamp}</Text>

                          <View style={styles.row}>
                            <TouchableOpacity
                              disabled={!editable}
                              onPress={() => pickImage(weekIndex, dayIndex)}
                            >
                              <Text style={styles.retake}>Retake</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              disabled={!editable}
                              onPress={() => deleteEntry(weekIndex, dayIndex)}
                            >
                              <Text style={styles.delete}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      ) : (
                        <TouchableOpacity
                          disabled={!unlocked}
                          onPress={() => pickImage(weekIndex, dayIndex)}
                          style={[
                            styles.uploadBtn,
                            !unlocked && {
                              backgroundColor: '#ccc',
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontFamily: fontFamily.montserratSemiBold,
                            }}
                          >
                            {unlocked ? 'Upload' : 'Locked (7 days)'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          }}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },

  title: {
    fontSize: 20,
    textAlign: 'center',
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
  },

  subtitle: {
    textAlign: 'center',
    color: colors.white,
    marginVertical: 10,
    fontFamily: fontFamily.montserratMedium,
  },

  card: {
    backgroundColor: 'rgba(143, 175, 120,0.16)',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },

  weekTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
  },

  dayBox: {
    marginBottom: 14,
    padding: 10,
    backgroundColor: 'rgba(143, 175, 120,0.16)',
    borderRadius: 10,
  },

  dayText: {
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: fontFamily.montserratMedium,
    color: colors.white,
  },

  uploadBtn: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d3f4d1',
    borderRadius: 10,
  },

  photo: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },

  input: {
    borderBottomWidth: 1,
    marginTop: 8,
    padding: 6,
    fontFamily: fontFamily.montserratMedium,
  },

  time: {
    fontSize: 12,
    marginTop: 6,
    color: colors.white,
    fontFamily: fontFamily.montserratMedium,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  retake: { color: '#007bff', fontFamily: fontFamily.montserratMedium },
  delete: { color: 'red', fontFamily: fontFamily.montserratMedium },

  aiBtn: {
    marginTop: 8,
    alignItems: 'center',
  },
});

export default VeggieChallenge;
