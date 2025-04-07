import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import InstructionScreen from './screens/InstructionScreen';
import SignInScreen from './screens/SignInScreen';
import GuidedMeditationScreen from './screens/GuidedMeditationScreen'; // Ensure it is imported
import CategoriesScreen from './screens/CategoriesScreen';
import GoalQuestionsScreen from './screens/GoalQuestionsScreen';
import GoalBreakdownScreen from './screens/GoalBreakdownScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProgressScreen from './screens/ProgressScreen';
import PremiumScreen from './screens/PremiumScreen';
import SignUpScreen from './screens/SignUpScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Premium" component={PremiumScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator({ user }) {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={user ? 'MainTabs' : 'Welcome'}
    >
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Instruction" component={InstructionScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Meditation" component={GuidedMeditationScreen} />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="GoalQuestions" component={GoalQuestionsScreen} />
          <Stack.Screen name="GoalBreakdown" component={GoalBreakdownScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}