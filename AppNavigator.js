import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './config/firebase';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import InstructionScreen from './screens/InstructionScreen';
import AuthGateScreen from './screens/AuthGateScreen';
import GuidedMeditationScreen from './screens/GuidedMeditationScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import GoalQuestionsScreen from './screens/GoalQuestionsScreen';
import GoalBreakdownScreen from './screens/GoalBreakdownScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProgressScreen from './screens/ProgressScreen';
import PremiumScreen from './screens/PremiumScreen';
import SignInScreen from './screens/SignInScreen';
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

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  if (authLoading) {
    return null; // You could return a loading spinner here
  }

  return (
    <Stack.Navigator initialRouteName={user ? 'MainTabs' : 'Welcome'}>
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Instruction" component={InstructionScreen} />
          <Stack.Screen name="AuthGate" component={AuthGateScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Meditation" component={GuidedMeditationScreen} />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="GoalQuestions" component={GoalQuestionsScreen} />
          <Stack.Screen name="GoalBreakdown" component={GoalBreakdownScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}