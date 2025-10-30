
import React, { useState, useEffect } from 'react';
import type { Brand, TaskType, GeneratedCreative, AdVariation } from '../types';
import { generateAsset } from '../services/geminiService';
import { generateAdCopyWithOpenAI } from '../services/openaiService';
import { getApprovedContentForBrand, formatApprovedContentAsInspiration, saveApprovedContent } from '../services/feedbackService';
import LoadingSpinner from './LoadingSpinner';

interface GeneratorProps {
  brand: Brand;
  taskType: TaskType;
  onAssetGenerated: (creative: GeneratedCreative, prompt: string) => void;
  onBack: () => void;
}

const getTaskDetails = (taskType: TaskType) => {
    switch(taskType) {
        case 'ad':
            return {
                title: 'Describe Your Ad Creative',
                placeholder: "e.g., Create ads for our Auckland open day on Sept 18. Target parents looking for flexible online high school options.",
                loadingMessage: "Generating 5 ad variations with OpenAI..."
            };
        case 'copy':
            return {
                title: 'Describe the Text Needed',
                placeholder: "e.g., A short, inspiring paragraph for the introduction of the Mt Hobson prospectus. It should feel nurturing and focus on personalized learning.",
                loadingMessage: "Crafting your copy..."
            };
        case 'email':
            return {
                title: 'Describe the Email Campaign',
                placeholder: "e.g., A 3-email welcome sequence for new EMI leads. Start by introducing our philosophy, then show a project example, and finally invite them to a trial class. The tone should be playful and exciting.",
                loadingMessage: "Writing your email sequence..."
            };
        default:
             return {
                title: 'Describe Your Request',
                placeholder: "Describe what you'd like to create...",
                loadingMessage: "Generating asset..."
            };
    }
}

const Generator: React.FC<GeneratorProps> = ({ brand, taskType, onAssetGenerated, onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [variations, setVariations] = useState<AdVariation[]>([]);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<number | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [inspirationContext, setInspirationContext] = useState<string>('');

  const taskDetails = getTaskDetails(taskType);

  // Load approved content for inspiration on mount
  useEffect(() => {
    const loadInspirationContext = async () => {
      console.log('📚 Loading approved content for brand', brand.id);
      const approvedContent = await getApprovedContentForBrand(brand.id, 10);
      const formattedInspiration = formatApprovedContentAsInspiration(approvedContent);
      setInspirationContext(formattedInspiration);
      console.log('✅ Loaded inspiration context:', approvedContent.length, 'examples');
    };

    loadInspirationContext();
  }, [brand.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setVariations([]);
    setSelectedVariationIndex(null);

    try {
      // For ads, use OpenAI to generate variations
      if (taskType === 'ad') {
        console.log('🚀 Generating ad variations with OpenAI...');

        // Combine brand inspiration with approved content
        const combinedInspiration = [
          ...(brand.inspiration || []),
          inspirationContext
        ].join('\n\n');

        const generatedVariations = await generateAdCopyWithOpenAI(
          prompt,
          brand,
          combinedInspiration
        );

        setVariations(generatedVariations);
        setIsLoading(false);

        console.log(`✅ Generated ${generatedVariations.length} variations. Awaiting user selection...`);
      } else {
        // For other task types, use legacy Gemini flow
        const result = await generateAsset(brand, taskType, prompt);
        onAssetGenerated(result, prompt);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const handleSelectVariation = async (index: number) => {
    console.log(`🎯 User selected variation ${index + 1}`);
    setSelectedVariationIndex(index);
    setIsGeneratingImage(true);
    setError('');

    try {
      const selectedVariation = variations[index];

      // Generate image using Gemini for the selected variation
      console.log('🖼️ Generating image for selected variation...');

      // Import generateImages from geminiService
      const { generateImages } = await import('../services/geminiService');

      // Build image prompt from the selected headline
      const imagePrompt = `Generate a square 1024x1024 photorealistic advertisement image for ${brand.name}.

**Ad Headline:** ${selectedVariation.headline}

**Visual Requirements:**
- Modern, clean composition with bold focal point
- High contrast and clutter-free background
- Professional photography style
- 1:1 square aspect ratio

**Content:**
${brand.guidelines.imageryStyle || 'Feature authentic-looking students aged 10-18 engaged in learning'}
${brand.guidelines.palette ? `- Use color palette: ${brand.guidelines.palette}` : ''}

**Text Overlay:**
- Include brief text overlay: "${selectedVariation.headline}"
- Modern bold typography, clearly readable

Generate one high-quality square advertisement image matching these specifications.`;

      const images = await generateImages(imagePrompt, 1);

      console.log(`✅ Generated ${images.length} image(s) for variation`);

      // Create GeneratedCreative with selected variation
      const creative: GeneratedCreative = {
        text: `**Headline:** ${selectedVariation.headline}\n\n**Primary Text:** ${selectedVariation.primaryText}\n\n**Call to Action:** ${selectedVariation.cta}`,
        images,
        variations,
        selectedVariation
      };

      onAssetGenerated(creative, prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image for this variation.');
      setIsGeneratingImage(false);
    }
  };

  const handleApproveVariation = async (index: number) => {
    console.log(`✅ User approved variation ${index + 1}`);

    try {
      const variation = variations[index];
      await saveApprovedContent(
        brand.id,
        brand.name,
        variation,
        prompt,
        'facebook_ad'
      );

      console.log('✅ Saved approved variation to knowledge base');

      // Show success message briefly
      alert('Saved to knowledge base! Future ads will learn from this example.');
    } catch (err) {
      console.error('Failed to save approved content:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-white mb-4">{taskDetails.loadingMessage}</h2>
        <p className="text-gray-400 mb-8">The AI is warming up. This may take a moment.</p>
        <LoadingSpinner />
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>
    );
  }

  if (isGeneratingImage) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-white mb-4">Generating image for your selected variation...</h2>
        <p className="text-gray-400 mb-8">Creating the perfect visual to match your ad copy.</p>
        <LoadingSpinner />
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>
    );
  }

  // Show variations if generated
  if (variations.length > 0) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <button onClick={() => setVariations([])} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
          Start Over
        </button>

        <h2 className="text-3xl font-bold text-white mb-2">Select Your Favorite Variation</h2>
        <p className="text-gray-400 mb-8">Choose the ad copy you like best, then we'll generate the perfect image for it.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {variations.map((variation, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-brand-primary transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-brand-primary">Variation {index + 1}</span>
                <button
                  onClick={() => handleApproveVariation(index)}
                  className="text-xs text-gray-400 hover:text-green-400 transition-colors"
                  title="Save to knowledge base"
                >
                  ⭐ Approve
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Headline ({variation.headline.length} chars)</p>
                  <p className="text-lg font-bold text-white">{variation.headline}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Primary Text ({variation.primaryText.split(/\s+/).length} words)</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{variation.primaryText}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">CTA ({variation.cta.split(/\s+/).length} words)</p>
                  <p className="text-md font-semibold text-brand-primary">{variation.cta}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Keywords</p>
                  <div className="flex flex-wrap gap-1">
                    {variation.keywords.map((keyword, i) => (
                      <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectVariation(index)}
                className="w-full py-2 px-4 bg-brand-primary text-white font-semibold rounded-md hover:bg-red-500 transition-colors"
              >
                Use This One
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
        Back to Task Selection
      </button>

      <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-semibold text-white mb-6">{taskDetails.title}</h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Your Request</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-brand-primary text-lg leading-relaxed"
              placeholder={taskDetails.placeholder}
              required
            />
             <p className="text-xs text-gray-500 mt-2">Be as descriptive as possible. The more detail you provide, the better the result will be.</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700">
          <button type="submit" className="w-full py-3 px-6 bg-brand-primary text-white font-semibold rounded-md hover:bg-red-500 transition-colors">
            {taskType === 'ad' ? 'Generate 5 Variations' : 'Generate Asset'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Generator;
