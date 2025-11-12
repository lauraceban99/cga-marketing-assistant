import React, { useState } from 'react';
import type { GeneratedContent } from '../services/textGenerationService';
import type { AdCopyVariation } from '../services/textGenerationService';
import { saveApprovedGeneratedContent } from '../services/feedbackService';
import type { Brand } from '../types';

interface TextResultsViewerProps {
  content: GeneratedContent;
  brand: Brand;
  userPrompt: string;
  onBack: () => void;
  onRegenerate?: (feedback?: string) => void;
}

const TextResultsViewer: React.FC<TextResultsViewerProps> = ({ content, brand, userPrompt, onBack, onRegenerate }) => {
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<any>({});
  const [feedbackGiven, setFeedbackGiven] = useState<{ [key: string]: 'up' | 'down' | null }>({});
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [showRegeneratePrompt, setShowRegeneratePrompt] = useState(false);
  const [regenerateReason, setRegenerateReason] = useState('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleThumbsUp = async (variationId: string, variationContent: any) => {
    setSavingFeedback(true);
    try {
      await saveApprovedGeneratedContent(
        brand.id,
        brand.name,
        variationContent,
        content.type,
        userPrompt,
        content.metadata
      );
      setFeedbackGiven({ ...feedbackGiven, [variationId]: 'up' });
      alert('✅ Great! This content has been saved as a training example for future generations.');
    } catch (error) {
      console.error('Error saving feedback:', error);
      alert('❌ Failed to save feedback. Please try again.');
    } finally {
      setSavingFeedback(false);
    }
  };

  const handleThumbsDown = (variationId: string) => {
    setFeedbackGiven({ ...feedbackGiven, [variationId]: 'down' });
    setShowRegeneratePrompt(true);
  };

  const handleEdit = (id: string, currentContent: any) => {
    setEditingId(id);
    setEditedContent({ ...editedContent, [id]: currentContent });
  };

  const handleSaveEdit = async (id: string) => {
    setSavingFeedback(true);
    try {
      const editedText = editedContent[id];
      // Save the edited content to training data
      await saveApprovedGeneratedContent(
        brand.id,
        brand.name,
        { content: editedText },
        content.type,
        userPrompt,
        content.metadata
      );
      setFeedbackGiven({ ...feedbackGiven, [id]: 'up' });
      setEditingId(null);
      alert('✅ Changes saved and added to training data! This will help improve future generations.');
    } catch (error) {
      console.error('Error saving edited content:', error);
      alert('❌ Failed to save changes. Please try again.');
    } finally {
      setSavingFeedback(false);
    }
  };

  const handleCancelEdit = (id: string) => {
    setEditingId(null);
    const newEdited = { ...editedContent };
    delete newEdited[id];
    setEditedContent(newEdited);
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

                {/* Feedback Section */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-[#4b0f0d] mb-3">What do you think of this variation?</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleThumbsUp(id, mainVariation)}
                      disabled={feedbackGiven[id] === 'up' || savingFeedback}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
                        feedbackGiven[id] === 'up'
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-green-600 hover:bg-green-100 border-2 border-green-600'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={feedbackGiven[id] === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 10v12"></path>
                        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                      </svg>
                      {feedbackGiven[id] === 'up' ? '✓ Saved!' : 'Approve & Save'}
                    </button>
                    <button
                      onClick={() => handleThumbsDown(id)}
                      disabled={feedbackGiven[id] === 'down'}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
                        feedbackGiven[id] === 'down'
                          ? 'bg-red-500 text-white'
                          : 'bg-white text-red-600 hover:bg-red-100 border-2 border-red-600'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={feedbackGiven[id] === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 14V2"></path>
                        <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
                      </svg>
                      {feedbackGiven[id] === 'down' ? 'Not Good' : 'Needs Work'}
                    </button>
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

        {/* Content Display or Editor */}
        <div className="prose max-w-none">
          {editingId === 'main' ? (
            <div className="space-y-4">
              <textarea
                value={editedContent['main'] || content.content}
                onChange={(e) => setEditedContent({ ...editedContent, main: e.target.value })}
                rows={20}
                className="w-full p-4 border-2 border-[#780817] rounded-lg font-sans text-[#4b0f0d] leading-relaxed focus:ring-2 focus:ring-[#780817]"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => handleSaveEdit('main')}
                  className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                >
                  ✓ Save Changes
                </button>
                <button
                  onClick={() => handleCancelEdit('main')}
                  className="px-6 py-2 bg-gray-400 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-[#4b0f0d] leading-relaxed">
              {editedContent['main'] || content.content}
            </pre>
          )}
        </div>

        {/* Feedback & Edit Section */}
        {editingId !== 'main' && (
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-[#4b0f0d] mb-3">What do you think of this content?</p>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => handleThumbsUp('main', { content: editedContent['main'] || content.content })}
                disabled={feedbackGiven['main'] === 'up' || savingFeedback}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
                  feedbackGiven['main'] === 'up'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-green-600 hover:bg-green-100 border-2 border-green-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={feedbackGiven['main'] === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 10v12"></path>
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                </svg>
                {feedbackGiven['main'] === 'up' ? '✓ Saved!' : 'Approve & Save'}
              </button>
              <button
                onClick={() => handleThumbsDown('main')}
                disabled={feedbackGiven['main'] === 'down'}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
                  feedbackGiven['main'] === 'down'
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-red-600 hover:bg-red-100 border-2 border-red-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={feedbackGiven['main'] === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 14V2"></path>
                  <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
                </svg>
                {feedbackGiven['main'] === 'down' ? 'Not Good' : 'Needs Work'}
              </button>
              <button
                onClick={() => handleEdit('main', content.content)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#780817] border-2 border-[#780817] rounded-md font-semibold hover:bg-[#780817] hover:text-white transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Content
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Regeneration Prompt Modal */}
      {showRegeneratePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#4b0f0d] mb-4">Help us improve</h3>
            <p className="text-sm text-[#9b9b9b] mb-4">
              What would you like us to change or improve in the content?
            </p>
            <textarea
              value={regenerateReason}
              onChange={(e) => setRegenerateReason(e.target.value)}
              rows={4}
              placeholder="e.g., Make it more formal, add more statistics, focus on parents instead of students..."
              className="w-full p-3 border-2 border-[#9b9b9b] rounded-md focus:ring-2 focus:ring-[#780817] focus:border-[#780817] text-sm"
            />
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  if (onRegenerate) {
                    console.log('User feedback for regeneration:', regenerateReason);
                    onRegenerate(regenerateReason);
                  }
                  setShowRegeneratePrompt(false);
                  setRegenerateReason('');
                }}
                className="flex-1 px-4 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors"
              >
                Regenerate with Changes
              </button>
              <button
                onClick={() => {
                  setShowRegeneratePrompt(false);
                  setRegenerateReason('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {onRegenerate && !showRegeneratePrompt && (
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
