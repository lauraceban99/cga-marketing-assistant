
import React, { useState, useEffect } from 'react';
import type { Brand, TaskType, GeneratedCreative, AdVariation, BrandInstructions } from '../types';
import { generateAsset } from '../services/geminiService';
import { generateAdCopyWithOpenAI } from '../services/openaiService';
import { getApprovedContentForBrand, formatApprovedContentAsInspiration, saveApprovedContent } from '../services/feedbackService';
import { getAssetsByCategory } from '../services/assetService';
import { getBrandInstructions } from '../services/instructionsService';
import LoadingSpinner from './LoadingSpinner';
import BrandAssetInspector from './BrandAssetInspector';

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
                loadingMessage: "Generating 5 ad variations..."
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
  const [editingVariationIndex, setEditingVariationIndex] = useState<number | null>(null);
  const [editedVariation, setEditedVariation] = useState<AdVariation | null>(null);
  const [brandInstructions, setBrandInstructions] = useState<BrandInstructions | null>(null);

  const taskDetails = getTaskDetails(taskType);

  // Load approved content and brand instructions on mount
  useEffect(() => {
    const loadBrandContext = async () => {
      console.log('📚 Loading brand context for', brand.id);

      // Load approved content for inspiration
      const approvedContent = await getApprovedContentForBrand(brand.id, 10);
      const formattedInspiration = formatApprovedContentAsInspiration(approvedContent);
      setInspirationContext(formattedInspiration);
      console.log('✅ Loaded inspiration context:', approvedContent.length, 'examples');

      // Load custom brand instructions
      const instructions = await getBrandInstructions(brand.id);
      setBrandInstructions(instructions);
      console.log('✅ Loaded brand instructions:', instructions ? 'Custom' : 'Default');
    };

    loadBrandContext();
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
          combinedInspiration,
          brandInstructions
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

      // Auto-approve: Save to knowledge base when user selects "Use This One"
      console.log('✅ Auto-approving selected variation...');
      await saveApprovedContent(
        brand.id,
        brand.name,
        selectedVariation,
        prompt,
        'facebook_ad'
      );
      console.log('✅ Saved to knowledge base for future learning');

      // Load brand assets
      console.log('📦 Loading brand assets...');
      const [logos, competitorAds, brandGuidelines] = await Promise.all([
        getAssetsByCategory(brand.id, 'logos'),
        getAssetsByCategory(brand.id, 'competitor-ads'),
        getAssetsByCategory(brand.id, 'brand-guidelines')
      ]);

      console.log(`✅ Loaded ${logos.length} logos, ${competitorAds.length} example ads, ${brandGuidelines.length} brand guidelines`);

      // Analyze brand assets using Gemini vision
      console.log('🔍 Analyzing brand assets with AI vision...');
      const { analyzeBrandAssetImage, extractTextFromPDFUrl, analyzePDFVisually } = await import('../services/geminiService');

      const analyses = {
        logo: '',
        exampleAds: [] as string[],
        guidelinesText: '',
        guidelinesVisual: ''
      };

      // Analyze logo (take first logo if multiple)
      if (logos.length > 0 && logos[0].fileUrl) {
        try {
          analyses.logo = await analyzeBrandAssetImage(logos[0].fileUrl, 'logo');
        } catch (err) {
          console.warn('Could not analyze logo:', err);
        }
      }

      // Analyze example ads (up to 2 for performance)
      const adsToAnalyze = competitorAds.slice(0, 2).filter(ad => ad.fileUrl && ad.fileType.startsWith('image/'));
      if (adsToAnalyze.length > 0) {
        analyses.exampleAds = await Promise.all(
          adsToAnalyze.map(ad => analyzeBrandAssetImage(ad.fileUrl, 'example-ad'))
        );
      }

      // Extract text and analyze PDFs visually (first brand guidelines PDF)
      const guidelinePDF = brandGuidelines.find(asset => asset.fileType === 'application/pdf');
      if (guidelinePDF && guidelinePDF.fileUrl) {
        try {
          console.log('📄 Analyzing brand guidelines PDF...');
          const [textContent, visualAnalysis] = await Promise.all([
            extractTextFromPDFUrl(guidelinePDF.fileUrl).catch(err => {
              console.warn('PDF text extraction failed:', err);
              return '';
            }),
            analyzePDFVisually(guidelinePDF.fileUrl).catch(err => {
              console.warn('PDF visual analysis failed:', err);
              return '';
            })
          ]);
          analyses.guidelinesText = textContent;
          analyses.guidelinesVisual = visualAnalysis;
          console.log(`✅ Extracted ${textContent.length} chars of text from guidelines PDF`);
        } catch (err) {
          console.warn('Could not analyze guidelines PDF:', err);
        }
      }

      console.log('✅ Asset analysis complete');

      // Generate image using Gemini for the selected variation
      console.log('🖼️ Generating image for selected variation...');

      // Import generateImages from geminiService
      const { generateImages } = await import('../services/geminiService');

      // Build enhanced image prompt with actual brand asset analysis
      let imagePrompt = `Generate a square 1024x1024 photorealistic advertisement image for ${brand.name}.

**THE AD MESSAGE (PRIMARY FOCUS):**
Headline: "${selectedVariation.headline}"
Primary Text: "${selectedVariation.primaryText}"
Call to Action: "${selectedVariation.cta}"

The image MUST visually support and enhance this specific message. The scene, composition, and mood should directly relate to the headline and message.

**BRAND IDENTITY (CRITICAL - MUST FOLLOW):**`;

      // Add actual logo analysis
      if (analyses.logo) {
        imagePrompt += `\n\n**BRAND LOGO (MUST INCLUDE):**\n${analyses.logo}`;
        imagePrompt += `\n- The logo must be visible and integrated into the design`;
        if (brand.guidelines.logoRules) {
          imagePrompt += `\n- Logo rules: ${brand.guidelines.logoRules}`;
        }
      }

      // Add PDF brand guidelines visual analysis
      if (analyses.guidelinesVisual) {
        imagePrompt += `\n\n**BRAND GUIDELINES (FROM PDF - CRITICAL):**\n${analyses.guidelinesVisual}`;
        imagePrompt += `\n- Follow this visual identity precisely`;
      }

      // Add color palette
      if (brand.guidelines.palette) {
        imagePrompt += `\n\n**COLOR PALETTE:**`;
        imagePrompt += `\n- STRICTLY use these colors: ${brand.guidelines.palette}`;
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

**Visual Requirements:**
- Modern, clean composition with bold focal point
- High contrast and clutter-free background
- Professional photography style matching brand guidelines
- 1:1 square aspect ratio (1024x1024px)
- Brand-consistent visual language

**Content:**
${brand.guidelines.imageryStyle || 'Feature authentic-looking students aged 10-18 engaged in learning'}
- Show diverse teenagers engaged in learning or collaborative activities
- Aspirational and empowering atmosphere
- Natural, authentic photography (not stock photo aesthetic)

**Text Overlay:**
- Include headline text overlay: "${selectedVariation.headline}"
- Use modern, bold typography that matches brand identity
- Clearly readable and well-positioned
- Typography should complement the brand fonts if specified

**Critical Brand Adherence:**
${brand.guidelines.dosAndDonts || '- Maintain professional, authentic brand image'}
- Ensure all brand colors are used prominently
- Logo must be visible and properly displayed
- Visual style must match brand identity

Generate one high-quality, ON-BRAND square advertisement image matching these specifications.`;

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

  const handleStartEdit = (index: number) => {
    setEditingVariationIndex(index);
    setEditedVariation({ ...variations[index] });
  };

  const handleCancelEdit = () => {
    setEditingVariationIndex(null);
    setEditedVariation(null);
  };

  const handleSaveEdit = () => {
    if (editingVariationIndex !== null && editedVariation) {
      const newVariations = [...variations];
      newVariations[editingVariationIndex] = editedVariation;
      setVariations(newVariations);
      setEditingVariationIndex(null);
      setEditedVariation(null);
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
        <p className="text-gray-400 mb-8">Edit if needed, then click "Use This One" to generate images. Selected ads are automatically saved to train future generations.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {variations.map((variation, index) => {
            const isEditing = editingVariationIndex === index;
            const displayVariation = isEditing ? editedVariation! : variation;

            return (
              <div
                key={index}
                className={`bg-gray-800 rounded-lg border p-6 transition-all duration-300 ${
                  isEditing ? 'border-indigo-500 shadow-lg' : 'border-gray-700 hover:border-brand-primary'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-brand-primary">Variation {index + 1}</span>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <button
                        onClick={() => handleStartEdit(index)}
                        className="text-xs text-gray-400 hover:text-blue-400 transition-colors"
                        title="Edit this variation"
                      >
                        ✏️ Edit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="text-xs text-green-400 hover:text-green-300 transition-colors"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          ✕ Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Headline ({displayVariation.headline.length} chars)</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayVariation.headline}
                        onChange={(e) => setEditedVariation({ ...displayVariation, headline: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 text-lg font-bold"
                        maxLength={40}
                      />
                    ) : (
                      <p className="text-lg font-bold text-white">{displayVariation.headline}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Primary Text ({displayVariation.primaryText.split(/\s+/).length} words)</p>
                    {isEditing ? (
                      <textarea
                        value={displayVariation.primaryText}
                        onChange={(e) => setEditedVariation({ ...displayVariation, primaryText: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 text-sm leading-relaxed"
                        rows={5}
                      />
                    ) : (
                      <p className="text-sm text-gray-300 leading-relaxed">{displayVariation.primaryText}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">CTA ({displayVariation.cta.split(/\s+/).length} words)</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayVariation.cta}
                        onChange={(e) => setEditedVariation({ ...displayVariation, cta: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 font-semibold"
                      />
                    ) : (
                      <p className="text-md font-semibold text-brand-primary">{displayVariation.cta}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {displayVariation.keywords.map((keyword, i) => (
                        <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => handleSelectVariation(index)}
                    className="w-full py-2 px-4 bg-brand-primary text-white font-semibold rounded-md hover:bg-red-500 transition-colors"
                    title="This will auto-approve and save to knowledge base"
                  >
                    ✓ Use This One
                  </button>
                )}
              </div>
            );
          })}
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

      {/* Brand Asset Inspector */}
      <BrandAssetInspector brand={brand} />

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
