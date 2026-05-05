import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontFamily } from '../../constant';

export function CommentCard({ item, index, formatTime, onLikePress }) {
  const [liked, setLiked] = useState(item?.isLiked ?? false);
  const [count, setCount] = useState(item?.likesCount ?? 0);

  // 🔄 sync with firebase updates
  useEffect(() => {
    setLiked(item?.isLiked ?? false);
  }, [item?.isLiked]);

  useEffect(() => {
    setCount(item?.likesCount ?? 0);
  }, [item?.likesCount]);

  const handleLike = () => {
    setLiked(prev => {
      setCount(c => (prev ? c - 1 : c + 1));
      return !prev;
    });

    onLikePress();
  };

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <View style={styles.commentAvatar} />

          <View style={{ marginLeft: 12 }}>
            <Text style={styles.commentName}>{item.name}</Text>
            <Text style={styles.commentTime}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>

        {/* ❤️ LIKE BUTTON */}
        <TouchableOpacity onPress={handleLike} style={styles.likeWrap}>
          <Text style={styles.heart}>{liked ? '❤️' : '🤍'}</Text>
          <Text style={[styles.count, liked && styles.likedText]}>{count}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.commentMsg}>{item.text}</Text>

      {index !== undefined && <View style={styles.divider} />}
    </View>
  );
}

const styles = StyleSheet.create({
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

  likeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heart: {
    fontSize: 16,
  },
  count: {
    color: '#aaa',
    fontSize: 12,
  },
  likedText: {
    color: '#FF6B8A',
  },
});
