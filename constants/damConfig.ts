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
 * Get default instructions for a brand
 */
export function getDefaultInstructions(brandId: string): BrandInstructions {
  return {
    brandId,

    // General Brand Instructions
    brandIntroduction: `[PLACEHOLDER: Add comprehensive brand introduction - who you are, what you do, your mission and vision]`,

    personas: [
      {
        name: '[PLACEHOLDER: Persona Name]',
        description: '[PLACEHOLDER: Detailed persona description]',
        painPoints: [
          '[PLACEHOLDER: Pain point 1]',
          '[PLACEHOLDER: Pain point 2]',
          '[PLACEHOLDER: Pain point 3]'
        ],
        solution: '[PLACEHOLDER: How your brand solves these pain points]'
      }
    ],

    coreValues: [
      '[PLACEHOLDER: Core value 1]',
      '[PLACEHOLDER: Core value 2]',
      '[PLACEHOLDER: Core value 3]'
    ],

    toneOfVoice: `[PLACEHOLDER: Describe your brand's tone - e.g., warm, professional, conversational, aspirational]`,

    keyMessaging: [
      '[PLACEHOLDER: Key message 1]',
      '[PLACEHOLDER: Key message 2]',
      '[PLACEHOLDER: Key message 3]'
    ],

    // Campaign-specific CTAs and messaging
    campaignInstructions: {
      tofu: '[PLACEHOLDER: Top of funnel instructions - awareness stage, educational CTAs]',
      mofu: '[PLACEHOLDER: Middle of funnel instructions - consideration stage, engagement CTAs]',
      bofu: '[PLACEHOLDER: Bottom of funnel instructions - decision stage, conversion CTAs]'
    },

    // Ad Copy Instructions
    adCopyInstructions: {
      systemPrompt: `You are an expert ad copywriter. Create compelling, conversion-focused ad copy that never fabricates facts.

CRITICAL RULES:
- NEVER make up statistics, testimonials, or specific claims
- Use [PLACEHOLDER: specific detail] when information is not provided
- Focus on emotional benefits and transformation
- Each ad must have a distinct angle, persona, or approach
- Not all ads should start with questions - vary the opening hooks`,

      requirements: `For each ad copy request:
- Generate both SHORT and LONG versions
- Create multiple variations (minimum 5) with different:
  * Personas (which target audience segment)
  * Angles (emotional, logical, social proof, urgency, etc.)
  * Opening hooks (questions, statements, stories, statistics)
- Respect specified word/character limits
- Match the campaign stage (TOFU/MOFU/BOFU) if specified`,

      examples: [
        {
          stage: 'tofu',
          type: 'ad-copy',
          headline: '[PLACEHOLDER: Example TOFU ad headline]',
          copy: '[PLACEHOLDER: Example TOFU ad body copy]',
          cta: '[PLACEHOLDER: Example TOFU CTA]',
          notes: 'Awareness stage - educational, non-pushy'
        },
        {
          stage: 'mofu',
          type: 'ad-copy',
          headline: '[PLACEHOLDER: Example MOFU ad headline]',
          copy: '[PLACEHOLDER: Example MOFU ad body copy]',
          cta: '[PLACEHOLDER: Example MOFU CTA]',
          notes: 'Consideration stage - showing value, building trust'
        },
        {
          stage: 'bofu',
          type: 'ad-copy',
          headline: '[PLACEHOLDER: Example BOFU ad headline]',
          copy: '[PLACEHOLDER: Example BOFU ad body copy]',
          cta: '[PLACEHOLDER: Example BOFU CTA]',
          notes: 'Decision stage - clear offer, strong CTA'
        }
      ],

      dos: [
        'Create truly different variations with unique angles',
        'Use specific, concrete language',
        'Focus on benefits and transformation',
        'Vary your opening hooks (not all questions)',
        'Use placeholders when facts are uncertain',
        'Match the persona and their pain points',
        'Align with campaign stage (TOFU/MOFU/BOFU)'
      ],

      donts: [
        'Never fabricate statistics or testimonials',
        'Never use exclamation marks',
        'Never use hashtags',
        'Never use corporate jargon',
        'Never make all ads sound the same',
        'Never start every ad with a question',
        'Never exceed specified length limits'
      ]
    },

    // Blog Instructions
    blogInstructions: {
      systemPrompt: `You are an expert content writer specializing in SEO and AI-optimized blog posts.`,

      requirements: `Create blog posts that are:
- Optimized for both traditional SEO and AI search engines
- Well-structured with clear headings (H2, H3)
- Include natural keyword integration
- Provide genuine value and insights
- Never fabricate facts or statistics
- Use [PLACEHOLDER] for uncertain information`,

      examples: [
        {
          stage: 'tofu',
          type: 'blog',
          headline: '[PLACEHOLDER: Example educational blog title]',
          copy: '[PLACEHOLDER: Example blog excerpt with structure]',
          cta: '[PLACEHOLDER: Soft CTA for awareness]'
        }
      ],

      dos: [
        'Use clear, scannable structure',
        'Include relevant keywords naturally',
        'Provide actionable insights',
        'Use data and sources when available',
        'Optimize for featured snippets',
        'Write compelling meta descriptions'
      ],

      donts: [
        'Never keyword stuff',
        'Never fabricate data or sources',
        'Never use clickbait titles',
        'Never ignore readability',
        'Never forget about user intent'
      ]
    },

    // Landing Page Instructions
    landingPageInstructions: {
      systemPrompt: `You are an expert conversion copywriter specializing in landing pages.`,

      requirements: `Create landing page copy with:
- Clear value proposition above the fold
- Structured sections (hero, benefits, features, social proof, CTA)
- Conversion-focused language
- Strong, clear CTAs
- Never fabricate testimonials or claims`,

      examples: [
        {
          stage: 'bofu',
          type: 'landing-page',
          headline: '[PLACEHOLDER: Example hero headline]',
          copy: '[PLACEHOLDER: Example landing page structure and sections]',
          cta: '[PLACEHOLDER: Primary conversion CTA]'
        }
      ],

      dos: [
        'Lead with strongest benefit',
        'Use clear section structure',
        'Include multiple CTAs strategically',
        'Address objections',
        'Create urgency appropriately',
        'Use white space effectively'
      ],

      donts: [
        'Never fabricate testimonials',
        'Never make unsubstantiated claims',
        'Never bury the value proposition',
        'Never use weak CTAs',
        'Never ignore mobile readability'
      ]
    },

    // Email Instructions
    emailInstructions: {
      invitation: {
        systemPrompt: `You are an expert email copywriter creating event invitation emails.`,
        requirements: `Event invitation emails should be warm, clear, and compelling.`,
        examples: [{
          stage: 'tofu',
          type: 'email',
          headline: '[PLACEHOLDER: Invitation subject line]',
          copy: '[PLACEHOLDER: Invitation email body]',
          cta: '[PLACEHOLDER: RSVP CTA]'
        }],
        dos: ['Be warm and welcoming', 'Clear event details', 'Easy RSVP process'],
        donts: ['Never be pushy', 'Never omit key details', 'Never use confusing CTAs']
      },

      nurturingDrip: {
        systemPrompt: `You are an expert email copywriter creating nurturing drip sequences.`,
        requirements: `Nurturing emails should build relationships and trust over time.`,
        examples: [{
          stage: 'mofu',
          type: 'email',
          headline: '[PLACEHOLDER: Nurture email subject]',
          copy: '[PLACEHOLDER: Nurture email body]',
          cta: '[PLACEHOLDER: Engagement CTA]'
        }],
        dos: ['Build relationship progressively', 'Provide value each email', 'Natural progression'],
        donts: ['Never hard sell early', 'Never overwhelm', 'Never be repetitive']
      },

      emailBlast: {
        systemPrompt: `You are an expert email copywriter creating announcement and news emails.`,
        requirements: `Email blasts should be timely, newsworthy, and engaging.`,
        examples: [{
          stage: 'tofu',
          type: 'email',
          headline: '[PLACEHOLDER: Breaking news subject]',
          copy: '[PLACEHOLDER: News email body]',
          cta: '[PLACEHOLDER: Learn more CTA]'
        }],
        dos: ['Lead with the news', 'Create urgency if appropriate', 'Clear single focus'],
        donts: ['Never mislead', 'Never bury the lead', 'Never lack clear CTA']
      }
    },

    // Reference Materials
    referenceMaterials: {
      interviews: '[PLACEHOLDER: Add zoom interview transcripts or customer research notes here. Use these to ensure authentic voice and avoid fabricating testimonials.]',
      testimonials: '[PLACEHOLDER: Real testimonials and success stories]',
      otherNotes: '[PLACEHOLDER: Any other reference materials]'
    },

    // Metadata
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
