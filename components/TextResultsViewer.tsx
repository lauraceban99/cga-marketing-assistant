import React, { useState } from 'react';
import type { GeneratedContent } from '../services/textGenerationService';
import type { AdCopyVariation } from '../services/textGenerationService';

interface TextResultsViewerProps {
  content: GeneratedContent;
  onBack: () => void;
  onRegenerate?: () => void;
}

const TextResultsViewer: React.FC<TextResultsViewerProps> = ({ content, onBack, onRegenerate }) => {
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render ad copy variations
  if (content.type === 'ad-copy' && content.variations) {
    // Group variations by ID (short and long versions together)
    const groupedVariations: { [key: string]: AdCopyVariation[] } = {};
    content.variations.forEach((variation) => {
      if (!groupedVariations[variation.id]) {
        groupedVariations[variation.id] = [];
      }
      groupedVariations[variation.id].push(variation);
    });

    return (
      <div className="max-w-7xl mx-auto py-8">
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
          Start Over
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#4b0f0d] mb-2">Your Ad Copy Variations</h2>
          <p className="text-[#9b9b9b]">
            Each variation targets a different persona with a unique angle. Both short and long versions are provided.
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedVariations).map(([id, variations]) => {
            const shortVersion = variations.find((v) => v.version === 'short');
            const longVersion = variations.find((v) => v.version === 'long');

            if (!shortVersion && !longVersion) return null;

            const mainVariation = shortVersion || longVersion!;

            return (
              <div
                key={id}
                className="bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg p-6"
              >
                {/* Variation metadata */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs font-semibold bg-[#780817] text-white px-3 py-1 rounded-full">
                    Variation {id}
                  </span>
                  <span className="text-xs font-medium bg-[#04114a]/10 text-[#04114a] px-3 py-1 rounded-full">
                    Persona: {mainVariation.persona}
                  </span>
                  <span className="text-xs font-medium bg-[#9b9b9b]/10 text-[#4b0f0d] px-3 py-1 rounded-full">
                    Angle: {mainVariation.angle}
                  </span>
                </div>

                {/* Keywords */}
                <div className="mb-6">
                  <p className="text-xs text-[#9b9b9b] mb-2">Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {mainVariation.keywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="text-xs bg-[#f4f0f0] text-[#4b0f0d] px-2 py-1 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Short and Long versions side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Short Version */}
                  {shortVersion && (
                    <div className="border-2 border-[#04114a]/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-[#04114a]">SHORT VERSION</h3>
                        <button
                          onClick={() =>
                            handleCopy(
                              `${shortVersion.headline}\n\n${shortVersion.body}\n\n${shortVersion.cta}`,
                              `${id}-short`
                            )
                          }
                          className="text-xs text-[#780817] hover:text-[#4b0f0d] transition-colors"
                        >
                          {copiedId === `${id}-short` ? '✓ Copied' : '📋 Copy'}
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-[#9b9b9b] mb-1">
                            Headline ({shortVersion.headline.length} chars)
                          </p>
                          <p className="text-lg font-bold text-[#4b0f0d]">
                            {shortVersion.headline}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#9b9b9b] mb-1">
                            Body ({shortVersion.body.split(/\s+/).length} words)
                          </p>
                          <p className="text-sm text-[#4b0f0d] leading-relaxed">
                            {shortVersion.body}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#9b9b9b] mb-1">CTA</p>
                          <p className="text-md font-semibold text-[#780817]">
                            {shortVersion.cta}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Long Version */}
                  {longVersion && (
                    <div className="border-2 border-[#780817]/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-[#780817]">LONG VERSION</h3>
                        <button
                          onClick={() =>
                            handleCopy(
                              `${longVersion.headline}\n\n${longVersion.body}\n\n${longVersion.cta}`,
                              `${id}-long`
                            )
                          }
                          className="text-xs text-[#780817] hover:text-[#4b0f0d] transition-colors"
                        >
                          {copiedId === `${id}-long` ? '✓ Copied' : '📋 Copy'}
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-[#9b9b9b] mb-1">
                            Headline ({longVersion.headline.length} chars)
                          </p>
                          <p className="text-lg font-bold text-[#4b0f0d]">
                            {longVersion.headline}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#9b9b9b] mb-1">
                            Body ({longVersion.body.split(/\s+/).length} words)
                          </p>
                          <p className="text-sm text-[#4b0f0d] leading-relaxed">
                            {longVersion.body}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#9b9b9b] mb-1">CTA</p>
                          <p className="text-md font-semibold text-[#780817]">
                            {longVersion.cta}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {onRegenerate && (
          <div className="mt-8 text-center">
            <button
              onClick={onRegenerate}
              className="px-6 py-3 bg-[#04114a] text-white font-semibold rounded-md hover:bg-[#780817] transition-colors shadow-md hover:shadow-lg"
            >
              Generate New Variations
            </button>
          </div>
        )}
      </div>
    );
  }

  // Render other content types (blog, landing page, email)
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
        Start Over
      </button>

      <div className="bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#4b0f0d] mb-2">
              Your {content.type.replace('-', ' ').toUpperCase()}
            </h2>
            <p className="text-sm text-[#9b9b9b]">
              {content.metadata.wordCount} words • {content.metadata.characterCount} characters
              {content.metadata.campaignStage && ` • ${content.metadata.campaignStage.toUpperCase()}`}
              {content.metadata.emailType && ` • ${content.metadata.emailType}`}
            </p>
          </div>
          <button
            onClick={() => handleCopy(content.content || '', 'main')}
            className="px-4 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors"
          >
            {copiedId === 'main' ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>

        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-[#4b0f0d] leading-relaxed">
            {content.content}
          </pre>
        </div>
      </div>

      {onRegenerate && (
        <div className="mt-8 text-center">
          <button
            onClick={onRegenerate}
            className="px-6 py-3 bg-[#04114a] text-white font-semibold rounded-md hover:bg-[#780817] transition-colors shadow-md hover:shadow-lg"
          >
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
};

export default TextResultsViewer;
