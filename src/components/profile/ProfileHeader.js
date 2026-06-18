import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { colors, fontFamily } from '../../constant';
import Svg, { Path } from 'react-native-svg';
import { StreakCalendar } from '../common/calendar';
import moment from 'moment';
import auth from '@react-native-firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
const { height } = Dimensions.get('window');

export default function ProfileHeader({
  onPress,
  streakData,
  startDate,
  userData,
  profileData,
}) {
  const [showCalender, setShowCalender] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const userName =
    userData?.name ||
    profileData?.profile?.name ||
    auth()?.currentUser?.displayName ||
    'User';

  const initials = userName
    ?.split(' ')
    ?.map(word => word[0])
    ?.join('')
    ?.substring(0, 2)
    ?.toUpperCase();
  return (
    <SafeAreaView  edges={['top']}>
    <Animated.View
      style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-16, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.headerAvatar}>
        {userData?.avatar || profileData?.profile?.avatar ? (
          <Image
            source={{
              uri: profileData?.profile?.avatar || userData?.avatar,
            }}
            style={styles.headerAvatarImage}
          />
        ) : (
          <Text style={styles.headerAvatarText}>{initials}</Text>
        )}
      </View>
      <View style={styles.headerText}>
        <Text style={styles.headerGreeting}>
          {greeting} {userData?.name || profileData?.profile?.name || 'User'} 👋
        </Text>

        <TouchableOpacity onPress={() => setShowCalender(!showCalender)}>
          <Text style={styles.headerDate}>
            {moment().format('dddd, DD MMMM')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          style={styles.infoBtn}
          activeOpacity={0.8}
          onPress={() => setShowInsight(!showInsight)}
        >
          <Text style={styles.infoIcon}>i</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.chatBtn}
          activeOpacity={0.8}
          onPress={onPress}
        >
          <ChatBubbleIcon />
        </TouchableOpacity> */}
      </View>

      {(showInsight || showCalender) && (
        <View style={styles.insightBubble}>
          <Text style={styles.insightTitle}>Quiz Ring Guide</Text>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: colors.secondary },
                ]}
              />
              <Text style={styles.legendText}>Correct</Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: colors.bubbleDark },
                ]}
              />
              <Text style={styles.legendText}>Wrong</Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: '#EF4444' }]}
              />
              <Text style={styles.legendText}>Missed</Text>
            </View>
          </View>

          {/* Note */}
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              Your streak and insights are based on quiz activity.{'\n'}
              Attend quizzes consistently and improve your score to build
              stronger streaks and performance.
            </Text>
          </View>
        </View>
      )}

      {showCalender ? (
        <>
          <StreakCalendar
            startDate={startDate}
            streakData={streakData}
            showInsight={showInsight}
            setShowInsight={setShowInsight}
          />
        </>
      ) : (
        <View />
      )}
    </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  headerAvatarText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
  headerText: { flex: 1, marginLeft: 12 },
  headerGreeting: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  headerDate: {
    color: colors.white,
    fontSize: 17,
    fontFamily: fontFamily.montserratBold,
  },
  chatBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoIcon: {
    color: colors.secondary,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
  },

  insightBubble: {
    position: 'absolute',
    top: height * 0.65,
    backgroundColor: '#161B16',
    borderRadius: 18,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    zIndex: 999,
    elevation: 20,
  },
  headerAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 23,
  },
  insightArrow: {
    position: 'absolute',
    top: -7,
    right: 18,
    width: 14,
    height: 14,
    backgroundColor: '#161B16',
    transform: [{ rotate: '45deg' }],
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  insightTitle: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  legendItem: {
    alignItems: 'center',
    flex: 1,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 6,
  },

  legendText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
  },

  noteBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  noteText: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.montserratRegular,
  },
});
