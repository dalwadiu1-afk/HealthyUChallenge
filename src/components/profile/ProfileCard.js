import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { backBtn } from '../../assets/images';
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
        style={{
          ...styles.tutorialView,
          ...tutorialView,
          marginTop: index == 0 ? 10 : 0,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.iconContainer}>
              <SvgImg iconName={option?.icon} height={28} width={28} />
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
          <SvgImg iconName={backBtn} height={15} width={15} />
        </View>
      </TouchableOpacity>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  tutorialView: {
    marginBottom: 10,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 100,
  },
  tutorialTxt: {
    fontSize: 15,
    color: colors.textPrimary,
    marginHorizontal: 14,
    fontFamily: fontFamily.poppinsSemiBold,
  },
  missingBadge: {
    marginRight: 12,
    backgroundColor: colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  missingInfo: {
    padding: 2,
    fontSize: 10,
    color: colors.white,
    fontFamily: fontFamily.interMedium,
  },
  arrowContainer: {
    backgroundColor: colors.accent,
    padding: 8,
    borderRadius: 8,
  },
});
