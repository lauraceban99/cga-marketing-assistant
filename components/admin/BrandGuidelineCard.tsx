import React from 'react';
import type { Brand, BrandGuideline } from '../../types';
import ColorPaletteDisplay from './ColorPaletteDisplay';

interface BrandGuidelineCardProps {
  brand: Brand;
  guideline: BrandGuideline | null;
  onUpload: () => void;
  onUpdate: () => void;
  onView: () => void;
}

const BrandGuidelineCard: React.FC<BrandGuidelineCardProps> = ({
  brand,
  guideline,
  onUpload,
  onUpdate,
  onView,
}) => {
  const hasGuideline = !!guideline;

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`h-10 w-10 rounded-full flex-shrink-0 ${brand.color} flex items-center justify-center`}
          >
            {hasGuideline ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 12 2 2 4-4"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            )}
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">{brand.name}</h3>
            <p className="text-sm text-gray-400">{brand.id}</p>
          </div>
        </div>
        <div>
          {hasGuideline ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900 text-green-300 text-xs font-medium rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              PDF Loaded
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900 text-red-300 text-xs font-medium rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              No PDF
            </span>
          )}
        </div>
      </div>

      {/* Guidelines Info */}
      {hasGuideline ? (
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Last Updated</span>
            <span className="text-white">{formatDate(guideline.lastUpdated)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">File Size</span>
            <span className="text-white">{formatFileSize(guideline.fileSize)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Version</span>
            <span className="text-white">v{guideline.version}</span>
          </div>

          {/* Color Preview */}
          {guideline.colors && guideline.colors.all.length > 0 && (
            <div className="pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400 mb-2">Color Palette Preview</p>
              <ColorPaletteDisplay colors={guideline.colors} compact />
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4 py-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-600 mb-2"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm text-gray-400">No brand guidelines uploaded yet</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {hasGuideline ? (
          <>
            <button
              onClick={onView}
              className="flex-1 bg-gray-700 text-white py-2 px-3 rounded text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              View Guidelines
            </button>
            <button
              onClick={onUpdate}
              className="flex-1 bg-brand-primary text-white py-2 px-3 rounded text-sm font-medium hover:bg-opacity-90 transition-colors"
            >
              Update PDF
            </button>
          </>
        ) : (
          <button
            onClick={onUpload}
            className="w-full bg-brand-primary text-white py-2 px-3 rounded text-sm font-medium hover:bg-opacity-90 transition-colors"
          >
            Upload PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default BrandGuidelineCard;
