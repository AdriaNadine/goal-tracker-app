import * as Notifications from 'expo-notifications';
import React, { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    const sendTestNotification = async () => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Test Notification',
          body: 'This is a test notification to confirm it works.',
        },
        trigger: { seconds: 10 }
      });
    };

    sendTestNotification();
  }, []);

  // ...rest of your App component code
};

export default App;