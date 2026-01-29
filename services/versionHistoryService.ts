import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import type { BrandInstructions, VersionHistoryEntry, FieldChange } from '../types';

const HISTORY_COLLECTION = 'brandInstructionsHistory';

/**
 * Save a version to history
 */
export async function saveVersionToHistory(
  brandId: string,
  version: number,
  snapshot: BrandInstructions,
  changedBy: string,
  changedByName: string,
  previousSnapshot?: BrandInstructions
): Promise<void> {
  const versionId = `${brandId}_v${version}`;

  // Compute changes from previous version
  const changes = previousSnapshot
    ? computeChanges(previousSnapshot, snapshot)
    : [{ field: 'initial', oldValue: null, newValue: 'Initial version', changeType: 'added' as const }];

  const historyEntry = {
    versionId,
    brandId,
    version,
    snapshot,
    changes,
    changedBy,
    changedByName,
    timestamp: serverTimestamp()
  };

  await setDoc(doc(db, HISTORY_COLLECTION, versionId), historyEntry);
  console.log(`📝 Saved version ${version} to history`);
}

/**
 * Get version history for a brand
 */
export async function getVersionHistory(
  brandId: string,
  maxVersions: number = 50
): Promise<VersionHistoryEntry[]> {
  const q = query(
    collection(db, HISTORY_COLLECTION),
    where('brandId', '==', brandId),
    orderBy('version', 'desc'),
    limit(maxVersions)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      versionId: data.versionId,
      brandId: data.brandId,
      version: data.version,
      snapshot: data.snapshot,
      changes: data.changes || [],
      changedBy: data.changedBy,
      changedByName: data.changedByName,
      timestamp: (data.timestamp as Timestamp).toDate()
    };
  });
}

/**
 * Get a specific version
 */
export async function getVersion(
  brandId: string,
  version: number
): Promise<VersionHistoryEntry | null> {
  const versionId = `${brandId}_v${version}`;
  const docSnap = await getDoc(doc(db, HISTORY_COLLECTION, versionId));

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    versionId: data.versionId,
    brandId: data.brandId,
    version: data.version,
    snapshot: data.snapshot,
    changes: data.changes || [],
    changedBy: data.changedBy,
    changedByName: data.changedByName,
    timestamp: (data.timestamp as Timestamp).toDate()
  };
}

/**
 * Compute changes between two snapshots
 */
export function computeChanges(
  oldData: BrandInstructions,
  newData: BrandInstructions
): FieldChange[] {
  const changes: FieldChange[] = [];

  // Helper to compare values deeply
  const isDifferent = (a: any, b: any): boolean => {
    return JSON.stringify(a) !== JSON.stringify(b);
  };

  // Top-level fields
  const topLevelFields: (keyof BrandInstructions)[] = [
    'brandIntroduction',
    'toneOfVoice',
    'coreValues',
    'keyMessaging'
  ];

  topLevelFields.forEach((field) => {
    const oldValue = oldData[field];
    const newValue = newData[field];

    if (isDifferent(oldValue, newValue)) {
      changes.push({
        field,
        oldValue,
        newValue,
        changeType: oldValue === undefined ? 'added' : 'modified'
      });
    }
  });

  // Personas array
  if (isDifferent(oldData.personas, newData.personas)) {
    changes.push({
      field: 'personas',
      oldValue: oldData.personas,
      newValue: newData.personas,
      changeType: 'modified'
    });
  }

  // Reference materials
  if (isDifferent(oldData.referenceMaterials, newData.referenceMaterials)) {
    changes.push({
      field: 'referenceMaterials',
      oldValue: oldData.referenceMaterials,
      newValue: newData.referenceMaterials,
      changeType: 'modified'
    });
  }

  // Campaign instructions
  if (isDifferent(oldData.campaignInstructions, newData.campaignInstructions)) {
    changes.push({
      field: 'campaignInstructions',
      oldValue: oldData.campaignInstructions,
      newValue: newData.campaignInstructions,
      changeType: 'modified'
    });
  }

  // Type-specific instructions
  const typeFields: Array<keyof BrandInstructions> = [
    'adCopyInstructions',
    'blogInstructions',
    'landingPageInstructions',
    'emailInstructions'
  ];

  typeFields.forEach((field) => {
    if (isDifferent(oldData[field], newData[field])) {
      changes.push({
        field,
        oldValue: oldData[field],
        newValue: newData[field],
        changeType: 'modified'
      });
    }
  });

  return changes;
}

/**
 * Format changes for display
 */
export function formatChangeDescription(change: FieldChange): string {
  const fieldNames: Record<string, string> = {
    brandIntroduction: 'Brand Introduction',
    toneOfVoice: 'Tone of Voice',
    coreValues: 'Core Values',
    keyMessaging: 'Key Messaging',
    personas: 'Target Personas',
    referenceMaterials: 'Reference Materials',
    campaignInstructions: 'Campaign Instructions',
    adCopyInstructions: 'Ad Copy Instructions',
    blogInstructions: 'Blog Instructions',
    landingPageInstructions: 'Landing Page Instructions',
    emailInstructions: 'Email Instructions'
  };

  const fieldName = fieldNames[change.field] || change.field;

  switch (change.changeType) {
    case 'added':
      return `Added ${fieldName}`;
    case 'modified':
      return `Modified ${fieldName}`;
    case 'deleted':
      return `Deleted ${fieldName}`;
  }
}
