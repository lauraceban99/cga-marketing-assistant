import type { Theme, AdCopy, Brand } from '../types';

/**
 * Build enhanced, detailed image prompts for Gemini 2.5 Flash
 * Based on successful Reddit examples, this creates structured prompts
 * that produce 85-90% production-ready ads
 */
export function buildEnhancedImagePrompt(
  theme: Theme,
  adCopy: AdCopy,
  brand: Brand
): string {

  // Determine scene setting based on theme
  const setting = determineSceneSetting(theme);

  // Extract action/moment from copy
  const action = extractActionFromCopy(adCopy);

  // Build brand color guidance
  const brandColors = brand.guidelines.palette || 'Brand primary and secondary colors';

  // Build detailed prompt
  return `Create a professional Facebook ad image (1200x628px) for ${brand.name}'s ${theme.themeName} campaign.

CAMPAIGN CONTEXT:
Brand: ${brand.name}
Theme: ${theme.themeName}
Target Audience: ${theme.audience}
Location: ${theme.location}
Emotion/Focus: ${theme.adFocus}

SCENE COMPOSITION:
Setting: ${setting}
Subject: ${theme.audiencePersona}
- Should look like real ${theme.audience}, not models
- Authentic emotions and expressions
- Age-appropriate and diverse representation
Action/Moment: ${action}

VISUAL STYLE:
Photography Style: ${brand.guidelines.imageryStyle || 'Professional, authentic documentary photography'}
Mood: ${theme.adFocus}
Lighting: Natural, warm, authentic (not studio lit)
Angle: Eye-level, documentary style
Feel: Candid and genuine, NOT staged or stock photo-like

COMPOSITION REQUIREMENTS:
Layout: Rule of thirds - subject positioned left or center
Text Space: Right third of image COMPLETELY CLEAR for text overlay
Background: Slightly blurred (shallow depth of field)
Foreground: Sharp focus on main subject
Logo Space: Bottom right corner - keep 100x100px area clear

BRAND REQUIREMENTS:
Color Palette: Incorporate ${brandColors} naturally in scene
${brand.guidelines.dosAndDonts ? `Brand Guidelines: ${brand.guidelines.dosAndDonts}` : ''}
${brand.logoUrl ? `Logo: Include brand logo subtly in composition` : ''}

TECHNICAL SPECIFICATIONS:
- Resolution: 1200x628px (Facebook ad format)
- Aspect ratio: 1.91:1
- Format: Horizontal landscape
- Quality: Production-ready, print-quality
- Style: Professional photography, NOT AI-generated looking

AD COPY CONTEXT (for visual alignment):
Headline: "${adCopy.headline}"
Primary Message: "${adCopy.primaryText.substring(0, 150)}..."
Call-to-Action: "${adCopy.cta}"

OUTPUT REQUIREMENTS:
Create an image that looks like authentic documentary photography, not stock imagery or AI art. The image should feel like a real moment captured naturally, with genuine emotions and interactions. Avoid anything that looks posed, artificial, or generic.

The image must complement the ad copy and visually reinforce the ${theme.adFocus} emotion while maintaining professional quality suitable for immediate publication.
`;
}

/**
 * Determine scene setting based on theme name
 */
function determineSceneSetting(theme: Theme): string {
  const themeLower = theme.themeName.toLowerCase();

  if (themeLower.includes('open day') || themeLower.includes('visit') || themeLower.includes('tour')) {
    return 'Campus tour or classroom environment, students collaborating and engaging with educators, vibrant learning spaces visible';
  }

  if (themeLower.includes('results') || themeLower.includes('achievement') || themeLower.includes('success')) {
    return 'Celebration moment or achievement recognition, genuine joy and pride, perhaps holding certificates or discussing accomplishments';
  }

  if (themeLower.includes('program') || themeLower.includes('course') || themeLower.includes('curriculum')) {
    return 'Modern learning environment, technology-enabled education setting, students engaged with contemporary learning tools';
  }

  if (themeLower.includes('parent') || themeLower.includes('family')) {
    return 'Family conversation or home setting, warm and supportive atmosphere, parents and children interacting naturally';
  }

  if (themeLower.includes('online') || themeLower.includes('remote') || themeLower.includes('virtual')) {
    return 'Home learning setup, student engaged with laptop or tablet, comfortable modern home environment, technology enabling education';
  }

  if (themeLower.includes('scholarship') || themeLower.includes('financial') || themeLower.includes('fee')) {
    return 'Supportive educational setting emphasizing opportunity and accessibility, diverse students in collaborative learning';
  }

  if (themeLower.includes('university') || themeLower.includes('prep') || themeLower.includes('college')) {
    return 'Academic preparation setting, older students engaged in advanced learning, university campus or sophisticated study environment';
  }

  // Default
  return 'Educational environment that feels welcoming and inspiring, students authentically engaged in learning activities';
}

/**
 * Extract action/moment from ad copy to guide image composition
 */
function extractActionFromCopy(adCopy: AdCopy): string {
  const headline = adCopy.headline.toLowerCase();
  const primaryText = adCopy.primaryText.toLowerCase();
  const combined = `${headline} ${primaryText}`;

  if (combined.includes('discover') || combined.includes('explore') || combined.includes('find')) {
    return 'Students actively exploring and discovering, engaged and curious, leaning in with interest';
  }

  if (combined.includes('achieve') || combined.includes('success') || combined.includes('excel')) {
    return 'Moment of achievement or success, genuine celebration, positive accomplishment emotions';
  }

  if (combined.includes('join') || combined.includes('be part') || combined.includes('belong')) {
    return 'Students working together collaboratively, sense of community and belonging, inclusive group dynamics';
  }

  if (combined.includes('learn') || combined.includes('study') || combined.includes('master')) {
    return 'Focused learning moment, concentration and engagement, active knowledge acquisition';
  }

  if (combined.includes('grow') || combined.includes('develop') || combined.includes('transform')) {
    return 'Developmental moment showing progress, student engaged in skill-building, visible growth and confidence';
  }

  if (combined.includes('future') || combined.includes('ready') || combined.includes('prepare')) {
    return 'Forward-looking scene with student displaying confidence and readiness, aspirational yet grounded';
  }

  if (combined.includes('question') || combined.includes('wondering') || combined.includes('curious')) {
    return 'Contemplative moment, student or parent considering options, thoughtful expression';
  }

  // Default
  return 'Natural interaction and engagement, authentic educational moment, genuine connection and focus';
}

/**
 * Build prompt for variation generation (slight modifications to base prompt)
 */
export function buildVariationPrompt(
  basePrompt: string,
  variationIndex: number
): string {
  const variations = [
    '\n\nVARIATION ADJUSTMENT: Slightly different camera angle (10-15 degrees), maintaining same composition principles',
    '\n\nVARIATION ADJUSTMENT: Different time of day lighting (golden hour feel), same scene and subjects',
    '\n\nVARIATION ADJUSTMENT: Tighter crop focusing more on main subject, same authentic moment',
    '\n\nVARIATION ADJUSTMENT: Wider shot showing more environment context, same authentic interaction',
    '\n\nVARIATION ADJUSTMENT: Different depth of field (more background blur), emphasizing subject focus'
  ];

  return basePrompt + (variations[variationIndex % variations.length]);
}

/**
 * Build simplified prompt when Theme data is not available (fallback)
 */
export function buildSimplifiedImagePrompt(
  brand: Brand,
  adCopy: AdCopy,
  userPrompt: string
): string {
  // Extract key details from user prompt
  const promptLower = userPrompt.toLowerCase();
  let setting = 'educational environment';
  let audience = 'students and families';

  if (promptLower.includes('parent')) {
    audience = 'parents';
  } else if (promptLower.includes('student')) {
    audience = 'students';
  }

  if (promptLower.includes('open day') || promptLower.includes('campus')) {
    setting = 'campus tour or open day environment';
  } else if (promptLower.includes('online') || promptLower.includes('remote')) {
    setting = 'home learning environment with technology';
  }

  return `Create a professional Facebook ad image (1200x628px) for ${brand.name}.

USER REQUEST: ${userPrompt}

SCENE COMPOSITION:
Setting: ${setting}
Subject: ${audience}
- Authentic, real people (not models or stock photos)
- Genuine emotions and natural expressions
- Documentary-style photography

VISUAL STYLE:
Photography Style: ${brand.guidelines.imageryStyle || 'Professional, authentic, documentary'}
Lighting: Natural, warm, authentic
Composition: Rule of thirds, clear focal point
Background: Slightly blurred for depth

BRAND REQUIREMENTS:
${brand.guidelines.palette ? `Colors: ${brand.guidelines.palette}` : ''}
${brand.guidelines.dosAndDonts ? `Guidelines: ${brand.guidelines.dosAndDonts}` : ''}

TECHNICAL SPECIFICATIONS:
- Resolution: 1200x628px
- Format: Horizontal landscape (1.91:1)
- Quality: Production-ready
- Style: Professional photography, NOT AI-generated looking

AD COPY CONTEXT:
Headline: "${adCopy.headline}"
CTA: "${adCopy.cta}"

OUTPUT: Create an authentic, professional image that looks like real documentary photography, not stock imagery or AI art. The image should complement the ad copy and feel genuine and professional.
`;
}
