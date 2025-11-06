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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => onSelectTask('ad-copy')}
          className="group p-8 text-center bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Generate Ad Copies"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-[#9b9b9b] group-hover:text-brand-primary transition-colors mb-4"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 9h6"></path><path d="M9 13h6"></path><path d="M9 17h3"></path></svg>
          <h3 className="text-2xl font-bold text-[#4b0f0d]">Ad Copies</h3>
          <p className="mt-2 text-[#9b9b9b]">Multiple variations with different angles and personas</p>
        </button>

        <button
          onClick={() => onSelectTask('blog')}
          className="group p-8 text-center bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Generate Blog Posts"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-[#9b9b9b] group-hover:text-brand-primary transition-colors mb-4"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          <h3 className="text-2xl font-bold text-[#4b0f0d]">Blog Posts</h3>
          <p className="mt-2 text-[#9b9b9b]">SEO and AI-optimized articles</p>
        </button>

        <button
          onClick={() => onSelectTask('landing-page')}
          className="group p-8 text-center bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Generate Landing Pages"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-[#9b9b9b] group-hover:text-brand-primary transition-colors mb-4"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>
          <h3 className="text-2xl font-bold text-[#4b0f0d]">Landing Pages</h3>
          <p className="mt-2 text-[#9b9b9b]">Complete page copy with structured sections</p>
        </button>

        <button
          onClick={() => onSelectTask('email')}
          className="group p-8 text-center bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Generate Emails"
        >
         <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-[#9b9b9b] group-hover:text-brand-primary transition-colors mb-4"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
          <h3 className="text-2xl font-bold text-[#4b0f0d]">Emails</h3>
          <p className="mt-2 text-[#9b9b9b]">Invitations, nurturing drips, or email blasts</p>
        </button>
      </div>
    </div>
  );
};

export default TaskSelector;