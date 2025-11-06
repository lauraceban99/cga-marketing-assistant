import React, { useState } from 'react';
import { BRANDS } from '../../constants';
import type { Brand } from '../../types';
import BrandInstructionsEditor from './BrandInstructionsEditor';

interface BrandAssetManagerProps {
  onBack: () => void;
}

const BrandAssetManager: React.FC<BrandAssetManagerProps> = ({ onBack }) => {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const handleBrandClick = (brand: Brand) => {
    setSelectedBrand(brand);
  };

  const handleBack = () => {
    setSelectedBrand(null);
  };

  // If a brand is selected, show the instructions editor
  if (selectedBrand) {
    return <BrandInstructionsEditor brand={selectedBrand} onBack={handleBack} />;
  }

  // Otherwise, show the brand selector
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#4b0f0d]">Brand Instructions Manager</h1>
            <p className="text-[#9b9b9b] mt-1">
              Manage brand instructions and content examples for each brand
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[#f4f0f0] text-[#4b0f0d] rounded-lg hover:bg-[#04114a]/10 transition-colors"
          >
            ← Back to App
          </button>
        </div>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BRANDS.map((brand) => (
          <button
            key={brand.id}
            onClick={() => handleBrandClick(brand)}
            className="group p-6 text-left bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg hover:border-[#780817] transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Logo */}
            <div className="flex items-center justify-center h-20 mb-4">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={`${brand.name} logo`}
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <span className={`h-16 w-16 rounded-full ${brand.color} flex items-center justify-center text-2xl font-bold text-white`}>
                  {brand.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Brand Name */}
            <div className="text-center mb-2">
              <h3 className="text-xl font-bold text-[#4b0f0d]">{brand.name}</h3>
              <p className="text-sm text-[#9b9b9b]">{brand.id}</p>
            </div>

            {/* Description */}
            <p className="text-sm text-[#9b9b9b] text-center mt-2">
              Edit instructions and examples
            </p>

            {/* Arrow */}
            <div className="mt-4 text-[#9b9b9b] group-hover:text-[#780817] transition-colors flex items-center justify-center gap-1 text-sm">
              <span>Manage Instructions</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandAssetManager;
