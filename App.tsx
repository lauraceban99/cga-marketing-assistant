
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
  // Silent session auto-restore on mount (no modal - like Notion/Figma)
  useEffect(() => {
    const sessionJson = sessionStorage.getItem('app_session');
    if (sessionJson) {
      try {
        const session: SessionState = JSON.parse(sessionJson);
        const ageMinutes = Math.floor((Date.now() - session.timestamp) / 1000 / 60);

        // Auto-restore if less than 2 hours old (silently, no asking)
        if (ageMinutes < 120 && session.appState !== 'brand_selection') {
          // Restore brand
          if (session.selectedBrandId) {
            const brand = BRANDS.find(b => b.id === session.selectedBrandId);
            if (brand) setSelectedBrand(brand);
          }

          // Restore task and prompts
          setSelectedTask(session.selectedTask);
          setLastPrompt(session.lastPrompt);
          setRegenerationFeedback(session.regenerationFeedback);

          // Restore app state (but not results view)
          setAppState(session.appState === 'results' ? 'generator' : session.appState);

          console.log(`✅ Session restored silently (${ageMinutes} min ago)`);
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
