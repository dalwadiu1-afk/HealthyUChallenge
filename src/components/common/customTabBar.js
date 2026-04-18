import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { fontFamily } from '../../constant';

const TABS = [
  { key: 1, name: 'Habits', label: 'Habits' },
  { key: 2, name: 'SocialStack', label: 'Social' },
  { key: 3, name: 'ResourcesList', label: 'Resources' },
  { key: 4, name: 'Profile', label: 'Profile' },
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

function ResourcesIcon({ active }) {
  const color = active ? '#8FAF78' : 'rgba(255,255,255,0.4)';
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

const TAB_ICONS = [HabitsIcon, SocialIcon, ResourcesIcon, ProfileIcon];

function TabItem({ tab, iconComponent: IconComponent, isActive, onPress }) {
  const borderOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const iconScale = useRef(new Animated.Value(isActive ? 1.1 : 1)).current;
  const labelOpacity = useRef(new Animated.Value(isActive ? 1 : 0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(borderOpacity, {
        toValue: isActive ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: isActive ? 1.1 : 1,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacity, {
        toValue: isActive ? 1 : 0.4,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Top border indicator */}
      <Animated.View style={[styles.topBorder, { opacity: borderOpacity }]} />

      <Animated.View style={{ transform: [{ scale: iconScale }] }}>
        <IconComponent active={isActive} />
      </Animated.View>

      <Animated.Text
        style={[
          styles.label,
          {
            opacity: labelOpacity,
            color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
            fontFamily: isActive
              ? fontFamily.montserratBold
              : fontFamily.montserratMedium,
          },
        ]}
      >
        {tab.label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

export default function CustomTabBar({ state, navigation }) {
  const [tabIndex, setTabIndex] = useState(state?.index ?? 0);

  useEffect(() => {
    setTabIndex(state?.index);
  }, [state?.index]);

  const onPress = (tab, index) => {
    setTabIndex(index);
    navigation.navigate(tab.name);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabBar}>
        {TABS.map((tab, index) => (
          <TabItem
            key={tab.key}
            tab={tab}
            iconComponent={TAB_ICONS[index]}
            isActive={tabIndex === index}
            onPress={() => onPress(tab, index)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 0,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#161D15',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    position: 'relative',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: '15%',
    right: '15%',
    height: 2,
    backgroundColor: '#8FAF78',
    borderRadius: 2,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
