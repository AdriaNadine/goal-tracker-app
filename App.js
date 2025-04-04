import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import usePremiumStatus from './hooks/usePremiumStatus';
import Constants from 'expo-constants';

import { fetchProducts, purchaseItemAsync } from './utils/iap';

const PRODUCT_ID = 'goal_master_unlock';

function PremiumScreen() {
  const [product, setProduct] = useState(null);
  const [hasPremium, setHasPremium] = useState(false);

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        console.warn('Notifications permission not granted');
      }
    }
  };

  const fetchProductDetails = async () => {
    try {
      const products = await fetchProducts([PRODUCT_ID]);
      if (products && products.length > 0) {
        setProduct(products[0]);
      } else {
        console.warn('No products found');
      }
    } catch (error) {
      console.error('Error fetching products', error);
    }
  };

  const handleBuy = async () => {
    try {
      if (product && product.productId) {
        await purchaseItemAsync(product.productId);
        Alert.alert('Success', 'Purchase completed successfully!');
        setHasPremium(true);
        await AsyncStorage.setItem('hasPremium', 'true');
      } else {
        Alert.alert('Error', 'Product not available for purchase.');
      }
    } catch (error) {
      console.error('Purchase failed', error);
      Alert.alert('Purchase error', 'An error occurred while trying to buy the product.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const checkPremium = async () => {
        const value = await AsyncStorage.getItem('hasPremium');
        setHasPremium(value === 'true');
      };
      checkPremium();
    }, [])
  );

  useEffect(() => {
    requestNotificationPermission(); // ✅ Request permissions when app loads
    fetchProductDetails(); // ✅ Fetch product details when app loads
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goal Master Upgrade</Text>
      <Text style={styles.description}>
        Unlock unlimited goals, save your reflections, and personalize your dashboard!
      </Text>
      {hasPremium ? (
        <Text style={styles.success}>✅ You already own Goal Master</Text>
      ) : (
        <>
          <Text style={styles.description}>
            {product ? `Price: ${product.price}` : 'Loading product details...'}
          </Text>
          <Button title="Buy Goal Master" onPress={handleBuy} disabled={!product} />
        </>
      )}
    </View>
  );
}

export default function App() {
  const isPremium = usePremiumStatus();
  const version =
    Constants?.expoConfig?.version ||
    Constants?.manifest2?.extra?.expoClient?.version ||
    Constants?.manifest?.version ||
    'Unknown';

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