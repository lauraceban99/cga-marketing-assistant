import React, { useState } from 'react';
import type { BrandAsset, AssetMetadata } from '../../types';

interface EditAssetModalProps {
  asset: BrandAsset;
  onSave: (assetId: string, metadata: AssetMetadata) => Promise<void>;
  onClose: () => void;
}

const EditAssetModal: React.FC<EditAssetModalProps> = ({ asset, onSave, onClose }) => {
  const [metadata, setMetadata] = useState<AssetMetadata>(asset.metadata || {});
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(asset.id, metadata);
      onClose();
    } catch (error) {
      alert('Failed to save metadata');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !metadata.tags?.includes(tagInput.trim())) {
      setMetadata({
        ...metadata,
        tags: [...(metadata.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata({
      ...metadata,
      tags: metadata.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-900 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#f4f0f0]">
          <div>
            <h2 className="text-xl font-bold text-[#4b0f0d]">Edit Asset Metadata</h2>
            <p className="text-sm text-[#9b9b9b] truncate max-w-md">{asset.fileName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#9b9b9b] hover:text-[#4b0f0d] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
              Description
            </label>
            <textarea
              value={metadata.description || ''}
              onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white border-2 border-[#f4f0f0] shadow-lg rounded-lg text-[#4b0f0d] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              placeholder="Add a description for this asset..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 px-4 py-2 bg-white border-2 border-[#f4f0f0] shadow-lg rounded-lg text-[#4b0f0d] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Type a tag and press Enter..."
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-brand-primary text-[#4b0f0d] rounded-lg hover:bg-opacity-90 transition-colors text-sm"
              >
                Add
              </button>
            </div>
            {metadata.tags && metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-brand-primary bg-opacity-20 text-brand-primary rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-[#4b0f0d] transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              value={metadata.campaignName || ''}
              onChange={(e) => setMetadata({ ...metadata, campaignName: e.target.value })}
              className="w-full px-4 py-2 bg-white border-2 border-[#f4f0f0] shadow-lg rounded-lg text-[#4b0f0d] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="e.g., Q1 Open Day 2025"
            />
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
              Source URL
            </label>
            <input
              type="url"
              value={metadata.sourceUrl || ''}
              onChange={(e) => setMetadata({ ...metadata, sourceUrl: e.target.value })}
              className="w-full px-4 py-2 bg-white border-2 border-[#f4f0f0] shadow-lg rounded-lg text-[#4b0f0d] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="https://..."
            />
          </div>

          {/* Usage Rights */}
          <div>
            <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
              Usage Rights
            </label>
            <input
              type="text"
              value={metadata.usageRights || ''}
              onChange={(e) => setMetadata({ ...metadata, usageRights: e.target.value })}
              className="w-full px-4 py-2 bg-white border-2 border-[#f4f0f0] shadow-lg rounded-lg text-[#4b0f0d] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="e.g., Licensed, Public Domain, Internal Use Only"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#f4f0f0]">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-[#f4f0f0] text-[#4b0f0d] rounded-lg hover:bg-[#04114a]/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-brand-primary text-[#4b0f0d] rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAssetModal;
