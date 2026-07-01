import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  initialize,
  requestPermission,
  readRecords,
  getGrantedPermissions,
} from 'react-native-health-connect';

const DAYS = 30;
const TAG = '[useStepCount]';

// ───────────────────────── Helpers ─────────────────────────

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
  if (!isoTimestamp) return -1;

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  return Math.floor(
    (new Date(isoTimestamp).getTime() - start.getTime()) / 86400000,
  );
}

// ───────────────────────── ANDROID SAFE ─────────────────────────

async function fetchAndroid(startDate) {
  const empty = {
    skeleton: buildSkeleton(startDate),
    todaySteps: 0,
  };

  try {
    // Initialize Health Connect
    const initialized = await initialize();

    if (!initialized) {
      console.log('Health Connect initialization failed');
      return empty;
    }

    const granted = await requestPermission([
      {
        accessType: 'read',
        recordType: 'Steps',
      },
    ]);

    console.log('Granted:', JSON.stringify(granted, null, 2));

    // Check existing permissions
    let permissions = await getGrantedPermissions();
    permissions = await requestPermission([
      {
        accessType: 'read',
        recordType: 'Steps',
      },
    ]);
    console.log('permissions :>> ', permissions);
    const hasStepsPermission = permissions.some(
      p => p.accessType === 'read' && p.recordType === 'Steps',
    );

    // Ask only if missing
    // if (!hasStepsPermission) {
    permissions = await requestPermission([
      {
        accessType: 'read',
        recordType: 'Steps',
      },
    ]);
    // }

    // const granted = permissions.some(
    //   p => p.accessType === 'read' && p.recordType === 'Steps',
    // );

    // if (!granted) {
    //   console.log('Steps permission denied');
    //   return empty;
    // }

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const { records = [] } = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startOfDay(startDate),
        endTime: endOfDay(endDate),
      },
    });

    const skeleton = buildSkeleton(startDate);
    let todaySteps = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    records.forEach(record => {
      const steps = Number(record.count ?? 0);

      const idx = toDayIndex(startDate, record.startTime);

      if (idx >= 0 && idx < skeleton.length) {
        skeleton[idx].steps += steps;
      }

      const recordDay = new Date(record.startTime);
      recordDay.setHours(0, 0, 0, 0);

      if (recordDay.getTime() === today.getTime()) {
        todaySteps += steps;
      }
    });

    return {
      skeleton,
      todaySteps,
    };
  } catch (e) {
    console.log('Health Connect Error:', e);
    return empty;
  }
}
// ───────────────────────── iOS SAFE ─────────────────────────

function fetchIOS(startDate) {
  return new Promise(resolve => {
    const HK = require('react-native').NativeModules.AppleHealthKit;

    if (!HK) {
      resolve({ skeleton: buildSkeleton(startDate), todaySteps: 0 });
      return;
    }

    try {
      HK.initHealthKit(
        { permissions: { read: ['StepCount'], write: [] } },
        () => {
          HK.getStepCount({ date: new Date().toISOString() }, (_, todayRes) => {
            const todaySteps = todayRes?.value ?? 0;

            const end = new Date(startDate);
            end.setDate(end.getDate() + DAYS - 1);

            HK.getDailyStepCountSamples(
              {
                startDate: startOfDay(startDate),
                endDate: endOfDay(end),
              },
              (_, results) => {
                const skeleton = buildSkeleton(startDate);

                (results ?? []).forEach(s => {
                  const idx = toDayIndex(startDate, s.startDate);
                  if (idx >= 0 && idx < DAYS) {
                    skeleton[idx].steps += Math.round(s.value ?? 0);
                  }
                });

                resolve({ skeleton, todaySteps });
              },
            );
          });
        },
      );
    } catch (e) {
      resolve({ skeleton: buildSkeleton(startDate), todaySteps: 0 });
    }
  });
}

// ───────────────────────── HOOK ─────────────────────────

export default function useStepCount() {
  const [data, setData] = useState(null);
  const [todaySteps, setTodaySteps] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const start = new Date();
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);

      setStartDate(start);

      const result =
        Platform.OS === 'ios'
          ? await fetchIOS(start)
          : await fetchAndroid(start);

      setData(result.skeleton);
      setTodaySteps(result.todaySteps);
    } catch (e) {
      console.log(TAG, 'hook error:', e?.message);
      setError('Failed to load steps');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    todaySteps,
    startDate,
    loading,
    error,
    refetch: load,
  };
}
