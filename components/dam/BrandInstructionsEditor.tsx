import React, { useState, useEffect } from 'react';
import type {
  Brand,
  BrandInstructions,
  PersonaDefinition,
  CampaignExample,
  TaskType,
  CampaignStage,
  Market,
  Platform
} from '../../types';
import { getBrandInstructions, saveBrandInstructions } from '../../services/instructionsService';
import { updatePatternKnowledge } from '../../services/patternKnowledgeService';
import LoadingSpinner from '../LoadingSpinner';
import ExamplesKnowledgeBase from './examples/ExamplesKnowledgeBase';
import LandingPageExamplesKnowledgeBase from './examples/LandingPageExamplesKnowledgeBase';
import UnifiedExamplesKnowledgeBase from './examples/UnifiedExamplesKnowledgeBase';
import PatternKnowledgeViewer from './PatternKnowledgeViewer';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useDraftRecovery, formatDraftAge } from '../../hooks/useDraftRecovery';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import ConflictResolutionModal from '../ConflictResolutionModal';
import { VersionHistoryModal } from './VersionHistoryModal';

interface BrandInstructionsEditorProps {
  brand: Brand;
  onBack: () => void;
}

const BrandInstructionsEditor: React.FC<BrandInstructionsEditorProps> = ({ brand, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instructions, setInstructions] = useState<BrandInstructions | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'ad-copy' | 'blog' | 'landing-page' | 'email' | 'ai-learning'>('general');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDraftRecoveryModal, setShowDraftRecoveryModal] = useState(false);

  // Version tracking for conflict detection
  const [localVersion, setLocalVersion] = useState<number>(1);
  const [remoteData, setRemoteData] = useState<BrandInstructions | null>(null);
  const [remoteVersion, setRemoteVersion] = useState<number>(1);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Auto-save hook (30 second intervals)
  const { lastSaved, isSaving: isAutoSaving, triggerSave} = useAutoSave({
    data: instructions,
    onSave: async (data) => {
      if (!data) return;
      const result = await saveBrandInstructions(brand.id, data, 'admin', 'Admin', localVersion);
      if (result.conflict) {
        // Auto-save detected conflict - disable auto-save and show warning
        console.warn('⚠️ Auto-save paused due to conflict');
        return;
      }
      if (result.success && result.newVersion) {
        setLocalVersion(result.newVersion);
        setHasUnsavedChanges(false); // Mark as saved after auto-save
        clearDraft(); // Clear draft after successful auto-save
      }
      await extractPatternsFromExamples(data);
    },
    enabled: true, // Auto-save every 30 seconds
    interval: 30000
  });

  // Real-time sync hook
  const { isListening } = useRealtimeSync({
    brandId: brand.id,
    enabled: !loading,
    localVersion,
    onRemoteUpdate: (updatedData, updatedVersion) => {
      if (hasUnsavedChanges) {
        // User has unsaved changes - show conflict modal
        setRemoteData(updatedData);
        setRemoteVersion(updatedVersion);
        setShowConflictModal(true);
      } else {
        // No local changes - auto-update to latest
        setInstructions(updatedData);
        setLocalVersion(updatedVersion);
        setSuccessMessage('✅ Updated to latest version');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  });

  // Draft recovery hook (localStorage backup)
  const { hasDraft, draftAge, restoreDraft, clearDraft } = useDraftRecovery({
    key: `brand-instructions-${brand.id}`,
    data: instructions,
    enabled: true,
    maxVersions: 3,
    onRestore: (restoredData) => {
      setInstructions(restoredData);
      setHasUnsavedChanges(true);
      setShowDraftRecoveryModal(false);
    }
  });

  useEffect(() => {
    loadInstructions();
  }, [brand.id]);

  // Check for draft on mount
  useEffect(() => {
    if (hasDraft && !loading && instructions) {
      setShowDraftRecoveryModal(true);
    }
  }, [hasDraft, loading]);

  // beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Clear success message when auto-save completes
  useEffect(() => {
    if (lastSaved && !isAutoSaving) {
      setHasUnsavedChanges(false);
      setSuccessMessage('✅ Changes auto-saved');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, [lastSaved, isAutoSaving]);

  const loadInstructions = async () => {
    setLoading(true);
    const data = await getBrandInstructions(brand.id);
    setInstructions(data);
    setLocalVersion(data?.version || 1);
    setHasUnsavedChanges(false);
    setLoading(false);
  };

  // Wrapper to track changes
  const updateInstructions = (newInstructions: BrandInstructions) => {
    setInstructions(newInstructions);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!instructions) return;

    setSaving(true);
    setSuccessMessage('');
    try {
      const result = await saveBrandInstructions(
        brand.id,
        instructions,
        'admin',
        'Admin',
        localVersion
      );

      if (result.conflict) {
        // Conflict detected - reload remote data and show modal
        const remoteInstructions = await getBrandInstructions(brand.id);
        setRemoteData(remoteInstructions);
        setRemoteVersion(result.remoteVersion!);
        setShowConflictModal(true);
        setSuccessMessage('');
      } else if (result.success) {
        // Success - update local version
        setLocalVersion(result.newVersion!);
        setHasUnsavedChanges(false);

        // Auto-extract patterns from examples
        console.log('🤖 Extracting patterns from examples...');
        await extractPatternsFromExamples();

        setSuccessMessage('✅ All changes saved successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error saving instructions:', error);
      alert('Error saving instructions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Conflict resolution handlers
  const handleKeepLocal = async () => {
    // Force overwrite with local version
    if (!instructions) return;

    setSaving(true);
    try {
      // Save without version check (force overwrite)
      const result = await saveBrandInstructions(
        brand.id,
        instructions,
        'admin',
        'Admin',
        remoteVersion // Use remote version to pass the check
      );

      if (result.success) {
        setLocalVersion(result.newVersion!);
        setHasUnsavedChanges(false);
        setShowConflictModal(false);
        setSuccessMessage('✅ Your changes saved (other changes overwritten)');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      alert('Error saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeepRemote = () => {
    // Discard local changes and use remote version
    if (!remoteData) return;

    setInstructions(remoteData);
    setLocalVersion(remoteVersion);
    setHasUnsavedChanges(false);
    setShowConflictModal(false);
    setSuccessMessage('✅ Loaded latest version (your changes discarded)');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleCancelConflict = () => {
    setShowConflictModal(false);
  };

  /**
   * Extract patterns from examples after saving
   * Groups examples by market + platform + type and calls pattern extraction
   */
  const extractPatternsFromExamples = async (instructionsData: BrandInstructions = instructions!) => {
    if (!instructionsData) return;

    // Collect all examples from all content types
    const allExamples: CampaignExample[] = [
      ...(instructionsData.adCopyInstructions?.examples || []),
      ...(instructionsData.blogInstructions?.examples || []),
      ...(instructionsData.landingPageInstructions?.examples || []),
      ...(instructionsData.emailInstructions?.invitation?.examples || []),
      ...(instructionsData.emailInstructions?.nurturingDrip?.examples || []),
      ...(instructionsData.emailInstructions?.emailBlast?.examples || []),
    ];

    // Group examples by market + platform + type
    const groupedExamples = new Map<string, { market: Market; platform: Platform; type: TaskType; examples: CampaignExample[] }>();

    allExamples.forEach((example) => {
      // Only process examples that have market and platform specified
      if (example.market && example.platform) {
        const key = `${example.market}-${example.platform}-${example.type}`;

        if (!groupedExamples.has(key)) {
          groupedExamples.set(key, {
            market: example.market,
            platform: example.platform,
            type: example.type,
            examples: [],
          });
        }

        groupedExamples.get(key)!.examples.push(example);
      }
    });

    // Extract patterns for each group
    const extractionPromises = Array.from(groupedExamples.values()).map(async (group) => {
      if (group.examples.length > 0) {
        console.log(`📊 Extracting patterns for ${group.market} + ${group.platform} + ${group.type} (${group.examples.length} examples)`);
        try {
          await updatePatternKnowledge(
            brand.id,
            group.market,
            group.platform,
            group.type,
            group.examples,
            '' // Manual learnings are stored in the example whatWorks field
          );
          console.log(`✅ Patterns extracted for ${group.market} + ${group.platform} + ${group.type}`);
        } catch (error) {
          console.error(`❌ Failed to extract patterns for ${group.market} + ${group.platform} + ${group.type}:`, error);
        }
      }
    });

    await Promise.all(extractionPromises);
    console.log('✅ Pattern extraction complete');
  };

  const addPersona = () => {
    if (!instructions) return;
    const newPersona: PersonaDefinition = {
      name: '',
      description: '',
      painPoints: [''],
      solution: ''
    };
    updateInstructions({
      ...instructions,
      personas: [...(instructions.personas || []), newPersona]
    });
  };

  const updatePersona = (index: number, field: keyof PersonaDefinition, value: any) => {
    if (!instructions) return;
    const updatedPersonas = [...(instructions.personas || [])];
    updatedPersonas[index] = { ...updatedPersonas[index], [field]: value };
    updateInstructions({ ...instructions, personas: updatedPersonas });
  };

  const removePersona = (index: number) => {
    if (!instructions) return;
    const updatedPersonas = (instructions.personas || []).filter((_, i) => i !== index);
    updateInstructions({ ...instructions, personas: updatedPersonas });
  };

  const addPainPoint = (personaIndex: number) => {
    if (!instructions) return;
    const updatedPersonas = [...(instructions.personas || [])];
    updatedPersonas[personaIndex].painPoints.push('');
    updateInstructions({ ...instructions, personas: updatedPersonas });
  };

  const updatePainPoint = (personaIndex: number, painPointIndex: number, value: string) => {
    if (!instructions) return;
    const updatedPersonas = [...(instructions.personas || [])];
    updatedPersonas[personaIndex].painPoints[painPointIndex] = value;
    updateInstructions({ ...instructions, personas: updatedPersonas });
  };

  const removePainPoint = (personaIndex: number, painPointIndex: number) => {
    if (!instructions) return;
    const updatedPersonas = [...(instructions.personas || [])];
    updatedPersonas[personaIndex].painPoints = updatedPersonas[personaIndex].painPoints.filter((_, i) => i !== painPointIndex);
    updateInstructions({ ...instructions, personas: updatedPersonas });
  };

  // Helper to ensure instruction field exists with proper structure
  const getOrInitializeField = (fieldName: string) => {
    return instructions[fieldName] || {
      systemPrompt: '',
      requirements: '',
      examples: [],
      dos: [],
      donts: []
    };
  };

  const addExample = (
    type: 'adCopy' | 'blog' | 'landingPage',
    stage?: CampaignStage,
    market?: Market,
    platform?: Platform
  ) => {
    if (!instructions) return;
    const newExample: CampaignExample = {
      stage: stage || 'mofu', // Default stage if not provided
      type: type === 'adCopy' ? 'ad-copy' : type === 'blog' ? 'blog' : 'landing-page',
      headline: '',
      copy: '',
      cta: '',
      notes: '',
      ...(market && { market }), // Add market if provided (for landing pages)
      ...(platform && { platform }) // Add platform if provided (for landing pages)
    };

    const fieldMap = {
      adCopy: 'adCopyInstructions',
      blog: 'blogInstructions',
      landingPage: 'landingPageInstructions'
    } as const;

    const field = fieldMap[type];
    const currentFieldData = getOrInitializeField(field);

    updateInstructions({
      ...instructions,
      [field]: {
        ...currentFieldData,
        examples: [...(currentFieldData.examples || []), newExample]
      }
    });
  };

  const updateExample = (
    type: 'adCopy' | 'blog' | 'landingPage',
    index: number,
    field: keyof CampaignExample,
    value: any
  ) => {
    if (!instructions) return;
    const fieldMap = {
      adCopy: 'adCopyInstructions',
      blog: 'blogInstructions',
      landingPage: 'landingPageInstructions'
    } as const;

    const instructionField = fieldMap[type];
    const currentFieldData = getOrInitializeField(instructionField);

    const updatedExamples = [...(currentFieldData.examples || [])];
    updatedExamples[index] = { ...updatedExamples[index], [field]: value };

    updateInstructions({
      ...instructions,
      [instructionField]: {
        ...currentFieldData,
        examples: updatedExamples
      }
    });
  };

  const removeExample = (type: 'adCopy' | 'blog' | 'landingPage', index: number) => {
    if (!instructions) return;
    const fieldMap = {
      adCopy: 'adCopyInstructions',
      blog: 'blogInstructions',
      landingPage: 'landingPageInstructions'
    } as const;

    const field = fieldMap[type];
    const currentFieldData = getOrInitializeField(field);

    const updatedExamples = (currentFieldData.examples || []).filter((_, i) => i !== index);

    updateInstructions({
      ...instructions,
      [field]: {
        ...currentFieldData,
        examples: updatedExamples
      }
    });
  };

  // Email example helpers
  const addEmailExample = () => {
    if (!instructions) return;
    const newExample: CampaignExample = {
      stage: 'mofu',
      type: 'email',
      headline: '',
      copy: '',
      cta: '',
      notes: ''
    };
    updateInstructions({
      ...instructions,
      emailInstructions: {
        ...(instructions.emailInstructions || {}),
        invitation: {
          ...(instructions.emailInstructions?.invitation || {}),
          examples: [...(instructions.emailInstructions?.invitation?.examples || []), newExample]
        }
      }
    });
  };

  const updateEmailExample = (index: number, field: keyof CampaignExample, value: any) => {
    if (!instructions) return;
    const updatedExamples = [...(instructions.emailInstructions?.invitation?.examples || [])];
    updatedExamples[index] = { ...updatedExamples[index], [field]: value };
    updateInstructions({
      ...instructions,
      emailInstructions: {
        ...(instructions.emailInstructions || {}),
        invitation: {
          ...(instructions.emailInstructions?.invitation || {}),
          examples: updatedExamples
        }
      }
    });
  };

  const removeEmailExample = (index: number) => {
    if (!instructions) return;
    const updatedExamples = (instructions.emailInstructions?.invitation?.examples || []).filter((_, i) => i !== index);
    updateInstructions({
      ...instructions,
      emailInstructions: {
        ...(instructions.emailInstructions || {}),
        invitation: {
          ...(instructions.emailInstructions?.invitation || {}),
          examples: updatedExamples
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <LoadingSpinner />
        <p className="mt-4 text-[#9b9b9b]">Loading instructions...</p>
      </div>
    );
  }

  if (!instructions) {
    return <div>Error loading instructions</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Conflict Resolution Modal */}
      {showConflictModal && instructions && remoteData && (
        <ConflictResolutionModal
          localData={instructions}
          remoteData={remoteData}
          localVersion={localVersion}
          remoteVersion={remoteVersion}
          lastUpdatedBy={remoteData.lastUpdatedByName || remoteData.lastUpdatedBy}
          onKeepLocal={handleKeepLocal}
          onKeepRemote={handleKeepRemote}
          onCancel={handleCancelConflict}
        />
      )}

      {/* Draft Recovery Modal */}
      {showDraftRecoveryModal && draftAge !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#4b0f0d] mb-2">
                  Unsaved Changes Found
                </h3>
                <p className="text-sm text-[#9b9b9b]">
                  We found unsaved changes from <strong>{formatDraftAge(draftAge)}</strong>.
                  Would you like to restore them?
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  restoreDraft();
                  setShowDraftRecoveryModal(false);
                }}
                className="w-full px-6 py-3 bg-[#780817] text-white font-bold rounded-lg hover:bg-[#4b0f0d] transition-colors"
              >
                ♻️ Restore Unsaved Changes
              </button>
              <button
                onClick={() => {
                  clearDraft();
                  setShowDraftRecoveryModal(false);
                }}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Discard and Start Fresh
              </button>
            </div>

            <p className="text-xs text-[#9b9b9b] mt-4 text-center">
              💡 Changes are automatically backed up to prevent data loss
            </p>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        brandId={brand.id}
        currentVersion={localVersion}
        onRestore={(version, snapshot) => {
          setInstructions(snapshot);
          setLocalVersion(version);
          setHasUnsavedChanges(true);
          setSuccessMessage(`Restored version ${version}. Click Save to confirm.`);
        }}
      />

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#9b9b9b] hover:text-[#4b0f0d] transition-colors mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
        Back to Brand Assets
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#4b0f0d] mb-2">
          Brand Instructions for {brand.name}
        </h1>
        <p className="text-[#9b9b9b]">
          Manage general brand information and content-specific instructions
        </p>
      </div>

      {/* Sticky Save Bar */}
      <div className={`sticky top-0 z-50 mb-6 p-4 rounded-lg border-2 transition-all ${
        hasUnsavedChanges
          ? 'bg-yellow-50 border-yellow-400'
          : successMessage
            ? 'bg-green-50 border-green-400'
            : 'bg-[#f4f0f0] border-[#780817]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <div>
              {hasUnsavedChanges ? (
                <div>
                  <p className="font-semibold text-yellow-800">
                    {isAutoSaving ? '💾 Auto-saving...' : 'You have unsaved changes'}
                  </p>
                  <p className="text-sm text-yellow-700">
                    {isAutoSaving
                      ? 'Saving to cloud...'
                      : 'Auto-save in progress every 30 seconds'}
                  </p>
                </div>
              ) : successMessage ? (
                <p className="font-semibold text-green-800">{successMessage}</p>
              ) : (
                <div>
                  <p className="font-semibold text-[#4b0f0d]">All changes saved (v{localVersion})</p>
                  <div className="flex items-center gap-3 mt-1">
                    {isListening && (
                      <p className="text-xs text-green-600">
                        🔄 Real-time sync active
                      </p>
                    )}
                    {lastSaved && (
                      <p className="text-xs font-medium text-gray-600">
                        💾 Last saved {formatDraftAge(Date.now() - lastSaved.getTime())}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowVersionHistory(true)}
              className="px-4 py-2 font-medium rounded-lg border-2 border-[#780817] text-[#780817] hover:bg-[#780817] hover:text-white transition-all"
            >
              📜 View History (v{localVersion})
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className={`px-8 py-3 font-bold rounded-lg transition-all text-lg ${
                hasUnsavedChanges
                  ? 'bg-[#780817] text-white hover:bg-[#4b0f0d] shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } disabled:opacity-50`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                '💾 Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#f4f0f0] overflow-x-auto">
        {[
          { id: 'general', label: 'General Brand' },
          { id: 'ad-copy', label: 'Ad Copies' },
          { id: 'blog', label: 'Blogs' },
          { id: 'landing-page', label: 'Landing Pages' },
          { id: 'email', label: 'Emails' },
          { id: 'ai-learning', label: 'Advanced', subtle: true }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[#780817] border-b-2 border-[#780817]'
                : tab.subtle
                  ? 'text-[#c0c0c0] hover:text-[#9b9b9b] text-sm'
                  : 'text-[#9b9b9b] hover:text-[#4b0f0d]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg p-8">
        {/* General Brand Tab */}
        {activeTab === 'general' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[#4b0f0d]">General Brand Information</h2>

            {/* Brand Introduction */}
            <div>
              <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Brand Introduction
              </label>
              <textarea
                value={instructions.brandIntroduction}
                onChange={(e) => updateInstructions({ ...instructions, brandIntroduction: e.target.value })}
                rows={6}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
                placeholder="Who you are, what you do, your mission and vision..."
              />
            </div>

            {/* Tone of Voice */}
            <div>
              <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Tone of Voice
              </label>
              <input
                type="text"
                value={instructions.toneOfVoice}
                onChange={(e) => updateInstructions({ ...instructions, toneOfVoice: e.target.value })}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
                placeholder="e.g., Warm, professional, conversational, aspirational"
              />
            </div>

            {/* Core Values */}
            <div>
              <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Core Values (comma-separated)
              </label>
              <input
                type="text"
                value={instructions.coreValues?.join(', ') || ''}
                onChange={(e) => updateInstructions({
                  ...instructions,
                  coreValues: e.target.value.split(',').map(v => v.trim()).filter(v => v)
                })}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
                placeholder="Flexibility, Excellence, Community"
              />
            </div>

            {/* Key Messaging */}
            <div>
              <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Key Messaging Points (comma-separated)
              </label>
              <textarea
                value={instructions.keyMessaging?.join(', ') || ''}
                onChange={(e) => updateInstructions({
                  ...instructions,
                  keyMessaging: e.target.value.split(',').map(v => v.trim()).filter(v => v)
                })}
                rows={3}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
                placeholder="Flexible learning, Global community, University pathways"
              />
            </div>

            {/* Personas */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-[#4b0f0d]">
                  Target Personas
                </label>
                <button
                  onClick={addPersona}
                  className="px-4 py-2 bg-[#780817] text-white rounded-md hover:bg-[#4b0f0d] transition-colors"
                >
                  + Add Persona
                </button>
              </div>

              {instructions.personas?.map((persona, index) => (
                <div key={index} className="mb-6 p-4 bg-[#f4f0f0] rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-[#4b0f0d]">Persona {index + 1}</h4>
                    <button
                      onClick={() => removePersona(index)}
                      className="text-sm text-[#780817] hover:text-[#4b0f0d]"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={persona.name}
                      onChange={(e) => updatePersona(index, 'name', e.target.value)}
                      placeholder="Persona Name (e.g., Ambitious Athlete Parent)"
                      className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    />

                    <textarea
                      value={persona.description}
                      onChange={(e) => updatePersona(index, 'description', e.target.value)}
                      rows={3}
                      placeholder="Detailed persona description..."
                      className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-[#4b0f0d]">Pain Points</label>
                        <button
                          onClick={() => addPainPoint(index)}
                          className="text-sm text-[#780817] hover:text-[#4b0f0d]"
                        >
                          + Add Pain Point
                        </button>
                      </div>
                      {persona.painPoints?.map((painPoint, ppIndex) => (
                        <div key={ppIndex} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={painPoint}
                            onChange={(e) => updatePainPoint(index, ppIndex, e.target.value)}
                            placeholder="Pain point..."
                            className="flex-1 bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-2 focus:ring-2 focus:ring-[#780817]"
                          />
                          <button
                            onClick={() => removePainPoint(index, ppIndex)}
                            className="px-3 text-[#780817] hover:text-[#4b0f0d]"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <textarea
                      value={persona.solution}
                      onChange={(e) => updatePersona(index, 'solution', e.target.value)}
                      rows={3}
                      placeholder="How your brand solves these pain points..."
                      className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Zoom Interview Transcripts */}
            <div>
              <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Zoom Interview Transcripts
                <span className="text-xs text-[#9b9b9b] ml-2">
                  (Use these to ensure authentic voice and avoid fabricating testimonials)
                </span>
              </label>
              <textarea
                value={instructions.referenceMaterials?.interviews || ''}
                onChange={(e) => updateInstructions({
                  ...instructions,
                  referenceMaterials: { ...(instructions.referenceMaterials || {}), interviews: e.target.value }
                })}
                rows={10}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817] font-mono text-sm"
                placeholder="Paste interview transcripts here..."
              />
            </div>

            {/* Testimonials */}
            <div>
              <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Real Testimonials
              </label>
              <textarea
                value={instructions.referenceMaterials?.testimonials || ''}
                onChange={(e) => updateInstructions({
                  ...instructions,
                  referenceMaterials: { ...(instructions.referenceMaterials || {}), testimonials: e.target.value }
                })}
                rows={6}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
                placeholder="Paste actual testimonials from students and parents. These will be used as reference, not fabricated."
              />
            </div>
          </div>
        )}

        {/* Ad Copy Tab */}
        {activeTab === 'ad-copy' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[#4b0f0d]">Ad Copy Instructions & Examples</h2>

            {/* Instructions Section */}
            <div className="bg-[#f4f0f0] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#4b0f0d] mb-4">Generation Instructions</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Length Guidelines
                  </label>
                  <input
                    type="text"
                    value={instructions.adCopyInstructions?.requirements || ''}
                    onChange={(e) => updateInstructions({
                      ...instructions,
                      adCopyInstructions: { ...instructions.adCopyInstructions, requirements: e.target.value }
                    })}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="e.g., Short: 50-80 words, Long: 120-180 words"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Number of Variations
                  </label>
                  <input
                    type="text"
                    defaultValue="5 variations minimum"
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="How many ad variations to generate per request"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Variation Strategy
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="e.g., Each variation should target a different persona, use different emotional angles (aspiration, urgency, social proof), and vary opening hooks"
                  />
                </div>

                {/* Campaign Stage CTAs */}
                <div>
                  <h4 className="text-md font-semibold text-[#4b0f0d] mb-3">Campaign Stage CTAs</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#4b0f0d] mb-1">
                        TOFU - Awareness Stage CTAs
                      </label>
                      <input
                        type="text"
                        value={instructions.campaignInstructions?.tofu || ''}
                        onChange={(e) => updateInstructions({
                          ...instructions,
                          campaignInstructions: { ...instructions.campaignInstructions, tofu: e.target.value }
                        })}
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-2 focus:ring-2 focus:ring-[#780817]"
                        placeholder="e.g., Learn More, Explore Programs, Download Guide"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4b0f0d] mb-1">
                        MOFU - Consideration Stage CTAs
                      </label>
                      <input
                        type="text"
                        value={instructions.campaignInstructions?.mofu || ''}
                        onChange={(e) => updateInstructions({
                          ...instructions,
                          campaignInstructions: { ...instructions.campaignInstructions, mofu: e.target.value }
                        })}
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-2 focus:ring-2 focus:ring-[#780817]"
                        placeholder="e.g., Book a Consultation, Schedule a Tour, Get Started"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4b0f0d] mb-1">
                        BOFU - Decision Stage CTAs
                      </label>
                      <input
                        type="text"
                        value={instructions.campaignInstructions?.bofu || ''}
                        onChange={(e) => updateInstructions({
                          ...instructions,
                          campaignInstructions: { ...instructions.campaignInstructions, bofu: e.target.value }
                        })}
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-2 focus:ring-2 focus:ring-[#780817]"
                        placeholder="e.g., Apply Now, Enroll Today, Start This Month"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Examples Knowledge Base */}
            <ExamplesKnowledgeBase
              title="Ad Copy Examples Knowledge Base"
              description="Add examples AI will learn from"
              examples={instructions.adCopyInstructions?.examples || []}
              onAddExample={(stage) => addExample('adCopy', stage)}
              onUpdateExample={(index, field, value) => updateExample('adCopy', index, field, value)}
              onDeleteExample={(index) => removeExample('adCopy', index)}
              onSave={handleSave}
            />
          </div>
        )}

        {/* Blog Tab */}
        {activeTab === 'blog' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[#4b0f0d]">Blog Post Instructions & Examples</h2>

            {/* Instructions Section */}
            <div className="bg-[#f4f0f0] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#4b0f0d] mb-4">Generation Instructions</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    System Prompt for Blog Generation
                  </label>
                  <textarea
                    value={instructions.blogInstructions?.systemPrompt || ''}
                    onChange={(e) => updateInstructions({
                      ...instructions,
                      blogInstructions: { ...instructions.blogInstructions, systemPrompt: e.target.value }
                    })}
                    rows={4}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="You are an SEO + AI–optimized blog writer. Produce helpful, people-first long-form content that ranks, wins AI snippet visibility, and builds trust."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Hard Requirements
                    <span className="text-xs text-[#9b9b9b] ml-2">Length, structure, SEO requirements</span>
                  </label>
                  <textarea
                    value={instructions.blogInstructions?.requirements || ''}
                    onChange={(e) => updateInstructions({
                      ...instructions,
                      blogInstructions: { ...instructions.blogInstructions, requirements: e.target.value }
                    })}
                    rows={8}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="• Length: 1,800–2,400 words (evergreen), 1,200–1,600 (news)&#10;• H1 (1), H2/H3 every 250–350 words&#10;• TL;DR (3–5 bullets) after intro&#10;• Featured-snippet block: 40–55-word answer near top&#10;• FAQ: 4–6 questions&#10;• On-page SEO: keyword in H1, intro, 1–2 H2s&#10;• 3–7 visuals with alt text&#10;• One clear CTA tied to stage (TOFU/MOFU/BOFU)&#10;• No fabricated stats → use [PLACEHOLDER: stat/source]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Target SEO Keywords
                  </label>
                  <textarea
                    rows={2}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="List your primary keywords and topics you want to rank for. E.g., online high school, flexible education, homeschooling alternatives"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Internal Linking Strategy
                  </label>
                  <textarea
                    rows={2}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="Which pages should blog posts link to? E.g., 3 internal + 2 external links minimum"
                  />
                </div>

              </div>
            </div>

            {/* Examples Knowledge Base */}
            <UnifiedExamplesKnowledgeBase
              title="Blog Examples Knowledge Base"
              description="Add examples AI will learn from. Stage categorization removed - blogs are organized by topic and quality, not funnel stage."
              examples={instructions.blogInstructions?.examples || []}
              onAddExample={() => addExample('blog')}
              onUpdateExample={(index, field, value) => updateExample('blog', index, field, value)}
              onDeleteExample={(index) => removeExample('blog', index)}
              onSave={handleSave}
            />
          </div>
        )}

        {/* Landing Page Tab */}
        {activeTab === 'landing-page' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[#4b0f0d]">Landing Page Instructions & Examples</h2>

            {/* Instructions Section */}
            <div className="bg-[#f4f0f0] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#4b0f0d] mb-4">Generation Instructions</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    System Prompt for Landing Page Generation
                  </label>
                  <textarea
                    value={instructions.landingPageInstructions?.systemPrompt || ''}
                    onChange={(e) => updateInstructions({
                      ...instructions,
                      landingPageInstructions: { ...instructions.landingPageInstructions, systemPrompt: e.target.value }
                    })}
                    rows={3}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="You create high-converting landing pages (US + EMEA). One clear goal per page. Mobile-first."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Page Structure & Copy Rules
                    <span className="text-xs text-[#9b9b9b] ml-2">Structure: Hero → Value → How it works → Social Proof → FAQ → Final CTA</span>
                  </label>
                  <textarea
                    value={instructions.landingPageInstructions?.requirements || ''}
                    onChange={(e) => updateInstructions({
                      ...instructions,
                      landingPageInstructions: { ...instructions.landingPageInstructions, requirements: e.target.value }
                    })}
                    rows={8}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="Hero:&#10;• Headline (≤10 words) – benefit-led&#10;• Subhead – 1-sentence proof/differentiator&#10;• CTA Button – action + outcome&#10;• Chips – accreditation / grant eligibility&#10;&#10;Copy Rules:&#10;• One primary CTA repeated 2–3×&#10;• Microcopy under form: 'Takes 60 sec. No obligation.'&#10;• Form fields: Name, Email, [optional Phone/State]&#10;• Hero clarity: offer understood in 3 seconds&#10;• Readability Grade 8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Primary Value Propositions
                  </label>
                  <textarea
                    rows={2}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="What are your strongest value propositions? E.g., Study on your schedule, Expert 1-on-1 support, Global community"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Common Objections to Address
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="What concerns do prospects have? E.g., Is it accredited?, Will my teen be lonely?, How much does it cost?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Social Proof Available
                  </label>
                  <textarea
                    rows={2}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="What proof points can you use? E.g., Number of students, graduation rates, accreditation badges"
                  />
                </div>

              </div>
            </div>

            {/* Examples Knowledge Base - Organized by Market */}
            <LandingPageExamplesKnowledgeBase
              title="Landing Page Examples Knowledge Base"
              description="Add examples organized by market. AI will learn market-specific patterns."
              examples={instructions.landingPageInstructions?.examples || []}
              onAddExample={(market, platform) => addExample('landingPage', 'mofu', market, platform)}
              onUpdateExample={(index, field, value) => updateExample('landingPage', index, field, value)}
              onDeleteExample={(index) => removeExample('landingPage', index)}
              onSave={handleSave}
              brandId={brand.id}
              onComplete={loadInstructions}
            />
          </div>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[#4b0f0d]">Email Marketing Instructions & Examples</h2>

            <p className="text-sm text-[#9b9b9b]">
              Configure instructions for three email types: Invitation, Nurturing Drip, and Email Blast.
              Each type has different requirements and best practices.
            </p>

            {/* Shared Email Rules */}
            <div className="bg-[#f4f0f0] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#4b0f0d] mb-4">Shared Email Rules</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Content Requirements
                    <span className="text-xs text-[#9b9b9b] ml-2">Applied to all email types</span>
                  </label>
                  <textarea
                    rows={6}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="• One CTA only (+371% click improvement)&#10;• Personalization tokens required (+50% open rate)&#10;• Mobile-optimized (60%+ opens on mobile)&#10;• Use [PLACEHOLDER] for unknown information&#10;• Power words: exclusive, limited, you, free, new&#10;• Subject line emojis (test for audience)&#10;• Clear value proposition&#10;• Conversational tone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Personalization Tokens Available
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="e.g., First name, Parent name, Student name, Location, Program interest"
                  />
                </div>
              </div>
            </div>

            {/* Invitation Emails */}
            <div className="bg-white rounded-lg border-2 border-[#f4f0f0] p-6">
              <h3 className="text-lg font-semibold text-[#4b0f0d] mb-2">Invitation Emails</h3>
              <p className="text-sm text-[#9b9b9b] mb-4">For events, webinars, consultations</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Psychology & Structure
                  </label>
                  <textarea
                    value={instructions.emailInstructions?.invitation?.systemPrompt || ''}
                    onChange={(e) => updateInstructions({
                      ...instructions,
                      emailInstructions: {
                        ...(instructions.emailInstructions || {}),
                        invitation: { ...(instructions.emailInstructions?.invitation || {}), systemPrompt: e.target.value }
                      }
                    })}
                    rows={8}
                    className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="Psychology:&#10;• Create exclusivity (limited seating, you're invited)&#10;• Make it personal (address by name, reference interests)&#10;• Remove friction (easy RSVP, calendar link, clear logistics)&#10;• Social proof (testimonials, past success)&#10;&#10;Required Elements:&#10;• Clear event details (date, time, format)&#10;• What attendees will learn/gain&#10;• Easy registration CTA&#10;• Optional: Can't attend alternative"
                  />
                </div>
              </div>
            </div>

            {/* Nurturing Drip Emails */}
            <div className="bg-white rounded-lg border-2 border-[#f4f0f0] p-6">
              <h3 className="text-lg font-semibold text-[#4b0f0d] mb-2">Nurturing Drip Emails</h3>
              <p className="text-sm text-[#9b9b9b] mb-4">For automated sequences, education, relationship building</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Psychology & Structure
                  </label>
                  <textarea
                    value={instructions.emailInstructions?.nurturingDrip?.systemPrompt || ''}
                    onChange={(e) => updateInstructions({
                      ...instructions,
                      emailInstructions: {
                        ...(instructions.emailInstructions || {}),
                        nurturingDrip: { ...(instructions.emailInstructions?.nurturingDrip || {}), systemPrompt: e.target.value }
                      }
                    })}
                    rows={8}
                    className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="Psychology:&#10;• Provide value before asking for commitment&#10;• Use AIDA model (Attention, Interest, Desire, Action)&#10;• Educational content builds trust&#10;• Progress from awareness → consideration → decision&#10;&#10;Required Elements:&#10;• One key insight or value point&#10;• Connection to previous emails (if part of sequence)&#10;• Soft CTA (educational resources, not sales)&#10;• Next step preview (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Email Blast */}
            <div className="bg-white rounded-lg border-2 border-[#f4f0f0] p-6">
              <h3 className="text-lg font-semibold text-[#4b0f0d] mb-2">Email Blasts</h3>
              <p className="text-sm text-[#9b9b9b] mb-4">For announcements, news, time-sensitive offers</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Psychology & Structure
                  </label>
                  <textarea
                    value={instructions.emailInstructions?.emailBlast?.systemPrompt || ''}
                    onChange={(e) => updateInstructions({
                      ...instructions,
                      emailInstructions: {
                        ...(instructions.emailInstructions || {}),
                        emailBlast: { ...(instructions.emailInstructions?.emailBlast || {}), systemPrompt: e.target.value }
                      }
                    })}
                    rows={8}
                    className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="Psychology:&#10;• Lead with the news (don't bury the lede)&#10;• Create appropriate urgency (deadline, limited availability)&#10;• Single focus (one message per email)&#10;• Newsworthy subject lines outperform clever ones&#10;&#10;Required Elements:&#10;• Clear announcement in first paragraph&#10;• Why it matters (benefit/impact)&#10;• Strong CTA aligned with announcement&#10;• Deadline or urgency element (if applicable)"
                  />
                </div>
              </div>
            </div>

            {/* Email Examples - Unified across all types */}
            <UnifiedExamplesKnowledgeBase
              title="Email Examples Knowledge Base"
              description="Add examples of emails you like across all types. Organized by email type, not funnel stage."
              examples={instructions.emailInstructions?.invitation?.examples || []}
              onAddExample={addEmailExample}
              onUpdateExample={updateEmailExample}
              onDeleteExample={removeEmailExample}
              onSave={handleSave}
            />
          </div>
        )}

        {/* AI Learning Tab */}
        {activeTab === 'ai-learning' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#4b0f0d] mb-2">🧠 AI Learning System (Advanced)</h2>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">How the AI Learning System Works</h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    <strong>Automatic Pattern Extraction:</strong> When you save examples, the AI automatically analyzes them
                    and extracts patterns based on <strong>Platform × Market × Content Type</strong>.
                  </p>
                  <p className="text-xs bg-blue-100 p-2 rounded">
                    <strong>Example:</strong> META + EMEA + Landing Page = Learns "urgency tactics, scrolling banners, social proof stacking"<br/>
                    GOOGLE + ANZ + Landing Page = Learns "benefit-focused bullets, low-friction CTAs, humble tone"
                  </p>
                  <p>
                    <strong>Granular Learning:</strong> The system learns separately for each combination, so it knows:
                  </p>
                  <ul className="list-disc ml-6 text-xs space-y-1">
                    <li>META ASIA landing pages use contrarian positioning and university prestige</li>
                    <li>GOOGLE EMEA landing pages emphasize trust signals and accreditations</li>
                    <li>META ANZ landing pages use gentle challenges and flexibility focus</li>
                  </ul>
                  <p>
                    <strong>When You Generate Content:</strong> The AI retrieves the exact pattern knowledge for your
                    selected Platform + Market + Content Type and applies those learnings.
                  </p>
                </div>
              </div>
              <p className="text-[#9b9b9b] text-sm">
                💡 <strong>Tip:</strong> You rarely need to view this page. The AI learning happens automatically
                when you save examples. This page is only for advanced debugging or manual pattern review.
              </p>
            </div>

            <PatternKnowledgeViewer brandId={brand.id} />
          </div>
        )}

      </div>

      {/* Global Success Message */}
      {successMessage && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-600 font-medium">{successMessage}</div>
        </div>
      )}
    </div>
  );
};

export default BrandInstructionsEditor;
