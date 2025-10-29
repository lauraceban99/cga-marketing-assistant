import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 text-center">
      <div className="flex items-center justify-center gap-3">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Crimson Academies Creative Assistant
        </h1>
      </div>
      <p className="mt-2 text-lg text-gray-400">
        Your AI partner for on-brand marketing assets.
      </p>
    </header>
  );
};

export default Header;