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
 * Remove undefined values from metadata
 */
function sanitizeMetadata(metadata: AssetMetadata): AssetMetadata {
  const sanitized: AssetMetadata = {};

  if (metadata.description !== undefined && metadata.description !== '') {
    sanitized.description = metadata.description;
  }
  if (metadata.tags !== undefined && metadata.tags.length > 0) {
    sanitized.tags = metadata.tags;
  }
  if (metadata.sourceUrl !== undefined && metadata.sourceUrl !== '') {
    sanitized.sourceUrl = metadata.sourceUrl;
  }
  if (metadata.campaignName !== undefined && metadata.campaignName !== '') {
    sanitized.campaignName = metadata.campaignName;
  }
  if (metadata.usageRights !== undefined && metadata.usageRights !== '') {
    sanitized.usageRights = metadata.usageRights;
  }

  return sanitized;
}

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
  try {
    const assetId = generateAssetId();
    const sanitizedMetadata = sanitizeMetadata(metadata);

    console.log('📝 Creating asset document for:', file.name);
    console.log('   Asset ID:', assetId);
    console.log('   Brand ID:', brandId);
    console.log('   Category:', category);
    console.log('   Metadata:', sanitizedMetadata);

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
      metadata: sanitizedMetadata,
    };

    const docRef = doc(db, COLLECTION_NAME, assetId);
    const firestoreData = {
      id: asset.id,
      brandId: asset.brandId,
      category: asset.category,
      fileName: asset.fileName,
      fileUrl: asset.fileUrl,
      fileType: asset.fileType,
      fileSize: asset.fileSize,
      uploadedBy: asset.uploadedBy,
      uploadedAt: Timestamp.now(),
      metadata: sanitizedMetadata,
    };

    console.log('💾 Saving to Firestore collection:', COLLECTION_NAME);
    console.log('   Document ID:', assetId);
    console.log('   Data:', firestoreData);

    await setDoc(docRef, firestoreData);

    console.log('✅ Firestore document created successfully!');
    console.log('   Collection:', COLLECTION_NAME);
    console.log('   Document ID:', assetId);

    return asset;
  } catch (error) {
    console.error('❌ Error creating Firestore document:', error);
    console.error('   Brand ID:', brandId);
    console.error('   Category:', category);
    console.error('   File:', file.name);
    throw error;
  }
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
  console.log('🚀 Starting upload for:', file.name, { brandId, category, metadata });

  // Upload file to Storage
  console.log('📤 Uploading to Storage...');
  const uploadTask = uploadAssetFile(brandId, category, file, onProgress);
  const snapshot = await uploadTask;
  const fileUrl = await getDownloadURL(snapshot.ref);
  console.log('✅ Storage upload complete. URL:', fileUrl);

  // Create Firestore document
  console.log('💾 Creating Firestore document...');
  const asset = await createAsset(brandId, category, file, fileUrl, metadata, uploadedBy);
  console.log('✅ Upload complete for:', file.name, 'Asset ID:', asset.id);

  return asset;
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
    console.log(`📡 Querying all assets for brand: ${brandId}`);
    const q = query(
      collection(db, COLLECTION_NAME),
      where('brandId', '==', brandId),
      orderBy('uploadedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    console.log(`✅ getAssetsByBrand returned ${querySnapshot.docs.length} assets`);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        uploadedAt: data.uploadedAt?.toDate(),
      } as BrandAsset;
    });
  } catch (error) {
    console.error(`❌ Error fetching assets for brand ${brandId}:`, error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
    }
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
    console.log(`📡 Querying Firestore for assets:`);
    console.log(`   Collection: ${COLLECTION_NAME}`);
    console.log(`   brandId: ${brandId}`);
    console.log(`   category: ${category}`);

    const q = query(
      collection(db, COLLECTION_NAME),
      where('brandId', '==', brandId),
      where('category', '==', category),
      orderBy('uploadedAt', 'desc')
    );

    console.log('🔍 Executing query...');
    const querySnapshot = await getDocs(q);
    console.log(`📊 Query returned ${querySnapshot.docs.length} documents`);

    const assets = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log(`   - Document ${doc.id}:`, data.fileName);
      return {
        ...data,
        uploadedAt: data.uploadedAt?.toDate(),
      } as BrandAsset;
    });

    console.log(`✅ Returning ${assets.length} assets for ${brandId}/${category}`);
    return assets;
  } catch (error) {
    console.error(`❌ Error querying Firestore:`, error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error name:', error.name);
    }
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

    const updatedMetadata = sanitizeMetadata({
      ...asset.metadata,
      ...metadata,
    });

    await setDoc(docRef, {
      ...asset,
      metadata: updatedMetadata,
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
  console.log('📦 Batch upload starting:', files.length, 'files');
  console.log('   Brand:', brandId);
  console.log('   Category:', category);
  console.log('   Metadata:', sharedMetadata);

  const uploadPromises = files.map(async (file) => {
    try {
      return await uploadAsset(
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
      );
    } catch (error) {
      console.error('❌ Upload failed for:', file.name, error);
      throw error;
    }
  });

  const results = await Promise.all(uploadPromises);
  console.log('✅ Batch upload complete:', results.length, 'assets created');
  return results;
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
  console.log('📊 Getting brand asset stats for:', brandId);
  const assets = await getAssetsByBrand(brandId);
  console.log('📊 Stats calculation received', assets.length, 'assets');

  const assetsByCategory = assets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {} as Record<AssetCategory, number>);

  const totalSize = assets.reduce((sum, asset) => sum + asset.fileSize, 0);

  const lastUpdated = assets.length > 0
    ? new Date(Math.max(...assets.map(a => a.uploadedAt.getTime())))
    : new Date();

  const stats = {
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

  console.log('📊 Computed stats:', stats);
  return stats;
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
