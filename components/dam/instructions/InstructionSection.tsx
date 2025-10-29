import React, { useState } from 'react';
import { TEMPLATE_VARIABLES } from '../../../constants/damConfig';

interface InstructionSectionProps {
  title: string;
  description: string;
  value: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onChange: (value: string) => void;
  showVariables?: boolean;
  rows?: number;
}

const InstructionSection: React.FC<InstructionSectionProps> = ({
  title,
  description,
  value,
  isEditing,
  onToggleEdit,
  onChange,
  showVariables = false,
  rows = 8,
}) => {
  const [showVariableHelper, setShowVariableHelper] = useState(false);

  const insertVariable = (variable: string) => {
    onChange(value + variable);
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-750"
        onClick={onToggleEdit}
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            {title}
            {isEditing && (
              <span className="text-xs px-2 py-0.5 bg-brand-primary rounded-full">
                Editing
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
        <button className="text-gray-400 hover:text-white ml-4">
          <svg
            className={`w-5 h-5 transition-transform ${isEditing ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      {isEditing && (
        <div className="p-4 border-t border-gray-700 bg-gray-850">
          {/* Editor */}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary resize-y"
            placeholder={`Enter ${title.toLowerCase()}...`}
          />

          {/* Variable Helper */}
          {showVariables && (
            <div className="mt-3">
              <button
                onClick={() => setShowVariableHelper(!showVariableHelper)}
                className="text-xs text-brand-primary hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {showVariableHelper ? 'Hide' : 'Show'} available variables
              </button>

              {showVariableHelper && (
                <div className="mt-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400 mb-2">
                    Click a variable to insert it into your prompt:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(TEMPLATE_VARIABLES).map(([variable, desc]) => (
                      <button
                        key={variable}
                        onClick={() => insertVariable(variable)}
                        className="text-left p-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                      >
                        <div className="text-xs font-mono text-brand-primary">{variable}</div>
                        <div className="text-xs text-gray-400 mt-1">{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="mt-3 p-3 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg">
            <p className="text-xs text-blue-300">
              💡 Tip: Be specific about tone, style, and constraints. This controls how the AI
              generates content for this brand.
            </p>
          </div>
        </div>
      )}

      {/* Preview (when collapsed) */}
      {!isEditing && (
        <div className="p-4 border-t border-gray-700">
          <div className="text-sm text-gray-300 font-mono whitespace-pre-wrap line-clamp-3">
            {value || <span className="text-gray-500 italic">No content</span>}
          </div>
          <button
            onClick={onToggleEdit}
            className="text-xs text-brand-primary hover:underline mt-2"
          >
            Expand to edit →
          </button>
        </div>
      )}
    </div>
  );
};

export default InstructionSection;
