// utils/iap.js

import * as InAppPurchases from 'expo-in-app-purchases';

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