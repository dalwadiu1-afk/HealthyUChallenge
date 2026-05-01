import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Profile from '../screens/profile/profile';
import Instructions from '../screens/profile/instructions';
import ProfileDetails from '../screens/profile/profileDetails';
import InstructionsDetails from '../screens/profile/instructionsDetails';
import Leaderboard from '../screens/profile/leaderboard';
import EditProfile from '../screens/profile/editProfile';
const Stack = createNativeStackNavigator();

// @refresh reset
export default function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, unmountOnBlur: true }}
    >
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Instructions" component={Instructions} />
      <Stack.Screen
        name="InstructionsDetails"
        component={InstructionsDetails}
      />
      <Stack.Screen name="ProfileDetails" component={ProfileDetails} />
      <Stack.Screen name="Leaderboard" component={Leaderboard} />
    </Stack.Navigator>
  );
}
