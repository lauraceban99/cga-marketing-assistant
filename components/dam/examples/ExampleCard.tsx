import React, { useState } from 'react';
import type { CampaignExample, CampaignStage } from '../../../types';

interface ExampleCardProps {
  example: CampaignExample;
  index: number;
  onUpdate: (field: keyof CampaignExample, value: any) => void;
  onDelete: () => void;
  onSave: () => void;
}

const ExampleCard: React.FC<ExampleCardProps> = ({
  example,
  index,
  onUpdate,
  onDelete,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    onSave();
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Locked state (default)
  if (!isEditing) {
    return (
      <div className={`relative p-4 rounded-lg border-2 transition-all ${
        showSuccess
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-[#f4f0f0]'
      }`}>
        {/* Lock/Success indicator */}
        <div className="absolute top-3 right-3">
          {showSuccess ? (
            <span className="text-green-600 text-sm font-medium">✓ Saved</span>
          ) : (
            <span className="text-[#9b9b9b] text-lg">🔒</span>
          )}
        </div>

        {/* Content Preview */}
        <div className="pr-16">
          {example.headline && (
            <h4 className="text-md font-semibold text-[#4b0f0d] mb-2">
              {example.headline}
            </h4>
          )}
          <p className="text-sm text-[#9b9b9b] mb-2">
            {truncate(example.copy, 100)}
          </p>
          {example.cta && (
            <div className="inline-block px-3 py-1 bg-[#780817] text-white text-xs rounded-full mb-3">
              {example.cta}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-[#f4f0f0]">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#780817] hover:bg-[#f4f0f0] rounded-md transition-colors"
          >
            <span>✏️</span> Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#780817] hover:bg-[#f4f0f0] rounded-md transition-colors"
          >
            <span>🗑️</span> Delete
          </button>
        </div>
      </div>
    );
  }

  // Editing state
  return (
    <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
      {/* Edit indicator */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-200">
        <span className="text-blue-600 text-lg">✏️</span>
        <span className="text-sm font-medium text-blue-600">Editing Example {index + 1}</span>
      </div>

      {/* Form fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[#4b0f0d] mb-1">
            Campaign Stage
          </label>
          <select
            value={example.stage}
            onChange={(e) => onUpdate('stage', e.target.value as CampaignStage)}
            className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-2 focus:ring-2 focus:ring-[#780817] text-sm"
          >
            <option value="tofu">TOFU - Awareness</option>
            <option value="mofu">MOFU - Consideration</option>
            <option value="bofu">BOFU - Decision</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#4b0f0d] mb-1">
            Headline (optional)
          </label>
          <input
            type="text"
            value={example.headline || ''}
            onChange={(e) => onUpdate('headline', e.target.value)}
            placeholder="e.g., Where Learning Meets Life"
            className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-2 focus:ring-2 focus:ring-[#780817] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#4b0f0d] mb-1">
            Body Copy *
          </label>
          <textarea
            value={example.copy}
            onChange={(e) => onUpdate('copy', e.target.value)}
            rows={5}
            placeholder="Paste the full copy here..."
            className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-2 focus:ring-2 focus:ring-[#780817] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#4b0f0d] mb-1">
            Call to Action *
          </label>
          <input
            type="text"
            value={example.cta}
            onChange={(e) => onUpdate('cta', e.target.value)}
            placeholder="e.g., Book Free Consultation"
            className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-2 focus:ring-2 focus:ring-[#780817] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#4b0f0d] mb-1">
            Notes (optional)
          </label>
          <textarea
            value={example.notes || ''}
            onChange={(e) => onUpdate('notes', e.target.value)}
            rows={2}
            placeholder="Why does this work well? What makes it effective?"
            className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-2 focus:ring-2 focus:ring-[#780817] text-sm"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-blue-200">
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-4 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors text-sm"
        >
          <span>💾</span> Save Changes
        </button>
        <button
          onClick={handleCancel}
          className="flex items-center gap-1 px-4 py-2 bg-white text-[#780817] border border-[#780817] font-semibold rounded-md hover:bg-[#f4f0f0] transition-colors text-sm"
        >
          <span>❌</span> Cancel
        </button>
      </div>
    </div>
  );
};

export default ExampleCard;
