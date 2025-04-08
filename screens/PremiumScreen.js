// screens/PremiumScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';
import * as Notifications from 'expo-notifications';
import { setPurchaseListener, unlockPremium } from '../utils/iap';

const PRODUCT_ID = 'goal_master_unlock'; // Your App Store product ID

export default function PremiumScreen() {
  const [product, setProduct] = useState(null);

  // 🔔 Request user permission for notifications
  const requestNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        console.warn('Notifications permission not granted');
      }
    }
  };

  // 🧠 Fetch product info
  const fetchProducts = async () => {
    const { responseCode, results } = await InAppPurchases.getProductsAsync([PRODUCT_ID]);
    if (responseCode === InAppPurchases.IAPResponseCode.OK && results.length > 0) {
      setProduct(results[0]);
      console.log('✅ Product loaded:', results[0]);
    } else {
      setProduct(null);
      console.warn('⚠️ No products found or failed to load');
    }
  };

  // 💳 Purchase the product
  const handleBuy = async () => {
    if (product) {
      try {
        await InAppPurchases.purchaseItemAsync(product.productId);
      } catch (error) {
        Alert.alert("Purchase error", "An error occurred while trying to make the purchase.");
        console.warn(error);
      }
    } else {
      Alert.alert("Product not available", "Unable to purchase at this time.");
    }
  };

  // 📡 Setup IAP listeners and notification permissions
  useEffect(() => {
    const init = async () => {
      try {
        await requestNotificationPermission();
        await InAppPurchases.connectAsync();
        await fetchProducts();
  
        setPurchaseListener(async () => {
          await unlockPremium();
          Alert.alert("🎉 Thank you for your purchase!", "Premium unlocked.");
        });
  
      } catch (err) {
        console.warn("🔥 Error in IAP init:", err);
      }
    };
  
    init();
  
    return () => {
      InAppPurchases.disconnectAsync();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title} allowFontScaling={true}>Goal Master Upgrade</Text>
      <Text style={styles.description} allowFontScaling={true}>
        Unlock unlimited goals, save your reflections, and personalize your dashboard!
      </Text>

      {product ? (
        <Button title={`Buy for ${product.price}`} onPress={handleBuy} />
      ) : (
        <Text style={styles.errorMessage}>⚠️ Product is currently unavailable.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  errorMessage: { fontSize: 16, color: 'red', marginTop: 20 },
});