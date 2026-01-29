import { useEffect, useRef, useState } from 'react';

export interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  enabled: boolean;
  interval?: number; // milliseconds, default 30000 (30 seconds)
  saveOnUnmount?: boolean; // Save when component unmounts
}

export interface UseAutoSaveReturn {
  lastSaved: Date | null;
  isSaving: boolean;
  error: Error | null;
  triggerSave: () => Promise<void>;
}

/**
 * Auto-save hook that periodically saves data and provides save status
 *
 * @example
 * const { lastSaved, isSaving } = useAutoSave({
 *   data: instructions,
 *   onSave: async (data) => await saveBrandInstructions(brandId, data, 'admin'),
 *   enabled: hasUnsavedChanges,
 *   interval: 30000 // 30 seconds
 * });
 */
export function useAutoSave<T>({
  data,
  onSave,
  enabled,
  interval = 30000,
  saveOnUnmount = true
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const saveInProgressRef = useRef(false);
  const dataRef = useRef(data);

  // Keep data ref updated
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Manual save trigger
  const triggerSave = async () => {
    if (saveInProgressRef.current) {
      console.log('⏭️ Save already in progress, skipping...');
      return;
    }

    try {
      saveInProgressRef.current = true;
      setIsSaving(true);
      setError(null);

      console.log('💾 Auto-saving data...');
      await onSave(dataRef.current);

      setLastSaved(new Date());
      console.log('✅ Auto-save successful');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Auto-save failed');
      setError(error);
      console.error('❌ Auto-save failed:', error);
    } finally {
      setIsSaving(false);
      saveInProgressRef.current = false;
    }
  };

  // Auto-save on interval
  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      triggerSave();
    }, interval);

    return () => clearTimeout(timer);
  }, [enabled, interval, data]); // Re-trigger when data changes

  // Save on unmount
  useEffect(() => {
    return () => {
      if (saveOnUnmount && enabled && !saveInProgressRef.current) {
        // Synchronous save attempt on unmount
        onSave(dataRef.current).catch(err => {
          console.error('❌ Failed to save on unmount:', err);
        });
      }
    };
  }, [saveOnUnmount, enabled]);

  return {
    lastSaved,
    isSaving,
    error,
    triggerSave
  };
}
