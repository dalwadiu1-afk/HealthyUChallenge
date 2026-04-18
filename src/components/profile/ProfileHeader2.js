import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { color, colors, fontFamily } from '../../constant/index';
import { SearchBar, StreakCalendar, SvgImg, Wrapper } from '..';
import { chatIcon } from '../../assets/images';

const { height } = Dimensions.get('window');
export default function ProfileHeader({
  containerStyle = {},
  onProfileClick = () => {},
  profile = {
    name: '',
    date: '',
  },
}) {
  const [showCalender, setShowCalender] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  return (
    <View style={{ ...styles.container, ...containerStyle }}>
      <View style={{ flexDirection: 'column', flex: 1 }}>
        <View style={{ flexDirection: 'row' }}>
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
            <TouchableOpacity onPress={() => setShowCalender(!showCalender)}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: fontFamily.montserratBold,
                  color: colors.white,
                }}
              >
                {profile?.date}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chatBtn}>
            <SvgImg iconName={chatIcon} height={35} width={35} />
          </View>
        </View>
        <View>
          {showCalender ? (
            <StreakCalendar
              container={{ top: height * 0.012, width: '100%' }}
              showInsight={showInsight}
              setShowInsight={setShowInsight}
            />
          ) : (
            <View />
          )}
        </View>
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
