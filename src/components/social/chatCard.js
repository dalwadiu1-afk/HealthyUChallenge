import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, fontFamily } from '../../constant';

const AVATAR_COLORS = ['#4D6644', '#5A96FF', '#A782FF', '#FFC15A', '#6B9E6E'];

export default function ChatCard({
  item,
  index,
  onCardPress,
  onLikePress,
  onCommentPress,
}) {
  const [liked, setLiked] = useState(item?.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(item?.likes ?? 0);
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials =
    item?.name
      ?.split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2) ?? 'U';

  const handleLike = () => {
    setLiked(prevLiked => {
      setLikeCount(prevCount => (prevLiked ? prevCount - 1 : prevCount + 1));
      return !prevLiked;
    });

    onLikePress && onLikePress();
  };

  useEffect(() => {
    setLiked(item?.isLiked ?? false);
  }, [item?.isLiked]);

  useEffect(() => {
    setLikeCount(item?.likes ?? 0);
  }, [item?.likes]);

  const renderPostContent = item => {
    const renderers = {
      snack: () => (
        <View style={styles.beverageCard}>
          <Text style={styles.beverageTitle}>🍿 Snack: {item.snackName}</Text>
          <Text style={styles.typeText}>Quantity: {item.qty}</Text>
          <Text style={styles.typeText}>Healthy Snack Challenge</Text>
        </View>
      ),

      beverage: () => (
        <View style={styles.beverageCard}>
          <Text style={styles.beverageTitle}>🍹 {item.beverageName}</Text>

          {item.ingredients?.length > 0 && (
            <View style={styles.ingredientsWrap}>
              {item.ingredients.map((i, idx) => (
                <View key={idx} style={styles.ingredientPill}>
                  <Text style={styles.ingredientText}>#{i}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.typeText}>Healthy Beverage Challenge</Text>
        </View>
      ),

      post: () => null,
    };

    return renderers[item.type]?.() || null;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onCardPress}
      style={styles.card}
    >
      {/* Header row */}
      <View
        style={{
          ...styles.headerRow,
          marginBottom: item?.beverageName ? 0 : 12,
        }}
      >
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          {item?.avatar ? (
            <Image
              source={{
                uri:
                  item.picture ||
                  'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
              }}
              style={{ height: '100%', width: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
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
      <Text
        style={{ ...styles.message, marginBottom: item?.beverageName ? 0 : 12 }}
        numberOfLines={3}
      >
        {item?.message}
      </Text>

      <View>{renderPostContent(item)}</View>

      {/* Image */}
      <Image
        source={{
          uri:
            item.picture ||
            item.image ||
            'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
        }}
        style={styles.postImage}
        resizeMode="cover"
      />

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

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={onCommentPress}
        >
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
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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
  beverageCard: {
    backgroundColor: 'rgba(106,148,85,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(106,148,85,0.18)',
    padding: 12,
    marginBottom: 12,
  },

  beverageTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 10,
  },

  ingredientsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  ingredientPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  ingredientText: {
    color: '#8FD175',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },

  typeText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 12,
  },
});
