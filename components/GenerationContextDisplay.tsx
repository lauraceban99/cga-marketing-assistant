import React, { useState } from 'react';
import type { GenerationContext } from '../types';
import { getContextSummary } from '../services/generationService';

interface GenerationContextDisplayProps {
  context: GenerationContext | null;
  loading?: boolean;
}

const GenerationContextDisplay: React.FC<GenerationContextDisplayProps> = ({
  context,
  loading = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-400">Loading generation context...</span>
        </div>
      </div>
    );
  }

  if (!context) {
    return null;
  }

  const summary = getContextSummary(context);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 mb-4 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-750 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl">📚</div>
          <div>
            <h3 className="text-sm font-semibold text-white">Generation Context</h3>
            <p className="text-xs text-gray-400 mt-0.5">{summary.message}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <svg
            className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-700 pt-3">
          <div className="space-y-3">
            {/* Instructions */}
            {summary.hasInstructions && (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-white">Custom generation instructions</p>
                  <p className="text-xs text-gray-400">Version {context.instructions.version} • Last updated by {context.instructions.lastUpdatedBy}</p>
                </div>
              </div>
            )}

            {/* Brand Guidelines */}
            {summary.hasGuidelines ? (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-white">{context.assets.guidelines.length} brand guideline document{context.assets.guidelines.length > 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-400">{context.assets.guidelines.map((g) => g.fileName).join(', ')}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-yellow-400">No brand guidelines uploaded</p>
                  <p className="text-xs text-gray-400">Upload PDFs to improve brand consistency</p>
                </div>
              </div>
            )}

            {/* Reference Copy */}
            {summary.hasReferenceCopy ? (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-white">{context.assets.referenceCopy.length} reference copy example{context.assets.referenceCopy.length > 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-400">{context.assets.referenceCopy.map((r) => r.fileName).join(', ')}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-gray-400">No reference copy examples</p>
                </div>
              </div>
            )}

            {/* Ad Examples */}
            {summary.hasCompetitorAds ? (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-white">{context.assets.competitorAds.length} ad example{context.assets.competitorAds.length > 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-400">{context.assets.competitorAds.map((c) => c.fileName).join(', ')}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-gray-400">No ad examples</p>
                </div>
              </div>
            )}

            {/* Logos */}
            {summary.hasLogos && (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-white">{context.assets.logos.length} logo file{context.assets.logos.length > 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-400">{context.assets.logos.map((l) => l.fileName).join(', ')}</p>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                Total: {summary.totalAssets} asset{summary.totalAssets !== 1 ? 's' : ''} loaded
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationContextDisplay;
