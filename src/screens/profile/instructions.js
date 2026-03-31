import React from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { Header, Wrapper } from '../../components';
import { colors, fontFamily } from '../../constant';
import ProfileCard from '../../components/profile/ProfileCard';
import { chatIcon } from '../../assets/images';

const { height, width } = Dimensions.get('window');
export default function Instructions({ navigation }) {
  const options = [
    {
      icon: chatIcon,
      isMissingInfo: false,
      title: 'Goals',
      screenName: 'PersonalProfile',
      onPress: item => onCardPress(item),
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

  const onCardPress = item => {
    navigation?.navigate('ProfileStack', {
      screen: 'InstructionsDetails',
      params: { item },
    });
  };

  return (
    <Wrapper containerStyle={{ paddingHorizontal: 0 }}>
      <Header
        header={`Instructions`}
        showRightBtn={true}
        textStyle={styles.textStyle}
        disableLeft={false}
        headerContainer={{ paddingHorizontal: 23 }}
      />

      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <View style={styles.pullBtn}></View>
        <View style={styles.content}>
          <View style={{ marginTop: 30, marginHorizontal: 23 }}>
            {options.map((option, index) => {
              return <ProfileCard key={index} option={option} index={index} />;
            })}
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
});
