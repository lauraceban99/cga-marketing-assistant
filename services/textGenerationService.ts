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
  let usingFallback = false;

  switch (contentType) {
    case 'ad-copy':
      if (!brandInstructions.adCopyInstructions?.systemPrompt) {
        console.warn('⚠️ Brand instructions missing adCopyInstructions - using generic fallback. Please configure brand instructions in DAM.');
        usingFallback = true;
        typeInstructions = {
          systemPrompt: 'You are an expert ad copywriter. Create compelling, conversion-focused ad copy for social media and search platforms.',
          requirements: 'Generate both short and long versions with diverse personas and angles.',
          examples: [],
          dos: ['Use emotional hooks', 'Create varied opening hooks', 'Target different personas', 'Keep mobile-optimized'],
          donts: ['Never fabricate statistics', 'Never use exclamation marks', 'Never make all ads sound the same'],
        };
      } else {
        typeInstructions = brandInstructions.adCopyInstructions;
      }
      break;
    case 'blog':
      if (!brandInstructions.blogInstructions?.systemPrompt) {
        console.warn('⚠️ Brand instructions missing blogInstructions - using generic fallback. Please configure brand instructions in DAM.');
        usingFallback = true;
        typeInstructions = {
          systemPrompt: `You are an expert SEO and content strategist specializing in both traditional search and AI search engines (Perplexity, SearchGPT, Claude, Gemini).

**GOOGLE E-E-A-T PRINCIPLES:**
- Experience: Include real examples, case studies, first-hand insights
- Expertise: Demonstrate deep subject knowledge with data, research citations
- Authoritativeness: Use confident, authoritative language; cite credible sources
- Trustworthiness: Be accurate, balanced, and transparent; acknowledge limitations

**TRADITIONAL SEO BEST PRACTICES:**
- Target primary keyword in: H1, first paragraph, URL slug, meta description
- Use semantic keywords (LSI keywords) naturally throughout
- Structure: H1 → H2s (main topics) → H3s (subtopics)
- Include 7-10 relevant images with descriptive alt text
- Optimal length: 1,500-2,500 words for comprehensive coverage
- Internal linking opportunities: Suggest related topics to link to
- External links: Reference 2-3 high-authority sources (research, stats, industry leaders)

**AI SEARCH OPTIMIZATION:**
- Direct answer format: Start with clear, concise answer to main query
- Conversational tone: Write like you're explaining to a smart friend
- Question-answer structure: Use H2s as questions readers ask
- Entity optimization: Clearly define key concepts and entities
- Context-rich: Explain "why" and "how," not just "what"
- Structured data: Use tables, lists, step-by-step formats for scannability
- Source attribution: Credit data/stats with credible sources

**FEATURED SNIPPET OPTIMIZATION:**
- For "What is X": Start with 40-60 word definition paragraph
- For "How to X": Use numbered steps (1. Action verb → result)
- For "Best X": Use bulleted list with brief explanations
- For comparisons: Use table format (Feature | Option A | Option B)
- For "Why X": Start with concise answer, then elaborate

**CONTENT STRUCTURE:**
1. **Compelling headline**: Include target keyword + benefit/intrigue
2. **Hook intro (100-150 words)**: Answer the main question immediately, then expand
3. **Main sections (H2s)**: Each addresses a key subtopic or question
4. **Actionable subsections (H3s)**: Practical, specific guidance
5. **Conclusion**: Summarize key takeaways, provide clear next step/CTA
6. **Meta description (150-160 chars)**: Include keyword + compelling benefit

**READABILITY:**
- Average sentence length: 15-20 words
- Paragraph length: 2-4 sentences
- Use transition words: "However," "Therefore," "Additionally"
- Mix sentence structures: Short punchy sentences + detailed explanations
- Scan-friendly: Bold key points, use bullet lists, include tables

**ENGAGEMENT SIGNALS:**
- Start with surprising statistic or provocative question
- Include expert quotes or case study examples
- Add practical examples readers can apply immediately
- End sections with thought-provoking questions
- Use "you" language to speak directly to reader`,
          requirements: `**SEO Requirements:**
- Primary keyword in H1, first paragraph, meta description
- 2-3 semantic/LSI keywords naturally integrated
- 1,500-2,500 words for comprehensive coverage
- Featured snippet-optimized intro (40-60 word direct answer)
- Internal linking opportunities (2-3 suggestions)
- External authority links (2-3 credible sources)
- 7-10 images with descriptive alt text

**Structure:**
- H1 (keyword + benefit)
- Introduction (hook + direct answer)
- H2s as questions (how readers search)
- H3s for actionable subtopics
- Conclusion with clear next step
- Meta description (150-160 chars)

**AI Search Optimization:**
- Conversational, natural language
- Direct answers AI can quote
- Structured data: tables, lists, steps
- Context-rich explanations (why/how)
- Entity definitions clearly explained`,
          examples: [],
          dos: [
            'Start with direct answer to main question (AI-quotable)',
            'Use question-format H2s matching search intent',
            'Include data, statistics, and credible sources',
            'Add practical examples and case studies (E-E-A-T)',
            'Structure content for featured snippets',
            'Optimize for both traditional and AI search',
            'Use conversational tone for AI search engines',
            'Include tables/lists for scannability',
            'Suggest internal linking opportunities',
            'Write descriptive image alt text (7-10 images)'
          ],
          donts: [
            'Never keyword stuff or force unnatural phrasing',
            'Never sacrifice readability for SEO',
            'Never use generic introductions - start with value',
            'Never ignore search intent (informational vs transactional)',
            'Never skip external authority links',
            'Never use long paragraphs (max 4 sentences)',
            'Never forget featured snippet optimization',
            'Never overlook E-E-A-T principles (expertise, trust)'
          ],
        };
      } else {
        typeInstructions = brandInstructions.blogInstructions;
      }
      break;
    case 'landing-page':
      if (!brandInstructions.landingPageInstructions?.systemPrompt) {
        console.warn('⚠️ Brand instructions missing landingPageInstructions - using generic fallback. Please configure brand instructions in DAM.');
        usingFallback = true;
        typeInstructions = {
          systemPrompt: 'You are an expert conversion copywriter. Create high-performing landing page copy that drives action.',
          requirements: 'Include hero section, value proposition, benefits, social proof, and clear CTA.',
          examples: [],
          dos: ['Put strongest benefit in hero headline', 'Use single primary CTA', 'Include social proof', 'Address objections'],
          donts: ['Never fabricate testimonials', 'Never bury value proposition', 'Never use multiple competing CTAs'],
        };
      } else {
        typeInstructions = brandInstructions.landingPageInstructions;
      }
      break;
    case 'email':
      // Use optional chaining with fallback to prevent errors for old documents
      if (emailType === 'invitation') {
        if (!brandInstructions.emailInstructions?.invitation?.systemPrompt) {
          console.warn('⚠️ Brand instructions missing email invitation instructions - using generic fallback. Please configure brand instructions in DAM.');
          usingFallback = true;
        }
        typeInstructions = brandInstructions.emailInstructions?.invitation || {
          systemPrompt: 'Create a compelling invitation email that drives event attendance.',
          requirements: 'Include event details, clear value proposition, and single CTA.',
          examples: [],
          dos: ['Personalize subject line', 'Include clear event details', 'Use single CTA'],
          donts: ['Never use generic invitations', 'Never bury event details', 'Never use multiple CTAs'],
        };
      } else if (emailType === 'nurturing-drip') {
        if (!brandInstructions.emailInstructions?.nurturingDrip?.systemPrompt) {
          console.warn('⚠️ Brand instructions missing email nurturing-drip instructions - using generic fallback. Please configure brand instructions in DAM.');
          usingFallback = true;
        }
        typeInstructions = brandInstructions.emailInstructions?.nurturingDrip || {
          systemPrompt: 'Create an educational nurturing email that builds trust and moves leads through the funnel.',
          requirements: 'Provide value first, build relationship, use appropriate CTA for stage.',
          examples: [],
          dos: ['Provide educational value', 'Build relationship progressively', 'Use single clear CTA'],
          donts: ['Never hard sell early', 'Never overwhelm with emails', 'Never use multiple CTAs'],
        };
      } else {
        if (!brandInstructions.emailInstructions?.emailBlast?.systemPrompt) {
          console.warn('⚠️ Brand instructions missing email blast instructions - using generic fallback. Please configure brand instructions in DAM.');
          usingFallback = true;
        }
        typeInstructions = brandInstructions.emailInstructions?.emailBlast || {
          systemPrompt: 'Create a newsworthy email blast with a single clear message and strong CTA.',
          requirements: 'Lead with news, create appropriate urgency, single focus message.',
          examples: [],
          dos: ['Lead with the news', 'Create genuine urgency', 'Use single clear CTA'],
          donts: ['Never bury the lead', 'Never create false urgency', 'Never use multiple CTAs'],
        };
      }
      break;
    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }

  if (usingFallback) {
    console.warn(`⚠️ USING GENERIC ${contentType.toUpperCase()} INSTRUCTIONS. Output quality will improve once brand-specific instructions are configured in the DAM.`);
  }

  let systemPrompt = `${typeInstructions.systemPrompt}

BRAND CONTEXT:
${brandInstructions.brandIntroduction}

CORE VALUES:
${(brandInstructions.coreValues || []).join(', ') || 'Not specified'}

TONE OF VOICE:
${brandInstructions.toneOfVoice}

KEY MESSAGING:
${(brandInstructions.keyMessaging || []).map((msg, i) => `${i + 1}. ${msg}`).join('\n') || 'Not specified'}

TARGET PERSONAS:
${(brandInstructions.personas || []).map(p => `
**${p.name}**: ${p.description}
Pain Points: ${(p.painPoints || []).join(', ')}
Our Solution: ${p.solution}
`).join('\n') || 'Not specified'}

REQUIREMENTS:
${typeInstructions.requirements || 'Follow brand guidelines and best practices'}

DO's:
${(typeInstructions.dos || []).map(d => `- ${d}`).join('\n') || '- Follow brand tone and voice\n- Be authentic and specific'}

DON'Ts:
${(typeInstructions.donts || []).map(d => `- ${d}`).join('\n') || '- Avoid generic claims\n- Don\'t fabricate facts'}

${dynamicPatterns ? `
🎯 DYNAMIC PATTERN KNOWLEDGE (${dynamicPatterns.market} Market - ${dynamicPatterns.platform} Platform):

This section contains patterns automatically extracted from high-performing ${contentType} examples.
Apply these patterns to maximize conversion rates for this specific market and platform.

HEADLINE STYLES THAT WORK:
${(dynamicPatterns.patterns?.headlineStyles || []).map(s => `- ${s}`).join('\n') || '- Not yet extracted'}

STRUCTURE PATTERNS:
${(dynamicPatterns.patterns?.structurePatterns || []).map(s => `- ${s}`).join('\n') || '- Not yet extracted'}

TONE CHARACTERISTICS:
${(dynamicPatterns.patterns?.toneCharacteristics || []).map(s => `- ${s}`).join('\n') || '- Not yet extracted'}

CTA STRATEGIES:
${(dynamicPatterns.patterns?.ctaStrategies || []).map(s => `- ${s}`).join('\n') || '- Not yet extracted'}

CONVERSION TECHNIQUES:
${(dynamicPatterns.patterns?.conversionTechniques || []).map(s => `- ${s}`).join('\n') || '- Not yet extracted'}

SOCIAL PROOF APPROACHES:
${(dynamicPatterns.patterns?.socialProofApproaches || []).map(s => `- ${s}`).join('\n') || '- Not yet extracted'}

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

${brandInstructions.referenceMaterials?.interviews ? `
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
  if (campaignStage && brandInstructions.campaignInstructions) {
    const stageInstructions = brandInstructions.campaignInstructions[campaignStage];
    if (stageInstructions) {
      userPrompt += `CAMPAIGN STAGE: ${campaignStage.toUpperCase()}
${stageInstructions}

`;
    }
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
    userPrompt += `

**PRIMARY KEYWORD**: [Extract from user request or use most relevant topic keyword]

**SEARCH INTENT**: [Informational / How-to / Comparison / Best-of-list]
- Match content structure to intent type

**TARGET AUDIENCE SPECIFICS**:
${brandInstructions.personas?.map(p => `
  - ${p.name}: Pain points: ${(p.painPoints || []).join(', ')}
    → Address these pain points with specific solutions
`).join('') || '- General audience: Provide comprehensive, accessible information'}

**SEO CHECKLIST TO INCLUDE:**
1. ✅ Primary keyword in H1 (naturally)
2. ✅ Primary keyword in first 100 words
3. ✅ 2-3 related semantic keywords throughout
4. ✅ Featured snippet-optimized intro (40-60 words)
5. ✅ Internal linking suggestions (mention 2-3 related topics)
6. ✅ External links to authority sources (studies, stats, research)
7. ✅ Descriptive image alt text for 7-10 images
8. ✅ Meta description with keyword + benefit

**AI SEARCH OPTIMIZATION:**
1. ✅ Direct answer in first paragraph (what AI will quote)
2. ✅ Question-format H2s (match how people ask AI)
3. ✅ Conversational, natural language (AI-friendly)
4. ✅ Structured data: Tables, lists, step-by-step instructions
5. ✅ Context-rich explanations (why/how, not just what)

**OUTPUT FORMAT:**

# [Compelling H1 with Target Keyword]

## Meta Description
[150-160 characters with keyword + benefit]

## Introduction (100-150 words)
[Direct answer to main question, then expand with context]

## [Question-Format H2]
[Content with semantic keywords, examples, data]

### [Actionable H3]
[Specific, practical guidance]

[Continue structure...]

## Key Takeaways
- Bullet point summary of main insights

## Conclusion & Next Steps
[Summary + clear CTA aligned with campaign stage]

---

**INTERNAL LINKING SUGGESTIONS:**
[List 2-3 related topics that should be linked to this post]

**IMAGE PLACEHOLDERS (7-10):**
[Description of what each image should show]
- Image 1: [Alt text] - [Visual description]
- Image 2: [Alt text] - [Visual description]
...

${lengthSpec ? `Target length: ${lengthSpec.value} ${lengthSpec.unit}` : '1,500-2,500 words for comprehensive SEO coverage'}

Return ONLY valid JSON in this format:
{
  "headline": "Blog post title (H1 with keyword)",
  "metaDescription": "SEO meta description (150-160 chars)",
  "content": "Full blog post with markdown formatting for headings",
  "keywords": ["primary", "secondary", "tertiary"],
  "internalLinks": ["Suggested related topic 1", "Suggested related topic 2"],
  "imagePlaceholders": [
    {"altText": "Descriptive alt text", "description": "What the image shows"},
    {"altText": "Descriptive alt text", "description": "What the image shows"}
  ]
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
