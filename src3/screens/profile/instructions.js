import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily } from '../../constant';
import ProfileCard from '../../components/profile/ProfileCard';
import { chatIcon } from '../../assets/images';

export default function Instructions({ navigation }) {
  const options = [
    {
      icon: chatIcon,
      isMissingInfo: false,
      title: 'Goals',
      screenName: 'PersonalProfile',
      onPress: item => onCardPress(item),
    },
    {
      icon: chatIcon,
      title: 'My Body',
      isMissingInfo: true,
      screenName: 'ShippingInfo',
      onPress: item => onCardPress(item),
    },
    {
      icon: chatIcon,
      title: 'Instructions',
      isMissingInfo: true,
      screenName: 'ShippingInfo',
      onPress: item => onCardPress(item),
    },
  ];

  const onCardPress = item => {
    navigation?.navigate('InstructionsDetails', { item });
  };

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
            <Path
              d="M8 1L1 8L8 15"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Instructions</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionText}>Your Profile Settings</Text>
        </View>

        {options.map((option, index) => (
          <ProfileCard key={index} option={option} index={index} />
        ))}
      </ScrollView>
    </View>
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
    marginBottom: 24,
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
    paddingBottom: 48,
  },

  sectionLabel: {
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
