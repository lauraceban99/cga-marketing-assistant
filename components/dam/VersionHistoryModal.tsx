import React, { useState, useEffect } from 'react';
import { getVersionHistory, formatChangeDescription } from '../../services/versionHistoryService';
import type { VersionHistoryEntry } from '../../types';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  currentVersion: number;
  onRestore?: (version: number, snapshot: any) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  brandId,
  currentVersion,
  onRestore
}) => {
  const [history, setHistory] = useState<VersionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, brandId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const versions = await getVersionHistory(brandId, 50);
      setHistory(versions);
    } catch (error) {
      console.error('Failed to load version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'Unknown time';

    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than 1 minute
    if (diff < 60000) return 'Just now';

    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    // Format as date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRestore = (entry: VersionHistoryEntry) => {
    if (window.confirm(`Are you sure you want to restore version ${entry.version}? This will replace your current data.`)) {
      onRestore?.(entry.version, entry.snapshot);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
            <p className="text-sm text-gray-500 mt-1">
              Current version: v{currentVersion} • {history.length} versions saved
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading version history...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No version history found
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => {
                const isExpanded = expandedVersion === entry.version;
                const isCurrent = entry.version === currentVersion;

                return (
                  <div
                    key={entry.versionId}
                    className={`border rounded-lg transition-all ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Version Header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className={`font-semibold ${isCurrent ? 'text-blue-700' : 'text-gray-900'}`}>
                              Version {entry.version}
                              {isCurrent && (
                                <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                                  Current
                                </span>
                              )}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatTimestamp(entry.timestamp)}
                            </span>
                          </div>

                          <div className="mt-1 text-sm text-gray-600">
                            Changed by: <span className="font-medium">{entry.changedByName || entry.changedBy || 'Unknown'}</span>
                          </div>

                          {entry.changes && entry.changes.length > 0 && (
                            <div className="mt-2 text-sm text-gray-700">
                              <span className="font-medium">{entry.changes.length} change{entry.changes.length > 1 ? 's' : ''}</span>
                              {!isExpanded && entry.changes.length > 0 && (
                                <span className="ml-2 text-gray-500">
                                  • {formatChangeDescription(entry.changes[0])}
                                  {entry.changes.length > 1 && ` and ${entry.changes.length - 1} more...`}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {!isCurrent && onRestore && (
                            <button
                              onClick={() => handleRestore(entry)}
                              className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Restore
                            </button>
                          )}

                          {entry.changes && entry.changes.length > 0 && (
                            <button
                              onClick={() => setExpandedVersion(isExpanded ? null : entry.version)}
                              className="text-sm px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                              {isExpanded ? 'Hide' : 'Show'} Changes
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Changes */}
                      {isExpanded && entry.changes && entry.changes.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Changes:</h4>
                          <div className="space-y-2">
                            {entry.changes.map((change, idx) => (
                              <div
                                key={idx}
                                className="text-sm bg-white rounded p-3 border border-gray-200"
                              >
                                <div className="font-medium text-gray-700 mb-1">
                                  {formatChangeDescription(change)}
                                </div>

                                {change.type === 'modified' && (
                                  <div className="mt-2 space-y-1 text-xs">
                                    {change.oldValue && (
                                      <div className="text-red-600">
                                        <span className="font-medium">Old:</span>{' '}
                                        <span className="font-mono bg-red-50 px-1 rounded">
                                          {String(change.oldValue).substring(0, 100)}
                                          {String(change.oldValue).length > 100 && '...'}
                                        </span>
                                      </div>
                                    )}
                                    {change.newValue && (
                                      <div className="text-green-600">
                                        <span className="font-medium">New:</span>{' '}
                                        <span className="font-mono bg-green-50 px-1 rounded">
                                          {String(change.newValue).substring(0, 100)}
                                          {String(change.newValue).length > 100 && '...'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {change.type === 'added' && change.newValue && (
                                  <div className="mt-1 text-xs text-green-600">
                                    <span className="font-medium">Added:</span>{' '}
                                    <span className="font-mono bg-green-50 px-1 rounded">
                                      {String(change.newValue).substring(0, 100)}
                                      {String(change.newValue).length > 100 && '...'}
                                    </span>
                                  </div>
                                )}

                                {change.type === 'deleted' && change.oldValue && (
                                  <div className="mt-1 text-xs text-red-600">
                                    <span className="font-medium">Removed:</span>{' '}
                                    <span className="font-mono bg-red-50 px-1 rounded">
                                      {String(change.oldValue).substring(0, 100)}
                                      {String(change.oldValue).length > 100 && '...'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
