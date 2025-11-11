import React, { useState } from 'react';
import type { CampaignExample, Market, Platform } from '../../../types';
import ExampleCard from './ExampleCard';

interface LandingPageExamplesKnowledgeBaseProps {
  title: string;
  description: string;
  examples: CampaignExample[];
  onAddExample: (market: Market) => void;
  onUpdateExample: (index: number, field: keyof CampaignExample, value: any) => void;
  onDeleteExample: (index: number) => void;
  onSave: () => void;
}

const LandingPageExamplesKnowledgeBase: React.FC<LandingPageExamplesKnowledgeBaseProps> = ({
  title,
  description,
  examples,
  onAddExample,
  onUpdateExample,
  onDeleteExample,
  onSave,
}) => {
  const [activePlatform, setActivePlatform] = useState<Platform>('META');
  const [activeMarket, setActiveMarket] = useState<Market>('EMEA');

  // Filter examples by platform AND market
  const filteredExamples = examples.filter(
    (ex) => ex.platform === activePlatform && ex.market === activeMarket
  );

  // Get indices in original array for filtered examples
  const getOriginalIndex = (filteredIndex: number): number => {
    const filteredExample = filteredExamples[filteredIndex];
    return examples.findIndex((ex) => ex === filteredExample);
  };

  const platformConfig = {
    META: {
      label: 'META',
      fullName: 'META Ads (Facebook, Instagram)',
      description: 'Social audience, interruption marketing, emotion-driven, storytelling focus',
      icon: '📱',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
    },
    GOOGLE: {
      label: 'GOOGLE',
      fullName: 'GOOGLE Ads & Organic (Search, Display)',
      description: 'High-intent searchers, problem-aware, comparison-shopping, data-driven',
      icon: '🔍',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
    },
  };

  const marketConfig = {
    ASIA: {
      label: 'ASIA',
      fullName: 'Asia (Singapore, Hong Kong, Vietnam)',
      description: 'Contrarian educational positioning, extreme specificity, university prestige focus',
    },
    EMEA: {
      label: 'EMEA',
      fullName: 'EMEA (UAE, Middle East, Europe)',
      description: 'Urgency + aspiration, social proof stacking, enrollment focus',
    },
    ANZ: {
      label: 'ANZ',
      fullName: 'ANZ (Australia, New Zealand)',
      description: 'Gentle challenge to traditional, flexibility focus, local credibility',
    },
    Japan: {
      label: 'Japan',
      fullName: 'Japan',
      description: 'Both/and reassurance, process-oriented, authentic testimonials',
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

      {/* Platform Tabs - PRIMARY */}
      <div className="flex gap-3 mb-6">
        {(['META', 'GOOGLE'] as Platform[]).map((platform) => {
          const config = platformConfig[platform];
          const count = examples.filter((ex) => ex.platform === platform).length;
          const isActive = activePlatform === platform;

          return (
            <button
              key={platform}
              onClick={() => setActivePlatform(platform)}
              className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all ${
                isActive
                  ? `${config.bgColor} ${config.borderColor} shadow-md`
                  : 'bg-white border-[#f4f0f0] hover:border-[#9b9b9b]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{config.icon}</span>
                {count > 0 && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      isActive ? `${config.bgColor} ${config.textColor}` : 'bg-[#f4f0f0] text-[#9b9b9b]'
                    }`}
                  >
                    {count} examples
                  </span>
                )}
              </div>
              <div className={`font-bold ${isActive ? config.textColor : 'text-[#4b0f0d]'}`}>
                {config.label}
              </div>
              <div className={`text-xs mt-1 ${isActive ? config.textColor : 'text-[#9b9b9b]'}`}>
                {config.fullName}
              </div>
            </button>
          );
        })}
      </div>

      {/* Platform description */}
      <div className={`mb-4 p-4 rounded-md ${platformConfig[activePlatform].bgColor} ${platformConfig[activePlatform].borderColor} border-2`}>
        <p className={`text-sm font-semibold mb-1 ${platformConfig[activePlatform].textColor}`}>
          {platformConfig[activePlatform].icon} {platformConfig[activePlatform].fullName}
        </p>
        <p className="text-xs text-[#4b0f0d]">
          {platformConfig[activePlatform].description}
        </p>
      </div>

      {/* Market Tabs - SECONDARY */}
      <div className="flex gap-2 mb-6 border-b-2 border-[#f4f0f0]">
        {(['ASIA', 'EMEA', 'ANZ', 'Japan'] as Market[]).map((market) => {
          const config = marketConfig[market];
          const count = examples.filter((ex) => ex.platform === activePlatform && ex.market === market).length;
          const isActive = activeMarket === market;

          return (
            <button
              key={market}
              onClick={() => setActiveMarket(market)}
              className={`px-4 py-2 font-medium text-sm transition-all relative ${
                isActive
                  ? 'text-[#780817] border-b-2 border-[#780817] -mb-0.5'
                  : 'text-[#9b9b9b] hover:text-[#4b0f0d]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{config.label}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs ${
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

      {/* Market description */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
        <p className="text-sm text-[#4b0f0d] font-semibold mb-1">
          {marketConfig[activeMarket].fullName}
        </p>
        <p className="text-xs text-[#9b9b9b]">
          {marketConfig[activeMarket].description}
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
          <p className="text-[#9b9b9b] text-sm mb-2">
            No {platformConfig[activePlatform].label} examples for {marketConfig[activeMarket].label} yet
          </p>
          <p className="text-xs text-[#9b9b9b]">
            Add real landing pages from campaigns to teach the AI what works
          </p>
        </div>
      )}

      {/* Add Example Button */}
      <button
        onClick={() => onAddExample(activeMarket)}
        className="w-full px-4 py-3 bg-[#f4f0f0] text-[#780817] border-2 border-dashed border-[#780817] rounded-lg hover:bg-[#780817] hover:text-white transition-colors font-semibold"
      >
        + Add {platformConfig[activePlatform].label} Example for {marketConfig[activeMarket].label}
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

export default LandingPageExamplesKnowledgeBase;
