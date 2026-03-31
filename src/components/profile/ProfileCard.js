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
        activeOpacity={1}
        style={{
          ...styles.tutorialView,
          ...tutorialView,
          marginTop: index == 0 ? 10 : 0,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: colors.outline,
                padding: 12,
                borderRadius: 100,
              }}
            >
              <SvgImg iconName={option?.icon} height={28} width={28} />
            </View>
            <Text style={styles.tutorialTxt}>{option.title}</Text>
          </View>
          {option?.isMissingInfo && (
            <View
              style={{
                marginRight: 25,
                backgroundColor: colors.menuColor,
              }}
            >
              <Text style={styles.missingInfo}>Missing Info</Text>
            </View>
          )}
        </View>
        <View style={{ backgroundColor: 'blue' }}>
          <SvgImg iconName={backBtn} height={15} width={15} />
        </View>
      </TouchableOpacity>
    );
  } else {
    return null;
  }
}

const styles = StyleSheet.create({
  tutorialView: {
    marginBottom: 10,
    paddingVertical: 8,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  tutorialTxt: {
    fontSize: 14,
    color: colors.black,
    marginHorizontal: 14,
    fontFamily: fontFamily.montserratBold,
  },
  missingInfo: {
    padding: 8,
    fontSize: 10,
    color: colors.white,
    fontFamily: fontFamily.montserratMedium,
  },
});
