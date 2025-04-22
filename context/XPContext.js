import React, { createContext, useContext, useState } from 'react';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

const XPContext = createContext();

export const XPProvider = ({ children }) => {
  const [currentXP, setCurrentXP] = useState(0);

  const awardXP = (amount) => {
    setCurrentXP((prevXP) => {
      const updatedXP = prevXP + amount;
      const levelThreshold = 100;
      const isMilestone = updatedXP % levelThreshold === 0;

      if (isMilestone) {
        const level = updatedXP / levelThreshold;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Congratulations!', `You leveled up to level ${level}!`);

        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Reward Time!',
            body: `You've reached level ${level}. Reward yourself: Take a coffee break`,
          },
          trigger: { seconds: 1, repeats: false },
        }).catch(console.error);
      }

      return updatedXP;
    });
  };

  return (
    <XPContext.Provider value={{ currentXP, setCurrentXP, awardXP }}>
      {children}
    </XPContext.Provider>
  );
};

export const useXP = () => useContext(XPContext);