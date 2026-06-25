import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { colors, fontFamily } from '../../constant';
import Modal from 'react-native-modal';

const AVATAR_COLORS = ['#4D6644', '#5A96FF', '#A782FF', '#FFC15A', '#6B9E6E'];

export default function ChatCard({
  isUser = false,
  item,
  index,
  onCardPress,
  onLikePress,
  onCommentPress,
  onDeletePress,
}) {
  const [liked, setLiked] = useState(item?.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(item?.likes ?? 0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  const initials =
    item?.name
      ?.split(' ')
      .map(w => w?.[0])
      .join('')
      .slice(0, 2) ?? 'U';

  const handleLike = () => {
    setLiked(prev => {
      setLikeCount(c => (prev ? c - 1 : c + 1));
      return !prev;
    });

    onLikePress?.(item);
  };

  const handleDelete = () => {
    setDeleteModal(false);
    setMenuVisible(false);
    onDeletePress?.(item);
  };

  const renderPostContent = item => {
    const renderers = {
      snack: () => (
        <View style={styles.beverageCard}>
          <Text style={styles.beverageTitle}>🍿 Snack: {item.snackName}</Text>
          <Text style={styles.typeText}>
            Snack Approved By: {item?.approvedBy}
          </Text>
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
    <>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onCardPress}
        style={styles.card}
      >
        {/* HEADER */}
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
                  uri: item?.avatar || item?.picture || item?.image,
                }}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item?.name}</Text>
            <Text style={styles.time}>{item?.time}</Text>
          </View>
          {/* MENU BUTTON */}
          {isUser ? (
            <TouchableOpacity
              style={styles.moreBtn}
              onPress={() => setMenuVisible(true)}
            >
              <Text style={styles.moreDots}>•••</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>

        {/* MESSAGE */}
        <Text
          style={{
            ...styles.message,
          }}
          numberOfLines={3}
        >
          {item?.message}
        </Text>

        <View>{renderPostContent(item)}</View>

        {/* IMAGE */}
        <Image
          source={{
            uri:
              item?.picture ||
              item?.image ||
              'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
          }}
          style={styles.postImage}
        />

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
            <Text style={{ fontSize: 16 }}>{liked ? '❤️' : '🤍'}</Text>
            <Text style={styles.actionText}>{likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onCommentPress?.(item)}
            style={styles.actionBtn}
          >
            <Text>💬</Text>
            <Text style={styles.actionText}>{item?.comments || 0}</Text>
          </TouchableOpacity>

          {/* <View style={styles.actionBtn}>
            <Text>↗️</Text>
            <Text style={styles.actionText}>Share</Text>
          </View> */}
        </View>
      </TouchableOpacity>

      {/* ================= MENU MODAL ================= */}
      <Modal
        isVisible={menuVisible}
        onBackdropPress={() => setMenuVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.5}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setDeleteModal(true);
              }}
            >
              <Text style={styles.deleteText}>🗑 Delete Post</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.menuText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ================= DELETE CONFIRM ================= */}
      <Modal transparent visible={deleteModal} animationType="fade">
        <View style={styles.overlayCenter}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Delete Post?</Text>
            <Text style={styles.confirmSub}>This action cannot be undone.</Text>

            <View style={styles.confirmRow}>
              <TouchableOpacity
                onPress={() => setDeleteModal(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    paddingVertical: 10,
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuBox: {
    width: 220,
    backgroundColor: '#121212',
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 6,
  },

  menuItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },

  menuText: {
    color: '#fff',
    textAlign: 'center',
  },

  deleteText: {
    color: '#ff5c5c',
    textAlign: 'center',
    fontWeight: '600',
  },

  overlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmBox: {
    width: 280,
    backgroundColor: '#1c1c1c',
    borderRadius: 16,
    padding: 18,
  },

  confirmTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },

  confirmSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 16,
  },

  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cancelBtn: {
    flex: 1,
    padding: 10,
    marginRight: 8,
    backgroundColor: '#333',
    borderRadius: 10,
    alignItems: 'center',
  },

  deleteBtn: {
    flex: 1,
    padding: 10,
    marginLeft: 8,
    backgroundColor: '#ff4d4d',
    borderRadius: 10,
    alignItems: 'center',
  },

  cancelText: { color: '#fff' },
  deleteBtnText: { color: '#fff', fontWeight: '700' },
});
