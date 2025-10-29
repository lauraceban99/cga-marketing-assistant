import { useState, useEffect, useCallback } from 'react';
import type { BrandInstructions } from '../types';
import {
  getBrandInstructions,
  saveBrandInstructions,
  resetToDefaultInstructions,
  validateInstructions,
} from '../services/instructionsService';

/**
 * Custom hook for managing brand instructions
 */
export function useBrandInstructions(brandId: string) {
  const [instructions, setInstructions] = useState<BrandInstructions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load instructions on mount
  const loadInstructions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBrandInstructions(brandId);
      setInstructions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instructions');
      console.error('Error loading instructions:', err);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    loadInstructions();
  }, [loadInstructions]);

  // Save instructions
  const save = useCallback(
    async (updates: Partial<BrandInstructions>, updatedBy: string = 'admin') => {
      if (!instructions) return;

      const updatedInstructions = { ...instructions, ...updates };

      // Validate
      const validation = validateInstructions(updatedInstructions);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      setSaving(true);
      setError(null);
      try {
        await saveBrandInstructions(brandId, updatedInstructions, updatedBy);
        await loadInstructions(); // Reload to get updated version
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save instructions');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [brandId, instructions, loadInstructions]
  );

  // Reset to defaults
  const reset = useCallback(
    async (updatedBy: string = 'admin') => {
      setSaving(true);
      setError(null);
      try {
        const defaults = await resetToDefaultInstructions(brandId, updatedBy);
        setInstructions(defaults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reset instructions');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [brandId]
  );

  // Update local state (without saving)
  const updateLocal = useCallback(
    (updates: Partial<BrandInstructions>) => {
      if (!instructions) return;
      setInstructions({ ...instructions, ...updates });
    },
    [instructions]
  );

  return {
    instructions,
    loading,
    error,
    saving,
    save,
    reset,
    updateLocal,
    refresh: loadInstructions,
  };
}
