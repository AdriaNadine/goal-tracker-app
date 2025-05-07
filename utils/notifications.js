import * as Notifications from 'expo-notifications';

export const scheduleNotification = async ({ id, text }, triggerTime) => {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: '📌 Reminder',
      body: text,
      data: { id }
    },
    trigger: triggerTime
  });
};