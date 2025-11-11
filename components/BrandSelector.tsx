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
      <h2 className="text-3xl font-bold text-center text-[#4b0f0d] mb-12">1. Select a Brand to Begin</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {brands.map((brand) => {
          const hasGuidelines = guidelinesStatus[brand.id] || false;
          const stats = assetStats[brand.id];
          const hasAssets = stats && stats.totalAssets > 0;

          return (
            <button
              key={brand.id}
              onClick={() => onSelectBrand(brand)}
              className="group relative p-8 text-center bg-white rounded-xl border-2 border-[#f4f0f0] hover:border-[#780817]/30 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#780817]"
              aria-label={`Select brand: ${brand.name}`}
            >
              {/* Status Indicators */}
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                {/* Asset Count */}
                {hasAssets && (
                  <span className="px-3 py-1 bg-[#04114a] text-white text-xs rounded-full font-medium" title="Brand assets">
                    {stats.totalAssets} assets
                  </span>
                )}
                {/* Old PDF Guidelines */}
                {hasGuidelines && (
                  <span className="px-3 py-1 bg-[#780817] text-white text-xs rounded-full font-medium" title="PDF guidelines loaded">
                    PDF
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center gap-5">
                {/* Logo Container - standardized dimensions */}
                <div className="flex items-center justify-center" style={{ width: '120px', height: '120px' }}>
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={`${brand.name} logo`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <span className={`h-20 w-20 rounded-full flex-shrink-0 ${brand.color} flex items-center justify-center`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4"></path></svg>
                    </span>
                  )}
                </div>

                {/* Brand Name */}
                <h3 className="text-2xl font-bold text-[#4b0f0d] leading-tight">{brand.name}</h3>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BrandSelector;
