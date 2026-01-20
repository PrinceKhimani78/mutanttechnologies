# Setup Instructions for Publish Button

## Step 1: Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Mutant Deploy Webhook`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)

## Step 2: Upload Webhook to cPanel

1. Open the file: `deploy-webhook.php`
2. Replace `YOUR_GITHUB_TOKEN_HERE` with your actual token from Step 1
3. Upload this file to your cPanel server:
   - Location: `/public_html/api/deploy-webhook.php`
   - Create the `/api/` folder if it doesn't exist

## Step 3: Test the Webhook

Visit this URL in your browser:
```
https://www.mutanttechnologies.com/api/deploy-webhook.php
```

You should see an error (that's normal - it requires POST request).

## Step 4: Add Publish Button to Admin Dashboard

The `PublishButton` component is ready to use. Add it to your admin dashboard:

```typescript
import { PublishButton } from '@/components/admin/PublishButton';

// In your admin dashboard:
<PublishButton />
```

## Step 5: Test It!

1. Go to `/admin/dashboard`
2. Click **"Publish Changes to Live Site"**
3. Wait for success message
4. Check GitHub Actions: https://github.com/PrinceKhimani78/mutanttechnologies/actions
5. Wait 2-3 minutes
6. Refresh live site - changes will be visible!

---

## Security Notes

- The webhook uses a secret token (`mutant-deploy-secret-2024`)
- Change this to something more secure
- Keep your GitHub token private
- Never commit the token to Git

---

## Troubleshooting

**Button doesn't work:**
- Check browser console for errors
- Verify webhook URL is correct
- Check GitHub token has correct permissions

**Deployment doesn't start:**
- Verify GitHub token is valid
- Check webhook file is uploaded correctly
- Look at webhook response in browser network tab

---

## How It Works

```
Admin Panel → Click Button → PHP Webhook → GitHub API → Trigger Workflow → Build → Deploy → Live Site
```

**Timeline:**
- Button click: Instant
- GitHub Actions starts: ~5 seconds
- Build completes: ~2 minutes
- Files uploaded: ~30 seconds
- **Total: 2-3 minutes**
