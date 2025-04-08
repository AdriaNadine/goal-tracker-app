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
import { Text } from 'react-native'; // Import Text component

// Log environment values for debugging
console.log(<Text>Firebase API Key: {EXPO_PUBLIC_FIREBASE_API_KEY}</Text>);
console.log(<Text>Firebase Project ID: {EXPO_PUBLIC_FIREBASE_PROJECT_ID}</Text>);

// Firebase config
const firebaseConfig = {
  apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth (with persistence guard)
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

// Check auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Firebase API Key:", EXPO_PUBLIC_FIREBASE_API_KEY);
  } else {
    console.log("Firebase Project ID:", EXPO_PUBLIC_FIREBASE_PROJECT_ID);
  }
});

// Initialize Firestore
const db = getFirestore(app);

// Lazy load Firebase Analytics in supported environments only
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

export { app, auth, db, analytics };