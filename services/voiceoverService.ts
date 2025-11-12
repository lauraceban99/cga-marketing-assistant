import type { VoiceoverOptions } from '../types';

/**
 * Trim and optimize text for voiceover (target ~150 words per minute)
 */
function optimizeTextForVoiceover(text: string, targetSeconds: number): string {
  const targetWords = Math.floor((targetSeconds / 60) * 150);
  const words = text.trim().split(/\s+/);

  if (words.length <= targetWords) {
    return text.trim();
  }

  // Truncate to target words, ending at sentence boundary if possible
  const truncated = words.slice(0, targetWords).join(' ');
  const lastPeriod = truncated.lastIndexOf('.');
  const lastQuestion = truncated.lastIndexOf('?');
  const lastExclamation = truncated.lastIndexOf('!');

  const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);

  if (lastSentenceEnd > truncated.length * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1).trim();
  }

  return truncated + '...';
}

/**
 * Build SRT (SubRip) captions from text
 */
function buildSRT(text: string, wpm: number = 150): string {
  const secsPerWord = 60 / wpm;

  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]?/g) || [text];

  let currentTime = 0;
  let index = 1;
  const srtBlocks: string[] = [];

  for (const sentence of sentences.map(s => s.trim()).filter(Boolean)) {
    const words = sentence.split(/\s+/).length;
    const duration = Math.max(1.2, words * secsPerWord); // Minimum 1.2s per sentence

    srtBlocks.push(
      `${index}\n${formatTimestamp(currentTime)} --> ${formatTimestamp(currentTime + duration)}\n${sentence}\n`
    );

    currentTime += duration;
    index++;
  }

  return srtBlocks.join('\n');
}

/**
 * Format timestamp for SRT (HH:MM:SS,mmm)
 */
function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

/**
 * Generate voiceover using OpenAI TTS
 */
export async function generateVoiceover(
  text: string,
  options: VoiceoverOptions
): Promise<{ audioBlob: Blob; srt: string; optimizedText: string }> {
  // Optimize text for target length
  const optimizedText = optimizeTextForVoiceover(text, options.targetLength);

  console.log(`🎙️ Generating voiceover with voice: ${options.voice}, speed: ${options.speed}`);

  // Call OpenAI TTS API
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1-hd', // Use HD model for better quality
      input: optimizedText,
      voice: options.voice,
      speed: options.speed,
      response_format: 'wav'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ OpenAI TTS API error:', error);
    throw new Error(`OpenAI TTS API error: ${response.status} - ${error}`);
  }

  const audioBlob = await response.blob();

  // Generate SRT captions
  const wpm = 150 / options.speed; // Adjust words per minute based on speed
  const srt = buildSRT(optimizedText, wpm);

  console.log('✅ Voiceover generated successfully');

  return {
    audioBlob,
    srt,
    optimizedText
  };
}
