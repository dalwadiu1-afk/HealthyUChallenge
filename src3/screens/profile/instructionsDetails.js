import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily } from '../../constant';
import { SvgImg } from '../../components';
import { chatIcon } from '../../assets/images';

const { height } = Dimensions.get('window');

export default function InstructionsDetails({ navigation }) {
  const stats = [
    { label: '246 K cal', sub: 'Last 7 days' },
    { label: '3.2 km', sub: 'Distance' },
    { label: '48 min', sub: 'Active time' },
  ];

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
        {/* Profile image */}
        <View style={styles.avatarWrap}>
          <Image
            source={{
              uri: 'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
            }}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>

        {/* Stats row */}
        <View style={styles.statsCard}>
          {stats.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.statsDivider} />}
              <View style={styles.statItem}>
                <SvgImg iconName={chatIcon} height={28} width={28} />
                <Text style={styles.statValue}>{s.label}</Text>
                <Text style={styles.statSub}>{s.sub}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Info section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informations</Text>
          <Text style={styles.infoBody}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
            suscipit auctor dui, sed efficitur ipsum. Donec a nunc eget ligula.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
            suscipit auctor dui, sed efficitur ipsum. Donec a nunc eget ligula.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
            suscipit auctor dui, sed efficitur ipsum.
          </Text>
        </View>
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
    marginBottom: 20,
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

  avatarWrap: {
    alignSelf: 'center',
    width: height * 0.13,
    height: height * 0.13,
    borderRadius: height * 0.065,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: colors.secondary,
    marginBottom: 24,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statsDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    fontSize: 14,
    fontFamily: fontFamily.interBold,
    color: colors.white,
    marginTop: 6,
  },
  statSub: {
    fontSize: 11,
    fontFamily: fontFamily.montserratRegular,
    color: 'rgba(255,255,255,0.4)',
  },

  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
    marginBottom: 12,
  },
  infoBody: {
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 22,
  },
});
