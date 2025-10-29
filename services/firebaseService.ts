import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
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
import type { BrandGuideline } from '../types';

const COLLECTION_NAME = 'brandGuidelines';
const STORAGE_PATH = 'brand-guidelines';

/**
 * Upload a PDF file to Firebase Storage
 */
export const uploadPDF = (
  brandId: string,
  file: File,
  onProgress?: (progress: number) => void
): UploadTask => {
  const storageRef = ref(storage, `${STORAGE_PATH}/${brandId}.pdf`);
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
 * Get download URL for an uploaded PDF
 */
export const getPDFDownloadURL = async (brandId: string): Promise<string> => {
  const storageRef = ref(storage, `${STORAGE_PATH}/${brandId}.pdf`);
  return getDownloadURL(storageRef);
};

/**
 * Delete a PDF from Firebase Storage
 */
export const deletePDF = async (brandId: string): Promise<void> => {
  const storageRef = ref(storage, `${STORAGE_PATH}/${brandId}.pdf`);
  await deleteObject(storageRef);
};

/**
 * Get brand guideline from Firestore
 */
export const getBrandGuideline = async (
  brandId: string
): Promise<BrandGuideline | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, brandId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        lastUpdated: data.lastUpdated?.toDate(),
        createdAt: data.createdAt?.toDate(),
      } as BrandGuideline;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching guideline for ${brandId}:`, error);
    return null;
  }
};

/**
 * Get all brand guidelines from Firestore
 */
export const getAllBrandGuidelines = async (): Promise<BrandGuideline[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        lastUpdated: data.lastUpdated?.toDate(),
        createdAt: data.createdAt?.toDate(),
      } as BrandGuideline;
    });
  } catch (error) {
    console.error('Error fetching all guidelines:', error);
    return [];
  }
};

/**
 * Save a new brand guideline to Firestore
 */
export const saveBrandGuideline = async (
  guideline: Omit<BrandGuideline, 'lastUpdated' | 'createdAt' | 'version'>
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, guideline.brandId);
  const now = Timestamp.now();

  await setDoc(docRef, {
    ...guideline,
    createdAt: now,
    lastUpdated: now,
    version: 1,
  });
};

/**
 * Update an existing brand guideline in Firestore
 */
export const updateBrandGuideline = async (
  brandId: string,
  updates: Partial<BrandGuideline>
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, brandId);
  const existingDoc = await getDoc(docRef);

  if (!existingDoc.exists()) {
    throw new Error(`Brand guideline ${brandId} does not exist`);
  }

  const currentVersion = existingDoc.data().version || 1;

  await updateDoc(docRef, {
    ...updates,
    lastUpdated: Timestamp.now(),
    version: currentVersion + 1,
  });
};

/**
 * Delete a brand guideline from Firestore
 */
export const deleteBrandGuideline = async (brandId: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, brandId);
  await deleteDoc(docRef);
};

/**
 * Check if a brand has guidelines in Firestore
 */
export const hasBrandGuideline = async (brandId: string): Promise<boolean> => {
  const docRef = doc(db, COLLECTION_NAME, brandId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};
