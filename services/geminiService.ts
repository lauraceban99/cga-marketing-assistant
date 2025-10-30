
import { GoogleGenAI } from "@google/genai";
import type { Brand, TaskType, ParsedGuidelines, BrandAsset } from '../types';
import { getBrandGuideline } from './firebaseService';
import { parseGuidelinesFromText } from './guidelinesExtractor';

if (!import.meta.env.VITE_GEMINI_API_KEY) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set. Please set it to use the Gemini API.");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string });

/**
 * Analyze brand asset images using Gemini vision to extract visual style
 */
export const analyzeBrandAssetImage = async (imageUrl: string, assetType: 'logo' | 'example-ad'): Promise<string> => {
    try {
        console.log(`🔍 Analyzing ${assetType} image...`);

        // Fetch the image
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);

        const analysisPrompt = assetType === 'logo'
            ? `Analyze this brand logo image in detail:

**CRITICAL - Identify these specific elements:**
1. **Exact colors used**: List all colors with specific names (e.g., "burgundy", "gold", "white") and approximate hex values if possible
2. **Logo shape and structure**: Describe the overall shape (circle, square, emblem, wordmark, etc.)
3. **Typography style**: Font characteristics (serif/sans-serif, bold/light, modern/classic)
4. **Key symbols or icons**: Any distinctive visual elements (shields, crowns, academic symbols, etc.)
5. **Background/container**: Describe if logo sits on a solid background, in a circle, etc.

**Focus on these details for replication:**
- Where should this logo be placed in ads? (corner placement, size relative to image)
- What colors surround it typically?
- Does it have a white circle background or other container?

Provide a 3-4 sentence description that gives SPECIFIC, ACTIONABLE details for placing this logo correctly in generated images.`
            : `Analyze this advertisement example in detail:

**CRITICAL - Identify these specific elements:**
1. **Color blocking and layout**: How is the ad space divided? (e.g., "left 40% solid burgundy, right 60% photo")
2. **Brand colors used**: What specific colors are prominent? (burgundy, gold, white, etc.)
3. **Text size and placement**: Where is text placed? How LARGE is it relative to the image?
4. **Logo placement**: Where exactly is the logo? What size? On what background?
5. **Photography composition**: How many people? What are they doing? Posed or candid?
6. **Background style**: Solid colors, gradients, photos, or mixed?

**Focus on these details:**
- Is text on a solid color background or overlaid on photos?
- What percentage of the image is text vs. photography?
- Are photos used as full-frame backgrounds or in specific sections?
- Is the aesthetic minimal/clean or busy/layered?

Provide a 4-5 sentence description with SPECIFIC composition details that can be replicated (e.g., "Text occupies left third on burgundy background, photo fills right two-thirds").`;

        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [{
                role: 'user',
                parts: [
                    { text: analysisPrompt },
                    {
                        inlineData: {
                            mimeType: blob.type,
                            data: base64.split(',')[1] // Remove data:image/jpeg;base64, prefix
                        }
                    }
                ]
            }]
        });

        const analysis = result.text;
        console.log(`✅ ${assetType} analysis complete:`, analysis.substring(0, 100) + '...');
        return analysis;

    } catch (error) {
        console.error(`❌ Error analyzing ${assetType} image:`, error);
        return '';
    }
};

/**
 * Helper function to convert Blob to base64
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const generateText = async (prompt: string): Promise<string> => {
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return result.text;
    } catch (error) {
        console.error("Error generating text:", error);
        throw new Error("Failed to generate text copy.");
    }
}

export const generateImages = async (prompt: string, count: number): Promise<string[]> => {
    // Check if image generation is disabled via env var
    const imageGenDisabled = import.meta.env.VITE_DISABLE_IMAGE_GENERATION === 'true';

    if (imageGenDisabled) {
        console.log('ℹ️ Image generation is disabled via VITE_DISABLE_IMAGE_GENERATION env var');
        return [];
    }

    try {
        console.log('🖼️ Generating images with Gemini 2.5 Flash Image...');
        console.log('   Prompt:', prompt.substring(0, 200) + '...');
        console.log('   Requested count:', count);

        // Enhance prompt with social media ad quality requirements
        const enhancedPrompt = prompt + `

**SOCIAL MEDIA AD QUALITY STANDARDS:**
- Image must be scroll-stopping and attention-grabbing
- Clear, single focal point (not cluttered or busy)
- High contrast and bold visual hierarchy
- Bright, well-lit photography (not dark or murky)
- Professional-grade quality (sharp, high-resolution)
- Authentic, real-looking people (not overly posed)
- Modern, contemporary aesthetic

**TECHNICAL REQUIREMENTS:**
- 1:1 aspect ratio (square format) - 1024x1024px
- Text must be LARGE and clearly readable on mobile screens
- High resolution and sharp focus throughout
- Proper exposure and professional lighting
- Clean composition with intentional negative space

**CRITICAL REMINDERS:**
- If text is included, it MUST be LARGE (15-20% of image height)
- Colors must be used intentionally and match brand guidelines
- Avoid generic stock photo aesthetics
- Generate professional campaign-quality imagery`;

        // Use direct API call instead of SDK for better control
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('VITE_GEMINI_API_KEY environment variable not set');
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{
                            text: enhancedPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        responseModalities: ['IMAGE'] // Only request IMAGE, not TEXT
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Gemini API error:', errorText);
            throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Gemini response received');
        console.log('   Full response structure:', JSON.stringify(data, null, 2).substring(0, 500));

        // Extract images from response
        const images: string[] = [];

        if (data.candidates) {
            console.log(`   Found ${data.candidates.length} candidate(s)`);

            for (const candidate of data.candidates) {
                if (candidate.content?.parts) {
                    console.log(`   Candidate has ${candidate.content.parts.length} part(s)`);

                    for (const part of candidate.content.parts) {
                        // Check for inlineData (not inline_data)
                        if (part.inlineData?.data) {
                            console.log('   ✅ Found image data (base64)');
                            images.push(part.inlineData.data);
                        } else if (part.inline_data?.data) {
                            console.log('   ✅ Found image data (base64, snake_case)');
                            images.push(part.inline_data.data);
                        }

                        // Log part structure for debugging
                        console.log('   Part keys:', Object.keys(part));
                    }
                }
            }
        }

        console.log(`📊 Extracted ${images.length} image(s)`);

        if (images.length === 0) {
            console.error('⚠️ No images found in Gemini response');
            console.error('⚠️ Full response:', JSON.stringify(data, null, 2));
            throw new Error('Gemini did not generate any images. This may be due to regional restrictions, content policy violations, or the model not supporting image generation. Check console logs for full response structure.');
        }

        return images;

    } catch (error: any) {
        console.error("❌ Image generation failed:", error);
        console.error("   Error name:", error?.name);
        console.error("   Error message:", error?.message);

        // Return helpful error message
        const errorMessage = error?.message || error?.toString() || "Unknown error";
        throw new Error(`Gemini image generation failed: ${errorMessage}. You can disable images by setting VITE_DISABLE_IMAGE_GENERATION=true in your .env file.`);
    }
}

const buildAssetPrompt = (brand: Brand, taskType: TaskType, userPrompt: string): string => {
    const brandGuidelines = `
        **Brand Name:** ${brand.name}
        **Core Values:** ${brand.guidelines.values}
        **Tone of Voice:** ${brand.guidelines.toneOfVoice}
        **Key Messaging Pillars:** ${brand.guidelines.keyMessaging}
        **Target Audience:** ${brand.guidelines.targetAudience}
        **Inspiration from past ads:** ${brand.inspiration?.join(', ')}
    `;

    let taskInstructions = '';
    switch (taskType) {
        case 'ad':
            taskInstructions = `
                **Task:** Generate Facebook/Meta ad copy that STRICTLY follows platform specifications.
                **User Request:** "${userPrompt}"

                ⚠️ **YOU WILL BE PENALIZED IF YOU EXCEED CHARACTER/WORD LIMITS** ⚠️

                **BEFORE YOU RESPOND:**
                1. Count characters in your headline (must be ≤40)
                2. Count words in your primary text (must be 90-160)
                3. Count words in your CTA (must be 3-5)
                4. If ANY limit is exceeded, REWRITE IMMEDIATELY before submitting

                **CRITICAL REQUIREMENTS - ABSOLUTE LIMITS:**
                1. **Headline:** MAXIMUM 40 characters (including spaces)
                   - Emotional hook, NOT literal description
                   - Examples: "Is Your Child Ready?" (24 chars), "Education That Adapts" (23 chars)
                   - ABSOLUTELY NO exclamation marks, hashtags, or emoji
                   - If first attempt exceeds 40 chars → REWRITE SHORTER

                2. **Primary Text:** STRICT 90-160 word limit
                   - Start with an engaging hook: "What if...", "Imagine...", "Is your child..."
                   - Focus on parent emotions: confidence, belonging, future readiness
                   - Conversational, warm, human tone (parent-to-parent)
                   - ABSOLUTELY NO corporate jargon: "innovative", "world-class", "cutting-edge", "revolutionary"
                   - ABSOLUTELY NO exclamation marks, hashtags, or emoji
                   - Talk TO parents, not AT them
                   - Use natural language, like speaking to a friend
                   - If first attempt exceeds 160 words → CUT unnecessary words immediately

                3. **Call to Action:** 3-5 words ONLY
                   - Examples: "Join Our Open Day" (4 words), "Register Your Interest" (3 words)
                   - ABSOLUTELY NO exclamation marks or emoji

                **TONE REQUIREMENTS:**
                - Warm, conversational, parent-to-parent
                - Focus on transformation and belonging
                - Use "you" and "your child"
                - NO marketing speak or buzzwords
                - NO superlatives or hype

                **OUTPUT FORMAT - JSON ONLY:**
                You MUST respond with ONLY valid JSON in this exact format:

                {
                  "headline": "your headline text here",
                  "primaryText": "your primary text here",
                  "cta": "your CTA text here"
                }

                **CRITICAL INSTRUCTIONS:**
                - Return ONLY the JSON object, nothing else
                - DO NOT include markdown code fences like \`\`\`json
                - DO NOT include any explanatory text before or after the JSON
                - DO NOT include character counts, word counts, or any metadata
                - Ensure the JSON is valid and parseable
                - The headline value must be ≤40 characters
                - The primaryText value must be 90-160 words
                - The cta value must be 3-5 words

                **FINAL CHECK BEFORE SUBMITTING:**
                1. Count headline characters (must be ≤40)
                2. Count primary text words (must be 90-160)
                3. Count CTA words (must be 3-5)
                4. Remove ALL exclamation marks
                5. Remove ALL hashtags
                6. Remove ALL emoji
                7. Ensure output is ONLY valid JSON

                If ANY limit is exceeded or forbidden characters exist → REWRITE NOW before submitting.
            `;
            break;
        case 'copy':
            taskInstructions = `
                **Task:** Generate marketing text (for a prospectus, flyer, social media post, etc.).
                **User Request:** "${userPrompt}"
                **Instructions:**
                Based on the user's request and the brand guidelines, write compelling and appropriate marketing text. The format should be clean and ready to use. Do not add any extra commentary.
            `;
            break;
        case 'email':
            taskInstructions = `
                **Task:** Generate a marketing email or a sequence of emails.
                **User Request:** "${userPrompt}"
                **Instructions:**
                Analyze the user's request to determine the campaign objective and the number of emails required. For each email, provide a compelling subject line and full body copy. Use "---" to separate each email. Adhere strictly to the brand guidelines.
            `;
            break;
    }

    return `You are an expert marketing assistant for Crimson Academies. Your task is to generate on-brand marketing assets. Here are the details:\n\n${brandGuidelines}\n\n${taskInstructions}`;
};

/**
 * Post-generation cleanup: Remove all forbidden characters
 */
const cleanupAdCopy = (text: string): string => {
    let cleaned = text;

    // Remove ALL exclamation marks
    cleaned = cleaned.replace(/!/g, '');

    // Remove ALL hashtags
    cleaned = cleaned.replace(/#[\w]+/g, '');

    // Remove emoji (basic emoji ranges)
    cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Emoticons
    cleaned = cleaned.replace(/[\u{1F300}-\u{1F5FF}]/gu, ''); // Misc Symbols and Pictographs
    cleaned = cleaned.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transport and Map
    cleaned = cleaned.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, ''); // Flags
    cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, '');   // Misc symbols
    cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, '');   // Dingbats

    // Clean up any double spaces created by removals
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
};

/**
 * Truncate text to fit within limits
 */
const truncateAdCopy = (headline: string, primaryText: string, cta: string): { headline: string; primaryText: string; cta: string } => {
    let truncatedHeadline = headline;
    let truncatedPrimaryText = primaryText;
    let truncatedCta = cta;

    // Truncate headline to 40 chars
    if (truncatedHeadline.length > 40) {
        truncatedHeadline = truncatedHeadline.substring(0, 37) + '...';
        console.log(`⚠️ Headline truncated to: "${truncatedHeadline}"`);
    }

    // Truncate primary text to 160 words
    const words = truncatedPrimaryText.split(/\s+/);
    if (words.length > 160) {
        truncatedPrimaryText = words.slice(0, 160).join(' ') + '...';
        console.log(`⚠️ Primary text truncated to 160 words`);
    }

    // Truncate CTA to 5 words
    const ctaWords = truncatedCta.split(/\s+/);
    if (ctaWords.length > 5) {
        truncatedCta = ctaWords.slice(0, 5).join(' ');
        console.log(`⚠️ CTA truncated to: "${truncatedCta}"`);
    }

    return { headline: truncatedHeadline, primaryText: truncatedPrimaryText, cta: truncatedCta };
};

/**
 * Validate and parse ad copy to ensure it meets Facebook specs
 * Now expects JSON format from Gemini
 */
const validateAndParseAdCopy = (text: string): { isValid: boolean; parsed: any; errors: string[] } => {
    const errors: string[] = [];
    let headline = '';
    let primaryText = '';
    let cta = '';

    try {
        // Try to extract JSON from response (in case it's wrapped in markdown code fences)
        let jsonText = text.trim();

        // Remove markdown code fences if present
        const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
            jsonText = codeBlockMatch[1];
        } else {
            // Try to find raw JSON object
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonText = jsonMatch[0];
            }
        }

        // Parse JSON
        const parsed = JSON.parse(jsonText);

        // Extract fields
        headline = (parsed.headline || '').trim();
        primaryText = (parsed.primaryText || '').trim();
        cta = (parsed.cta || '').trim();

    } catch (parseError) {
        console.error('❌ JSON parsing failed, attempting fallback to markdown format');

        // Fallback to old markdown parsing if JSON fails
        const headlineMatch = text.match(/\*\*Headline:\*\*\s*(.+?)(?:\n|$)/i);
        const primaryMatch = text.match(/\*\*Primary Text:\*\*\s*([\s\S]+?)(?:\n\*\*Call to Action:\*\*|\*\*CTA:\*\*|$)/i);
        const ctaMatch = text.match(/\*\*(?:Call to Action|CTA):\*\*\s*(.+?)(?:\n|$)/i);

        headline = headlineMatch ? headlineMatch[1].trim() : '';
        primaryText = primaryMatch ? primaryMatch[1].trim() : '';
        cta = ctaMatch ? ctaMatch[1].trim() : '';
    }

    // Validate headline (max 40 chars)
    if (headline.length > 40) {
        errors.push(`Headline too long: ${headline.length} chars (max 40). Headline: "${headline}"`);
    }
    if (headline.length === 0) {
        errors.push('Headline is missing');
    }

    // Validate primary text (90-160 words)
    const wordCount = primaryText.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 90) {
        errors.push(`Primary text too short: ${wordCount} words (min 90)`);
    }
    if (wordCount > 160) {
        errors.push(`Primary text too long: ${wordCount} words (max 160)`);
    }
    if (primaryText.length === 0) {
        errors.push('Primary text is missing');
    }

    // Validate CTA (3-5 words)
    const ctaWordCount = cta.split(/\s+/).filter(w => w.length > 0).length;
    if (ctaWordCount < 3 || ctaWordCount > 5) {
        errors.push(`CTA word count invalid: ${ctaWordCount} words (should be 3-5)`);
    }
    if (cta.length === 0) {
        errors.push('CTA is missing');
    }

    console.log('📊 Ad Copy Validation:');
    console.log(`   Headline: "${headline}" (${headline.length} chars)`);
    console.log(`   Primary Text: ${wordCount} words`);
    console.log(`   CTA: "${cta}" (${ctaWordCount} words)`);
    console.log(`   Errors: ${errors.length > 0 ? errors.join(', ') : 'None'}`);

    return {
        isValid: errors.length === 0,
        parsed: { headline, primaryText, cta, headlineLength: headline.length, wordCount, ctaWordCount },
        errors
    };
};

export const generateAsset = async (brand: Brand, taskType: TaskType, userPrompt: string): Promise<{ text: string; images: string[] }> => {
    const prompt = buildAssetPrompt(brand, taskType, userPrompt);
    let text = await generateText(prompt);

    // Validate ad copy for Facebook specs
    if (taskType === 'ad') {
        console.log('🔍 Validating ad copy against Facebook specs...');

        // Apply post-generation cleanup first
        text = cleanupAdCopy(text);
        console.log('🧹 Applied cleanup (removed !, #, emoji)');

        let validation = validateAndParseAdCopy(text);
        let retryCount = 0;
        const maxRetries = 3;

        // Retry up to 3 times if validation fails
        while (!validation.isValid && retryCount < maxRetries) {
            retryCount++;
            console.warn(`⚠️ Validation failed (Attempt ${retryCount}/${maxRetries}). Errors:`, validation.errors);
            console.log('🔄 Regenerating with stricter constraints...');

            // Build increasingly strict retry prompt
            const retryPrompt = prompt + `\n\n**CRITICAL VALIDATION FAILURE (Attempt ${retryCount}/${maxRetries}):**
The previous attempt failed with these errors: ${validation.errors.join('. ')}.

YOU ARE BEING PENALIZED FOR EXCEEDING LIMITS.

Count each character and word BEFORE responding:
- Headline: Must be ≤40 characters
- Primary Text: Must be 90-160 words
- CTA: Must be 3-5 words

If you write a headline longer than 40 characters, you have FAILED.
If you write primary text outside 90-160 words, you have FAILED.

**REMINDER - Return ONLY valid JSON:**
{
  "headline": "your headline text here",
  "primaryText": "your primary text here",
  "cta": "your CTA text here"
}

Generate again NOW with ABSOLUTE adherence to these limits in JSON format.`;

            text = await generateText(retryPrompt);
            text = cleanupAdCopy(text); // Clean up again
            validation = validateAndParseAdCopy(text);

            if (!validation.isValid && retryCount === maxRetries) {
                console.error(`❌ All ${maxRetries} retry attempts failed. Applying automatic truncation...`);

                // Last resort: Force truncate to fit limits
                const { headline, primaryText, cta } = validation.parsed;
                const truncated = truncateAdCopy(headline, primaryText, cta);

                // Reconstruct the ad copy with truncated values
                text = `**Headline:** ${truncated.headline}\n\n**Primary Text:** ${truncated.primaryText}\n\n**Call to Action:** ${truncated.cta}`;
                console.log('✂️ Ad copy forcibly truncated to meet specs');
            } else if (validation.isValid) {
                console.log(`✅ Retry #${retryCount} successful! Ad copy now meets specs.`);
            }
        }

        if (validation.isValid && retryCount === 0) {
            console.log('✅ Ad copy meets Facebook specs on first attempt!');
        }

        // Convert JSON to markdown format for display
        const { headline, primaryText, cta } = validation.parsed;
        text = `**Headline:** ${headline}\n\n**Primary Text:** ${primaryText}\n\n**Call to Action:** ${cta}`;
    }

    if (taskType === 'ad') {
        // Extract headline from validated ad copy
        const validation = validateAndParseAdCopy(text);
        const headline = validation.parsed.headline || '';

        // Extract first 5-7 words from headline for short, punchy text overlay
        const headlineWords = headline.split(/\s+/).slice(0, 7).join(' ');

        // Build Gemini-friendly image prompt (NOT Midjourney format)
        const imagePrompt = `Generate a square 1024x1024 photorealistic advertisement image for ${brand.name}.

**CGA BRAND IDENTITY (CRITICAL - MUST FOLLOW):**
- Primary colors: Burgundy (#8B1538) and Gold (#D4AF37) MUST be prominent
- These colors should be used for text backgrounds, design elements, or color blocking
- Logo: CGA logo in white circle MUST be visible (top-left or bottom-left corner)
- Typography: Bold, modern sans-serif for headlines
- Photography style: Authentic students in natural learning environments
- NOT generic stock photos - must feel real and personal
- Modern, premium educational brand aesthetic
${brand.guidelines.palette ? `- Additional brand colors: ${brand.guidelines.palette}` : ''}
${brand.guidelines.dosAndDonts ? `- Brand rules: ${brand.guidelines.dosAndDonts}` : ''}

**COMPOSITION REQUIREMENTS:**
- HERO IMAGE: One clear focal point (student, learning moment, or aspirational scene)
- MINIMAL TEXT: Only headline in LARGE, BOLD typography - NOT small body copy
- COLOR BLOCKING: Use burgundy/gold for text backgrounds or design elements
- NEGATIVE SPACE: Clean, uncluttered - let the image breathe
- LOGO: CGA logo prominently placed but not dominating (bottom-left or top-left)
- Call-to-action element: Gold background with white text or burgundy with gold text

**CRITICAL - AVOID STOCK PHOTO LOOK:**
- NO overly diverse "UN ad" style group shots
- NO everyone smiling directly at camera
- NO overly staged/posed scenes
- YES authentic, candid learning moments
- YES natural interactions between students
- YES realistic home/classroom environments
- Show 1-3 students maximum (not large groups)
- Natural expressions, not forced smiles

**Text Overlay (SHORT AND BOLD):**
${headlineWords ? `- Text overlay: "${headlineWords}" (Maximum 5-7 words)` : '- No text overlay needed'}
- Text should be LARGE, bold, highly readable - NOT small body copy
- Use bold sans-serif typography
- Place on solid color background (burgundy or gold) for maximum contrast
- Text size should be at least 15-20% of image height

**Visual Style:**
${brand.guidelines.imageryStyle ? `- ${brand.guidelines.imageryStyle}` : '- Authentic students aged 13-17 in modern learning spaces'}
- High contrast and clean composition
- Professional but personal and approachable
- Modern, aspirational atmosphere
- Well-lit, bright photography (avoid dark/murky)
- 1:1 square aspect ratio

**Important:**
- DO NOT reference Facebook, Meta, or specific platforms
- MUST use burgundy and gold colors prominently
- MUST include CGA logo in white circle
- Avoid generic stock photo aesthetics
- Modern, authentic, professional quality

Generate one high-quality square advertisement image that matches these specifications.`;

        console.log('🎨 Generating image with Gemini-optimized prompt...');
        const images = await generateImages(imagePrompt, 1);
        return { text, images };
    }

    return { text, images: [] };
};

export const refineCreativeText = async (brand: Brand, originalText: string, refinementPrompt: string): Promise<string> => {
    // Check if this is an ad (has the structured format)
    const isAd = originalText.includes('**Headline:**') && originalText.includes('**Primary Text:**');

    const prompt = `
        You are a marketing copy editor for the brand '${brand.name}'.
        Your task is to revise a piece of marketing copy based on user feedback.

        **Brand Tone of Voice:** ${brand.guidelines.toneOfVoice}
        **Original Copy:**
        ---
        ${originalText}
        ---

        **User's Revision Request:** "${refinementPrompt}"

        **Instructions:**
        Rewrite the original copy to incorporate the user's feedback while strictly maintaining the brand's tone of voice.
        ${isAd ? `
        This is a Facebook/Meta ad. You MUST return ONLY valid JSON in this format:
        {
          "headline": "your headline text here (max 40 chars)",
          "primaryText": "your primary text here (90-160 words)",
          "cta": "your CTA text here (3-5 words)"
        }

        Do NOT include markdown code fences, explanatory text, or anything besides the JSON object.
        ` : 'Maintain the original format and structure. Provide only the revised copy, with no extra commentary.'}
    `;
    return generateText(prompt);
};


export const regenerateImages = async (
  brand: Brand,
  text: string,
  refinement: string,
  count: number,
): Promise<string[]> => {
    // Extract headline for overlay text
    const headlineMatch = text.match(/\*\*Headline:\*\*\s*(.+?)(?:\n|$)/i);
    const headline = headlineMatch ? headlineMatch[1].trim() : '';

    // Load brand assets for on-brand image generation
    const { getAssetsByCategory } = await import('./assetService');
    const [logos, competitorAds] = await Promise.all([
        getAssetsByCategory(brand.id, 'logos'),
        getAssetsByCategory(brand.id, 'competitor-ads')
    ]);

    console.log(`📦 Loaded ${logos.length} logos and ${competitorAds.length} example ads for regeneration`);

    // Analyze brand assets using Gemini vision
    console.log('🔍 Analyzing brand assets for regeneration...');
    const analyses = {
        logo: '',
        exampleAds: [] as string[]
    };

    if (logos.length > 0 && logos[0].fileUrl) {
        try {
            analyses.logo = await analyzeBrandAssetImage(logos[0].fileUrl, 'logo');
        } catch (err) {
            console.warn('Could not analyze logo:', err);
        }
    }

    const adsToAnalyze = competitorAds.slice(0, 2).filter(ad => ad.fileUrl && ad.fileType.startsWith('image/'));
    if (adsToAnalyze.length > 0) {
        analyses.exampleAds = await Promise.all(
            adsToAnalyze.map(ad => analyzeBrandAssetImage(ad.fileUrl, 'example-ad'))
        );
    }

    // Extract first 5-7 words from headline for short, punchy text overlay
    const headlineWords = headline.split(/\s+/).slice(0, 7).join(' ');

    // Build Gemini-friendly refinement prompt with actual brand asset analysis
    let imagePrompt = `Generate ${count} square 1024x1024 photorealistic advertisement image${count > 1 ? 's' : ''} for ${brand.name}.

**Original Ad Copy:**
${text}

**Refinement Requested:**
${refinement || 'Generate more variations with the same style'}

**CGA BRAND IDENTITY (CRITICAL - MUST FOLLOW):**
- Primary colors: Burgundy (#8B1538) and Gold (#D4AF37) MUST be prominent
- These colors should be used for text backgrounds, design elements, or color blocking
- Logo: CGA logo in white circle MUST be visible (top-left or bottom-left corner)
- Typography: Bold, modern sans-serif for headlines
- Photography style: Authentic students in natural learning environments
- NOT generic stock photos - must feel real and personal
- Modern, premium educational brand aesthetic`;

    // Add actual logo analysis
    if (analyses.logo) {
        imagePrompt += `\n\n**BRAND LOGO ANALYSIS (MUST INCLUDE):**\n${analyses.logo}`;
        imagePrompt += `\n- The logo must be visible and integrated into the design`;
        if (brand.guidelines.logoRules) {
            imagePrompt += `\n- Logo rules: ${brand.guidelines.logoRules}`;
        }
    }

    // Add color palette
    if (brand.guidelines.palette) {
        imagePrompt += `\n\n**ADDITIONAL BRAND COLORS:**`;
        imagePrompt += `\n- ${brand.guidelines.palette}`;
        imagePrompt += `\n- Apply brand colors to backgrounds, accents, text overlays, and all design elements`;
    }

    // Add imagery style
    if (brand.guidelines.imageryStyle) {
        imagePrompt += `\n\n**IMAGERY STYLE:**\n${brand.guidelines.imageryStyle}`;
    }

    // Add actual example ad analysis
    if (analyses.exampleAds.length > 0) {
        imagePrompt += `\n\n**VISUAL STYLE REFERENCE (MATCH THIS):**`;
        analyses.exampleAds.forEach((analysis, i) => {
            imagePrompt += `\n\nExample Ad ${i + 1}:\n${analysis}`;
        });
        imagePrompt += `\n\nYour generated image MUST match this visual style, composition approach, and aesthetic.`;
    }

    imagePrompt += `

**COMPOSITION REQUIREMENTS:**
- HERO IMAGE: One clear focal point (student, learning moment, or aspirational scene)
- MINIMAL TEXT: Only headline in LARGE, BOLD typography - NOT small body copy
- COLOR BLOCKING: Use burgundy/gold for text backgrounds or design elements
- NEGATIVE SPACE: Clean, uncluttered - let the image breathe
- LOGO: CGA logo prominently placed but not dominating (bottom-left or top-left)
- Call-to-action element: Gold background with white text or burgundy with gold text

**CRITICAL - AVOID STOCK PHOTO LOOK:**
- NO overly diverse "UN ad" style group shots
- NO everyone smiling directly at camera
- NO overly staged/posed scenes
- YES authentic, candid learning moments
- YES natural interactions between students
- YES realistic home/classroom environments
- Show 1-3 students maximum (not large groups)
- Natural expressions, not forced smiles

**Text Overlay (SHORT AND BOLD):**
${headlineWords ? `- Text overlay: "${headlineWords}" (Maximum 5-7 words)` : '- No text overlay needed'}
- Text should be LARGE, bold, highly readable - NOT small body copy
- Use bold sans-serif typography
- Place on solid color background (burgundy or gold) for maximum contrast
- Text size should be at least 15-20% of image height

**Visual Style:**
${brand.guidelines.imageryStyle || '- Authentic students aged 13-17 in modern learning spaces'}
- High contrast and clean composition
- Professional but personal and approachable
- Modern, aspirational atmosphere
- Well-lit, bright photography (avoid dark/murky)
- 1:1 square aspect ratio
- Brand-consistent visual language

**Critical Brand Adherence:**
${brand.guidelines.dosAndDonts || '- Maintain professional, authentic brand image'}
- MUST use burgundy and gold colors prominently
- Logo must be visible and properly displayed (CGA logo in white circle)
- Visual style must match brand identity
- Avoid generic stock photo aesthetics

**Important:**
- Apply the refinement feedback above
- DO NOT reference Facebook, Meta, or specific platforms
- Modern, authentic, professional quality

Generate ${count} diverse, high-quality, ON-BRAND variations incorporating the feedback.`;

  console.log(`🎨 Regenerating ${count} image(s) with refinement and brand assets...`);
  return generateImages(imagePrompt, count);
}


/**
 * Extract text from a PDF using Gemini API
 */
export const extractTextFromPDF = async (pdfFile: File): Promise<string> => {
  try {
    // Upload file to Gemini
    const uploadedFile = await ai.files.upload({
      file: pdfFile,
      config: {
        mimeType: 'application/pdf',
      },
    });

    // Wait for file to be processed
    let file = await ai.files.get({ name: uploadedFile.name });
    while (file.state === 'PROCESSING') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      file = await ai.files.get({ name: uploadedFile.name });
    }

    if (file.state === 'FAILED') {
      throw new Error('PDF processing failed');
    }

    // Extract text using Gemini
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              fileData: {
                mimeType: uploadedFile.mimeType,
                fileUri: uploadedFile.uri,
              },
            },
            {
              text: 'Extract all text from this PDF document. Return the complete text content, preserving structure and formatting as much as possible.',
            },
          ],
        },
      ],
    });

    // Clean up uploaded file
    await ai.files.delete({ name: uploadedFile.name });

    return result.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF.');
  }
};

/**
 * Extract text from a PDF via URL using Gemini API
 */
export const extractTextFromPDFUrl = async (pdfUrl: string): Promise<string> => {
  try {
    console.log('📄 Downloading PDF from URL...');

    // Fetch the PDF
    const response = await fetch(pdfUrl);
    const blob = await response.blob();
    const file = new File([blob], 'document.pdf', { type: 'application/pdf' });

    // Use existing function
    return await extractTextFromPDF(file);
  } catch (error) {
    console.error('Error extracting text from PDF URL:', error);
    throw new Error('Failed to extract text from PDF URL.');
  }
};

/**
 * Analyze PDF visually (design, layout, colors) using Gemini vision
 */
export const analyzePDFVisually = async (pdfUrl: string): Promise<string> => {
  try {
    console.log('🔍 Analyzing PDF visually (design, layout, colors)...');

    // Fetch the PDF
    const response = await fetch(pdfUrl);
    const blob = await response.blob();
    const file = new File([blob], 'document.pdf', { type: 'application/pdf' });

    // Upload file to Gemini
    const uploadedFile = await ai.files.upload({
      file: file,
      config: {
        mimeType: 'application/pdf',
      },
    });

    // Wait for file to be processed
    let processedFile = await ai.files.get({ name: uploadedFile.name });
    while (processedFile.state === 'PROCESSING') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      processedFile = await ai.files.get({ name: uploadedFile.name });
    }

    if (processedFile.state === 'FAILED') {
      throw new Error('PDF processing failed');
    }

    // Analyze visual design using Gemini
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user',
          parts: [
            {
              fileData: {
                mimeType: uploadedFile.mimeType,
                fileUri: uploadedFile.uri,
              },
            },
            {
              text: `Analyze this brand guidelines PDF document VISUALLY and describe:

1. **Color Palette**: List all prominent colors you see (be specific with color names or approximate hex values)
2. **Typography**: Describe font styles, headings, body text styles
3. **Visual Style**: Overall design aesthetic (modern, classic, minimalist, bold, etc.)
4. **Layout Patterns**: How content is structured and presented
5. **Key Design Elements**: Logos, icons, patterns, shapes used throughout
6. **Photography/Imagery Style**: If present, describe the visual approach to images

Provide a concise 4-5 sentence summary that captures the VISUAL brand identity for use in image generation.`,
            },
          ],
        },
      ],
    });

    // Clean up uploaded file
    await ai.files.delete({ name: uploadedFile.name });

    const analysis = result.text;
    console.log('✅ PDF visual analysis complete:', analysis.substring(0, 100) + '...');
    return analysis;

  } catch (error) {
    console.error('❌ Error analyzing PDF visually:', error);
    return '';
  }
};


/**
 * Parse brand guidelines from extracted PDF text using Gemini
 */
export const parseGuidelinesWithAI = async (
  extractedText: string,
  brandName: string
): Promise<ParsedGuidelines> => {
  const prompt = `
You are a brand guidelines parser. Analyze the following text extracted from a brand guidelines PDF for "${brandName}" and extract structured information.

**Extracted Text:**
---
${extractedText}
---

**Your Task:**
Parse and return the following information in JSON format:

{
  "guidelines": {
    "toneOfVoice": "string or null",
    "keyMessaging": "string or null",
    "targetAudience": "string or null",
    "values": "string or null",
    "imageryStyle": "string or null",
    "dosAndDonts": "string or null"
  },
  "colors": {
    "primary": ["#HEX1", "#HEX2"],
    "secondary": ["#HEX3", "#HEX4"],
    "accent": ["#HEX5", "#HEX6"],
    "all": ["all unique hex codes found"]
  },
  "typography": {
    "primary": "Primary font name",
    "secondary": "Secondary font name",
    "details": "Full typography description"
  },
  "logoRules": "Logo usage rules and guidelines"
}

**Instructions:**
1. Extract all hex color codes (e.g., #98151C) and categorize them
2. Identify typography/font information
3. Extract tone of voice, messaging, audience, values, imagery style
4. Find any dos and don'ts or brand rules
5. Extract logo usage rules if present
6. Return ONLY valid JSON, no additional text or markdown
7. Use null for any fields not found in the text

Return the JSON now:
`;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const responseText = result.text.trim();

    // Try to extract JSON from response (in case it's wrapped in markdown)
    let jsonText = responseText;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonText);

    // Fallback to regex-based extraction if AI parsing fails
    if (!parsed.colors || !parsed.colors.all || parsed.colors.all.length === 0) {
      const fallbackParsed = parseGuidelinesFromText(extractedText);
      return {
        guidelines: parsed.guidelines || fallbackParsed.guidelines || {},
        colors: fallbackParsed.colors || { primary: [], secondary: [], accent: [], all: [] },
        typography: parsed.typography || fallbackParsed.typography,
        logoRules: parsed.logoRules || fallbackParsed.logoRules,
      };
    }

    return parsed;
  } catch (error) {
    console.error('Error parsing guidelines with AI, falling back to regex:', error);
    // Fallback to regex-based parsing
    return parseGuidelinesFromText(extractedText);
  }
};


/**
 * Load brand guidelines from Firestore (used in generation)
 */
export const loadBrandGuidelinesFromFirestore = async (
  brandId: string
) => {
  try {
    const guideline = await getBrandGuideline(brandId);
    return guideline;
  } catch (error) {
    console.error(`Error loading guidelines for ${brandId}:`, error);
    return null;
  }
};
