import { useEffect, useState } from 'react';

export interface DraftData<T> {
  data: T;
  savedAt: number;
  version: number;
}

export interface UseDraftRecoveryOptions<T> {
  key: string; // Unique localStorage key
  data: T;
  enabled: boolean;
  maxVersions?: number; // Keep last N versions, default 3
  onRestore?: (data: T) => void;
}

export interface UseDraftRecoveryReturn<T> {
  hasDraft: boolean;
  draftAge: number | null; // milliseconds since draft was saved
  restoreDraft: () => void;
  clearDraft: () => void;
  savedDrafts: DraftData<T>[];
}

/**
 * Draft recovery hook that saves data to localStorage and provides recovery UI
 *
 * @example
 * const { hasDraft, draftAge, restoreDraft, clearDraft } = useDraftRecovery({
 *   key: `brand-instructions-${brandId}`,
 *   data: instructions,
 *   enabled: true,
 *   maxVersions: 3
 * });
 */
export function useDraftRecovery<T>({
  key,
  data,
  enabled,
  maxVersions = 3,
  onRestore
}: UseDraftRecoveryOptions<T>): UseDraftRecoveryReturn<T> {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftAge, setDraftAge] = useState<number | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<DraftData<T>[]>([]);

  const storageKey = `draft_${key}`;
  const versionsKey = `draft_versions_${key}`;

  // Check for existing drafts on mount
  useEffect(() => {
    if (!enabled) return;

    try {
      const draftJson = localStorage.getItem(storageKey);
      const versionsJson = localStorage.getItem(versionsKey);

      if (draftJson) {
        const draft: DraftData<T> = JSON.parse(draftJson);
        const age = Date.now() - draft.savedAt;
        setHasDraft(true);
        setDraftAge(age);
        console.log(`📋 Found draft from ${Math.round(age / 1000 / 60)} minutes ago`);
      }

      if (versionsJson) {
        const versions: DraftData<T>[] = JSON.parse(versionsJson);
        setSavedDrafts(versions);
      }
    } catch (err) {
      console.error('❌ Failed to load draft:', err);
    }
  }, [storageKey, versionsKey, enabled]);

  // Save draft on data change
  useEffect(() => {
    if (!enabled || !data) return;

    try {
      const draft: DraftData<T> = {
        data,
        savedAt: Date.now(),
        version: Date.now()
      };

      // Save current draft
      localStorage.setItem(storageKey, JSON.stringify(draft));

      // Update version history
      const versionsJson = localStorage.getItem(versionsKey);
      let versions: DraftData<T>[] = versionsJson ? JSON.parse(versionsJson) : [];

      // Add new version
      versions.push(draft);

      // Keep only last N versions
      if (versions.length > maxVersions) {
        versions = versions.slice(-maxVersions);
      }

      localStorage.setItem(versionsKey, JSON.stringify(versions));
      setSavedDrafts(versions);

      console.log(`💾 Draft saved to localStorage (${versions.length} versions)`);
    } catch (err) {
      console.error('❌ Failed to save draft:', err);
    }
  }, [data, enabled, storageKey, versionsKey, maxVersions]);

  // Restore draft
  const restoreDraft = () => {
    try {
      const draftJson = localStorage.getItem(storageKey);
      if (!draftJson) {
        console.warn('⚠️ No draft to restore');
        return;
      }

      const draft: DraftData<T> = JSON.parse(draftJson);
      console.log('♻️ Restoring draft...');

      if (onRestore) {
        onRestore(draft.data);
      }

      setHasDraft(false);
      setDraftAge(null);
    } catch (err) {
      console.error('❌ Failed to restore draft:', err);
    }
  };

  // Clear draft
  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(versionsKey);
      setHasDraft(false);
      setDraftAge(null);
      setSavedDrafts([]);
      console.log('🗑️ Draft cleared');
    } catch (err) {
      console.error('❌ Failed to clear draft:', err);
    }
  };

  return {
    hasDraft,
    draftAge,
    restoreDraft,
    clearDraft,
    savedDrafts
  };
}

/**
 * Format draft age for display
 */
export function formatDraftAge(ageMs: number): string {
  const seconds = Math.floor(ageMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}
