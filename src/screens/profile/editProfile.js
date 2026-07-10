import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import database from '@react-native-firebase/database';
import { colors, fontFamily } from '../../constant';
import { Header, RadioBtn, Wrapper } from '../../components';
import InputBox from '../../components/common/InputBox';
import { requestCameraPermission } from '../../utils/helper';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

const normalizeUri = uri => {
  if (!uri) return null;
  return uri.startsWith('file://') ? uri : `file://${uri}`;
};

const uploadImageToFirebase = async (uri) => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error('No user logged in');

    const fileUri = uri;

    const fileName = `profile/${user.uid}/${Date.now()}.jpg`;

    const ref = storage().ref(fileName);

    await ref.putFile(fileUri);

    return await ref.getDownloadURL();
  } catch (e) {
    console.log('Storage upload error:', e);
    throw e;
  }
};

export default function EditProfile({ navigation }) {
  const actionSheetRef = useRef(null);
  const [selected, setSelected] = useState('');
  const userId = auth().currentUser.uid;
  const [form, setForm] = useState({
    name: '',
    username: '',
    image:
      'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
    gender: '',
  });

  // OPEN ACTION SHEET
  const handleChangePhoto = () => {
    actionSheetRef.current?.show();
  };

  // CAMERA
  const handleCamera = async () => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return;

  launchCamera({mediaType: 'photo', quality: 0.8}, async response => {
    if (response.didCancel || response.errorCode) return;

    const uri = response?.assets?.[0]?.uri;
    console.log('Camera URI:', uri);

    if (!uri) return;

    try {
      const url = await uploadImageToFirebase(uri);
      updateField('avatar', url);
      actionSheetRef.current?.hide();
    } catch (e) {
      console.log('Upload error:', e);
    }
  });
};

  const updateField = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // GALLERY
  const handleGallery = () => {
  launchImageLibrary({mediaType: 'photo', quality: 0.8}, async response => {
    if (response.didCancel || response.errorCode) return;

    const uri = response?.assets?.[0]?.uri;
    console.log('Gallery URI:', uri);

    if (!uri) return;

    try {
      const url = await uploadImageToFirebase(uri);
      updateField('avatar', url);
      actionSheetRef.current?.hide();
    } catch (e) {
      console.log('Upload error:', e);
    }
  });
};

  // SAVE
  const handleSave = async () => {
    try {
      await database().ref(`users/${userId}/profile`).update({
        name: form?.name,
        username: form?.username,
        avatar: form?.image,
        image: form?.image,
        gender: form?.gender,
      });

      console.log('Profile updated successfully');

      navigation.goBack();
    } catch (error) {
      console.log('Firebase Save Error:', error);
    }
  };

  useEffect(() => {
    const ref = database().ref(`users/${userId}/profile`);

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();

      if (data) {
        setForm({
          name: data.name || '',
          username: data.username || '',
          avatar: data.avatar || '',
          gender: data.gender || '',
        });
      }
    });

    return () => ref.off('value', listener);
  }, []);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Header
        header="Edit Profile"
        headerContainer={{ paddingHorizontal: 23 }}
      />
      <Wrapper orbsRight>
        {/* <Text style={styles.header}>Edit Profile</Text> */}

        {/* AVATAR */}
        <View style={styles.avatarContainer}>
          {console.log('form?.image :>> ', form)}

          <Image
            source={{
              uri:
                form?.avatar ||
                form?.image ||
                'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
            }}
            style={styles.avatar}
          />

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
            value={form?.name}
            onChangeText={text => updateField('name', text)}
            placeholder="Enter your name"
          />
        </View>

        {/* USERNAME */}
        <View style={styles.inputGroup}>
          <InputBox
            label="Username"
            value={form?.username}
            onChangeText={text => updateField('username', text)}
            placeholder="@username"
          />
        </View>

        <View>
          <RadioBtn
            selected={form?.gender}
            onPress={item => updateField('gender', item?.value)}
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
