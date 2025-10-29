import React, { useState } from 'react';
import type { AssetMetadata } from '../../types';

interface TextCopyInputProps {
  brandId: string;
  brandName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TextCopyInput: React.FC<TextCopyInputProps> = ({
  brandId,
  brandName,
  onSuccess,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please provide both a title and content');
      return;
    }

    setIsSaving(true);

    try {
      const { createTextCopyAsset } = await import('../../services/assetService');

      const metadata: AssetMetadata = {};
      if (tags.trim()) {
        metadata.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
      if (campaignName.trim()) {
        metadata.campaignName = campaignName.trim();
      }

      await createTextCopyAsset(brandId, title.trim(), content.trim(), metadata);

      onSuccess();
    } catch (error) {
      console.error('Failed to save text copy:', error);
      alert(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Text Copy</h2>
            <p className="text-sm text-gray-400 mt-1">
              {brandName} → Reference Copy
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white text-2xl leading-none"
            disabled={isSaving}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Q1 2024 Instagram Caption Example"
              className="w-full bg-gray-900 text-white border border-gray-700 rounded px-4 py-2 text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Copy Content <span className="text-red-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your reference copy here..."
              rows={12}
              className="w-full bg-gray-900 text-white border border-gray-700 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length} characters
            </p>
          </div>

          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Campaign Name (optional)
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., Spring 2024 Launch"
              className="w-full bg-gray-900 text-white border border-gray-700 rounded px-4 py-2 text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (optional, comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., instagram, casual-tone, promotional"
              className="w-full bg-gray-900 text-white border border-gray-700 rounded px-4 py-2 text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim() || !content.trim()}
            className="flex-1 bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextCopyInput;
