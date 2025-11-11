import React, { useState } from 'react';

interface InstructionFieldProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  lastSaved?: Date;
  placeholder?: string;
  rows?: number;
  description?: string;
}

const InstructionField: React.FC<InstructionFieldProps> = ({
  title,
  value,
  onChange,
  onSave,
  lastSaved,
  placeholder,
  rows = 6,
  description,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    onSave();
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Locked state (default)
  if (!isEditing && !showSuccess) {
    return (
      <div className="bg-white rounded-lg border-2 border-[#f4f0f0] overflow-hidden">
        <div className="flex items-center justify-between p-4 hover:bg-[#f4f0f0] transition-colors">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[#9b9b9b]">🔒</span>
              <h3 className="text-md font-semibold text-[#4b0f0d]">{title}</h3>
            </div>
            {lastSaved && (
              <p className="text-xs text-[#9b9b9b] mt-1">
                Last saved: {formatRelativeTime(lastSaved)}
              </p>
            )}
            {description && (
              <p className="text-xs text-[#9b9b9b] mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-4 py-2 text-sm text-[#780817] hover:bg-white rounded-md transition-colors font-medium"
          >
            ✏️ Edit
          </button>
        </div>
      </div>
    );
  }

  // Just saved state (brief success message)
  if (showSuccess) {
    return (
      <div className="bg-green-50 rounded-lg border-2 border-green-200 overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <h3 className="text-md font-semibold text-green-600">Saved: {title}</h3>
            </div>
            <p className="text-xs text-green-600 mt-1">Last saved: Just now</p>
          </div>
        </div>
      </div>
    );
  }

  // Editing state
  return (
    <div className="bg-blue-50 rounded-lg border-2 border-blue-200 overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-200">
          <span className="text-blue-600">✏️</span>
          <h3 className="text-md font-semibold text-blue-600">Editing: {title}</h3>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-[#9b9b9b] mb-3">{description}</p>
        )}

        {/* Editor */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817] text-sm"
          autoFocus
        />

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors text-sm"
          >
            <span>💾</span> Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 px-4 py-2 bg-white text-[#780817] border border-[#780817] font-semibold rounded-md hover:bg-[#f4f0f0] transition-colors text-sm"
          >
            <span>❌</span> Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionField;
