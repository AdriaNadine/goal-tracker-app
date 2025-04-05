#!/bin/bash

# Ask for commit message
echo "Enter a commit message:"
read message

# Add, commit, and push
git add .
git commit -m "$message"
git push

echo "✅ Code committed and pushed!"