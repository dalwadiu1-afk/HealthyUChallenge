import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Resources from '../screens/Resources/ResourcesList';

const Stack = createNativeStackNavigator();

// @refresh reset
export default function ResourceStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, unmountOnBlur: true }}
    >
      <Stack.Screen name="ResourcesList" component={Resources} />
    </Stack.Navigator>
  );
}
