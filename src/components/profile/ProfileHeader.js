import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, fontFamily } from '../../constant';
import Svg, { Path } from 'react-native-svg';
import { StreakCalendar } from '../common/calendar';

export default function ProfileHeader({ onPress }) {
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

  function ChatBubbleIcon() {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          stroke="#8FAF78"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
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
        <Text style={styles.headerAvatarText}>LN</Text>
      </View>
      <View style={styles.headerText}>
        <Text style={styles.headerGreeting}>Hello Linh! 👋</Text>
        <TouchableOpacity onPress={() => setShowCalender(!showCalender)}>
          <Text style={styles.headerDate}>Thursday, 08 July</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.chatBtn}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <ChatBubbleIcon />
      </TouchableOpacity>
      {showCalender ? (
        <StreakCalendar
          showInsight={showInsight}
          setShowInsight={setShowInsight}
        />
      ) : (
        <View />
      )}
    </Animated.View>
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
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
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
});
