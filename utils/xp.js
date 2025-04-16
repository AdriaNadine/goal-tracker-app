import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

// A simple XP system
let currentXP = 0;
const levelThreshold = 100; // XP needed for each level

// Function to award XP and handle celebrations and reward notifications
export const awardXP = async (amount) => {
  currentXP += amount;
  // Here you can update persistent storage or state management if needed

  const milestone = checkMilestone(currentXP);
  if (milestone) {
    triggerCelebration(milestone);
    await scheduleRewardNotification(milestone);
  }
  return currentXP;
};

// Checks if the current XP has reached a milestone
const checkMilestone = (xp) => {
  // For simplicity, trigger a milestone each time XP crosses a multiple of levelThreshold
  if (xp % levelThreshold === 0) {
    return { level: xp / levelThreshold };
  }
  return null;
};

// Triggers a celebratory experience for the milestone
const triggerCelebration = (milestone) => {
  // Instead of confetti, we use haptics and a modal alert as celebration
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  Alert.alert('Congratulations!', `You leveled up to level ${milestone.level}!`);
};

// Schedules a notification to remind the user to claim their self-defined reward
const scheduleRewardNotification = async (milestone) => {
  const userReward = getUserReward();
  if (!userReward) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Reward Time!',
        body: `You've reached level ${milestone.level}. Reward yourself: ${userReward}`,
      },
      trigger: { seconds: 1, repeats: false }, // triggers almost immediately; adjust as needed
    });
  } catch (error) {
    console.error('Failed to schedule reward notification:', error);
  }
};

// Placeholder function to retrieve the user's preferred reward
// In a real-world scenario, this could fetch from AsyncStorage or a backend.
const getUserReward = () => {
  // For demonstration purposes, we return a default reward. 
  // Later, this can be replaced with user-input from settings or a dedicated UI component.
  return 'Take a coffee break';
};

export default {
  awardXP,
  // Other XP-related functions can be added here as needed
};