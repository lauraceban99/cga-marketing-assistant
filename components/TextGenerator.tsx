import React, { useState, useEffect } from 'react';
import type {
  Brand,
  TaskType,
  EmailType,
  CampaignStage,
  LengthSpecification,
  BrandInstructions,
  Market,
  Platform
} from '../types';
import { getBrandInstructions } from '../services/instructionsService';
import { generateTextContent, type AdCopyVariation, type GeneratedContent } from '../services/textGenerationService';
import LoadingSpinner from './LoadingSpinner';

interface TextGeneratorProps {
  brand: Brand;
  taskType: TaskType;
  onBack: () => void;
  onGenerated: (content: GeneratedContent, prompt: string) => void;
  regenerationFeedback?: string;
  initialPrompt?: string;
}

const TextGenerator: React.FC<TextGeneratorProps> = ({ brand, taskType, onBack, onGenerated, regenerationFeedback, initialPrompt }) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [brandInstructions, setBrandInstructions] = useState<BrandInstructions | null>(null);

  // Form state
  const [emailType, setEmailType] = useState<EmailType>('invitation');
  const [campaignStage, setCampaignStage] = useState<CampaignStage>('mofu');
  const [lengthValue, setLengthValue] = useState<number>(150);
  const [lengthUnit, setLengthUnit] = useState<'words' | 'characters'>('words');
  const [market, setMarket] = useState<Market>('EMEA');
  const [platform, setPlatform] = useState<Platform>('META');

  useEffect(() => {
    const loadInstructions = async () => {
      const instructions = await getBrandInstructions(brand.id);
      setBrandInstructions(instructions);
    };
    loadInstructions();
  }, [brand.id]);

  const getTaskDetails = () => {
    switch (taskType) {
      case 'ad-copy':
        return {
          title: 'Generate Ad Copies',
          placeholder:
            'e.g., Create ads for our Auckland open day on Sept 18. Target parents looking for flexible online high school options.',
          loadingMessage: 'Generating multiple ad variations with different personas and angles...'
        };
      case 'blog':
        return {
          title: 'Generate Blog Post',
          placeholder:
            'e.g., Write a blog post about the benefits of online learning for high school students, focusing on flexibility and global opportunities.',
          loadingMessage: 'Creating SEO-optimized blog post...'
        };
      case 'landing-page':
        return {
          title: 'Generate Landing Page',
          placeholder:
            'e.g., Create a landing page for our new online program targeting parents of teenagers seeking flexible education options.',
          loadingMessage: 'Building landing page copy...'
        };
      case 'email':
        return {
          title: 'Generate Email',
          placeholder:
            'e.g., Create an invitation email for our virtual open house event on October 15th.',
          loadingMessage: 'Writing email...'
        };
      default:
        return {
          title: 'Generate Content',
          placeholder: 'Describe what you need...',
          loadingMessage: 'Generating...'
        };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brandInstructions) {
      setError('Brand instructions not loaded. Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const lengthSpec: LengthSpecification = {
        value: lengthValue,
        unit: lengthUnit
      };

      const generatedContent = await generateTextContent(
        taskType,
        prompt,
        brand,
        brandInstructions,
        {
          lengthSpec,
          campaignStage: taskType !== 'blog' ? campaignStage : undefined, // Blogs don't have campaign stages
          emailType: taskType === 'email' ? emailType : undefined,
          market: taskType === 'landing-page' ? market : undefined, // Only landing pages need market
          platform: taskType === 'landing-page' || taskType === 'ad-copy' ? platform : undefined
        },
        regenerationFeedback
      );

      onGenerated(generatedContent, prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const taskDetails = getTaskDetails();

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-[#4b0f0d] mb-4">{taskDetails.loadingMessage}</h2>
        <p className="text-[#9b9b9b] mb-8">This may take a moment...</p>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#9b9b9b] hover:text-[#4b0f0d] transition-colors mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6"></path>
        </svg>
        Back to Task Selection
      </button>

      <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg">
        <h2 className="text-2xl font-semibold text-[#4b0f0d] mb-6">{taskDetails.title}</h2>

        <div className="space-y-6">
          {/* Main prompt */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-[#4b0f0d] mb-2">
              Your Request
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817] text-lg leading-relaxed"
              placeholder={taskDetails.placeholder}
              required
            />
            <p className="text-xs text-[#9b9b9b] mt-2">
              Be specific. The more detail you provide, the better the result.
            </p>
          </div>

          {/* Email type dropdown (only for emails) */}
          {taskType === 'email' && (
            <div>
              <label htmlFor="emailType" className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Email Type
              </label>
              <select
                id="emailType"
                value={emailType}
                onChange={(e) => setEmailType(e.target.value as EmailType)}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
              >
                <option value="invitation">Invitation</option>
                <option value="nurturing-drip">Nurturing Drip</option>
                <option value="email-blast">Email Blast (Breaking News)</option>
              </select>
              <p className="text-xs text-[#9b9b9b] mt-2">
                Different email types follow different best practices and tone.
              </p>
            </div>
          )}

          {/* Market selector (for landing pages only) */}
          {taskType === 'landing-page' && (
            <div>
              <label htmlFor="market" className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Target Market
              </label>
              <select
                id="market"
                value={market}
                onChange={(e) => setMarket(e.target.value as Market)}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
              >
                <option value="ASIA">ASIA (Singapore, Hong Kong, Vietnam)</option>
                <option value="EMEA">EMEA (UAE, Middle East, Europe)</option>
                <option value="ANZ">ANZ (Australia, New Zealand)</option>
                <option value="Japan">Japan</option>
              </select>
              <p className="text-xs text-[#9b9b9b] mt-2">
                Different markets respond to different messaging strategies.
              </p>
            </div>
          )}

          {/* Platform selector (for landing pages and ad copies) */}
          {(taskType === 'landing-page' || taskType === 'ad-copy') && (
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Traffic Source / Platform
              </label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
              >
                <option value="META">META (Facebook, Instagram)</option>
                <option value="GOOGLE">GOOGLE (Search, Display)</option>
                {taskType === 'landing-page' && (
                  <>
                    <option value="ORGANIC">ORGANIC (SEO, Direct)</option>
                    <option value="EMAIL">EMAIL (Campaigns)</option>
                  </>
                )}
              </select>
              <p className="text-xs text-[#9b9b9b] mt-2">
                AI will apply platform-specific patterns. META: emotional, long-form. GOOGLE: direct, trust-focused.
              </p>
            </div>
          )}

          {/* Campaign stage (not for blogs) */}
          {taskType !== 'blog' && (
            <div>
              <label htmlFor="campaignStage" className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Campaign Stage (optional)
              </label>
              <select
                id="campaignStage"
                value={campaignStage}
                onChange={(e) => setCampaignStage(e.target.value as CampaignStage)}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
              >
                <option value="tofu">TOFU - Top of Funnel (Awareness)</option>
                <option value="mofu">MOFU - Middle of Funnel (Consideration)</option>
                <option value="bofu">BOFU - Bottom of Funnel (Decision)</option>
              </select>
              <p className="text-xs text-[#9b9b9b] mt-2">
                This determines the appropriate CTA and messaging approach.
              </p>
            </div>
          )}

          {/* Length specification */}
          <div>
            <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
              Target Length
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                value={lengthValue}
                onChange={(e) => setLengthValue(parseInt(e.target.value) || 0)}
                min="1"
                className="flex-1 bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
                placeholder="150"
              />
              <select
                value={lengthUnit}
                onChange={(e) => setLengthUnit(e.target.value as 'words' | 'characters')}
                className="bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
              >
                <option value="words">Words</option>
                <option value="characters">Characters</option>
              </select>
            </div>
            <p className="text-xs text-[#9b9b9b] mt-2">
              {taskType === 'ad-copy'
                ? 'This is a guideline; short and long versions will be generated for each variation.'
                : 'Approximate target length for the content.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-[#780817]/10 border border-[#780817] rounded-lg">
            <p className="text-[#780817] font-medium">{error}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-[#f4f0f0]">
          <button
            type="submit"
            className="w-full py-3 px-6 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors shadow-md hover:shadow-lg"
          >
            {taskType === 'ad-copy' ? 'Generate Multiple Variations' : 'Generate Content'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TextGenerator;
