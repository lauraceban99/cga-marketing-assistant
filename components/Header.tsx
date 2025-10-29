import React from 'react';

// Set your Crimson Academies logo URL here
const CRIMSON_LOGO_URL = import.meta.env.VITE_CRIMSON_LOGO_URL || '';

const Header: React.FC = () => {
  return (
    <header className="py-6 text-center">
      <div className="flex items-center justify-center gap-3">
        {CRIMSON_LOGO_URL && (
          <img
            src={CRIMSON_LOGO_URL}
            alt="Crimson Academies"
            className="h-10 w-10 object-contain"
          />
        )}
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