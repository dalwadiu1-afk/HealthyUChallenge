import firestore from '@react-native-firebase/firestore';

export const databaseNEW = async () => {
  try {
    const USER_ID = 'USER_UID';

    // 🔹 USER DATA
    const userData = {
      profile: {
        name: 'Umang',
        age: 24,
        email: 'umang@email.com',
        avatar: 'https://...',
      },

      goal: {
        selectedGoal: 5,
        startDate: '2026-03-25',
        duration: 30,
      },

      activities: {
        walking: {
          streak: 7,
          points: 8951,
        },
        fiber: {},
        water: {},
        sleep: {},
        workout: {},
      },

      logs: {
        '2026-03-25': {
          walking: 2000,
          fiber: 12,
          water: 5,
          sleep: 6,
          workout: 1,
        },
        '2026-03-26': {
          walking: 3500,
          fiber: 18,
          water: 6,
          sleep: 7,
          workout: 0,
        },
      },
    };

    // 🔥 SAVE USER
    await firestore().collection('users').doc(USER_ID).set(userData);

    console.log('✅ User data uploaded');

    // 🔹 DOCTORS DATA
    const doctorData = {
      name: 'Jessica Carr',
      about: '...',
      experience: '8 Yrs',
      patients: '116',
      rating: '4.9',
      awards: '12',
      image: '...',
      availableDays: ['Mon', 'Tue', 'Wed'],
    };

    // 🔥 SAVE DOCTOR
    await firestore().collection('doctors').doc('1').set(doctorData);

    console.log('✅ Doctor data uploaded');
  } catch (error) {
    console.error('❌ Upload error:', error);
  }
};
