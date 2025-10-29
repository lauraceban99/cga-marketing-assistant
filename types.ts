
export interface Brand {
  id: string;
  name: string;
  color: string;
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
