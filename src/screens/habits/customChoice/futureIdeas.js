import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';

import { Button, Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';

export default function FutureIdeasUI() {
  const [idea, setIdea] = useState('');
  const [image, setImage] = useState(null);
  const [ideas, setIdeas] = useState([]);

  // 🔥 mock image picker
  const pickImage = () => {
    setImage('https://images.unsplash.com/photo-1521737604893-d14cc237f11d');
  };

  const submitIdea = () => {
    if (!idea) return;

    const newIdea = {
      id: Date.now().toString(),
      text: idea,
      image,
      time: new Date().toLocaleString(),
    };

    setIdeas(prev => [newIdea, ...prev]);

    setIdea('');
    setImage(null);
  };

  return (
    <Wrapper>
      <Header header="Future Ideas 💡" />

      {/* INPUT CARD */}
      <View style={styles.card}>
        <Text style={styles.title}>Share your ideas for the future</Text>

        <TextInput
          placeholder="Type your idea... (e.g. new feature, product, app idea)"
          value={idea}
          onChangeText={setIdea}
          style={styles.input}
          multiline
        />

        {/* IMAGE UPLOAD */}
        <TouchableOpacity style={styles.upload} onPress={pickImage}>
          <Text style={styles.uploadText}>
            {image ? 'Change Image' : 'Upload Image (Optional)'}
          </Text>
        </TouchableOpacity>

        {image && <Image source={{ uri: image }} style={styles.image} />}

        <Button
          title="Submit Idea"
          onPress={submitIdea}
          buttonStyle={{ marginTop: 15 }}
        />
      </View>

      {/* LIST */}
      <Text style={styles.sectionTitle}>Community Ideas</Text>

      <FlatList
        data={ideas}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.ideaCard}>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.ideaImg} />
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.ideaText}>{item.text}</Text>
              <Text style={styles.time}>{item.time}</Text>
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
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },

  title: {
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: fontFamily.montserratMedium,
  },

  upload: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 10,
    alignItems: 'center',
  },

  uploadText: {
    fontFamily: fontFamily.montserratMedium,
    color: '#555',
  },

  image: {
    height: 140,
    borderRadius: 10,
    marginTop: 10,
  },

  sectionTitle: {
    marginVertical: 10,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
    color: colors.white,
  },

  ideaCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },

  ideaImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },

  ideaText: {
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },

  time: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
});
