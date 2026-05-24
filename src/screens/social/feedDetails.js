import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ChatCard from '../../components/social/chatCard';
import { colors, fontFamily } from '../../constant';
import { CommentCard, Header, SvgImg, Wrapper } from '../../components';
import { chatIcon, heartIcon } from '../../assets/images';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

const { height } = Dimensions.get('window');

export default function FeedDetails({ navigation, route }) {
  const { postId, showComment } = route.params; // ✅ GET POST ID
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(showComment || false);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const userId = auth().currentUser?.uid || 'USER_UID';

  // ✅ format time
  const formatTime = timestamp => {
    if (!timestamp) return '';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  useEffect(() => {
    if (!postId) return;

    const postRef = database().ref(`posts/${postId}`);

    const listener = postRef.on('value', snapshot => {
      const data = snapshot.val();

      if (!data) return;

      const formattedPost = {
        id: postId,
        ...data,
        likesCount: data.likes ? Object.keys(data.likes).length : 0,
        commentsCount: data.comments ? Object.keys(data.comments).length : 0,
        isLiked: userId ? !!data.likes?.[userId] : false,
      };
      setPost(formattedPost);

      if (data.comments) {
        const formattedComments = Object.keys(data.comments)
          .map(key => {
            const comment = data.comments[key];

            return {
              id: key,
              ...comment,
              likesCount: comment.likes ? Object.keys(comment.likes).length : 0,
              isLiked: userId ? !!comment.likes?.[userId] : false,
            };
          })
          .sort((a, b) => b.createdAt - a.createdAt);

        setComments(formattedComments);
      } else {
        setComments([]);
      }
    });

    return () => postRef.off('value', listener);
  }, [postId]);

  const handleLike = () => {
    if (!userId || !postId) return;

    const likeRef = database().ref(`posts/${postId}/likes/${userId}`);

    if (post?.isLiked) {
      likeRef.remove(); // unlike
    } else {
      likeRef.update(true); // like
    }
  };

  const toggleCommentLike = async (commentId, isLiked) => {
    if (!userId || !postId) return;

    const ref = database().ref(
      `posts/${postId}/comments/${commentId}/likes/${userId}`,
    );

    if (isLiked) {
      await ref.remove(); // 🔴 unlike
    } else {
      await ref.set(true); // 🟢 like
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !userId || !postId) return;

    try {
      setSending(true);

      const newRef = database().ref(`posts/${postId}/comments`).push();

      await newRef.set({
        text: commentText,
        userId,
        name: auth().currentUser?.displayName || 'User',
        createdAt: Date.now(),
      });

      setCommentText('');
    } catch (err) {
      console.log('comment error', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Wrapper safeAreaPops={{ edges: ['bottom'] }}>
        <Header
          headerContainer={{
            marginTop: StatusBar.currentHeight,
          }}
          header={post?.name ? `${post.name}'s Post` : 'Post'}
        />

        {/* ✅ POST */}
        {post && (
          <View style={styles.postWrap}>
            <ChatCard
              item={{
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
              onLikePress={handleLike}
              onCommentPress={() => setShowCommentBox(!showCommentBox)}
            />
          </View>
        )}

        {/* ✅ COMMENTS */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsLabel}>Comments ({comments.length})</Text>

          {comments.map((item, index) => (
            <CommentCard
              key={item.id}
              item={item}
              index={index}
              formatTime={formatTime}
              onLikePress={() => toggleCommentLike(item.id, item.isLiked)}
            />
          ))}
        </View>

        {/* FAB */}
        {/* <TouchableOpacity
          style={{ ...styles.fab, bottom: showCommentBox ? 50 : 10 }}
          onPress={() => setShowCommentBox(!showCommentBox)}
        >
          <SvgImg iconName={chatIcon} height={28} width={28} />
        </TouchableOpacity> */}
      </Wrapper>
      {showCommentBox && (
        <View style={styles.inputContainer}>
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Write a comment..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.input}
            multiline
          />

          <TouchableOpacity
            onPress={handleAddComment}
            disabled={sending || !commentText.trim()}
            style={[
              styles.sendBtn,
              (!commentText.trim() || sending) && { opacity: 0.5 },
            ]}
          >
            <Text style={styles.sendText}>{sending ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
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

  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },

  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.white,
    fontFamily: fontFamily.montserratRegular,
    fontSize: 14,
    maxHeight: 100,
  },

  sendBtn: {
    marginLeft: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
  },

  sendText: {
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
    fontSize: 13,
  },
  postWrap: {
    marginBottom: 24,
  },

  commentsSection: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
  },
  commentsLabel: {
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
    marginBottom: 16,
  },

  commentItem: {
    marginBottom: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.3)',
  },
  commentName: {
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
  },
  commentTime: {
    fontFamily: fontFamily.montserratRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 1,
  },
  commentMsg: {
    fontFamily: fontFamily.montserratRegular,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginBottom: 12,
  },

  fab: {
    position: 'absolute',

    right: 24,
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: 'rgba(143,175,120,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});
