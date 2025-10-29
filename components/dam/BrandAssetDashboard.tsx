import React, { useState, useMemo } from 'react';
import type { Brand, AssetCategory, BrandAsset, AssetMetadata } from '../../types';
import { useAssetsByCategory, useAssetActions, useBrandAssetStats } from '../../hooks/useAssets';
import AssetCategoryTabs from './AssetCategoryTabs';
import AssetCard from './AssetCard';
import AssetUploader from './AssetUploader';
import AssetSearchBar from './AssetSearchBar';
import AssetPreviewModal from './AssetPreviewModal';
import EditAssetModal from './EditAssetModal';
import InstructionsTab from './instructions/InstructionsTab';
import { ASSET_CATEGORY_CONFIG } from '../../constants/damConfig';
import { updateAssetMetadata } from '../../services/assetService';

interface BrandAssetDashboardProps {
  brand: Brand;
  onBack: () => void;
}

type TabType = AssetCategory | 'instructions';

const BrandAssetDashboard: React.FC<BrandAssetDashboardProps> = ({
  brand,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('brand-guidelines');
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'images' | 'documents' | 'videos'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
  const [previewAsset, setPreviewAsset] = useState<BrandAsset | null>(null);
  const [editAsset, setEditAsset] = useState<BrandAsset | null>(null);

  const activeCategory = activeTab === 'instructions' ? 'brand-guidelines' : activeTab;

  const { assets, loading, error, refresh } = useAssetsByCategory(brand.id, activeCategory);
  const { stats, refresh: refreshStats } = useBrandAssetStats(brand.id);
  const { deleteAsset } = useAssetActions();

  const categoryConfig = ASSET_CATEGORY_CONFIG[activeCategory];

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let filtered = [...assets];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.fileName.toLowerCase().includes(query) ||
          asset.metadata.description?.toLowerCase().includes(query) ||
          asset.metadata.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply filter by type
    if (filterBy !== 'all') {
      filtered = filtered.filter((asset) => {
        if (filterBy === 'images') return asset.fileType.startsWith('image/');
        if (filterBy === 'documents') return asset.fileType.includes('pdf') || asset.fileType.includes('text');
        if (filterBy === 'videos') return asset.fileType.startsWith('video/');
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') return b.uploadedAt.getTime() - a.uploadedAt.getTime();
      if (sortBy === 'oldest') return a.uploadedAt.getTime() - b.uploadedAt.getTime();
      if (sortBy === 'name') return a.fileName.localeCompare(b.fileName);
      if (sortBy === 'size') return b.fileSize - a.fileSize;
      return 0;
    });

    return filtered;
  }, [assets, searchQuery, filterBy, sortBy]);

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

  const handleUploadSuccess = async () => {
    console.log('🔄 Upload success - refreshing assets...');
    setShowUploader(false);

    // Force refresh assets after a short delay to ensure Firestore has propagated
    setTimeout(async () => {
      console.log('🔄 Calling refresh()...');
      await refresh();
      await refreshStats();
      console.log('✅ Refresh complete');
    }, 1000);
  };

  const handleEditMetadata = async (assetId: string, metadata: AssetMetadata) => {
    await updateAssetMetadata(assetId, metadata);
    refresh();
    setEditAsset(null);
  };

  const handleAssetClick = (asset: BrandAsset) => {
    setPreviewAsset(asset);
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

      {/* Category Tabs + Instructions Tab */}
      <div className="border-b border-gray-700">
        <div className="flex gap-2 overflow-x-auto">
          {/* Asset Category Tabs */}
          {(['brand-guidelines', 'competitor-ads', 'reference-copy', 'logos', 'other'] as AssetCategory[]).map(
            (category) => {
              const config = ASSET_CATEGORY_CONFIG[category];
              const count = stats?.assetsByCategory[category] || 0;
              const isActive = activeTab === category;

              return (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
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
            }
          )}

          {/* Instructions Tab */}
          <button
            onClick={() => setActiveTab('instructions')}
            className={`
              flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap
              ${
                activeTab === 'instructions'
                  ? 'border-brand-primary text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }
            `}
          >
            <span>🤖</span>
            <span className="text-sm font-medium">Instructions</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'instructions' ? (
          /* Instructions Tab Content */
          <InstructionsTab brandId={brand.id} brandName={brand.name} />
        ) : (
          /* Asset Category Content */
          <>
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

            {/* Search and Filter Bar */}
            {assets.length > 0 && (
              <AssetSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterBy={filterBy}
                onFilterChange={setFilterBy}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            )}

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
                ) : filteredAssets.length === 0 ? (
                  <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-400">No assets match your search or filters</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterBy('all');
                      }}
                      className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 text-sm text-gray-400">
                      Showing {filteredAssets.length} of {assets.length} assets
                    </div>
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                          : 'space-y-3'
                      }
                    >
                      {filteredAssets.map((asset) => (
                        <AssetCard
                          key={asset.id}
                          asset={asset}
                          onDelete={handleDelete}
                          onClick={handleAssetClick}
                          mode={viewMode}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
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

      {/* Preview Modal */}
      {previewAsset && (
        <AssetPreviewModal
          asset={previewAsset}
          onClose={() => setPreviewAsset(null)}
          onDelete={handleDelete}
          onEdit={(assetId) => {
            const asset = assets.find((a) => a.id === assetId);
            if (asset) {
              setEditAsset(asset);
              setPreviewAsset(null);
            }
          }}
        />
      )}

      {/* Edit Modal */}
      {editAsset && (
        <EditAssetModal
          asset={editAsset}
          onSave={handleEditMetadata}
          onClose={() => setEditAsset(null)}
        />
      )}
    </div>
  );
};

export default BrandAssetDashboard;
