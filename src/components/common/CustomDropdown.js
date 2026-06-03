import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { colors, fontFamily } from '../../constant/index';

export function CustomDropdown({
  value,
  onSelect,
  options = [],
  placeholder = 'Select',
  containerStyle = {},
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(!open)}
        style={styles.button}
      >
        <Text style={[styles.buttonText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>

        <Text style={styles.arrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.menu}>
          {options.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => {
                onSelect(item);
                setOpen(false);
              }}
              style={[
                styles.item,
                index !== options.length - 1 && styles.itemBorder,
              ]}
            >
              <Text
                style={[styles.itemText, value === item && styles.selectedText]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 999,
  },

  button: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
  },

  placeholderText: {
    color: 'rgba(255,255,255,0.25)',
  },

  arrow: {
    color: colors.white,
    fontSize: 12,
  },

  menu: {
    marginTop: 4,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(143,175,120,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.2)',
  },

  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },

  itemText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
  },

  selectedText: {
    color: '#6A9455',
    fontFamily: fontFamily.montserratSemiBold,
  },
});
