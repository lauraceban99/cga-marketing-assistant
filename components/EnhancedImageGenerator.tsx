import React, { useState } from 'react';
import type { Brand, Theme, AdCopy } from '../types';
import { generateImageVariations, estimateBatchTime } from '../services/batchGeneration';
import { generateAdImageWithEnhancedPrompt } from '../services/geminiService';

interface EnhancedImageGeneratorProps {
  brand: Brand;
  adCopy: AdCopy;
  userPrompt?: string;
  onImagesGenerated: (images: string[]) => void;
}

const EnhancedImageGenerator: React.FC<EnhancedImageGeneratorProps> = ({
  brand,
  adCopy,
  userPrompt = '',
  onImagesGenerated
}) => {
  const [useEnhanced, setUseEnhanced] = useState(true);
  const [generateMultiple, setGenerateMultiple] = useState(false);
  const [variationCount, setVariationCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState('');

  // Theme extraction from user prompt (simplified)
  const extractTheme = (): Theme => {
    const promptLower = userPrompt.toLowerCase();

    // Extract theme details from user prompt
    let themeName = 'Marketing Campaign';
    let audience = 'target audience';
    let location = 'general';
    let adFocus = 'engagement';
    let audiencePersona = 'interested prospects';

    // Parse theme name
    if (promptLower.includes('open day')) {
      themeName = 'Open Day Campaign';
      adFocus = 'excitement and possibility';
      audiencePersona = 'prospective students and parents visiting campus';
    } else if (promptLower.includes('results') || promptLower.includes('achievement')) {
      themeName = 'Achievement Results Campaign';
      adFocus = 'pride and success';
      audiencePersona = 'students celebrating academic achievements';
    } else if (promptLower.includes('university') || promptLower.includes('college')) {
      themeName = 'University Preparation Campaign';
      adFocus = 'ambition and preparation';
      audiencePersona = 'high-achieving students preparing for university';
    }

    // Parse audience
    if (promptLower.includes('parent')) {
      audience = 'parents';
      audiencePersona = 'parents of school-age children';
    } else if (promptLower.includes('student')) {
      audience = 'students';
      audiencePersona = 'prospective students';
    }

    // Parse location
    if (promptLower.includes('auckland') || promptLower.includes('nz') || promptLower.includes('new zealand')) {
      location = 'New Zealand';
    } else if (promptLower.includes('australia')) {
      location = 'Australia';
    } else if (promptLower.includes('online')) {
      location = 'Online/Global';
    }

    return {
      brand,
      themeName,
      audience,
      location,
      adFocus,
      audiencePersona
    };
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setProgress({ current: 0, total: generateMultiple ? variationCount : 1 });

    try {
      console.log('🚀 Starting enhanced image generation');
      console.log('   Enhanced prompts:', useEnhanced);
      console.log('   Multiple variations:', generateMultiple);
      console.log('   Count:', generateMultiple ? variationCount : 1);

      let images: string[] = [];

      if (useEnhanced) {
        const theme = extractTheme();
        console.log('📝 Extracted theme:', theme);

        if (generateMultiple) {
          // Use batch generation with delays
          images = await generateImageVariations(
            theme,
            adCopy,
            brand,
            variationCount,
            (current, total) => {
              setProgress({ current, total });
            }
          );
        } else {
          // Generate single image with enhanced prompt
          images = await generateAdImageWithEnhancedPrompt(theme, adCopy, brand, 1);
          setProgress({ current: 1, total: 1 });
        }
      } else {
        // Fallback to standard generation
        console.log('Using standard generation');
        // You can call the original function here if needed
      }

      if (images.length > 0) {
        console.log(`✅ Successfully generated ${images.length} image(s)`);
        onImagesGenerated(images);
      } else {
        throw new Error('No images were generated');
      }

    } catch (err) {
      console.error('❌ Image generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate images');
    } finally {
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const estimatedTime = generateMultiple ? estimateBatchTime(variationCount) : 15;

  return (
    <div className="bg-gray-700 p-6 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-white">🎨 Enhanced Image Generation</h3>

      <div className="space-y-3">
        {/* Enhanced Prompts Toggle */}
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useEnhanced}
            onChange={(e) => setUseEnhanced(e.target.checked)}
            className="w-5 h-5 text-brand-primary bg-gray-600 border-gray-500 rounded focus:ring-brand-primary focus:ring-2"
            disabled={isGenerating}
          />
          <div>
            <span className="text-white font-medium">Use Enhanced Prompts</span>
            <p className="text-xs text-gray-400">
              Detailed, structured prompts for 85-90% production-ready ads
            </p>
          </div>
        </label>

        {/* Multiple Variations Toggle */}
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={generateMultiple}
            onChange={(e) => setGenerateMultiple(e.target.checked)}
            className="w-5 h-5 text-brand-primary bg-gray-600 border-gray-500 rounded focus:ring-brand-primary focus:ring-2"
            disabled={isGenerating || !useEnhanced}
          />
          <div>
            <span className="text-white font-medium">Generate Multiple Variations</span>
            <p className="text-xs text-gray-400">
              Create multiple variations with slight differences
            </p>
          </div>
        </label>

        {/* Variation Count Selector */}
        {generateMultiple && (
          <div className="ml-8 space-y-2">
            <label className="text-sm text-gray-300">Number of variations:</label>
            <select
              value={variationCount}
              onChange={(e) => setVariationCount(Number(e.target.value))}
              className="w-full bg-gray-600 border border-gray-500 text-white rounded-md p-2"
              disabled={isGenerating}
            >
              <option value={2}>2 variations</option>
              <option value={3}>3 variations</option>
              <option value={5}>5 variations</option>
            </select>
            <p className="text-xs text-gray-400">
              Estimated time: {estimatedTime} seconds
            </p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 px-4 bg-brand-primary text-white font-semibold rounded-md hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              Generating... {progress.current > 0 && `(${progress.current}/${progress.total})`}
            </>
          ) : (
            <>
              {generateMultiple
                ? `🎨 Generate ${variationCount} Enhanced Variations`
                : '🎨 Generate Enhanced Image'}
            </>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded-md">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-md">
          <p className="text-xs text-blue-300">
            <strong>💡 Enhanced Prompts include:</strong>
            <br />
            • Detailed scene composition and setting
            <br />
            • Specific subject guidance and emotions
            <br />
            • Professional photography style requirements
            <br />
            • Brand-aligned visual specifications
            <br />
            • Production-ready quality standards
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedImageGenerator;
