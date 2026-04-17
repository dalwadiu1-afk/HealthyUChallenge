/**
 * useStepCount
 *
 * Reads step data directly from HealthKit/Health Connect.
 * HealthKit is already initialised by App.js — this hook just fetches data.
 *
 * iOS     → NativeModules.AppleHealthKit (rn-apple-healthkit)
 * Android → react-native-health-connect
 *
 * Returns: { data, todaySteps, loading, error, startDate, refetch }
 *   data: Array<{ dayIndex, steps, date }>  — 30 entries from today
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform, NativeModules, Alert, Linking } from 'react-native';

const TAG  = '[useStepCount]';
const DAYS = 30;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}
function buildSkeleton(startDate) {
  return Array.from({ length: DAYS }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return { dayIndex: i, steps: 0, date };
  });
}
function toDayIndex(startDate, isoTimestamp) {
  const startMidnight = new Date(startDate);
  startMidnight.setHours(0, 0, 0, 0);
  const diffMs = new Date(isoTimestamp).getTime() - startMidnight.getTime();
  return Math.floor(diffMs / 86_400_000);
}
function fmt(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── iOS ──────────────────────────────────────────────────────────────────────

// Fetches today's count + 30-day range. Called after initHealthKit is confirmed ready.
function doFetch(HK, startDate, resolve) {
  HK.getStepCount({ date: new Date().toISOString() }, (todayErr, todayResult) => {
    const todaySteps = todayResult?.value ?? 0;

    if (todayErr) console.log(`${TAG} getStepCount error:`, todayErr);
    else          console.log(`${TAG} 👟 Today: ${todaySteps} steps`);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + DAYS - 1);
    console.log(`${TAG} Range: ${fmt(startDate)} → ${fmt(endDate)}`);

    HK.getDailyStepCountSamples(
      { startDate: startOfDay(startDate), endDate: endOfDay(endDate) },
      (rangeErr, results) => {
        const skeleton = buildSkeleton(startDate);

        if (rangeErr) {
          console.log(`${TAG} getDailyStepCountSamples error:`, rangeErr);
          if (todaySteps > 0) skeleton[0].steps = todaySteps;
          resolve({ skeleton, todaySteps });
          return;
        }

        (results ?? []).forEach((sample) => {
          const steps = Math.round(sample.value ?? 0);
          console.log(`${TAG}   📅 ${fmt(sample.startDate)} → ${steps} steps`);
          const idx = toDayIndex(startDate, sample.startDate);
          if (idx >= 0 && idx < DAYS) skeleton[idx].steps += steps;
        });

        if (skeleton[0].steps === 0 && todaySteps > 0) {
          skeleton[0].steps = todaySteps;
        }

        console.log(
          `${TAG} Done — total: ${skeleton.reduce((s, d) => s + d.steps, 0)}, ` +
          `active: ${skeleton.filter(d => d.steps > 0).length} days`,
        );
        resolve({ skeleton, todaySteps });
      },
    );
  });
}

function fetchIOS(startDate) {
  return new Promise((resolve) => {
    const HK = NativeModules.AppleHealthKit;

    if (!HK) {
      console.log(`${TAG} ❌ AppleHealthKit native module not found`);
      resolve({ skeleton: buildSkeleton(startDate), todaySteps: 0 });
      return;
    }

    // Always call initHealthKit — it's idempotent (safe to call multiple times).
    // Skipping it caused a race condition when the screen loaded before App.js
    // finished its own initHealthKit callback.
    HK.initHealthKit(
      { permissions: { read: ['StepCount'], write: [] } },
      (initErr) => {
        if (initErr) {
          // An error here usually means HealthKit is already initialised — proceed anyway
          console.log(`${TAG} initHealthKit result (may already be ready):`, initErr);
        } else {
          console.log(`${TAG} ✅ HealthKit initialised`);
        }
        // Fetch data regardless of init error
        doFetch(HK, startDate, resolve);
      },
    );
  });
}

// ─── Android ──────────────────────────────────────────────────────────────────
async function fetchAndroid(startDate) {
  const empty = { skeleton: buildSkeleton(startDate), todaySteps: 0 };

  // Guard: check native module is registered before calling any Health Connect API
  // NativeModules won't have the HC module key if it wasn't linked / initialised
  const hcModuleKey = Object.keys(NativeModules).find(k =>
    k.toLowerCase().includes('healthconnect'),
  );
  if (!hcModuleKey) {
    console.log(`${TAG} Health Connect native module not registered — skipping`);
    return empty;
  }

  // Wrap everything so a native crash never propagates to the UI
  try {
    let HC;
    try { HC = require('react-native-health-connect'); }
    catch (e) {
      console.log(`${TAG} react-native-health-connect not found:`, e?.message);
      return empty;
    }

    const {
      getSdkStatus, SdkAvailabilityStatus,
      initialize, openHealthConnectSettings,
      requestPermission, readRecords,
    } = HC;

    const status = await getSdkStatus();
    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
      Alert.alert(
        'Health Connect Required',
        'Install Health Connect from the Play Store.',
        [{ text: 'Install', onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata') }],
      );
      return empty;
    }

    await initialize();

    const granted = await requestPermission([{ accessType: 'read', recordType: 'Steps' }]);
    if (!granted?.length) {
      Alert.alert(
        'Permission Denied',
        'Enable Steps in Health Connect settings.',
        [{ text: 'Settings', onPress: () => openHealthConnectSettings() }],
      );
      return empty;
    }

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + DAYS - 1);

    const { records } = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startOfDay(startDate),
        endTime:   endOfDay(endDate),
      },
    });

    const skeleton = buildSkeleton(startDate);
    const todayStr = startOfDay(new Date());
    let todaySteps = 0;

    (records ?? []).forEach((r) => {
      const steps = Math.round(r.count ?? 0);
      const idx   = toDayIndex(startDate, r.startTime);
      if (idx >= 0 && idx < DAYS) skeleton[idx].steps += steps;
      if (r.startTime >= todayStr) todaySteps += steps;
    });

    return { skeleton, todaySteps };
  } catch (e) {
    console.log(`${TAG} Android Health Connect error:`, e?.message);
    return empty;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export default function useStepCount() {
  const [data,       setData]       = useState(null);
  const [todaySteps, setTodaySteps] = useState(0);
  const [startDate,  setStartDate]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Start from today (day 0 = today, days 1-29 = future)
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      setStartDate(start);
      console.log(`${TAG} Start date: ${fmt(start)}`);

      const { skeleton, todaySteps: ts } = Platform.OS === 'ios'
        ? await fetchIOS(start)
        : await fetchAndroid(start);

      setData(skeleton);
      setTodaySteps(ts);
    } catch (err) {
      console.log(`${TAG} ❌ Error:`, err?.message);
      setError(err?.message ?? 'Failed to load step data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, todaySteps, startDate, loading, error, refetch: load };
}
