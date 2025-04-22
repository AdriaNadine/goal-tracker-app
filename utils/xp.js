import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

const levelThreshold = 100; // XP needed for each level

// Function to award XP and handle celebrations and reward notifications
export const awardXP = async (amount, setXPCallback) => {
  if (typeof amount !== 'number') return;

  if (typeof setXPCallback === 'function') {
    setXPCallback((prevXP) => {
      const updatedXP = prevXP + amount;
      const milestone = checkMilestone(updatedXP);
      if (milestone) {
        triggerCelebration(milestone);
        scheduleRewardNotification(milestone);
      }
      return updatedXP;
    });
  }
};

// Checks if the current XP has reached a milestone
const checkMilestone = (xp) => {
  if (xp % levelThreshold === 0) {
    return { level: xp / levelThreshold };
  }
  return null;
};

// Triggers a celebratory experience for the milestone
const triggerCelebration = (milestone) => {
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
      trigger: { seconds: 1, repeats: false },
    });
  } catch (error) {
    console.error('Failed to schedule reward notification:', error);
  }
};

// Placeholder function to retrieve the user's preferred reward
const getUserReward = () => {
  return 'Take a coffee break';
};

export default {
  awardXP,
};