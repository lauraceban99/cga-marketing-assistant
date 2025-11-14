# Firebase Setup for Brand Checker Script

## Quick Setup (2 minutes)

Your Firebase credentials are already configured in Railway for the deployed app. You need to add them locally to run the checker script.

### Step 1: Get Your Firebase Credentials

You have two options:

#### Option A: From Railway Dashboard
1. Go to your Railway dashboard: https://railway.app/dashboard
2. Open your project
3. Go to **Variables** tab
4. Copy these values:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

#### Option B: From Firebase Console
1. Go to: https://console.firebase.google.com
2. Select your project (likely "ai-marketing-assistant-3ec42")
3. Click gear icon ⚙️ → **Project Settings**
4. Scroll down to "Your apps" section
5. Copy the config values

### Step 2: Edit the .env File

Open the `.env` file that was just created and replace the placeholder values:

```bash
# Replace these with your actual values:
VITE_FIREBASE_API_KEY=AIza...your_actual_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-marketing-assistant-3ec42
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Step 3: Run the Checker Script

```bash
node scripts/check-brand-instructions.js
```

This will show you exactly which brand instruction fields are missing or need to be filled in Firebase.

## Alternative: Check Firebase Manually

If you prefer not to set up the .env file, you can manually check Firebase:

1. Go to: https://console.firebase.google.com/project/ai-marketing-assistant-3ec42/firestore/data
2. Navigate to: `brandInstructions` → `cga`
3. Check for these fields:

### Required Fields (Will cause crashes if missing):
- ✅ `brandIntroduction` (string)
- ✅ `personas` (array)
- ✅ `coreValues` (array)
- ✅ `toneOfVoice` (string)
- ✅ `keyMessaging` (array)

### Optional but Important (Will use generic fallbacks if missing):
- `campaignInstructions` (object with tofu, mofu, bofu)
- `adCopyInstructions` (object with systemPrompt, requirements, examples, dos, donts)
- `blogInstructions` (object with systemPrompt, requirements, examples, dos, donts)
- `landingPageInstructions` (object with systemPrompt, requirements, examples, dos, donts)
- `emailInstructions` (object with invitation, nurturingDrip, emailBlast sub-objects)

---

**Note**: The .env file is git-ignored and stays local. It's only needed for running this checker script locally.
