const admin = require('firebase-admin');
const moment = require('moment-timezone');

const { onSchedule } = require('firebase-functions/v2/scheduler');
const logger = require('firebase-functions/logger');

admin.initializeApp();
const db = admin.database();

// ========================================
// SEND PUSH NOTIFICATION
// ========================================

const sendPushNotification = async ({
  token,
  title,
  body,
  screen = 'QuizBoard',
}) => {
  try {
    if (!token) return;

    const message = {
      token,
      notification: { title, body },
      data: { screen },

      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          sound: 'default',
        },
      },

      apns: {
        payload: {
          aps: {
            sound: 'default',
            contentAvailable: true,
          },
        },
      },
    };

    await admin.messaging().send(message);
    logger.log('Notification sent:', title);
  } catch (e) {
    logger.error('SEND ERROR:', e);
  }
};

// ========================================
// TUESDAY QUIZ REMINDER
// ========================================

exports.tuesdayQuizReminder = onSchedule(
  {
    schedule: '0 * * * *',
    timeZone: 'America/New_York',
  },
  async () => {
    const usersSnap = await db.ref('/users').once('value');
    const users = usersSnap.val() || {};

    const promises = [];

    Object.entries(users).forEach(([uid, user]) => {
      const token = user?.fcmToken;
      const timezone = user?.timezone || 'America/New_York';

      const now = moment().tz(timezone);

      if (now.day() === 2 && now.hour() === 12) {
        promises.push(
          sendPushNotification({
            token,
            title: '🔥 Wellness Wednesday Tomorrow!',
            body: 'Don’t miss the Wellness Wednesday quiz tomorrow for double points!',
          }),
        );
      }
    });

    await Promise.all(promises);
  },
);

// ========================================
// WEDNESDAY DOUBLE POINTS
// ========================================

exports.wednesdayDoublePoints = onSchedule(
  {
    schedule: '0 * * * *',
    timeZone: 'America/New_York',
  },
  async () => {
    const usersSnap = await db.ref('/users').once('value');
    const users = usersSnap.val() || {};

    const promises = [];

    Object.entries(users).forEach(([uid, user]) => {
      const token = user?.fcmToken;
      const timezone = user?.timezone || 'America/New_York';

      const now = moment().tz(timezone);

      if (now.day() === 3 && now.hour() === 12) {
        promises.push(
          sendPushNotification({
            token,
            title: '🏆 Wellness Wednesday',
            body: 'Earn your place on the leaderboard with double quiz points!',
          }),
        );
      }
    });

    await Promise.all(promises);
  },
);

// ========================================
// SMART LEADERBOARD PUSH
// ========================================

exports.smartLeaderboardPush = onSchedule(
  {
    schedule: '0 18 * * *',
    timeZone: 'America/New_York',
  },
  async () => {
    const leaderboardSnap = await db.ref('/leaderboards').once('value');
    const leaderboards = leaderboardSnap.val() || {};

    const sortedUsers = Object.entries(leaderboards)
      .map(([uid, data]) => ({
        uid,
        points: data?.challenge?.totalChallengePoints || 0,
        token: data?.fcmToken,
      }))
      .sort((a, b) => b.points - a.points);

    const promises = [];

    sortedUsers.forEach((user, index) => {
      const rank = index + 1;

      if (rank <= 10 && user.token) {
        promises.push(
          sendPushNotification({
            token: user.token,
            title: `🔥 You're Rank #${rank}`,
            body: 'Keep pushing to stay on top of the leaderboard!',
          }),
        );
      }
    });

    await Promise.all(promises);
  },
);
