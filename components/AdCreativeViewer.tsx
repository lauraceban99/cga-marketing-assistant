
import React, { useState, useMemo } from 'react';
import type { Brand, GeneratedCreative, TaskType } from '../types';
import { regenerateImages, refineCreativeText, generateAsset } from '../services/geminiService';
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
                <div className="mt-2">
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
                <h3 className="text-xl font-semibold text-white mb-4">Ad Image</h3>
                 {isLoading ? <div className="min-h-[200px] flex items-center justify-center"><LoadingSpinner /></div> : (
                    <>
                        {hasImages ? (
                            <div className={`grid ${creative.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                {creative.images.map((img, index) => (
                                    <img key={index} src={`data:image/jpeg;base64,${img}`} alt={`Generated ad creative ${index + 1}`} className="rounded-md w-full aspect-square object-cover" />
                                ))}
                            </div>
                        ) : <p className="text-gray-400 text-center py-12">Image generation failed. You can try refining the prompt below.</p>}
                    </>
                )}
                {error && <p className="mt-4 text-center text-red-400">{error}</p>}
                
                <div className="mt-6 pt-6 border-t border-gray-700">
                    <h4 className="text-lg font-semibold text-white">Refine Your Image</h4>
                    <div className="mt-4 space-y-4">
                        <textarea
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder={"e.g., 'Make it more diverse' or 'Change the background to a library'"}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2"
                            rows={3}
                        />
                        <div className="flex items-center gap-4">
                            <label htmlFor="imageCount" className="text-gray-300">Number of versions:</label>
                            <select
                                id="imageCount"
                                value={imageCount}
                                onChange={(e) => setImageCount(Number(e.target.value))}
                                className="bg-gray-700 border border-gray-600 text-white rounded-md p-2"
                            >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={4}>4</option>
                            </select>
                        </div>
                        <button onClick={handleRegenerateImages} disabled={isLoading} className="w-full py-2 px-4 bg-brand-primary text-white font-semibold rounded-md hover:bg-red-500 disabled:bg-gray-500">
                            {isLoading ? 'Generating...' : 'Regenerate Image(s)'}
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
