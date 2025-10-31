import React, { useState, useEffect } from 'react';
import type { Brand, BrandAsset } from '../types';
import { getAssetsByCategory } from '../services/assetService';
import { analyzeBrandAssetImage, extractTextFromPDFUrl, analyzePDFVisually } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface BrandAssetInspectorProps {
  brand: Brand;
}

interface AssetAnalysis {
  fileName: string;
  category: string;
  fileType: string;
  analysis: string;
  status: 'pending' | 'analyzing' | 'complete' | 'error';
  error?: string;
}

const BrandAssetInspector: React.FC<BrandAssetInspectorProps> = ({ brand }) => {
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [analyses, setAnalyses] = useState<AssetAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load all assets
  useEffect(() => {
    const loadAssets = async () => {
      const [logos, brandGuidelines, exampleAds, referenceCopy] = await Promise.all([
        getAssetsByCategory(brand.id, 'logos'),
        getAssetsByCategory(brand.id, 'brand-guidelines'),
        getAssetsByCategory(brand.id, 'competitor-ads'),
        getAssetsByCategory(brand.id, 'reference-copy')
      ]);

      const allAssets = [...logos, ...brandGuidelines, ...exampleAds, ...referenceCopy];
      setAssets(allAssets);

      // Initialize analyses
      setAnalyses(allAssets.map(asset => ({
        fileName: asset.fileName,
        category: asset.category,
        fileType: asset.fileType,
        analysis: '',
        status: 'pending'
      })));
    };

    loadAssets();
  }, [brand.id]);

  const analyzeAllAssets = async () => {
    setIsAnalyzing(true);

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];

      // Update status to analyzing
      setAnalyses(prev => prev.map((a, idx) =>
        idx === i ? { ...a, status: 'analyzing' } : a
      ));

      try {
        let analysis = '';

        // Analyze based on file type
        if (asset.fileType.startsWith('image/')) {
          const type = asset.category === 'logos' ? 'logo' : 'example-ad';
          analysis = await analyzeBrandAssetImage(asset.fileUrl, type);
        } else if (asset.fileType === 'application/pdf') {
          // For PDFs, extract both text AND analyze visually
          console.log('📄 Analyzing PDF (text + visual)...');

          const [textContent, visualAnalysis] = await Promise.all([
            extractTextFromPDFUrl(asset.fileUrl).catch(err => {
              console.warn('PDF text extraction failed:', err);
              return 'Text extraction failed';
            }),
            analyzePDFVisually(asset.fileUrl).catch(err => {
              console.warn('PDF visual analysis failed:', err);
              return 'Visual analysis failed';
            })
          ]);

          const textPreview = textContent.length > 300
            ? textContent.substring(0, 300) + '...'
            : textContent;

          analysis = `**📝 TEXT CONTENT (${textContent.length} characters):**\n${textPreview}\n\n**🎨 VISUAL DESIGN ANALYSIS:**\n${visualAnalysis}`;
        } else if (asset.fileType.startsWith('text/')) {
          const response = await fetch(asset.fileUrl);
          const text = await response.text();
          analysis = `Text content (${text.length} characters):\n${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`;
        } else {
          analysis = 'Analysis not available for this file type';
        }

        // Update with analysis result
        setAnalyses(prev => prev.map((a, idx) =>
          idx === i ? { ...a, analysis, status: 'complete' } : a
        ));

      } catch (error) {
        // Update with error
        setAnalyses(prev => prev.map((a, idx) =>
          idx === i ? {
            ...a,
            status: 'error',
            error: error instanceof Error ? error.message : 'Analysis failed'
          } : a
        ));
      }
    }

    setIsAnalyzing(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'logos': return '🏷️';
      case 'brand-guidelines': return '📋';
      case 'competitor-ads': return '🎯';
      case 'reference-copy': return '✍️';
      default: return '📄';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'logos': return 'Logo Files';
      case 'brand-guidelines': return 'Brand Guidelines';
      case 'competitor-ads': return 'Ad Examples / Creatives';
      case 'reference-copy': return 'Reference Copy Examples';
      default: return 'Other';
    }
  };

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg hover:border-[#f4f0f0] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-[#4b0f0d]">Brand Asset Inspector</h3>
            <p className="text-sm text-[#9b9b9b]">See what the AI extracts from your {assets.length} uploaded assets</p>
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-[#9b9b9b] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 p-6 bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg">
          {assets.length === 0 ? (
            <p className="text-[#9b9b9b] text-center py-8">No assets uploaded yet. Upload assets to see what the AI extracts.</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-[#4b0f0d] font-semibold">Asset Analysis</h4>
                  <p className="text-sm text-[#9b9b9b] mt-1">
                    {assets.length} asset{assets.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <button
                  onClick={analyzeAllAssets}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-indigo-600 text-[#4b0f0d] rounded-md hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze All Assets'}
                </button>
              </div>

              <div className="space-y-4">
                {analyses.map((analysis, idx) => (
                  <div key={idx} className="p-4 bg-gray-900 rounded-lg border-2 border-[#f4f0f0] shadow-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getCategoryIcon(analysis.category)}</span>
                        <div>
                          <h5 className="text-[#4b0f0d] font-medium">{analysis.fileName}</h5>
                          <p className="text-xs text-gray-500">
                            {getCategoryLabel(analysis.category)} • {analysis.fileType}
                          </p>
                        </div>
                      </div>
                      {analysis.status === 'analyzing' && (
                        <div className="flex items-center gap-2 text-indigo-400 text-sm">
                          <LoadingSpinner />
                          <span>Analyzing...</span>
                        </div>
                      )}
                      {analysis.status === 'complete' && (
                        <span className="text-green-400 text-sm">✓ Complete</span>
                      )}
                      {analysis.status === 'error' && (
                        <span className="text-red-400 text-sm">✗ Error</span>
                      )}
                    </div>

                    {analysis.status === 'complete' && analysis.analysis && (
                      <div className="mt-3 p-3 bg-white rounded border-2 border-[#f4f0f0] shadow-lg">
                        <p className="text-xs font-semibold text-[#9b9b9b] mb-2">AI EXTRACTED:</p>
                        <p className="text-sm text-[#4b0f0d] whitespace-pre-wrap">{analysis.analysis}</p>
                      </div>
                    )}

                    {analysis.status === 'error' && analysis.error && (
                      <div className="mt-3 p-3 bg-red-900/20 rounded border border-red-700">
                        <p className="text-sm text-red-400">{analysis.error}</p>
                      </div>
                    )}

                    {analysis.status === 'pending' && (
                      <p className="text-sm text-gray-500 mt-2">Click "Analyze All Assets" to see what the AI extracts</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-indigo-900/20 border border-indigo-700 rounded-lg">
                <h5 className="text-indigo-300 font-semibold mb-2">💡 How This Helps</h5>
                <ul className="text-sm text-[#4b0f0d] space-y-1">
                  <li>• <strong>Logo Analysis:</strong> Extracts colors, style, and design elements used in image generation</li>
                  <li>• <strong>Example Ads:</strong> Analyzes visual composition, photography style, and mood to replicate</li>
                  <li>• <strong>Brand Guidelines:</strong> Text extraction provides copy rules and brand voice</li>
                  <li>• <strong>Reference Copy:</strong> Example copy styles inform ad text generation</li>
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandAssetInspector;
