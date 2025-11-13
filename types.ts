
export interface Brand {
  id: string;
  name: string;
  color: string;
  logoUrl?: string; // URL to brand logo image
  guidelines: {
    toneOfVoice: string;
    keyMessaging: string;
    targetAudience: string;
    values: string;
    palette?: string;
    logoRules?: string;
    fonts?: string;
    imageryStyle?: string;
    dosAndDonts?: string;
  };
  inspiration?: string[];
}

export type TaskType = 'ad-copy' | 'blog' | 'landing-page' | 'email' | 'voiceover';

export type EmailType = 'invitation' | 'nurturing-drip' | 'email-blast';

export type CampaignStage = 'tofu' | 'mofu' | 'bofu';

export type VoiceOption = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface VoiceoverOptions {
  voice: VoiceOption;
  speed: number; // 0.85-1.15 (slower speeds often sound more natural)
}

export interface Theme {
  brand: Brand;
  themeName: string;
  audience: string;
  location: string;
  adFocus: string; // Emotion/focus like "excitement", "achievement", "community"
  audiencePersona: string; // Description of target audience
}

export interface AdCopy {
  headline: string;
  primaryText: string;
  cta: string;
}

export interface AdVariation {
  headline: string;
  primaryText: string;
  cta: string;
  keywords: string[];
  imageUrl?: string; // Generated image for this variation
}

export interface GeneratedCreative {
    text: string;
    images: string[];
    variations?: AdVariation[]; // For multi-variation ad generation
    selectedVariation?: AdVariation; // The variation user selected
}

// Brand Guidelines Management Types
export interface BrandGuideline {
  brandId: string;
  brandName: string;
  pdfUrl: string;
  pdfFileName: string;
  fileSize: number;
  extractedText: string;
  guidelines: {
    toneOfVoice?: string;
    keyMessaging?: string;
    targetAudience?: string;
    values?: string;
    imageryStyle?: string;
    dosAndDonts?: string;
  };
  colors: {
    primary: string[];
    secondary: string[];
    accent: string[];
    all: string[];
  };
  typography?: {
    primary: string;
    secondary: string;
    details: string;
  };
  logoRules?: string;
  uploadedBy: string;
  lastUpdated: Date;
  createdAt: Date;
  version: number;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface ParsedGuidelines {
  guidelines: {
    toneOfVoice?: string;
    keyMessaging?: string;
    targetAudience?: string;
    values?: string;
    imageryStyle?: string;
    dosAndDonts?: string;
  };
  colors: {
    primary: string[];
    secondary: string[];
    accent: string[];
    all: string[];
  };
  typography?: {
    primary: string;
    secondary: string;
    details: string;
  };
  logoRules?: string;
}

// Digital Asset Management (DAM) Types
export type AssetCategory =
  | 'brand-guidelines'
  | 'competitor-ads'
  | 'reference-copy'
  | 'logos'
  | 'other';

export interface AssetCategoryConfig {
  label: string;
  icon: string;
  description: string;
  acceptedTypes: string[];
  maxSize: number;
}

export interface BrandAsset {
  id: string;
  brandId: string;
  category: AssetCategory;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
  metadata: AssetMetadata;
}

export interface AssetMetadata {
  description?: string;
  tags?: string[];
  sourceUrl?: string;
  campaignName?: string;
  usageRights?: string;
}

export interface AssetUploadProgress {
  fileName: string;
  progress: number;
  status: 'queued' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  assetId?: string;
}

export interface BrandAssetStats {
  brandId: string;
  totalAssets: number;
  assetsByCategory: Record<AssetCategory, number>;
  totalSize: number;
  lastUpdated: Date;
}

// Generation Instructions Types
export interface PersonaDefinition {
  name: string;
  description: string;
  painPoints: string[];
  solution: string;
}

export type Market = 'ASIA' | 'EMEA' | 'ANZ' | 'Japan';

export type Platform = 'META' | 'GOOGLE' | 'ORGANIC' | 'EMAIL';

export interface CampaignExample {
  stage: CampaignStage;
  type: TaskType;
  market?: Market; // Target market for this example
  platform?: Platform; // Traffic source for this example
  headline?: string;
  copy: string;
  cta: string;
  notes?: string;
  whatWorks?: string; // Manual learnings from marketers about why this example converts
}

export interface TypeSpecificInstructions {
  systemPrompt: string;
  requirements?: string;
  examples: CampaignExample[];
  dos?: string[];
  donts?: string[];
}

export interface BrandInstructions {
  brandId: string;

  // General Brand Instructions
  brandIntroduction: string;
  personas: PersonaDefinition[];
  coreValues: string[];
  toneOfVoice: string;
  keyMessaging: string[];

  // Campaign-specific CTAs and messaging
  campaignInstructions?: {
    tofu: string;
    mofu: string;
    bofu: string;
  };

  // Type-specific instructions
  adCopyInstructions: TypeSpecificInstructions;
  blogInstructions: TypeSpecificInstructions;
  landingPageInstructions: TypeSpecificInstructions;
  emailInstructions?: {
    invitation: TypeSpecificInstructions;
    nurturingDrip: TypeSpecificInstructions;
    emailBlast: TypeSpecificInstructions;
  };

  // Reference materials (e.g., zoom interview transcripts)
  referenceMaterials?: {
    interviews?: string;
    testimonials?: string;
    otherNotes?: string;
  };

  // Metadata
  lastUpdatedBy: string;
  lastUpdated: Date;
  version: number;

  // Pattern Knowledge Base (Dynamic Learning System)
  patternKnowledgeBase?: PatternKnowledgeBase[];
}

/**
 * Pattern Knowledge Base: Dynamic learning system that extracts patterns from examples
 * Organized by market + platform + content type
 * Used alongside static instructions during generation
 */
export interface PatternKnowledgeBase {
  id: string;
  brandId: string;
  market: Market;
  platform: Platform;
  contentType: TaskType;

  // Auto-extracted patterns by AI
  patterns: {
    headlineStyles: string[]; // e.g., "Question-based challengers", "Direct value propositions"
    structurePatterns: string[]; // e.g., "Problem-agitate-solve", "Trust signals upfront"
    toneCharacteristics: string[]; // e.g., "Urgent but supportive", "Intellectual and data-driven"
    ctaStrategies: string[]; // e.g., "Single CTA repeated 6x", "Low-friction webinar registration"
    conversionTechniques: string[]; // e.g., "Contrarian positioning", "Scarcity with urgency banner"
    socialProofApproaches: string[]; // e.g., "Student testimonials", "University logos"
  };

  // Manual learnings from marketers
  manualLearnings: string;

  // AI-extracted insights (generated when examples are added)
  autoExtractedInsights: string;

  // Reference to examples that contributed to these patterns
  exampleIds: string[];

  // Performance summary
  performanceSummary?: {
    averageConversionRate?: number;
    bestConversionRate?: number;
    lowestCPC?: number;
    totalExamples: number;
  };

  // Metadata
  lastUpdated: Date;
  createdAt: Date;
}

export interface LengthSpecification {
  value: number;
  unit: 'words' | 'characters';
}

export interface GenerationContext {
  brand: Brand;
  instructions: BrandInstructions;
  assets: {
    guidelines: BrandAsset[];
    competitorAds: BrandAsset[];
    referenceCopy: BrandAsset[];
    logos: BrandAsset[];
  };
  userInput: {
    theme?: string;
    location?: string;
    audience?: string;
    customPrompt?: string;
    campaignStage?: CampaignStage;
    emailType?: EmailType;
    lengthSpec?: LengthSpecification;
    adVariant?: 'short' | 'long';
    market?: Market;
    platform?: Platform;
  };

  // Dynamic pattern knowledge (loaded based on market + platform + content type)
  dynamicPatterns?: PatternKnowledgeBase;
}
