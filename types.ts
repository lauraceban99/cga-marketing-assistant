
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
