import React, { useEffect, useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import BootSplash from 'react-native-bootsplash';

import AuthStack from './src/navigation/AuthStack';
import BottomNavigation from './src/navigation/BottomNavigation';
import SplashScreen from './src/screens/authentication/splashScreen';

import { setUserData, clearUser } from './src/redux/slices/userSlice';

const Stack = createNativeStackNavigator();

const GOAL_TO_HABIT = {
  BookAnAppointment: 'booking',
  WeightResistanceTraining: 'fitness',
  WeeklyFitnessClass: 'fitness',

  DailyFruitIntake: 'dailyFruits',
  SleepTracking: 'sleep',
  CardioChallenge: 'cardio',
  FiberIntake: 'fiber',
  SugarIntake: 'sugarIntake',
  WeightChallenge: 'weightChallenge',
  BodyFatGoal: 'bodyFatGoal',
};

export default function AppNav() {
  const dispatch = useDispatch();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  const userRef = useRef(null);

  // =========================
  // AUTH LISTENER
  // =========================
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(authUser => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
        setUserDataLoaded(true); // allow navigation to auth stack
        dispatch(clearUser());
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [dispatch]);

  // =========================
  // USER DATA SYNC
  // =========================
  useEffect(() => {
    if (!user?.uid) return;

    const uid = user.uid;

    setUserDataLoaded(false);

    if (userRef.current) {
      userRef.current.off();
    }

    const ref = database().ref(`users/${uid}`);
    userRef.current = ref;

    const listener = ref.on('value', snapshot => {
      const userData = snapshot.val();

      if (!userData) {
        dispatch(clearUser());
        setUserDataLoaded(true);
        return;
      }

      try {
        const selectedGoals = userData?.goal?.selectedGoals || [];

        const selectedHabits = selectedGoals
          .map(goal => {
            const habitKey = GOAL_TO_HABIT[goal.screenName];

            if (!habitKey) return null;

            return {
              ...goal,
              habitKey,
              habitData: userData?.habits?.[habitKey] || {},
            };
          })
          .filter(Boolean);

        dispatch(
          setUserData({
            uid,

            profile: userData?.profile || {},
            habits: userData?.habits || {},
            goal: userData?.goal || {},
            selectedHabits,

            posts: userData?.posts || {},
            snacks: userData?.snacks || {},
            activities: userData?.activities || {},
            challenges: userData?.challenges || {},

            stats: {
              ...(userData?.stats || {}),
            },
          }),
        );

        setUserDataLoaded(true);
      } catch (error) {
        console.log('APP SYNC ERROR:', error);
        setUserDataLoaded(true);
      }
    });

    return () => {
      ref.off('value', listener);
    };
  }, [user?.uid, dispatch]);

  // =========================
  // SPLASH CONTROL
  // =========================
  useEffect(() => {
    const hideSplash = async () => {
      const appReady = !loading && (!user || userDataLoaded);

      if (!appReady) return;

      try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        await BootSplash.hide({
          fade: true,
        });

        setShowSplash(false);
      } catch (error) {
        console.log('Splash Error:', error);
        setShowSplash(false);
      }
    };

    hideSplash();
  }, [loading, userDataLoaded, user]);

  // =========================
  // LOADING
  // =========================
  if (loading || showSplash) {
    return <SplashScreen />;
  }

  // =========================
  // NAVIGATION
  // =========================
  return (
    <SafeAreaProvider>
      {user ? (
        <BottomNavigation />
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Auth" component={AuthStack} />
        </Stack.Navigator>
      )}
    </SafeAreaProvider>
  );
}
