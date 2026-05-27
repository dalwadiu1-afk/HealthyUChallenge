import database from '@react-native-firebase/database';

export const seedUserData = async () => {
  const userId = 'USER_UID'; // 🔥 replace with auth().currentUser.uid
  const postId1 = database().ref('posts').push().key;

  const updates = {};

  // 🔹 USER DATA
  updates[`users/${userId}`] = {
    profile: {
      name: 'Linh Nguyen',
      username: '@linh.nguyen',
      avatar: 'https://...',
      memberSince: '2024',
    },

    stats: {
      streak: 14,
      activeDays: 31,
      completionRate: 78,
      totalHabitsDone: 87,
    },

    activities: {
      workout: {
        sessionsDone: 12,
        weeksCompleted: 2,
        weeklyProgress: {
          week1: { done: 5 },
          week2: { done: 3 },
          week3: { done: 0 },
          week4: { done: 0 },
        },
      },
    },

    habits: {
      May_2026: {
        title: 'Drink Water',
        target: '3L',
        days: {
          '01': { progress: '2L', completed: false },
          '02': { progress: '3L', completed: true },
        },
      },
    },

    // 🔥 Only references (important)
    posts: {
      [postId1]: true,
    },
  };

  // 🔹 GLOBAL POSTS
  updates[`posts/${postId1}`] = {
    userId: userId,
    name: 'Linh Nguyen',
    avatar: 'https://...',
    message: 'Just finished a 5K run! 🏃',
    image: 'https://...',
    createdAt: Date.now(),
    likes: {
      user1: true,
      user2: true,
    },
    comments: {
      commentId1: {
        userId,
        text,
        createdAt,
      },
    },
  };

  // 🔥 SINGLE WRITE (BEST PRACTICE)
  await database().ref().update(updates);
};
