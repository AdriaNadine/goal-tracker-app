import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from './DashboardScreen';
import ProgressScreen from './ProgressScreen';
import PremiumScreen from './PremiumScreen';
import CategoriesScreen from './CategoriesScreen';
import GoalBreakdownScreen from './GoalBreakdownScreen';
import GoalQuestionScreen from './GoalQuestionsScreen';
import SignInScreen from './SignInScreen';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

function XPStatusScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>XP Status (coming soon)</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Goals" component={GoalQuestionScreen} />
      <Tab.Screen name="Steps" component={GoalBreakdownScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Premium" component={PremiumScreen} />
      <Tab.Screen name="XPStatus" component={XPStatusScreen} />
      <Tab.Screen name="SignIn" component={SignInScreen} />
    </Tab.Navigator>
  );
}

export default MainTabs;