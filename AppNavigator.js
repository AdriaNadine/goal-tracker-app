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
import GuidedMeditationScreen from './screens/GuidedMeditationScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ user }) {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={user ? 'MainTabs' : 'Welcome'}
    >
      {!user && (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="GuidedMeditation" component={GuidedMeditationScreen} />
    </Stack.Navigator>
  );
}