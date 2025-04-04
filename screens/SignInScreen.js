import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from './DashboardScreen';
import ProgressScreen from './ProgressScreen';
import PremiumScreen from './PremiumScreen';
import CategoriesScreen from './CategoriesScreen';
import GoalQuestionsScreen from './GoalQuestionsScreen';
import GoalBreakdownScreen from './GoalBreakdownScreen';

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Premium" component={PremiumScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="GoalQuestions" component={GoalQuestionsScreen} />
      <Tab.Screen name="GoalBreakdown" component={GoalBreakdownScreen} />
    </Tab.Navigator>
  );
}

export default MainTabs;