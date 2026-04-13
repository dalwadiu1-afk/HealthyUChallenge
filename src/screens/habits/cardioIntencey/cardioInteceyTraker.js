import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { Button, Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';

const { height, width } = Dimensions.get('window');
export default function CardioTrackerUI() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedTab, setSelectedTab] = useState(true);

  const [startPhoto, setStartPhoto] = useState(null);
  const [endPhoto, setEndPhoto] = useState(null);

  const [manualTime, setManualTime] = useState('');
  const [manualIntensity, setManualIntensity] = useState('');

  // 📸 Camera handler
  const openCamera = async type => {
    const result = await launchCamera({ mediaType: 'photo' });

    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;

      if (type === 'start') setStartPhoto(uri);
      else setEndPhoto(uri);
    }
  };

  // ▶️ Start session
  const handleStart = async () => {
    const now = new Date();
    setStartTime(now);
    setSessionStarted(true);

    await openCamera('start');
  };

  // ⏹ Stop session
  const handleStop = async () => {
    const now = new Date();
    setEndTime(now);
    setSessionStarted(false);

    await openCamera('end');
  };

  // ⏱ Duration (minutes)
  const getDuration = () => {
    if (!startTime || !endTime) return 0;
    return Math.floor((endTime - startTime) / 60000);
  };

  // 🔥 Auto Intensity Logic
  const getIntensity = minutes => {
    if (minutes >= 30) return 'High';
    if (minutes >= 15) return 'Medium';
    return 'Low';
  };

  const duration = getDuration();
  const intensity = getIntensity(duration);

  return (
    <Wrapper>
      <Header header="Cardio Session Tracker" />

      <View
        style={{
          backgroundColor: '#DBD9EC',
          flexDirection: 'row',
          alignContent: 'center',
          borderRadius: 50,
          overflow: 'hidden',
          padding: 5,
        }}
      >
        <TouchableOpacity
          onPress={() => setSelectedTab(true)}
          style={{
            ...styles.radioBtn,
            backgroundColor: selectedTab ? colors.primary : 'transparent',
          }}
        >
          <Text
            style={{
              ...styles.tabText,
              color: selectedTab ? '#DBD9EC' : colors.primary,
            }}
          >
            Time Tracker
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab(false)}
          style={{
            ...styles.radioBtn,

            backgroundColor: !selectedTab ? colors.primary : 'transparent',
          }}
        >
          <Text
            style={{
              ...styles.tabText,
              color: !selectedTab ? '#DBD9EC' : colors.primary,
            }}
          >
            Manual Entry
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ paddingTop: 10 }}>
        {/* SESSION CARD */}
        {selectedTab ? (
          <View>
            <View style={styles.card}>
              <Text style={styles.label}>Cardio Session</Text>

              {!sessionStarted ? (
                <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
                  <Text style={styles.btnText}>▶ Start Cardio</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
                  <Text style={styles.btnText}>⏹ Stop Cardio</Text>
                </TouchableOpacity>
              )}

              {startTime && (
                <Text style={styles.value}>
                  Start: {startTime.toLocaleTimeString()}
                </Text>
              )}

              {endTime && (
                <Text style={styles.value}>
                  End: {endTime.toLocaleTimeString()}
                </Text>
              )}

              {duration > 0 && (
                <>
                  <Text style={styles.value}>Duration: {duration} min</Text>

                  <Text
                    style={{
                      ...styles.value,
                      color:
                        intensity === 'High'
                          ? '#22c55e'
                          : intensity === 'Low'
                          ? '#f10505'
                          : '#e4b005',
                    }}
                  >
                    Intensity: {intensity}
                  </Text>
                </>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Proof Photos</Text>

              <View style={styles.imageRow}>
                {startPhoto && (
                  <View>
                    <Text style={styles.small}>Start</Text>
                    <Image source={{ uri: startPhoto }} style={styles.image} />
                  </View>
                )}

                {endPhoto && (
                  <View>
                    <Text style={styles.small}>End</Text>
                    <Image source={{ uri: endPhoto }} style={styles.image} />
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>Manual Entry (Optional)</Text>

            <TextInput
              placeholder="Time (minutes)"
              keyboardType="numeric"
              value={manualTime}
              onChangeText={setManualTime}
              style={styles.input}
            />

            <TextInput
              placeholder="Intensity (Low / Medium / High)"
              value={manualIntensity}
              onChangeText={setManualIntensity}
              style={styles.input}
            />

            <Button
              title="Save Manual Entry"
              onPress={() =>
                alert(`Manual: ${manualTime} min, ${manualIntensity}`)
              }
              buttonStyle={{ marginTop: 10 }}
            />
          </View>
        )}

        {/* LIST TAB */}
        {selectedTab === 'list' && (
          <FlatList
            data={snacks}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <SnackCard item={item} />}
          />
        )}

        {/* APPROVED TAB */}
        {selectedTab === 'approved' && (
          <FlatList
            data={approvedSnacks}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.small}>Qty: {item.qty}</Text>

                {item.image && (
                  <Image source={{ uri: item.image }} style={styles.image} />
                )}
              </View>
            )}
          />
        )}
      </ScrollView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#DBD9EC',
    borderRadius: 50,
    padding: 5,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 50,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    textAlign: 'center',
    color: colors.primary,
    fontFamily: fontFamily.montserratBold,
  },
  activeText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontFamily?.montserratMedium,
  },
  value: {
    fontSize: 16,
    marginTop: 6,
    fontFamily: fontFamily?.montserratSemiBold,
  },
  startBtn: {
    marginTop: 10,
    backgroundColor: '#22c55e',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  stopBtn: {
    marginTop: 10,
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontFamily: fontFamily?.montserratSemiBold,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  image: {
    width: width / 2.5,
    height: width / 2.5,
    borderRadius: 10,
    marginTop: 5,
  },
  small: {
    fontSize: 12,
    color: '#888',
    fontFamily: fontFamily.montserratMedium,
  },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    fontFamily: fontFamily?.montserratMedium,
  },
  radioBtn: {
    flex: 1,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 50,
  },
  tabText: {
    textAlign: 'center',
    fontFamily: fontFamily.montserratBold,
  },
});
