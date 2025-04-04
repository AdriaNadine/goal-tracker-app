export default {
  expo: {
    name: "Goal Tracker",
    slug: "goal-tracker-app",
    version: "2.0.2",
    icon: "./assets/icon.png",
    ios: {
      bundleIdentifier: "com.adriaross.goaltracker",
      config: {
        googleServicesFile: "./assets/ios/GoogleService-Info.plist"
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
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