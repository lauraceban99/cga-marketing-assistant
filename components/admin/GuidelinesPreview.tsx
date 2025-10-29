import React from 'react';
import type { BrandGuideline } from '../../types';
import ColorPaletteDisplay from './ColorPaletteDisplay';

interface GuidelinesPreviewProps {
  guideline: BrandGuideline;
  onClose: () => void;
}

const GuidelinesPreview: React.FC<GuidelinesPreviewProps> = ({
  guideline,
  onClose,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{guideline.brandName} Guidelines</h2>
            <p className="text-sm text-gray-400 mt-1">
              {guideline.pdfFileName} • {formatFileSize(guideline.fileSize)} • Version {guideline.version}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
            aria-label="Close preview"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">File Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Uploaded</p>
                <p className="text-white">{formatDate(guideline.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-400">Last Updated</p>
                <p className="text-white">{formatDate(guideline.lastUpdated)}</p>
              </div>
              <div>
                <p className="text-gray-400">Uploaded By</p>
                <p className="text-white">{guideline.uploadedBy}</p>
              </div>
              <div>
                <p className="text-gray-400">PDF URL</p>
                <a
                  href={guideline.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline"
                >
                  View Original PDF
                </a>
              </div>
            </div>
          </div>

          {/* Color Palette */}
          {guideline.colors && guideline.colors.all.length > 0 && (
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Color Palette</h3>
              <ColorPaletteDisplay colors={guideline.colors} />
            </div>
          )}

          {/* Typography */}
          {guideline.typography && (
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Typography</h3>
              <div className="space-y-2 text-sm">
                {guideline.typography.primary && (
                  <div>
                    <p className="text-gray-400">Primary Font</p>
                    <p className="text-white">{guideline.typography.primary}</p>
                  </div>
                )}
                {guideline.typography.secondary && (
                  <div>
                    <p className="text-gray-400">Secondary Font</p>
                    <p className="text-white">{guideline.typography.secondary}</p>
                  </div>
                )}
                {guideline.typography.details && (
                  <div>
                    <p className="text-gray-400">Details</p>
                    <p className="text-white whitespace-pre-line">{guideline.typography.details}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Brand Guidelines */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Brand Guidelines</h3>
            <div className="space-y-4">
              {guideline.guidelines.toneOfVoice && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Tone of Voice</h4>
                  <p className="text-sm text-white whitespace-pre-line">{guideline.guidelines.toneOfVoice}</p>
                </div>
              )}
              {guideline.guidelines.keyMessaging && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Key Messaging</h4>
                  <p className="text-sm text-white whitespace-pre-line">{guideline.guidelines.keyMessaging}</p>
                </div>
              )}
              {guideline.guidelines.targetAudience && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Target Audience</h4>
                  <p className="text-sm text-white whitespace-pre-line">{guideline.guidelines.targetAudience}</p>
                </div>
              )}
              {guideline.guidelines.values && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Values</h4>
                  <p className="text-sm text-white whitespace-pre-line">{guideline.guidelines.values}</p>
                </div>
              )}
              {guideline.guidelines.imageryStyle && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Imagery Style</h4>
                  <p className="text-sm text-white whitespace-pre-line">{guideline.guidelines.imageryStyle}</p>
                </div>
              )}
              {guideline.guidelines.dosAndDonts && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Dos and Don'ts</h4>
                  <p className="text-sm text-white whitespace-pre-line">{guideline.guidelines.dosAndDonts}</p>
                </div>
              )}
            </div>
          </div>

          {/* Logo Rules */}
          {guideline.logoRules && (
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Logo Rules</h3>
              <p className="text-sm text-white whitespace-pre-line">{guideline.logoRules}</p>
            </div>
          )}

          {/* Extracted Text (collapsible) */}
          <details className="bg-gray-900 p-4 rounded-lg">
            <summary className="text-lg font-semibold text-white cursor-pointer">
              Extracted Text (Full)
            </summary>
            <pre className="mt-3 text-xs text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {guideline.extractedText}
            </pre>
          </details>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6">
          <button
            onClick={onClose}
            className="w-full bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesPreview;
