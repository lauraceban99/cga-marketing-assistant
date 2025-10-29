import React, { useState, useEffect } from 'react';
import InstructionSection from './InstructionSection';
import { useBrandInstructions } from '../../../hooks/useBrandInstructions';

interface InstructionsTabProps {
  brandId: string;
  brandName: string;
}

type EditableSection =
  | 'copySystemPrompt'
  | 'copyUserPromptTemplate'
  | 'toneRules'
  | 'imageGenerationInstructions'
  | 'imageStyleGuidelines'
  | null;

const InstructionsTab: React.FC<InstructionsTabProps> = ({ brandId, brandName }) => {
  const { instructions, loading, error, saving, save, reset, updateLocal } =
    useBrandInstructions(brandId);
  const [editingSection, setEditingSection] = useState<EditableSection>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [localInstructions, setLocalInstructions] = useState(instructions);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Update local instructions when loaded
  useEffect(() => {
    setLocalInstructions(instructions);
  }, [instructions]);

  const handleChange = (field: keyof typeof localInstructions, value: string) => {
    if (!localInstructions) return;
    setLocalInstructions({ ...localInstructions, [field]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!localInstructions) return;
    try {
      await save(localInstructions);
      setHasChanges(false);
      alert('Instructions saved successfully!');
    } catch (err) {
      alert(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all instructions to defaults? This cannot be undone.')) {
      return;
    }
    try {
      await reset();
      setHasChanges(false);
      setShowResetConfirm(false);
      alert('Instructions reset to defaults');
    } catch (err) {
      alert(`Failed to reset: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDiscard = () => {
    if (!confirm('Discard unsaved changes?')) return;
    setLocalInstructions(instructions);
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        <p className="text-gray-400 mt-4 text-sm">Loading instructions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4">
        <p className="text-red-300 text-sm">Error: {error}</p>
      </div>
    );
  }

  if (!localInstructions) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No instructions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🤖 Generation Instructions
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Control how AI generates content for {brandName}
          </p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={handleDiscard}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Discard Changes
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm text-blue-300">
              These instructions control how the AI generates ads, copy, and images for this brand.
              Changes will apply to all future content generation.
            </p>
            <p className="text-xs text-blue-400 mt-1">
              Use template variables like {'{'}{'{'} brand {'}'}{'}'}  and {'{'}{'{'} theme {'}'}{'}'}  to
              dynamically insert values.
            </p>
          </div>
        </div>
      </div>

      {/* Instruction Sections */}
      <div className="space-y-4">
        {/* Copy System Prompt */}
        <InstructionSection
          title="Copy System Prompt"
          description="Define the AI's persona and behavior when writing ad copy"
          value={localInstructions.copySystemPrompt}
          isEditing={editingSection === 'copySystemPrompt'}
          onToggleEdit={() =>
            setEditingSection(
              editingSection === 'copySystemPrompt' ? null : 'copySystemPrompt'
            )
          }
          onChange={(value) => handleChange('copySystemPrompt', value)}
          rows={6}
        />

        {/* Copy User Prompt Template */}
        <InstructionSection
          title="Copy User Prompt Template"
          description="Structure and format for ad generation requests"
          value={localInstructions.copyUserPromptTemplate}
          isEditing={editingSection === 'copyUserPromptTemplate'}
          onToggleEdit={() =>
            setEditingSection(
              editingSection === 'copyUserPromptTemplate' ? null : 'copyUserPromptTemplate'
            )
          }
          onChange={(value) => handleChange('copyUserPromptTemplate', value)}
          showVariables={true}
          rows={12}
        />

        {/* Tone & Voice Rules */}
        <InstructionSection
          title="Tone & Voice Rules"
          description="Specific dos and don'ts for brand voice"
          value={localInstructions.toneRules}
          isEditing={editingSection === 'toneRules'}
          onToggleEdit={() =>
            setEditingSection(editingSection === 'toneRules' ? null : 'toneRules')
          }
          onChange={(value) => handleChange('toneRules', value)}
          rows={8}
        />

        {/* Image Generation Instructions */}
        <InstructionSection
          title="Image Generation Instructions"
          description="How to create image prompts for this brand"
          value={localInstructions.imageGenerationInstructions}
          isEditing={editingSection === 'imageGenerationInstructions'}
          onToggleEdit={() =>
            setEditingSection(
              editingSection === 'imageGenerationInstructions'
                ? null
                : 'imageGenerationInstructions'
            )
          }
          onChange={(value) => handleChange('imageGenerationInstructions', value)}
          rows={10}
        />

        {/* Image Style Guidelines */}
        <InstructionSection
          title="Image Style Guidelines"
          description="Visual style and aesthetic preferences"
          value={localInstructions.imageStyleGuidelines}
          isEditing={editingSection === 'imageStyleGuidelines'}
          onToggleEdit={() =>
            setEditingSection(
              editingSection === 'imageStyleGuidelines' ? null : 'imageStyleGuidelines'
            )
          }
          onChange={(value) => handleChange('imageStyleGuidelines', value)}
          rows={4}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-700">
        <button
          onClick={handleReset}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Reset to Defaults
        </button>
        <div className="text-xs text-gray-500">
          {instructions?.lastUpdatedBy && (
            <>
              Last updated by {instructions.lastUpdatedBy} •{' '}
              Version {instructions.version}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructionsTab;
