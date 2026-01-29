
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BrandSelector from './components/BrandSelector';
import TaskSelector from './components/TaskSelector';
import TextGenerator from './components/TextGenerator';
import VoiceoverGenerator from './components/VoiceoverGenerator';
import TextResultsViewer from './components/TextResultsViewer';
import BrandAssetManager from './components/dam/BrandAssetManager';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineDetector from './components/OfflineDetector';
import { BRANDS } from './constants';
import type { Brand, TaskType } from './types';
import type { GeneratedContent } from './services/textGenerationService';

type AppState = 'brand_selection' | 'task_selection' | 'generator' | 'results' | 'dam';

interface SessionState {
  appState: AppState;
  selectedBrandId: string | null;
  selectedTask: TaskType | null;
  lastPrompt: string;
  hasGeneratedContent: boolean;
  regenerationFeedback: string;
  timestamp: number;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('brand_selection');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [regenerationFeedback, setRegenerationFeedback] = useState<string>('');
  const [showSessionRecovery, setShowSessionRecovery] = useState(false);
  const [savedSession, setSavedSession] = useState<SessionState | null>(null);

  // Session recovery on mount
  useEffect(() => {
    const sessionJson = sessionStorage.getItem('app_session');
    if (sessionJson) {
      try {
        const session: SessionState = JSON.parse(sessionJson);
        const ageMs = Date.now() - session.timestamp;
        const ageMinutes = Math.floor(ageMs / 1000 / 60);

        // Only offer recovery if session is less than 2 hours old
        if (ageMinutes < 120 && session.appState !== 'brand_selection') {
          setSavedSession(session);
          setShowSessionRecovery(true);
          console.log(`📋 Found session from ${ageMinutes} minutes ago`);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      }
    }
  }, []);

  // Save session to sessionStorage on state changes
  useEffect(() => {
    try {
      const session: SessionState = {
        appState,
        selectedBrandId: selectedBrand?.id || null,
        selectedTask,
        lastPrompt,
        hasGeneratedContent: generatedContent !== null,
        regenerationFeedback,
        timestamp: Date.now()
      };

      sessionStorage.setItem('app_session', JSON.stringify(session));
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  }, [appState, selectedBrand, selectedTask, lastPrompt, generatedContent, regenerationFeedback]);

  const restoreSession = () => {
    if (!savedSession) return;

    // Restore brand
    if (savedSession.selectedBrandId) {
      const brand = BRANDS.find(b => b.id === savedSession.selectedBrandId);
      if (brand) {
        setSelectedBrand(brand);
      }
    }

    // Restore task and prompts
    setSelectedTask(savedSession.selectedTask);
    setLastPrompt(savedSession.lastPrompt);
    setRegenerationFeedback(savedSession.regenerationFeedback);

    // Restore app state (but not if user was viewing results, since we don't have the generated content)
    if (savedSession.appState === 'results') {
      setAppState('generator'); // Go back to generator instead
    } else {
      setAppState(savedSession.appState);
    }

    setShowSessionRecovery(false);
    console.log('♻️ Session restored');
  };

  const clearSession = () => {
    sessionStorage.removeItem('app_session');
    setShowSessionRecovery(false);
    setSavedSession(null);
    console.log('🗑️ Session cleared');
  };

  const handleSelectBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setAppState('task_selection');
  };

  const handleSelectTask = (taskType: TaskType) => {
    setGeneratedContent(null);
    setSelectedTask(taskType);
    setAppState('generator');
  };

  const handleContentGenerated = (content: GeneratedContent, prompt: string) => {
    setGeneratedContent(content);
    setLastPrompt(prompt);
    setAppState('results');
  };

  const handleBackTo = (state: AppState) => {
    if (state === 'brand_selection') {
      setSelectedBrand(null);
      setGeneratedContent(null);
      setSelectedTask(null);
      setLastPrompt('');
      setRegenerationFeedback('');
    }
     if (state === 'task_selection') {
        setGeneratedContent(null);
        setLastPrompt('');
        setRegenerationFeedback('');
    }
    setAppState(state);
  };

  const handleRegenerateWithFeedback = (feedback: string) => {
    setRegenerationFeedback(feedback);
    setAppState('generator');
  };

  const handleEditPrompt = () => {
    // Go back to generator while preserving the prompt
    setRegenerationFeedback(''); // Clear any regeneration feedback
    setAppState('generator');
  };
  
  const renderContent = () => {
    switch (appState) {
      case 'task_selection':
        return <TaskSelector brand={selectedBrand!} onSelectTask={handleSelectTask} onBack={() => handleBackTo('brand_selection')} />;
      case 'generator':
        return selectedTask === 'voiceover'
          ? <VoiceoverGenerator brand={selectedBrand!} onBack={() => handleBackTo('task_selection')} />
          : <TextGenerator
              brand={selectedBrand!}
              taskType={selectedTask!}
              onGenerated={handleContentGenerated}
              onBack={() => handleBackTo('task_selection')}
              regenerationFeedback={regenerationFeedback}
              initialPrompt={lastPrompt}
            />;
      case 'results':
        return <TextResultsViewer
                  content={generatedContent!}
                  brand={selectedBrand!}
                  userPrompt={lastPrompt}
                  onBack={() => handleBackTo('task_selection')}
                  onEditPrompt={handleEditPrompt}
                  onRegenerate={handleRegenerateWithFeedback}
                />;
      case 'dam':
        return <BrandAssetManager onBack={() => handleBackTo('brand_selection')} />;
      case 'brand_selection':
      default:
        return <BrandSelector brands={BRANDS} onSelectBrand={handleSelectBrand} />;
    }
  };

  return (
    <ErrorBoundary>
      <OfflineDetector />
      <div className="min-h-screen bg-[#f4f0f0] font-sans px-4 pb-10 relative">
        {/* Session Recovery Modal */}
        {showSessionRecovery && savedSession && (
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
                    Resume Previous Session?
                  </h3>
                  <p className="text-sm text-[#9b9b9b]">
                    We found your previous session. Would you like to continue where you left off?
                  </p>
                  {savedSession.lastPrompt && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
                      <strong>Last prompt:</strong> {savedSession.lastPrompt.substring(0, 100)}
                      {savedSession.lastPrompt.length > 100 && '...'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={restoreSession}
                  className="w-full px-6 py-3 bg-[#780817] text-white font-bold rounded-lg hover:bg-[#4b0f0d] transition-colors"
                >
                  ♻️ Resume Session
                </button>
                <button
                  onClick={clearSession}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subtle gradient overlay using brand colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4b0f0d]/5 via-transparent to-[#04114a]/5 pointer-events-none"></div>

        <div className="relative">
          <Header onLogoClick={() => handleBackTo('brand_selection')} />

        {/* Admin Access Button (only on brand selection page) */}
        {appState === 'brand_selection' && (
          <div className="max-w-4xl mx-auto mb-8 text-center">
            <button
              onClick={() => setAppState('dam')}
              className="px-6 py-3 bg-[#780817] hover:bg-[#4b0f0d] text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              📁 Manage Brand Assets
            </button>
          </div>
        )}

        <main>
          {renderContent()}
        </main>
        <footer className="text-center py-6 text-[#9b9b9b] text-sm mt-8">
          <p>Built with React, TypeScript, and the Gemini API.</p>
        </footer>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default App;
