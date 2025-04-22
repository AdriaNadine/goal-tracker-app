import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import * as InAppPurchases from 'expo-in-app-purchases';
import * as Notifications from 'expo-notifications';
import { initPurchaseListener, unlockPremium } from '../utils/iap';

const PRODUCT_ID = 'goal_master_unlock';

export default function PremiumScreen() {
  const [product, setProduct] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  // 🔔 Ask for notification permission
  const requestNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        console.warn('Notifications permission not granted');
      }
    }
  };

  // 🛒 Fetch IAP products
  const fetchProducts = async () => {
    try {
      const { responseCode, results } = await InAppPurchases.getProductsAsync([PRODUCT_ID]);
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        if (results.length > 0) {
          console.log('✅ Product loaded:', results[0]);
          setProduct(results[0]);
        } else {
          console.warn('❌ No IAP products returned. Likely unapproved or mismatched Product ID.');
          Alert.alert('IAP Unavailable', 'Product could not be loaded. Please try again later.');
        }
      } else {
        console.warn('⚠️ IAP response code not OK:', responseCode);
      }
    } catch (err) {
      console.warn('🔥 Error fetching products:', err);
    }
  };

  // 💳 Trigger purchase
  const handleBuy = async () => {
    console.log('🛒 Purchase button tapped');
    if (product) {
      try {
        console.log('📦 Attempting to purchase:', product.productId);
        await InAppPurchases.purchaseItemAsync(product.productId);
      } catch (error) {
        Alert.alert("Purchase error", "An error occurred while trying to make the purchase.");
        console.warn('🚫 Purchase error:', error);
      }
    } else {
      Alert.alert("Product not available", "Unable to purchase at this time.");
      console.warn('⚠️ Tried to buy, but product is null');
    }
  };

  // 🚀 Setup IAP listener & initialization
  useEffect(() => {
    const init = async () => {
      try {
        await requestNotificationPermission();
        await InAppPurchases.connectAsync();

        initPurchaseListener(() => {
          console.log("🟢 Purchase listener fired. Calling unlockPremium...");
          unlockPremium();
          setIsPremium(true);
        });

        await fetchProducts();
        // Check and set premium status on load (removed auto premium default)
      } catch (err) {
        console.warn("🔥 IAP init error:", err);
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

      {isPremium && (
        <Text style={styles.premiumBadge}>🌟 Premium Active</Text>
      )}

      {!isPremium && product && typeof product.price === 'string' ? (
        <>
          <Button title={`Buy for ${product.price}`} onPress={handleBuy} />
          <Button
            title="Restore Purchase"
            onPress={async () => {
              try {
                const history = await InAppPurchases.getPurchaseHistoryAsync();
                const unlocked = Array.isArray(history) && history.some(p => p.productId === PRODUCT_ID);
                if (unlocked) {
                  await unlockPremium();
                  console.log('🔓 unlockPremium() called from restore flow');
                  setIsPremium(true);
                  Alert.alert('✅ Purchase restored!', 'Premium access reinstated.');
                } else {
                  Alert.alert('❌ No previous purchase found.');
                }
              } catch (err) {
                console.warn('⚠️ Error restoring purchase:', err);
                Alert.alert('Error', 'Could not restore purchase.');
              }
            }}
          />
        </>
      ) : !isPremium ? (
        <Text style={styles.errorMessage}>⚠️ Product is currently unavailable.</Text>
      ) : null}
      
      {__DEV__ && (
        <Button
          title="Reset Premium (DEV)"
          onPress={async () => {
            await AsyncStorage.removeItem('isPremium');
            setIsPremium(false);
            console.log('🔄 Premium reset for testing');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  errorMessage: { fontSize: 16, color: 'red', marginTop: 20 },
  premiumBadge: {
    fontSize: 18,
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 10,
  },
});