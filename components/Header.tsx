import React from 'react';

// Set your Crimson Academies logo URL here
// Fallback to direct path if environment variable is not set
const CRIMSON_LOGO_URL = import.meta.env.VITE_CRIMSON_LOGO_URL || '/logos/Crimson%20Academies%20Logo.svg';

interface HeaderProps {
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  // Debug logging
  console.log('Header - CRIMSON_LOGO_URL:', CRIMSON_LOGO_URL);

  return (
    <header className="py-12 text-center">
      <div className="flex flex-col items-center justify-center gap-6">
        {CRIMSON_LOGO_URL && (
          <img
            src={CRIMSON_LOGO_URL}
            alt="Crimson Academies"
            className={`h-20 w-auto object-contain mx-auto ${onLogoClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            onClick={onLogoClick}
            onError={(e) => console.error('Failed to load Crimson logo:', e)}
          />
        )}
        <div>
          <h1 className="text-4xl font-bold text-[#4b0f0d] tracking-tight">
            Crimson Academies Creative Assistant
          </h1>
          <p className="mt-3 text-lg text-[#9b9b9b]">
            Your AI partner for on-brand marketing assets.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;