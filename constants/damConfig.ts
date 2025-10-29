import type { AssetCategoryConfig, AssetCategory, BrandInstructions } from '../types';

/**
 * Configuration for each asset category
 */
export const ASSET_CATEGORY_CONFIG: Record<AssetCategory, AssetCategoryConfig> = {
  'brand-guidelines': {
    label: 'Brand Guidelines',
    icon: '📋',
    description: 'Brand books, style guides, voice & tone documents',
    acceptedTypes: ['application/pdf', 'text/plain'],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  'competitor-ads': {
    label: 'Ad Examples / Creatives',
    icon: '🎯',
    description: 'Ad examples and creatives for reference and inspiration',
    acceptedTypes: ['image/*', 'application/pdf', 'video/mp4', 'video/quicktime'],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  'reference-copy': {
    label: 'Reference Copy Examples',
    icon: '✍️',
    description: 'Past campaigns, emails, social posts',
    acceptedTypes: ['text/plain', 'application/pdf', 'text/html', 'text/markdown'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  'logos': {
    label: 'Logo Files',
    icon: '🏷️',
    description: 'Logo variants (SVG, PNG, transparent)',
    acceptedTypes: ['image/svg+xml', 'image/png', 'image/jpeg'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  'other': {
    label: 'Other Brand Assets',
    icon: '📦',
    description: 'Fonts, color palettes, templates',
    acceptedTypes: ['*/*'],
    maxSize: 15 * 1024 * 1024, // 15MB
  },
};

/**
 * Default generation instructions (from n8n workflow)
 */
export const DEFAULT_COPY_SYSTEM_PROMPT = `You are a senior brand copywriter for a modern online school.
Write warm, confident, aspirational Facebook ads that speak to thoughtful parents.
Be specific and human. Show outcomes (confidence, belonging, future readiness) without hype.
No corporate jargon or 'innovative/world-class'. No exclamation marks or hashtags.
Headlines should hook emotionally (not literal), ≤ 40 characters.`;

export const DEFAULT_COPY_USER_PROMPT_TEMPLATE = `CONTEXT
Brand: {{brand}}
Theme: {{theme}}
Location: {{location}}
Audience: {{audience}}

BRAND GUIDELINES (plain text extracted):
{{brandGuidelines}}

REFERENCE COPY (style cues to emulate):
{{referenceCopy}}

TONE
{{tone}}

WRITE ADS
- Produce 3 ads that feel like the examples in REFERENCE COPY but on-brand.
- Each ad must include:
  - "headline": 10-14 words, evocative, include theme or location if relevant.
  - "primaryText": 90-160 words. Start with a hook ('What if...', 'Imagine...', 'Is your child...?').
  - "cta": Clear call-to-action (3-5 words).`;

export const DEFAULT_TONE_RULES = `DO:
- Use warm, conversational language
- Focus on outcomes and transformation
- Be specific with examples
- Show empathy for parent concerns
- Use "you" and "your child"

DON'T:
- Use exclamation marks
- Use hashtags
- Use corporate jargon ("innovative", "world-class", "cutting-edge")
- Make unsubstantiated claims
- Use all caps or aggressive formatting`;

export const DEFAULT_IMAGE_GENERATION_INSTRUCTIONS = `Produce exactly ten diverse text prompts suitable for image generation.

PROMPT REQUIREMENTS:
- 1:1 aspect ratio (explicitly state '--ar 1:1' at the end)
- Modern, clean composition; bold focal point; high contrast; clutter-free background
- Include brief overlay text—≤ 6 words—using or paraphrasing the ad's headline/CTA
- Vary creative angles: product-in-action, aspirational lifestyle, social-proof scene, emoji-accent, bold typography lock-up, etc.
- Incorporate brand-relevant colors from brand guidelines
- Never reference policy, Facebook, or specific AI tools; never include hashtags
- Use concise, comma-separated descriptors
- Do not use any kind of quotes in the prompt

OUTPUT: Return only valid JSON with imagePrompts array`;

export const DEFAULT_IMAGE_STYLE_GUIDELINES = `Modern, clean, aspirational imagery. Focus on students engaged, confident, and connected. Use brand colors. High contrast, clutter-free backgrounds.`;

/**
 * Get default instructions for a brand
 */
export function getDefaultInstructions(brandId: string): BrandInstructions {
  return {
    brandId,
    copySystemPrompt: DEFAULT_COPY_SYSTEM_PROMPT,
    copyUserPromptTemplate: DEFAULT_COPY_USER_PROMPT_TEMPLATE,
    toneRules: DEFAULT_TONE_RULES,
    imageGenerationInstructions: DEFAULT_IMAGE_GENERATION_INSTRUCTIONS,
    imageStyleGuidelines: DEFAULT_IMAGE_STYLE_GUIDELINES,
    lastUpdatedBy: 'system',
    lastUpdated: new Date(),
    version: 1,
  };
}

/**
 * Template variables available for use in prompts
 */
export const TEMPLATE_VARIABLES = {
  '{{brand}}': 'Brand name (e.g., "CGA")',
  '{{theme}}': 'Campaign theme (e.g., "Open Day")',
  '{{location}}': 'Target location (e.g., "Auckland")',
  '{{audience}}': 'Target audience (e.g., "parents of 12-18 year olds")',
  '{{brandGuidelines}}': 'Extracted text from brand guideline PDFs',
  '{{referenceCopy}}': 'Extracted text from reference copy examples',
  '{{competitorAds}}': 'Descriptions of competitor ad examples',
  '{{logos}}': 'List of available logo files',
  '{{tone}}': 'Tone and voice rules',
};
