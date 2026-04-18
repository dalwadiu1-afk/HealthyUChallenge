import { Dimensions } from 'react-native';
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

export { scale, generateDaysFromToday };
