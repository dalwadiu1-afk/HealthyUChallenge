import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import AppNav from './AppNav';

import messaging from '@react-native-firebase/messaging';
import notifee, { EventType, AndroidImportance } from '@notifee/react-native';

import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

import { navigate, navigationRef } from './src/utils/navigationService';

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
    async function setupFCM() {
      try {
        // REQUEST PERMISSION
        await messaging().requestPermission();

        // GET TOKEN
        const token = await messaging().getToken();

        const uid = auth()?.currentUser?.uid;

        if (uid && token) {
          await database().ref(`/users/${uid}`).update({
            fcmToken: token,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });

          // OPTIONAL
          console.log('FCM TOKEN SAVED');
        }
      } catch (e) {
        console.log('FCM SETUP ERROR:', e);
      }
    }

    setupFCM();
  }, []);

  // =========================
  // FOREGROUND NOTIFICATIONS
  // =========================
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📩 FCM RECEIVED:', remoteMessage);

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

        if (screen === 'QuizBoard') {
          navigationRef.current?.navigate('QuizBoard');
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

      if (screen === 'QuizBoard') {
        setTimeout(() => {
          navigationRef.current?.navigate('QuizBoard');
        }, 1000);
      }
    });

    return unsubscribe;
  }, []);

  // =========================
  // APP OPENED FROM KILLED STATE
  // =========================
  useEffect(() => {
    async function checkInitialNotification() {
      const remoteMessage = await messaging().getInitialNotification();

      if (remoteMessage) {
        const screen = remoteMessage?.data?.screen;

        if (screen === 'QuizBoard') {
          setTimeout(() => {
            navigationRef.current?.navigate('QuizBoard');
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
        bottomTab: {
          screens: {
            ProfileStack: {
              screens: {
                QuizBoard: 'quizboard',
              },
            },
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
