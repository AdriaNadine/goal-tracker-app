#!/bin/sh

# Go into the iOS folder
cd ios

# Remove previous Pod artifacts if they exist (clean start)
rm -rf Pods Podfile.lock

# Reinstall Pods
pod install