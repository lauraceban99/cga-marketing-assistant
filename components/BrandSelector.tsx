import React from 'react';
import type { Brand } from '../types';

interface BrandSelectorProps {
  brands: Brand[];
  onSelectBrand: (brand: Brand) => void;
}

const BrandSelector: React.FC<BrandSelectorProps> = ({ brands, onSelectBrand }) => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-semibold text-center text-white mb-6">1. Select a Brand to Begin</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <button
            key={brand.id}
            onClick={() => onSelectBrand(brand)}
            className="group relative p-6 text-left bg-gray-800 rounded-lg border border-gray-700 hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            aria-label={`Select brand: ${brand.name}`}
          >
            <div className="flex items-center gap-4">
                 <span className={`h-8 w-8 rounded-full flex-shrink-0 ${brand.color} flex items-center justify-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4"></path></svg>
                 </span>
                <h3 className="text-xl font-bold text-white">{brand.name}</h3>
            </div>
            <p className="mt-3 text-sm text-gray-400">Click to generate marketing assets using the {brand.name} brand guidelines.</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandSelector;
