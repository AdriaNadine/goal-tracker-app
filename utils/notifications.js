import * as Notifications from 'expo-notifications';

export const scheduleNotification = async (item, date) => {
  const isStep = item.text && !item.title;
  const title = isStep ? 'Step Reminder' : 'Goal Reminder';
  const body = isStep
    ? `Don't forget: ${item.text}`
    : `Keep going on your goal: ${item.title}`;

  // TODO: Store notificationId so we can cancel or update scheduled notifications later (e.g., when goals are deleted or completed)
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      // TODO: Add fallback or validation in case item.id is undefined to prevent issues with notification metadata
      data: { id: item.id, type: isStep ? 'step' : 'goal' },
    },
    trigger: date,
  });
};

export const scheduleMotivationalReminder = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got this!",
      body: "Take one small step toward your goal today 💪",
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });
};