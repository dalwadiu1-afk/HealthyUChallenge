import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';

import { Button, Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';

// 🍎 Fruit Data (serving sizes)
const FRUITS = [
  { name: 'Apple', serving: '1 medium (182g)' },
  { name: 'Banana', serving: '1 medium (118g)' },
  { name: 'Orange', serving: '1 medium (131g)' },
  { name: 'Strawberries', serving: '1 cup (150g)' },
  { name: 'Grapes', serving: '1 cup (92g)' },
  { name: 'Mango', serving: '1 cup sliced (165g)' },
];

export default function FruitTrackerUI() {
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [image, setImage] = useState(null);

  const [logs, setLogs] = useState([]);

  // 🔥 MOCK image (replace with your picker)
  const pickImage = () => {
    setImage('https://images.unsplash.com/photo-1567306226416-28f0efdc88ce');
  };

  const addLog = () => {
    if (!selectedFruit) return;

    const newLog = {
      id: Date.now().toString(),
      fruit: selectedFruit.name,
      serving: selectedFruit.serving,
      image,
    };

    setLogs(prev => [newLog, ...prev]);

    setSelectedFruit(null);
    setImage(null);
  };

  // ---------------- UI ----------------

  return (
    <Wrapper>
      <Header header="Fruit Tracker 🍎" />

      <View style={styles.card}>
        <Text style={styles.title}>Consume 2–3 servings of fruit per day</Text>

        {/* DROPDOWN */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setDropdownOpen(!dropdownOpen)}
        >
          <Text style={styles.dropdownText}>
            {selectedFruit ? selectedFruit.name : 'Select Fruit'}
          </Text>
        </TouchableOpacity>

        {/* DROPDOWN LIST */}
        {dropdownOpen && (
          <View style={styles.dropdownList}>
            {FRUITS.map(item => (
              <TouchableOpacity
                key={item.name}
                style={styles.option}
                onPress={() => {
                  setSelectedFruit(item);
                  setDropdownOpen(false);
                }}
              >
                <Text style={styles.optionText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SERVING INFO */}
        {selectedFruit && (
          <Text style={styles.serving}>
            1 Serving = {selectedFruit.serving}
          </Text>
        )}

        {/* IMAGE */}
        <TouchableOpacity style={styles.upload} onPress={pickImage}>
          <Text style={styles.uploadText}>
            {image ? 'Change Photo' : 'Upload Photo'}
          </Text>
        </TouchableOpacity>

        {image && <Image source={{ uri: image }} style={styles.image} />}

        <Button
          title="Log Serving"
          onPress={addLog}
          buttonStyle={{ marginTop: 15 }}
        />
      </View>

      {/* LOG LIST */}
      <Text style={styles.sectionTitle}>Today’s Servings</Text>

      <FlatList
        data={logs}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.logImg} />
            )}
            <View>
              <Text style={styles.logTitle}>{item.fruit}</Text>
              <Text style={styles.logSub}>{item.serving}</Text>
            </View>
          </View>
        )}
      />
    </Wrapper>
  );
}

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(143, 175, 120,0.16)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  title: {
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 10,
    color: colors.white,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
  },

  dropdownText: {
    fontFamily: fontFamily.montserratMedium,
    color: colors.white,
  },

  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },

  option: {
    padding: 12,
  },

  optionText: {
    fontFamily: fontFamily.montserratMedium,
  },

  serving: {
    marginTop: 10,
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
  },

  upload: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 10,
    alignItems: 'center',
  },

  uploadText: {
    fontFamily: fontFamily.montserratMedium,
  },

  image: {
    height: 120,
    borderRadius: 10,
    marginTop: 10,
  },

  sectionTitle: {
    marginVertical: 10,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
    color: colors.white,
  },

  logCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },

  logImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },

  logTitle: {
    fontFamily: fontFamily.montserratSemiBold,
  },

  logSub: {
    color: '#666',
    fontSize: 12,
  },
});
