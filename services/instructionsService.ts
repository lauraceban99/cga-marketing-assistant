import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { BrandInstructions } from '../types';
import { getDefaultInstructions } from '../constants/damConfig';

const COLLECTION_NAME = 'brandInstructions';

/**
 * Get brand instructions from Firestore
 */
export const getBrandInstructions = async (
  brandId: string
): Promise<BrandInstructions | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, brandId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        lastUpdated: data.lastUpdated?.toDate(),
      } as BrandInstructions;
    }

    // If no instructions exist, return defaults
    return getDefaultInstructions(brandId);
  } catch (error) {
    console.error(`Error fetching instructions for ${brandId}:`, error);
    // Return defaults on error
    return getDefaultInstructions(brandId);
  }
};

/**
 * Save brand instructions to Firestore
 */
export const saveBrandInstructions = async (
  brandId: string,
  instructions: Partial<BrandInstructions>,
  updatedBy: string = 'admin'
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, brandId);
  const existingDoc = await getDoc(docRef);

  const currentVersion = existingDoc.exists()
    ? (existingDoc.data().version || 1)
    : 0;

  const now = Timestamp.now();

  await setDoc(docRef, {
    ...instructions,
    brandId,
    lastUpdatedBy: updatedBy,
    lastUpdated: now,
    version: currentVersion + 1,
  });
};

/**
 * Update specific fields of brand instructions
 */
export const updateBrandInstructions = async (
  brandId: string,
  updates: Partial<BrandInstructions>,
  updatedBy: string = 'admin'
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, brandId);
  const existingDoc = await getDoc(docRef);

  if (!existingDoc.exists()) {
    // Create new document with defaults + updates
    const defaults = getDefaultInstructions(brandId);
    await saveBrandInstructions(brandId, { ...defaults, ...updates }, updatedBy);
    return;
  }

  const currentVersion = existingDoc.data().version || 1;

  await updateDoc(docRef, {
    ...updates,
    lastUpdatedBy: updatedBy,
    lastUpdated: Timestamp.now(),
    version: currentVersion + 1,
  });
};

/**
 * Reset brand instructions to defaults
 */
export const resetToDefaultInstructions = async (
  brandId: string,
  updatedBy: string = 'admin'
): Promise<BrandInstructions> => {
  const defaults = getDefaultInstructions(brandId);
  await saveBrandInstructions(brandId, defaults, updatedBy);
  return defaults;
};

/**
 * Replace template variables in a prompt
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g');
    result = result.replace(regex, value || '');
  });

  return result;
}

/**
 * Validate instructions (basic validation)
 */
export function validateInstructions(
  instructions: Partial<BrandInstructions>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!instructions.brandIntroduction || instructions.brandIntroduction.trim().length === 0) {
    errors.push('Brand introduction is required');
  }

  if (!instructions.personas || instructions.personas.length === 0) {
    errors.push('At least one persona is required');
  }

  if (!instructions.toneOfVoice || instructions.toneOfVoice.trim().length === 0) {
    errors.push('Tone of voice is required');
  }

  if (!instructions.adCopyInstructions?.systemPrompt) {
    errors.push('Ad copy instructions are required');
  }

  if (!instructions.blogInstructions?.systemPrompt) {
    errors.push('Blog instructions are required');
  }

  if (!instructions.landingPageInstructions?.systemPrompt) {
    errors.push('Landing page instructions are required');
  }

  if (!instructions.emailInstructions?.invitation?.systemPrompt ||
      !instructions.emailInstructions?.nurturingDrip?.systemPrompt ||
      !instructions.emailInstructions?.emailBlast?.systemPrompt) {
    errors.push('All email type instructions are required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
