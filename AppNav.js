import React, { useEffect, useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

import AuthStack from './src/navigation/AuthStack';
import BottomNavigation from './src/navigation/BottomNavigation';

import { setUserData, clearUser } from './src/redux/slices/userSlice';

import {
  calculateUserStats,
  syncUserLeaderboardPoints,
} from './src/utils/helper';

const Stack = createNativeStackNavigator();

export default function AppNav() {
  const dispatch = useDispatch();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const userRef = useRef(null);
  const lastHashRef = useRef(null);

  // =========================
  // AUTH LISTENER
  // =========================
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(authUser => {
      setLoading(true);

      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
        dispatch(clearUser());
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [dispatch]);

  // =========================
  // FIREBASE SYNC (NO LOOP)
  // =========================
  useEffect(() => {
    if (!user?.uid) return;

    const uid = user.uid;

    // cleanup old listener
    if (userRef.current) {
      userRef.current.off();
    }

    const ref = database().ref(`users/${uid}`);
    userRef.current = ref;

    const listener = ref.on('value', async snapshot => {
      const userData = snapshot.val();

      if (!userData) {
        dispatch(clearUser());
        return;
      }

      try {
        // =========================
        // REDUX SYNC
        // =========================
        dispatch(
          setUserData({
            uid,

            profile: userData?.profile || {},
            habits: userData?.habits || {},
            goal: userData?.goal || {},
            posts: userData?.posts || {},
            snacks: userData?.snacks || {},
            activities: userData?.activities || {},
            challenges: userData?.challenges || {},

            stats: {
              ...(userData?.stats || {}),
              ...stats,
            },
          }),
        );
      } catch (err) {
        console.log('APP SYNC ERROR:', err);
      }
    });

    return () => {
      ref.off('value', listener);
    };
  }, [user?.uid, dispatch]);

  // =========================
  // LOADING
  // =========================
  if (loading) return null;

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
