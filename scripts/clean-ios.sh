#!/bin/bash

set -e

echo "🧹 Removing iOS build, Pods, DerivedData, and node_modules..."
rm -rf ios/build ios/Pods ios/Podfile.lock node_modules package-lock.json
rm -rf ~/Library/Developer/Xcode/DerivedData

echo "📦 Reinstalling npm dependencies..."
npm install

echo "📦 Installing pods..."
npx pod-install

echo "🛠️ Updating iOS version to 5.0.1 (build 1)..."
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString 5.0.1" ios/GoalTracker/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion 1" ios/GoalTracker/Info.plist

echo "⚡ Running Expo prebuild clean for iOS..."
npx expo prebuild --clean --platform ios

echo "🍏 Opening Xcode project..."
xed ios

echo "✅ Done! Version 5.0.1 (1) is now set and project is ready."