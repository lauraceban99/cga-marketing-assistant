# Multi-User Collaboration Implementation Guide

## Current Status: Phase 1 Complete (25% Done)

### ✅ Completed (Phase 1)
- Authentication service with Firebase Auth
- AuthContext provider for React
- Version history service with change tracking
- Type definitions for all new features

### 🚧 Remaining Work (Phases 2-4)

---

## Phase 2: Conflict Detection & Transactions (Priority: CRITICAL)

### Step 1: Update `instructionsService.ts` with Optimistic Locking

**Location:** `services/instructionsService.ts`

**Changes Needed:**

```typescript
import { runTransaction, doc } from 'firebase/firestore';
import { saveVersionToHistory } from './versionHistoryService';

// REPLACE existing saveBrandInstructions function with:
export const saveBrandInstructions = async (
  brandId: string,
  instructions: BrandInstructions,
  userId: string,
  userName: string,
  clientVersion: number  // ← ADD THIS PARAMETER
): Promise<{ success: boolean; conflict?: boolean; remoteVersion?: number }> => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const docRef = doc(db, COLLECTION_NAME, brandId);
      const currentDoc = await transaction.get(docRef);

      if (currentDoc.exists()) {
        const currentData = currentDoc.data();
        const currentVersion = currentData.version || 1;

        // CHECK FOR CONFLICTS
        if (currentVersion !== clientVersion) {
          console.warn(`⚠️ Conflict detected: client v${clientVersion}, server v${currentVersion}`);
          return { success: false, conflict: true, remoteVersion: currentVersion };
        }

        // No conflict - proceed with save
        const newVersion = currentVersion + 1;
        const previousSnapshot = currentData as BrandInstructions;

        transaction.set(docRef, {
          ...instructions,
          lastUpdatedBy: userId,
          lastUpdatedByName: userName,
          lastUpdated: serverTimestamp(),
          version: newVersion
        });

        // Save to history (after transaction completes)
        await saveVersionToHistory(
          brandId,
          newVersion,
          instructions,
          userId,
          userName,
          previousSnapshot
        );

        return { success: true, conflict: false };
      } else {
        // New document - no conflict possible
        transaction.set(docRef, {
          ...instructions,
          lastUpdatedBy: userId,
          lastUpdatedByName: userName,
          lastUpdated: serverTimestamp(),
          version: 1
        });

        return { success: true, conflict: false };
      }
    });

    return result;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};
```

**Impact:** Prevents silent data overwrites. If conflict detected, returns `{ conflict: true }` instead of saving.

---

## Phase 3: Real-Time Sync (Priority: HIGH)

### Step 2: Create `hooks/useRealtimeSync.ts`

**New File:** `hooks/useRealtimeSync.ts`

```typescript
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { BrandInstructions } from '../types';

export interface UseRealtimeSyncOptions {
  brandId: string;
  enabled: boolean;
  onRemoteUpdate: (remoteData: BrandInstructions, remoteVersion: number) => void;
  onConflict: (localVersion: number, remoteVersion: number) => void;
}

export function useRealtimeSync({
  brandId,
  enabled,
  onRemoteUpdate,
  onConflict
}: UseRealtimeSyncOptions) {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!enabled || !brandId) return;

    const docRef = doc(db, 'brandInstructions', brandId);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      // Ignore local writes (only react to remote changes)
      if (snapshot.metadata.hasPendingWrites) return;

      if (snapshot.exists()) {
        const remoteData = snapshot.data() as BrandInstructions;
        const remoteVersion = remoteData.version || 1;

        console.log(`🔄 Remote update detected: v${remoteVersion}`);
        onRemoteUpdate(remoteData, remoteVersion);
      }

      setIsListening(true);
    });

    return () => {
      unsubscribe();
      setIsListening(false);
    };
  }, [brandId, enabled]);

  return { isListening };
}
```

### Step 3: Update `BrandInstructionsEditor.tsx` to Use Real-Time Sync

**Location:** `components/dam/BrandInstructionsEditor.tsx`

**Add at top:**
```typescript
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import { useAuth } from '../../contexts/AuthContext';
```

**Replace existing useState for version:**
```typescript
const [localVersion, setLocalVersion] = useState<number>(1);
const [remoteVersion, setRemoteVersion] = useState<number>(1);
const [showConflictModal, setShowConflictModal] = useState(false);
const { user } = useAuth();
```

**Add real-time listener:**
```typescript
// Add after other useEffects
const { isListening } = useRealtimeSync({
  brandId: brand.id,
  enabled: true,
  onRemoteUpdate: (remoteData, remoteVer) => {
    if (remoteVer > localVersion) {
      if (hasUnsavedChanges) {
        // User has unsaved changes - show conflict modal
        setRemoteVersion(remoteVer);
        setShowConflictModal(true);
      } else {
        // No local changes - auto-update
        setInstructions(remoteData);
        setLocalVersion(remoteVer);
        console.log('✅ Auto-updated to latest version');
      }
    }
  },
  onConflict: (local, remote) => {
    setLocalVersion(local);
    setRemoteVersion(remote);
    setShowConflictModal(true);
  }
});
```

**Update handleSave to use transactions:**
```typescript
const handleSave = async () => {
  if (!instructions || !user) return;

  setSaving(true);
  try {
    const result = await saveBrandInstructions(
      brand.id,
      instructions,
      user.uid,
      user.displayName,
      localVersion  // ← Pass current version
    );

    if (result.conflict) {
      // Conflict detected - show resolution modal
      setRemoteVersion(result.remoteVersion!);
      setShowConflictModal(true);
      setSuccessMessage('');
    } else {
      // Success
      setLocalVersion(localVersion + 1);
      setHasUnsavedChanges(false);
      setSuccessMessage('✅ Changes saved successfully!');
    }
  } catch (error) {
    console.error('Save failed:', error);
    alert('Error saving. Please try again.');
  } finally {
    setSaving(false);
  }
};
```

---

## Phase 4: UI Components (Priority: MEDIUM)

### Step 4: Create `components/ConflictResolutionModal.tsx`

**New File:** `components/ConflictResolutionModal.tsx`

```typescript
import React from 'react';
import type { BrandInstructions } from '../types';

interface ConflictResolutionModalProps {
  localData: BrandInstructions;
  remoteData: BrandInstructions;
  localVersion: number;
  remoteVersion: number;
  onKeepLocal: () => void;
  onKeepRemote: () => void;
  onCancel: () => void;
}

const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  localData,
  remoteData,
  localVersion,
  remoteVersion,
  onKeepLocal,
  onKeepRemote,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-yellow-100 rounded-full p-3">
            <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-[#4b0f0d] mb-2">
              Conflict Detected
            </h3>
            <p className="text-[#9b9b9b] mb-4">
              Someone else saved changes while you were editing. Your version: <strong>v{localVersion}</strong>.
              Server version: <strong>v{remoteVersion}</strong>.
            </p>
            <p className="text-sm text-[#9b9b9b]">
              Choose which version to keep:
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <button
            onClick={onKeepLocal}
            className="w-full p-4 border-2 border-[#780817] bg-[#780817] text-white rounded-lg hover:bg-[#4b0f0d] transition-colors text-left"
          >
            <div className="font-bold mb-1">Keep My Changes (v{localVersion})</div>
            <div className="text-sm opacity-90">Your edits will overwrite the server version</div>
          </button>

          <button
            onClick={onKeepRemote}
            className="w-full p-4 border-2 border-[#9b9b9b] bg-white text-[#4b0f0d] rounded-lg hover:bg-[#f4f0f0] transition-colors text-left"
          >
            <div className="font-bold mb-1">Keep Server Changes (v{remoteVersion})</div>
            <div className="text-sm text-[#9b9b9b]">Your edits will be discarded</div>
          </button>

          <button
            onClick={onCancel}
            className="w-full p-3 text-[#9b9b9b] hover:text-[#4b0f0d] transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> To avoid conflicts, refresh the page before making edits or enable auto-refresh to see live updates from your team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionModal;
```

---

## Quick Implementation Checklist

### For Immediate Conflict Prevention (2 hours):
- [ ] Update `instructionsService.ts` with transactions (Step 1)
- [ ] Update all `saveBrandInstructions` calls to pass `clientVersion`
- [ ] Update `BrandInstructionsEditor` to track `localVersion`
- [ ] Create basic conflict modal

### For Real-Time Sync (+ 2 hours):
- [ ] Create `useRealtimeSync` hook (Step 2)
- [ ] Integrate into `BrandInstructionsEditor` (Step 3)
- [ ] Test with two browser tabs

### For Full UI (+ 2 hours):
- [ ] Create `ConflictResolutionModal` (Step 4)
- [ ] Create version history viewer
- [ ] Add presence indicators

### For Authentication (+ 2 hours):
- [ ] Wrap App in `AuthContext`
- [ ] Create login/signup UI
- [ ] Replace hardcoded 'admin' throughout codebase
- [ ] Deploy Firestore security rules

---

## Testing Multi-User Scenarios

### Test 1: Conflict Detection
1. Open brand editor in Tab A
2. Open same brand in Tab B
3. Edit different field in Tab A, save
4. Edit another field in Tab B, try to save
5. **Expected:** Conflict modal appears in Tab B

### Test 2: Real-Time Sync
1. Open brand editor in Tab A
2. Open same brand in Tab B
3. Make change in Tab A, save
4. **Expected:** Tab B auto-updates (if no unsaved changes)

### Test 3: Version History
1. Make 5 different saves
2. Open version history
3. **Expected:** See all 5 versions with changes listed
4. Click "Restore to v3"
5. **Expected:** Data reverts to v3

---

## Firestore Security Rules (Deploy After Auth Implemented)

Create `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function hasRole(role) {
      return isSignedIn() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }

    function canEdit() {
      return hasRole('admin') || hasRole('editor');
    }

    // Brand instructions
    match /brandInstructions/{brandId} {
      allow read: if isSignedIn();
      allow write: if canEdit();
    }

    // Version history
    match /brandInstructionsHistory/{versionId} {
      allow read: if isSignedIn();
      allow write: if canEdit();
    }

    // Pattern knowledge
    match /brands/{brandId}/patternKnowledge/{patternId} {
      allow read: if isSignedIn();
      allow write: if canEdit();
    }

    // Users
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if hasRole('admin');
    }
  }
}
```

---

## Priority Order for Small Team (2-5 users)

1. **Phase 2 (CRITICAL):** Conflict detection - prevents data loss
2. **Phase 3 (HIGH):** Real-time sync - improves collaboration
3. **Phase 4 (MEDIUM):** UI polish - better UX
4. **Authentication (OPTIONAL for small team):** Can use shared login initially

---

## Estimated Timeline

- **Minimum Viable:** 4 hours (Phases 2 + 3)
- **Complete Solution:** 8 hours (All phases)
- **With Testing:** 10 hours

This gets you from "dangerous for multi-user" to "production-ready collaboration" in a single day of focused work.
