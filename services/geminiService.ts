
import { GoogleGenAI } from "@google/genai";
import type { Brand, TaskType, ParsedGuidelines } from '../types';
import { getBrandGuideline } from './firebaseService';
import { parseGuidelinesFromText } from './guidelinesExtractor';

if (!import.meta.env.VITE_GEMINI_API_KEY) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set. Please set it to use the Gemini API.");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string });

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

const generateImages = async (prompt: string, count: number): Promise<string[]> => {
    // Check if image generation is disabled via env var
    const imageGenDisabled = import.meta.env.VITE_DISABLE_IMAGE_GENERATION === 'true';

    if (imageGenDisabled) {
        console.log('ℹ️ Image generation is disabled via VITE_DISABLE_IMAGE_GENERATION env var');
        return [];
    }

    try {
        console.log('🖼️ Attempting image generation...');
        console.log('   Prompt:', prompt.substring(0, 200) + '...');
        console.log('   Count:', count);

        // Try Imagen first (requires Vertex AI / specific API access)
        try {
            const response = await ai.models.generateImages({
                model: 'imagen-3.0-generate-001', // Try imagen-3 instead of 4
                prompt: prompt,
                config: {
                    numberOfImages: count,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                },
            });

            console.log('✅ Image generation successful with Imagen!');
            console.log('   Generated:', response.generatedImages.length, 'images');

            return response.generatedImages.map(img => img.image.imageBytes);
        } catch (imagenError: any) {
            console.warn('⚠️ Imagen not available:', imagenError?.message);

            // Check if error indicates Imagen is not enabled
            if (imagenError?.message?.includes('not found') ||
                imagenError?.message?.includes('not enabled') ||
                imagenError?.message?.includes('permission')) {
                console.log('💡 Imagen requires Vertex AI setup. Instructions:');
                console.log('   1. Go to https://console.cloud.google.com/vertex-ai');
                console.log('   2. Enable Vertex AI API');
                console.log('   3. Enable Imagen API');
                console.log('   OR set VITE_DISABLE_IMAGE_GENERATION=true to skip images');
            }

            throw imagenError;
        }
    } catch (error: any) {
        console.error("❌ Image generation failed:", error);
        console.error("   Error name:", error?.name);
        console.error("   Error message:", error?.message);
        console.error("   Full error object:", JSON.stringify(error, null, 2));

        // Return helpful error message
        const errorMessage = error?.message || error?.toString() || "Unknown error";
        throw new Error(`Image generation not available. ${errorMessage}. To disable images, set VITE_DISABLE_IMAGE_GENERATION=true in your .env file.`);
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

                **CRITICAL REQUIREMENTS - DO NOT EXCEED THESE LIMITS:**
                1. **Headline:** MAXIMUM 40 characters (including spaces)
                   - Emotional hook, NOT literal description
                   - Examples: "Is Your Child Ready for Tomorrow?", "Education That Adapts to Them"
                   - NO exclamation marks or hashtags

                2. **Primary Text:** STRICT 90-160 word limit
                   - Start with an engaging hook: "What if...", "Imagine...", "Is your child..."
                   - Focus on parent emotions: confidence, belonging, future readiness
                   - Conversational, warm, human tone
                   - NO corporate jargon like "innovative", "world-class", "cutting-edge"
                   - NO exclamation marks or hashtags
                   - Talk TO parents, not AT them
                   - Use natural language, like speaking to a friend

                3. **Call to Action:** 3-5 words maximum
                   - Examples: "Join Our Open Day", "Register Today", "Learn More Now"

                **TONE REQUIREMENTS:**
                - Warm, conversational, parent-to-parent
                - Focus on transformation and belonging
                - Use "you" and "your child"
                - NO marketing speak or buzzwords

                **FORMAT (use exactly this structure):**
                **Headline:** [Max 40 chars]

                **Primary Text:** [90-160 words]

                **Call to Action:** [3-5 words]

                **VALIDATION:** After writing, COUNT your characters and words. If headline exceeds 40 characters or primary text exceeds 160 words, REWRITE to fit limits. This is NON-NEGOTIABLE.
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
 * Validate and parse ad copy to ensure it meets Facebook specs
 */
const validateAndParseAdCopy = (text: string): { isValid: boolean; parsed: any; errors: string[] } => {
    const errors: string[] = [];

    // Extract sections using regex
    const headlineMatch = text.match(/\*\*Headline:\*\*\s*(.+?)(?:\n|$)/i);
    const primaryMatch = text.match(/\*\*Primary Text:\*\*\s*([\s\S]+?)(?:\n\*\*Call to Action:\*\*|\*\*CTA:\*\*|$)/i);
    const ctaMatch = text.match(/\*\*(?:Call to Action|CTA):\*\*\s*(.+?)(?:\n|$)/i);

    const headline = headlineMatch ? headlineMatch[1].trim() : '';
    const primaryText = primaryMatch ? primaryMatch[1].trim() : '';
    const cta = ctaMatch ? ctaMatch[1].trim() : '';

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
        const validation = validateAndParseAdCopy(text);

        if (!validation.isValid) {
            console.warn('⚠️ Generated ad copy does not meet specs. Errors:', validation.errors);
            console.log('🔄 Attempting to regenerate with stricter constraints...');

            // Try one more time with even stricter instructions
            const retryPrompt = prompt + `\n\n**CRITICAL:** The previous attempt failed validation. ${validation.errors.join('. ')}. You MUST fix these issues. Generate again with STRICT adherence to limits.`;
            text = await generateText(retryPrompt);

            const retryValidation = validateAndParseAdCopy(text);
            if (!retryValidation.isValid) {
                console.error('❌ Second attempt still failed:', retryValidation.errors);
                // Continue anyway but log the issue
            } else {
                console.log('✅ Retry successful! Ad copy now meets specs.');
            }
        } else {
            console.log('✅ Ad copy meets Facebook specs!');
        }
    }

    if (taskType === 'ad') {
        const imagePrompt = `
            Create a professional, photorealistic ad image for the brand ${brand.name}. The ad should visually represent this copy: "${text}".

            **CRITICAL VISUAL GUIDELINES:**
            - **Imagery Style:** ${brand.guidelines.imageryStyle}.
            ${brand.guidelines.palette ? `- **Color Palette:** The brand's primary colors are ${brand.guidelines.palette}. Use these colors prominently and tastefully.` : ''}
            - **Atmosphere:** The image should feel aspirational, empowering, and professional.
            - **Content:** Feature authentic-looking students. Avoid generic stock photos.
            - **Adherence:** ${brand.guidelines.dosAndDonts || 'Ensure high quality and brand consistency.'}

            **DO NOT include any text, words, or logos in the image itself.** Generate a clean, powerful visual.
        `;
        const images = await generateImages(imagePrompt, 1);
        return { text, images };
    }

    return { text, images: [] };
};

export const refineCreativeText = async (brand: Brand, originalText: string, refinementPrompt: string): Promise<string> => {
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
        If the original was a structured ad (Headline, Primary Text, CTA), maintain that structure.
        Provide only the revised copy, with no extra commentary.
    `;
    return generateText(prompt);
};


export const regenerateImages = async (
  brand: Brand,
  text: string,
  refinement: string,
  count: number,
): Promise<string[]> => {
    const imagePrompt = `
    An ad creative for ${brand.name} uses the copy: "${text}".
    The initial image needs refinement based on this feedback: "${refinement}".

    **Visual Style Guidelines from ${brand.name}:**
    - Imagery Style: ${brand.guidelines.imageryStyle}
    ${brand.guidelines.palette ? `- Color Palette: The brand uses these colors: ${brand.guidelines.palette}` : ''}
    ${brand.guidelines.dosAndDonts ? `- Adherence: ${brand.guidelines.dosAndDonts}` : ''}

    Based on the original brief and the new feedback, generate ${count} new, high-quality, photorealistic image variations. Do not include any text or logos in the image.
  `;
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
