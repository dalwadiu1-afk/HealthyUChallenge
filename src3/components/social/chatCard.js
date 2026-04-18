import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, fontFamily } from '../../constant';

const AVATAR_COLORS = ['#4D6644', '#5A96FF', '#A782FF', '#FFC15A', '#6B9E6E'];

export default function ChatCard({ item, index, onCardPress }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item?.likes ?? 0);
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials =
    item?.name
      ?.split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2) ?? 'U';

  const handleLike = () => {
    setLiked(p => !p);
    setLikeCount(p => (liked ? p - 1 : p + 1));
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onCardPress}
      style={styles.card}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item?.name}</Text>
          <Text style={styles.time}>{item?.time}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn} activeOpacity={0.7}>
          <Text style={styles.moreDots}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* Message */}
      <Text style={styles.message} numberOfLines={3}>
        {item?.message}
      </Text>

      {/* Image */}
      {item?.picture && (
        <Image
          source={{ uri: item.picture }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Footer actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionIcon, liked && styles.likedIcon]}>
            {liked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, liked && { color: '#FF6B8A' }]}>
            {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{item?.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Text style={styles.actionIcon}>↗️</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
  },
  time: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.38)',
    fontFamily: fontFamily.montserratRegular,
    marginTop: 1,
  },
  moreBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  moreDots: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    letterSpacing: 1,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.78)',
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 190,
    borderRadius: 14,
    marginBottom: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 5,
  },
  actionIcon: {
    fontSize: 16,
  },
  likedIcon: {
    fontSize: 16,
  },
  actionText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
});
