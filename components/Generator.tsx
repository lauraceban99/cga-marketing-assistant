
import React, { useState } from 'react';
import type { Brand, TaskType, GeneratedCreative } from '../types';
import { generateAsset } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface GeneratorProps {
  brand: Brand;
  taskType: TaskType;
  onAssetGenerated: (creative: GeneratedCreative, prompt: string) => void;
  onBack: () => void;
}

const getTaskDetails = (taskType: TaskType) => {
    switch(taskType) {
        case 'ad':
            return {
                title: 'Describe Your Ad Creative',
                placeholder: "e.g., An ad for CGA's Open Day aimed at Auckland parents of Year 10-12 students. The tone should be reassuring, highlighting our small class sizes (12 students) and individual attention. The CTA is to register on our website.",
                loadingMessage: "Generating your ad creative..."
            };
        case 'copy':
            return {
                title: 'Describe the Text Needed',
                placeholder: "e.g., A short, inspiring paragraph for the introduction of the Mt Hobson prospectus. It should feel nurturing and focus on personalized learning.",
                loadingMessage: "Crafting your copy..."
            };
        case 'email':
            return {
                title: 'Describe the Email Campaign',
                placeholder: "e.g., A 3-email welcome sequence for new EMI leads. Start by introducing our philosophy, then show a project example, and finally invite them to a trial class. The tone should be playful and exciting.",
                loadingMessage: "Writing your email sequence..."
            };
        default:
             return {
                title: 'Describe Your Request',
                placeholder: "Describe what you'd like to create...",
                loadingMessage: "Generating asset..."
            };
    }
}

const Generator: React.FC<GeneratorProps> = ({ brand, taskType, onAssetGenerated, onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const taskDetails = getTaskDetails(taskType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const result = await generateAsset(brand, taskType, prompt);
      onAssetGenerated(result, prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-white mb-4">{taskDetails.loadingMessage}</h2>
        <p className="text-gray-400 mb-8">The AI is warming up. This may take a moment.</p>
        <LoadingSpinner />
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
        Back to Task Selection
      </button>

      <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-semibold text-white mb-6">3. {taskDetails.title}</h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Your Request</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-brand-primary text-lg leading-relaxed"
              placeholder={taskDetails.placeholder}
              required
            />
             <p className="text-xs text-gray-500 mt-2">Be as descriptive as possible. The more detail you provide, the better the result will be.</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700">
          <button type="submit" className="w-full py-3 px-6 bg-brand-primary text-white font-semibold rounded-md hover:bg-red-500 transition-colors">
            Generate Asset
          </button>
        </div>
      </form>
    </div>
  );
};

export default Generator;
