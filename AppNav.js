import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

import AuthStack from './src/navigation/AuthStack';
import BottomNavigation from './src/navigation/BottomNavigation';

import { setUserData } from './src/redux/slices/userSlice';
import {
  calculateUserStats,
  syncUserLeaderboardPoints,
} from './src/utils/helper';

const Stack = createNativeStackNavigator();

export default function AppNav() {
  const dispatch = useDispatch();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // AUTH LISTENER
  // =========================
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(authUser => {
      setUser(authUser || null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // =========================
  // USER DATA + STATS
  // =========================
  useEffect(() => {
    if (!user?.uid) return;

    const uid = user.uid;

    const userRef = database().ref(`users/${uid}`);

    const listener = userRef.on('value', async snapshot => {
      try {
        const userData = snapshot.val();

        if (!userData) return;

        const stats = calculateUserStats(userData);

        const existingStats = userData?.stats || {};

        const comparableExistingStats = {
          totalHabitsDone: existingStats.totalHabitsDone || 0,
          streak: existingStats.streak || 0,
          longestStreak: existingStats.longestStreak || 0,
          activeDays: existingStats.activeDays || 0,
          completionRate: existingStats.completionRate || 0,
        };

        const hasStatsChanged =
          JSON.stringify(stats) !== JSON.stringify(comparableExistingStats);

        // ONLY UPDATE IF CHANGED
        if (hasStatsChanged) {
          await database().ref(`users/${uid}/stats`).set(stats);

          await syncUserLeaderboardPoints(uid, {
            ...userData,
            stats,
          });
        }

        dispatch(
          setUserData({
            ...userData,
            stats,
          }),
        );
      } catch (error) {
        console.log('APP ERROR:', error);
      }
    });

    return () => {
      userRef.off('value', listener);
    };
  }, []);

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return null;
  }

  // =========================
  // NAVIGATION
  // =========================
  return (
    <SafeAreaProvider>
      {user ? (
        <BottomNavigation />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthStack} />
        </Stack.Navigator>
      )}
    </SafeAreaProvider>
  );
}
