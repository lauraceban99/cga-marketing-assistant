import React, { useState, useEffect } from 'react';
import { BRANDS } from '../../constants';
import type { Brand, BrandAssetStats } from '../../types';
import { getBrandAssetStats } from '../../services/assetService';
import BrandAssetDashboard from './BrandAssetDashboard';

interface BrandAssetManagerProps {
  onBack: () => void;
}

const BrandAssetManager: React.FC<BrandAssetManagerProps> = ({ onBack }) => {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brandStats, setBrandStats] = useState<Record<string, BrandAssetStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    setLoading(true);
    const statsMap: Record<string, BrandAssetStats> = {};

    for (const brand of BRANDS) {
      try {
        const stats = await getBrandAssetStats(brand.id);
        statsMap[brand.id] = stats;
      } catch (error) {
        console.error(`Error loading stats for ${brand.id}:`, error);
      }
    }

    setBrandStats(statsMap);
    setLoading(false);
  };

  const handleBrandClick = (brand: Brand) => {
    setSelectedBrand(brand);
  };

  const handleBack = () => {
    setSelectedBrand(null);
    loadAllStats(); // Refresh stats when coming back
  };

  // If a brand is selected, show its dashboard
  if (selectedBrand) {
    return <BrandAssetDashboard brand={selectedBrand} onBack={handleBack} />;
  }

  // Otherwise, show the main manager view
  const totalAssets = Object.values(brandStats).reduce(
    (sum, stats) => sum + stats.totalAssets,
    0
  );
  const brandsWithAssets = Object.values(brandStats).filter(
    (stats) => stats.totalAssets > 0
  ).length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#4b0f0d]">Brand Asset Manager</h1>
            <p className="text-[#9b9b9b] mt-1">
              Manage digital assets for all brands
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[#f4f0f0] text-[#4b0f0d] rounded-lg hover:bg-[#04114a]/10 transition-colors"
          >
            ← Back to App
          </button>
        </div>

        {/* Global Stats */}
        {!loading && (
          <div className="flex gap-4 flex-wrap">
            <div className="bg-white rounded-lg px-4 py-3 border-2 border-[#f4f0f0] shadow-lg">
              <p className="text-sm text-[#9b9b9b]">Total Brands</p>
              <p className="text-2xl font-bold text-[#4b0f0d]">{BRANDS.length}</p>
            </div>
            <div className="bg-white rounded-lg px-4 py-3 border-2 border-[#f4f0f0] shadow-lg">
              <p className="text-sm text-[#9b9b9b]">With Assets</p>
              <p className="text-2xl font-bold text-green-400">{brandsWithAssets}</p>
            </div>
            <div className="bg-white rounded-lg px-4 py-3 border-2 border-[#f4f0f0] shadow-lg">
              <p className="text-sm text-[#9b9b9b]">Total Assets</p>
              <p className="text-2xl font-bold text-blue-400">{totalAssets}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          <p className="text-[#9b9b9b] mt-4">Loading brand assets...</p>
        </div>
      )}

      {/* Brand Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BRANDS.map((brand) => {
            const stats = brandStats[brand.id];
            const hasAssets = stats && stats.totalAssets > 0;

            return (
              <button
                key={brand.id}
                onClick={() => handleBrandClick(brand)}
                className="group p-6 text-left bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-10 w-10 rounded-full flex-shrink-0 ${brand.color} flex items-center justify-center`}
                    >
                      {hasAssets ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="rgba(255,255,255,0.9)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 12 2 2 4-4"></path>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="rgba(255,255,255,0.6)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      )}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-[#4b0f0d]">{brand.name}</h3>
                      <p className="text-sm text-[#9b9b9b]">{brand.id}</p>
                    </div>
                  </div>
                  {hasAssets ? (
                    <span className="px-2 py-1 bg-green-900 text-green-300 text-xs font-medium rounded flex items-center gap-1">
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
                  ) : (
                    <span className="px-2 py-1 bg-red-900 text-red-300 text-xs font-medium rounded">
                      No assets
                    </span>
                  )}
                </div>

                {/* Stats */}
                {hasAssets && stats && (
                  <div className="space-y-2 text-sm">
                    {stats.assetsByCategory['brand-guidelines'] > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#9b9b9b]">📋 Guidelines</span>
                        <span className="text-[#4b0f0d] font-semibold">
                          {stats.assetsByCategory['brand-guidelines']}
                        </span>
                      </div>
                    )}
                    {stats.assetsByCategory['competitor-ads'] > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#9b9b9b]">🎯 Ad Examples</span>
                        <span className="text-[#4b0f0d] font-semibold">
                          {stats.assetsByCategory['competitor-ads']}
                        </span>
                      </div>
                    )}
                    {stats.assetsByCategory['reference-copy'] > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#9b9b9b]">✍️ Reference Copy</span>
                        <span className="text-[#4b0f0d] font-semibold">
                          {stats.assetsByCategory['reference-copy']}
                        </span>
                      </div>
                    )}
                    {stats.assetsByCategory['logos'] > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#9b9b9b]">🏷️ Logos</span>
                        <span className="text-[#4b0f0d] font-semibold">
                          {stats.assetsByCategory['logos']}
                        </span>
                      </div>
                    )}
                    {stats.assetsByCategory['other'] > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#9b9b9b]">📦 Other</span>
                        <span className="text-[#4b0f0d] font-semibold">
                          {stats.assetsByCategory['other']}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {!hasAssets && (
                  <p className="text-sm text-gray-500 mt-4">
                    Click to start adding assets for {brand.name}
                  </p>
                )}

                {/* Arrow */}
                <div className="mt-4 text-gray-500 group-hover:text-brand-primary transition-colors flex items-center gap-1 text-sm">
                  Manage Assets
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrandAssetManager;
