import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from './screens/DashboardScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import GoalQuestionsScreen from './screens/GoalQuestionsScreen';
import GoalBreakdownScreen from './screens/GoalBreakdownScreen';
import ProgressScreen from './screens/ProgressScreen';
import PremiumScreen from './screens/PremiumScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import MainTabs from './screens/MainTabs';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}