import { PermissionsAndroid, Platform, Dimensions } from 'react-native';
import moment from 'moment';

const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;
const { width, height } = Dimensions.get('window');

const scale = size => (width / guidelineBaseWidth) * size;

const generateTimeSlots = (start = 10, end = 12) => {
  const slots = [];

  for (let hour = start; hour <= end; hour++) {
    slots.push(moment({ hour }).format('hh:00 A'));
  }

  return slots;
};

const generateDaysFromToday = (
  numDays = 30,
  timeRange = { from: 10, to: 13 },
) => {
  const daysArray = [];

  for (let i = 0; i < numDays; i++) {
    const currentDay = moment().add(i, 'days');

    daysArray.push({
      label: currentDay.format('ddd'),
      date: currentDay.format('DD'),
      fullDate: currentDay.format('YYYY-MM-DD'),
      timeSlots: generateTimeSlots(timeRange.from, timeRange.to),
    });
  }

  return daysArray;
};

const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);

    if (granted['android.permission.CAMERA'] === 'granted') {
      return true;
    } else {
      console.log('Permission denied');
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

const getSmartTips = fiberData => {
  if (!fiberData?.length) return [];

  const avg = fiberData.reduce((sum, d) => sum + d.fiber, 0) / fiberData.length;

  const lowDays = fiberData.filter(d => d.fiber < 25).length;

  if (avg < 20 || lowDays > 3) {
    return [
      'You are below fiber target — increase vegetables daily',
      'Eat oats or overnight oats for high fiber breakfast',
      'Add chia or flax seeds to meals or smoothies',
      'Eat apples with skin for extra fiber',
      'Include lentils, beans, and other legumes regularly',
      'Switch to whole grains instead of refined grains',
      'Eat a variety of vegetables like broccoli and carrots daily',
    ];
  }

  if (avg >= 25 && avg <= 35) {
    return [
      'Great consistency! Keep your fiber intake steady',
      'Try adding variety with fruits and vegetables',
    ];
  }

  return [
    'Balance your fiber intake with hydration',
    'Maintain daily vegetable intake',
  ];
};

export { scale, generateDaysFromToday, requestCameraPermission, getSmartTips };
