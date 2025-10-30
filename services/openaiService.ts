import type { Brand } from '../types';

export interface ContentSpecs {
  headline: { max: number; unit: string };
  primaryText: { min: number; max: number; unit: string };
  cta: { min: number; max: number; unit: string };
  tone: string;
  forbidden: string[];
}

export interface ContentConfig {
  type: string;
  format: 'variations' | 'single';
  count: number;
  specs: ContentSpecs | any;
}

export interface AdVariation {
  headline: string;
  primaryText: string;
  cta: string;
  keywords: string[];
}

/**
 * Detect content type from user prompt and return appropriate configuration
 */
export function detectContentType(prompt: string): ContentConfig {
  const promptLower = prompt.toLowerCase();

  // Facebook/Meta Ads
  if (promptLower.includes('facebook') || promptLower.includes('meta ad') || promptLower.includes('ad')) {
    return {
      type: 'facebook_ad',
      format: 'variations',
      count: 5,
      specs: {
        headline: { max: 40, unit: 'chars' },
        primaryText: { min: 90, max: 160, unit: 'words' },
        cta: { min: 3, max: 5, unit: 'words' },
        tone: 'warm, conversational, parent-to-parent',
        forbidden: ['!', '#', 'emoji', 'Imagine', 'What if', 'Picture this', 'Envision']
      }
    };
  }

  // Instagram Ads
  if (promptLower.includes('instagram')) {
    return {
      type: 'instagram_ad',
      format: 'variations',
      count: 5,
      specs: {
        headline: { max: 30, unit: 'chars' },
        primaryText: { min: 50, max: 100, unit: 'words' },
        cta: { min: 2, max: 4, unit: 'words' },
        tone: 'casual, visual-focused, aspirational',
        forbidden: ['!']
      }
    };
  }

  // Banner/Display Ads
  if (promptLower.includes('banner') || promptLower.includes('display')) {
    return {
      type: 'banner_ad',
      format: 'variations',
      count: 5,
      specs: {
        headline: { max: 10, unit: 'words' },
        primaryText: { min: 15, max: 30, unit: 'words' },
        cta: { min: 2, max: 3, unit: 'words' },
        tone: 'ultra-concise, punchy',
        forbidden: []
      }
    };
  }

  // Prospectus/Long-form
  if (promptLower.includes('prospectus') || promptLower.includes('brochure')) {
    return {
      type: 'prospectus',
      format: 'single',
      count: 1,
      specs: {
        length: { min: 500, max: 1000, unit: 'words' },
        tone: 'formal, informative, comprehensive',
        structure: ['introduction', 'key_benefits', 'program_details', 'admission_process', 'conclusion']
      }
    };
  }

  // Default to Facebook ad (most common use case)
  return {
    type: 'facebook_ad',
    format: 'variations',
    count: 5,
    specs: {
      headline: { max: 40, unit: 'chars' },
      primaryText: { min: 90, max: 160, unit: 'words' },
      cta: { min: 3, max: 5, unit: 'words' },
      tone: 'warm, conversational, parent-to-parent',
      forbidden: ['!', '#', 'emoji', 'Imagine', 'What if', 'Picture this', 'Envision']
    }
  };
}

/**
 * Build OpenAI system prompt with comprehensive brand context
 */
function buildOpenAIPrompt(
  userPrompt: string,
  brand: Brand,
  inspirationExamples: string,
  contentConfig: ContentConfig
): { system: string; user: string } {

  const { type, specs, format, count } = contentConfig;

  const systemPrompt = `You are an expert marketing copywriter specializing in ${type.replace('_', ' ')}.

BRAND GUIDELINES - ${brand.name}:
Core Values: ${brand.guidelines.values}
Tone of Voice: ${brand.guidelines.toneOfVoice}
Key Messaging: ${brand.guidelines.keyMessaging}
Target Audience: ${brand.guidelines.targetAudience}
${brand.guidelines.imageryStyle ? `Imagery Style: ${brand.guidelines.imageryStyle}` : ''}
${brand.guidelines.dosAndDonts ? `Dos and Don'ts: ${brand.guidelines.dosAndDonts}` : ''}

BRAND COLORS:
${brand.guidelines.palette || 'Not specified'}

CRITICAL: Study these successful examples carefully. Your output MUST match their tone, style, and approach:

${inspirationExamples || 'No inspiration examples available - write professional marketing copy based on brand guidelines above'}

OUTPUT REQUIREMENTS:
Format: ${format}
Specifications: ${JSON.stringify(specs, null, 2)}

${format === 'variations' ? `
You MUST return EXACTLY ${count} DIVERSE variations in this JSON format:

{
  "variations": [
    {
      "headline": "headline text (max ${specs.headline?.max} ${specs.headline?.unit})",
      "primaryText": "primary text (${specs.primaryText?.min}-${specs.primaryText?.max} ${specs.primaryText?.unit})",
      "cta": "CTA text (${specs.cta?.min}-${specs.cta?.max} ${specs.cta?.unit})",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}

VARIATION DIVERSITY REQUIREMENTS:
- Variation 1: Direct, straightforward approach
- Variation 2: Emotional, parent-focused angle
- Variation 3: Student-benefit focused
- Variation 4: Social proof or transformation story
- Variation 5: Urgency or opportunity-focused

Each variation must be MEANINGFULLY DIFFERENT from the others.
` : `
Return ONLY this JSON format:

{
  "content": {
    "headline": "...",
    "body": "...",
    "sections": {}
  }
}
`}

CRITICAL RULES:
1. COUNT characters/words BEFORE responding - you will be penalized for exceeding limits
2. ${specs.forbidden?.length ? `FORBIDDEN PHRASES/CHARACTERS: ${specs.forbidden.join(', ')} - do not use these at all` : ''}
3. Write like a REAL marketer, not an AI - be specific and authentic
4. Lead with benefits and transformation, not features
5. Use natural, conversational language (${specs.tone})
6. Be concrete and specific - avoid vague corporate language
7. Borrow successful patterns from the inspiration examples above
8. Return ONLY valid JSON - no markdown code fences, no explanations, no additional text
9. ABSOLUTELY NO exclamation marks (!) in any field
10. ABSOLUTELY NO hashtags (#) in any field
11. ABSOLUTELY NO emoji in any field

TONE: ${specs.tone}
Write as if speaking ${brand.name === 'CGA' ? 'to parents of teenagers seeking flexible education options' : `to ${brand.guidelines.targetAudience}`}`;

  return {
    system: systemPrompt,
    user: userPrompt
  };
}

/**
 * Validate a single ad variation
 */
function validateVariation(variation: AdVariation, specs: ContentSpecs): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  const headlineLength = variation.headline.length;
  const primaryTextWords = variation.primaryText.split(/\s+/).filter(w => w.length > 0).length;
  const ctaWords = variation.cta.split(/\s+/).filter(w => w.length > 0).length;

  // Validate headline
  if (headlineLength > specs.headline.max) {
    errors.push(`Headline too long: ${headlineLength} ${specs.headline.unit} (max ${specs.headline.max})`);
  }
  if (headlineLength === 0) {
    errors.push('Headline is missing');
  }

  // Validate primary text
  if (primaryTextWords < specs.primaryText.min) {
    errors.push(`Primary text too short: ${primaryTextWords} words (min ${specs.primaryText.min})`);
  }
  if (primaryTextWords > specs.primaryText.max) {
    errors.push(`Primary text too long: ${primaryTextWords} words (max ${specs.primaryText.max})`);
  }

  // Validate CTA
  if (ctaWords < specs.cta.min || ctaWords > specs.cta.max) {
    errors.push(`CTA word count invalid: ${ctaWords} words (should be ${specs.cta.min}-${specs.cta.max})`);
  }

  // Check forbidden characters
  if (specs.forbidden.includes('!') && (variation.headline.includes('!') || variation.primaryText.includes('!') || variation.cta.includes('!'))) {
    errors.push('Contains forbidden exclamation marks');
  }
  if (specs.forbidden.includes('#') && (variation.headline.includes('#') || variation.primaryText.includes('#'))) {
    errors.push('Contains forbidden hashtags');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate ad copy variations using OpenAI GPT-4o-mini
 */
export async function generateAdCopyWithOpenAI(
  prompt: string,
  brand: Brand,
  inspirationExamples: string
): Promise<AdVariation[]> {
  console.log('🎯 Generating ad copy with OpenAI GPT-4o-mini...');

  // Check API key
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('VITE_OPENAI_API_KEY environment variable not set');
  }

  // Detect content type from prompt
  const contentConfig = detectContentType(prompt);
  console.log('📋 Detected content type:', contentConfig.type);
  console.log('📊 Format:', contentConfig.format, '| Count:', contentConfig.count);

  // Log brand context
  console.log('📦 Brand context loaded:');
  console.log('  Brand:', brand.name);
  console.log('  Guidelines:', brand.guidelines ? 'Present' : 'Missing');
  console.log('  Tone:', brand.guidelines.toneOfVoice || 'Not specified');
  console.log('  Inspiration examples:', inspirationExamples ? `${inspirationExamples.length} chars` : 'None');

  // Build prompts
  const { system, user } = buildOpenAIPrompt(prompt, brand, inspirationExamples, contentConfig);

  console.log('🚀 Calling OpenAI API...');

  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.8, // Higher for more diverse variations
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  console.log('✅ OpenAI response received');
  console.log('📄 Response length:', content.length, 'chars');

  // Parse JSON response
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to parse JSON:', content.substring(0, 500));
    throw new Error('Invalid JSON response from OpenAI');
  }

  // Extract variations
  const variations = parsed.variations || [];

  if (variations.length === 0) {
    throw new Error('No variations returned from OpenAI');
  }

  console.log(`✅ Generated ${variations.length} variation(s)`);

  // Validate each variation
  const specs = contentConfig.specs as ContentSpecs;
  variations.forEach((variation: AdVariation, index: number) => {
    const validation = validateVariation(variation, specs);

    console.log(`\n📊 Variation ${index + 1} validation:`);
    console.log(`   Headline: "${variation.headline}" (${variation.headline.length} chars)`);
    console.log(`   Primary Text: ${variation.primaryText.split(/\s+/).length} words`);
    console.log(`   CTA: "${variation.cta}" (${variation.cta.split(/\s+/).length} words)`);
    console.log(`   Valid: ${validation.isValid ? '✅' : '❌'}`);

    if (!validation.isValid) {
      console.warn(`   Errors: ${validation.errors.join(', ')}`);
    }
  });

  return variations;
}
