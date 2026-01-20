#!/bin/bash

# Quick Deploy Script for Admin Changes
# Run this after making changes in /admin to update the live site

echo "🚀 Deploying admin changes to live site..."
echo ""

# Step 1: Commit (empty commit to trigger deployment)
echo "📝 Creating deployment commit..."
git commit --allow-empty -m "deploy: update live site with latest admin changes"

# Step 2: Push to trigger GitHub Actions
echo "⬆️  Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Deployment triggered!"
echo ""
echo "⏳ GitHub Actions is now building and deploying..."
echo "   Check status: https://github.com/PrinceKhimani78/mutanttechnologies/actions"
echo ""
echo "⏰ Wait 2-3 minutes, then:"
echo "   1. Hard refresh browser (Cmd+Shift+R)"
echo "   2. Visit https://www.mutanttechnologies.com"
echo "   3. Your changes will be live!"
echo ""
