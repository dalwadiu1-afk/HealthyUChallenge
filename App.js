import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/redux/store';
import { Provider } from 'react-redux';
import AppNav from './AppNav';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NavigationContainer>
          <AppNav />
        </NavigationContainer>
      </Provider>
    </SafeAreaProvider>
  );
}
