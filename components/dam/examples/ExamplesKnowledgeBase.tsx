import React, { useState } from 'react';
import type { CampaignExample, CampaignStage, TaskType } from '../../../types';
import ExampleCard from './ExampleCard';

interface ExamplesKnowledgeBaseProps {
  title: string;
  description: string;
  examples: CampaignExample[];
  onAddExample: (stage: CampaignStage) => void;
  onUpdateExample: (index: number, field: keyof CampaignExample, value: any) => void;
  onDeleteExample: (index: number) => void;
  onSave: () => void;
}

const ExamplesKnowledgeBase: React.FC<ExamplesKnowledgeBaseProps> = ({
  title,
  description,
  examples,
  onAddExample,
  onUpdateExample,
  onDeleteExample,
  onSave,
}) => {
  const [activeStage, setActiveStage] = useState<CampaignStage>('tofu');

  // Filter examples by active stage
  const filteredExamples = examples.filter((ex) => ex.stage === activeStage);

  // Get indices in original array for filtered examples
  const getOriginalIndex = (filteredIndex: number): number => {
    const filteredExample = filteredExamples[filteredIndex];
    return examples.findIndex((ex) => ex === filteredExample);
  };

  const stageConfig = {
    tofu: {
      label: 'TOFU',
      fullName: 'Top of Funnel - Awareness',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      activeColor: 'bg-[#780817] text-white',
    },
    mofu: {
      label: 'MOFU',
      fullName: 'Middle of Funnel - Consideration',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      activeColor: 'bg-[#780817] text-white',
    },
    bofu: {
      label: 'BOFU',
      fullName: 'Bottom of Funnel - Decision',
      color: 'bg-green-100 text-green-800 border-green-300',
      activeColor: 'bg-[#780817] text-white',
    },
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

      {/* Funnel Stage Tabs */}
      <div className="flex gap-2 mb-6 border-b-2 border-[#f4f0f0]">
        {(['tofu', 'mofu', 'bofu'] as CampaignStage[]).map((stage) => {
          const config = stageConfig[stage];
          const count = examples.filter((ex) => ex.stage === stage).length;
          const isActive = activeStage === stage;

          return (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`px-6 py-3 font-semibold transition-all relative ${
                isActive
                  ? 'text-[#780817] border-b-2 border-[#780817] -mb-0.5'
                  : 'text-[#9b9b9b] hover:text-[#4b0f0d]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{config.label}</span>
                {count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive ? 'bg-[#780817] text-white' : 'bg-[#f4f0f0] text-[#9b9b9b]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage description */}
      <div className="mb-4 p-3 bg-[#f4f0f0] rounded-md">
        <p className="text-sm text-[#4b0f0d]">
          <strong>{stageConfig[activeStage].fullName}</strong>
        </p>
      </div>

      {/* Examples Grid */}
      {filteredExamples.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredExamples.map((example, filteredIndex) => {
            const originalIndex = getOriginalIndex(filteredIndex);
            return (
              <ExampleCard
                key={originalIndex}
                example={example}
                index={originalIndex}
                onUpdate={(field, value) => onUpdateExample(originalIndex, field, value)}
                onDelete={() => onDeleteExample(originalIndex)}
                onSave={onSave}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 mb-6">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-[#9b9b9b] text-sm">
            No examples added for {stageConfig[activeStage].label} yet
          </p>
        </div>
      )}

      {/* Add Example Button */}
      <button
        onClick={() => onAddExample(activeStage)}
        className="w-full px-4 py-3 bg-[#f4f0f0] text-[#780817] border-2 border-dashed border-[#780817] rounded-lg hover:bg-[#780817] hover:text-white transition-colors font-semibold"
      >
        + Add Example to {stageConfig[activeStage].label}
      </button>

      {/* Save Button */}
      <div className="mt-6 pt-4 border-t border-[#f4f0f0]">
        <button
          onClick={onSave}
          className="px-6 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors"
        >
          Save All Changes
        </button>
      </div>
    </div>
  );
};

export default ExamplesKnowledgeBase;
