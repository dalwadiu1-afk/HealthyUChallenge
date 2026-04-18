import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Feeds from '../screens/social/feeds';
import FeedDetails from '../screens/social/feedDetails';
import AvgSteps from '../screens/habits/dailySteps/AvgSteps';
import AddPost from '../screens/social/addPost';

const Stack = createNativeStackNavigator();

// @refresh reset
export default function SocialStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, unmountOnBlur: true }}
    >
      <Stack.Screen name="Feeds" component={Feeds} />
      <Stack.Screen name="AvgSteps" component={AvgSteps} />
      <Stack.Screen name="FeedDetails" component={FeedDetails} />
      <Stack.Screen name="AddPost" component={AddPost} />
    </Stack.Navigator>
  );
}
