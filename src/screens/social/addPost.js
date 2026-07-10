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
  Dimensions,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import ChatCard from '../../components/social/chatCard';
import { colors, fontFamily } from '../../constant';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { Header, SvgImg, Wrapper } from '../../components';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import { attachIcon, uploadIcon } from '../../assets/images';
import Modal from 'react-native-modal';

const { height } = Dimensions.get('window');

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

const uploadImageToFirebase = async uri => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error('Not logged in');

    const fileName = `posts/${user.uid}/${Date.now()}.jpg`;

    const reference = storage().ref(fileName);

    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

    await reference.putFile(uploadUri);

    return await reference.getDownloadURL();
  } catch (error) {
    console.log('UPLOAD ERROR:', error);
    throw error;
  }
};

const formatTime = timestamp => {
  if (!timestamp) return '';
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(timestamp).toLocaleDateString();
};

export default function AddPost({ navigation, route }) {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState([]);
  const { userData } = route?.params;
  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const ref = database()
      .ref('posts')
      .orderByChild('userId')
      .equalTo(user.uid);

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();

      if (!data) {
        setPosts([]);
        return;
      }

      const formatted = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
      }));

      // latest first
      formatted.sort((a, b) => b.createdAt - a.createdAt);

      setPosts(formatted);
    });

    return () => ref.off('value', listener);
  }, []);

  const handleUpload = async uri => {
    try {
      setUploading(true);

      const url = await uploadImageToFirebase(uri);

      setImage(url);
      setModalVisible(false);
    } catch (err) {
      console.log(err);
      Alert.alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!message.trim() && !image) return;

    try {
      const user = auth().currentUser;
      if (!user) return;

      const ref = database().ref('posts').push();

      await ref.set({
        userId: user.uid,
        name: userData?.profile?.name || 'User',
        avatar: userData?.profile?.avatar || '',
        message: message.trim(),
        image: image || '',
        createdAt: Date.now(),
        likes: {},
        comments: {},
      });

      setMessage('');
      setImage('');
    } catch (err) {
      console.log('POST ERROR:', err);
    }
  };

  const openCamera = async () => {
    const res = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (res.didCancel) return;

    const uri = res.assets?.[0]?.uri;
    if (!uri) return;

    await handleUpload(uri);
  };

  const openGallery = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (res.didCancel) return;

    const uri = res.assets?.[0]?.uri;
    if (!uri) return;

    await handleUpload(uri);
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <Header
        header="Share Something"
        headerContainer={{ paddingHorizontal: 23 }}
      />
      <Wrapper
        orbsRight
        containerStyle={{ paddingHorizontal: 0 }}
        scrollEnable={false}
      >
        <ScrollView style={{ paddingHorizontal: 23 }}>
          {posts.map(post => (
            <ChatCard
              key={post.id}
              item={{
                ...post,
                name: post?.name,
                message: post?.message || post?.text,
                picture: post?.image,
                time: formatTime(post?.createdAt),
                likes: post?.likesCount,
                comments: post?.commentsCount,
                isLiked: post?.isLiked,

                beverageName: post.beverageName,
                ingredients: post.ingredients || [],
                type: post.type,

                snackName: post?.snackName,
                qty: post?.qty,
                type: post?.type,
              }}
            />
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
        <View style={{ ...styles.inputBar }}>
          {/* Attach */}
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
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
        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
          style={styles.modal}
          useNativeDriver
          hideModalContentWhileAnimating
        >
          <View style={styles.sheet}>
            {/* glow top accent */}
            <View style={styles.topGlow} />

            {/* handle */}
            <View style={styles.handle} />

            <Text style={styles.title}>Add Media</Text>
            <Text style={styles.subtitle}>
              Capture or upload something from your journey
            </Text>

            <View style={styles.options}>
              <TouchableOpacity style={styles.option} onPress={openCamera}>
                <View style={styles.iconWrap}>
                  <Text style={styles.icon}>📸</Text>
                </View>
                <Text style={styles.optionText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={openGallery}>
                <View style={styles.iconWrap}>
                  <Text style={styles.icon}>🖼</Text>
                </View>
                <Text style={styles.optionText}>Gallery</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },

  sheet: {
    backgroundColor: '#0E0F13',
    padding: 22,
    paddingBottom: 30,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.18)',

    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },

  topGlow: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(143,175,120,0.18)',
    borderRadius: 50,
    opacity: 0.4,
  },

  handle: {
    width: 44,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 14,
  },

  title: {
    color: '#fff',
    fontSize: 20,
    fontFamily: fontFamily.montserratBold,
    textAlign: 'center',
  },

  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 22,
  },

  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },

  option: {
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 18,

    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,

    backgroundColor: 'rgba(143,175,120,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.25)',
  },

  icon: {
    fontSize: 22,
  },

  optionText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },

  cancelBtn: {
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },

  cancelText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
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
    paddingBottom: height / 9,
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
