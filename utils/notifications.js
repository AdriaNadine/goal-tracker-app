import * as Notifications from 'expo-notifications';
const notificationStore = {};

export const scheduleNotification = async (item, date) => {
  const isStep = item.text && !item.title;
  const title = isStep ? 'Step Reminder' : 'Goal Reminder';
  const body = isStep
    ? `Don't forget: ${item.text}`
    : `Keep going on your goal: ${item.title}`;

  try {
    // Schedule the notification and get the notificationId
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        // Validate item.id; if undefined, assign a default value
        data: { id: item.id || 'unknown', type: isStep ? 'step' : 'goal' },
      },
      trigger: date,
    });

    // Store the notificationId under the item's id. If multiple notifications may be scheduled for one item, store as an array.
    if (item.id) {
      if (!notificationStore[item.id]) {
        notificationStore[item.id] = [];
      }
      notificationStore[item.id].push(notificationId);
    } else {
      console.warn('Item id is undefined. Notification not stored properly.');
    }

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
};

export const scheduleMotivationalReminder = async () => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
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

    // Optionally store this motivational reminder if needed
    notificationStore['motivational'] = notificationId;
    return notificationId;
  } catch (error) {
    console.error('Failed to schedule motivational reminder:', error);
  }
};

export const cancelNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    // Optionally, remove the notificationId from the notificationStore
    Object.keys(notificationStore).forEach(key => {
      if (Array.isArray(notificationStore[key])) {
        notificationStore[key] = notificationStore[key].filter(id => id !== notificationId);
      } else if (notificationStore[key] === notificationId) {
        delete notificationStore[key];
      }
    });
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
};