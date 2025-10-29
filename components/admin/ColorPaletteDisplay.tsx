import React from 'react';

interface ColorPaletteDisplayProps {
  colors: {
    primary: string[];
    secondary: string[];
    accent: string[];
    all: string[];
  };
  compact?: boolean;
}

const ColorPaletteDisplay: React.FC<ColorPaletteDisplayProps> = ({
  colors,
  compact = false,
}) => {
  if (!colors.all || colors.all.length === 0) {
    return (
      <div className="text-gray-500 text-sm">No colors extracted</div>
    );
  }

  if (compact) {
    // Show only first 4 colors as chips
    return (
      <div className="flex gap-2 flex-wrap">
        {colors.all.slice(0, 4).map((color, index) => (
          <div
            key={index}
            className="w-8 h-8 rounded border border-gray-600"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
        {colors.all.length > 4 && (
          <div className="w-8 h-8 rounded border border-gray-600 bg-gray-700 flex items-center justify-center text-xs text-gray-400">
            +{colors.all.length - 4}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {colors.primary && colors.primary.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Primary Colors</h4>
          <div className="flex gap-2 flex-wrap">
            {colors.primary.map((color, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div
                  className="w-12 h-12 rounded border border-gray-600"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-400">{color}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {colors.secondary && colors.secondary.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Secondary Colors</h4>
          <div className="flex gap-2 flex-wrap">
            {colors.secondary.map((color, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div
                  className="w-12 h-12 rounded border border-gray-600"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-400">{color}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {colors.accent && colors.accent.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Accent Colors</h4>
          <div className="flex gap-2 flex-wrap">
            {colors.accent.map((color, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div
                  className="w-12 h-12 rounded border border-gray-600"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-400">{color}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-2">All Colors ({colors.all.length})</h4>
        <div className="flex gap-2 flex-wrap">
          {colors.all.map((color, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded border border-gray-600"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-400">{color}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteDisplay;
