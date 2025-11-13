import React from 'react';
import type { TaskType, EmailType } from '../types';

interface MissingInstruction {
  field: string;
  label: string;
  description: string;
}

interface InstructionsWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  contentType: TaskType;
  emailType?: EmailType;
  missingInstructions: MissingInstruction[];
  brandId: string;
}

const InstructionsWarningModal: React.FC<InstructionsWarningModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  contentType,
  emailType,
  missingInstructions,
  brandId,
}) => {
  if (!isOpen) return null;

  const getContentTypeLabel = () => {
    if (contentType === 'email' && emailType) {
      const emailLabels = {
        'invitation': 'Invitation Email',
        'nurturing-drip': 'Nurturing Drip Email',
        'email-blast': 'Email Blast',
      };
      return emailLabels[emailType];
    }

    const labels = {
      'ad-copy': 'Ad Copy',
      'blog': 'Blog Post',
      'landing-page': 'Landing Page',
      'email': 'Email',
    };
    return labels[contentType] || contentType;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#4b0f0d] mb-2">
                Missing Brand Instructions
              </h2>
              <p className="text-[#666666]">
                Some instructions for <strong>{getContentTypeLabel()}</strong> are not configured.
                Content will be generated using generic templates.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* What's Missing Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#4b0f0d] mb-4 flex items-center gap-2">
              <span>📋</span>
              What's Missing
            </h3>
            <div className="space-y-3">
              {missingInstructions.map((instruction, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">❌</span>
                  <div className="flex-1">
                    <p className="font-semibold text-[#4b0f0d] mb-1">
                      {instruction.label}
                    </p>
                    <p className="text-sm text-[#666666]">
                      {instruction.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Section */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-[#4b0f0d] mb-2 flex items-center gap-2">
              <span>💡</span>
              What This Means
            </h4>
            <ul className="space-y-2 text-sm text-[#666666]">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Content will use <strong>generic best practices</strong> instead of your brand voice</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>No brand-specific examples or patterns will be applied</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Output quality will improve significantly once you configure these instructions</span>
              </li>
            </ul>
          </div>

          {/* Recommendation Section */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-[#4b0f0d] mb-2 flex items-center gap-2">
              <span>✅</span>
              Our Recommendation
            </h4>
            <p className="text-sm text-[#666666] mb-3">
              For the best results, we recommend configuring brand-specific instructions before generating content.
              This ensures your content reflects your unique voice, examples, and proven patterns.
            </p>
            <p className="text-sm text-[#666666]">
              <strong>Time to configure:</strong> ~10-15 minutes per content type
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#e8e8e8] p-6 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <a
            href={`/dam?tab=instructions&brand=${brandId}`}
            className="flex-1 bg-[#4b0f0d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6b1f1d] transition-colors text-center flex items-center justify-center gap-2"
          >
            <span>⚙️</span>
            Configure Instructions Now
          </a>
          <div className="flex gap-3 flex-1">
            <button
              onClick={onClose}
              className="flex-1 bg-white text-[#4b0f0d] px-6 py-3 rounded-lg font-semibold border-2 border-[#4b0f0d] hover:bg-[#fef7f6] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onProceed}
              className="flex-1 bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            >
              Generate Anyway
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="px-6 pb-4 text-xs text-[#999999] text-center">
          You can always regenerate with better instructions later
        </div>
      </div>
    </div>
  );
};

export default InstructionsWarningModal;
