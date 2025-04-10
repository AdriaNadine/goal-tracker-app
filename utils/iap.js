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

export const initPurchaseListener = (onUnlock) => {
  InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
    console.log('📦 Global Purchase listener triggered', { responseCode, results, errorCode });

    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      for (const purchase of results) {
        console.log('🧾 Purchase result:', purchase);
        if (!purchase.acknowledged) {
          console.log('✅ Unacknowledged purchase — finishing transaction...');
          await InAppPurchases.finishTransactionAsync(purchase, false);
          await onUnlock();
        } else {
          console.log('🟡 Purchase already acknowledged');
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

    console.log('🔐 Checking if user is authenticated before saving to Firestore');
    console.log('🔐 Firebase user:', user ? user.uid : 'NO USER');

    if (user) {
      const db = getFirestore(app);
      try {
        await setDoc(doc(db, 'users', user.uid), { isPremium: true }, { merge: true });
        console.log('✨ Premium status saved to Firestore');
      } catch (error) {
        console.error('❌ Failed to write premium to Firestore:', error);
      }
    } else {
      console.warn('⚠️ No user logged in — cannot store premium status in Firestore.');
    }
  } catch (error) {
    console.error('Failed to unlock premium:', error);
  }
};