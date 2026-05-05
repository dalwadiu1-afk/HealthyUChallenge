import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import ChatCard from '../../components/social/chatCard';
import { colors, fontFamily } from '../../constant';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { SvgImg } from '../../components';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import { attachIcon, uploadIcon } from '../../assets/images';

function GradientBg({ id, c1, c2, r = 16, horizontal = false }) {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient
          id={id}
          x1="0"
          y1="0"
          x2={horizontal ? '1' : '0'}
          y2={horizontal ? '0' : '1'}
        >
          <Stop offset="0" stopColor={c1} stopOpacity="1" />
          <Stop offset="1" stopColor={c2} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} rx={r} />
    </Svg>
  );
}

export default function AddPost({ navigation }) {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);

  const handleCreatePost = async () => {
    if (!message.trim() && !image) return;

    const user = auth().currentUser || 'USER_UID';
    if (!user) return;

    try {
      let imageUrl = '';

      if (image) {
        // imageUrl = await uploadImage(image); // ✅ upload first
        imageUrl = image; // ✅ upload first
      }

      console.log('newPost :>> ');
      const newPostRef = database().ref('posts').push();

      const newPost = {
        userId: user.uid,
        name: user.displayName || 'User',
        avatar: user.photoURL || '',

        message: message,
        image: imageUrl, // ✅ CORRECT

        createdAt: Date.now(),

        likes: {}, // ✅ IMPORTANT
        comments: {}, // ✅ IMPORTANT
      };
      console.log('newPost :>> ', newPost);
      await newPostRef.set(newPost);

      setMessage('');
      setImage(null);

      navigation.goBack();
    } catch (err) {
      console.log('Post error:', err);
    }
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (result.didCancel) return;

    const uri = result.assets?.[0]?.uri;
    setImage(uri);
  };

  const openCamera = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (result.didCancel) return;

    const uri = result.assets?.[0]?.uri;
    setImage(uri);
  };

  const addComment = async text => {
    const commentRef = database().ref(`posts/${postId}/comments`).push();

    const newComment = {
      userId: user.uid,
      name: user.displayName || 'User',
      text: text,
      createdAt: Date.now(),
      likes: {},
    };

    await commentRef.set(newComment);
  };

  const uploadImage = async uri => {
    try {
      const fileName = `posts/${Date.now()}.jpg`;

      // ✅ FIX ANDROID PATH ISSUE
      const uploadUri =
        Platform.OS === 'android' ? uri.replace('file://', '') : uri;

      const reference = storage().ref(fileName);

      await reference.putFile(uploadUri);

      const url = await reference.getDownloadURL();

      console.log('UPLOAD SUCCESS:', url);

      return url;
    } catch (error) {
      console.log('UPLOAD ERROR:', error);
      return '';
    }
  };

  const posts = [
    {
      id: 1,
      name: 'Linh Nguyen',
      message:
        'I am very happy to be with Cafit in training sessions and how about you?',
      time: '10:30 AM || 2s ago',
      picture:
        'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
            <Path
              d="M8 1L1 8L8 15"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Linh's Post</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {posts.map((item, index) => (
          <ChatCard key={index} item={item} />
        ))}
      </ScrollView>
      {image && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: image }} style={styles.previewImage} />

          <TouchableOpacity
            onPress={() => setImage(null)}
            style={styles.removeImageBtn}
          >
            <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Comment input bar */}
      <View style={styles.inputBar}>
        {/* Attach */}
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={pickImage}
        >
          <SvgImg iconName={attachIcon} height={22} width={22} />
        </TouchableOpacity>

        {/* Text field */}
        <TextInput
          style={styles.textInput}
          placeholder="What's on your mind?"
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={message}
          onChangeText={setMessage}
          multiline
        />

        {/* Send */}
        <TouchableOpacity
          disabled={!message.trim() && !image}
          style={[
            styles.sendBtn,
            { opacity: message.trim() || image ? 1 : 0.5 },
          ]}
          activeOpacity={0.85}
          onPress={handleCreatePost}
        >
          <GradientBg
            id="sendGrad"
            c1="#6A9455"
            c2="#3A5A2A"
            r={14}
            horizontal
          />
          <SvgImg iconName={uploadIcon} height={20} width={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
    paddingTop: (StatusBar.currentHeight || 44) + 8,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
  },
  imagePreview: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },

  previewImage: {
    width: '100%',
    height: 180,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    gap: 10,
  },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
    maxHeight: 80,
  },

  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
