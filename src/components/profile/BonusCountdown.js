import React, { useEffect, useState, useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import moment from 'moment';

export default function BonusCountdown({
  targetDate,
  onPress,
  isActive,
  textStyle,
}) {
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

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Text style={textStyle}>
        {seconds != 0 ? (
          days > 0 ? (
            <Text style={{ color: '#fff' }}>
              {days} day{days !== 1 ? 's' : ''} left
            </Text>
          ) : (
            <Text style={{ color: '#fff' }}>{formatHHMMSS}</Text>
          )
        ) : (
          <Text style={{ color: '#FFD700' }}>🔥 Tap to Start Bonus Quiz</Text>
        )}
      </Text>
    </TouchableOpacity>
  );
}
