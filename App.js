import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import AppNav from './AppNav';

import messaging from '@react-native-firebase/messaging';
import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import analytics from '@react-native-firebase/analytics';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

import { navigate, navigationRef } from './src/utils/navigationService';
import { StatusBar } from 'react-native';

export async function createNotificationChannel() {
  await notifee.requestPermission();

  return await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
}

export default function App() {
  // =========================
  // CREATE NOTIFICATION CHANNEL
  // =========================
  useEffect(() => {
    createNotificationChannel();
  }, []);

  // =========================
  // SAVE FCM TOKEN + TIMEZONE
  // =========================
  useEffect(() => {
    const uid = auth().currentUser?.uid;

    if (!uid) {
      return;
    }

    let unsubscribeTokenRefresh;

    const setupFCM = async () => {
      try {
        await messaging().requestPermission();

        const uid = auth().currentUser?.uid;

        if (!uid) {
          return;
        }

        const token = await messaging().getToken();

        const tokenRef = database().ref(`/users/${uid}/fcmToken`);

        const snapshot = await tokenRef.once('value');
        const existingToken = snapshot.val();

        if (existingToken !== token) {
          await database().ref(`/users/${uid}`).update({
            fcmToken: token,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            fcmUpdatedAt: Date.now(),
          });

          console.log('FCM Token Saved:', token);
        }

        unsubscribeTokenRefresh = messaging().onTokenRefresh(async newToken => {
          try {
            await database().ref(`/users/${uid}`).update({
              fcmToken: newToken,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              fcmUpdatedAt: Date.now(),
            });

            console.log('FCM Token Refreshed:', newToken);
          } catch (error) {
            console.log('TOKEN REFRESH ERROR:', error);
          }
        });
      } catch (error) {
        console.log('FCM SETUP ERROR:', error);
      }
    };

    setupFCM();

    return () => {
      if (unsubscribeTokenRefresh) {
        unsubscribeTokenRefresh();
      }
    };
  }, []);

  // =========================
  // FOREGROUND NOTIFICATIONS
  // =========================
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const title =
        remoteMessage?.notification?.title ||
        remoteMessage?.data?.title ||
        'Notification';

      const body =
        remoteMessage?.notification?.body ||
        remoteMessage?.data?.body ||
        'You have a new update';

      await notifee.displayNotification({
        title,
        body,
        data: remoteMessage?.data,

        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
          pressAction: { id: 'default' },
        },
      });

      await analytics().logEvent('notification_received', {
        title,
        screen: remoteMessage?.data?.screen || 'unknown',
      });
    });
    return unsubscribe;
  }, []);

  // =========================
  // FOREGROUND CLICK HANDLER
  // =========================
  useEffect(() => {
    return notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const screen = detail?.notification?.data?.screen;

        analytics().logEvent('notification_clicked', {
          screen: detail?.notification?.data?.screen || 'unknown',
          source: 'foreground',
        });
        console.log(
          'navigationRef.current quit_state :>> ',
          navigationRef.current,
          screen,
        );

        if (screen === 'QuizBoard') {
          navigationRef.current?.navigate('Dashboard', {
            screen: 'DashBoard',
            params: {},
          });
        }
      }
    });
  }, []);

  // =========================
  // BACKGROUND / KILLED CLICK
  // =========================
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      const screen = remoteMessage?.data?.screen;
      analytics().logEvent('notification_clicked', {
        screen: remoteMessage?.data?.screen || 'unknown',
        source: 'background',
      });

      console.log(
        'navigationRef.current quit_state :>> ',
        navigationRef.current,
        screen,
      );
      if (screen === 'QuizBoard') {
        setTimeout(() => {
          navigationRef.current?.navigate('Dashboard', {
            screen: 'DashBoard',
            params: {},
          });
        }, 1000);
      }
    });

    return unsubscribe;
  }, []);

  // =========================
  // APP OPENED FROM KILLED STATE
  // =========================
  useEffect(() => {
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setBarStyle('light-content');
    async function checkInitialNotification() {
      const remoteMessage = await messaging().getInitialNotification();

      if (remoteMessage) {
        const screen = remoteMessage?.data?.screen;

        analytics().logEvent('notification_clicked', {
          screen: screen || 'unknown',
          source: 'quit_state',
        });
        console.log(
          'navigationRef.current quit_state :>> ',
          navigationRef.current,
          screen,
        );

        if (screen === 'QuizBoard') {
          setTimeout(() => {
            navigationRef.current?.navigate('Profile', {
              screen: 'QuizBoard',
              params: {},
            });
          }, 1500);
        }
      }
    }

    checkInitialNotification();
  }, []);

  // =========================
  // OPTIONAL DEEP LINKING
  // =========================

  useEffect(() => {
    const checkInitialNotification = async () => {
      const initialNotification = await notifee.getInitialNotification();

      const screen = initialNotification?.notification?.data?.screen;

      if (screen === 'QuizBoard') {
        setTimeout(() => {
          navigate('QuizBoard');
        }, 1500);
      }
    };

    checkInitialNotification();
  }, []);

  const linking = {
    prefixes: ['yourapp://'],
    config: {
      screens: {
        Profile: {
          screens: {
            QuizBoard: 'quizboard',
          },
        },
      },
    },
  };

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NavigationContainer ref={navigationRef} linking={linking}>
          <AppNav />
        </NavigationContainer>
      </Provider>
    </SafeAreaProvider>
  );
}
