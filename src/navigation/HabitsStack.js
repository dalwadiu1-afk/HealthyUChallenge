import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HabitsList from '../screens/habits/habitsList';
import BookAnAppointment from '../screens/habits/sessionBook/BookAnAppointment';
import ConfirmationCode from '../screens/habits/sessionBook/ConfirmationCode';
import SessionConfirmation from '../screens/habits/sessionBook/SessionConfirmation';

const Stack = createNativeStackNavigator();

// @refresh reset
export default function HabitsStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, unmountOnBlur: true }}
    >
      <Stack.Screen name="HabitsList" component={HabitsList} />
      <Stack.Screen name="BookAnAppointment" component={BookAnAppointment} />
      <Stack.Screen name="ConfirmationCode" component={ConfirmationCode} />
      <Stack.Screen
        name="SessionConfirmation"
        component={SessionConfirmation}
      />
    </Stack.Navigator>
  );
}
