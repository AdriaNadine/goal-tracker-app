import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../config/firebase';

const ITEM_ID = 'goal_master_unlock'; // Must match App Store Connect

export const connectToStore = async (setIsPremium) => {
  const { responseCode } = await InAppPurchases.connectAsync();
  if (responseCode === InAppPurchases.IAPResponseCode.OK) {
    console.log('Connected to App Store ✅');
    setIsPremium(true);
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
  console.log('📡 Setting up purchase listener...');
  InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
    console.log('📦 Global Purchase listener triggered', { responseCode, results, errorCode });

    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      for (const purchase of results) {
        console.log('🧾 Purchase result:', purchase);
        if (!purchase.acknowledged && purchase.productId === ITEM_ID) {
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
  console.log('🔥 unlockPremium() was called');
  try {
    await AsyncStorage.setItem('isPremium', 'true');
    console.log('✨ Premium unlocked and stored in AsyncStorage');

    const auth = getAuth(app);
    let user = auth.currentUser;
    let attempts = 0;
    const maxAttempts = 20;

    while ((!user || !user.uid) && attempts < maxAttempts) {
      console.log(`⏳ Waiting for user (attempt ${attempts + 1}/${maxAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, 300));
      user = auth.currentUser;
      attempts++;
    }
    console.log('👤 Resolved user after retry:', user);
    if (!user || !user.uid) {
      console.warn('❌ Still no user UID after retrying. Skipping Firestore write.');
      return;
    }

    const db = getFirestore(app);
    const userRef = doc(db, 'users', user.uid);
    console.log('📄 Writing premium status to Firestore for UID:', user.uid);
    console.log('📤 Attempting Firestore write with:');
    console.log('   user?.uid:', user?.uid);
    console.log('   user:', user);
    console.log('   typeof user.uid:', typeof user?.uid);

    try {
      await setDoc(userRef, { isPremium: true }, { merge: true });
      console.log('✅ Premium status saved to Firestore');
    } catch (error) {
      console.error('❌ Firestore write failed:', error);
    }
  } catch (error) {
    console.error('Failed to unlock premium:', error);
  }
};

export const restorePurchase = async (onUnlock) => {
  try {
    const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();

    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      for (const purchase of results) {
        if (purchase.productId === ITEM_ID) {
          console.log('✅ Restoring purchase...');
          await unlockPremium();
          if (typeof onUnlock === 'function') {
            await onUnlock();
          }
          return true;
        }
      }
      console.warn('⚠️ No matching purchases found');
    } else {
      console.warn('❌ Failed to get purchase history');
    }
  } catch (error) {
    console.error('❌ Restore purchase error:', error);
  }
  return false;
};