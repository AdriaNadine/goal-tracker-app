import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
// import * as InAppPurchases from 'expo-in-app-purchases';
// import { fetchProducts, purchaseItemAsync } from './utils/iap';
// import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import usePremiumStatus from './hooks/usePremiumStatus';
import Constants from 'expo-constants';
import { db } from './config/firebase';
import { collection, getDocs } from 'firebase/firestore';

const PRODUCT_ID = 'goal_master_unlock';

function PremiumScreen() {
  return null;
}

export default function App() {
  const isPremium = usePremiumStatus();
  const version =
    Constants?.expoConfig?.version ||
    Constants?.manifest2?.extra?.expoClient?.version ||
    Constants?.manifest?.version ||
    'Unknown';

  useEffect(() => {
    const testFirestore = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'));
        console.log(`✅ Firebase is connected! Found ${snapshot.size} categories.`);
      } catch (error) {
        console.error('❌ Firebase test read failed:', error.message);
      }
    };
    testFirestore();
  }, []);

  // useEffect(() => {
  //   const requestNotificationPermissions = async () => {
  //     const { status } = await Notifications.getPermissionsAsync();
  //     // Additional logic for handling notification permissions
  //   };
  //   requestNotificationPermissions();
  // }, []);

  return (
    <NavigationContainer>
      <Text style={{
        position: 'absolute',
        top: 50,
        left: 10,
        zIndex: 999,
        backgroundColor: 'yellow',
        padding: 5,
        fontSize: 12
      }}>
        BUILD: development | VERSION: {version} | USER: {isPremium ? 'Premium ✅' : 'Free ❌'}
      </Text>
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  success: { fontSize: 16, color: 'green', marginTop: 10 },
  error: { fontSize: 16, color: 'red', marginTop: 10 }
});