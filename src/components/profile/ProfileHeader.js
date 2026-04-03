import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { color, colors, fontFamily } from './../../constant/index';
import { SearchBar, SvgImg, Wrapper } from '../../components';
import { chatIcon } from '../../assets/images';

export default function ProfileHeader({
  containerStyle = {},
  onProfileClick = () => {},
  profile = {
    name: '',
    date: '',
  },
}) {
  return (
    <View style={{ ...styles.container, ...containerStyle }}>
      <TouchableOpacity onPress={onProfileClick} style={styles.leftPhoto} />
      <View style={{ marginLeft: 12, justifyContent: 'center', flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            color: colors.white,
            fontFamily: fontFamily.montserratMedium,
          }}
        >
          {profile?.name}
        </Text>
        <Text
          style={{
            fontSize: 18,
            fontFamily: fontFamily.montserratBold,
            color: colors.white,
          }}
        >
          {profile?.date}
        </Text>
      </View>
      <View style={styles.chatBtn}>
        <SvgImg iconName={chatIcon} height={35} width={35} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  chatBtn: {
    width: 68,
    height: 68,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    marginTop: StatusBar.currentHeight,
    flexDirection: 'row',
    paddingBottom: 10,
  },
  leftPhoto: {
    backgroundColor: 'blue',
    width: 68,
    height: 68,
    borderRadius: 50,
  },
});
