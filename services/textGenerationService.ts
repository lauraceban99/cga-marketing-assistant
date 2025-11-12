import type {
  Brand,
  BrandInstructions,
  TaskType,
  EmailType,
  CampaignStage,
  LengthSpecification,
  TypeSpecificInstructions,
  Market,
  Platform,
  PatternKnowledgeBase
} from '../types';
import { getPatternKnowledge, getGeneralPatterns } from './patternKnowledgeService';

export interface AdCopyVariation {
  id: string;
  version: 'short' | 'long';
  persona: string;
  angle: string;
  headline: string;
  body: string;
  cta: string;
  keywords: string[];
}

export interface GeneratedContent {
  type: TaskType;
  variations?: AdCopyVariation[];
  content?: string;
  metadata: {
    wordCount: number;
    characterCount: number;
    campaignStage?: CampaignStage;
    emailType?: EmailType;
  };
}

/**
 * Build the system prompt based on content type and brand instructions
 * Includes dynamic pattern knowledge when available
 */
function buildSystemPrompt(
  contentType: TaskType,
  emailType: EmailType | undefined,
  brandInstructions: BrandInstructions,
  market?: Market,
  dynamicPatterns?: PatternKnowledgeBase
): string {
  let typeInstructions: TypeSpecificInstructions;

  switch (contentType) {
    case 'ad-copy':
      typeInstructions = brandInstructions.adCopyInstructions;
      break;
    case 'blog':
      typeInstructions = brandInstructions.blogInstructions;
      break;
    case 'landing-page':
      typeInstructions = brandInstructions.landingPageInstructions;
      break;
    case 'email':
      if (emailType === 'invitation') {
        typeInstructions = brandInstructions.emailInstructions.invitation;
      } else if (emailType === 'nurturing-drip') {
        typeInstructions = brandInstructions.emailInstructions.nurturingDrip;
      } else {
        typeInstructions = brandInstructions.emailInstructions.emailBlast;
      }
      break;
    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }

  let systemPrompt = `${typeInstructions.systemPrompt}

BRAND CONTEXT:
${brandInstructions.brandIntroduction}

CORE VALUES:
${brandInstructions.coreValues.join(', ')}

TONE OF VOICE:
${brandInstructions.toneOfVoice}

KEY MESSAGING:
${brandInstructions.keyMessaging.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}

TARGET PERSONAS:
${brandInstructions.personas.map(p => `
**${p.name}**: ${p.description}
Pain Points: ${p.painPoints.join(', ')}
Our Solution: ${p.solution}
`).join('\n')}

REQUIREMENTS:
${typeInstructions.requirements}

DO's:
${typeInstructions.dos.map(d => `- ${d}`).join('\n')}

DON'Ts:
${typeInstructions.donts.map(d => `- ${d}`).join('\n')}

${dynamicPatterns ? `
🎯 DYNAMIC PATTERN KNOWLEDGE (${dynamicPatterns.market} Market - ${dynamicPatterns.platform} Platform):

This section contains patterns automatically extracted from high-performing ${contentType} examples.
Apply these patterns to maximize conversion rates for this specific market and platform.

HEADLINE STYLES THAT WORK:
${dynamicPatterns.patterns.headlineStyles.map(s => `- ${s}`).join('\n')}

STRUCTURE PATTERNS:
${dynamicPatterns.patterns.structurePatterns.map(s => `- ${s}`).join('\n')}

TONE CHARACTERISTICS:
${dynamicPatterns.patterns.toneCharacteristics.map(s => `- ${s}`).join('\n')}

CTA STRATEGIES:
${dynamicPatterns.patterns.ctaStrategies.map(s => `- ${s}`).join('\n')}

CONVERSION TECHNIQUES:
${dynamicPatterns.patterns.conversionTechniques.map(s => `- ${s}`).join('\n')}

SOCIAL PROOF APPROACHES:
${dynamicPatterns.patterns.socialProofApproaches.map(s => `- ${s}`).join('\n')}

AI-EXTRACTED INSIGHTS:
${dynamicPatterns.autoExtractedInsights}

${dynamicPatterns.manualLearnings ? `MARKETER INSIGHTS:
${dynamicPatterns.manualLearnings}` : ''}

CRITICAL: These patterns are derived from actual high-performing content.
Prioritize these patterns over general best practices when they conflict.
` : ''}

REFERENCE EXAMPLES${market && contentType === 'landing-page' ? ` (${market} Market)` : ''}:
${typeInstructions.examples
  .filter(ex => {
    // For landing pages, filter by market if specified
    if (contentType === 'landing-page' && market) {
      return ex.market === market || !ex.market; // Include examples without market specified
    }
    return true;
  })
  .map((ex, i) => `
Example ${i + 1} (${ex.stage.toUpperCase()}${ex.market ? ` - ${ex.market} Market` : ''}${ex.platform ? ` - ${ex.platform} Platform` : ''}):
${ex.headline ? `Headline: ${ex.headline}\n` : ''}Body: ${ex.copy}
CTA: ${ex.cta}
${ex.whatWorks ? `\n💡 WHY THIS WORKS (Marketer Insights):\n${ex.whatWorks}\n` : ''}
${ex.notes ? `Notes: ${ex.notes}` : ''}
`).join('\n')}

${brandInstructions.referenceMaterials.interviews ? `
INTERVIEW TRANSCRIPTS (Use for authentic voice, don't fabricate):
${brandInstructions.referenceMaterials.interviews}
` : ''}

═══════════════════════════════════════════════════════════════════
🎯 CRITICAL GENERATION INSTRUCTIONS - READ CAREFULLY:
═══════════════════════════════════════════════════════════════════

You have been provided with:
1. ✅ Brand-specific instructions and requirements
2. ✅ Target personas and their pain points
3. ✅ ${typeInstructions.examples.length} reference examples with actual content
${dynamicPatterns ? `4. ✅ Auto-extracted patterns from ${dynamicPatterns.performanceSummary?.totalExamples || 0} high-performing examples
5. ✅ Market-specific insights (${dynamicPatterns.market} + ${dynamicPatterns.platform})` : ''}

YOUR TASK:
Generate content that THOROUGHLY applies ALL of the above learnings.

This means:
- Study the reference examples carefully - understand their structure, tone, and approach
- Apply the dynamic patterns (headline styles, structure, CTAs, conversion techniques)
- Incorporate marketer insights from the "WHY THIS WORKS" sections
- Match the tone and style that has proven to work
- Use similar sentence structures, opening hooks, and closing techniques
- Adapt successful elements to the new context, don't copy verbatim

DO NOT:
- Generate generic content that ignores the examples
- Skip applying the dynamic patterns
- Ignore the "WHY THIS WORKS" insights
- Use patterns that contradict the successful examples

REMEMBER:
- The examples provided are REAL, high-performing content
- The patterns were extracted from content that actually converted
- Your goal is to create content AS GOOD AS or BETTER than the examples
- When in doubt, follow the examples more closely rather than less

CRITICAL: Never fabricate facts, statistics, or testimonials. Use [PLACEHOLDER: description] when information is not available.`;

  return systemPrompt;
}

/**
 * Build the user prompt for generation
 */
function buildUserPrompt(
  contentType: TaskType,
  userRequest: string,
  lengthSpec: LengthSpecification | undefined,
  campaignStage: CampaignStage | undefined,
  brandInstructions: BrandInstructions,
  adVariant: 'short' | 'long' | undefined
): string {
  let userPrompt = `USER REQUEST:
${userRequest}

`;

  // Add campaign stage context
  if (campaignStage) {
    const stageInstructions = brandInstructions.campaignInstructions[campaignStage];
    userPrompt += `CAMPAIGN STAGE: ${campaignStage.toUpperCase()}
${stageInstructions}

`;
  }

  // Add length specification
  if (lengthSpec) {
    userPrompt += `LENGTH REQUIREMENT: ${lengthSpec.value} ${lengthSpec.unit}

`;
  }

  // Specific instructions per content type
  if (contentType === 'ad-copy') {
    userPrompt += `AD COPY REQUIREMENTS:
- Generate BOTH short and long versions for each variation
- Create at least 5 distinct variations
- Each variation must use:
  * A different target persona
  * A different angle (emotional, logical, social proof, urgency, etc.)
  * A different opening hook (vary between questions, statements, stories)
- Short version: ~50-100 words
- Long version: ~150-200 words

Return ONLY valid JSON in this format:
{
  "variations": [
    {
      "id": "1",
      "version": "short",
      "persona": "which persona this targets",
      "angle": "what angle/approach is used",
      "headline": "compelling headline",
      "body": "ad body copy",
      "cta": "call to action",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    },
    {
      "id": "1",
      "version": "long",
      "persona": "same persona as short version",
      "angle": "same angle as short version",
      "headline": "compelling headline (can be same or slightly different)",
      "body": "longer ad body copy",
      "cta": "call to action",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}`;
  } else if (contentType === 'blog') {
    userPrompt += `BLOG POST REQUIREMENTS:
- Create a complete, SEO-optimized blog post
- Include:
  * Compelling headline (H1)
  * Meta description
  * Introduction
  * 3-5 main sections with H2 headings
  * Conclusion
  * Call to action
- Optimize for both traditional SEO and AI search
- Use natural keyword integration
${lengthSpec ? `- Target length: ${lengthSpec.value} ${lengthSpec.unit}` : ''}

Return ONLY valid JSON in this format:
{
  "headline": "Blog post title",
  "metaDescription": "SEO meta description",
  "content": "Full blog post with markdown formatting for headings",
  "keywords": ["primary", "secondary", "tertiary"]
}`;
  } else if (contentType === 'landing-page') {
    userPrompt += `LANDING PAGE REQUIREMENTS:
- Create complete landing page copy with these sections:
  * Hero (headline + subheadline)
  * Value proposition
  * Benefits (3-5 key benefits)
  * Features (if applicable)
  * Social proof section
  * Final CTA
- Conversion-focused language throughout
${lengthSpec ? `- Target total length: ${lengthSpec.value} ${lengthSpec.unit}` : ''}

Return ONLY valid JSON in this format:
{
  "hero": {
    "headline": "Main headline",
    "subheadline": "Supporting headline"
  },
  "valueProposition": "Clear value prop statement",
  "benefits": ["benefit 1", "benefit 2", "benefit 3"],
  "features": ["feature 1", "feature 2"],
  "socialProof": "Social proof section copy",
  "cta": {
    "headline": "CTA headline",
    "body": "CTA supporting text",
    "buttonText": "Button text"
  }
}`;
  } else if (contentType === 'email') {
    userPrompt += `EMAIL REQUIREMENTS:
- Subject line (compelling, under 60 characters)
- Preview text
- Email body with proper structure
- Clear CTA
${lengthSpec ? `- Target body length: ${lengthSpec.value} ${lengthSpec.unit}` : ''}

Return ONLY valid JSON in this format:
{
  "subject": "Email subject line",
  "previewText": "Preview/preheader text",
  "body": "Email body with proper structure",
  "cta": "Call to action text"
}`;
  }

  return userPrompt;
}

/**
 * Generate text content using OpenAI
 */
export async function generateTextContent(
  contentType: TaskType,
  userRequest: string,
  brand: Brand,
  brandInstructions: BrandInstructions,
  options: {
    lengthSpec?: LengthSpecification;
    campaignStage?: CampaignStage;
    emailType?: EmailType;
    adVariant?: 'short' | 'long';
    market?: Market;
    platform?: Platform;
  },
  regenerationFeedback?: string
): Promise<GeneratedContent> {
  console.log(`🎯 Generating ${contentType} with OpenAI...`);

  // Check API key
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('VITE_OPENAI_API_KEY environment variable not set');
  }

  // Load dynamic pattern knowledge if market + platform specified
  let dynamicPatterns: PatternKnowledgeBase | null = null;
  if (options.market && options.platform) {
    console.log(`📚 Loading pattern knowledge for ${options.market} + ${options.platform}...`);
    dynamicPatterns = await getPatternKnowledge(
      brand.id,
      options.market,
      options.platform,
      contentType
    );

    // Fallback to general patterns if market-specific not found
    if (!dynamicPatterns) {
      console.log(`📚 Market-specific patterns not found, loading general patterns...`);
      dynamicPatterns = await getGeneralPatterns(brand.id, options.platform, contentType);
    }

    if (dynamicPatterns) {
      console.log(`✅ Loaded ${dynamicPatterns.performanceSummary?.totalExamples || 0} example patterns`);
    }
  }

  // Build prompts
  const systemPrompt = buildSystemPrompt(
    contentType,
    options.emailType,
    brandInstructions,
    options.market,
    dynamicPatterns || undefined
  );
  let userPrompt = buildUserPrompt(
    contentType,
    userRequest,
    options.lengthSpec,
    options.campaignStage,
    brandInstructions,
    options.adVariant
  );

  // Add regeneration feedback if provided
  if (regenerationFeedback && regenerationFeedback.trim()) {
    userPrompt = `⚠️ REGENERATION REQUEST - USER FEEDBACK ON PREVIOUS VERSION:
"${regenerationFeedback}"

IMPORTANT: The previous generation was not satisfactory. Apply the user's feedback above to improve the content.
Focus on addressing their specific concerns and requests.

${userPrompt}`;
  }

  console.log('🚀 Calling OpenAI API...');

  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: contentType === 'ad-copy' || contentType === 'email'
        ? 'gpt-4.1-mini' // Faster and cheaper for structured content (ad copies, emails)
        : 'gpt-4.1', // Better instruction-following for complex content (blogs, landing pages)
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7, // Slightly lower temperature for more consistent pattern application
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

  // Parse JSON response
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to parse JSON:', content.substring(0, 500));
    throw new Error('Invalid JSON response from OpenAI');
  }

  // Process based on content type
  if (contentType === 'ad-copy') {
    const variations = parsed.variations || [];
    if (variations.length === 0) {
      throw new Error('No ad variations returned from OpenAI');
    }

    console.log(`✅ Generated ${variations.length} ad variations`);

    return {
      type: contentType,
      variations: variations,
      metadata: {
        wordCount: 0,
        characterCount: 0,
        campaignStage: options.campaignStage
      }
    };
  } else {
    // For other content types, stringify the parsed content
    const contentStr = JSON.stringify(parsed, null, 2);
    const wordCount = contentStr.split(/\s+/).length;
    const characterCount = contentStr.length;

    return {
      type: contentType,
      content: contentStr,
      metadata: {
        wordCount,
        characterCount,
        campaignStage: options.campaignStage,
        emailType: options.emailType
      }
    };
  }
}
