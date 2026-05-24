import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Resources from '../screens/Resources/ResourcesList';
import QuizStart from '../screens/Resources/quiz/QuizStart';
import Quiz from '../screens/Resources/quiz/Quiz';
import QuizResult from '../screens/Resources/quiz/QuizResult';
import QuizReview from '../screens/Resources/quiz/QuizReview';

const Stack = createNativeStackNavigator();

// @refresh reset
export default function ResourceStack() {
  return (
    <Stack.Navigator
      initialRouteName="ResourcesList"
      screenOptions={{ headerShown: false, unmountOnBlur: true }}
    >
      <Stack.Screen name="ResourcesList" component={Resources} />
      <Stack.Screen name="QuizStart" component={QuizStart} />
      <Stack.Screen name="Quiz" component={Quiz} />
      <Stack.Screen name="QuizResult" component={QuizResult} />
      <Stack.Screen name="QuizReview" component={QuizReview} />
    </Stack.Navigator>
  );
}
