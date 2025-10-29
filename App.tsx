
import React, { useState } from 'react';
import Header from './components/Header';
import BrandSelector from './components/BrandSelector';
import TaskSelector from './components/TaskSelector';
import Generator from './components/Generator';
import ResultsViewer from './components/AdCreativeViewer';
import { BRANDS } from './constants';
import type { Brand, TaskType, GeneratedCreative } from './types';

type AppState = 'brand_selection' | 'task_selection' | 'generator' | 'results';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('brand_selection');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [generatedCreative, setGeneratedCreative] = useState<GeneratedCreative | null>(null);
  
  const handleSelectBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setAppState('task_selection');
  };

  const handleSelectTask = (taskType: TaskType) => {
    setGeneratedCreative(null);
    setSelectedTask(taskType);
    setAppState('generator');
  };

  const handleAssetGenerated = (creative: GeneratedCreative, prompt: string) => {
    setGeneratedCreative(creative);
    setLastPrompt(prompt);
    setAppState('results');
  };

  const handleBackTo = (state: AppState) => {
    if (state === 'brand_selection') {
      setSelectedBrand(null);
      setGeneratedCreative(null);
      setSelectedTask(null);
      setLastPrompt('');
    }
     if (state === 'task_selection') {
        setGeneratedCreative(null);
        setLastPrompt('');
    }
    setAppState(state);
  };
  
  const renderContent = () => {
    switch (appState) {
      case 'task_selection':
        return <TaskSelector brand={selectedBrand!} onSelectTask={handleSelectTask} onBack={() => handleBackTo('brand_selection')} />;
      case 'generator':
        return <Generator brand={selectedBrand!} taskType={selectedTask!} onAssetGenerated={handleAssetGenerated} onBack={() => handleBackTo('task_selection')} />;
      case 'results':
        return <ResultsViewer 
                  brand={selectedBrand!} 
                  initialCreative={generatedCreative!} 
                  onBack={() => handleBackTo('task_selection')} 
                  taskType={selectedTask!}
                  initialPrompt={lastPrompt}
                  onRegenerate={handleAssetGenerated}
                />;
      case 'brand_selection':
      default:
        return <BrandSelector brands={BRANDS} onSelectBrand={handleSelectBrand} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans px-4 pb-10">
      <Header />
      <main>
        {renderContent()}
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm mt-8">
        <p>Built with React, TypeScript, and the Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
