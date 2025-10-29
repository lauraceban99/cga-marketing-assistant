import type { ParsedGuidelines } from '../types';

/**
 * Extract all hex color codes from text
 */
export const extractColors = (
  text: string
): { primary: string[]; secondary: string[]; accent: string[]; all: string[] } => {
  const hexRegex = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;
  const matches = text.match(hexRegex) || [];

  // Deduplicate and normalize to uppercase
  const uniqueColors = [...new Set(matches.map((color) => color.toUpperCase()))];

  // Simple categorization logic
  // You can enhance this based on your needs
  const primary: string[] = [];
  const secondary: string[] = [];
  const accent: string[] = [];

  uniqueColors.forEach((color) => {
    const lowerText = text.toLowerCase();
    const colorIndex = lowerText.indexOf(color.toLowerCase());
    const contextBefore = lowerText.substring(
      Math.max(0, colorIndex - 50),
      colorIndex
    );

    if (
      contextBefore.includes('primary') ||
      contextBefore.includes('main') ||
      contextBefore.includes('burgundy') ||
      contextBefore.includes('crimson')
    ) {
      primary.push(color);
    } else if (
      contextBefore.includes('secondary') ||
      contextBefore.includes('blue')
    ) {
      secondary.push(color);
    } else if (
      contextBefore.includes('accent') ||
      contextBefore.includes('highlight') ||
      contextBefore.includes('gold') ||
      contextBefore.includes('orange')
    ) {
      accent.push(color);
    }
  });

  return {
    primary: primary.length > 0 ? primary : uniqueColors.slice(0, 4),
    secondary: secondary.length > 0 ? secondary : uniqueColors.slice(4, 8),
    accent: accent.length > 0 ? accent : uniqueColors.slice(8, 12),
    all: uniqueColors,
  };
};

/**
 * Extract typography information from text
 */
export const extractTypography = (
  text: string
): { primary: string; secondary: string; details: string } | undefined => {
  const fontRegex =
    /(?:font|typeface|typography)[\s:]+([A-Za-z\s]+(?:\([^)]+\))?)/gi;
  const matches = [...text.matchAll(fontRegex)];

  if (matches.length === 0) return undefined;

  const fonts = matches.map((match) => match[1].trim());

  return {
    primary: fonts[0] || '',
    secondary: fonts[1] || '',
    details: matches.map((m) => m[0]).join('. '),
  };
};

/**
 * Extract logo rules from text
 */
export const extractLogoRules = (text: string): string | undefined => {
  const logoSectionRegex =
    /logo[\s\S]{0,500}?(?:should|must|do not|avoid|rules|guidelines)[\s\S]{0,500}?(?:\.|$)/gi;
  const matches = text.match(logoSectionRegex);

  if (!matches || matches.length === 0) return undefined;

  return matches.join(' ').trim();
};

/**
 * Parse guidelines from extracted text using patterns
 */
export const parseGuidelinesFromText = (
  extractedText: string
): Partial<ParsedGuidelines> => {
  const lowerText = extractedText.toLowerCase();

  // Extract tone of voice
  let toneOfVoice: string | undefined;
  const toneMatch = extractedText.match(
    /tone[\s\S]{0,50}?voice[\s\S]{0,300}?(?=\n\n|\.\s[A-Z]|$)/i
  );
  if (toneMatch) {
    toneOfVoice = toneMatch[0].trim();
  }

  // Extract key messaging
  let keyMessaging: string | undefined;
  const messagingMatch = extractedText.match(
    /(?:key\s)?messaging[\s\S]{0,300}?(?=\n\n|\.\s[A-Z]|$)/i
  );
  if (messagingMatch) {
    keyMessaging = messagingMatch[0].trim();
  }

  // Extract target audience
  let targetAudience: string | undefined;
  const audienceMatch = extractedText.match(
    /(?:target\s)?audience[\s\S]{0,300}?(?=\n\n|\.\s[A-Z]|$)/i
  );
  if (audienceMatch) {
    targetAudience = audienceMatch[0].trim();
  }

  // Extract values
  let values: string | undefined;
  const valuesMatch = extractedText.match(
    /(?:core\s)?values[\s\S]{0,300}?(?=\n\n|\.\s[A-Z]|$)/i
  );
  if (valuesMatch) {
    values = valuesMatch[0].trim();
  }

  // Extract imagery style
  let imageryStyle: string | undefined;
  const imageryMatch = extractedText.match(
    /imagery[\s\S]{0,300}?(?=\n\n|\.\s[A-Z]|$)/i
  );
  if (imageryMatch) {
    imageryStyle = imageryMatch[0].trim();
  }

  // Extract dos and don'ts
  let dosAndDonts: string | undefined;
  const dosMatch = extractedText.match(
    /(?:do[\s\S]{0,50}?don't|dos[\s\S]{0,50}?don'ts)[\s\S]{0,500}?(?=\n\n|$)/i
  );
  if (dosMatch) {
    dosAndDonts = dosMatch[0].trim();
  }

  // Extract colors
  const colors = extractColors(extractedText);

  // Extract typography
  const typography = extractTypography(extractedText);

  // Extract logo rules
  const logoRules = extractLogoRules(extractedText);

  return {
    guidelines: {
      toneOfVoice,
      keyMessaging,
      targetAudience,
      values,
      imageryStyle,
      dosAndDonts,
    },
    colors,
    typography,
    logoRules,
  };
};
