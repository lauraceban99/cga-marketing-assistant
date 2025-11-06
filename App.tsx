
import React, { useState } from 'react';
import Header from './components/Header';
import BrandSelector from './components/BrandSelector';
import TaskSelector from './components/TaskSelector';
import TextGenerator from './components/TextGenerator';
import TextResultsViewer from './components/TextResultsViewer';
import BrandAssetManager from './components/dam/BrandAssetManager';
import { BRANDS } from './constants';
import type { Brand, TaskType } from './types';
import type { GeneratedContent } from './services/textGenerationService';

type AppState = 'brand_selection' | 'task_selection' | 'generator' | 'results' | 'dam';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('brand_selection');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  
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
    }
     if (state === 'task_selection') {
        setGeneratedContent(null);
        setLastPrompt('');
    }
    setAppState(state);
  };
  
  const renderContent = () => {
    switch (appState) {
      case 'task_selection':
        return <TaskSelector brand={selectedBrand!} onSelectTask={handleSelectTask} onBack={() => handleBackTo('brand_selection')} />;
      case 'generator':
        return <TextGenerator brand={selectedBrand!} taskType={selectedTask!} onGenerated={handleContentGenerated} onBack={() => handleBackTo('task_selection')} />;
      case 'results':
        return <TextResultsViewer
                  content={generatedContent!}
                  onBack={() => handleBackTo('task_selection')}
                  onRegenerate={() => handleBackTo('generator')}
                />;
      case 'dam':
        return <BrandAssetManager onBack={() => handleBackTo('brand_selection')} />;
      case 'brand_selection':
      default:
        return <BrandSelector brands={BRANDS} onSelectBrand={handleSelectBrand} />;
    }
  };

  return (
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
  );
};

export default App;
