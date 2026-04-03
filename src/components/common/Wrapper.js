import React from 'react';
import { View, StatusBar } from 'react-native';
import { colors } from '../../constant/colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export function Wrapper({
  children,
  isLoading,
  bgColor = colors.primary,
  statusBarColor = 'transparent',
  barStyle = 'light-content',
  translucent = false,
  containerStyle = {},
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bgColor,
      }}
    >
      <SafeAreaProvider>
        <StatusBar
          translucent={translucent}
          backgroundColor={statusBarColor}
          barStyle={barStyle}
        />
        <View style={{ paddingHorizontal: 23, flex: 1, ...containerStyle }}>
          {children}
        </View>
      </SafeAreaProvider>
      {/* <Loader isLoading={isLoading} /> */}
    </View>
  );
}
