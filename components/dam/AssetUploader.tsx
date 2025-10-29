import React, { useState, useRef } from 'react';
import type { AssetCategory, AssetMetadata } from '../../types';
import { ASSET_CATEGORY_CONFIG } from '../../constants/damConfig';
import { useAssetUpload } from '../../hooks/useAssetUpload';

interface AssetUploaderProps {
  brandId: string;
  brandName: string;
  category: AssetCategory;
  onSuccess: () => void;
  onCancel: () => void;
}

const AssetUploader: React.FC<AssetUploaderProps> = ({
  brandId,
  brandName,
  category,
  onSuccess,
  onCancel,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadAssets, uploadQueue, isUploading, resetQueue } = useAssetUpload();

  const categoryConfig = ASSET_CATEGORY_CONFIG[category];

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Filter by accepted types and size
    const validFiles = fileArray.filter((file) => {
      const typeMatch = categoryConfig.acceptedTypes.some((type) => {
        if (type === '*/*') return true;
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });

      const sizeOk = file.size <= categoryConfig.maxSize;

      if (!typeMatch) {
        alert(`File ${file.name} is not an accepted type for this category`);
      }
      if (!sizeOk) {
        alert(`File ${file.name} exceeds maximum size`);
      }

      return typeMatch && sizeOk;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    // Build metadata without undefined values
    const metadata: AssetMetadata = {};

    if (description.trim()) {
      metadata.description = description.trim();
    }

    if (tags.trim()) {
      metadata.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    try {
      await uploadAssets(brandId, category, selectedFiles, metadata);
      // Reduced timeout for faster UI response
      setTimeout(() => {
        resetQueue();
        onSuccess();
      }, 500);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const hasFiles = selectedFiles.length > 0 || uploadQueue.length > 0;
  const showQueue = uploadQueue.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Upload Assets</h2>
            <p className="text-sm text-gray-400 mt-1">
              {brandName} → {categoryConfig.icon} {categoryConfig.label}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white text-2xl leading-none"
            disabled={isUploading}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* File Drop Zone */}
          {!showQueue && (
            <>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragging ? 'border-brand-primary bg-gray-900' : 'border-gray-600 hover:border-gray-500'}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={categoryConfig.acceptedTypes.join(',')}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                <div className="text-gray-400">
                  <svg
                    className="mx-auto h-12 w-12 mb-3"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-sm">
                    <span className="text-brand-primary font-medium">Click to select</span> or drag files here
                  </p>
                  <p className="text-xs mt-2">{categoryConfig.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max {(categoryConfig.maxSize / (1024 * 1024)).toFixed(0)} MB per file
                  </p>
                </div>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    Selected Files ({selectedFiles.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-800 p-2 rounded"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="ml-2 text-gray-400 hover:text-red-400"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Q1 2024 social media campaign"
                      className="w-full bg-gray-900 text-white border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Tags (optional, comma-separated)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., facebook, instagram, 2024"
                      className="w-full bg-gray-900 text-white border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Upload Queue */}
          {showQueue && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white mb-3">Upload Progress</h4>
              {uploadQueue.map((item, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white truncate">{item.fileName}</span>
                    <span className="text-xs text-gray-400">{item.progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.status === 'complete'
                          ? 'bg-green-500'
                          : item.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-brand-primary'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  {item.error && <p className="text-xs text-red-400 mt-1">{item.error}</p>}
                </div>
              ))}
              {uploadQueue.every((item) => item.status === 'complete') && (
                <div className="text-center text-green-400 mt-4">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm">Upload Complete!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showQueue && uploadQueue.every((item) => item.status === 'complete') ? 'Close' : 'Cancel'}
          </button>
          {!showQueue && selectedFiles.length > 0 && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetUploader;
