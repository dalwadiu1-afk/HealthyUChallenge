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
  FlatList,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { Button, Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';

const { width } = Dimensions.get('window');

export default function SnackListingUI() {
  const [snackName, setSnackName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [snacks, setSnacks] = useState([]);
  const [selectedTab, setSelectedTab] = useState('request');

  // Add Snack
  const addSnack = () => {
    if (!snackName || !quantity) return;

    const newSnack = {
      id: Date.now().toString(),
      name: snackName,
      qty: quantity,
      status: 'pending',
      image: null,
    };

    setSnacks(prev => [newSnack, ...prev]);
    setSnackName('');
    setQuantity('');
  };

  // Approve / Reject (mock admin)
  const updateStatus = (id, status) => {
    setSnacks(prev =>
      prev.map(item => (item.id === id ? { ...item, status } : item)),
    );
  };

  // Upload Proof
  const uploadImage = async id => {
    const result = await launchCamera({ mediaType: 'photo', quality: 0.6 });

    if (result?.assets?.length > 0) {
      const uri = result.assets[0].uri;

      setSnacks(prev =>
        prev.map(item => (item.id === id ? { ...item, image: uri } : item)),
      );
    }
  };

  const getStatusColor = status => {
    if (status === 'approved') return '#22c55e';
    if (status === 'rejected') return '#ef4444';
    return '#eab308';
  };

  const SnackCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.small}>Qty: {item.qty}</Text>

      <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
        {item.status.toUpperCase()}
      </Text>

      {item.status === 'pending' && (
        <View style={styles.row}>
          <Button
            title="Approve"
            onPress={() => updateStatus(item.id, 'approved')}
          />
          <Button
            title="Reject"
            onPress={() => updateStatus(item.id, 'rejected')}
          />
        </View>
      )}

      {item.status === 'approved' && !item.image && (
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => uploadImage(item.id)}
        >
          <Text style={styles.uploadText}>Upload Proof</Text>
        </TouchableOpacity>
      )}

      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}
    </View>
  );

  const approvedSnacks = snacks.filter(s => s.status === 'approved');

  return (
    <Wrapper>
      <Header header="Snack Management" />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['request', 'list', 'approved'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[styles.tabBtn, selectedTab === tab && styles.activeTab]}
          >
            <Text
              style={[styles.tabText, selectedTab === tab && styles.activeText]}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView>
        {/* REQUEST TAB */}
        {selectedTab === 'request' && (
          <View style={styles.card}>
            <Text style={styles.label}>Request Snack</Text>

            <TextInput
              placeholder="Snack Name"
              value={snackName}
              onChangeText={setSnackName}
              style={styles.input}
            />

            <TextInput
              placeholder="Quantity"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              style={styles.input}
            />

            <Button title="Submit Request" onPress={addSnack} />
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
    fontFamily: fontFamily.montserratMedium,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
  },
  small: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  status: {
    marginTop: 6,
    fontFamily: fontFamily.montserratBold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
  },
  uploadBtn: {
    marginTop: 10,
    backgroundColor: '#6366f1',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontFamily: fontFamily.montserratMedium,
  },
  image: {
    width: width / 2.5,
    height: width / 2.5,
    borderRadius: 10,
    marginTop: 10,
  },
});
