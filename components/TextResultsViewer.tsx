import React, { useState } from 'react';
import { marked } from 'marked';
import type { GeneratedContent } from '../services/textGenerationService';
import type { AdCopyVariation } from '../services/textGenerationService';
import { saveApprovedGeneratedContent } from '../services/feedbackService';
import type { Brand } from '../types';

interface TextResultsViewerProps {
  content: GeneratedContent;
  brand: Brand;
  userPrompt: string;
  onBack: () => void;
  onEditPrompt: () => void;
  onRegenerate?: (feedback?: string) => void;
}

const TextResultsViewer: React.FC<TextResultsViewerProps> = ({ content, brand, userPrompt, onBack, onEditPrompt, onRegenerate }) => {
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
        {/* Top navigation buttons */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[#9b9b9b] hover:text-[#4b0f0d] transition-colors"
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
            Back to Tasks
          </button>

          <button
            onClick={onEditPrompt}
            className="flex items-center gap-2 px-4 py-2 bg-[#04114a] text-white rounded-md hover:bg-[#780817] transition-colors text-sm font-medium"
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
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
              <path d="m15 5 4 4"></path>
            </svg>
            Edit Prompt
          </button>
        </div>

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
                        <div className="flex gap-2">
                          {editingId !== `${id}-short` && (
                            <button
                              onClick={() => handleEdit(`${id}-short`, shortVersion)}
                              className="text-xs text-[#04114a] hover:text-[#780817] transition-colors"
                            >
                              ✏️ Edit
                            </button>
                          )}
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
                      </div>
                      {editingId === `${id}-short` ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-[#9b9b9b] mb-1 block">Headline</label>
                            <input
                              type="text"
                              value={editedContent[`${id}-short`]?.headline || shortVersion.headline}
                              onChange={(e) => setEditedContent({
                                ...editedContent,
                                [`${id}-short`]: {
                                  ...(editedContent[`${id}-short`] || shortVersion),
                                  headline: e.target.value
                                }
                              })}
                              className="w-full p-2 border-2 border-[#780817] rounded-md text-[#4b0f0d] font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[#9b9b9b] mb-1 block">Body</label>
                            <textarea
                              value={editedContent[`${id}-short`]?.body || shortVersion.body}
                              onChange={(e) => setEditedContent({
                                ...editedContent,
                                [`${id}-short`]: {
                                  ...(editedContent[`${id}-short`] || shortVersion),
                                  body: e.target.value
                                }
                              })}
                              rows={6}
                              className="w-full p-2 border-2 border-[#780817] rounded-md text-[#4b0f0d]"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[#9b9b9b] mb-1 block">CTA</label>
                            <input
                              type="text"
                              value={editedContent[`${id}-short`]?.cta || shortVersion.cta}
                              onChange={(e) => setEditedContent({
                                ...editedContent,
                                [`${id}-short`]: {
                                  ...(editedContent[`${id}-short`] || shortVersion),
                                  cta: e.target.value
                                }
                              })}
                              className="w-full p-2 border-2 border-[#780817] rounded-md text-[#780817] font-semibold"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(`${id}-short`)}
                              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition-colors"
                            >
                              ✓ Save
                            </button>
                            <button
                              onClick={() => handleCancelEdit(`${id}-short`)}
                              className="flex-1 px-3 py-2 bg-gray-400 text-white text-sm font-semibold rounded-md hover:bg-gray-500 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-[#9b9b9b] mb-1">
                              Headline ({(editedContent[`${id}-short`]?.headline || shortVersion.headline).length} chars)
                            </p>
                            <p className="text-lg font-bold text-[#4b0f0d]">
                              {editedContent[`${id}-short`]?.headline || shortVersion.headline}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9b9b9b] mb-1">
                              Body ({(editedContent[`${id}-short`]?.body || shortVersion.body).split(/\s+/).length} words)
                            </p>
                            <p className="text-sm text-[#4b0f0d] leading-relaxed">
                              {editedContent[`${id}-short`]?.body || shortVersion.body}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9b9b9b] mb-1">CTA</p>
                            <p className="text-md font-semibold text-[#780817]">
                              {editedContent[`${id}-short`]?.cta || shortVersion.cta}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Long Version */}
                  {longVersion && (
                    <div className="border-2 border-[#780817]/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-[#780817]">LONG VERSION</h3>
                        <div className="flex gap-2">
                          {editingId !== `${id}-long` && (
                            <button
                              onClick={() => handleEdit(`${id}-long`, longVersion)}
                              className="text-xs text-[#780817] hover:text-[#4b0f0d] transition-colors"
                            >
                              ✏️ Edit
                            </button>
                          )}
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
                      </div>
                      {editingId === `${id}-long` ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-[#9b9b9b] mb-1 block">Headline</label>
                            <input
                              type="text"
                              value={editedContent[`${id}-long`]?.headline || longVersion.headline}
                              onChange={(e) => setEditedContent({
                                ...editedContent,
                                [`${id}-long`]: {
                                  ...(editedContent[`${id}-long`] || longVersion),
                                  headline: e.target.value
                                }
                              })}
                              className="w-full p-2 border-2 border-[#780817] rounded-md text-[#4b0f0d] font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[#9b9b9b] mb-1 block">Body</label>
                            <textarea
                              value={editedContent[`${id}-long`]?.body || longVersion.body}
                              onChange={(e) => setEditedContent({
                                ...editedContent,
                                [`${id}-long`]: {
                                  ...(editedContent[`${id}-long`] || longVersion),
                                  body: e.target.value
                                }
                              })}
                              rows={8}
                              className="w-full p-2 border-2 border-[#780817] rounded-md text-[#4b0f0d]"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[#9b9b9b] mb-1 block">CTA</label>
                            <input
                              type="text"
                              value={editedContent[`${id}-long`]?.cta || longVersion.cta}
                              onChange={(e) => setEditedContent({
                                ...editedContent,
                                [`${id}-long`]: {
                                  ...(editedContent[`${id}-long`] || longVersion),
                                  cta: e.target.value
                                }
                              })}
                              className="w-full p-2 border-2 border-[#780817] rounded-md text-[#780817] font-semibold"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(`${id}-long`)}
                              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition-colors"
                            >
                              ✓ Save
                            </button>
                            <button
                              onClick={() => handleCancelEdit(`${id}-long`)}
                              className="flex-1 px-3 py-2 bg-gray-400 text-white text-sm font-semibold rounded-md hover:bg-gray-500 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-[#9b9b9b] mb-1">
                              Headline ({(editedContent[`${id}-long`]?.headline || longVersion.headline).length} chars)
                            </p>
                            <p className="text-lg font-bold text-[#4b0f0d]">
                              {editedContent[`${id}-long`]?.headline || longVersion.headline}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9b9b9b] mb-1">
                              Body ({(editedContent[`${id}-long`]?.body || longVersion.body).split(/\s+/).length} words)
                            </p>
                            <p className="text-sm text-[#4b0f0d] leading-relaxed">
                              {editedContent[`${id}-long`]?.body || longVersion.body}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9b9b9b] mb-1">CTA</p>
                            <p className="text-md font-semibold text-[#780817]">
                              {editedContent[`${id}-long`]?.cta || longVersion.cta}
                            </p>
                          </div>
                        </div>
                      )}
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

  // Parse and render formatted content for blog, landing page, email
  const parseContent = () => {
    try {
      return JSON.parse(editedContent['main'] || content.content || '{}');
    } catch {
      return null;
    }
  };

  const parsedContent = parseContent();

  // Render other content types (blog, landing page, email)
  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Top navigation buttons */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[#9b9b9b] hover:text-[#4b0f0d] transition-colors"
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
          Back to Tasks
        </button>

        <button
          onClick={onEditPrompt}
          className="flex items-center gap-2 px-4 py-2 bg-[#04114a] text-white rounded-md hover:bg-[#780817] transition-colors text-sm font-medium"
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
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
            <path d="m15 5 4 4"></path>
          </svg>
          Edit Prompt
        </button>
      </div>

      <div className="bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#4b0f0d] mb-2">
              Your {content.type.replace('-', ' ').toUpperCase()}
            </h2>
            <p className="text-sm text-[#9b9b9b]">
              {content.metadata.wordCount} words • {content.metadata.characterCount} characters
              {content.metadata.campaignStage && content.type !== 'blog' && ` • ${content.metadata.campaignStage.toUpperCase()}`}
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
          <div>
            {/* Render formatted content based on type */}
            {content.type === 'blog' && parsedContent ? (
              <div className="space-y-6">
                {/* Blog Title */}
                <div className="border-b-2 border-[#f4f0f0] pb-4">
                  <h1 className="text-4xl font-bold text-[#4b0f0d] mb-3">{parsedContent.headline}</h1>
                  {parsedContent.metaDescription && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <p className="text-xs text-[#9b9b9b] font-semibold mb-1">SEO META DESCRIPTION</p>
                      <p className="text-sm text-[#4b0f0d]">{parsedContent.metaDescription}</p>
                    </div>
                  )}
                </div>

                {/* Keywords */}
                {parsedContent.keywords && parsedContent.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-[#9b9b9b] font-semibold mr-2">KEYWORDS:</span>
                    {parsedContent.keywords.map((keyword: string, i: number) => (
                      <span key={i} className="text-xs bg-[#780817]/10 text-[#780817] px-3 py-1 rounded-full font-medium">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}

                {/* Blog Content */}
                <div className="prose prose-lg max-w-none blog-content">
                  <style>{`
                    .blog-content h1 {
                      font-size: 2rem;
                      font-weight: 700;
                      margin-top: 2rem;
                      margin-bottom: 1rem;
                      color: #4b0f0d;
                    }
                    .blog-content h2 {
                      font-size: 1.5rem;
                      font-weight: 700;
                      margin-top: 1.5rem;
                      margin-bottom: 0.75rem;
                      color: #780817;
                    }
                    .blog-content h3 {
                      font-size: 1.25rem;
                      font-weight: 700;
                      margin-top: 1rem;
                      margin-bottom: 0.5rem;
                      color: #04114a;
                    }
                    .blog-content p {
                      margin-bottom: 1rem;
                      line-height: 1.75;
                      color: #4b0f0d;
                    }
                    .blog-content a {
                      color: #780817;
                      text-decoration: underline;
                    }
                    .blog-content a:hover {
                      color: #4b0f0d;
                    }
                    .blog-content strong {
                      font-weight: 600;
                      color: #4b0f0d;
                    }
                    .blog-content ul, .blog-content ol {
                      margin-left: 1.5rem;
                      margin-bottom: 1rem;
                    }
                    .blog-content li {
                      margin-bottom: 0.5rem;
                    }
                  `}</style>
                  <div
                    className="text-[#4b0f0d] leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: marked(parsedContent.content)
                    }}
                  />
                </div>
              </div>
            ) : content.type === 'landing-page' && parsedContent ? (
              <div className="space-y-8">
                {/* Hero Section */}
                {parsedContent.hero && (
                  <div className="bg-gradient-to-br from-[#780817]/10 to-[#04114a]/10 border-2 border-[#780817]/20 rounded-lg p-8 text-center">
                    <h1 className="text-5xl font-bold text-[#4b0f0d] mb-4">{parsedContent.hero.headline}</h1>
                    <p className="text-xl text-[#780817] font-medium">{parsedContent.hero.subheadline}</p>
                  </div>
                )}

                {/* Value Proposition */}
                {parsedContent.valueProposition && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                    <p className="text-xs text-[#9b9b9b] font-semibold mb-2">VALUE PROPOSITION</p>
                    <p className="text-lg text-[#4b0f0d] leading-relaxed">{parsedContent.valueProposition}</p>
                  </div>
                )}

                {/* Benefits */}
                {parsedContent.benefits && parsedContent.benefits.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-[#780817] mb-4">Key Benefits</h2>
                    <div className="space-y-3">
                      {parsedContent.benefits.map((benefit: string, i: number) => (
                        <div key={i} className="flex gap-3 items-start">
                          <span className="text-green-600 text-xl font-bold">✓</span>
                          <p className="text-[#4b0f0d] leading-relaxed flex-1">{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                {parsedContent.features && parsedContent.features.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-[#04114a] mb-4">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parsedContent.features.map((feature: string, i: number) => (
                        <div key={i} className="bg-[#f4f0f0] border border-[#9b9b9b]/20 rounded-lg p-4">
                          <p className="text-[#4b0f0d]">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Proof */}
                {parsedContent.socialProof && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
                    <p className="text-xs text-[#9b9b9b] font-semibold mb-3">SOCIAL PROOF</p>
                    <p className="text-[#4b0f0d] leading-relaxed italic">{parsedContent.socialProof}</p>
                  </div>
                )}

                {/* CTA */}
                {parsedContent.cta && (
                  <div className="bg-[#780817] text-white rounded-lg p-8 text-center">
                    <h2 className="text-3xl font-bold mb-3">{parsedContent.cta.headline}</h2>
                    <p className="text-lg mb-6 opacity-90">{parsedContent.cta.body}</p>
                    <button className="bg-white text-[#780817] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#f4f0f0] transition-colors">
                      {parsedContent.cta.buttonText}
                    </button>
                  </div>
                )}
              </div>
            ) : content.type === 'email' && parsedContent ? (
              <div className="space-y-6">
                {/* Email Header */}
                <div className="border-b-2 border-[#f4f0f0] pb-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[#9b9b9b] font-semibold mb-1">SUBJECT LINE</p>
                      <p className="text-2xl font-bold text-[#4b0f0d]">{parsedContent.subject}</p>
                    </div>
                    {parsedContent.previewText && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="text-xs text-[#9b9b9b] font-semibold mb-1">PREVIEW TEXT</p>
                        <p className="text-sm text-[#4b0f0d]">{parsedContent.previewText}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Body */}
                <div className="bg-white border-2 border-[#f4f0f0] rounded-lg p-8">
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: marked(parsedContent.body || '')
                    }}
                  />
                </div>

                {/* CTA */}
                {parsedContent.cta && (
                  <div className="bg-[#780817] text-white rounded-lg p-6 text-center">
                    <button className="bg-white text-[#780817] px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#f4f0f0] transition-colors">
                      {parsedContent.cta}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <pre className="whitespace-pre-wrap font-sans text-[#4b0f0d] leading-relaxed">
                {editedContent['main'] || content.content}
              </pre>
            )}
          </div>
        )}

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
