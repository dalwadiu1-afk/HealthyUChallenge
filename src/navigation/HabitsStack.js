import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HabitsList from '../screens/habits/habitsList';
import BookAnAppointment from '../screens/habits/sessionBook/BookAnAppointment';
import ConfirmationCode from '../screens/habits/sessionBook/ConfirmationCode';
import SessionConfirmation from '../screens/habits/sessionBook/SessionConfirmation';
import BodyFatGoalScreen from '../screens/habits/bodyFat/BodyFatGoalUI';
import SnackListingUI from '../screens/habits/cardioIntencey/cardioInteceyTraker';
import FutureIdeasUI from '../screens/habits/customChoice/futureIdeas';
import WalkingRewardBoard from '../screens/habits/dailySteps/WalkingRewardBoard';
import FermentedFoodChallenge from '../screens/habits/fermentedFood/FermentedFoodChallenge';
import FiberChartDays from '../screens/habits/fiberCounts/DailyFiberCounts';
import FriendWorkoutChallenge from '../screens/habits/exWithFriend/ExWithFriend';
import HalfPlateFruitsVeggies from '../screens/habits/fruitMeal/HalfFruitMeal';
import MeatlessChallenge from '../screens/habits/meatLess/MeatLessWeek';
import VeggieChallenge from '../screens/habits/newVeggi/VeggieChallenge';
import FiberChartDays from '../screens/habits/meatLess/FiberChartDays';
import SleepChart from '../screens/habits/sleepMeasurement/SleepChart';
import SleepClock from '../screens/habits/sleepMeasurement/SleepMeasure';
import BeverageChallengeUI from '../screens/habits/sugarBeverage/BeverageChallenge';
import FitnessClassUI from '../screens/habits/weeklyClass/WeeklyFitnessClass';
import SugarChartDays from '../screens/habits/sugarIntake/SugarIntake';
import SugarChartDays from '../screens/habits/sugarIntake/SugarIntake';
import WeightChallengeUI from '../screens/habits/weight/WeightChallengeUI';
import WeightTrainingUI from '../screens/habits/weightResistance/WeightResistanceTraining';

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
      <Stack.Screen name="BodyFatGoalScreen" component={BodyFatGoalScreen} />
      <Stack.Screen name="SnackListingUI" component={SnackListingUI} />
      <Stack.Screen name="FutureIdeasUI" component={FutureIdeasUI} />
      <Stack.Screen name="WalkingRewardBoard" component={WalkingRewardBoard} />
      <Stack.Screen name="FiberChartDays" component={FiberChartDays} />
      <Stack.Screen name="MeatlessChallenge" component={MeatlessChallenge} />
      <Stack.Screen name="VeggieChallenge" component={VeggieChallenge} />
      <Stack.Screen name="SleepClock" component={SleepClock} />
      <Stack.Screen name="SleepChart" component={SleepChart} />
      <Stack.Screen name="SugarChartDays" component={SugarChartDays} />
      <Stack.Screen name="FitnessClassUI" component={FitnessClassUI} />
      <Stack.Screen name="WeightChallengeUI" component={WeightChallengeUI} />
      <Stack.Screen name="WeightTrainingUI" component={WeightTrainingUI} />
      <Stack.Screen
        name="BeverageChallengeUI"
        component={BeverageChallengeUI}
      />
      <Stack.Screen
        name="BeverageChallengeUI"
        component={BeverageChallengeUI}
      />
      <Stack.Screen
        name="HalfPlateFruitsVeggies"
        component={HalfPlateFruitsVeggies}
      />
      <Stack.Screen
        name="FermentedFoodChallenge"
        component={FermentedFoodChallenge}
      />
      <Stack.Screen
        name="FriendWorkoutChallenge"
        component={FriendWorkoutChallenge}
      />
      <Stack.Screen
        name="SessionConfirmation"
        component={SessionConfirmation}
      />
    </Stack.Navigator>
  );
}
