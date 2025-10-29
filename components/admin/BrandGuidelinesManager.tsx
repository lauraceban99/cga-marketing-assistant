import React, { useState } from 'react';
import { BRANDS } from '../../constants';
import { useAllBrandGuidelines } from '../../hooks/useFirestore';
import BrandGuidelineCard from './BrandGuidelineCard';
import PDFUploader from './PDFUploader';
import GuidelinesPreview from './GuidelinesPreview';
import type { Brand, BrandGuideline } from '../../types';

interface BrandGuidelinesManagerProps {
  onBack: () => void;
}

type ModalState = {
  type: 'upload' | 'update' | 'preview' | null;
  brand: Brand | null;
  guideline: BrandGuideline | null;
};

const BrandGuidelinesManager: React.FC<BrandGuidelinesManagerProps> = ({
  onBack,
}) => {
  const { guidelines, loading, error, refresh } = useAllBrandGuidelines();
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    brand: null,
    guideline: null,
  });

  const getGuidelineForBrand = (brandId: string): BrandGuideline | null => {
    return guidelines.find((g) => g.brandId === brandId) || null;
  };

  const openModal = (
    type: 'upload' | 'update' | 'preview',
    brand: Brand,
    guideline: BrandGuideline | null = null
  ) => {
    setModalState({ type, brand, guideline });
  };

  const closeModal = () => {
    setModalState({ type: null, brand: null, guideline: null });
  };

  const handleUploadSuccess = () => {
    refresh();
    closeModal();
  };

  const brandsWithGuidelines = BRANDS.filter((brand) =>
    guidelines.some((g) => g.brandId === brand.id)
  ).length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Brand Guidelines Manager</h1>
            <p className="text-gray-400 mt-1">
              Upload and manage PDF brand guidelines for all brands
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to App
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 flex-wrap">
          <div className="bg-gray-800 rounded-lg px-4 py-3 border border-gray-700">
            <p className="text-sm text-gray-400">Total Brands</p>
            <p className="text-2xl font-bold text-white">{BRANDS.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg px-4 py-3 border border-gray-700">
            <p className="text-sm text-gray-400">With Guidelines</p>
            <p className="text-2xl font-bold text-green-400">{brandsWithGuidelines}</p>
          </div>
          <div className="bg-gray-800 rounded-lg px-4 py-3 border border-gray-700">
            <p className="text-sm text-gray-400">Missing Guidelines</p>
            <p className="text-2xl font-bold text-red-400">
              {BRANDS.length - brandsWithGuidelines}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          <p className="text-gray-400 mt-4">Loading brand guidelines...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-300">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Brand Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BRANDS.map((brand) => {
            const guideline = getGuidelineForBrand(brand.id);
            return (
              <BrandGuidelineCard
                key={brand.id}
                brand={brand}
                guideline={guideline}
                onUpload={() => openModal('upload', brand)}
                onUpdate={() => openModal('update', brand, guideline)}
                onView={() => openModal('preview', brand, guideline)}
              />
            );
          })}
        </div>
      )}

      {/* Modals */}
      {modalState.type === 'upload' && modalState.brand && (
        <PDFUploader
          brandId={modalState.brand.id}
          brandName={modalState.brand.name}
          isUpdate={false}
          onSuccess={handleUploadSuccess}
          onCancel={closeModal}
        />
      )}

      {modalState.type === 'update' && modalState.brand && (
        <PDFUploader
          brandId={modalState.brand.id}
          brandName={modalState.brand.name}
          isUpdate={true}
          onSuccess={handleUploadSuccess}
          onCancel={closeModal}
        />
      )}

      {modalState.type === 'preview' && modalState.guideline && (
        <GuidelinesPreview guideline={modalState.guideline} onClose={closeModal} />
      )}

      {/* Help Section */}
      <div className="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">How It Works</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h4 className="font-semibold text-white mb-2">1. Upload PDF</h4>
            <p>Click "Upload PDF" on any brand card and select your brand guidelines PDF file (max 10MB).</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">2. AI Processing</h4>
            <p>Gemini AI extracts text, identifies colors, typography, and brand guidelines automatically.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">3. Storage</h4>
            <p>PDF is stored in Firebase Storage, and structured data is saved to Firestore for fast access.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">4. Generation</h4>
            <p>When generating content, the system uses these guidelines to ensure brand consistency.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandGuidelinesManager;
