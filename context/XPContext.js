import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const XPContext = createContext();

export const XPProvider = ({ children }) => {
  const [currentXP, setCurrentXP] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const loadXP = async () => {
      const user = getAuth().currentUser;
      const db = getFirestore();

      try {
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.xp !== undefined) {
              setCurrentXP(data.xp);
              setLevel(data.level || Math.floor(data.xp / 100) + 1);
              return;
            }
          }
        }

        // fallback to AsyncStorage
        const storedXP = await AsyncStorage.getItem('userXP');
        const parsedXP = parseInt(storedXP, 10);
        if (!isNaN(parsedXP)) {
          setCurrentXP(parsedXP);
          setLevel(Math.floor(parsedXP / 100) + 1);
        }
      } catch (error) {
        console.warn('⚠️ Error loading XP:', error);
      }
    };
    loadXP();
  }, []);

  const awardXP = async (amount) => {
    setCurrentXP((prevXP) => {
      const updatedXP = prevXP + amount;
      const levelThreshold = 100;
      const newLevel = Math.floor(updatedXP / levelThreshold) + 1;
      setLevel(newLevel);
      AsyncStorage.setItem('userXP', updatedXP.toString());

      (async () => {
        const db = getFirestore();
        const user = getAuth().currentUser;
        if (user) {
          await setDoc(doc(db, 'users', user.uid), {
            xp: updatedXP,
            level: newLevel
          }, { merge: true });
        }
      })();

      if (updatedXP % levelThreshold === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Congratulations!', `You leveled up to level ${newLevel}!`);

        if (typeof Notifications.scheduleNotificationAsync === 'function') {
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'Reward Time!',
              body: `You've reached level ${newLevel}. Reward yourself: Take a coffee break`,
            },
            trigger: { seconds: 1, repeats: false },
          }).catch(console.error);
        } else {
          console.warn('❌ scheduleNotificationAsync is not available in this build.');
        }
      }

      return updatedXP;
    });
  };

  return (
    <XPContext.Provider value={{ currentXP, setCurrentXP, level, awardXP }}>
      {children}
    </XPContext.Provider>
  );
};

export const useXP = () => useContext(XPContext);