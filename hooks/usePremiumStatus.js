import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from '../config/firebase';

export default function usePremiumStatusHook() {
  const [isPremium, setIsPremium] = useState(undefined); // initially undefined

  useEffect(() => {
    const check = async () => {
      try {
        const value = await AsyncStorage.getItem('isPremium');
        if (value !== null) {
          setIsPremium(value === 'true');
        }

        const auth = getAuth(app);
        const user = auth.currentUser;

        if (user) {
          const db = getFirestore(app);
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const premium = userSnap.data().isPremium === true;
            setIsPremium(premium);
            await AsyncStorage.setItem('isPremium', premium.toString());
            return;
          }
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
      }
    };

    check();
  }, []);

  return [isPremium, setIsPremium];
}