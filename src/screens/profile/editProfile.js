import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { colors, fontFamily } from '../../constant';
import { Header, Wrapper } from '../../components';
import InputBox from '../../components/common/InputBox';

export default function EditProfile({ navigation }) {
  const actionSheetRef = useRef(null);

  const [name, setName] = useState('Linh Nguyen');
  const [username, setUsername] = useState('linh.nguyen');
  const [image, setImage] = useState(
    'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
  );

  // OPEN ACTION SHEET
  const handleChangePhoto = () => {
    actionSheetRef.current?.show();
  };

  // CAMERA
  const handleCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: true,
    };

    launchCamera(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.log('Camera Error:', response.errorMessage);
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setImage(uri);
        actionSheetRef.current?.hide();
      }
    });
  };

  // GALLERY
  const handleGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.log('Gallery Error:', response.errorMessage);
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setImage(uri);
        actionSheetRef.current?.hide();
      }
    });
  };

  // SAVE
  const handleSave = () => {
    // TODO: API / AsyncStorage logic
    console.log({
      name,
      username,
      image,
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Wrapper>
        {/* HEADER */}
        <Header header="Edit Profile" />
        {/* <Text style={styles.header}>Edit Profile</Text> */}

        {/* AVATAR */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: image }} style={styles.avatar} />

          <TouchableOpacity
            style={styles.changePhotoBtn}
            onPress={handleChangePhoto}
            activeOpacity={0.8}
          >
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* NAME */}
        <View style={styles.inputGroup}>
          <InputBox
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
        </View>

        {/* USERNAME */}
        <View style={styles.inputGroup}>
          <InputBox
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="@username"
          />
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </Wrapper>

      {/* ================= ACTION SHEET ================= */}
      <ActionSheet
        ref={actionSheetRef}
        containerStyle={styles.sheetContainer}
        gestureEnabled
      >
        <Text style={styles.sheetTitle}>Upload Image</Text>

        {/* ROW BUTTONS */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCamera}>
            <Text style={styles.actionText}>📸 Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleGallery}>
            <Text style={styles.actionText}>🖼️ Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* CANCEL */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => actionSheetRef.current?.hide()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ActionSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },

  header: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 20,
  },

  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: colors.secondary,
    marginBottom: 10,
  },

  changePhotoBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(143,175,120,0.15)',
  },

  changePhotoText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },

  inputGroup: {
    marginBottom: 18,
  },

  saveBtn: {
    marginTop: 10,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  saveText: {
    color: colors.dark,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },

  /* ================= ACTION SHEET ================= */

  sheetContainer: {
    backgroundColor: '#111',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  sheetTitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fontFamily.montserratSemiBold,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  actionText: {
    color: '#fff',
    fontSize: 14,
  },

  cancelBtn: {
    backgroundColor: 'rgba(255,0,0,0.1)',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  cancelText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
