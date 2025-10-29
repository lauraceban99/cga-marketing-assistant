import React, { useState } from 'react';
import type { BrandAsset } from '../../types';

interface AssetCardProps {
  asset: BrandAsset;
  onDelete: (assetId: string) => void;
  mode?: 'grid' | 'list';
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onDelete, mode = 'grid' }) => {
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
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center gap-4">
          {/* Icon/Thumbnail */}
          <div className="flex-shrink-0">
            {isImage && asset.thumbnailUrl ? (
              <img
                src={asset.thumbnailUrl || asset.fileUrl}
                alt={asset.fileName}
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-2xl">
                {getFileIcon()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{asset.fileName}</h4>
            <p className="text-xs text-gray-400 mt-1">
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
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Download"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
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
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-sm text-gray-300 mb-2">Delete this asset?</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
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
    <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all overflow-hidden">
      {/* Preview */}
      <div className="aspect-square bg-gray-900 flex items-center justify-center overflow-hidden">
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
        <h4 className="text-sm font-medium text-white truncate" title={asset.fileName}>
          {asset.fileName}
        </h4>
        <p className="text-xs text-gray-400 mt-1">
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
            className="flex-1 text-center px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition-colors"
          >
            Download
          </a>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-2 py-1 bg-gray-700 text-red-400 text-xs rounded hover:bg-red-900 hover:text-red-300 transition-colors"
            disabled={isDeleting}
          >
            Delete
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-300 mb-2">Delete this asset?</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
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
