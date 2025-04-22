export default {
  expo: {
    name: "Goal Tracker",
    slug: "goal-tracker-app",
    version: "4.0.1",
    icon: "./assets/icon.png",
    ios: {
      bundleIdentifier: 'com.adriaross.goaltracker',
      googleServicesFile: './assets/ios/GoogleService-Info.plist',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSMicrophoneUsageDescription: 'This app uses your microphone for guided meditations.',
        NSCalendarsUsageDescription: 'This app needs access to your calendar to manage reminders.',
NSUserNotificationAlertUsageDescription: 'This app needs permission to send you notifications.'
      }
    },
    android: {
      versionCode: 1,
      package: "com.adriaross.goaltracker"
    },
    plugins: [
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static"
          }
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "9c1cfd55-4cf8-46f6-ae74-1377768817fb"
      }
    }
  }
};