import React from 'react';
import type { BrandInstructions } from '../types';

interface ConflictResolutionModalProps {
  localData: BrandInstructions;
  remoteData: BrandInstructions;
  localVersion: number;
  remoteVersion: number;
  lastUpdatedBy?: string;
  onKeepLocal: () => void;
  onKeepRemote: () => void;
  onCancel: () => void;
}

const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  localData,
  remoteData,
  localVersion,
  remoteVersion,
  lastUpdatedBy,
  onKeepLocal,
  onKeepRemote,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-yellow-100 rounded-full p-3 flex-shrink-0">
            <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-[#4b0f0d] mb-2">
              Conflict Detected
            </h3>
            <p className="text-[#9b9b9b] mb-2">
              {lastUpdatedBy
                ? `${lastUpdatedBy} saved changes while you were editing.`
                : 'Someone else saved changes while you were editing.'}
            </p>
            <p className="text-sm text-[#9b9b9b]">
              Your version: <strong className="text-[#4b0f0d]">v{localVersion}</strong>
              {' • '}
              Server version: <strong className="text-[#4b0f0d]">v{remoteVersion}</strong>
            </p>
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Important:</strong> You must choose which version to keep. One set of changes will be overwritten.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={onKeepLocal}
            className="w-full p-4 border-2 border-[#780817] bg-[#780817] text-white rounded-lg hover:bg-[#4b0f0d] transition-colors text-left group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-lg">Keep My Changes</span>
              <span className="text-xs opacity-75 group-hover:opacity-100">v{localVersion}</span>
            </div>
            <div className="text-sm opacity-90">
              Your edits will overwrite the server version. The other person's changes will be lost.
            </div>
          </button>

          <button
            onClick={onKeepRemote}
            className="w-full p-4 border-2 border-[#9b9b9b] bg-white text-[#4b0f0d] rounded-lg hover:bg-[#f4f0f0] transition-colors text-left group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-lg">Keep Server Changes</span>
              <span className="text-xs text-[#9b9b9b] group-hover:text-[#4b0f0d]">v{remoteVersion}</span>
            </div>
            <div className="text-sm text-[#9b9b9b]">
              Load the latest version from the server. Your unsaved edits will be discarded.
            </div>
          </button>

          <button
            onClick={onCancel}
            className="w-full p-3 text-[#9b9b9b] hover:text-[#4b0f0d] hover:bg-[#f4f0f0] rounded-lg transition-colors font-medium"
          >
            Cancel (Stay on Current Page)
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 How to Avoid Conflicts</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Real-time sync is now active - you'll see updates automatically</li>
            <li>• Save frequently to minimize conflicting changes</li>
            <li>• Coordinate with your team about who edits which sections</li>
            <li>• Check "Last edited by" before making major changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionModal;
