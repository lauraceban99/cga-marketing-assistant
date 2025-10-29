import { useState, useEffect } from 'react';
import type { BrandAsset, AssetCategory, BrandAssetStats } from '../types';
import {
  getAssetsByBrand,
  getAssetsByCategory,
  getBrandAssetStats,
  deleteAsset,
  updateAssetMetadata,
} from '../services/assetService';
import type { AssetMetadata } from '../types';

/**
 * Hook to fetch all assets for a brand
 */
export const useAssetsByBrand = (brandId: string | null) => {
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!brandId) {
      setAssets([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getAssetsByBrand(brandId);
      setAssets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [brandId]);

  return { assets, loading, error, refresh };
};

/**
 * Hook to fetch assets by category
 */
export const useAssetsByCategory = (
  brandId: string | null,
  category: AssetCategory | null
) => {
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!brandId || !category) {
      setAssets([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getAssetsByCategory(brandId, category);
      setAssets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [brandId, category]);

  return { assets, loading, error, refresh };
};

/**
 * Hook to manage asset actions (delete, update metadata)
 */
export const useAssetActions = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const deleteAssetById = async (assetId: string): Promise<void> => {
    setIsDeleting(true);
    try {
      await deleteAsset(assetId);
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const updateMetadata = async (
    assetId: string,
    metadata: Partial<AssetMetadata>
  ): Promise<void> => {
    setIsUpdating(true);
    try {
      await updateAssetMetadata(assetId, metadata);
    } catch (error) {
      console.error('Error updating metadata:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    deleteAsset: deleteAssetById,
    updateMetadata,
    isDeleting,
    isUpdating,
  };
};

/**
 * Hook to fetch brand asset stats
 */
export const useBrandAssetStats = (brandId: string | null) => {
  const [stats, setStats] = useState<BrandAssetStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!brandId) {
      setStats(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getBrandAssetStats(brandId);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [brandId]);

  return { stats, loading, error, refresh };
};
