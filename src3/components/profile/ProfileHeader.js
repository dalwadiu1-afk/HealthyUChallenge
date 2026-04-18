import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { colors, fontFamily } from '../../constant/index';
import { SvgImg } from '../../components';
import { StreakCalendar } from '../../components/common/calendar';
import { chatIcon } from '../../assets/images';

export default function ProfileHeader({
  containerStyle = {},
  onProfileClick = () => {},
  profile = { name: '', date: '' },
}) {
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={{ flexDirection: 'column', flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Avatar */}
          <TouchableOpacity
            onPress={onProfileClick}
            style={styles.leftPhoto}
            activeOpacity={0.8}
          />

          {/* Name + date */}
          <View style={{ marginLeft: 12, justifyContent: 'center', flex: 1 }}>
            <Text style={styles.name}>{profile?.name}</Text>
            <TouchableOpacity
              onPress={() => setShowCalendar(v => !v)}
              activeOpacity={0.75}
            >
              <Text style={styles.date}>{profile?.date}</Text>
            </TouchableOpacity>
          </View>

          {/* Chat / action button */}
          <View style={styles.chatBtn}>
            <SvgImg iconName={chatIcon} height={35} width={35} />
          </View>
        </View>

        {/* Dropdown calendar */}
        {showCalendar && (
          <View style={styles.calendarWrap}>
            <StreakCalendar
              container={{ position: 'relative', top: 0, width: '100%' }}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight,
    flexDirection: 'row',
    paddingBottom: 10,
  },
  leftPhoto: {
    backgroundColor: colors.primary,
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  name: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fontFamily.montserratMedium,
  },
  date: {
    fontSize: 17,
    fontFamily: fontFamily.montserratBold,
    color: colors.white,
  },
  chatBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarWrap: {
    marginTop: 12,
  },
});
