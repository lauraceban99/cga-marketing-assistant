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
            <h2 className="text-2xl font-bold text-[#4b0f0d]">Blog Post Instructions</h2>

            <div className="bg-[#f4f0f0] rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                  Target Word Count Range
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                  placeholder="e.g., 2,000-3,000 words for comprehensive posts"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                  SEO Keywords to Target
                </label>
                <textarea
                  rows={3}
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
                  placeholder="Which pages should blog posts link to? E.g., Always link to enrollment page, program pages, testimonials"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                  Topics to Cover
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                  placeholder="What topics align with your brand? E.g., study tips, university pathways, student success stories, parent guides"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                  Topics to Avoid
                </label>
                <textarea
                  rows={2}
                  className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                  placeholder="Any sensitive topics or areas to avoid?"
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
        )}

        {/* Landing Page Tab */}
        {activeTab === 'landing-page' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[#4b0f0d]">Landing Page Instructions</h2>

            <div className="bg-[#f4f0f0] rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                  Primary Value Propositions
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                  placeholder="What are your strongest value propositions? E.g., Study on your schedule, Expert 1-on-1 support, Global community, University pathways"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                  Common Objections to Address
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                  placeholder="What concerns do prospects have? E.g., Is it accredited?, Will my teen be lonely?, How much does it cost?, Can they do sports?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                  Social Proof Available
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                  placeholder="What proof points can you use? E.g., Number of students, graduation rates, university acceptance stats, accreditation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                  Primary Conversion Goal
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                  placeholder="e.g., Book a free consultation, Schedule a tour, Apply now"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                  Form Field Preferences
                </label>
                <textarea
                  rows={2}
                  className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                  placeholder="How many form fields? E.g., Keep it simple: Name, Email, Phone. Or detailed: Add student age, current school, interests"
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
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[#4b0f0d]">Email Marketing Instructions</h2>

            <div className="bg-[#f4f0f0] rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                  Sending Schedule Preferences
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                  placeholder="e.g., Tuesday-Thursday mornings, avoid weekends"
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

              <div>
                <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                  Segmentation Criteria
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                  placeholder="How do you segment your list? E.g., By student age, interest level (cold/warm/hot), location, program type"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                  Email Sequence Types You Use
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                  placeholder="e.g., Welcome series (3 emails), Event invitations, Monthly newsletter, Re-engagement campaign"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                  Unsubscribe Philosophy
                </label>
                <textarea
                  rows={2}
                  className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817]"
                  placeholder="e.g., Make it easy, offer preferences instead of unsubscribe, include in every email"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Email Instructions'}
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
