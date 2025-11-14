import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { AdVariation } from './openaiService';
import type { GeneratedContent, AdCopyVariation } from './textGenerationService';
import type { TaskType } from '../types';

// Legacy format (for backward compatibility)
export interface ApprovedContent {
  id?: string;
  brandId: string;
  brandName: string;
  variation: AdVariation;
  userPrompt: string;
  contentType: string;
  approvedAt: Date;
  imageUrl?: string;
}

// New unified format for all content types
export interface ApprovedGeneratedContent {
  id?: string;
  brandId: string;
  brandName: string;
  content: any; // Can be AdCopyVariation, blog content, landing page, or email
  contentType: TaskType;
  userPrompt: string;
  approvedAt: Date;
  metadata?: {
    market?: string;
    platform?: string;
    campaignStage?: string;
    emailType?: string;
  };
}

/**
 * Save approved ad variation to Firestore for future learning
 */
export async function saveApprovedContent(
  brandId: string,
  brandName: string,
  variation: AdVariation,
  userPrompt: string,
  contentType: string,
  imageUrl?: string
): Promise<void> {
  try {
    console.log('💾 Saving approved content to knowledge base...');

    // Build document data, excluding undefined fields
    const docData: any = {
      brandId,
      brandName,
      variation,
      userPrompt,
      contentType,
      approvedAt: Timestamp.now()
    };

    // Only include imageUrl if it's defined
    if (imageUrl !== undefined && imageUrl !== null) {
      docData.imageUrl = imageUrl;
    }

    const docRef = await addDoc(collection(db, 'approvedContent'), docData);

    console.log('✅ Approved content saved with ID:', docRef.id);
  } catch (error) {
    console.error('❌ Error saving approved content:', error);
    throw new Error('Failed to save approved content');
  }
}

/**
 * Save approved generated content (new unified format for all content types)
 */
export async function saveApprovedGeneratedContent(
  brandId: string,
  brandName: string,
  content: any,
  contentType: TaskType,
  userPrompt: string,
  metadata?: {
    market?: string;
    platform?: string;
    campaignStage?: string;
    emailType?: string;
  }
): Promise<void> {
  try {
    console.log(`💾 Saving approved ${contentType} content to knowledge base...`);

    const docData: any = {
      brandId,
      brandName,
      content,
      contentType,
      userPrompt,
      approvedAt: Timestamp.now()
    };

    if (metadata) {
      docData.metadata = metadata;
    }

    const docRef = await addDoc(collection(db, 'approvedGeneratedContent'), docData);

    console.log('✅ Approved content saved with ID:', docRef.id);
  } catch (error) {
    console.error('❌ Error saving approved content:', error);
    throw new Error('Failed to save approved content');
  }
}

/**
 * Get approved content for a specific brand to use as inspiration
 */
export async function getApprovedContentForBrand(
  brandId: string,
  limitCount: number = 10
): Promise<ApprovedContent[]> {
  try {
    console.log(`📚 Loading approved content for brand ${brandId}...`);

    const q = query(
      collection(db, 'approvedContent'),
      where('brandId', '==', brandId),
      orderBy('approvedAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    const approvedContent: ApprovedContent[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      approvedContent.push({
        id: doc.id,
        brandId: data.brandId,
        brandName: data.brandName,
        variation: data.variation,
        userPrompt: data.userPrompt,
        contentType: data.contentType,
        imageUrl: data.imageUrl,
        approvedAt: data.approvedAt?.toDate() || new Date()
      });
    });

    console.log(`✅ Loaded ${approvedContent.length} approved content items`);
    return approvedContent;
  } catch (error) {
    console.error('❌ Error loading approved content:', error);
    return [];
  }
}

/**
 * Format approved content as inspiration examples for OpenAI prompt
 */
export function formatApprovedContentAsInspiration(approvedContent: ApprovedContent[]): string {
  if (approvedContent.length === 0) {
    return 'No approved content available yet. Write based on brand guidelines.';
  }

  let inspiration = `Here are ${approvedContent.length} SUCCESSFUL ad examples that were approved by the client. Study their style, tone, and approach:\n\n`;

  approvedContent.forEach((item, index) => {
    inspiration += `EXAMPLE ${index + 1} (Approved on ${item.approvedAt.toLocaleDateString()}):\n`;
    inspiration += `User Request: "${item.userPrompt}"\n`;
    inspiration += `Headline: ${item.variation.headline}\n`;
    inspiration += `Primary Text: ${item.variation.primaryText}\n`;
    inspiration += `CTA: ${item.variation.cta}\n`;
    inspiration += `Keywords: ${(item.variation.keywords || []).join(', ')}\n`;
    inspiration += `\n---\n\n`;
  });

  inspiration += `These examples show what the client likes. Match their style and approach.`;

  return inspiration;
}
