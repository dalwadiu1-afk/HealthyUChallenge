import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './src/navigation/AuthStack';
import BottomNavigation from './src/navigation/BottomNavigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FeedStack } from './src/navigation/SocialStack';
import ProfileStack from './src/navigation/ProfileStack';

const Stack = createNativeStackNavigator();
const MainStack = () => {
  <Stack.Navigator
    initialRouteName="BottomNavigation"
    screenOptions={{ headerShown: false, unmountOnBlur: true }}
  >
    <Stack.Screen name="BottomNavigation" component={BottomNavigation} />
    <Stack.Screen name="FeedStack" component={FeedStack} />
    <Stack.Screen name="ProfileStack" component={ProfileStack} />
  </Stack.Navigator>;
};

export default function App() {
  return (
    <NavigationContainer>
      {/* <AuthStack /> */}
      <Stack.Navigator
        initialRouteName="BottomNavigation"
        screenOptions={{ headerShown: false, unmountOnBlur: true }}
      >
        <Stack.Screen name="BottomNavigation" component={BottomNavigation} />
        <Stack.Screen name="FeedStack" component={FeedStack} />
        <Stack.Screen name="ProfileStack" component={ProfileStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
