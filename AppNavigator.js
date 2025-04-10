import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from './screens/DashboardScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import GoalQuestionsScreen from './screens/GoalQuestionsScreen';
import GoalBreakdownScreen from './screens/GoalBreakdownScreen';
import ProgressScreen from './screens/ProgressScreen';
import PremiumScreen from './screens/PremiumScreen';
import SignInScreen from './screens/SignInScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Goals" component={GoalQuestionsScreen} />
      <Tab.Screen name="Steps" component={GoalBreakdownScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Premium" component={PremiumScreen} />
      <Tab.Screen name="SignIn" component={SignInScreen} />
    </Tab.Navigator>
  );
}