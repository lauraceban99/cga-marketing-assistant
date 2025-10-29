import type { BrandAsset } from '../types';
import { extractTextFromPDF } from './geminiService';

/**
 * Extract text content from an asset based on its file type
 */
export async function extractTextFromAsset(asset: BrandAsset): Promise<string> {
  try {
    // For PDFs, use Gemini's PDF extraction
    if (asset.fileType === 'application/pdf') {
      return await extractTextFromPDF(asset.fileUrl);
    }

    // For plain text files, fetch and return content
    if (asset.fileType.startsWith('text/')) {
      const response = await fetch(asset.fileUrl);
      return await response.text();
    }

    // For images, return description or empty string
    if (asset.fileType.startsWith('image/')) {
      return asset.metadata.description || '';
    }

    // For other types, use metadata description
    return asset.metadata.description || '';
  } catch (error) {
    console.error(`Error extracting text from asset ${asset.id}:`, error);
    return '';
  }
}

/**
 * Extract text from multiple assets
 */
export async function extractTextFromAssets(assets: BrandAsset[]): Promise<string> {
  if (assets.length === 0) {
    return '';
  }

  const extractionPromises = assets.map((asset) => extractTextFromAsset(asset));
  const extractedTexts = await Promise.all(extractionPromises);

  // Combine all extracted texts with clear separators
  return extractedTexts
    .filter((text) => text.trim().length > 0)
    .map((text, index) => {
      const asset = assets[index];
      return `--- ${asset.fileName} ---\n${text}`;
    })
    .join('\n\n');
}

/**
 * Get a summary of assets for display in UI
 */
export function getAssetsSummary(assets: BrandAsset[]): {
  total: number;
  byType: Record<string, number>;
  totalSize: number;
} {
  const summary = {
    total: assets.length,
    byType: {} as Record<string, number>,
    totalSize: 0,
  };

  assets.forEach((asset) => {
    // Count by file type category
    let category = 'other';
    if (asset.fileType.startsWith('image/')) category = 'images';
    else if (asset.fileType === 'application/pdf') category = 'pdfs';
    else if (asset.fileType.startsWith('text/')) category = 'documents';
    else if (asset.fileType.startsWith('video/')) category = 'videos';

    summary.byType[category] = (summary.byType[category] || 0) + 1;
    summary.totalSize += asset.fileSize;
  });

  return summary;
}

/**
 * Format assets summary for display
 */
export function formatAssetsSummary(summary: ReturnType<typeof getAssetsSummary>): string {
  const parts: string[] = [];

  if (summary.byType.pdfs) parts.push(`${summary.byType.pdfs} PDFs`);
  if (summary.byType.documents) parts.push(`${summary.byType.documents} documents`);
  if (summary.byType.images) parts.push(`${summary.byType.images} images`);
  if (summary.byType.videos) parts.push(`${summary.byType.videos} videos`);
  if (summary.byType.other) parts.push(`${summary.byType.other} other files`);

  return parts.join(', ');
}
