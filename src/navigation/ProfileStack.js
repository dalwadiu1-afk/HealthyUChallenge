import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Profile from '../screens/profile/profile';
import Instructions from '../screens/profile/instructions';
import ProfileDetails from '../screens/profile/profileDetails';
import InstructionsDetails from '../screens/profile/instructionsDetails';
import Leaderboard from '../screens/profile/leaderboard';
import EditProfile from '../screens/profile/editProfile';
import QuizStart from '../screens/profile/quiz/QuizStart';
import Quiz from '../screens/profile/quiz/Quiz';
import QuizResult from '../screens/profile/quiz/QuizResult';
import QuizReview from '../screens/profile/quiz/QuizReview';
import QuizBoard from '../screens/profile/quiz/QuizBoard';

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
      <Stack.Screen name="QuizStart" component={QuizStart} />
      <Stack.Screen name="Quiz" component={Quiz} />
      <Stack.Screen name="QuizResult" component={QuizResult} />
      <Stack.Screen name="QuizReview" component={QuizReview} />
      <Stack.Screen name="QuizBoard" component={QuizBoard} />
    </Stack.Navigator>
  );
}
