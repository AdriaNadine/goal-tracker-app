import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from './DashboardScreen';
import ProgressScreen from './ProgressScreen';
import CategoriesScreen from './CategoriesScreen';
import GoalBreakdownScreen from './GoalBreakdownScreen';
import GoalQuestionScreen from './GoalQuestionsScreen';
import PremiumScreen from './PremiumScreen';
import XPStatusScreen from './XPStatusScreen';
import ReflectionScreen from './ReflectionScreen';
import { View, Text } from 'react-native';
import { useXP } from '../contexts/XPContext';

const Tab = createBottomTabNavigator();

function MainTabs() {
  const { isPremium } = useXP();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🧭</Text>
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🗂️</Text>
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalQuestionScreen}
        options={{
          tabBarLabel: 'Goals',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🎯</Text>
        }}
      />
      <Tab.Screen
        name="Steps"
        component={GoalBreakdownScreen}
        options={{
          tabBarLabel: 'Steps',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📋</Text>
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📈</Text>
        }}
      />
      <Tab.Screen
        name="XPStatus"
        component={XPStatusScreen}
        options={{
          tabBarLabel: 'XP',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>✨</Text>
        }}
      />
      <Tab.Screen
        name="Reflection"
        component={ReflectionScreen}
        options={{
          tabBarLabel: 'Reflection',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏆</Text>
        }}
      />
    </Tab.Navigator>
  );
}

export default MainTabs;