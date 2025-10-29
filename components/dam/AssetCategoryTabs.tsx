import React from 'react';
import type { AssetCategory } from '../../types';
import { ASSET_CATEGORY_CONFIG } from '../../constants/damConfig';

interface AssetCategoryTabsProps {
  activeCategory: AssetCategory;
  onCategoryChange: (category: AssetCategory) => void;
  assetCounts?: Record<AssetCategory, number>;
}

const AssetCategoryTabs: React.FC<AssetCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
  assetCounts,
}) => {
  const categories: AssetCategory[] = [
    'brand-guidelines',
    'competitor-ads',
    'reference-copy',
    'logos',
    'other',
  ];

  return (
    <div className="border-b border-gray-700">
      <div className="flex gap-2 overflow-x-auto">
        {categories.map((category) => {
          const config = ASSET_CATEGORY_CONFIG[category];
          const count = assetCounts?.[category] || 0;
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap
                ${
                  isActive
                    ? 'border-brand-primary text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }
              `}
            >
              <span>{config.icon}</span>
              <span className="text-sm font-medium">{config.label}</span>
              {count > 0 && (
                <span
                  className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${isActive ? 'bg-brand-primary text-white' : 'bg-gray-700 text-gray-300'}
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AssetCategoryTabs;
