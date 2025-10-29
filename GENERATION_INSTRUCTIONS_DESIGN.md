# Generation Instructions System - Design

## 🎯 Overview

Add customizable generation instructions to each brand, allowing the marketing team to fine-tune HOW the AI generates content (not just WHAT assets it uses).

---

## 📊 Data Structure

### **BrandInstructions Interface**

```typescript
interface BrandInstructions {
  brandId: string;

  // Copy Generation
  copySystemPrompt: string;          // How AI should behave
  copyUserPromptTemplate: string;    // Structure for ad generation
  toneRules: string;                 // Specific dos and don'ts

  // Image Generation
  imageGenerationInstructions: string;
  imageStyleGuidelines: string;

  // Metadata
  lastUpdatedBy: string;
  lastUpdated: Date;
  version: number;
}

// Default templates from n8n
const DEFAULT_COPY_SYSTEM_PROMPT = `You are a senior brand copywriter for a modern online school.
Write warm, confident, aspirational Facebook ads that speak to thoughtful parents.
Be specific and human. Show outcomes (confidence, belonging, future readiness) without hype.
No corporate jargon or 'innovative/world-class'. No exclamation marks or hashtags.
Headlines should hook emotionally (not literal), ≤ 40 characters.`;

const DEFAULT_COPY_USER_PROMPT_TEMPLATE = `CONTEXT
Brand: {{brand}}
Theme: {{theme}}
Location: {{location}}
Audience: {{audience}}

BRAND GUIDELINES (plain text extracted):
{{brandGuidelines}}

REFERENCE COPY (style cues to emulate):
{{referenceCopy}}

TONE
{{tone}}

WRITE ADS
- Produce 3 ads that feel like the examples in REFERENCE COPY but on-brand.
- Each ad must include:
  - "headline": 10-14 words, evocative, include theme or location if relevant.
  - "primaryText": 90-160 words. Start with a hook ('What if...', 'Imagine...', 'Is your child...?').
  - "cta": Clear call-to-action (3-5 words).`;

const DEFAULT_IMAGE_GENERATION_INSTRUCTIONS = `Produce exactly ten diverse text prompts suitable for image generation.

PROMPT REQUIREMENTS:
- 1:1 aspect ratio (explicitly state '--ar 1:1' at the end)
- Modern, clean composition; bold focal point; high contrast; clutter-free background
- Include brief overlay text—≤ 6 words—using or paraphrasing the ad's headline/CTA
- Vary creative angles: product-in-action, aspirational lifestyle, social-proof scene, emoji-accent, bold typography lock-up, etc.
- Incorporate brand-relevant colors from brand guidelines
- Never reference policy, Facebook, or specific AI tools; never include hashtags
- Use concise, comma-separated descriptors
- Do not use any kind of quotes in the prompt

OUTPUT: Return only valid JSON with imagePrompts array`;

const DEFAULT_TONE_RULES = `DO:
- Use warm, conversational language
- Focus on outcomes and transformation
- Be specific with examples
- Show empathy for parent concerns
- Use "you" and "your child"

DON'T:
- Use exclamation marks
- Use hashtags
- Use corporate jargon ("innovative", "world-class", "cutting-edge")
- Make unsubstantiated claims
- Use all caps or aggressive formatting`;
```

---

## 🗂️ Firestore Structure

### **Collection: `brandInstructions`**

Document ID = `brandId` (one doc per brand)

```typescript
{
  brandId: "cga",

  copySystemPrompt: "You are a senior brand copywriter...",
  copyUserPromptTemplate: "CONTEXT\nBrand: {{brand}}...",
  toneRules: "DO:\n- Use warm, conversational...",

  imageGenerationInstructions: "Produce exactly ten diverse...",
  imageStyleGuidelines: "Modern, clean, aspirational...",

  lastUpdatedBy: "l.ceban@cga.school",
  lastUpdated: Timestamp,
  version: 3
}
```

**Note:** Separate collection from `brandAssets` for clean organization and easier querying.

---

## 🎨 UI Design

### **Brand Asset Dashboard with Instructions Tab**

```
┌──────────────────────────────────────────────────────────────┐
│  CGA Asset Library                          [← Back] [Save]  │
│  12 assets • 45.2 MB • Last updated: 2 days ago             │
├──────────────────────────────────────────────────────────────┤
│  [📋 Guidelines] [🎯 Competitor Ads] [✍️ Reference]         │
│  [🏷️ Logos] [📦 Other] [🤖 Instructions] ← NEW TAB         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Generation Instructions for CGA                             │
│  Control how AI generates content for this brand             │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Copy System Prompt                                   │   │
│  │ Define the AI's persona and behavior                │   │
│  │ ─────────────────────────────────────────────────── │   │
│  │ You are a senior brand copywriter for a modern      │   │
│  │ online school.                                       │   │
│  │ Write warm, confident, aspirational Facebook ads... │   │
│  │                                                       │   │
│  │ [Expand to edit]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Copy User Prompt Template                            │   │
│  │ Structure for ad generation requests                 │   │
│  │ ─────────────────────────────────────────────────── │   │
│  │ CONTEXT                                              │   │
│  │ Brand: {{brand}}                                     │   │
│  │ Theme: {{theme}}                                     │   │
│  │ ...                                                   │   │
│  │                                                       │   │
│  │ [Expand to edit]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Image Generation Instructions                        │   │
│  │ How to create image prompts                          │   │
│  │ ─────────────────────────────────────────────────── │   │
│  │ Produce exactly ten diverse text prompts...         │   │
│  │ - 1:1 aspect ratio                                   │   │
│  │ - Modern, clean composition...                       │   │
│  │                                                       │   │
│  │ [Expand to edit]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tone & Voice Rules                                   │   │
│  │ Specific dos and don'ts                              │   │
│  │ ─────────────────────────────────────────────────── │   │
│  │ DO:                                                  │   │
│  │ - Use warm, conversational language                  │   │
│  │ - Focus on outcomes and transformation               │   │
│  │ ...                                                   │   │
│  │ DON'T:                                               │   │
│  │ - Use exclamation marks                              │   │
│  │ - Use hashtags                                       │   │
│  │ ...                                                   │   │
│  │                                                       │   │
│  │ [Expand to edit]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  [Reset to Defaults]           [Save Changes]               │
│                                                               │
│  Last updated by l.ceban@cga.school on Jan 15, 2025         │
│  Version: 3                                                  │
└──────────────────────────────────────────────────────────────┘
```

### **Expanded Edit Mode**

```
┌──────────────────────────────────────────────────────────────┐
│  Edit Copy System Prompt                        [✕ Collapse] │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │ You are a senior brand copywriter for a modern online │ │
│  │ school.                                                 │ │
│  │ Write warm, confident, aspirational Facebook ads that │ │
│  │ speak to thoughtful parents.                           │ │
│  │ Be specific and human. Show outcomes (confidence,     │ │
│  │ belonging, future readiness) without hype.            │ │
│  │ No corporate jargon or 'innovative/world-class'.      │ │
│  │ No exclamation marks or hashtags.                     │ │
│  │ Headlines should hook emotionally (not literal),      │ │
│  │ ≤ 40 characters.                                      │ │
│  │                                                         │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  💡 Tip: This defines the AI's personality. Be specific      │
│     about tone, style, and constraints.                      │
│                                                               │
│  Variables available: {{brand}}, {{theme}}, {{location}},   │
│  {{audience}}, {{brandGuidelines}}, {{referenceCopy}}       │
│                                                               │
│  [Reset to Default]                    [Save & Collapse]    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Generation Flow Integration

### **Enhanced Generation Process**

```typescript
// When user generates content:

async function generateWithInstructions(
  brand: Brand,
  taskType: TaskType,
  userInput: {
    theme: string;
    location: string;
    audience: string;
  }
): Promise<GeneratedCreative> {

  // 1. Load brand instructions
  const instructions = await getBrandInstructions(brand.id);

  // 2. Load brand assets
  const guidelines = await getAssetsByCategory(brand.id, 'brand-guidelines');
  const referenceCopy = await getAssetsByCategory(brand.id, 'reference-copy');
  const competitorAds = await getAssetsByCategory(brand.id, 'competitor-ads');

  // 3. Extract text from assets
  const guidelinesText = await extractTextFromAssets(guidelines);
  const referenceCopyText = await extractTextFromAssets(referenceCopy);

  // 4. Build prompt using template + instructions
  const systemPrompt = instructions.copySystemPrompt;

  const userPrompt = instructions.copyUserPromptTemplate
    .replace('{{brand}}', brand.name)
    .replace('{{theme}}', userInput.theme)
    .replace('{{location}}', userInput.location)
    .replace('{{audience}}', userInput.audience)
    .replace('{{brandGuidelines}}', guidelinesText)
    .replace('{{referenceCopy}}', referenceCopyText)
    .replace('{{tone}}', instructions.toneRules);

  // 5. Generate with Gemini
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
    contents: userPrompt,
  });

  // 6. If generating images, use image instructions
  if (taskType === 'ad') {
    const imagePrompts = await generateImagePrompts(
      result.text,
      instructions.imageGenerationInstructions,
      brand
    );
    const images = await generateImages(imagePrompts);

    return {
      text: result.text,
      images,
      metadata: {
        usedAssets: {
          guidelines: guidelines.length,
          referenceCopy: referenceCopy.length,
          competitorAds: competitorAds.length,
        },
        instructions: 'Custom brand instructions applied',
      },
    };
  }

  return {
    text: result.text,
    images: [],
  };
}
```

### **UI Shows What Was Used**

```tsx
<div className="mb-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
  <h4 className="text-sm font-semibold text-white mb-2">
    Generation Context
  </h4>
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-sm">
      <span className="text-green-400">✓</span>
      <span className="text-gray-300">
        Custom instructions for {brand.name}
      </span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <span className="text-green-400">✓</span>
      <span className="text-gray-300">
        2 brand guideline documents
      </span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <span className="text-green-400">✓</span>
      <span className="text-gray-300">
        3 reference copy examples
      </span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <span className="text-green-400">✓</span>
      <span className="text-gray-300">
        5 competitor ad examples
      </span>
    </div>
  </div>
  <button className="text-xs text-brand-primary hover:underline mt-2">
    View all assets used →
  </button>
</div>
```

---

## 🛠️ Service Functions

### **instructionsService.ts**

```typescript
// Get instructions for a brand
async function getBrandInstructions(
  brandId: string
): Promise<BrandInstructions | null>

// Save/update instructions
async function saveBrandInstructions(
  brandId: string,
  instructions: Partial<BrandInstructions>
): Promise<void>

// Reset to defaults
async function resetToDefaultInstructions(
  brandId: string
): Promise<BrandInstructions>

// Get default templates
function getDefaultInstructions(): BrandInstructions

// Validate instructions (check for required fields, valid syntax)
function validateInstructions(
  instructions: Partial<BrandInstructions>
): { valid: boolean; errors: string[] }

// Replace template variables
function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string
```

---

## 📦 Component Structure

### **New Components**

```
components/dam/
├── instructions/
│   ├── InstructionsTab.tsx           # Main instructions tab
│   ├── InstructionSection.tsx        # Collapsible section for each prompt
│   ├── InstructionEditor.tsx         # Textarea with syntax highlighting
│   ├── TemplateVariableHelper.tsx    # Show available {{variables}}
│   └── InstructionPreview.tsx        # Preview compiled prompt
```

### **InstructionsTab Component**

```tsx
interface InstructionsTabProps {
  brandId: string;
  brandName: string;
}

const InstructionsTab: React.FC<InstructionsTabProps> = ({ brandId, brandName }) => {
  const { instructions, loading, error, save, reset } = useBrandInstructions(brandId);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Generation Instructions</h3>
          <p className="text-sm text-gray-400">
            Control how AI generates content for {brandName}
          </p>
        </div>
        {hasChanges && (
          <button onClick={save} className="bg-brand-primary px-4 py-2 rounded">
            Save Changes
          </button>
        )}
      </div>

      <InstructionSection
        title="Copy System Prompt"
        description="Define the AI's persona and behavior"
        value={instructions?.copySystemPrompt}
        isEditing={editingSection === 'copySystemPrompt'}
        onToggleEdit={() => setEditingSection(editingSection === 'copySystemPrompt' ? null : 'copySystemPrompt')}
        onChange={(value) => {
          // Update instructions
          setHasChanges(true);
        }}
      />

      <InstructionSection
        title="Copy User Prompt Template"
        description="Structure for ad generation requests"
        value={instructions?.copyUserPromptTemplate}
        isEditing={editingSection === 'copyUserPromptTemplate'}
        onToggleEdit={() => setEditingSection(editingSection === 'copyUserPromptTemplate' ? null : 'copyUserPromptTemplate')}
        onChange={(value) => {
          // Update instructions
          setHasChanges(true);
        }}
        showVariables
      />

      {/* More sections... */}

      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <button
          onClick={reset}
          className="text-sm text-gray-400 hover:text-white"
        >
          Reset to Defaults
        </button>
        <div className="text-xs text-gray-500">
          Last updated by {instructions?.lastUpdatedBy} • Version {instructions?.version}
        </div>
      </div>
    </div>
  );
};
```

---

## 🔍 Template Variables

### **Available Variables**

For use in prompt templates:

```typescript
const TEMPLATE_VARIABLES = {
  // User input
  '{{brand}}': 'Brand name (e.g., "CGA")',
  '{{theme}}': 'Campaign theme (e.g., "Open Day")',
  '{{location}}': 'Target location (e.g., "Auckland")',
  '{{audience}}': 'Target audience (e.g., "parents of 12-18 year olds")',

  // Auto-loaded from assets
  '{{brandGuidelines}}': 'Extracted text from brand guideline PDFs',
  '{{referenceCopy}}': 'Extracted text from reference copy examples',
  '{{competitorAds}}': 'Descriptions of competitor ad examples',
  '{{logos}}': 'List of available logo files',

  // Brand data
  '{{brandColors}}': 'Brand color palette from guidelines',
  '{{brandFonts}}': 'Brand typography from guidelines',
  '{{brandVoice}}': 'Brand tone of voice from guidelines',
};
```

### **Variable Helper UI**

```
┌──────────────────────────────────────────────────┐
│  Available Variables                             │
│  Click to insert into prompt                     │
├──────────────────────────────────────────────────┤
│  {{brand}}          Brand name                   │
│  {{theme}}          Campaign theme               │
│  {{location}}       Target location              │
│  {{audience}}       Target audience              │
│  {{brandGuidelines}} Brand guideline text        │
│  {{referenceCopy}}  Reference copy examples      │
└──────────────────────────────────────────────────┘
```

---

## 💾 Default Instructions

All brands start with these defaults (from your n8n workflow):

```typescript
const DEFAULT_INSTRUCTIONS: BrandInstructions = {
  brandId: '',

  copySystemPrompt: `You are a senior brand copywriter for a modern online school.
Write warm, confident, aspirational Facebook ads that speak to thoughtful parents.
Be specific and human. Show outcomes (confidence, belonging, future readiness) without hype.
No corporate jargon or 'innovative/world-class'. No exclamation marks or hashtags.
Headlines should hook emotionally (not literal), ≤ 40 characters.`,

  copyUserPromptTemplate: `CONTEXT
Brand: {{brand}}
Theme: {{theme}}
Location: {{location}}
Audience: {{audience}}

BRAND GUIDELINES (plain text extracted):
{{brandGuidelines}}

REFERENCE COPY (style cues to emulate):
{{referenceCopy}}

TONE
{{tone}}

WRITE ADS
- Produce 3 ads that feel like the examples in REFERENCE COPY but on-brand.
- Each ad must include:
  - "headline": 10-14 words, evocative, include theme or location if relevant.
  - "primaryText": 90-160 words. Start with a hook ('What if...', 'Imagine...', 'Is your child...?').
  - "cta": Clear call-to-action (3-5 words).`,

  toneRules: `DO:
- Use warm, conversational language
- Focus on outcomes and transformation
- Be specific with examples
- Show empathy for parent concerns
- Use "you" and "your child"

DON'T:
- Use exclamation marks
- Use hashtags
- Use corporate jargon ("innovative", "world-class", "cutting-edge")
- Make unsubstantiated claims
- Use all caps or aggressive formatting`,

  imageGenerationInstructions: `Produce exactly ten diverse text prompts suitable for image generation.

PROMPT REQUIREMENTS:
- 1:1 aspect ratio (explicitly state '--ar 1:1' at the end)
- Modern, clean composition; bold focal point; high contrast; clutter-free background
- Include brief overlay text—≤ 6 words—using or paraphrasing the ad's headline/CTA
- Vary creative angles: product-in-action, aspirational lifestyle, social-proof scene, emoji-accent, bold typography lock-up, etc.
- Incorporate brand-relevant colors from brand guidelines
- Never reference policy, Facebook, or specific AI tools; never include hashtags
- Use concise, comma-separated descriptors
- Do not use any kind of quotes in the prompt

OUTPUT: Return only valid JSON with imagePrompts array`,

  imageStyleGuidelines: `Modern, clean, aspirational imagery. Focus on students engaged, confident, and connected. Use brand colors. High contrast, clutter-free backgrounds.`,

  lastUpdatedBy: 'system',
  lastUpdated: new Date(),
  version: 1,
};
```

---

## 🎯 Benefits

### **For Marketing Team:**
- 🎛️ **Fine-tune AI behavior** without touching code
- 📝 **Test different prompt styles** to improve output
- 🔄 **Iterate on instructions** based on results
- 📊 **Track what works** with version history

### **For Content Quality:**
- 🎯 **More consistent output** across generations
- ✍️ **Better matches brand voice** with custom prompts
- 🖼️ **Better image generation** with specific instructions
- 📈 **Improves over time** as team refines prompts

### **For Workflow:**
- ⚡ **Faster generation** with optimized prompts
- 🔁 **Less manual editing** needed
- 🎨 **More on-brand** output from the start
- 💰 **Saves time** = saves money

---

## ✅ Summary

### **What Gets Added:**

1. **New Firestore Collection:** `brandInstructions`
2. **New Tab in Asset Manager:** "🤖 Instructions"
3. **4 Editable Sections:**
   - Copy System Prompt
   - Copy User Prompt Template
   - Image Generation Instructions
   - Tone & Voice Rules
4. **Template Variable System:** {{brand}}, {{theme}}, etc.
5. **Default Templates:** Pre-populated from your n8n workflow
6. **Version Tracking:** See who changed what and when
7. **Integration:** Auto-loads during generation

### **User Experience:**

1. Marketing manager opens CGA in Asset Manager
2. Clicks "🤖 Instructions" tab
3. Sees current prompts (defaults or customized)
4. Clicks "Expand to edit" on any section
5. Modifies prompt (e.g., "Add more urgency to CTAs")
6. Clicks "Save Changes"
7. Next generation uses updated instructions
8. Tracks version history

---

**Ready to implement full DAM + Instructions system! 🚀**

Proceeding with implementation now...
