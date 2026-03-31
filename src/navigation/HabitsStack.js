import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HabitsList from '../screens/habits/habitsList';

const Stack = createNativeStackNavigator();

// @refresh reset
export default function HabitsStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, unmountOnBlur: true }}
    >
      <Stack.Screen name="HabitsList" component={HabitsList} />
    </Stack.Navigator>
  );
}
