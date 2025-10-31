import React from 'react';

interface AssetSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterBy: 'all' | 'images' | 'documents' | 'videos';
  onFilterChange: (filter: 'all' | 'images' | 'documents' | 'videos') => void;
  sortBy: 'newest' | 'oldest' | 'name' | 'size';
  onSortChange: (sort: 'newest' | 'oldest' | 'name' | 'size') => void;
}

const AssetSearchBar: React.FC<AssetSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  filterBy,
  onFilterChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg p-4 mb-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9b9b9b]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or tags..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border-2 border-[#f4f0f0] shadow-lg rounded-lg text-[#4b0f0d] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9b9b9b] hover:text-[#4b0f0d]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex gap-2">
          <select
            value={filterBy}
            onChange={(e) => onFilterChange(e.target.value as any)}
            className="px-3 py-2 bg-gray-900 border-2 border-[#f4f0f0] shadow-lg rounded-lg text-[#4b0f0d] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">All Types</option>
            <option value="images">Images Only</option>
            <option value="documents">Documents Only</option>
            <option value="videos">Videos Only</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="px-3 py-2 bg-gray-900 border-2 border-[#f4f0f0] shadow-lg rounded-lg text-[#4b0f0d] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="size">Size (Large to Small)</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || filterBy !== 'all' || sortBy !== 'newest') && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#f4f0f0]">
          <span className="text-xs text-[#9b9b9b]">Active filters:</span>
          {searchQuery && (
            <span className="text-xs px-2 py-1 bg-brand-primary bg-opacity-20 text-brand-primary rounded-full flex items-center gap-1">
              Search: "{searchQuery}"
              <button onClick={() => onSearchChange('')} className="hover:text-[#4b0f0d]">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filterBy !== 'all' && (
            <span className="text-xs px-2 py-1 bg-brand-primary bg-opacity-20 text-brand-primary rounded-full flex items-center gap-1">
              Type: {filterBy}
              <button onClick={() => onFilterChange('all')} className="hover:text-[#4b0f0d]">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {sortBy !== 'newest' && (
            <span className="text-xs px-2 py-1 bg-brand-primary bg-opacity-20 text-brand-primary rounded-full">
              Sort: {sortBy}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AssetSearchBar;
