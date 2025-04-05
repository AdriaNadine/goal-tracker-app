// utils/iap.js

import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../config/firebase';

const ITEM_ID = 'goal_master_unlock'; // Must match App Store Connect

export const connectToStore = async () => {
  const { responseCode } = await InAppPurchases.connectAsync();

  if (responseCode === InAppPurchases.IAPResponseCode.OK) {
    console.log('Connected to App Store ✅');
  } else {
    console.warn('Failed to connect to App Store ❌');
  }
};

export const getAvailableProducts = async () => {
  const items = [ITEM_ID];
  const { responseCode, results } = await InAppPurchases.getProductsAsync(items);

  if (responseCode === InAppPurchases.IAPResponseCode.OK) {
    console.log('Available Products:', results);
    return results;
  } else {
    console.warn('Failed to get products ❌');
    return [];
  }
};

export const setPurchaseListener = (onUnlock) => {
  InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      for (const purchase of results) {
        if (!purchase.acknowledged) {
          await InAppPurchases.finishTransactionAsync(purchase, false);
          console.log('✅ Purchase completed and acknowledged');
          onUnlock(); // Trigger whatever callback the app provides
        }
      }
    } else {
      console.warn('❌ Purchase listener error:', errorCode);
    }
  });
};

export const unlockPremium = async () => {
  try {
    await AsyncStorage.setItem('isPremiumUser', 'true');
    console.log('✨ Premium unlocked and stored in AsyncStorage');

    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      const db = getFirestore(app);
      await setDoc(doc(db, 'users', user.uid), { isPremium: true }, { merge: true });
      console.log('✨ Premium status also saved to Firestore');
    }
  } catch (error) {
    console.error('Failed to unlock premium:', error);
  }
};