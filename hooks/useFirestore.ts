import { useState, useEffect } from 'react';
import type { BrandGuideline } from '../types';
import {
  getBrandGuideline,
  getAllBrandGuidelines,
} from '../services/firebaseService';

/**
 * Hook to fetch a single brand guideline
 */
export const useBrandGuideline = (brandId: string | null) => {
  const [guideline, setGuideline] = useState<BrandGuideline | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId) {
      setGuideline(null);
      return;
    }

    const fetchGuideline = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBrandGuideline(brandId);
        setGuideline(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch guideline');
      } finally {
        setLoading(false);
      }
    };

    fetchGuideline();
  }, [brandId]);

  return { guideline, loading, error };
};

/**
 * Hook to fetch all brand guidelines
 */
export const useAllBrandGuidelines = () => {
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllBrandGuidelines();
      setGuidelines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch guidelines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { guidelines, loading, error, refresh };
};
