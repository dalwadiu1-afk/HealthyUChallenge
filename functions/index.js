const admin = require('firebase-admin');
const moment = require('moment-timezone');

const { onSchedule } = require('firebase-functions/v2/scheduler');
const logger = require('firebase-functions/logger');

admin.initializeApp();
const db = admin.database();

// =======================================================
// HABITS CONFIG (IMPORTANT: used in reminder engine)
// =======================================================

const ALL_HABITS = [
  {
    key: 'booking',
    title: 'Nutrition Session',
    description: 'Book and attend a free nutrition counseling session',
    screenName: 'BookAnAppointment',
  },
  {
    key: 'steps',
    title: 'Daily Steps',
    description: 'Walk your target number of steps every day',
    screenName: 'WalkingRewardBoard',
  },
  {
    key: 'fiber',
    title: 'Fiber Goal',
    description: 'Eat 25–38g fiber daily for at least 20 days',
    screenName: 'DailyFiberCounts',
  },
  {
    key: 'sleep',
    title: 'Sleep Well',
    description: 'Get 7–9 hours of sleep each night',
    screenName: 'SleepMeasure',
  },
  {
    key: 'fitness',
    title: 'Fitness Class',
    description: 'Join a weekly fitness class',
    screenName: 'WeeklyFitnessClass',
  },
  {
    key: 'weightTraining',
    title: 'Strength Training',
    description: 'Do weight training at least 2x per week',
    screenName: 'WeightResistanceTraining',
  },
  {
    key: 'weightChallenge',
    title: 'Safe Weight Loss',
    description: 'Lose no more than 2 lbs per week for 4 weeks',
    screenName: 'WeightChallengeUI',
  },
  {
    key: 'halfPlateChallenge',
    title: 'Half Plate Veggies',
    description: 'Make half your plate fruits & veggies once daily',
    screenName: 'HalfPlateFruitsVeggies',
  },
  {
    key: 'meatLess',
    title: 'Meatless Day',
    description: 'Go meat-free at least once per week',
    screenName: 'MeatlessChallenge',
  },
  {
    key: 'fermentedFood',
    title: 'Fermented Foods',
    description: 'Eat 1 fermented food daily for 7 days',
    screenName: 'FermentedFoodChallenge',
  },
  {
    key: 'bodyFatGoal',
    title: 'Body Fat Progress',
    description: 'Improve body fat percentage over time',
    screenName: 'BodyFatGoalScreen',
  },
  {
    key: 'newVeggie',
    title: 'Try New Veggies',
    description: 'Eat 1 new vegetable per week (2 weeks)',
    screenName: 'VeggieChallenge',
  },
  {
    key: 'sugarIntake',
    title: 'Limit Sugar',
    description: 'Stay under daily added sugar limit for 21 days',
    screenName: 'SugarChartDays',
  },
  {
    key: 'exWithFriend',
    title: 'Workout Buddy',
    description: 'Exercise with a friend 4 times',
    screenName: 'FriendWorkoutChallenge',
  },
  {
    key: 'cardio',
    title: 'Cardio Progress',
    description: 'Increase cardio time or intensity',
    screenName: 'CardioTrackerUI',
  },
  {
    key: 'beverage',
    title: 'Healthy Drinks',
    description: 'Create a no-added-sugar drink combo',
    screenName: 'BeverageChallengeUI',
  },
  {
    key: 'snacks',
    title: 'Snack Planning',
    description: 'Build and shop a healthy snack list',
    screenName: 'SnackListingUI',
  },
  {
    key: 'dailyFruits',
    title: 'Daily Fruits',
    description: 'Eat 2–3 servings of fruit every day',
    screenName: 'FruitTrackerUI',
  },
];

// =======================================================
// HELPERS
// =======================================================

const getUserReminderTime = user => {
  // fallback time if not set
  return user?.notificationTime || '09:00';
};

const sendPushNotification = async ({
  uid,
  token,
  title,
  body,
  screen = 'QuizBoard',
}) => {
  if (!token) return;

  try {
    const message = {
      token,

      notification: {
        title,
        body,
      },

      data: {
        screen: String(screen),
        title: String(title),
        body: String(body),
      },

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
            'content-available': 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);

    logger.log('Notification sent', {
      uid,
      title,
      response,
    });
  } catch (e) {
    logger.error('FCM Error', {
      uid,
      code: e.code,
      message: e.message,
    });

    if (
      uid &&
      (e.code === 'messaging/registration-token-not-registered' ||
        e.code === 'messaging/invalid-registration-token')
    ) {
      await db.ref(`/users/${uid}/fcmToken`).remove();
    }
  }
};

// =======================================================
// TUESDAY QUIZ REMINDER
// =======================================================

exports.tuesdayQuizReminder = onSchedule(
  {
    schedule: '* * * * *',
    timeZone: 'America/New_York',
  },
  async () => {
    logger.log('Tuesday Reminder Started');
    const usersSnap = await db.ref('/users').once('value');
    const users = usersSnap.val() || {};

    const promises = [];

    Object.entries(users).forEach(([uid, user]) => {
      const token = user?.fcmToken;
      const timezone = user?.timezone || 'America/New_York';

      const now = moment().tz(timezone);

      const reminderTime = getUserReminderTime(user);
      const [hour, minute] = reminderTime.split(':').map(Number);

      if (
        now.day() === 2 &&
        now.hour() === hour &&
        now.minute() === minute &&
        token
      ) {
        promises.push(
          sendPushNotification({
            uid,
            token,
            title: '🔥 Wellness Quiz Tomorrow!',
            body: 'Don’t miss tomorrow’s quiz for double points!',
          }),
        );
      }
    });

    await Promise.all(promises);
  },
);

// =======================================================
// WEDNESDAY DOUBLE POINTS
// =======================================================

exports.wednesdayDoublePoints = onSchedule(
  {
    schedule: '* * * * *',
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

      const reminderTime = getUserReminderTime(user);
      const [hour, minute] = reminderTime.split(':').map(Number);

      if (
        now.day() === 3 &&
        now.hour() === hour &&
        now.minute() === minute &&
        token
      ) {
        promises.push(
          sendPushNotification({
            uid,
            token,
            title: '🏆 Wellness Wednesday',
            body: 'Double points active today!',
          }),
        );
      }
    });

    await Promise.all(promises);
  },
);

// =======================================================
// SMART LEADERBOARD PUSH
// =======================================================

exports.smartLeaderboardPush = onSchedule(
  {
    schedule: '0 18 * * *',
    timeZone: 'America/New_York',
  },
  async () => {
    const leaderboardSnap = await db.ref('/leaderboards').once('value');
    const usersSnap = await db.ref('/users').once('value');

    const leaderboards = leaderboardSnap.val() || {};
    const users = usersSnap.val() || {};

    const sortedUsers = Object.entries(leaderboards)
      .map(([uid, data]) => ({
        uid,
        points: data?.challenge?.totalChallengePoints || 0,
        token: users?.[uid]?.fcmToken,
      }))
      .sort((a, b) => b.points - a.points);

    const promises = [];

    sortedUsers.forEach((user, index) => {
      const rank = index + 1;

      if (rank <= 10 && user.token) {
        promises.push(
          sendPushNotification({
            uid: user?.uid,
            token: user?.token,
            title: `🔥 You're Rank #${rank}`,
            body: 'Keep pushing to stay on top!',
          }),
        );
      }
    });

    await Promise.all(promises);
  },
);

// =======================================================
// QUIZ EXPIRY REMINDER
// =======================================================

exports.quizExpiryReminder = onSchedule(
  {
    schedule: '* * * * *',
    timeZone: 'America/New_York',
  },
  async () => {
    const usersSnap = await db.ref('/users').once('value');
    const users = usersSnap.val() || {};

    const promises = [];

    Object.entries(users).forEach(([uid, user]) => {
      const token = user?.fcmToken;
      if (!token) return;

      const timezone = user?.timezone || 'America/New_York';
      const now = moment().tz(timezone);

      const quizEnd = moment().tz(timezone).hour(12).minute(0);
      const diff = quizEnd.diff(now, 'minutes');

      const isReminder = diff === 60;
      const isWednesday = now.day() === 3;

      if (isReminder) {
        promises.push(
          sendPushNotification({
            uid,
            token,
            title: '⏳ Quiz Ending Soon!',
            body: 'Your quiz expires in 1 hour.',
          }),
        );
      }

      if (isWednesday && isReminder) {
        promises.push(
          sendPushNotification({
            uid,
            token,
            title: '🏆 Bonus Quiz Ending Soon!',
            body: 'Double points waiting!',
          }),
        );
      }
    });

    await Promise.all(promises);
  },
);

// =======================================================
// HABIT REMINDER ENGINE (YOUR MAIN FEATURE)
// =======================================================

exports.habitReminderEngine = onSchedule(
  {
    schedule: '* * * * *',
    timeZone: 'America/New_York',
  },
  async () => {
    logger.log('========== Habit Reminder Engine Started ==========');

    const usersSnap = await db.ref('/users').once('value');
    const users = usersSnap.val() || {};

    const promises = [];

    for (const [uid, user] of Object.entries(users)) {
      try {
        const token = user?.fcmToken;

        if (!token) {
          logger.log(`${uid}: No FCM token`);
          continue;
        }

        const timezone = user?.timezone || 'America/New_York';
        const now = moment().tz(timezone);

        const currentTime = now.format('HH:mm');

        logger.log(`${uid}: Current Time = ${currentTime}`);

        const selectedGoals = Array.isArray(user?.goal?.selectedGoals)
          ? user.goal.selectedGoals
          : [];

        if (!selectedGoals.length) {
          logger.log(`${uid}: No selected goals`);
          continue;
        }

        // *************** FIX ****************
        const settings = user?.notificationSettings?.habits || {};
        // ***********************************

        for (const goal of selectedGoals) {
          const goalKey =
            goal?.key ||
            goal?.id ||
            goal?.value ||
            (typeof goal === 'string' ? goal : null);

          if (!goalKey) {
            logger.log(`${uid}: Invalid goal`, goal);
            continue;
          }

          const habit = ALL_HABITS.find(h => h.key === goalKey);

          if (!habit) {
            logger.log(`${uid}: Habit not found -> ${goalKey}`);
            continue;
          }

          const goalSetting = settings[goalKey] || {};

          const enabled =
            goalSetting.enabled === undefined ? true : goalSetting.enabled;

          if (!enabled) {
            logger.log(`${uid}: ${goalKey} disabled`);
            continue;
          }

          let reminderTime = '21:00';

          if (goalSetting.time) {
            const parsed = moment(
              goalSetting.time,
              ['HH:mm', 'H:mm', 'hh:mm A', 'h:mm A'],
              true,
            );

            if (parsed.isValid()) {
              reminderTime = parsed.format('HH:mm');
            }
          }

          logger.log({
            uid,
            goalKey,
            reminderTime,
            currentTime,
          });

          if (reminderTime !== currentTime) {
            continue;
          }

          logger.log(`Sending reminder -> ${uid} -> ${goalKey}`);

          promises.push(
            sendPushNotification({
              uid,
              token,
              title: `⏰ ${habit.title}`,
              body: habit.description,
              screen: habit.screenName,
            }),
          );
        }
      } catch (e) {
        logger.error(`Habit reminder failed for ${uid}`, e);
      }
    }

    await Promise.all(promises);

    logger.log(
      `Habit Reminder Finished. Notifications sent: ${promises.length}`,
    );
  },
);

const { onRequest } = require('firebase-functions/v2/https');

exports.testPush = onRequest(async (req, res) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).send({
        success: false,
        error: 'Token is required',
      });
    }

    const response = await admin.messaging().send({
      token,
      notification: {
        title: 'HealthyU Test',
        body: 'Notifications are working 🎉',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
        },
      },
    });

    res.send({
      success: true,
      response,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      error: e.message,
    });
  }
});
