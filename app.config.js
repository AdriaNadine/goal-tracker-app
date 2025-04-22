export default {
  expo: {
    name: "Goal Tracker",
    slug: "goal-tracker-app",
      icon: './assets/icon.png',
      splash: {
        image: "./assets/splash.png", // ← Make sure this exists
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
    version: "4.0.1",
    ios: {
      buildNumber: "33",
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