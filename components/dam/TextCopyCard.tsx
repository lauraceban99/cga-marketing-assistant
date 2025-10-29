import React, { useState } from 'react';
import type { BrandAsset, AssetMetadata } from '../../types';
import { updateTextCopyContent } from '../../services/assetService';

interface TextCopyCardProps {
  asset: BrandAsset;
  onDelete: (assetId: string) => void;
  onUpdate: () => void;
}

const TextCopyCard: React.FC<TextCopyCardProps> = ({ asset, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(asset.fileName);
  const [content, setContent] = useState(asset.metadata.description || '');
  const [tags, setTags] = useState(asset.metadata.tags?.join(', ') || '');
  const [campaignName, setCampaignName] = useState(asset.metadata.campaignName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const metadata: Partial<AssetMetadata> = {};
      if (tags.trim()) {
        metadata.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
      if (campaignName.trim()) {
        metadata.campaignName = campaignName.trim();
      }

      await updateTextCopyContent(asset.id, title.trim(), content.trim(), metadata);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update text copy:', error);
      alert('Failed to update copy');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(asset.fileName);
    setContent(asset.metadata.description || '');
    setTags(asset.metadata.tags?.join(', ') || '');
    setCampaignName(asset.metadata.campaignName || '');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm(`Delete "${asset.fileName}"?`)) {
      await onDelete(asset.id);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const previewContent = content.length > 200 ? content.substring(0, 200) + '...' : content;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
      {isEditing ? (
        /* Edit Mode */
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-900 text-white border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full bg-gray-900 text-white border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-primary font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">{content.length} characters</p>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Campaign Name</label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Optional"
              className="w-full bg-gray-900 text-white border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Optional"
              className="w-full bg-gray-900 text-white border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 bg-gray-700 text-white py-2 px-3 rounded text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-brand-primary text-white py-2 px-3 rounded text-sm hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <div>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-sm truncate mb-1">{asset.fileName}</h3>
              <p className="text-xs text-gray-400">
                {formatDate(asset.uploadedAt)} • {content.length} chars
              </p>
            </div>
            <div className="flex gap-1 ml-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content Preview */}
          <div className="bg-gray-900 rounded p-3 mb-3">
            <p className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
              {isExpanded ? content : previewContent}
            </p>
            {content.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-brand-primary hover:underline mt-2"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-1">
            {asset.metadata.campaignName && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Campaign:</span>
                <span className="text-gray-300">{asset.metadata.campaignName}</span>
              </div>
            )}
            {asset.metadata.tags && asset.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {asset.metadata.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextCopyCard;
