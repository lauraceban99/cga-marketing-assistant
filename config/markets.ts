import type { Market, Platform, CampaignStage, EmailType } from '../types';

export interface MarketConfig {
  label: Market;
  fullName: string;
  description: string;
}

export interface PlatformConfig {
  label: Platform;
  fullName: string;
  description: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export interface CampaignStageConfig {
  label: CampaignStage;
  shortName: string;
  fullName: string;
  description: string;
}

export interface EmailTypeConfig {
  label: EmailType;
  fullName: string;
  description: string;
}

// Markets configuration - Single source of truth
export const MARKETS: Record<Market, MarketConfig> = {
  ASIA: {
    label: 'ASIA',
    fullName: 'Asia (Singapore, Hong Kong, Vietnam)',
    description: 'Contrarian educational positioning, extreme specificity, university prestige focus',
  },
  EMEA: {
    label: 'EMEA',
    fullName: 'EMEA (UAE, Middle East, Europe)',
    description: 'Urgency + aspiration, social proof stacking, enrollment focus',
  },
  ANZ: {
    label: 'ANZ',
    fullName: 'ANZ (Australia, New Zealand)',
    description: 'Gentle challenge to traditional, flexibility focus, local credibility',
  },
  Japan: {
    label: 'Japan',
    fullName: 'Japan',
    description: 'Both/and reassurance, process-oriented, authentic testimonials',
  },
  USA: {
    label: 'USA',
    fullName: 'USA (United States)',
    description: 'Direct value proposition, outcome-focused, testimonials and case studies',
  },
};

// Platforms configuration - Single source of truth
export const PLATFORMS: Record<Platform, PlatformConfig> = {
  META: {
    label: 'META',
    fullName: 'META Ads (Facebook, Instagram)',
    description: 'Social audience, interruption marketing, emotion-driven, storytelling focus',
    icon: '📱',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-600',
  },
  GOOGLE: {
    label: 'GOOGLE',
    fullName: 'GOOGLE Ads & Organic (Search, Display)',
    description: 'High-intent searchers, problem-aware, comparison-shopping, data-driven',
    icon: '🔍',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-600',
  },
  ORGANIC: {
    label: 'ORGANIC',
    fullName: 'ORGANIC (SEO, Direct)',
    description: 'Organic reach, SEO-optimized, direct traffic',
    icon: '🌐',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-600',
  },
  EMAIL: {
    label: 'EMAIL',
    fullName: 'EMAIL (Campaigns)',
    description: 'Email marketing, personalized, direct communication',
    icon: '📧',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-600',
  },
};

// Badge styles for platforms (used in cards)
export const PLATFORM_BADGE_STYLES: Record<Platform, string> = {
  META: 'bg-blue-100 text-blue-700 border-blue-300',
  GOOGLE: 'bg-green-100 text-green-700 border-green-300',
  ORGANIC: 'bg-purple-100 text-purple-700 border-purple-300',
  EMAIL: 'bg-orange-100 text-orange-700 border-orange-300',
};

// Platform icons (used in cards)
export const PLATFORM_ICONS: Record<Platform, string> = {
  META: '📱',
  GOOGLE: '🔍',
  ORGANIC: '🌐',
  EMAIL: '📧',
};

// Campaign stages configuration
export const CAMPAIGN_STAGES: Record<CampaignStage, CampaignStageConfig> = {
  tofu: {
    label: 'tofu',
    shortName: 'TOFU',
    fullName: 'Top of Funnel',
    description: 'Awareness stage - broad audience, educational content',
  },
  mofu: {
    label: 'mofu',
    shortName: 'MOFU',
    fullName: 'Middle of Funnel',
    description: 'Consideration stage - qualified leads, deeper engagement',
  },
  bofu: {
    label: 'bofu',
    shortName: 'BOFU',
    fullName: 'Bottom of Funnel',
    description: 'Decision stage - conversion-focused, closing the deal',
  },
};

// Email types configuration
export const EMAIL_TYPES: Record<EmailType, EmailTypeConfig> = {
  invitation: {
    label: 'invitation',
    fullName: 'Invitation',
    description: 'Event invitations and exclusive access',
  },
  'nurturing-drip': {
    label: 'nurturing-drip',
    fullName: 'Nurturing Drip',
    description: 'Automated sequences to nurture leads',
  },
  'email-blast': {
    label: 'email-blast',
    fullName: 'Email Blast (Breaking News)',
    description: 'Urgent announcements and time-sensitive offers',
  },
};

// Helper functions for getting ordered lists
export const getMarketsList = (): Market[] => Object.keys(MARKETS) as Market[];

export const getPlatformsList = (): Platform[] => Object.keys(PLATFORMS) as Platform[];

export const getCampaignStagesList = (): CampaignStage[] => Object.keys(CAMPAIGN_STAGES) as CampaignStage[];

export const getEmailTypesList = (): EmailType[] => Object.keys(EMAIL_TYPES) as EmailType[];
