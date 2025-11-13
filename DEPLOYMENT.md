# 🚨 DEPLOYMENT PROCESS

**CRITICAL: We use Railway for hosting - NOT Firebase Hosting**

Railway auto-deploys from GitHub. DO NOT use Firebase deployment commands.

---

## How to Deploy

```bash
# 1. Stage your changes
git add -A

# 2. Commit with descriptive message
git commit -m "your changes description"

# 3. Push to GitHub
git push origin main
```

**That's it!** Railway automatically detects the push and deploys within 1-2 minutes.

---

## Deployment Architecture

```
Code Changes → GitHub (main branch) → Railway (auto-deploy) → Production
```

**Railway Dashboard**: Check deployment status at https://railway.app

---

## What Firebase IS Used For

- **Firestore**: Database (brand instructions, assets, pattern knowledge)
- **Storage**: File storage (PDFs, images, uploaded assets)
- **Authentication**: (if configured)

## What Firebase IS NOT Used For

- ❌ **Hosting** (we use Railway instead)
- ❌ **Deployment** (handled by Railway auto-deploy)

---

## Files in This Project

- ✅ `config/firebase.ts` - Firebase SDK config (Firestore/Storage)
- ❌ `firebase.json` - REMOVED (was for hosting, we don't use it)
- ❌ `.firebaserc` - REMOVED (was for hosting, we don't use it)

---

## Common Mistakes to Avoid

❌ **NEVER RUN:**
```bash
firebase deploy
firebase hosting:deploy
firebase login --reauth
```

✅ **ALWAYS USE:**
```bash
git push origin main
```

---

## Troubleshooting Deployment

**If deployment fails:**
1. Check Railway dashboard for error logs
2. Verify build completed on GitHub Actions (if configured)
3. Check Railway environment variables are set correctly

**To rollback:**
1. Railway dashboard → Deployments → Select previous deployment → Redeploy

---

## Environment Variables

Set in Railway dashboard (not in code):
- `VITE_OPENAI_API_KEY`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---

## Summary

**Deployment = Git Push**

Railway handles everything else automatically. No Firebase deployment commands needed.
