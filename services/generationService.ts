import type { Brand, TaskType, GeneratedCreative, GenerationContext } from '../types';
import { getBrandInstructions } from './instructionsService';
import { getAssetsByCategory } from './assetService';
import { extractTextFromAssets } from './assetExtractionService';
import { replaceTemplateVariables } from './instructionsService';

/**
 * Build generation context for a brand
 */
export async function buildGenerationContext(
  brand: Brand,
  userInput: {
    theme?: string;
    location?: string;
    audience?: string;
    customPrompt?: string;
  }
): Promise<GenerationContext> {
  // Load instructions
  const instructions = await getBrandInstructions(brand.id);

  // Load assets
  const [guidelines, competitorAds, referenceCopy, logos] = await Promise.all([
    getAssetsByCategory(brand.id, 'brand-guidelines'),
    getAssetsByCategory(brand.id, 'competitor-ads'),
    getAssetsByCategory(brand.id, 'reference-copy'),
    getAssetsByCategory(brand.id, 'logos'),
  ]);

  return {
    brand,
    instructions: instructions || {
      brandId: brand.id,
      copySystemPrompt: '',
      copyUserPromptTemplate: '',
      toneRules: '',
      imageGenerationInstructions: '',
      imageStyleGuidelines: '',
      lastUpdatedBy: 'system',
      lastUpdated: new Date(),
      version: 1,
    },
    assets: {
      guidelines,
      competitorAds,
      referenceCopy,
      logos,
    },
    userInput,
  };
}

/**
 * Build the final prompt from context
 */
export async function buildPromptFromContext(
  context: GenerationContext
): Promise<{
  systemPrompt: string;
  userPrompt: string;
}> {
  // Extract text from assets
  const [guidelinesText, referenceCopyText, competitorAdsText] = await Promise.all([
    extractTextFromAssets(context.assets.guidelines),
    extractTextFromAssets(context.assets.referenceCopy),
    extractTextFromAssets(context.assets.competitorAds),
  ]);

  // Build variable replacements
  const variables: Record<string, string> = {
    '{{brand}}': context.brand.name,
    '{{theme}}': context.userInput.theme || 'General Campaign',
    '{{location}}': context.userInput.location || 'All Locations',
    '{{audience}}': context.userInput.audience || context.brand.guidelines.targetAudience || 'General Audience',
    '{{brandGuidelines}}': guidelinesText || context.brand.guidelines.toneOfVoice || 'No brand guidelines available',
    '{{referenceCopy}}': referenceCopyText || 'No reference copy available',
    '{{competitorAds}}': competitorAdsText || 'No competitor ads available',
    '{{logos}}': context.assets.logos.map((l) => l.fileName).join(', ') || 'No logos available',
    '{{tone}}': context.instructions.toneRules || context.brand.guidelines.toneOfVoice || 'Professional and engaging',
  };

  // Replace variables in prompts
  const systemPrompt = replaceTemplateVariables(
    context.instructions.copySystemPrompt,
    variables
  );

  const userPrompt = replaceTemplateVariables(
    context.userInput.customPrompt || context.instructions.copyUserPromptTemplate,
    variables
  );

  return {
    systemPrompt,
    userPrompt,
  };
}

/**
 * Get context summary for display in UI
 */
export function getContextSummary(context: GenerationContext): {
  hasInstructions: boolean;
  hasGuidelines: boolean;
  hasReferenceCopy: boolean;
  hasCompetitorAds: boolean;
  hasLogos: boolean;
  totalAssets: number;
  message: string;
} {
  const totalAssets =
    context.assets.guidelines.length +
    context.assets.competitorAds.length +
    context.assets.referenceCopy.length +
    context.assets.logos.length;

  const parts: string[] = [];

  if (context.instructions.copySystemPrompt) {
    parts.push('custom instructions');
  }

  if (context.assets.guidelines.length > 0) {
    parts.push(`${context.assets.guidelines.length} brand guideline${context.assets.guidelines.length > 1 ? 's' : ''}`);
  }

  if (context.assets.referenceCopy.length > 0) {
    parts.push(`${context.assets.referenceCopy.length} reference copy example${context.assets.referenceCopy.length > 1 ? 's' : ''}`);
  }

  if (context.assets.competitorAds.length > 0) {
    parts.push(`${context.assets.competitorAds.length} competitor ad${context.assets.competitorAds.length > 1 ? 's' : ''}`);
  }

  if (context.assets.logos.length > 0) {
    parts.push(`${context.assets.logos.length} logo${context.assets.logos.length > 1 ? 's' : ''}`);
  }

  return {
    hasInstructions: !!context.instructions.copySystemPrompt,
    hasGuidelines: context.assets.guidelines.length > 0,
    hasReferenceCopy: context.assets.referenceCopy.length > 0,
    hasCompetitorAds: context.assets.competitorAds.length > 0,
    hasLogos: context.assets.logos.length > 0,
    totalAssets,
    message: parts.length > 0 ? `Using ${parts.join(', ')}` : 'No additional context',
  };
}
