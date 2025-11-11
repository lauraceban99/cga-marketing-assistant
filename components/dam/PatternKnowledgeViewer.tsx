import React, { useState, useEffect } from 'react';
import type { PatternKnowledgeBase, TaskType, Market, Platform } from '../../types';
import { getAllPatternKnowledge, updateManualLearnings, deletePatternKnowledge } from '../../services/patternKnowledgeService';
import LoadingSpinner from '../LoadingSpinner';

interface PatternKnowledgeViewerProps {
  brandId: string;
}

const PatternKnowledgeViewer: React.FC<PatternKnowledgeViewerProps> = ({ brandId }) => {
  const [patterns, setPatterns] = useState<PatternKnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPatterns, setExpandedPatterns] = useState<Set<string>>(new Set());
  const [editingPattern, setEditingPattern] = useState<string | null>(null);
  const [editedLearnings, setEditedLearnings] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPatterns();
  }, [brandId]);

  const loadPatterns = async () => {
    setLoading(true);
    const data = await getAllPatternKnowledge(brandId);
    setPatterns(data);
    setLoading(false);
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedPatterns);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPatterns(newExpanded);
  };

  const startEditing = (pattern: PatternKnowledgeBase) => {
    setEditingPattern(pattern.id);
    setEditedLearnings(pattern.manualLearnings || '');
  };

  const cancelEditing = () => {
    setEditingPattern(null);
    setEditedLearnings('');
  };

  const saveLearnings = async (patternId: string) => {
    setSaving(true);
    try {
      await updateManualLearnings(brandId, patternId, editedLearnings);
      await loadPatterns();
      setEditingPattern(null);
      setEditedLearnings('');
    } catch (error) {
      console.error('Error saving learnings:', error);
      alert('Error saving learnings');
    } finally {
      setSaving(false);
    }
  };

  const deletePattern = async (patternId: string) => {
    if (!confirm('Delete this pattern group? This cannot be undone.')) return;

    try {
      await deletePatternKnowledge(brandId, patternId);
      await loadPatterns();
    } catch (error) {
      console.error('Error deleting pattern:', error);
      alert('Error deleting pattern');
    }
  };

  // Group patterns by content type
  const groupedPatterns = patterns.reduce((acc, pattern) => {
    if (!acc[pattern.contentType]) {
      acc[pattern.contentType] = [];
    }
    acc[pattern.contentType].push(pattern);
    return acc;
  }, {} as Record<TaskType, PatternKnowledgeBase[]>);

  const contentTypeLabels: Record<TaskType, string> = {
    'ad-copy': 'Ad Copies',
    'blog': 'Blog Posts',
    'landing-page': 'Landing Pages',
    'email': 'Emails'
  };

  const contentTypeIcons: Record<TaskType, string> = {
    'ad-copy': '📢',
    'blog': '📝',
    'landing-page': '🌐',
    'email': '📧'
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <LoadingSpinner />
        <p className="mt-4 text-[#9b9b9b]">Loading AI learning patterns...</p>
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-[#f4f0f0] p-12 text-center">
        <div className="text-6xl mb-4">🤖</div>
        <h3 className="text-xl font-semibold text-[#4b0f0d] mb-2">
          No Learning Patterns Yet
        </h3>
        <p className="text-[#9b9b9b] max-w-md mx-auto">
          As you add examples with market and platform information, the AI will automatically
          extract patterns and store them here. These patterns help the AI generate better,
          more targeted content.
        </p>
        <div className="mt-6 text-sm text-[#9b9b9b] text-left max-w-lg mx-auto bg-[#f4f0f0] p-4 rounded-lg">
          <p className="font-semibold text-[#4b0f0d] mb-2">To start building knowledge:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to a content type tab (Ad Copy, Landing Pages, etc.)</li>
            <li>Add examples with market and platform specified</li>
            <li>Save the examples</li>
            <li>The AI will automatically extract patterns and they'll appear here</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border-2 border-[#f4f0f0] p-6">
        <h3 className="text-xl font-semibold text-[#4b0f0d] mb-2">
          🧠 AI Learning Knowledge Base
        </h3>
        <p className="text-sm text-[#9b9b9b] mb-4">
          The AI automatically extracts patterns from your examples and stores them here.
          These patterns are used to generate content that matches your market and platform.
        </p>
        <div className="flex items-center gap-2 text-sm text-[#9b9b9b]">
          <span className="font-medium">Total Pattern Groups:</span>
          <span className="px-2 py-1 bg-[#f4f0f0] rounded-full text-[#780817] font-semibold">
            {patterns.length}
          </span>
        </div>
      </div>

      {Object.entries(groupedPatterns).map(([contentType, typePatterns]) => (
        <div key={contentType} className="bg-white rounded-lg border-2 border-[#f4f0f0] p-6">
          <h4 className="text-lg font-semibold text-[#4b0f0d] mb-4 flex items-center gap-2">
            <span>{contentTypeIcons[contentType as TaskType]}</span>
            <span>{contentTypeLabels[contentType as TaskType]}</span>
            <span className="text-sm font-normal text-[#9b9b9b]">
              ({typePatterns.length} pattern{typePatterns.length !== 1 ? 's' : ''})
            </span>
          </h4>

          <div className="space-y-4">
            {typePatterns.map((pattern) => {
              const isExpanded = expandedPatterns.has(pattern.id);
              const isEditing = editingPattern === pattern.id;

              return (
                <div
                  key={pattern.id}
                  className="border border-[#f4f0f0] rounded-lg overflow-hidden"
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-[#f4f0f0] cursor-pointer hover:bg-[#e8e4e4] transition-colors"
                    onClick={() => toggleExpanded(pattern.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{isExpanded ? '▼' : '▶'}</div>
                      <div>
                        <div className="font-semibold text-[#4b0f0d]">
                          {pattern.market} × {pattern.platform}
                        </div>
                        <div className="text-xs text-[#9b9b9b]">
                          {pattern.performanceSummary?.totalExamples || 0} examples analyzed
                          {pattern.lastUpdated && (
                            <> · Updated {new Date(pattern.lastUpdated).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePattern(pattern.id);
                      }}
                      className="px-3 py-1 text-sm text-[#780817] hover:bg-white rounded transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-6 space-y-6">
                      {/* Auto-Extracted Insights */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">🤖</span>
                          <h5 className="font-semibold text-[#4b0f0d]">
                            Auto-Extracted Insights
                          </h5>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-[#4b0f0d] whitespace-pre-wrap">
                            {pattern.autoExtractedInsights}
                          </p>
                        </div>
                      </div>

                      {/* Pattern Categories */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">📊</span>
                          <h5 className="font-semibold text-[#4b0f0d]">
                            Extracted Patterns
                          </h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(pattern.patterns).map(([category, items]) => {
                            if (!items || items.length === 0) return null;

                            const categoryLabels: Record<string, string> = {
                              headlineStyles: 'Headline Styles',
                              structurePatterns: 'Structure Patterns',
                              toneCharacteristics: 'Tone Characteristics',
                              ctaStrategies: 'CTA Strategies',
                              conversionTechniques: 'Conversion Techniques',
                              socialProofApproaches: 'Social Proof Approaches'
                            };

                            return (
                              <div key={category} className="bg-[#f4f0f0] rounded-lg p-4">
                                <div className="font-medium text-[#4b0f0d] mb-2 text-sm">
                                  {categoryLabels[category] || category}
                                </div>
                                <ul className="space-y-1">
                                  {items.map((item, idx) => (
                                    <li key={idx} className="text-sm text-[#9b9b9b] flex items-start gap-2">
                                      <span className="text-[#780817] mt-0.5">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Manual Learnings */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💡</span>
                            <h5 className="font-semibold text-[#4b0f0d]">
                              Marketer Insights (Manual)
                            </h5>
                          </div>
                          {!isEditing && (
                            <button
                              onClick={() => startEditing(pattern)}
                              className="px-3 py-1 text-sm text-[#780817] hover:bg-[#f4f0f0] rounded transition-colors"
                            >
                              ✏️ Edit
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="space-y-3">
                            <textarea
                              value={editedLearnings}
                              onChange={(e) => setEditedLearnings(e.target.value)}
                              rows={8}
                              className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] text-sm"
                              placeholder="Add your manual insights, learnings, and notes about what works for this market + platform combination..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveLearnings(pattern.id)}
                                disabled={saving}
                                className="px-4 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50 text-sm"
                              >
                                {saving ? 'Saving...' : '💾 Save'}
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="px-4 py-2 bg-white text-[#780817] border border-[#780817] font-semibold rounded-md hover:bg-[#f4f0f0] transition-colors text-sm"
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            {pattern.manualLearnings ? (
                              <p className="text-sm text-[#4b0f0d] whitespace-pre-wrap">
                                {pattern.manualLearnings}
                              </p>
                            ) : (
                              <p className="text-sm text-[#9b9b9b] italic">
                                No manual insights added yet. Click Edit to add your own learnings.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatternKnowledgeViewer;
