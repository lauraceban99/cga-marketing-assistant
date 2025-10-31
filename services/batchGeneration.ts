import type { Theme, AdCopy, Brand } from '../types';
import { buildEnhancedImagePrompt, buildVariationPrompt } from './imagePromptBuilder';
import { generateImages } from './geminiService';

/**
 * Generate multiple image variations with enhanced prompts
 * Includes delays to avoid rate limits
 */
export async function generateImageVariations(
  theme: Theme,
  adCopy: AdCopy,
  brand: Brand,
  count: number = 3,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {

  const variations: string[] = [];

  console.log(`🎨 Starting batch generation of ${count} variations`);

  // Build base enhanced prompt
  const basePrompt = buildEnhancedImagePrompt(theme, adCopy, brand);

  for (let i = 0; i < count; i++) {
    console.log(`🎨 Generating variation ${i + 1}/${count}`);

    if (onProgress) {
      onProgress(i + 1, count);
    }

    try {
      // Add variation to prompt
      const variedPrompt = buildVariationPrompt(basePrompt, i);

      console.log(`   Prompt length: ${variedPrompt.length} characters`);
      console.log(`   Variation adjustment: ${variedPrompt.substring(variedPrompt.lastIndexOf('VARIATION'), variedPrompt.length).substring(0, 100)}...`);

      // Generate single image with varied prompt
      const images = await generateImages(variedPrompt, 1);

      if (images && images.length > 0) {
        variations.push(images[0]);
        console.log(`✅ Variation ${i + 1} generated successfully`);
      } else {
        console.warn(`⚠️ Variation ${i + 1} returned no images`);
      }

    } catch (error) {
      console.error(`❌ Error generating variation ${i + 1}:`, error);
      // Continue with remaining variations even if one fails
    }

    // Add delay between requests to avoid rate limits
    // (Based on Reddit examples: 2 seconds between requests)
    if (i < count - 1) {
      const delayMs = 2000;
      console.log(`   ⏳ Waiting ${delayMs}ms before next generation...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.log(`📊 Batch generation complete: ${variations.length}/${count} successful`);

  return variations;
}

/**
 * Generate variations from simplified prompt (fallback when Theme is not available)
 */
export async function generateSimpleVariations(
  prompt: string,
  count: number = 3,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {

  const variations: string[] = [];

  console.log(`🎨 Starting simple batch generation of ${count} variations`);

  for (let i = 0; i < count; i++) {
    console.log(`🎨 Generating variation ${i + 1}/${count}`);

    if (onProgress) {
      onProgress(i + 1, count);
    }

    try {
      // Add variation to prompt
      const variedPrompt = buildVariationPrompt(prompt, i);

      // Generate single image with varied prompt
      const images = await generateImages(variedPrompt, 1);

      if (images && images.length > 0) {
        variations.push(images[0]);
        console.log(`✅ Variation ${i + 1} generated successfully`);
      } else {
        console.warn(`⚠️ Variation ${i + 1} returned no images`);
      }

    } catch (error) {
      console.error(`❌ Error generating variation ${i + 1}:`, error);
    }

    // Add delay between requests
    if (i < count - 1) {
      const delayMs = 2000;
      console.log(`   ⏳ Waiting ${delayMs}ms before next generation...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.log(`📊 Simple batch generation complete: ${variations.length}/${count} successful`);

  return variations;
}

/**
 * Estimate time for batch generation (for UI display)
 */
export function estimateBatchTime(count: number): number {
  // Average generation time per image + delay
  const avgGenerationTime = 15000; // 15 seconds per image (conservative estimate)
  const delayBetweenRequests = 2000; // 2 seconds
  const totalTime = (avgGenerationTime * count) + (delayBetweenRequests * (count - 1));

  return Math.ceil(totalTime / 1000); // Return in seconds
}
