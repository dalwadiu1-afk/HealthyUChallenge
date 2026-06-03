import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

// ========================================
// BACKGROUND / KILLED STATE MESSAGE
// ========================================

messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    await notifee.displayNotification({
      title: remoteMessage?.notification?.title,
      body: remoteMessage?.notification?.body,
      data: remoteMessage?.data,

      android: {
        channelId: 'default',
        pressAction: {
          id: 'default',
        },
      },
    });

    console.log('BACKGROUND NOTIFICATION SHOWN');
  } catch (e) {
    console.log('BACKGROUND NOTIFICATION ERROR:', e);
  }
});
