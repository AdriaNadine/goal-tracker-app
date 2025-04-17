import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';
import { fetchProducts, purchaseItemAsync } from './utils/iap';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import usePremiumStatus from './hooks/usePremiumStatus';
import Constants from 'expo-constants';
import { db } from './config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { XPProvider } from './context/XPContext';

const PRODUCT_ID = 'goal_master_unlock';

export default function App() {
  const isPremium = usePremiumStatus();
  const version =
    Constants?.expoConfig?.version ||
    Constants?.manifest2?.extra?.expoClient?.version ||
    Constants?.manifest?.version ||
    'Unknown';
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const testFirestore = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'));
        console.log(`✅ Firebase is connected! Found ${snapshot.size} categories.`);
      } catch (error) {
        console.error('❌ Firebase test read failed:', error.message);
      }
    };

    if (user) {
      testFirestore();
    }
  }, [user]);

  // useEffect(() => {
  //   const requestNotificationPermissions = async () => {
  //     const { status } = await Notifications.getPermissionsAsync();
  //     // Additional logic for handling notification permissions
  //   };
  //   requestNotificationPermissions();
  // }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>🔄 Loading...</Text>
      </View>
    );
  }

  return (
    <XPProvider>
      <NavigationContainer>
        <AppNavigator user={user} />
      </NavigationContainer>
    </XPProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  success: { fontSize: 16, color: 'green', marginTop: 10 },
  error: { fontSize: 16, color: 'red', marginTop: 10 }
});