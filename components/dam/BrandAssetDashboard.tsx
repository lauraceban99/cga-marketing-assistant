import React, { useState } from 'react';
import type { Brand, AssetCategory } from '../../types';
import { useAssetsByCategory, useAssetActions, useBrandAssetStats } from '../../hooks/useAssets';
import AssetCategoryTabs from './AssetCategoryTabs';
import AssetCard from './AssetCard';
import AssetUploader from './AssetUploader';
import { ASSET_CATEGORY_CONFIG } from '../../constants/damConfig';

interface BrandAssetDashboardProps {
  brand: Brand;
  onBack: () => void;
}

const BrandAssetDashboard: React.FC<BrandAssetDashboardProps> = ({
  brand,
  onBack,
}) => {
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('brand-guidelines');
  const [showUploader, setShowUploader] = useState(false);

  const { assets, loading, error, refresh } = useAssetsByCategory(brand.id, activeCategory);
  const { stats, refresh: refreshStats } = useBrandAssetStats(brand.id);
  const { deleteAsset } = useAssetActions();

  const categoryConfig = ASSET_CATEGORY_CONFIG[activeCategory];

  const handleDelete = async (assetId: string) => {
    try {
      await deleteAsset(assetId);
      refresh();
      refreshStats();
    } catch (error) {
      console.error('Failed to delete asset:', error);
      alert('Failed to delete asset');
    }
  };

  const handleUploadSuccess = () => {
    setShowUploader(false);
    refresh();
    refreshStats();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Determine if we should show grid or list view
  const isImageCategory = activeCategory === 'competitor-ads' || activeCategory === 'logos';
  const viewMode = isImageCategory ? 'grid' : 'list';

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white mb-2 flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Brands
            </button>
            <h1 className="text-3xl font-bold text-white">{brand.name} Asset Library</h1>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="flex gap-4 flex-wrap text-sm">
            <div className="bg-gray-800 rounded px-3 py-2 border border-gray-700">
              <span className="text-gray-400">Total Assets:</span>{' '}
              <span className="text-white font-semibold">{stats.totalAssets}</span>
            </div>
            <div className="bg-gray-800 rounded px-3 py-2 border border-gray-700">
              <span className="text-gray-400">Total Size:</span>{' '}
              <span className="text-white font-semibold">{formatFileSize(stats.totalSize)}</span>
            </div>
            {stats.lastUpdated && (
              <div className="bg-gray-800 rounded px-3 py-2 border border-gray-700">
                <span className="text-gray-400">Last Updated:</span>{' '}
                <span className="text-white font-semibold">{formatDate(stats.lastUpdated)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <AssetCategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        assetCounts={stats?.assetsByCategory}
      />

      {/* Content */}
      <div className="mt-6">
        {/* Category Info & Upload Button */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              {categoryConfig.icon} {categoryConfig.label}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{categoryConfig.description}</p>
          </div>
          <button
            onClick={() => setShowUploader(true)}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Assets
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            <p className="text-gray-400 mt-4 text-sm">Loading assets...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4">
            <p className="text-red-300 text-sm">Error: {error}</p>
          </div>
        )}

        {/* Assets */}
        {!loading && !error && (
          <>
            {assets.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-4xl mb-3">{categoryConfig.icon}</div>
                <p className="text-gray-400">No assets in this category yet</p>
                <button
                  onClick={() => setShowUploader(true)}
                  className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Upload First Asset
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                    : 'space-y-3'
                }
              >
                {assets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onDelete={handleDelete}
                    mode={viewMode}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Uploader Modal */}
      {showUploader && (
        <AssetUploader
          brandId={brand.id}
          brandName={brand.name}
          category={activeCategory}
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUploader(false)}
        />
      )}
    </div>
  );
};

export default BrandAssetDashboard;
