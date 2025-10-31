import React from 'react';
import type { Brand, TaskType } from '../types';

interface TaskSelectorProps {
  brand: Brand;
  onSelectTask: (taskType: TaskType) => void;
  onBack: () => void;
}

const TaskSelector: React.FC<TaskSelectorProps> = ({ brand, onSelectTask, onBack }) => {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#9b9b9b] hover:text-[#4b0f0d] transition-colors mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
            Change Brand
          </button>
        <h2 className="text-2xl font-semibold text-[#4b0f0d]">2. What would you like to generate for <span className="text-brand-primary">{brand.name}</span>?</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onSelectTask('copy')}
          className="group p-8 text-center bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Generate Text Only"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-[#9b9b9b] group-hover:text-brand-primary transition-colors mb-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
          <h3 className="text-2xl font-bold text-[#4b0f0d]">Generate Text Only</h3>
          <p className="mt-2 text-[#9b9b9b]">For social media, flyers, prospectus text, etc.</p>
        </button>

        <button
          onClick={() => onSelectTask('ad')}
          className="group p-8 text-center bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Generate Full Ad"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-[#9b9b9b] group-hover:text-brand-primary transition-colors mb-4"><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="M20.4 14.5c-2.1 2.5-5.4 4.5-9.4 4.5s-7.3-2-9.4-4.5"></path></svg>
          <h3 className="text-2xl font-bold text-[#4b0f0d]">Generate Full Ad</h3>
          <p className="mt-2 text-[#9b9b9b]">Creates ad copy paired with a custom, on-brand image.</p>
        </button>
        
        <button
          onClick={() => onSelectTask('email')}
          className="group p-8 text-center bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Generate Emails / Drips"
        >
         <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-[#9b9b9b] group-hover:text-brand-primary transition-colors mb-4"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
          <h3 className="text-2xl font-bold text-[#4b0f0d]">Emails / Drips</h3>
          <p className="mt-2 text-[#9b9b9b]">Create single emails or entire nurturing sequences.</p>
        </button>
      </div>
    </div>
  );
};

export default TaskSelector;