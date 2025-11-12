import type { Brand, BrandInstructions } from '../types';

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
  contentConfig: ContentConfig,
  brandInstructions?: BrandInstructions | null,
  pdfGuidelinesText?: string
): { system: string; user: string } {

  const { type, specs, format, count } = contentConfig;

  // If custom brand instructions exist, use them
  if (brandInstructions?.copySystemPrompt && brandInstructions?.copyUserPromptTemplate) {
    console.log('✨ Using custom brand instructions from Firestore');

    // Add JSON format requirement to system prompt
    const systemPrompt = brandInstructions.copySystemPrompt + `

CRITICAL OUTPUT FORMAT:
You MUST return ONLY valid JSON in this exact format:

{
  "variations": [
    {
      "headline": "headline text",
      "primaryText": "primary text content",
      "cta": "call to action",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}

Return EXACTLY ${count} variations in this JSON structure. No markdown, no explanations, only JSON.`;

    // Build brand guidelines section with PDF text if available
    let brandGuidelinesSection = `
Core Values: ${brand.guidelines.values}
Tone of Voice: ${brand.guidelines.toneOfVoice}
Key Messaging: ${brand.guidelines.keyMessaging}
Target Audience: ${brand.guidelines.targetAudience}
${brand.guidelines.dosAndDonts || ''}
`;

    // Add PDF content if available (truncated to first 1000 chars to avoid token limits)
    if (pdfGuidelinesText && pdfGuidelinesText.length > 0) {
      const pdfExcerpt = pdfGuidelinesText.substring(0, 1000);
      brandGuidelinesSection += `\n\n📄 BRAND GUIDELINES (FROM PDF - AUTHORITATIVE):\n${pdfExcerpt}${pdfGuidelinesText.length > 1000 ? '...' : ''}`;
    }

    // Replace template variables in user prompt template
    const userPromptWithVariables = brandInstructions.copyUserPromptTemplate
      .replace(/\{\{brand\}\}/g, brand.name)
      .replace(/\{\{theme\}\}/g, userPrompt)
      .replace(/\{\{location\}\}/g, '') // Extract if mentioned in userPrompt
      .replace(/\{\{audience\}\}/g, brand.guidelines.targetAudience)
      .replace(/\{\{brandGuidelines\}\}/g, brandGuidelinesSection)
      .replace(/\{\{referenceCopy\}\}/g, inspirationExamples || 'No reference copy available')
      .replace(/\{\{tone\}\}/g, brandInstructions.toneRules);

    return {
      system: systemPrompt,
      user: userPromptWithVariables + `\n\nRemember: Return ONLY valid JSON with exactly ${count} ad variations. No other text.`
    };
  }

  // Otherwise, use default prompts (existing logic)
  console.log('📝 Using default prompt structure');
  const systemPrompt = `You are an expert marketing copywriter for ${brand.name}.

🎯 YOUR PRIMARY MISSION:
Write ad copy that is UNMISTAKABLY branded for ${brand.name}. Every ad MUST clearly represent this specific brand - readers should immediately know which organization this is for.

📋 BRAND IDENTITY - ${brand.name}:
Brand Name: ${brand.name} (MUST be mentioned or clearly referenced in the primary text)
Core Values: ${brand.guidelines.values}
Tone of Voice: ${brand.guidelines.toneOfVoice}
Key Messaging Pillars: ${brand.guidelines.keyMessaging}
Target Audience: ${brand.guidelines.targetAudience}
${brand.guidelines.imageryStyle ? `Imagery Style: ${brand.guidelines.imageryStyle}` : ''}
${brand.guidelines.dosAndDonts ? `Dos and Don'ts: ${brand.guidelines.dosAndDonts}` : ''}

BRAND COLORS:
${brand.guidelines.palette || 'Not specified'}

🏆 APPROVED EXAMPLES - Study these successful ${brand.name} ads carefully. Your output MUST match their tone, style, messaging approach, and brand voice:

${inspirationExamples || 'No inspiration examples available - write professional marketing copy based on brand guidelines above'}

⚠️ BRAND MENTION REQUIREMENT:
- The brand name "${brand.name}" MUST appear naturally in the primary text OR
- The brand's unique selling points from Key Messaging MUST be clearly referenced OR
- The copy must be so specific to ${brand.name} that it couldn't be about any other organization
- Generic phrases like "our school" or "Auckland's online campus" WITHOUT brand context are NOT acceptable

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
1. **BRAND NAME REQUIREMENT**: The brand name "${brand.name}" MUST be mentioned OR the brand's unique value propositions from Key Messaging MUST be clearly present. Generic copy that could apply to any organization is REJECTED.
2. **BRAND SPECIFICITY**: Reference specific programs, unique selling points, or differentiators mentioned in Key Messaging. Make it impossible to mistake this for another brand.
3. COUNT characters/words BEFORE responding - you will be penalized for exceeding limits
4. ${specs.forbidden?.length ? `FORBIDDEN PHRASES/CHARACTERS: ${specs.forbidden.join(', ')} - do not use these at all` : ''}
5. Write like a REAL ${brand.name} marketer - be specific and authentic to THIS brand
6. Lead with ${brand.name}'s unique benefits and transformation story, not generic features
7. Use natural, conversational language (${specs.tone}) that matches ${brand.name}'s voice
8. Be concrete and specific - reference actual ${brand.name} programs, values, or differentiators
9. Study and REPLICATE the patterns from the approved ${brand.name} examples above
10. Return ONLY valid JSON - no markdown code fences, no explanations, no additional text
11. ABSOLUTELY NO exclamation marks (!) in any field
12. ABSOLUTELY NO hashtags (#) in any field
13. ABSOLUTELY NO emoji in any field

TONE: ${specs.tone}
Context: You are writing for ${brand.name}
Audience: ${brand.name === 'CGA' ? 'Parents of teenagers seeking flexible, online education with global pathways' : brand.guidelines.targetAudience}
Goal: Create ads that are DISTINCTLY ${brand.name} - not generic education marketing`;

  // Enhance user prompt with brand context
  const enhancedUserPrompt = `Create ${count} ad copy variations for ${brand.name}.

BRAND CONTEXT:
${brand.name} is targeting: ${brand.guidelines.targetAudience}
Core brand values: ${brand.guidelines.values}
Key messaging pillars: ${brand.guidelines.keyMessaging}

USER REQUEST:
${userPrompt}

REMINDER: Every variation must clearly represent ${brand.name} - either by mentioning the brand name or by including distinctive brand messaging that makes it unmistakable. Generic education marketing is not acceptable.`;

  return {
    system: systemPrompt,
    user: enhancedUserPrompt
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
 * Generate ad copy variations using OpenAI GPT-4.1-mini
 */
export async function generateAdCopyWithOpenAI(
  prompt: string,
  brand: Brand,
  inspirationExamples: string,
  brandInstructions?: BrandInstructions | null,
  pdfGuidelinesText?: string
): Promise<AdVariation[]> {
  console.log('🎯 Generating ad copy with OpenAI GPT-4.1-mini...');

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
  console.log('  Custom instructions:', brandInstructions ? 'Yes ✨' : 'No (using defaults)');
  console.log('  PDF Guidelines:', pdfGuidelinesText ? `${pdfGuidelinesText.length} chars extracted` : 'None');

  // Build prompts
  const { system, user } = buildOpenAIPrompt(prompt, brand, inspirationExamples, contentConfig, brandInstructions, pdfGuidelinesText);

  console.log('🚀 Calling OpenAI API...');

  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini', // Updated to latest model (April 2025)
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
