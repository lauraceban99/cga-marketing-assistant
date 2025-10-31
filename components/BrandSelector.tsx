import React, { useEffect, useState } from 'react';
import type { Brand, BrandAssetStats } from '../types';
import { hasBrandGuideline } from '../services/firebaseService';
import { getBrandAssetStats } from '../services/assetService';

interface BrandSelectorProps {
  brands: Brand[];
  onSelectBrand: (brand: Brand) => void;
}

const BrandSelector: React.FC<BrandSelectorProps> = ({ brands, onSelectBrand }) => {
  const [guidelinesStatus, setGuidelinesStatus] = useState<Record<string, boolean>>({});
  const [assetStats, setAssetStats] = useState<Record<string, BrandAssetStats>>({});

  useEffect(() => {
    const loadBrandData = async () => {
      const statusMap: Record<string, boolean> = {};
      const statsMap: Record<string, BrandAssetStats> = {};

      for (const brand of brands) {
        try {
          // Check old guidelines
          statusMap[brand.id] = await hasBrandGuideline(brand.id);

          // Load asset stats
          const stats = await getBrandAssetStats(brand.id);
          statsMap[brand.id] = stats;
        } catch (error) {
          statusMap[brand.id] = false;
        }
      }

      setGuidelinesStatus(statusMap);
      setAssetStats(statsMap);
    };

    loadBrandData();
  }, [brands]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-semibold text-center text-white mb-6">1. Select a Brand to Begin</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => {
          const hasGuidelines = guidelinesStatus[brand.id] || false;
          const stats = assetStats[brand.id];
          const hasAssets = stats && stats.totalAssets > 0;

          return (
            <button
              key={brand.id}
              onClick={() => onSelectBrand(brand)}
              className="group relative p-6 text-left bg-gray-800 rounded-lg border border-gray-700 hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              aria-label={`Select brand: ${brand.name}`}
            >
              {/* Status Indicators */}
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                {/* Asset Count */}
                {hasAssets && (
                  <span className="flex items-center gap-1 text-xs text-blue-400" title="Brand assets">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                    {stats.totalAssets} assets
                  </span>
                )}
                {/* Old PDF Guidelines */}
                {hasGuidelines && (
                  <span className="flex items-center gap-1 text-xs text-green-400" title="PDF guidelines loaded">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                    Old PDF
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={`${brand.name} logo`}
                    className="h-16 w-16 object-contain flex-shrink-0 rounded"
                  />
                ) : (
                  <span className={`h-16 w-16 rounded-full flex-shrink-0 ${brand.color} flex items-center justify-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4"></path></svg>
                  </span>
                )}
                <h3 className="text-xl font-bold text-white">{brand.name}</h3>
              </div>
              <p className="mt-3 text-sm text-gray-400">Click to generate marketing assets using the {brand.name} brand guidelines.</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BrandSelector;
