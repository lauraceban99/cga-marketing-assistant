import React, { useState, useEffect } from 'react';
import type {
  Brand,
  BrandInstructions,
  PersonaDefinition,
  CampaignExample,
  TaskType,
  CampaignStage
} from '../../types';
import { getBrandInstructions, saveBrandInstructions } from '../../services/instructionsService';
import LoadingSpinner from '../LoadingSpinner';

interface BrandInstructionsEditorProps {
  brand: Brand;
  onBack: () => void;
}

const BrandInstructionsEditor: React.FC<BrandInstructionsEditorProps> = ({ brand, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instructions, setInstructions] = useState<BrandInstructions | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'ad-copy' | 'blog' | 'landing-page' | 'email'>('general');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadInstructions();
  }, [brand.id]);

  const loadInstructions = async () => {
    setLoading(true);
    const data = await getBrandInstructions(brand.id);
    setInstructions(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!instructions) return;

    setSaving(true);
    setSuccessMessage('');
    try {
      await saveBrandInstructions(brand.id, instructions, 'admin');
      setSuccessMessage('Instructions saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving instructions:', error);
      alert('Error saving instructions');
    } finally {
      setSaving(false);
    }
  };

  const addPersona = () => {
    if (!instructions) return;
    const newPersona: PersonaDefinition = {
      name: '',
      description: '',
      painPoints: [''],
      solution: ''
    };
    setInstructions({
      ...instructions,
      personas: [...instructions.personas, newPersona]
    });
  };

  const updatePersona = (index: number, field: keyof PersonaDefinition, value: any) => {
    if (!instructions) return;
    const updatedPersonas = [...instructions.personas];
    updatedPersonas[index] = { ...updatedPersonas[index], [field]: value };
    setInstructions({ ...instructions, personas: updatedPersonas });
  };

  const removePersona = (index: number) => {
    if (!instructions) return;
    const updatedPersonas = instructions.personas.filter((_, i) => i !== index);
    setInstructions({ ...instructions, personas: updatedPersonas });
  };

  const addPainPoint = (personaIndex: number) => {
    if (!instructions) return;
    const updatedPersonas = [...instructions.personas];
    updatedPersonas[personaIndex].painPoints.push('');
    setInstructions({ ...instructions, personas: updatedPersonas });
  };

  const updatePainPoint = (personaIndex: number, painPointIndex: number, value: string) => {
    if (!instructions) return;
    const updatedPersonas = [...instructions.personas];
    updatedPersonas[personaIndex].painPoints[painPointIndex] = value;
    setInstructions({ ...instructions, personas: updatedPersonas });
  };

  const removePainPoint = (personaIndex: number, painPointIndex: number) => {
    if (!instructions) return;
    const updatedPersonas = [...instructions.personas];
    updatedPersonas[personaIndex].painPoints = updatedPersonas[personaIndex].painPoints.filter((_, i) => i !== painPointIndex);
    setInstructions({ ...instructions, personas: updatedPersonas });
  };

  const addExample = (type: 'adCopy' | 'blog' | 'landingPage') => {
    if (!instructions) return;
    const newExample: CampaignExample = {
      stage: 'mofu',
      type: type === 'adCopy' ? 'ad-copy' : type === 'blog' ? 'blog' : 'landing-page',
      headline: '',
      copy: '',
      cta: '',
      notes: ''
    };

    const fieldMap = {
      adCopy: 'adCopyInstructions',
      blog: 'blogInstructions',
      landingPage: 'landingPageInstructions'
    } as const;

    const field = fieldMap[type];
    setInstructions({
      ...instructions,
      [field]: {
        ...instructions[field],
        examples: [...instructions[field].examples, newExample]
      }
    });
  };

  const updateExample = (
    type: 'adCopy' | 'blog' | 'landingPage',
    index: number,
    field: keyof CampaignExample,
    value: any
  ) => {
    if (!instructions) return;
    const fieldMap = {
      adCopy: 'adCopyInstructions',
      blog: 'blogInstructions',
      landingPage: 'landingPageInstructions'
    } as const;

    const instructionField = fieldMap[type];
    const updatedExamples = [...instructions[instructionField].examples];
    updatedExamples[index] = { ...updatedExamples[index], [field]: value };

    setInstructions({
      ...instructions,
      [instructionField]: {
        ...instructions[instructionField],
        examples: updatedExamples
      }
    });
  };

  const removeExample = (type: 'adCopy' | 'blog' | 'landingPage', index: number) => {
    if (!instructions) return;
    const fieldMap = {
      adCopy: 'adCopyInstructions',
      blog: 'blogInstructions',
      landingPage: 'landingPageInstructions'
    } as const;

    const field = fieldMap[type];
    const updatedExamples = instructions[field].examples.filter((_, i) => i !== index);

    setInstructions({
      ...instructions,
      [field]: {
        ...instructions[field],
        examples: updatedExamples
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <LoadingSpinner />
        <p className="mt-4 text-[#9b9b9b]">Loading instructions...</p>
      </div>
    );
  }

  if (!instructions) {
    return <div>Error loading instructions</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#9b9b9b] hover:text-[#4b0f0d] transition-colors mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
        Back to Brand Assets
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#4b0f0d] mb-2">
          Brand Instructions for {brand.name}
        </h1>
        <p className="text-[#9b9b9b]">
          Manage general brand information and content-specific instructions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#f4f0f0] overflow-x-auto">
        {[
          { id: 'general', label: 'General Brand' },
          { id: 'ad-copy', label: 'Ad Copies' },
          { id: 'blog', label: 'Blogs' },
          { id: 'landing-page', label: 'Landing Pages' },
          { id: 'email', label: 'Emails' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[#780817] border-b-2 border-[#780817]'
                : 'text-[#9b9b9b] hover:text-[#4b0f0d]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border-2 border-[#f4f0f0] shadow-lg p-8">
        {/* General Brand Tab */}
        {activeTab === 'general' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[#4b0f0d]">General Brand Information</h2>

            {/* Brand Introduction */}
            <div>
              <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Brand Introduction
              </label>
              <textarea
                value={instructions.brandIntroduction}
                onChange={(e) => setInstructions({ ...instructions, brandIntroduction: e.target.value })}
                rows={6}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
                placeholder="Who you are, what you do, your mission and vision..."
              />
            </div>

            {/* Tone of Voice */}
            <div>
              <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Tone of Voice
              </label>
              <input
                type="text"
                value={instructions.toneOfVoice}
                onChange={(e) => setInstructions({ ...instructions, toneOfVoice: e.target.value })}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
                placeholder="e.g., Warm, professional, conversational, aspirational"
              />
            </div>

            {/* Core Values */}
            <div>
              <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Core Values (comma-separated)
              </label>
              <input
                type="text"
                value={instructions.coreValues.join(', ')}
                onChange={(e) => setInstructions({
                  ...instructions,
                  coreValues: e.target.value.split(',').map(v => v.trim()).filter(v => v)
                })}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
                placeholder="Flexibility, Excellence, Community"
              />
            </div>

            {/* Key Messaging */}
            <div>
              <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Key Messaging Points (comma-separated)
              </label>
              <textarea
                value={instructions.keyMessaging.join(', ')}
                onChange={(e) => setInstructions({
                  ...instructions,
                  keyMessaging: e.target.value.split(',').map(v => v.trim()).filter(v => v)
                })}
                rows={3}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
                placeholder="Flexible learning, Global community, University pathways"
              />
            </div>

            {/* Personas */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-[#4b0f0d]">
                  Target Personas
                </label>
                <button
                  onClick={addPersona}
                  className="px-4 py-2 bg-[#780817] text-white rounded-md hover:bg-[#4b0f0d] transition-colors"
                >
                  + Add Persona
                </button>
              </div>

              {instructions.personas.map((persona, index) => (
                <div key={index} className="mb-6 p-4 bg-[#f4f0f0] rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-[#4b0f0d]">Persona {index + 1}</h4>
                    <button
                      onClick={() => removePersona(index)}
                      className="text-sm text-[#780817] hover:text-[#4b0f0d]"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={persona.name}
                      onChange={(e) => updatePersona(index, 'name', e.target.value)}
                      placeholder="Persona Name (e.g., Ambitious Athlete Parent)"
                      className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    />

                    <textarea
                      value={persona.description}
                      onChange={(e) => updatePersona(index, 'description', e.target.value)}
                      rows={3}
                      placeholder="Detailed persona description..."
                      className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-[#4b0f0d]">Pain Points</label>
                        <button
                          onClick={() => addPainPoint(index)}
                          className="text-sm text-[#780817] hover:text-[#4b0f0d]"
                        >
                          + Add Pain Point
                        </button>
                      </div>
                      {persona.painPoints.map((painPoint, ppIndex) => (
                        <div key={ppIndex} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={painPoint}
                            onChange={(e) => updatePainPoint(index, ppIndex, e.target.value)}
                            placeholder="Pain point..."
                            className="flex-1 bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-2 focus:ring-2 focus:ring-[#780817]"
                          />
                          <button
                            onClick={() => removePainPoint(index, ppIndex)}
                            className="px-3 text-[#780817] hover:text-[#4b0f0d]"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <textarea
                      value={persona.solution}
                      onChange={(e) => updatePersona(index, 'solution', e.target.value)}
                      rows={3}
                      placeholder="How your brand solves these pain points..."
                      className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Zoom Interview Transcripts */}
            <div>
              <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Zoom Interview Transcripts
                <span className="text-xs text-[#9b9b9b] ml-2">
                  (Use these to ensure authentic voice and avoid fabricating testimonials)
                </span>
              </label>
              <textarea
                value={instructions.referenceMaterials.interviews || ''}
                onChange={(e) => setInstructions({
                  ...instructions,
                  referenceMaterials: { ...instructions.referenceMaterials, interviews: e.target.value }
                })}
                rows={10}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817] font-mono text-sm"
                placeholder="Paste interview transcripts here..."
              />
            </div>

            {/* Testimonials */}
            <div>
              <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                Real Testimonials
              </label>
              <textarea
                value={instructions.referenceMaterials.testimonials || ''}
                onChange={(e) => setInstructions({
                  ...instructions,
                  referenceMaterials: { ...instructions.referenceMaterials, testimonials: e.target.value }
                })}
                rows={6}
                className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] focus:border-[#780817]"
                placeholder="Paste actual testimonials from students and parents. These will be used as reference, not fabricated."
              />
            </div>
          </div>
        )}

        {/* Ad Copy Tab */}
        {activeTab === 'ad-copy' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[#4b0f0d]">Ad Copy Instructions & Examples</h2>

            {/* Instructions Section */}
            <div className="bg-[#f4f0f0] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#4b0f0d] mb-4">Generation Instructions</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Length Guidelines
                  </label>
                  <input
                    type="text"
                    value={instructions.adCopyInstructions.requirements}
                    onChange={(e) => setInstructions({
                      ...instructions,
                      adCopyInstructions: { ...instructions.adCopyInstructions, requirements: e.target.value }
                    })}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="e.g., Short: 50-80 words, Long: 120-180 words"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Number of Variations
                  </label>
                  <input
                    type="text"
                    defaultValue="5 variations minimum"
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="How many ad variations to generate per request"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Variation Strategy
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="e.g., Each variation should target a different persona, use different emotional angles (aspiration, urgency, social proof), and vary opening hooks"
                  />
                </div>

                {/* Campaign Stage CTAs */}
                <div>
                  <h4 className="text-md font-semibold text-[#4b0f0d] mb-3">Campaign Stage CTAs</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#4b0f0d] mb-1">
                        TOFU - Awareness Stage CTAs
                      </label>
                      <input
                        type="text"
                        value={instructions.campaignInstructions.tofu}
                        onChange={(e) => setInstructions({
                          ...instructions,
                          campaignInstructions: { ...instructions.campaignInstructions, tofu: e.target.value }
                        })}
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-2 focus:ring-2 focus:ring-[#780817]"
                        placeholder="e.g., Learn More, Explore Programs, Download Guide"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4b0f0d] mb-1">
                        MOFU - Consideration Stage CTAs
                      </label>
                      <input
                        type="text"
                        value={instructions.campaignInstructions.mofu}
                        onChange={(e) => setInstructions({
                          ...instructions,
                          campaignInstructions: { ...instructions.campaignInstructions, mofu: e.target.value }
                        })}
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-2 focus:ring-2 focus:ring-[#780817]"
                        placeholder="e.g., Book a Consultation, Schedule a Tour, Get Started"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4b0f0d] mb-1">
                        BOFU - Decision Stage CTAs
                      </label>
                      <input
                        type="text"
                        value={instructions.campaignInstructions.bofu}
                        onChange={(e) => setInstructions({
                          ...instructions,
                          campaignInstructions: { ...instructions.campaignInstructions, bofu: e.target.value }
                        })}
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-2 focus:ring-2 focus:ring-[#780817]"
                        placeholder="e.g., Apply Now, Enroll Today, Start This Month"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Instructions'}
                  </button>
                </div>
              </div>
            </div>

            {/* Examples Knowledge Base */}
            <div className="bg-white rounded-lg border-2 border-[#f4f0f0] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#4b0f0d]">Ad Copy Examples Knowledge Base</h3>
                  <p className="text-sm text-[#9b9b9b] mt-1">
                    Add examples of ad copies you like. AI will learn from these.
                  </p>
                </div>
                <button
                  onClick={() => addExample('adCopy')}
                  className="px-4 py-2 bg-[#780817] text-white rounded-md hover:bg-[#4b0f0d] transition-colors text-sm font-semibold"
                >
                  + Add Example
                </button>
              </div>

              {instructions.adCopyInstructions.examples.map((example, index) => (
                <div key={index} className="mb-6 p-4 bg-[#f4f0f0] rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-[#4b0f0d]">Example {index + 1}</h4>
                    <button
                      onClick={() => removeExample('adCopy', index)}
                      className="text-sm text-[#780817] hover:text-[#4b0f0d]"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Campaign Stage</label>
                      <select
                        value={example.stage}
                        onChange={(e) => updateExample('adCopy', index, 'stage', e.target.value as CampaignStage)}
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      >
                        <option value="tofu">TOFU - Awareness (Learn More, Explore)</option>
                        <option value="mofu">MOFU - Consideration (Book Consultation, Get Started)</option>
                        <option value="bofu">BOFU - Decision (Apply Now, Enroll Today)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Headline (optional)</label>
                      <input
                        type="text"
                        value={example.headline || ''}
                        onChange={(e) => updateExample('adCopy', index, 'headline', e.target.value)}
                        placeholder="e.g., Where Learning Meets Life"
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Ad Copy Body *</label>
                      <textarea
                        value={example.copy}
                        onChange={(e) => updateExample('adCopy', index, 'copy', e.target.value)}
                        rows={5}
                        placeholder="Paste the full ad copy here. This is the main body text that will be shown to your audience."
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Call to Action *</label>
                      <input
                        type="text"
                        value={example.cta}
                        onChange={(e) => updateExample('adCopy', index, 'cta', e.target.value)}
                        placeholder="e.g., Book Free Consultation"
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Notes (optional)</label>
                      <textarea
                        value={example.notes || ''}
                        onChange={(e) => updateExample('adCopy', index, 'notes', e.target.value)}
                        rows={2}
                        placeholder="Why does this ad work well? What makes it effective?"
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-4 border-t border-[#f4f0f0]">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Examples'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blog Tab */}
        {activeTab === 'blog' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[#4b0f0d]">Blog Post Instructions & Examples</h2>

            {/* Instructions Section */}
            <div className="bg-[#f4f0f0] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#4b0f0d] mb-4">Generation Instructions</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    System Prompt for Blog Generation
                  </label>
                  <textarea
                    value={instructions.blogInstructions.systemPrompt}
                    onChange={(e) => setInstructions({
                      ...instructions,
                      blogInstructions: { ...instructions.blogInstructions, systemPrompt: e.target.value }
                    })}
                    rows={4}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="You are an SEO + AI–optimized blog writer. Produce helpful, people-first long-form content that ranks, wins AI snippet visibility, and builds trust."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Hard Requirements
                    <span className="text-xs text-[#9b9b9b] ml-2">Length, structure, SEO requirements</span>
                  </label>
                  <textarea
                    value={instructions.blogInstructions.requirements}
                    onChange={(e) => setInstructions({
                      ...instructions,
                      blogInstructions: { ...instructions.blogInstructions, requirements: e.target.value }
                    })}
                    rows={8}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="• Length: 1,800–2,400 words (evergreen), 1,200–1,600 (news)&#10;• H1 (1), H2/H3 every 250–350 words&#10;• TL;DR (3–5 bullets) after intro&#10;• Featured-snippet block: 40–55-word answer near top&#10;• FAQ: 4–6 questions&#10;• On-page SEO: keyword in H1, intro, 1–2 H2s&#10;• 3–7 visuals with alt text&#10;• One clear CTA tied to stage (TOFU/MOFU/BOFU)&#10;• No fabricated stats → use [PLACEHOLDER: stat/source]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Target SEO Keywords
                  </label>
                  <textarea
                    rows={2}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="List your primary keywords and topics you want to rank for. E.g., online high school, flexible education, homeschooling alternatives"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Internal Linking Strategy
                  </label>
                  <textarea
                    rows={2}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="Which pages should blog posts link to? E.g., 3 internal + 2 external links minimum"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Blog Instructions'}
                  </button>
                </div>
              </div>
            </div>

            {/* Examples Knowledge Base */}
            <div className="bg-white rounded-lg border-2 border-[#f4f0f0] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#4b0f0d]">Blog Examples Knowledge Base</h3>
                  <p className="text-sm text-[#9b9b9b] mt-1">
                    Add examples of blog posts you like. AI will learn from these.
                  </p>
                </div>
                <button
                  onClick={() => addExample('blog')}
                  className="px-4 py-2 bg-[#780817] text-white rounded-md hover:bg-[#4b0f0d] transition-colors text-sm font-semibold"
                >
                  + Add Example
                </button>
              </div>

              {instructions.blogInstructions.examples.map((example, index) => (
                <div key={index} className="mb-6 p-4 bg-[#f4f0f0] rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-[#4b0f0d]">Example {index + 1}</h4>
                    <button
                      onClick={() => removeExample('blog', index)}
                      className="text-sm text-[#780817] hover:text-[#4b0f0d]"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Campaign Stage</label>
                      <select
                        value={example.stage}
                        onChange={(e) => updateExample('blog', index, 'stage', e.target.value as CampaignStage)}
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      >
                        <option value="tofu">TOFU - Awareness (e.g., "Online High School vs Traditional")</option>
                        <option value="mofu">MOFU - Consideration (e.g., "Flexible Schedules for Athletes")</option>
                        <option value="bofu">BOFU - Decision (e.g., "Admissions & Accreditation Explained")</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Blog Title/Headline *</label>
                      <input
                        type="text"
                        value={example.headline || ''}
                        onChange={(e) => updateExample('blog', index, 'headline', e.target.value)}
                        placeholder="e.g., Online High School vs Traditional: Which Works Better?"
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Blog Content/Excerpt *</label>
                      <textarea
                        value={example.copy}
                        onChange={(e) => updateExample('blog', index, 'copy', e.target.value)}
                        rows={6}
                        placeholder="Paste the full blog post or a representative excerpt here. Include the structure, tone, and key sections you want the AI to learn from."
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Call to Action Used</label>
                      <input
                        type="text"
                        value={example.cta}
                        onChange={(e) => updateExample('blog', index, 'cta', e.target.value)}
                        placeholder="e.g., Take the Fit Quiz, See Timetable & Fees, Book Consultation"
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Notes (optional)</label>
                      <textarea
                        value={example.notes || ''}
                        onChange={(e) => updateExample('blog', index, 'notes', e.target.value)}
                        rows={2}
                        placeholder="Why does this blog work well? What makes it effective for SEO or engagement?"
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-4 border-t border-[#f4f0f0]">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Blog Examples'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Landing Page Tab */}
        {activeTab === 'landing-page' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[#4b0f0d]">Landing Page Instructions & Examples</h2>

            {/* Instructions Section */}
            <div className="bg-[#f4f0f0] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#4b0f0d] mb-4">Generation Instructions</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    System Prompt for Landing Page Generation
                  </label>
                  <textarea
                    value={instructions.landingPageInstructions.systemPrompt}
                    onChange={(e) => setInstructions({
                      ...instructions,
                      landingPageInstructions: { ...instructions.landingPageInstructions, systemPrompt: e.target.value }
                    })}
                    rows={3}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="You create high-converting landing pages (US + EMEA). One clear goal per page. Mobile-first."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Page Structure & Copy Rules
                    <span className="text-xs text-[#9b9b9b] ml-2">Structure: Hero → Value → How it works → Social Proof → FAQ → Final CTA</span>
                  </label>
                  <textarea
                    value={instructions.landingPageInstructions.requirements}
                    onChange={(e) => setInstructions({
                      ...instructions,
                      landingPageInstructions: { ...instructions.landingPageInstructions, requirements: e.target.value }
                    })}
                    rows={8}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="Hero:&#10;• Headline (≤10 words) – benefit-led&#10;• Subhead – 1-sentence proof/differentiator&#10;• CTA Button – action + outcome&#10;• Chips – accreditation / grant eligibility&#10;&#10;Copy Rules:&#10;• One primary CTA repeated 2–3×&#10;• Microcopy under form: 'Takes 60 sec. No obligation.'&#10;• Form fields: Name, Email, [optional Phone/State]&#10;• Hero clarity: offer understood in 3 seconds&#10;• Readability Grade 8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Primary Value Propositions
                  </label>
                  <textarea
                    rows={2}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="What are your strongest value propositions? E.g., Study on your schedule, Expert 1-on-1 support, Global community"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Common Objections to Address
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="What concerns do prospects have? E.g., Is it accredited?, Will my teen be lonely?, How much does it cost?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Social Proof Available
                  </label>
                  <textarea
                    rows={2}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="What proof points can you use? E.g., Number of students, graduation rates, accreditation badges"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Landing Page Instructions'}
                  </button>
                </div>
              </div>
            </div>

            {/* Examples Knowledge Base */}
            <div className="bg-white rounded-lg border-2 border-[#f4f0f0] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#4b0f0d]">Landing Page Examples Knowledge Base</h3>
                  <p className="text-sm text-[#9b9b9b] mt-1">
                    Add examples of landing pages you like. AI will learn from these.
                  </p>
                </div>
                <button
                  onClick={() => addExample('landingPage')}
                  className="px-4 py-2 bg-[#780817] text-white rounded-md hover:bg-[#4b0f0d] transition-colors text-sm font-semibold"
                >
                  + Add Example
                </button>
              </div>

              {instructions.landingPageInstructions.examples.map((example, index) => (
                <div key={index} className="mb-6 p-4 bg-[#f4f0f0] rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-[#4b0f0d]">Example {index + 1}</h4>
                    <button
                      onClick={() => removeExample('landingPage', index)}
                      className="text-sm text-[#780817] hover:text-[#4b0f0d]"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Campaign Stage / Template Type</label>
                      <select
                        value={example.stage}
                        onChange={(e) => updateExample('landingPage', index, 'stage', e.target.value as CampaignStage)}
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      >
                        <option value="tofu">TOFU – quiz/lead magnet</option>
                        <option value="mofu">MOFU – program overview / comparison</option>
                        <option value="bofu">BOFU – admissions/apply</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Page Headline *</label>
                      <input
                        type="text"
                        value={example.headline || ''}
                        onChange={(e) => updateExample('landingPage', index, 'headline', e.target.value)}
                        placeholder="e.g., Flexible Online High School, Real Teachers"
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Landing Page Copy *</label>
                      <textarea
                        value={example.copy}
                        onChange={(e) => updateExample('landingPage', index, 'copy', e.target.value)}
                        rows={8}
                        placeholder="Paste the full landing page copy here. Include hero section, value propositions, social proof, and FAQ sections. The AI will learn from the structure and tone."
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Primary CTA Used</label>
                      <input
                        type="text"
                        value={example.cta}
                        onChange={(e) => updateExample('landingPage', index, 'cta', e.target.value)}
                        placeholder="e.g., Book a Free Consultation, Start Application"
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Notes (optional)</label>
                      <textarea
                        value={example.notes || ''}
                        onChange={(e) => updateExample('landingPage', index, 'notes', e.target.value)}
                        rows={2}
                        placeholder="Why does this landing page work well? What's the conversion rate? What makes it effective?"
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-4 border-t border-[#f4f0f0]">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Landing Page Examples'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[#4b0f0d]">Email Marketing Instructions & Examples</h2>

            <p className="text-sm text-[#9b9b9b]">
              Configure instructions for three email types: Invitation, Nurturing Drip, and Email Blast.
              Each type has different requirements and best practices.
            </p>

            {/* Shared Email Rules */}
            <div className="bg-[#f4f0f0] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#4b0f0d] mb-4">Shared Email Rules</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    General Email Requirements
                    <span className="text-xs text-[#9b9b9b] ml-2">Applied to all email types</span>
                  </label>
                  <textarea
                    rows={5}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="• One CTA only&#10;• Send Tue–Thu 10:00–14:00 local&#10;• [PLACEHOLDER] for unknown facts&#10;• Personalization (+50% opens)&#10;• Single CTA (+371% clicks)&#10;• Mobile-optimized (60%+ open on mobile)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Personalization Tokens Available
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                    placeholder="e.g., First name, Parent name, Student name, Location, Program interest"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Shared Rules'}
                  </button>
                </div>
              </div>
            </div>

            {/* Invitation Emails */}
            <div className="bg-white rounded-lg border-2 border-[#f4f0f0] p-6">
              <h3 className="text-lg font-semibold text-[#4b0f0d] mb-2">Invitation Emails</h3>
              <p className="text-sm text-[#9b9b9b] mb-4">For event invitations, webinars, consultations</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Invitation Email Template Requirements
                  </label>
                  <textarea
                    value={instructions.emailInstructions.invitation.systemPrompt}
                    onChange={(e) => setInstructions({
                      ...instructions,
                      emailInstructions: {
                        ...instructions.emailInstructions,
                        invitation: { ...instructions.emailInstructions.invitation, systemPrompt: e.target.value }
                      }
                    })}
                    rows={5}
                    className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="• Subject: 6–10 words + personalization&#10;• Preview: 40–55 chars&#10;• Body: 110–150 words&#10;• List 3 benefits&#10;• 1 CTA&#10;• P.S. optional"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Invitation Instructions'}
                </button>
              </div>
            </div>

            {/* Nurturing Drip Emails */}
            <div className="bg-white rounded-lg border-2 border-[#f4f0f0] p-6">
              <h3 className="text-lg font-semibold text-[#4b0f0d] mb-2">Nurturing Drip Emails</h3>
              <p className="text-sm text-[#9b9b9b] mb-4">For automated sequences, educational content, relationship building</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Nurture Email Template Requirements
                  </label>
                  <textarea
                    value={instructions.emailInstructions.nurturingDrip.systemPrompt}
                    onChange={(e) => setInstructions({
                      ...instructions,
                      emailInstructions: {
                        ...instructions.emailInstructions,
                        nurturingDrip: { ...instructions.emailInstructions.nurturingDrip, systemPrompt: e.target.value }
                      }
                    })}
                    rows={5}
                    className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="• Word count: 140–200&#10;• Problem–solution structure&#10;• Social proof quote&#10;• Single soft CTA&#10;• Educational tone&#10;• Build trust, not hard sell"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Nurture Instructions'}
                </button>
              </div>
            </div>

            {/* Email Blast */}
            <div className="bg-white rounded-lg border-2 border-[#f4f0f0] p-6">
              <h3 className="text-lg font-semibold text-[#4b0f0d] mb-2">Email Blasts</h3>
              <p className="text-sm text-[#9b9b9b] mb-4">For announcements, news, time-sensitive offers</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Blast Email Template Requirements
                  </label>
                  <textarea
                    value={instructions.emailInstructions.emailBlast.systemPrompt}
                    onChange={(e) => setInstructions({
                      ...instructions,
                      emailInstructions: {
                        ...instructions.emailInstructions,
                        emailBlast: { ...instructions.emailInstructions.emailBlast, systemPrompt: e.target.value }
                      }
                    })}
                    rows={5}
                    className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="• Lead with news&#10;• Deadline if real (no fake urgency)&#10;• One CTA&#10;• Word count: 110–160&#10;• Clear value proposition&#10;• Time-sensitive language if applicable"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Blast Instructions'}
                </button>
              </div>
            </div>

            {/* Email Examples - Unified across all types */}
            <div className="bg-white rounded-lg border-2 border-[#f4f0f0] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#4b0f0d]">Email Examples Knowledge Base</h3>
                  <p className="text-sm text-[#9b9b9b] mt-1">
                    Add examples of emails you like across all types. AI will learn from these.
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Add to invitation examples for now
                    if (!instructions) return;
                    const newExample: CampaignExample = {
                      stage: 'mofu',
                      type: 'email',
                      headline: '',
                      copy: '',
                      cta: '',
                      notes: ''
                    };
                    setInstructions({
                      ...instructions,
                      emailInstructions: {
                        ...instructions.emailInstructions,
                        invitation: {
                          ...instructions.emailInstructions.invitation,
                          examples: [...instructions.emailInstructions.invitation.examples, newExample]
                        }
                      }
                    });
                  }}
                  className="px-4 py-2 bg-[#780817] text-white rounded-md hover:bg-[#4b0f0d] transition-colors text-sm font-semibold"
                >
                  + Add Example
                </button>
              </div>

              {instructions.emailInstructions.invitation.examples.map((example, index) => (
                <div key={index} className="mb-6 p-4 bg-[#f4f0f0] rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-[#4b0f0d]">Example {index + 1}</h4>
                    <button
                      onClick={() => {
                        if (!instructions) return;
                        const updatedExamples = instructions.emailInstructions.invitation.examples.filter((_, i) => i !== index);
                        setInstructions({
                          ...instructions,
                          emailInstructions: {
                            ...instructions.emailInstructions,
                            invitation: {
                              ...instructions.emailInstructions.invitation,
                              examples: updatedExamples
                            }
                          }
                        });
                      }}
                      className="text-sm text-[#780817] hover:text-[#4b0f0d]"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Email Type</label>
                      <select
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      >
                        <option value="invitation">Invitation (event, webinar, consultation)</option>
                        <option value="nurture">Nurturing Drip (educational, relationship-building)</option>
                        <option value="blast">Email Blast (news, announcements)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Subject Line *</label>
                      <input
                        type="text"
                        value={example.headline || ''}
                        onChange={(e) => {
                          const updatedExamples = [...instructions.emailInstructions.invitation.examples];
                          updatedExamples[index] = { ...updatedExamples[index], headline: e.target.value };
                          setInstructions({
                            ...instructions,
                            emailInstructions: {
                              ...instructions.emailInstructions,
                              invitation: {
                                ...instructions.emailInstructions.invitation,
                                examples: updatedExamples
                              }
                            }
                          });
                        }}
                        placeholder="e.g., [First Name], Ready to Transform Your Teen's Education?"
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Email Body *</label>
                      <textarea
                        value={example.copy}
                        onChange={(e) => {
                          const updatedExamples = [...instructions.emailInstructions.invitation.examples];
                          updatedExamples[index] = { ...updatedExamples[index], copy: e.target.value };
                          setInstructions({
                            ...instructions,
                            emailInstructions: {
                              ...instructions.emailInstructions,
                              invitation: {
                                ...instructions.emailInstructions.invitation,
                                examples: updatedExamples
                              }
                            }
                          });
                        }}
                        rows={6}
                        placeholder="Paste the full email body here, including preview text, greeting, body copy, and sign-off. The AI will learn from the tone and structure."
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Call to Action Used</label>
                      <input
                        type="text"
                        value={example.cta}
                        onChange={(e) => {
                          const updatedExamples = [...instructions.emailInstructions.invitation.examples];
                          updatedExamples[index] = { ...updatedExamples[index], cta: e.target.value };
                          setInstructions({
                            ...instructions,
                            emailInstructions: {
                              ...instructions.emailInstructions,
                              invitation: {
                                ...instructions.emailInstructions.invitation,
                                examples: updatedExamples
                              }
                            }
                          });
                        }}
                        placeholder="e.g., Reserve Your Spot, Download the Guide, Schedule a Call"
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#9b9b9b] mb-1">Notes (optional)</label>
                      <textarea
                        value={example.notes || ''}
                        onChange={(e) => {
                          const updatedExamples = [...instructions.emailInstructions.invitation.examples];
                          updatedExamples[index] = { ...updatedExamples[index], notes: e.target.value };
                          setInstructions({
                            ...instructions,
                            emailInstructions: {
                              ...instructions.emailInstructions,
                              invitation: {
                                ...instructions.emailInstructions.invitation,
                                examples: updatedExamples
                              }
                            }
                          });
                        }}
                        rows={2}
                        placeholder="Why does this email work well? What was the open rate? Click rate?"
                        className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-4 border-t border-[#f4f0f0]">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Email Examples'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Global Success Message */}
      {successMessage && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-600 font-medium">{successMessage}</div>
        </div>
      )}
    </div>
  );
};

export default BrandInstructionsEditor;
