import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HabitsList from '../screens/habits/habitsList';
import BookAnAppointment from '../screens/habits/sessionBook/BookAnAppointment';
import ConfirmationCode from '../screens/habits/sessionBook/ConfirmationCode';
import SessionConfirmation from '../screens/habits/sessionBook/SessionConfirmation';
import BodyFatGoalScreen from '../screens/habits/bodyFat/BodyFatGoalUI';
import FutureIdeasUI from '../screens/habits/customChoice/futureIdeas';
import WalkingRewardBoard from '../screens/habits/dailySteps/WalkingRewardBoard';
import FermentedFoodChallenge from '../screens/habits/fermentedFood/FermentedFoodChallenge';
import FriendWorkoutChallenge from '../screens/habits/exWithFriend/ExWithFriend';
import AvgSteps from '../screens/habits/dailySteps/AvgSteps';
import DailyFiberCounts from '../screens/habits/fiberCounts/DailyFiberCounts';
import HalfPlateFruitsVeggies from '../screens/habits/fruitMeal/HalfFruitMeal';
import MeatlessChallenge from '../screens/habits/meatLess/MeatLessWeek';
import VeggieChallenge from '../screens/habits/newVeggi/VeggieChallenge';
import SleepChart from '../screens/habits/sleepMeasurement/SleepChart';
import SleepMeasure from '../screens/habits/sleepMeasurement/SleepMeasure';
import SleepChartDays from '../screens/habits/sleepMeasurement/SleepChart';
import BeverageChallengeUI from '../screens/habits/sugarBeverage/BeverageChallenge';
import SugarChartDays from '../screens/habits/sugarIntake/SugarIntake';
import FruitTrackerUI from '../screens/habits/fruitServing/FruitTrackerUI';
import WeightResistanceTraining from '../screens/habits/weightResistance/WeightResistanceTraining';
import WeightChallengeUI from '../screens/habits/weight/WeightChallengeUI';
import CardioTrackerUI from '../screens/habits/cardioIntencey/cardioInteceyTraker';
import SnackListingUI from '../screens/habits/healthySnacks/HealthySnackSystem';
import WeeklyFitnessClass from '../screens/habits/weeklyClass/WeeklyFitnessClass';

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
      <Stack.Screen name="AvgSteps" component={AvgSteps} />
      <Stack.Screen name="DailyFiberCounts" component={DailyFiberCounts} />
      <Stack.Screen name="MeatlessChallenge" component={MeatlessChallenge} />
      <Stack.Screen name="VeggieChallenge" component={VeggieChallenge} />
      <Stack.Screen name="SleepMeasure" component={SleepMeasure} />
      <Stack.Screen name="SleepChart" component={SleepChart} />
      <Stack.Screen name="SugarChartDays" component={SugarChartDays} />
      <Stack.Screen name="WeeklyFitnessClass" component={WeeklyFitnessClass} />
      <Stack.Screen name="WeightChallengeUI" component={WeightChallengeUI} />
      <Stack.Screen name="FruitTrackerUI" component={FruitTrackerUI} />
      <Stack.Screen
        name="WeightResistanceTraining"
        component={WeightResistanceTraining}
      />
      <Stack.Screen name="CardioTrackerUI" component={CardioTrackerUI} />
      <Stack.Screen
        name="BeverageChallengeUI"
        component={BeverageChallengeUI}
      />
      <Stack.Screen name="SleepChartDays" component={SleepChartDays} />

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
