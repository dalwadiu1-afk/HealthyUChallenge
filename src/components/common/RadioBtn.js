import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, fontFamily } from '../../constant';

export function RadioBtn({
  options = [],
  label = 'Gender',
  selected,
  onPress,
  labelStyle,
}) {
  options = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];
  return (
    <View>
      {label && (
        <Text style={{ ...styles.inputLabel, ...labelStyle }}>{label}</Text>
      )}
      <View style={{ flexDirection: 'row' }}>
        {options.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.container}
            onPress={() => onPress(item)}
            activeOpacity={0.8}
          >
            {/* Outer circle */}
            <View
              style={[
                styles.outer,
                selected == item?.value && styles.outerActive,
              ]}
            >
              {/* Inner dot */}
              {selected == item?.value && <View style={styles.inner} />}
            </View>

            <Text style={styles.label}>{item?.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },

  outer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  outerActive: {
    borderColor: colors.secondary,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: fontFamily.montserratBold,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  inner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },

  label: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratMedium,
  },
});
