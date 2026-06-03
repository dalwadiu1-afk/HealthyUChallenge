/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

import './notificationHandler'; // optional helper file

// ===============================
// REQUIRED: BACKGROUND HANDLER
// ===============================
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   await notifee.displayNotification({
//     title: remoteMessage?.notification?.title || 'Reminder',
//     body: remoteMessage?.notification?.body || '',
//     data: remoteMessage?.data || {},
//     android: {
//       channelId: 'default',
//       pressAction: {
//         id: 'default',
//       },
//     },
//   });
// });

AppRegistry.registerComponent(appName, () => App);
