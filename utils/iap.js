import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../config/firebase';

const ITEM_ID = 'goal_master_unlock'; // Must match App Store Connect
let storeConnected = false;

export const connectToStore = async (setIsPremium) => {
  if (storeConnected) {
    console.log('⚠️ Store already connected. Skipping duplicate connect.');
    return;
  }

  const { responseCode } = await InAppPurchases.connectAsync();
  if (responseCode === InAppPurchases.IAPResponseCode.OK) {
    console.log('Connected to App Store ✅');
    storeConnected = true;
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
  
  if (typeof InAppPurchases.setPurchaseListener !== 'function') {
    console.warn('🚫 setPurchaseListener is not available.');
    return;
  }

  InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
    console.log('📦 Global Purchase listener triggered', { responseCode, results, errorCode });

    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      if (results.length === 0) {
        console.log('🛑 No purchases found in results.');
      }
      for (const purchase of results) {
        console.log('🧾 Purchase result:', purchase);
        if (!purchase.acknowledged && purchase.productId === ITEM_ID) {
          console.log('✅ Unacknowledged purchase — finishing transaction...');
          await InAppPurchases.finishTransactionAsync(purchase, false);
          console.log('🎉 Calling unlockPremium...');
          await onUnlock();
        } else {
          console.log('🟡 Purchase already acknowledged or productId mismatch');
        }
      }
    } else {
      console.warn(`❌ Purchase listener error [${responseCode}]:`, errorCode);
    }
  });

  // 💻 Simulate unlockPremium in development mode
  if (__DEV__ && typeof onUnlock === 'function') {
    console.log('🧪 Dev mode: Simulating premium unlock...');
    setTimeout(() => {
      console.log('🔄 Simulating onUnlock callback');
      onUnlock();
    }, 3000);
  }
};

export const unlockPremium = async () => {
  console.log('🔓 Starting unlockPremium...');
  try {
    // 1. Local save
    await AsyncStorage.setItem('isPremium', 'true');
    console.log('✨ Premium unlocked and stored in AsyncStorage');

    // 2. Auth check loop
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

    // 3. Abort if no UID
    if (!user || !user.uid) {
      console.warn('❌ No user UID found after retry. Skipping Firestore write.');
      return;
    }

    // 4. Firestore write
    const db = getFirestore(app);
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { isPremium: true }, { merge: true });

    console.log('✅ Firestore write succeeded: isPremium saved');

  } catch (error) {
    console.error('💥 unlockPremium failed:', error);
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