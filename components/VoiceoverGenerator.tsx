import React, { useState } from 'react';
import type { Brand, VoiceOption, VoiceTone, VoiceoverOptions } from '../types';
import { generateVoiceover } from '../services/voiceoverService';
import LoadingSpinner from './LoadingSpinner';

interface VoiceoverGeneratorProps {
  brand: Brand;
  onBack: () => void;
}

const VoiceoverGenerator: React.FC<VoiceoverGeneratorProps> = ({ brand, onBack }) => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState<VoiceOption>('alloy');
  const [tone, setTone] = useState<VoiceTone>('professional');
  const [speed, setSpeed] = useState(1.0);
  const [targetLength, setTargetLength] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [srtContent, setSrtContent] = useState<string | null>(null);

  const voiceDescriptions: Record<VoiceOption, string> = {
    alloy: 'Neutral, clear, versatile',
    echo: 'Male, confident, clear',
    fable: 'British male, warm, expressive',
    onyx: 'Deep male, authoritative',
    nova: 'Female, bright, engaging',
    shimmer: 'Female, soft, friendly'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      setError('Please enter text for the voiceover.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAudioUrl(null);
    setSrtContent(null);

    try {
      const options: VoiceoverOptions = {
        voice,
        tone,
        speed: tone === 'professional' ? 0.98 : tone === 'friendly' ? 1.02 : speed,
        targetLength
      };

      const result = await generateVoiceover(text, options);

      // Create object URL for audio playback
      const url = URL.createObjectURL(result.audioBlob);
      setAudioUrl(url);
      setSrtContent(result.srt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSRT = () => {
    if (!srtContent) return;
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voiceover_captions_${Date.now()}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-[#4b0f0d] mb-4">Generating voiceover...</h2>
        <p className="text-[#9b9b9b] mb-8">Creating audio and captions...</p>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#9b9b9b] hover:text-[#4b0f0d] transition-colors mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6"></path>
        </svg>
        Back to Task Selection
      </button>

      <div className="bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#4b0f0d]">Generate AI Voiceover</h1>
          <p className="text-[#9b9b9b] mt-2">
            Create professional voice-cloned audio with captions for video creatives
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Text Input */}
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-[#4b0f0d] mb-2">
              Voiceover Script *
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder="Paste your voiceover script here. For best results, keep it concise and natural (~150 words per minute)."
              className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
            />
            <p className="text-xs text-[#9b9b9b] mt-2">
              Word count: {text.split(/\s+/).filter(w => w).length} words (~{Math.ceil(text.split(/\s+/).filter(w => w).length / 150 * 60)}s at 150 wpm)
            </p>
          </div>

          {/* Voice Selection */}
          <div>
            <label htmlFor="voice" className="block text-sm font-medium text-[#4b0f0d] mb-2">
              Voice
            </label>
            <select
              id="voice"
              value={voice}
              onChange={(e) => setVoice(e.target.value as VoiceOption)}
              className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
            >
              {(Object.keys(voiceDescriptions) as VoiceOption[]).map((v) => (
                <option key={v} value={v}>
                  {v.charAt(0).toUpperCase() + v.slice(1)} - {voiceDescriptions[v]}
                </option>
              ))}
            </select>
          </div>

          {/* Tone Selection */}
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-[#4b0f0d] mb-2">
              Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as VoiceTone)}
              className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
            >
              <option value="professional">Professional (speed: 0.98x)</option>
              <option value="friendly">Friendly (speed: 1.02x)</option>
              <option value="neutral">Neutral (custom speed)</option>
            </select>
          </div>

          {/* Speed Control (only for neutral tone) */}
          {tone === 'neutral' && (
            <div>
              <label htmlFor="speed" className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Speed: {speed.toFixed(2)}x
              </label>
              <input
                id="speed"
                type="range"
                min="0.9"
                max="1.05"
                step="0.01"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-[#9b9b9b] mt-2">
                Adjust playback speed (0.90 = slower, 1.05 = faster)
              </p>
            </div>
          )}

          {/* Target Length */}
          <div>
            <label htmlFor="targetLength" className="block text-sm font-medium text-[#4b0f0d] mb-2">
              Target Length
            </label>
            <select
              id="targetLength"
              value={targetLength}
              onChange={(e) => setTargetLength(parseInt(e.target.value))}
              className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
            >
              <option value="15">15 seconds (~35-40 words)</option>
              <option value="30">30 seconds (~70-80 words)</option>
              <option value="60">60 seconds (~140-160 words)</option>
            </select>
            <p className="text-xs text-[#9b9b9b] mt-2">
              This is a target guideline. Actual length depends on your script.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-[#780817]/10 border border-[#780817] rounded-lg">
              <p className="text-[#780817] font-medium">{error}</p>
            </div>
          )}

          <div className="pt-6 border-t border-[#f4f0f0]">
            <button
              type="submit"
              className="w-full py-3 px-6 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors shadow-md hover:shadow-lg"
            >
              Generate Voiceover
            </button>
          </div>
        </form>

        {/* Audio Player & Download */}
        {audioUrl && (
          <div className="mt-8 pt-8 border-t border-[#f4f0f0]">
            <h3 className="text-lg font-semibold text-[#4b0f0d] mb-4">Your Voiceover</h3>

            <audio controls className="w-full mb-4">
              <source src={audioUrl} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>

            <div className="flex gap-4">
              <a
                href={audioUrl}
                download={`voiceover_${Date.now()}.wav`}
                className="flex-1 py-3 px-6 bg-[#780817] text-white text-center font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors"
              >
                Download Audio (.wav)
              </a>

              {srtContent && (
                <button
                  onClick={downloadSRT}
                  className="flex-1 py-3 px-6 bg-white border-2 border-[#780817] text-[#780817] font-semibold rounded-md hover:bg-[#780817] hover:text-white transition-colors"
                >
                  Download Captions (.srt)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceoverGenerator;
