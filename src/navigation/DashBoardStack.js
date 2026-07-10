import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Profile from '../screens/profile/profile';
import Instructions from '../screens/profile/instructions';
import ProfileDetails from '../screens/profile/profileDetails';
import InstructionsDetails from '../screens/profile/instructionsDetails';
import Leaderboard from '../screens/profile/leaderboard';
import EditProfile from '../screens/profile/editProfile';
import Social from '../screens/profile/social';
import QuizStart from '../screens/profile/quiz/QuizStart';
import Quiz from '../screens/profile/quiz/Quiz';
import QuizResult from '../screens/profile/quiz/QuizResult';
import QuizReview from '../screens/profile/quiz/QuizReview';
import DashBoard from '../screens/dashboard/DashBoard';
import QuizAnalytics from '../screens/profile/quiz/QuizAnalytics';

const Stack = createNativeStackNavigator();

// @refresh reset
export default function DashBoardStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, unmountOnBlur: true }}
      initialRouteName="DashBoard"
    >
      <Stack.Screen name="DashBoard" component={DashBoard} />
      <Stack.Screen name="Leaderboard" component={Leaderboard} />
      <Stack.Screen name="QuizStart" component={QuizStart} />
      <Stack.Screen name="Quiz" component={Quiz} />
      <Stack.Screen name="QuizResult" component={QuizResult} />
      <Stack.Screen name="QuizReview" component={QuizReview} />
      <Stack.Screen name="QuizAnalytics" component={QuizAnalytics} />
    </Stack.Navigator>
  );
}
