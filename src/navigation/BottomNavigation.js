import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SocialStack from './SocialStack';
import CustomTabBar from '../components/common/customTabBar';
import HabitsStack from './HabitsStack';
import ResourceStack from './ResourceStack';
import ProfileStack from './ProfileStack';
import Profile from '../screens/profile/profile';

const Tab = createBottomTabNavigator();

export default function BottomNavigation({ route }) {
  return (
    <Tab.Navigator
      initialRouteName="Habits"
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Habits" component={HabitsStack} />
      <Tab.Screen name="SocialStack" component={SocialStack} />
      <Tab.Screen name="Resources" component={ResourceStack} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
