import React, { useState, useRef } from 'react';
import { usePDFUpload } from '../../hooks/useStorage';

interface PDFUploaderProps {
  brandId: string;
  brandName: string;
  isUpdate?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({
  brandId,
  brandName,
  isUpdate = false,
  onSuccess,
  onCancel,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAndProcess, uploadProgress, isUploading, resetProgress } = usePDFUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadAndProcess(brandId, brandName, selectedFile, isUpdate);
      setTimeout(() => {
        resetProgress();
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    resetProgress();
    onCancel();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getStatusMessage = () => {
    if (!uploadProgress) return '';
    switch (uploadProgress.status) {
      case 'uploading':
        return 'Uploading PDF to storage...';
      case 'processing':
        return 'Extracting and analyzing content with Gemini AI...';
      case 'complete':
        return 'Successfully uploaded and processed!';
      case 'error':
        return `Error: ${uploadProgress.error}`;
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    if (!uploadProgress) return '';
    switch (uploadProgress.status) {
      case 'uploading':
      case 'processing':
        return 'text-blue-400';
      case 'complete':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isUpdate ? 'Update' : 'Upload'} Brand Guidelines
          </h2>
          <p className="text-gray-400 mt-1">
            {brandName} • PDF will be processed by Gemini AI
          </p>
        </div>

        {/* File Input */}
        {!isUploading && !uploadProgress?.status && (
          <div className="mb-6">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-brand-primary transition-colors"
            >
              <div className="text-gray-400">
                <svg
                  className="mx-auto h-12 w-12 mb-3"
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
                <p className="text-sm">
                  {selectedFile ? (
                    <span className="text-white font-medium">
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </span>
                  ) : (
                    <>
                      <span className="text-brand-primary font-medium">Click to select</span> a PDF file
                    </>
                  )}
                </p>
                <p className="text-xs mt-1">PDF only, max 10MB</p>
              </div>
            </button>
          </div>
        )}

        {/* Progress */}
        {uploadProgress && (
          <div className="mb-6">
            <div className="mb-2">
              <p className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusMessage()}
              </p>
            </div>
            {uploadProgress.status !== 'error' && uploadProgress.status !== 'complete' && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
            )}
            {uploadProgress.status === 'complete' && (
              <div className="flex items-center justify-center text-green-400 mt-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="ml-2">Upload Complete!</span>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        {!isUploading && !uploadProgress?.status && (
          <div className="mb-6 bg-gray-900 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-2">What happens next?</h4>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              <li>PDF uploaded to Firebase Storage</li>
              <li>Gemini AI extracts all text content</li>
              <li>AI parses brand guidelines, colors, typography</li>
              <li>Structured data saved to Firestore</li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isUploading}
            className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          {!uploadProgress?.status && (
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdate ? 'Update Guidelines' : 'Upload & Process'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFUploader;
