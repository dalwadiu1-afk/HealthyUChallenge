import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import SocialStack from '../../navigation/SocialStack';
import HabitsStack from '../../navigation/HabitsStack';
import ResourceStack from '../../navigation/ResourceStack';
import ProfileStack from '../../navigation/ProfileStack';
import { SvgImg } from '../../components/common/SvgImg';
import {
  chatIcon,
  habitIcon,
  profileIcon,
  resourceIcon,
  socialIcon,
} from '../../assets/images';
import { colors } from '../../constant/colors';

const { height, width } = Dimensions.get('window');

export default function CustomTabBar({ state, descriptors, navigation }) {
  const [tabIndex, setTabIndex] = useState(0);
  const bottomMenu = [
    {
      key: 1,
      name: 'Habits',
      displayName: 'Habits',
      component: HabitsStack,
      icon: habitIcon,
    },

    {
      key: 2,
      name: 'SocialStack',
      displayName: 'Social',
      component: SocialStack,
      icon: socialIcon,
    },
    {
      key: 3,
      name: 'Resources',
      displayName: 'Resources',
      component: ResourceStack,
      icon: resourceIcon,
    },
    {
      key: 4,
      name: 'Profile',
      displayName: 'Profile',
      component: ProfileStack,
      icon: profileIcon(),
    },
  ];
  useEffect(() => {
    setTabIndex(state?.index);
  }, [state?.index]);

  const onPress = (item, index) => {
    setTabIndex(index);
    navigation.navigate(item?.name);

    // navigation.dispatch(StackActions.navigate());
  };

  return (
    <View
      style={{
        backgroundColor: '#DBD9EC',
        flexDirection: 'row',
        elevation: 10,
        height: height * 0.1,
      }}
    >
      {bottomMenu.map((route, index) => {
        return (
          <View
            key={index}
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity
              style={{}}
              key={index}
              onPress={() => onPress(route, index)}
            >
              {tabIndex != index ? (
                <SvgImg
                  iconName={route?.icon}
                  size={30}
                  style={{ alignSelf: 'center' }}
                />
              ) : (
                <View
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text
                    style={{
                      color: tabIndex == index ? colors.primary : colors.dark,
                      ...styles.activeTabText,
                    }}
                  >
                    {route?.displayName}
                  </Text>
                  <View
                    style={{
                      height: height * 0.01,
                      width: height * 0.01,
                      backgroundColor: colors.primary,
                      borderRadius: 100,
                    }}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeTabText: {
    // font-family: Circular Std;
    fontWeight: 700,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
    textAlign: 'center',
  },
});
