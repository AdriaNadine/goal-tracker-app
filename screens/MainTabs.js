import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from './DashboardScreen';
import ProgressScreen from './ProgressScreen';
import CategoriesScreen from './CategoriesScreen';
import GoalBreakdownScreen from './GoalBreakdownScreen';
import GoalQuestionScreen from './GoalQuestionsScreen';
import PremiumScreen from './PremiumScreen';
import XPStatusScreen from './XPStatusScreen';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Goals" component={GoalQuestionScreen} />
      <Tab.Screen name="Steps" component={GoalBreakdownScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="XPStatus" component={XPStatusScreen} />
      <Tab.Screen name="Premium" component={PremiumScreen} />
    </Tab.Navigator>
  );
}

export default MainTabs;