import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { colors, fontFamily } from '../../constant';
import Svg, {
  Path,
  Circle,
  Defs,
  Stop,
  LinearGradient,
  RadialGradient,
} from 'react-native-svg';

const TABS = [
  { key: 1, name: 'Habits', label: 'Habits', Icon: HabitsIcon },
  { key: 2, name: 'SocialStack', label: 'Social', Icon: SocialIcon },
  {
    key: 3,
    name: 'Dashboard',
    label: 'Dashboard',
    Icon: DashboardIcon,
  }, // CENTER
  { key: 4, name: 'Resources', label: 'Resources', Icon: ResourcesIcon },
  { key: 5, name: 'Profile', label: 'Profile', Icon: ProfileIcon },
];

function HabitsIcon({ active }) {
  const color = active ? '#8FAF78' : 'rgba(255,255,255,0.4)';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 11l3 3L22 4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DashboardIcon({ active, activeColor }) {
  const color = active ? activeColor || '#8FAF78' : 'rgba(255,255,255,0.4)';

  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      {/* Top Left */}
      <Path
        d="M3 3H10V10H3V3Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Top Right */}
      <Path
        d="M14 3H21V7H14V3Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bottom Left */}
      <Path
        d="M3 14H7V21H3V14Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bottom Right */}
      <Path
        d="M14 11H21V21H14V11Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SocialIcon({ active }) {
  const color = active ? '#8FAF78' : 'rgba(255,255,255,0.4)';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ResourcesIcon({ active, activeColor }) {
  const color = active
    ? activeColor
      ? activeColor
      : '#8FAF78'
    : 'rgba(255,255,255,0.4)';

  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 19.5A2.5 2.5 0 016.5 17H20"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProfileIcon({ active }) {
  const color = active ? '#8FAF78' : 'rgba(255,255,255,0.4)';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx={12}
        cy={7}
        r={4}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
export default function CustomTabBar({ state, navigation }) {
  const onPress = tab => {
    navigation.navigate(tab.name);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.floatingBar}>
        {TABS.map((tab, index) => {
          const isCenter = index === 2;
          const isActive = state.index === index;
          const Icon = tab.Icon;

          return (
            <TouchableOpacity
              key={tab.key}
              style={{
                ...styles.tabItem,
              }}
              onPress={() => onPress(tab)}
              activeOpacity={0.8}
            >
              <Animated.View
                style={{
                  transform: [{ scale: isActive ? 1.15 : 1 }],
                }}
              >
                <Icon active={isActive} />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 30,
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },

  floatingBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#1C2419',
    borderRadius: 35,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerInner: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
