import {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
} from '@env';

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Log env values to verify loading correctly
console.log("📦 ENV Firebase API Key:", EXPO_PUBLIC_FIREBASE_API_KEY);
console.log("📦 ENV Firebase Project ID:", EXPO_PUBLIC_FIREBASE_PROJECT_ID);

// Firebase config using .env values
const firebaseConfig = {
  apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Log config object for debug
console.log("📦 iOS Firebase Config:", firebaseConfig);

// Initialize Firebase app (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with persistence support
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  if (e.code === "auth/already-initialized") {
    auth = getAuth(app);
  } else {
    throw e;
  }
}

// Track auth changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("👤 Logged in user detected.");
  } else {
    console.log("👤 No user signed in.");
  }
});

// Initialize Firestore
const db = getFirestore(app);

// Conditionally load analytics for web only
let analytics;
if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
    isSupported().then((ok) => {
      if (ok) {
        analytics = getAnalytics(app);
      }
    });
  });
}

// Export everything needed
export { app, auth, db, analytics, firebaseConfig };