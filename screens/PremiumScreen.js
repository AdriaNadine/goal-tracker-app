import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';
import * as Notifications from 'expo-notifications';
import { setPurchaseListener, unlockPremium } from '../utils/iap';
import { recheckPremiumStatus } from '../hooks/usePremiumStatus'; // Import recheckPremiumStatus

const PRODUCT_ID = 'goal_master_unlock'; // ✅ Matches App Store product

export default function PremiumScreen() {
  const [product, setProduct] = useState(null);
  const [isPremium, setIsPremium] = useState(false); // Add local premium state

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

  // 🧠 Fetch product info from Apple
  const fetchProducts = async () => {
    try {
      const { responseCode, results } = await InAppPurchases.getProductsAsync([PRODUCT_ID]);
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results.length > 0) {
        setProduct(results[0]);
        console.log('✅ Product loaded:', results[0]);
      } else {
        console.warn('⚠️ No products found or failed to load');
      }
    } catch (err) {
      console.warn('🔥 Error fetching products:', err);
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

  // 📡 Setup listeners + permissions safely
  useEffect(() => {
    const init = async () => {
      try {
        await requestNotificationPermission();
        await InAppPurchases.connectAsync();
        await fetchProducts();

        if (InAppPurchases?.setPurchaseListener) {
          setPurchaseListener(async () => {
            await unlockPremium();
            await recheckPremiumStatus(setIsPremium); // Trigger recheck
            Alert.alert("🎉 Thank you for your purchase!", "Premium unlocked.");
          });
        } else {
          console.warn("💥 IAP not available — skipping listener.");
        }
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

      {!isPremium ? (
        product && typeof product.price === 'string' ? (
          <>
            <Button title={`Buy for ${product.price}`} onPress={handleBuy} />
            <Button
              title="Restore Purchase"
              onPress={async () => {
                try {
                  const history = await InAppPurchases.getPurchaseHistoryAsync();
                  const unlocked = history.some(p => p.productId === PRODUCT_ID);
                  if (unlocked) {
                    await unlockPremium();
                    await recheckPremiumStatus(setIsPremium);
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
        ) : (
          <Text style={styles.errorMessage}>⚠️ Product is currently unavailable.</Text>
        )
      ) : null}
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