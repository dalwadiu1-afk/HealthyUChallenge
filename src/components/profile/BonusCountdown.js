import React, { useEffect, useState, useMemo } from 'react';
import { Text, View } from 'react-native';
import moment from 'moment';

export default function BonusCountdown({ targetDate, textStyle }) {
  const [diff, setDiff] = useState(targetDate.diff(moment()));

  useEffect(() => {
    const interval = setInterval(() => {
      setDiff(targetDate.diff(moment()));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const duration = useMemo(() => moment.duration(Math.max(diff, 0)), [diff]);

  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  const formatHHMMSS = `${String(hours).padStart(2, '0')}:${String(
    minutes,
  ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isFinished = diff <= 0;

  return (
    <View>
      <Text style={textStyle}>
        {isFinished ? (
          <Text style={{ color: '#FFD700' }}>🔥 Tap to Start Bonus Quiz</Text>
        ) : days > 0 ? (
          <Text style={{ color: '#fff' }}>
            {days} day{days !== 1 ? 's' : ''} left
          </Text>
        ) : (
          <Text style={{ color: '#fff' }}>{formatHHMMSS}</Text>
        )}
      </Text>
    </View>
  );
}
