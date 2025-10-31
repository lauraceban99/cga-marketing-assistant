import React from 'react';

// Set your Crimson Academies logo URL here
const CRIMSON_LOGO_URL = import.meta.env.VITE_CRIMSON_LOGO_URL || '';

const Header: React.FC = () => {
  return (
    <header className="py-12 text-center">
      <div className="flex flex-col items-center justify-center gap-6">
        {CRIMSON_LOGO_URL && (
          <img
            src={CRIMSON_LOGO_URL}
            alt="Crimson Academies"
            className="h-24 w-auto object-contain mx-auto"
          />
        )}
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Crimson Academies Creative Assistant
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            Your AI partner for on-brand marketing assets.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;