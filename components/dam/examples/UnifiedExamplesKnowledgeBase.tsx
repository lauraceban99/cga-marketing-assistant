import React, { useState, useEffect, useRef } from 'react';
import type { CampaignExample } from '../../../types';
import ExampleCard from './ExampleCard';

interface UnifiedExamplesKnowledgeBaseProps {
  title: string;
  description: string;
  examples: CampaignExample[];
  onAddExample: () => void;
  onUpdateExample: (index: number, field: keyof CampaignExample, value: any) => void;
  onDeleteExample: (index: number) => void;
  onSave: () => void;
}

const UnifiedExamplesKnowledgeBase: React.FC<UnifiedExamplesKnowledgeBaseProps> = ({
  title,
  description,
  examples,
  onAddExample,
  onUpdateExample,
  onDeleteExample,
  onSave,
}) => {
  const [newExampleIndices, setNewExampleIndices] = useState<Set<number>>(new Set());
  const previousExampleCount = useRef(examples.length);

  // Track when new examples are added
  useEffect(() => {
    if (examples.length > previousExampleCount.current) {
      // New examples were added - mark the new ones
      const newIndices = new Set(newExampleIndices);
      for (let i = previousExampleCount.current; i < examples.length; i++) {
        newIndices.add(i);
      }
      setNewExampleIndices(newIndices);
    }
    previousExampleCount.current = examples.length;
  }, [examples.length]);

  const handleSave = () => {
    onSave();
    // Clear new example flags after save
    setNewExampleIndices(new Set());
  };

  const handleDelete = (index: number) => {
    onDeleteExample(index);
    // Remove from new indices set
    const newIndices = new Set(newExampleIndices);
    newIndices.delete(index);
    setNewExampleIndices(newIndices);
  };
  return (
    <div className="bg-white rounded-lg border-2 border-[#f4f0f0] p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#4b0f0d] flex items-center gap-2">
          📚 {title}
        </h3>
        <p className="text-sm text-[#9b9b9b] mt-1">{description}</p>
      </div>

      {/* Examples Grid */}
      {examples.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {examples.map((example, index) => (
            <ExampleCard
              key={index}
              example={example}
              index={index}
              onUpdate={(field, value) => onUpdateExample(index, field, value)}
              onDelete={() => handleDelete(index)}
              onSave={handleSave}
              isNew={newExampleIndices.has(index)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 mb-6">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-[#9b9b9b] text-sm">
            No examples added yet
          </p>
        </div>
      )}

      {/* Add Example Button */}
      <button
        onClick={onAddExample}
        className="w-full px-4 py-3 bg-[#f4f0f0] text-[#780817] border-2 border-dashed border-[#780817] rounded-lg hover:bg-[#780817] hover:text-white transition-colors font-semibold"
      >
        + Add Example
      </button>

      {/* Save Button */}
      <div className="mt-6 pt-4 border-t border-[#f4f0f0]">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors"
        >
          Save All Changes
        </button>
      </div>
    </div>
  );
};

export default UnifiedExamplesKnowledgeBase;
