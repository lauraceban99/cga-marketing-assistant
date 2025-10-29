import { useState } from 'react';
import type { AssetCategory, AssetMetadata, AssetUploadProgress, BrandAsset } from '../types';
import { batchUploadAssets } from '../services/assetService';

/**
 * Hook for uploading assets with progress tracking
 */
export const useAssetUpload = () => {
  const [uploadQueue, setUploadQueue] = useState<AssetUploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadAssets = async (
    brandId: string,
    category: AssetCategory,
    files: File[],
    sharedMetadata: AssetMetadata,
    uploadedBy: string = 'admin'
  ): Promise<BrandAsset[]> => {
    console.log('🎯 useAssetUpload: Starting upload');
    console.log('   Files:', files.map(f => f.name));
    console.log('   Brand:', brandId);
    console.log('   Category:', category);

    setIsUploading(true);

    // Initialize queue
    const initialQueue: AssetUploadProgress[] = files.map((file) => ({
      fileName: file.name,
      progress: 0,
      status: 'queued',
    }));
    setUploadQueue(initialQueue);

    try {
      console.log('🔄 Calling batchUploadAssets...');
      const uploadedAssets = await batchUploadAssets(
        brandId,
        category,
        files,
        sharedMetadata,
        uploadedBy,
        (fileName, progress) => {
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.fileName === fileName
                ? { ...item, progress, status: progress === 100 ? 'complete' : 'uploading' }
                : item
            )
          );
        }
      );

      console.log('✅ batchUploadAssets complete. Assets:', uploadedAssets.length);

      // Mark all as complete
      setUploadQueue((prev) =>
        prev.map((item) => ({ ...item, status: 'complete', progress: 100 }))
      );

      setIsUploading(false);
      return uploadedAssets;
    } catch (error) {
      console.error('❌ useAssetUpload error:', error);
      setUploadQueue((prev) =>
        prev.map((item) => ({
          ...item,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed',
        }))
      );
      setIsUploading(false);
      throw error;
    }
  };

  const resetQueue = () => {
    setUploadQueue([]);
    setIsUploading(false);
  };

  return {
    uploadAssets,
    uploadQueue,
    isUploading,
    resetQueue,
  };
};
