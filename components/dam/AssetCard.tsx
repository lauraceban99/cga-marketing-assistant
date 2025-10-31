import React, { useState } from 'react';
import type { BrandAsset } from '../../types';

interface AssetCardProps {
  asset: BrandAsset;
  onDelete: (assetId: string) => void;
  onClick?: (asset: BrandAsset) => void;
  mode?: 'grid' | 'list';
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onDelete, onClick, mode = 'grid' }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return new Date(date).toLocaleDateString();
  };

  const getFileIcon = (): string => {
    if (asset.fileType.startsWith('image/')) return '🖼️';
    if (asset.fileType.startsWith('video/')) return '🎥';
    if (asset.fileType === 'application/pdf') return '📄';
    if (asset.fileType.startsWith('text/')) return '📝';
    return '📦';
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(asset.id);
    } catch (error) {
      console.error('Delete failed:', error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isImage = asset.fileType.startsWith('image/');

  if (mode === 'list') {
    return (
      <div className="bg-white rounded-lg p-4 border-2 border-[#f4f0f0] shadow-lg hover:border-[#f4f0f0] transition-colors">
        <div className="flex items-center gap-4">
          {/* Icon/Thumbnail */}
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => onClick?.(asset)}
          >
            {isImage && asset.thumbnailUrl ? (
              <img
                src={asset.thumbnailUrl || asset.fileUrl}
                alt={asset.fileName}
                className="w-12 h-12 object-cover rounded hover:opacity-80 transition-opacity"
              />
            ) : (
              <div className="w-12 h-12 bg-[#f4f0f0] rounded flex items-center justify-center text-2xl hover:bg-[#04114a]/10 transition-colors">
                {getFileIcon()}
              </div>
            )}
          </div>

          {/* Info */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onClick?.(asset)}
          >
            <h4 className="text-sm font-medium text-[#4b0f0d] truncate hover:text-brand-primary transition-colors">{asset.fileName}</h4>
            <p className="text-xs text-[#9b9b9b] mt-1">
              {formatFileSize(asset.fileSize)} • {formatDate(asset.uploadedAt)}
            </p>
            {asset.metadata.description && (
              <p className="text-xs text-gray-500 mt-1 truncate">{asset.metadata.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href={asset.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#9b9b9b] hover:text-[#4b0f0d] transition-colors"
              title="Download"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-[#9b9b9b] hover:text-red-400 transition-colors"
              title="Delete"
              disabled={isDeleting}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="mt-3 pt-3 border-t border-[#f4f0f0]">
            <p className="text-sm text-[#4b0f0d] mb-2">Delete this asset?</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1 bg-red-600 text-[#4b0f0d] text-sm rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-3 py-1 bg-[#f4f0f0] text-[#4b0f0d] text-sm rounded hover:bg-[#04114a]/10"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Grid mode
  return (
    <div className="bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg hover:border-[#f4f0f0] transition-all overflow-hidden">
      {/* Preview */}
      <div
        className="aspect-square bg-gray-900 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => onClick?.(asset)}
      >
        {isImage ? (
          <img
            src={asset.thumbnailUrl || asset.fileUrl}
            alt={asset.fileName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl">{getFileIcon()}</div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h4
          className="text-sm font-medium text-[#4b0f0d] truncate cursor-pointer hover:text-brand-primary transition-colors"
          title={asset.fileName}
          onClick={() => onClick?.(asset)}
        >
          {asset.fileName}
        </h4>
        <p className="text-xs text-[#9b9b9b] mt-1">
          {formatFileSize(asset.fileSize)}
        </p>
        <p className="text-xs text-gray-500">
          {formatDate(asset.uploadedAt)}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <a
            href={asset.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-2 py-1 bg-[#f4f0f0] text-[#4b0f0d] text-xs rounded hover:bg-[#04114a]/10 transition-colors"
          >
            Download
          </a>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-2 py-1 bg-[#f4f0f0] text-red-400 text-xs rounded hover:bg-red-900 hover:text-red-300 transition-colors"
            disabled={isDeleting}
          >
            Delete
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="mt-3 pt-3 border-t border-[#f4f0f0]">
            <p className="text-xs text-[#4b0f0d] mb-2">Delete this asset?</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-2 py-1 bg-red-600 text-[#4b0f0d] text-xs rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-2 py-1 bg-[#f4f0f0] text-[#4b0f0d] text-xs rounded hover:bg-[#04114a]/10"
              >
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetCard;
