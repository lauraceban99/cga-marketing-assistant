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
    setIsUploading(true);

    // Initialize queue
    const initialQueue: AssetUploadProgress[] = files.map((file) => ({
      fileName: file.name,
      progress: 0,
      status: 'queued',
    }));
    setUploadQueue(initialQueue);

    try {
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

      // Mark all as complete
      setUploadQueue((prev) =>
        prev.map((item) => ({ ...item, status: 'complete', progress: 100 }))
      );

      setIsUploading(false);
      return uploadedAssets;
    } catch (error) {
      console.error('Upload error:', error);
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
