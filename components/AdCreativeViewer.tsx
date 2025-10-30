
import React, { useState, useMemo } from 'react';
import type { Brand, GeneratedCreative, TaskType, AdVariation } from '../types';
import { regenerateImages, refineCreativeText, generateAsset } from '../services/geminiService';
import { generateAdCopyWithOpenAI } from '../services/openaiService';
import { getApprovedContentForBrand, formatApprovedContentAsInspiration, saveApprovedContent } from '../services/feedbackService';
import LoadingSpinner from './LoadingSpinner';

interface ResultsViewerProps {
  brand: Brand;
  initialCreative: GeneratedCreative;
  initialPrompt: string;
  onBack: () => void;
  taskType: TaskType;
  onRegenerate: (creative: GeneratedCreative, prompt: string) => void;
}

const ResultsViewer: React.FC<ResultsViewerProps> = ({ brand, initialCreative, initialPrompt, onBack, taskType, onRegenerate }) => {
  const [creative, setCreative] = useState<GeneratedCreative>(initialCreative);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageCount, setImageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefiningText, setIsRefiningText] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [moreVariationsCount, setMoreVariationsCount] = useState(3);
  const [isGeneratingMoreVariations, setIsGeneratingMoreVariations] = useState(false);
  const [showApprovedMessage, setShowApprovedMessage] = useState(false);

  const handleTryAgain = async () => {
      setIsLoading(true);
      setError('');
      try {
          const result = await generateAsset(brand, taskType, initialPrompt);
          onRegenerate(result, initialPrompt);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
          setIsLoading(false);
      }
  };

  const handleRefineText = async () => {
    if (!refinementPrompt.trim()) return;
    setIsRefiningText(true);
    setError('');
    try {
      const newText = await refineCreativeText(brand, creative.text, refinementPrompt);
      setCreative(prev => ({ ...prev, text: newText }));
      setRefinementPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsRefiningText(false);
    }
  };

  const handleRegenerateImages = async () => {
    setIsLoading(true);
    setError('');
    try {
        const newImages = await regenerateImages(brand, creative.text, imagePrompt, imageCount);
        setCreative(prev => ({...prev, images: newImages}));
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(creative.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = (imageBase64: string, index: number) => {
    // Convert base64 to blob
    const byteString = atob(imageBase64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/jpeg' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${brand.name.replace(/\s+/g, '-')}-ad-image-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllImages = () => {
    if (creative.images && creative.images.length > 0) {
      creative.images.forEach((img, index) => {
        setTimeout(() => handleDownloadImage(img, index), index * 100);
      });
    }
  };

  const handleApproveContent = async () => {
    if (!creative.selectedVariation) return;

    try {
      await saveApprovedContent(
        brand.id,
        brand.name,
        creative.selectedVariation,
        initialPrompt,
        'facebook_ad'
      );

      console.log('✅ Saved approved content to knowledge base');
      setShowApprovedMessage(true);
      setTimeout(() => setShowApprovedMessage(false), 3000);
    } catch (err) {
      console.error('Failed to save approved content:', err);
      setError('Failed to save approved content');
    }
  };

  const handleGenerateMoreVariations = async () => {
    if (!creative.selectedVariation) return;

    setIsGeneratingMoreVariations(true);
    setError('');

    try {
      // Load approved content for inspiration
      const approvedContent = await getApprovedContentForBrand(brand.id, 10);
      const formattedInspiration = formatApprovedContentAsInspiration(approvedContent);

      // Combine with brand inspiration
      const combinedInspiration = [
        ...(brand.inspiration || []),
        formattedInspiration,
        // Add current variation as primary inspiration
        `**Most Recent Approved Example:**
Headline: ${creative.selectedVariation.headline}
Primary Text: ${creative.selectedVariation.primaryText}
CTA: ${creative.selectedVariation.cta}

Generate variations that are VERY SIMILAR to this approved example in style, tone, and structure.`
      ].join('\n\n');

      // Generate more variations based on the approved one
      const newVariations = await generateAdCopyWithOpenAI(
        `Generate ${moreVariationsCount} more ad variations similar to the approved example. ${initialPrompt}`,
        brand,
        combinedInspiration
      );

      // Update creative with new variations
      setCreative(prev => ({
        ...prev,
        variations: [...(prev.variations || []), ...newVariations]
      }));

      console.log(`✅ Generated ${newVariations.length} more variations`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate more variations');
    } finally {
      setIsGeneratingMoreVariations(false);
    }
  };
  
  const parsedAdCopy = useMemo(() => {
    if (taskType !== 'ad') return null;
    const parts = { headline: '', primaryText: '', cta: '' };
    const text = creative.text;
    
    const headlineMatch = text.match(/\*\*Headline:\*\*\s*([\s\S]*?)(?=\*\*Primary Text:\*\*|\*\*Call to Action:\*\*|$)/);
    const primaryTextMatch = text.match(/\*\*Primary Text:\*\*\s*([\s\S]*?)(?=\*\*Call to Action:\*\*|$)/);
    const ctaMatch = text.match(/\*\*Call to Action:\*\*\s*([\s\S]*?$)/);

    if (headlineMatch) parts.headline = headlineMatch[1].trim();
    if (primaryTextMatch) parts.primaryText = primaryTextMatch[1].trim();
    if (ctaMatch) parts.cta = ctaMatch[1].trim();
    
    // Fallback for non-structured text
    if (!parts.headline && !parts.primaryText && !parts.cta) return null;

    return parts;
  }, [creative.text, taskType]);

  const hasImages = creative.images && creative.images.length > 0;

  if (isLoading) {
    return (
        <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-white mb-4">Generating a new version...</h2>
            <p className="text-gray-400 mb-8">Please wait while the AI works its magic.</p>
            <LoadingSpinner />
            {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
        Back to Tasks
      </button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">Your Asset is Ready!</h2>
        <p className="text-gray-400 mt-1">Review your generated content for <span className="font-semibold text-gray-300">{brand.name}</span>.</p>
      </div>

      <div className={`grid grid-cols-1 ${taskType === 'ad' ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-8`}>
        {/* Copy Section */}
        <div className={`p-6 bg-gray-800 rounded-lg border border-gray-700 ${taskType !== 'ad' ? 'lg:col-span-2' : ''}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Generated Text</h3>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                >
                     {copied ? 'Copied!' : 'Copy All'}
                </button>
            </div>
            {parsedAdCopy ? (
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Headline</h4>
                        <p className="text-gray-200 font-semibold text-lg">{parsedAdCopy.headline}</p>
                    </div>
                     <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Primary Text</h4>
                        <p className="text-gray-300 whitespace-pre-wrap">{parsedAdCopy.primaryText}</p>
                    </div>
                     <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Call to Action</h4>
                        <p className="text-brand-primary font-bold">{parsedAdCopy.cta}</p>
                    </div>
                </div>
            ) : (
                <p className="text-gray-300 whitespace-pre-wrap font-sans">{creative.text}</p>
            )}
        </div>
        
        {/* Actions & Refinement Section */}
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
             <h3 className="text-xl font-semibold text-white mb-4">Actions & Refinements</h3>
              <div className="space-y-4">
                {/* Approve Button */}
                {taskType === 'ad' && creative.selectedVariation && (
                  <div>
                    <button
                      onClick={handleApproveContent}
                      disabled={showApprovedMessage}
                      className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 disabled:bg-green-700 transition-colors"
                    >
                      {showApprovedMessage ? '✓ Approved & Saved!' : '⭐ Approve This Content'}
                    </button>
                    <p className="text-xs text-gray-400 mt-1">Save to knowledge base for future learning</p>
                  </div>
                )}

                {/* Generate More Like This */}
                {taskType === 'ad' && creative.selectedVariation && (
                  <div className="pt-4 border-t border-gray-600">
                    <p className="text-sm font-medium text-gray-300 mb-2">Generate More Like This</p>
                    <p className="text-xs text-gray-400 mb-3">Create additional ad copy variations with similar style:</p>
                    <div className="flex items-center gap-3 mb-2">
                      <label htmlFor="moreVariationsCount" className="text-sm text-gray-300">How many:</label>
                      <select
                        id="moreVariationsCount"
                        value={moreVariationsCount}
                        onChange={(e) => setMoreVariationsCount(Number(e.target.value))}
                        className="bg-gray-700 border border-gray-600 text-white rounded-md p-2 flex-1"
                        disabled={isGeneratingMoreVariations}
                      >
                        <option value={3}>3 variations</option>
                        <option value={5}>5 variations</option>
                        <option value={10}>10 variations</option>
                      </select>
                    </div>
                    <button
                      onClick={handleGenerateMoreVariations}
                      disabled={isGeneratingMoreVariations}
                      className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 disabled:bg-gray-500 transition-colors"
                    >
                      {isGeneratingMoreVariations ? 'Generating...' : `Generate ${moreVariationsCount} More`}
                    </button>
                  </div>
                )}

                {/* Text Refinement */}
                <div className="pt-4 border-t border-gray-600">
                    <label htmlFor="refinementPrompt" className="block text-sm font-medium text-gray-300 mb-1">Refine the text:</label>
                    <textarea
                        id="refinementPrompt"
                        value={refinementPrompt}
                        onChange={(e) => setRefinementPrompt(e.target.value)}
                        placeholder="e.g., 'Make it more professional' or 'Add a bit more urgency'"
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2"
                        rows={3}
                        disabled={isRefiningText}
                    />
                     <button onClick={handleRefineText} disabled={isRefiningText} className="w-full mt-2 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-gray-500">
                        {isRefiningText ? 'Refining...' : 'Refine Text'}
                    </button>
                </div>

                {/* Try Again */}
                 <div className="pt-4 border-t border-gray-600">
                     <p className="text-sm text-gray-400 mb-2">Not quite right?</p>
                    <button onClick={handleTryAgain} className="w-full py-2 px-4 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500">
                        Try Again (Regenerate from scratch)
                    </button>
                 </div>
              </div>
        </div>
        
        {/* Image Section - Conditional */}
        {taskType === 'ad' && (
            <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Ad Image</h3>
                    {hasImages && !isLoading && (
                        <button
                            onClick={handleDownloadAllImages}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Download All
                        </button>
                    )}
                </div>
                 {isLoading ? <div className="min-h-[200px] flex items-center justify-center"><LoadingSpinner /></div> : (
                    <>
                        {hasImages ? (
                            <div className={`grid ${creative.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                {creative.images.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img src={`data:image/jpeg;base64,${img}`} alt={`Generated ad creative ${index + 1}`} className="rounded-md w-full aspect-square object-cover" />
                                        <button
                                            onClick={() => handleDownloadImage(img, index)}
                                            className="absolute top-2 right-2 p-2 bg-gray-900/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-900"
                                            title="Download this image"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-400 text-center py-12">Image generation failed. You can try refining the prompt below.</p>}
                    </>
                )}
                {error && <p className="mt-4 text-center text-red-400">{error}</p>}
                
                <div className="mt-6 pt-6 border-t border-gray-700">
                    <h4 className="text-lg font-semibold text-white mb-4">Image Options</h4>

                    {/* Change Image Section */}
                    <div className="mb-6">
                        <h5 className="text-md font-medium text-gray-300 mb-2">Change Image</h5>
                        <p className="text-sm text-gray-400 mb-3">Describe how you'd like to modify the image:</p>
                        <textarea
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder="e.g., 'Make it more diverse' or 'Change the background to a library'"
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 mb-2"
                            rows={3}
                        />
                        <button
                            onClick={handleRegenerateImages}
                            disabled={isLoading || !imagePrompt.trim()}
                            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Generating...' : 'Change Image'}
                        </button>
                    </div>

                    {/* Create More Like These Section */}
                    <div className="pt-6 border-t border-gray-600">
                        <h5 className="text-md font-medium text-gray-300 mb-2">Create More Like These</h5>
                        <p className="text-sm text-gray-400 mb-3">Generate additional variations with the same style:</p>
                        <div className="flex items-center gap-4 mb-3">
                            <label htmlFor="imageCount" className="text-gray-300 text-sm">How many more:</label>
                            <select
                                id="imageCount"
                                value={imageCount}
                                onChange={(e) => setImageCount(Number(e.target.value))}
                                className="bg-gray-700 border border-gray-600 text-white rounded-md p-2 flex-1"
                            >
                                <option value={1}>1 variation</option>
                                <option value={2}>2 variations</option>
                                <option value={4}>4 variations</option>
                            </select>
                        </div>
                        <button
                            onClick={() => {
                                setImagePrompt('');
                                handleRegenerateImages();
                            }}
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-brand-primary text-white font-semibold rounded-md hover:bg-red-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Generating...' : `Create ${imageCount} More`}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ResultsViewer;
