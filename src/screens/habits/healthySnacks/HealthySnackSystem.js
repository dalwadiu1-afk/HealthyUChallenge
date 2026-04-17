import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';

import ActionSheet from 'react-native-actions-sheet';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { Button, Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';

const { height } = Dimensions.get('window');

export default function SnackSystemUI() {
  const actionSheetRef = useRef();

  const [tab, setTab] = useState('request');
  const [snackName, setSnackName] = useState('');
  const [qty, setQty] = useState('');
  const [image, setImage] = useState(null);

  const [requests, setRequests] = useState([]);

  // ---------------- IMAGE HANDLERS ----------------

  const handleCamera = () => {
    launchCamera({ mediaType: 'photo' }, res => {
      if (res.assets && res.assets.length > 0) {
        setImage(res.assets[0].uri);
      }
      actionSheetRef.current?.hide();
    });
  };

  const handleGallery = () => {
    launchImageLibrary({ mediaType: 'photo' }, res => {
      if (res.assets && res.assets.length > 0) {
        setImage(res.assets[0].uri);
      }
      actionSheetRef.current?.hide();
    });
  };

  // ---------------- ACTIONS ----------------

  const addRequest = () => {
    if (!snackName || !qty) return;

    const newReq = {
      id: Date.now().toString(),
      name: snackName,
      // qty: Number(qty),
      qty: qty,
      status: 'pending',
      image,
    };

    setRequests(prev => [newReq, ...prev]);

    setSnackName('');
    setQty('');
    setImage(null);
  };

  const approveReq = id => {
    setRequests(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'approved' } : item,
      ),
    );
  };

  const rejectReq = id => {
    setRequests(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'rejected' } : item,
      ),
    );
  };

  const resetStatus = id => {
    setRequests(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'pending' } : item,
      ),
    );
  };

  const deleteReq = id => {
    setRequests(prev => prev.filter(item => item.id !== id));
  };

  const approvedList = requests.filter(r => r.status === 'approved');

  // ---------------- COMMON IMAGE ----------------

  const SnackImage = ({ uri }) =>
    uri ? (
      <Image source={{ uri }} style={styles.image} />
    ) : (
      <View style={styles.noImage}>
        <Text style={{ color: colors.white }}>No Image</Text>
      </View>
    );

  // ---------------- CARDS ----------------

  const RequestCard = ({ item }) => (
    <View style={styles.card}>
      <SnackImage uri={item.image} />
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.sub}>Qty: {item.qty}</Text>

      <Text
        style={[
          styles.status,
          item.status === 'approved' && styles.approved,
          item.status === 'rejected' && styles.rejected,
        ]}
      >
        {item.status.toUpperCase()}
      </Text>
    </View>
  );

  const ApprovedCard = ({ item }) => (
    <View style={styles.card}>
      <SnackImage uri={item.image} />
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.sub}>Qty: {item.qty}</Text>
      <Text style={styles.approved}>APPROVED</Text>
    </View>
  );

  const AdminCard = ({ item }) => (
    <View style={styles.card}>
      <SnackImage uri={item.image} />

      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.sub}>Qty: {item.qty}</Text>

      <Text
        style={[
          styles.status,
          item.status === 'approved' && styles.approved,
          item.status === 'rejected' && styles.rejected,
        ]}
      >
        STATUS: {item.status.toUpperCase()}
      </Text>

      <View style={styles.row}>
        <Button
          title="Approve"
          onPress={() => approveReq(item.id)}
          buttonStyle={{ flex: 1, marginRight: 10 }}
        />
        <Button
          title="Reject"
          onPress={() => rejectReq(item.id)}
          buttonStyle={{ flex: 1 }}
        />
      </View>

      <View style={styles.row}>
        <Button
          title="Reset"
          onPress={() => resetStatus(item.id)}
          buttonStyle={{ flex: 1, marginRight: 10 }}
        />
        <Button
          title="Delete"
          onPress={() => deleteReq(item.id)}
          buttonStyle={{ backgroundColor: 'red', flex: 1 }}
        />
      </View>
    </View>
  );

  const tabs = ['request', 'approved', 'admin'];

  // ---------------- UI ----------------

  return (
    <Wrapper>
      <Header header="Snack System" />

      {/* Tabs */}
      <View style={styles.tabRow}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.activeTab]}
          >
            <Text style={[styles.tabText, tab === t && styles.activeText]}>
              {t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView nestedScrollEnabled>
        {/* REQUEST */}
        {tab === 'request' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.label}>Add Snack Request</Text>

              <TextInput
                placeholder="Snack Name"
                value={snackName}
                onChangeText={setSnackName}
                style={styles.input}
                placeholderTextColor={colors.white}
              />

              <TextInput
                placeholder="Quantity"
                value={qty}
                keyboardType="numeric"
                onChangeText={setQty}
                style={styles.input}
                placeholderTextColor={colors.white}
              />

              {/* Upload Button */}
              <TouchableOpacity
                style={styles.upload}
                onPress={() => actionSheetRef.current?.show()}
              >
                <Text style={styles.uploadText}>
                  {image ? 'Change Image' : 'Upload Image'}
                </Text>
              </TouchableOpacity>

              {image && (
                <Image source={{ uri: image }} style={styles.preview} />
              )}

              <Button
                title="Submit Request"
                onPress={addRequest}
                buttonStyle={{ marginTop: 10 }}
              />
            </View>

            <Text style={styles.sectionTitle}>My Requests</Text>

            <FlatList
              data={requests}
              keyExtractor={i => i.id}
              nestedScrollEnabled
              renderItem={({ item }) => <RequestCard item={item} />}
            />
          </View>
        )}

        {/* APPROVED */}
        {tab === 'approved' && (
          <View>
            <Text style={styles.sectionTitle}>Approved Snacks</Text>
            <FlatList
              data={approvedList}
              keyExtractor={i => i.id}
              nestedScrollEnabled
              renderItem={({ item }) => <ApprovedCard item={item} />}
            />
          </View>
        )}

        {/* ADMIN */}
        {tab === 'admin' && (
          <View>
            <Text style={styles.sectionTitle}>Admin Panel</Text>
            <FlatList
              data={requests}
              keyExtractor={i => i.id}
              renderItem={({ item }) => <AdminCard item={item} />}
              nestedScrollEnabled
            />
          </View>
        )}
      </ScrollView>

      {/* ACTION SHEET */}
      <ActionSheet
        ref={actionSheetRef}
        containerStyle={{ paddingBottom: 20 }}
        gestureEnabled
      >
        <Text style={styles.sheetTitle}>Upload Image</Text>

        {/* HORIZONTAL BUTTONS */}
        <View style={styles.row}>
          <Button
            title="📸 Camera"
            onPress={handleCamera}
            buttonStyle={{ flex: 1, marginRight: 10 }}
          />

          <Button
            title="🖼️ Gallery"
            onPress={handleGallery}
            buttonStyle={{ flex: 1 }}
          />
        </View>

        {/* CANCEL BELOW */}
        <Button
          title="Cancel"
          onPress={() => actionSheetRef.current?.hide()}
          buttonStyle={styles.cancelBtn}
          textStyle={styles.cancelText} // if your Button supports textStyle
        />
      </ActionSheet>
    </Wrapper>
  );
}

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#DBD9EC',
    borderRadius: 50,
    padding: 5,
    marginBottom: 10,
  },
  tab: { flex: 1, padding: 10, borderRadius: 50 },
  activeTab: { backgroundColor: colors.primary },

  tabText: {
    textAlign: 'center',
    color: colors.primary,
    fontFamily: fontFamily.montserratBold,
  },
  activeText: { color: '#fff' },

  card: {
    backgroundColor: 'rgba(143, 175, 120,0.16)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },

  preview: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginTop: 10,
  },

  noImage: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(143, 175, 120,0.16)',
    borderRadius: 10,
    marginBottom: 10,
  },

  upload: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },

  uploadText: {
    fontFamily: fontFamily.montserratMedium,
    color: '#555',
  },

  optionBtn: {
    padding: 15,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },

  optionText: {
    fontSize: 16,
    fontFamily: fontFamily.montserratMedium,
  },

  sheetTitle: {
    fontSize: 20,
    marginLeft: 20,
    marginTop: 20,
    fontFamily: fontFamily.montserratSemiBold,
  },

  title: {
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
  },
  sub: { fontSize: 13, color: colors.white, marginTop: 4 },

  status: {
    marginTop: 6,
    color: '#f59e0b',
    fontFamily: fontFamily.montserratBold,
  },

  approved: { color: '#22c55e', marginTop: 6 },
  rejected: { color: 'red', marginTop: 6 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    fontFamily: fontFamily.montserratMedium,
    color: colors.white,
  },

  label: {
    fontSize: 14,
    color: colors.white,
    fontFamily: fontFamily.montserratBold,
  },
  // row: {
  //   flexDirection: 'row',
  //   marginHorizontal: 20,
  //   marginTop: 20,
  // },

  cancelBtn: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#eee',
  },
  cancelText: {
    color: '#555',
  },
  sectionTitle: {
    marginVertical: 10,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
    color: colors.white,
  },
});
