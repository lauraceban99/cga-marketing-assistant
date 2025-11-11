import React, { useState, useEffect } from 'react';
import type {
  Brand,
  BrandInstructions,
  PersonaDefinition,
  CampaignExample,
  TaskType,
  CampaignStage,
  Market,
  Platform
} from '../../types';
import { getBrandInstructions, saveBrandInstructions } from '../../services/instructionsService';
import { updatePatternKnowledge } from '../../services/patternKnowledgeService';
import LoadingSpinner from '../LoadingSpinner';
import ExamplesKnowledgeBase from './examples/ExamplesKnowledgeBase';
import LandingPageExamplesKnowledgeBase from './examples/LandingPageExamplesKnowledgeBase';
import UnifiedExamplesKnowledgeBase from './examples/UnifiedExamplesKnowledgeBase';
import PatternKnowledgeViewer from './PatternKnowledgeViewer';
import AddExamplesButton from './AddExamplesButton';

interface BrandInstructionsEditorProps {
  brand: Brand;
  onBack: () => void;
}

const BrandInstructionsEditor: React.FC<BrandInstructionsEditorProps> = ({ brand, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instructions, setInstructions] = useState<BrandInstructions | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'ad-copy' | 'blog' | 'landing-page' | 'email' | 'ai-learning'>('general');
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

      // Auto-extract patterns from examples
      console.log('🤖 Extracting patterns from examples...');
      await extractPatternsFromExamples();

      setSuccessMessage('Instructions saved and patterns extracted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving instructions:', error);
      alert('Error saving instructions');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Extract patterns from examples after saving
   * Groups examples by market + platform + type and calls pattern extraction
   */
  const extractPatternsFromExamples = async () => {
    if (!instructions) return;

    // Collect all examples from all content types
    const allExamples: CampaignExample[] = [
      ...instructions.adCopyInstructions.examples,
      ...instructions.blogInstructions.examples,
      ...instructions.landingPageInstructions.examples,
      ...instructions.emailInstructions.invitation.examples,
      ...instructions.emailInstructions.nurturingDrip.examples,
      ...instructions.emailInstructions.emailBlast.examples,
    ];

    // Group examples by market + platform + type
    const groupedExamples = new Map<string, { market: Market; platform: Platform; type: TaskType; examples: CampaignExample[] }>();

    allExamples.forEach((example) => {
      // Only process examples that have market and platform specified
      if (example.market && example.platform) {
        const key = `${example.market}-${example.platform}-${example.type}`;

        if (!groupedExamples.has(key)) {
          groupedExamples.set(key, {
            market: example.market,
            platform: example.platform,
            type: example.type,
            examples: [],
          });
        }

        groupedExamples.get(key)!.examples.push(example);
      }
    });

    // Extract patterns for each group
    const extractionPromises = Array.from(groupedExamples.values()).map(async (group) => {
      if (group.examples.length > 0) {
        console.log(`📊 Extracting patterns for ${group.market} + ${group.platform} + ${group.type} (${group.examples.length} examples)`);
        try {
          await updatePatternKnowledge(
            brand.id,
            group.market,
            group.platform,
            group.type,
            group.examples,
            '' // Manual learnings are stored in the example whatWorks field
          );
          console.log(`✅ Patterns extracted for ${group.market} + ${group.platform} + ${group.type}`);
        } catch (error) {
          console.error(`❌ Failed to extract patterns for ${group.market} + ${group.platform} + ${group.type}:`, error);
        }
      }
    });

    await Promise.all(extractionPromises);
    console.log('✅ Pattern extraction complete');
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

  const addExample = (
    type: 'adCopy' | 'blog' | 'landingPage',
    stage?: CampaignStage,
    market?: Market
  ) => {
    if (!instructions) return;
    const newExample: CampaignExample = {
      stage: stage || 'mofu', // Default stage if not provided
      type: type === 'adCopy' ? 'ad-copy' : type === 'blog' ? 'blog' : 'landing-page',
      headline: '',
      copy: '',
      cta: '',
      notes: '',
      ...(market && { market }) // Add market if provided (for landing pages)
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
          { id: 'email', label: 'Emails' },
          { id: 'ai-learning', label: '🧠 AI Learning' }
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
            <ExamplesKnowledgeBase
              title="Ad Copy Examples Knowledge Base"
              description="Add examples AI will learn from"
              examples={instructions.adCopyInstructions.examples}
              onAddExample={(stage) => addExample('adCopy', stage)}
              onUpdateExample={(index, field, value) => updateExample('adCopy', index, field, value)}
              onDeleteExample={(index) => removeExample('adCopy', index)}
              onSave={handleSave}
            />
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
            <UnifiedExamplesKnowledgeBase
              title="Blog Examples Knowledge Base"
              description="Add examples AI will learn from. Stage categorization removed - blogs are organized by topic and quality, not funnel stage."
              examples={instructions.blogInstructions.examples}
              onAddExample={() => addExample('blog')}
              onUpdateExample={(index, field, value) => updateExample('blog', index, field, value)}
              onDeleteExample={(index) => removeExample('blog', index)}
              onSave={handleSave}
            />
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

            {/* Quick Setup: Add Example Button */}
            <AddExamplesButton
              brandId={brand.id}
              onComplete={loadInstructions}
            />

            {/* Examples Knowledge Base - Organized by Market */}
            <LandingPageExamplesKnowledgeBase
              title="Landing Page Examples Knowledge Base"
              description="Add examples organized by market. AI will learn market-specific patterns."
              examples={instructions.landingPageInstructions.examples}
              onAddExample={(market) => addExample('landingPage', 'mofu', market)}
              onUpdateExample={(index, field, value) => updateExample('landingPage', index, field, value)}
              onDeleteExample={(index) => removeExample('landingPage', index)}
              onSave={handleSave}
            />
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
                    Content Requirements
                    <span className="text-xs text-[#9b9b9b] ml-2">Applied to all email types</span>
                  </label>
                  <textarea
                    rows={6}
                    className="w-full bg-white border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="• One CTA only (+371% click improvement)&#10;• Personalization tokens required (+50% open rate)&#10;• Mobile-optimized (60%+ opens on mobile)&#10;• Use [PLACEHOLDER] for unknown information&#10;• Power words: exclusive, limited, you, free, new&#10;• Subject line emojis (test for audience)&#10;• Clear value proposition&#10;• Conversational tone"
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
              <p className="text-sm text-[#9b9b9b] mb-4">For events, webinars, consultations</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Psychology & Structure
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
                    rows={8}
                    className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="Psychology:&#10;• Create exclusivity (limited seating, you're invited)&#10;• Make it personal (address by name, reference interests)&#10;• Remove friction (easy RSVP, calendar link, clear logistics)&#10;• Social proof (testimonials, past success)&#10;&#10;Required Elements:&#10;• Clear event details (date, time, format)&#10;• What attendees will learn/gain&#10;• Easy registration CTA&#10;• Optional: Can't attend alternative"
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
              <p className="text-sm text-[#9b9b9b] mb-4">For automated sequences, education, relationship building</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#4b0f0d] mb-2">
                    Psychology & Structure
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
                    rows={8}
                    className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="Psychology:&#10;• Provide value before asking for commitment&#10;• Use AIDA model (Attention, Interest, Desire, Action)&#10;• Educational content builds trust&#10;• Progress from awareness → consideration → decision&#10;&#10;Required Elements:&#10;• One key insight or value point&#10;• Connection to previous emails (if part of sequence)&#10;• Soft CTA (educational resources, not sales)&#10;• Next step preview (optional)"
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
                    Psychology & Structure
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
                    rows={8}
                    className="w-full bg-[#f4f0f0] border border-[#9b9b9b] text-[#4b0f0d] rounded-md p-3 focus:ring-2 focus:ring-[#780817] font-mono text-sm"
                    placeholder="Psychology:&#10;• Lead with the news (don't bury the lede)&#10;• Create appropriate urgency (deadline, limited availability)&#10;• Single focus (one message per email)&#10;• Newsworthy subject lines outperform clever ones&#10;&#10;Required Elements:&#10;• Clear announcement in first paragraph&#10;• Why it matters (benefit/impact)&#10;• Strong CTA aligned with announcement&#10;• Deadline or urgency element (if applicable)"
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
                    Add examples of emails you like across all types. Organized by email type, not funnel stage.
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Add to invitation examples for now
                    if (!instructions) return;
                    const newExample: CampaignExample = {
                      stage: 'mofu', // Default stage (not used for organization)
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

        {/* AI Learning Tab */}
        {activeTab === 'ai-learning' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#4b0f0d] mb-2">AI Learning Knowledge Base</h2>
              <p className="text-[#9b9b9b]">
                The AI automatically extracts patterns from your examples. These patterns are used when generating content.
                You can view auto-extracted patterns and add your own manual insights.
              </p>
            </div>

            <PatternKnowledgeViewer brandId={brand.id} />
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
