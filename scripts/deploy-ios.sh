#!/bin/bash

echo "🔹 Enter your commit message:"
read commit_msg

echo "📦 Staging all changes..."
git add .

echo "✅ Committing..."
git commit -m "$commit_msg"

echo "☁️ Pushing to GitHub..."
git push

echo "🚀 Starting iOS build (production profile)..."
npx eas build --platform ios --profile production

echo "📝 Reminder: Run the following when you're ready to submit to TestFlight:"
echo "npx eas submit --platform ios --latest"