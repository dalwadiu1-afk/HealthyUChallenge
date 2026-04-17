import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../constant/colors';
import { chatIcon, heartIcon, shareIcon } from '../../assets/images';
import { fontFamily } from '../../constant';
import { SvgImg } from '../common/SvgImg';

export default function ChatCard({
  item,
  index,
  onCardPress,
  chatContainer = {},
}) {
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onCardPress}
      style={{
        ...styles.chatContainer,
        ...chatContainer,
      }}
    >
      <TouchableOpacity activeOpacity={1} style={{ flexDirection: 'row' }}>
        <View style={styles.icon} />
        <View style={{ marginLeft: 27, justifyContent: 'center' }}>
          <Text
            style={{ fontSize: 16, fontFamily: fontFamily.montserratSemiBold }}
          >
            {item?.name}
          </Text>
          <Text style={styles.time}>{item?.time}</Text>
        </View>
      </TouchableOpacity>
      <View style={{ marginTop: 16 }}>
        <Text style={styles.message} numberOfLines={2} lineBreakMode="tail">
          {item?.message}
        </Text>
        <Image
          source={{
            uri: item?.picture,
          }}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginTop: 11,
          }}
          resizeMethod="auto"
        />
      </View>

      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          marginTop: 16,
        }}
      >
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <View style={styles.countContainer}>
            <SvgImg iconName={heartIcon} height={24} width={24} />
            <Text style={styles.counts}>{item?.likes}</Text>
          </View>

          {/* put Actionsheet here when I presss the commment Icon  */}
          <View
            style={{
              ...styles.countContainer,
              marginLeft: 24,
            }}
          >
            <SvgImg iconName={chatIcon} height={24} width={24} />
            <Text style={styles.counts}>{item?.comments}</Text>
          </View>
        </View>

        <View
          style={{
            ...styles.countContainer,
            marginLeft: 24,
          }}
        >
          <SvgImg iconName={shareIcon} height={24} width={24} />
          <Text style={styles.counts}>Share</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    marginBottom: 12,
    padding: 24,
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 36,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 100,
    backgroundColor: 'green',
  },
  time: {
    fontFamily: fontFamily.montserratRegular,
    fontSize: 14,
    lineHeight: 24,
    letterSpacing: 0,
  },
  message: {
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
    fontFamily: fontFamily.montserratMedium,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counts: {
    fontSize: 14,
    color: colors.black,
    paddingHorizontal: 10,
    fontWeight: 400,
    lineHeight: 24,
    letterSpacing: 0,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
