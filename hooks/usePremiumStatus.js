import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from '../config/firebase';

const usePremiumStatus = () => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const auth = getAuth(app);
        const user = auth.currentUser;

        if (user) {
          const db = getFirestore(app);
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const premium = userSnap.data().isPremium === true;
            setIsPremium(premium);
            await AsyncStorage.setItem('hasPremium', premium.toString());
            return;
          }
        }

        // fallback to local storage
        const value = await AsyncStorage.getItem('hasPremium');
        setIsPremium(value === 'true');
      } catch (error) {
        console.error('Error checking premium status:', error);
        const value = await AsyncStorage.getItem('hasPremium');
        setIsPremium(value === 'true');
      }
    };

    check();
  }, []);

  return isPremium;
};

export default usePremiumStatus;