import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SvgImg } from '../common/SvgImg';
import { colors, fontFamily } from '../../constant';

export default function ProfileCard({
  index = 0,
  option = {},
  tutorialView = {},
}) {
  if (option?.title) {
    return (
      <TouchableOpacity
        onPress={() => option?.onPress(option, index)}
        activeOpacity={0.8}
        style={[
          styles.tutorialView,
          tutorialView,
          index === 0 && { marginTop: 10 },
        ]}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.iconContainer}>
              <SvgImg iconName={option?.icon} height={24} width={24} />
            </View>
            <Text style={styles.tutorialTxt}>{option.title}</Text>
          </View>
          {option?.isMissingInfo && (
            <View style={styles.missingBadge}>
              <Text style={styles.missingInfo}>Missing Info</Text>
            </View>
          )}
        </View>
        <View style={styles.arrowContainer}>
          <Svg width={7} height={12} viewBox="0 0 9 16" fill="none">
            <Path
              d="M1 1L8 8L1 15"
              stroke={colors.secondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </TouchableOpacity>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  tutorialView: {
    marginBottom: 10,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    backgroundColor: 'rgba(143,175,120,0.15)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.25)',
  },
  tutorialTxt: {
    fontSize: 15,
    color: colors.white,
    marginHorizontal: 14,
    fontFamily: fontFamily.montserratSemiBold,
  },
  missingBadge: {
    marginRight: 12,
    backgroundColor: colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  missingInfo: {
    padding: 2,
    fontSize: 10,
    color: colors.white,
    fontFamily: fontFamily.montserratMedium,
  },
  arrowContainer: {
    backgroundColor: 'rgba(143,175,120,0.12)',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
