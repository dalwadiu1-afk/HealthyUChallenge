import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { Header, SvgImg, Wrapper } from '../../components';
import { colors, fontFamily } from '../../constant';
import ProfileCard from '../../components/profile/ProfileCard';
import { chatIcon } from '../../assets/images';

const { height, width } = Dimensions.get('window');
export default function InstructionsDetails() {
  const options = [
    {
      icon: chatIcon,
      isMissingInfo: false,
      title: 'Goals',
      screenName: 'PersonalProfile',
      onPress: item => onCardPress(item, user),
    },
    {
      icon: chatIcon,
      title: 'My Body',
      isMissingInfo: true,
      screenName: 'ShippingInfo',
      onPress: item => onCardPress(item),
    },
    {
      icon: chatIcon,
      title: 'Instructions',
      isMissingInfo: true,
      screenName: 'ShippingInfo',
      onPress: item => onCardPress(item),
    },
  ];
  return (
    <Wrapper containerStyle={{ paddingHorizontal: 0 }}>
      <Header
        header={`Instructions`}
        showRightBtn={true}
        textStyle={styles.textStyle}
        disableLeft={false}
        headerContainer={{ paddingHorizontal: 23 }}
      />
      <View
        style={{
          flex: 0.3,
          backgroundColor: 'transparent',
          justifyContent: 'center',
        }}
      >
        <Image
          source={{
            uri: 'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
          }}
          style={{
            height: height * 0.15,
            width: height * 0.15,
            borderRadius: 100,
            alignSelf: 'center',
          }}
        />
      </View>
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <View style={styles.pullBtn} />
        <View style={styles.content}>
          <View
            style={{
              marginTop: height * 0.05,
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <SvgImg iconName={chatIcon} height={35} width={35} />
              <Text style={styles.cardText}>246 K cal</Text>
              <Text style={styles.cardTextTime}>Last 7 days</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <SvgImg iconName={chatIcon} height={35} width={35} />
              <Text style={styles.cardText}>246 K cal</Text>
              <Text style={styles.cardTextTime}>Last 7 days</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <SvgImg iconName={chatIcon} height={35} width={35} />
              <Text style={styles.cardText}>246 K cal</Text>
              <Text style={styles.cardTextTime}>Last 7 days</Text>
            </View>
          </View>
          <View style={{ marginTop: 30, marginHorizontal: 23 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: fontFamily.montserratSemiBold,
              }}
            >
              Informations
            </Text>

            <Text
              style={{
                marginTop: 12,
                fontSize: 14,
                fontFamily: fontFamily.montserratRegular,
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              suscipit auctor dui, sed efficitur ipsum. Donec a nunc eget
              ligulad 3 Lore{'\n'} ipsum dolor sit amet, consectetur adipiscing
              elit. Donec suscipit auctor dui, sed efficitur ipsum. Donec a nunc
              eget ligulad Lorem ipsum dolor sit amet, consectetur adipiscing
              elit. Donec suscipit auctor dui, sed efficitur ipsum. Donec a nunc
              eget ligulad
            </Text>
          </View>
        </View>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    fontFamily: fontFamily.montserratSemiBold,
  },
  pullBtn: {
    height: 65,
    width: 65,
    backgroundColor: 'red',
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 100,
    zIndex: 1,
  },
  content: {
    flex: 1,
    marginTop: 30,
    backgroundColor: colors.white,
    borderRadius: 30,
  },
  cardText: {
    fontSize: 14,
    fontFamily: fontFamily.interBold,
    paddingVertical: 2,
  },
  cardTextTime: {
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
    color: colors.grey,
  },
});
