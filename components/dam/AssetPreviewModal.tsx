import React from 'react';
import type { BrandAsset } from '../../types';

interface AssetPreviewModalProps {
  asset: BrandAsset;
  onClose: () => void;
  onDelete: (assetId: string) => void;
  onEdit: (assetId: string) => void;
}

const AssetPreviewModal: React.FC<AssetPreviewModalProps> = ({
  asset,
  onClose,
  onDelete,
  onEdit,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isImage = asset.fileType.startsWith('image/');
  const isVideo = asset.fileType.startsWith('video/');
  const isPDF = asset.fileType === 'application/pdf';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full max-h-[90vh] flex flex-col bg-gray-900 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#f4f0f0]">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-xl font-bold text-[#4b0f0d] truncate">{asset.fileName}</h2>
            <p className="text-sm text-[#9b9b9b]">
              {formatFileSize(asset.fileSize)} • {formatDate(asset.uploadedAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(asset.id)}
              className="px-3 py-2 bg-[#f4f0f0] text-[#4b0f0d] rounded-lg hover:bg-[#04114a]/10 transition-colors text-sm"
            >
              Edit
            </button>
            <a
              href={asset.fileUrl}
              download={asset.fileName}
              className="px-3 py-2 bg-brand-primary text-[#4b0f0d] rounded-lg hover:bg-opacity-90 transition-colors text-sm"
            >
              Download
            </a>
            <button
              onClick={onClose}
              className="p-2 text-[#9b9b9b] hover:text-[#4b0f0d] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex gap-6">
            {/* Preview */}
            <div className="flex-1 flex items-center justify-center bg-white rounded-lg min-h-[400px]">
              {isImage && (
                <img
                  src={asset.fileUrl}
                  alt={asset.fileName}
                  className="max-w-full max-h-[600px] object-contain"
                />
              )}
              {isVideo && (
                <video
                  src={asset.fileUrl}
                  controls
                  className="max-w-full max-h-[600px]"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {isPDF && (
                <div className="text-center p-8">
                  <svg className="w-24 h-24 mx-auto text-gray-600 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                    <path d="M14 2v6h6M10 13h4M10 17h4M10 9h4" />
                  </svg>
                  <p className="text-[#9b9b9b] mb-4">PDF Preview</p>
                  <a
                    href={asset.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-brand-primary text-[#4b0f0d] rounded-lg hover:bg-opacity-90 transition-colors inline-block"
                  >
                    Open PDF in New Tab
                  </a>
                </div>
              )}
              {!isImage && !isVideo && !isPDF && (
                <div className="text-center p-8">
                  <svg className="w-24 h-24 mx-auto text-gray-600 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                  </svg>
                  <p className="text-[#9b9b9b] mb-4">No preview available</p>
                  <a
                    href={asset.fileUrl}
                    download={asset.fileName}
                    className="px-4 py-2 bg-brand-primary text-[#4b0f0d] rounded-lg hover:bg-opacity-90 transition-colors inline-block"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>

            {/* Metadata Sidebar */}
            <div className="w-80 space-y-4">
              {/* File Info */}
              <div className="bg-white rounded-lg p-4 border-2 border-[#f4f0f0] shadow-lg">
                <h3 className="text-sm font-semibold text-[#4b0f0d] mb-3">File Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-[#9b9b9b]">File Type:</span>
                    <span className="text-[#4b0f0d] ml-2">{asset.fileType}</span>
                  </div>
                  <div>
                    <span className="text-[#9b9b9b]">Size:</span>
                    <span className="text-[#4b0f0d] ml-2">{formatFileSize(asset.fileSize)}</span>
                  </div>
                  <div>
                    <span className="text-[#9b9b9b]">Uploaded:</span>
                    <span className="text-[#4b0f0d] ml-2">{formatDate(asset.uploadedAt)}</span>
                  </div>
                  <div>
                    <span className="text-[#9b9b9b]">Uploaded By:</span>
                    <span className="text-[#4b0f0d] ml-2">{asset.uploadedBy}</span>
                  </div>
                  <div>
                    <span className="text-[#9b9b9b]">Category:</span>
                    <span className="text-[#4b0f0d] ml-2 capitalize">{asset.category.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              {asset.metadata && (
                <div className="bg-white rounded-lg p-4 border-2 border-[#f4f0f0] shadow-lg">
                  <h3 className="text-sm font-semibold text-[#4b0f0d] mb-3">Metadata</h3>
                  <div className="space-y-3 text-sm">
                    {asset.metadata.description && (
                      <div>
                        <span className="text-[#9b9b9b] block mb-1">Description:</span>
                        <span className="text-[#4b0f0d]">{asset.metadata.description}</span>
                      </div>
                    )}
                    {asset.metadata.tags && asset.metadata.tags.length > 0 && (
                      <div>
                        <span className="text-[#9b9b9b] block mb-1">Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {asset.metadata.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-brand-primary bg-opacity-20 text-brand-primary rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {asset.metadata.campaignName && (
                      <div>
                        <span className="text-[#9b9b9b] block mb-1">Campaign:</span>
                        <span className="text-[#4b0f0d]">{asset.metadata.campaignName}</span>
                      </div>
                    )}
                    {asset.metadata.sourceUrl && (
                      <div>
                        <span className="text-[#9b9b9b] block mb-1">Source:</span>
                        <a
                          href={asset.metadata.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-primary hover:underline break-all"
                        >
                          {asset.metadata.sourceUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white rounded-lg p-4 border-2 border-[#f4f0f0] shadow-lg">
                <h3 className="text-sm font-semibold text-[#4b0f0d] mb-3">Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => onEdit(asset.id)}
                    className="w-full px-3 py-2 bg-[#f4f0f0] text-[#4b0f0d] rounded-lg hover:bg-[#04114a]/10 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Metadata
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${asset.fileName}"? This cannot be undone.`)) {
                        onDelete(asset.id);
                        onClose();
                      }
                    }}
                    className="w-full px-3 py-2 bg-red-600 bg-opacity-20 text-red-400 border border-red-600 rounded-lg hover:bg-opacity-30 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Asset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetPreviewModal;
