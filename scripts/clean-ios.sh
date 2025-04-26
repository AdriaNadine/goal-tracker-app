#!/bin/bash

echo "🧹 Cleaning iOS build, pods, and caches..."
rm -rf ios/build ios/Pods ios/Podfile.lock

echo "📦 Installing pods..."
npx pod-install

echo "🧹 Removing Xcode DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData

echo "⚡ Running Expo prebuild clean for iOS..."
npx expo prebuild --clean --platform ios

echo "🍏 Opening Xcode project..."
xed ios

echo "✅ Done!"