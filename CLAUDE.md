# Crimson Academies Marketing Assistant - Claude Code Guide

## 🚨 CRITICAL DEPLOYMENT RULE

**NEVER suggest Firebase deployment commands**

✅ **Correct deployment:**
```bash
git add -A
git commit -m "description"
git push origin main
```
Railway automatically detects the push and deploys within 1-2 minutes.

❌ **NEVER use:**
- `firebase deploy`
- `firebase hosting:deploy`
- `firebase login`

**Why:** Firebase is ONLY used for database (Firestore) and file storage. Railway handles all hosting and deployment.

---

## Firebase Usage

- ✅ **Firestore** - Database (brand instructions, assets, pattern knowledge)
- ✅ **Storage** - Files (PDFs, images, uploaded assets)
- ❌ **Hosting** - NOT USED (Railway handles deployment)

---

## 🛡️ Safe Property Access Pattern

**ALL brand instruction fields are optional.** The app is designed for graceful degradation.

### ALWAYS use optional chaining and fallbacks:

```typescript
// ✅ CORRECT - Safe access
instructions.adCopyInstructions?.requirements || ''
instructions.adCopyInstructions?.systemPrompt || ''
instructions.campaignInstructions?.tofu || ''
(instructions.personas || []).map(p => p.name)
(instructions.coreValues || []).join(', ')
(item.variation.keywords || []).join(', ')

// ❌ WRONG - Will crash on missing data
instructions.adCopyInstructions.requirements
instructions.campaignInstructions.tofu
instructions.personas.map(p => p.name)
item.variation.keywords.join(', ')
```

### Why This Matters

- New brands start with incomplete instructions
- Legacy brands may be missing newer fields
- Users should be able to generate content immediately (with fallbacks)
- Warning modal guides users to configure missing instructions

---

## Quick Commands

```bash
# Development
npm run dev              # Start local development server

# Building
npm run build            # Build project (always run before deploying)

# Deployment
git add -A
git commit -m "description"
git push origin main     # Railway auto-deploys
```

---

## Architecture Overview

### Key Directories

- `/components/` - React components (TextGenerator, DAM, Modals)
- `/components/dam/` - Digital Asset Management UI
- `/services/` - Business logic (textGeneration, instructions, patterns)
- `/utils/` - Utilities (instructionsValidator)
- `/types.ts` - All TypeScript interfaces

### Key Files

- `services/textGenerationService.ts` - OpenAI content generation with fallback system
- `services/instructionsService.ts` - Load/save brand instructions from Firestore
- `utils/instructionsValidator.ts` - Check for missing instructions
- `components/InstructionsWarningModal.tsx` - Warning modal before generation
- `components/TextGenerator.tsx` - Main content generation form
- `types.ts` - All type definitions (BrandInstructions, TypeSpecificInstructions, etc.)

---

## Key Patterns

### 1. Graceful Degradation System

The app handles incomplete brand instructions gracefully:

```typescript
// textGenerationService.ts - Fallback system
if (!brandInstructions.adCopyInstructions?.systemPrompt) {
  console.warn('⚠️ Using generic fallback for ad copy');
  typeInstructions = {
    systemPrompt: 'Generic ad copywriting instructions...',
    requirements: '...',
    examples: [],
    dos: [...],
    donts: [...]
  };
}
```

**Flow:**
1. User tries to generate content
2. `instructionsValidator` checks for missing fields
3. If missing → Show `InstructionsWarningModal`
4. User can: Configure Now | Generate Anyway | Cancel
5. If "Generate Anyway" → Use generic fallbacks + log warnings

### 2. Type Safety

All brand instruction fields are optional in `types.ts`:

```typescript
export interface BrandInstructions {
  // Optional - may not exist in legacy/new brands
  campaignInstructions?: {
    tofu: string;
    mofu: string;
    bofu: string;
  };

  adCopyInstructions?: TypeSpecificInstructions;
  blogInstructions?: TypeSpecificInstructions;
  landingPageInstructions?: TypeSpecificInstructions;

  emailInstructions?: {
    invitation?: TypeSpecificInstructions;
    nurturingDrip?: TypeSpecificInstructions;
    emailBlast?: TypeSpecificInstructions;
  };
}
```

### 3. Content Generation Flow

```
User fills form → Clicks Generate
    ↓
instructionsValidator checks for missing fields
    ↓
Missing fields found? → Show InstructionsWarningModal
    ↓
User chooses: [Configure Now] [Generate Anyway] [Cancel]
    ↓
Generate → textGenerationService
    ↓
Uses brand-specific OR generic fallback instructions
    ↓
Calls OpenAI API → Returns generated content
```

---

## Common Tasks

### Adding a New Content Type

1. Add type to `TaskType` in `types.ts`
2. Add instructions interface to `BrandInstructions`
3. Add fallback in `textGenerationService.ts` (buildSystemPrompt)
4. Add validation in `instructionsValidator.ts`
5. Add UI tab in `BrandInstructionsEditor.tsx`

### Debugging Missing Data Errors

If you see "Cannot read properties of undefined":

1. Check the error location (which file/line)
2. Identify which property is undefined
3. Add optional chaining (`?.`) and fallback (`|| ''` or `|| []`)
4. Run `npm run build` to verify TypeScript is happy

### Testing Content Generation

1. Select a brand with incomplete instructions (triggers warning modal)
2. Click "Generate Anyway" to test fallback system
3. Check console for warning logs about generic instructions
4. Configure instructions in DAM to test brand-specific generation

---

## Troubleshooting

### "Cannot read properties of undefined (reading 'X')"

**Cause:** Accessing nested property without optional chaining

**Fix:** Add `?.` and fallback
```typescript
// Before (crashes)
instructions.field.nestedField

// After (safe)
instructions.field?.nestedField || ''
```

### Build Errors After Editing Types

**Cause:** TypeScript found unsafe property access

**Fix:**
1. Read the error carefully (file + line number)
2. Add optional chaining to the flagged line
3. Run `npm run build` again

### Firebase Deployment Confusion

**Remember:** We use Railway, not Firebase hosting

**Deployment:**
```bash
git push origin main  # That's it!
```

Check Railway dashboard for deployment status (live in 1-2 minutes).

---

## Best Practices

1. ✅ **Always use optional chaining** for brand instruction properties
2. ✅ **Always provide array fallbacks** before using `.map()`, `.join()`, etc.
3. ✅ **Log warnings** when using generic fallbacks (helps debugging)
4. ✅ **Run `npm run build`** before pushing to catch TypeScript errors
5. ✅ **Test with incomplete brand data** to verify graceful degradation
6. ✅ **Use the warning modal system** to guide users to configure instructions
7. ✅ **Deploy via git push** (Railway auto-deploys, never use Firebase commands)

---

## Questions?

If something's unclear or you need to understand how a feature works, ask Claude Code to:
- Explain the architecture
- Show how data flows through the system
- Point to relevant files and examples

This guide is your source of truth for how this project works.
