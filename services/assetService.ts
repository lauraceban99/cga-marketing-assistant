import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { BrandAsset, AssetCategory, AssetMetadata, BrandAssetStats } from '../types';

const COLLECTION_NAME = 'brandAssets';
const STORAGE_PATH = 'brand-assets';

/**
 * Generate unique ID for asset
 */
function generateAssetId(): string {
  return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Upload asset file to Firebase Storage
 */
export const uploadAssetFile = (
  brandId: string,
  category: AssetCategory,
  file: File,
  onProgress?: (progress: number) => void
): UploadTask => {
  const fileName = `${Date.now()}_${file.name}`;
  const storagePath = `${STORAGE_PATH}/${brandId}/${category}/${fileName}`;
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  if (onProgress) {
    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(progress);
    });
  }

  return uploadTask;
};

/**
 * Create asset document in Firestore
 */
export const createAsset = async (
  brandId: string,
  category: AssetCategory,
  file: File,
  fileUrl: string,
  metadata: AssetMetadata,
  uploadedBy: string = 'admin'
): Promise<BrandAsset> => {
  const assetId = generateAssetId();
  const asset: BrandAsset = {
    id: assetId,
    brandId,
    category,
    fileName: file.name,
    fileUrl,
    fileType: file.type,
    fileSize: file.size,
    uploadedBy,
    uploadedAt: new Date(),
    metadata,
  };

  const docRef = doc(db, COLLECTION_NAME, assetId);
  await setDoc(docRef, {
    ...asset,
    uploadedAt: Timestamp.now(),
  });

  return asset;
};

/**
 * Upload asset (file + metadata)
 */
export const uploadAsset = async (
  brandId: string,
  category: AssetCategory,
  file: File,
  metadata: AssetMetadata,
  uploadedBy: string = 'admin',
  onProgress?: (progress: number) => void
): Promise<BrandAsset> => {
  // Upload file
  const uploadTask = uploadAssetFile(brandId, category, file, onProgress);
  const snapshot = await uploadTask;
  const fileUrl = await getDownloadURL(snapshot.ref);

  // Create Firestore document
  return await createAsset(brandId, category, file, fileUrl, metadata, uploadedBy);
};

/**
 * Get asset by ID
 */
export const getAsset = async (assetId: string): Promise<BrandAsset | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, assetId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        uploadedAt: data.uploadedAt?.toDate(),
      } as BrandAsset;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching asset ${assetId}:`, error);
    return null;
  }
};

/**
 * Get all assets for a brand
 */
export const getAssetsByBrand = async (brandId: string): Promise<BrandAsset[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('brandId', '==', brandId),
      orderBy('uploadedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        uploadedAt: data.uploadedAt?.toDate(),
      } as BrandAsset;
    });
  } catch (error) {
    console.error(`Error fetching assets for brand ${brandId}:`, error);
    return [];
  }
};

/**
 * Get assets by category
 */
export const getAssetsByCategory = async (
  brandId: string,
  category: AssetCategory
): Promise<BrandAsset[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('brandId', '==', brandId),
      where('category', '==', category),
      orderBy('uploadedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        uploadedAt: data.uploadedAt?.toDate(),
      } as BrandAsset;
    });
  } catch (error) {
    console.error(`Error fetching assets for ${brandId}/${category}:`, error);
    return [];
  }
};

/**
 * Delete asset
 */
export const deleteAsset = async (assetId: string): Promise<void> => {
  try {
    // Get asset to find file URL
    const asset = await getAsset(assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    // Delete file from storage
    const fileRef = ref(storage, asset.fileUrl);
    await deleteObject(fileRef);

    // Delete Firestore document
    const docRef = doc(db, COLLECTION_NAME, assetId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting asset ${assetId}:`, error);
    throw error;
  }
};

/**
 * Update asset metadata
 */
export const updateAssetMetadata = async (
  assetId: string,
  metadata: Partial<AssetMetadata>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, assetId);
    const asset = await getAsset(assetId);

    if (!asset) {
      throw new Error('Asset not found');
    }

    await setDoc(docRef, {
      ...asset,
      metadata: {
        ...asset.metadata,
        ...metadata,
      },
      uploadedAt: Timestamp.fromDate(asset.uploadedAt),
    });
  } catch (error) {
    console.error(`Error updating asset metadata ${assetId}:`, error);
    throw error;
  }
};

/**
 * Replace asset file (delete old, upload new)
 */
export const replaceAsset = async (
  assetId: string,
  newFile: File,
  uploadedBy: string = 'admin',
  onProgress?: (progress: number) => void
): Promise<BrandAsset> => {
  try {
    // Get existing asset
    const oldAsset = await getAsset(assetId);
    if (!oldAsset) {
      throw new Error('Asset not found');
    }

    // Delete old file
    const fileRef = ref(storage, oldAsset.fileUrl);
    await deleteObject(fileRef);

    // Upload new file
    const uploadTask = uploadAssetFile(
      oldAsset.brandId,
      oldAsset.category,
      newFile,
      onProgress
    );
    const snapshot = await uploadTask;
    const newFileUrl = await getDownloadURL(snapshot.ref);

    // Update Firestore document
    const updatedAsset: BrandAsset = {
      ...oldAsset,
      fileName: newFile.name,
      fileUrl: newFileUrl,
      fileType: newFile.type,
      fileSize: newFile.size,
      uploadedBy,
      uploadedAt: new Date(),
    };

    const docRef = doc(db, COLLECTION_NAME, assetId);
    await setDoc(docRef, {
      ...updatedAsset,
      uploadedAt: Timestamp.now(),
    });

    return updatedAsset;
  } catch (error) {
    console.error(`Error replacing asset ${assetId}:`, error);
    throw error;
  }
};

/**
 * Batch upload assets
 */
export const batchUploadAssets = async (
  brandId: string,
  category: AssetCategory,
  files: File[],
  sharedMetadata: AssetMetadata,
  uploadedBy: string = 'admin',
  onFileProgress?: (fileName: string, progress: number) => void
): Promise<BrandAsset[]> => {
  const uploadPromises = files.map((file) =>
    uploadAsset(
      brandId,
      category,
      file,
      sharedMetadata,
      uploadedBy,
      (progress) => {
        if (onFileProgress) {
          onFileProgress(file.name, progress);
        }
      }
    )
  );

  return Promise.all(uploadPromises);
};

/**
 * Batch delete assets
 */
export const batchDeleteAssets = async (assetIds: string[]): Promise<void> => {
  const deletePromises = assetIds.map((id) => deleteAsset(id));
  await Promise.all(deletePromises);
};

/**
 * Get brand asset stats
 */
export const getBrandAssetStats = async (
  brandId: string
): Promise<BrandAssetStats> => {
  const assets = await getAssetsByBrand(brandId);

  const assetsByCategory = assets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {} as Record<AssetCategory, number>);

  const totalSize = assets.reduce((sum, asset) => sum + asset.fileSize, 0);

  const lastUpdated = assets.length > 0
    ? new Date(Math.max(...assets.map(a => a.uploadedAt.getTime())))
    : new Date();

  return {
    brandId,
    totalAssets: assets.length,
    assetsByCategory: {
      'brand-guidelines': assetsByCategory['brand-guidelines'] || 0,
      'competitor-ads': assetsByCategory['competitor-ads'] || 0,
      'reference-copy': assetsByCategory['reference-copy'] || 0,
      'logos': assetsByCategory['logos'] || 0,
      'other': assetsByCategory['other'] || 0,
    },
    totalSize,
    lastUpdated,
  };
};

/**
 * Search assets
 */
export const searchAssets = async (
  brandId: string,
  searchQuery: string,
  filters?: {
    category?: AssetCategory;
    fileType?: string;
    tags?: string[];
  }
): Promise<BrandAsset[]> => {
  let assets = await getAssetsByBrand(brandId);

  // Filter by category
  if (filters?.category) {
    assets = assets.filter((a) => a.category === filters.category);
  }

  // Filter by file type
  if (filters?.fileType) {
    assets = assets.filter((a) => a.fileType.includes(filters.fileType!));
  }

  // Filter by tags
  if (filters?.tags && filters.tags.length > 0) {
    assets = assets.filter((a) =>
      filters.tags!.some((tag) => a.metadata.tags?.includes(tag))
    );
  }

  // Search by query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    assets = assets.filter(
      (a) =>
        a.fileName.toLowerCase().includes(query) ||
        a.metadata.description?.toLowerCase().includes(query) ||
        a.metadata.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  return assets;
};
