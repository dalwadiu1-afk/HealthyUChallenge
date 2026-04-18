import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/authentication/login';
import Signup from '../screens/authentication/signup';
import Welcome from '../screens/authentication/welcome';
import ForgotPassword from '../screens/authentication/forgotPassword';
import OTP from '../screens/authentication/otp';
import NewPassword from '../screens/authentication/newPassword';
import Success from '../screens/authentication/success';

const Stack = createNativeStackNavigator();

// @refresh reset
export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, unmountOnBlur: true }}
    >
      <Stack.Screen name="welcome" component={Welcome} />
      <Stack.Screen name="login" component={Login} />
      <Stack.Screen name="signup" component={Signup} />
      <Stack.Screen name="forgotPassword" component={ForgotPassword} />
      <Stack.Screen name="otp" component={OTP} />
      <Stack.Screen name="newPassword" component={NewPassword} />
      <Stack.Screen name="success" component={Success} />
    </Stack.Navigator>
  );
}
