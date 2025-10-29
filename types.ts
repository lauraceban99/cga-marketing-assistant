
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

export type TaskType = 'copy' | 'ad' | 'email';

export interface GeneratedCreative {
    text: string;
    images: string[];
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
export interface BrandInstructions {
  brandId: string;

  // Copy Generation
  copySystemPrompt: string;
  copyUserPromptTemplate: string;
  toneRules: string;

  // Image Generation
  imageGenerationInstructions: string;
  imageStyleGuidelines: string;

  // Metadata
  lastUpdatedBy: string;
  lastUpdated: Date;
  version: number;
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
  };
}
