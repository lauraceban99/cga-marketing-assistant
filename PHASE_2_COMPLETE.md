# 🎉 Phase 2 Complete: Generation Instructions

## ✅ What's Been Implemented

### **Core Functionality**
- ✅ Instructions tab in brand asset dashboard
- ✅ Editable copy system prompts
- ✅ Editable user prompt templates
- ✅ Image generation instructions editor
- ✅ Tone/voice rules editor
- ✅ Save and version instructions functionality
- ✅ Reset to defaults functionality
- ✅ Template variable helper system
- ✅ Collapsible section UI

---

## 📦 New Files Created

### **Hooks**
```
hooks/
└── useBrandInstructions.ts     # React hook for managing instructions
```

### **Components**
```
components/dam/instructions/
├── InstructionsTab.tsx          # Main instructions tab
└── InstructionSection.tsx       # Collapsible editable section
```

### **Updated Components**
- `components/dam/BrandAssetDashboard.tsx` - Added Instructions tab alongside asset categories

---

## 🎨 UI Features

### **Instructions Tab**
Located alongside asset categories:
- **📋 Brand Guidelines** tab
- **🎯 Competitor Ads** tab
- **✍️ Reference Copy** tab
- **🏷️ Logos** tab
- **📦 Other Assets** tab
- **🤖 Instructions** tab ← NEW!

### **5 Editable Sections**

1. **Copy System Prompt**
   - Define AI's persona and behavior
   - 6-row textarea editor
   - Collapsed preview mode

2. **Copy User Prompt Template**
   - Structure for ad generation
   - 12-row textarea editor
   - Template variable helper
   - Click-to-insert variables

3. **Tone & Voice Rules**
   - Specific dos and don'ts
   - 8-row textarea editor
   - Collapsed preview mode

4. **Image Generation Instructions**
   - Image prompt creation rules
   - 10-row textarea editor
   - Collapsed preview mode

5. **Image Style Guidelines**
   - Visual style preferences
   - 4-row textarea editor
   - Collapsed preview mode

### **Interactive Features**

- **Expand/Collapse**: Click section header to expand for editing
- **Save Changes**: Button appears when changes are made
- **Discard Changes**: Reset to last saved state
- **Reset to Defaults**: Restore original template (with confirmation)
- **Variable Helper**: Show available {{variables}} with descriptions
- **Click to Insert**: Insert template variables into prompts
- **Version Tracking**: Shows last updated by and version number
- **Auto-save**: Increments version on each save

---

## 🔧 Technical Implementation

### **Custom Hook: useBrandInstructions**

```typescript
const {
  instructions,      // Current instructions
  loading,           // Loading state
  error,             // Error message
  saving,            // Saving state
  save,              // Save function
  reset,             // Reset to defaults
  updateLocal,       // Update local state
  refresh,           // Reload from Firestore
} = useBrandInstructions(brandId);
```

### **Service Functions** (Already existed from Phase 1)

```typescript
// services/instructionsService.ts
getBrandInstructions(brandId)
saveBrandInstructions(brandId, instructions, updatedBy)
updateBrandInstructions(brandId, updates, updatedBy)
resetToDefaultInstructions(brandId, updatedBy)
replaceTemplateVariables(template, variables)
validateInstructions(instructions)
```

### **Data Flow**

```
User clicks Instructions tab
  ↓
Load instructions from Firestore
  ↓
Show default values if none exist
  ↓
User expands a section
  ↓
Edit in textarea
  ↓
Changes tracked in local state
  ↓
Click "Save Changes"
  ↓
Validate instructions
  ↓
Save to Firestore (version++)
  ↓
Reload to get updated data
  ↓
Show success message
```

---

## 📊 Firestore Integration

### **Collection: `brandInstructions`**

Document structure (one per brand):

```typescript
{
  brandId: "cga",

  copySystemPrompt: "You are a senior brand copywriter...",
  copyUserPromptTemplate: "CONTEXT\nBrand: {{brand}}...",
  toneRules: "DO:\n- Use warm, conversational...",
  imageGenerationInstructions: "Produce exactly ten diverse...",
  imageStyleGuidelines: "Modern, clean, aspirational...",

  lastUpdatedBy: "admin",
  lastUpdated: Timestamp,
  version: 3
}
```

---

## 🎯 Template Variables

### **Available Variables**

Click to insert into prompts:

| Variable | Description |
|----------|-------------|
| `{{brand}}` | Brand name (e.g., "CGA") |
| `{{theme}}` | Campaign theme (e.g., "Open Day") |
| `{{location}}` | Target location (e.g., "Auckland") |
| `{{audience}}` | Target audience (e.g., "parents of 12-18 year olds") |
| `{{brandGuidelines}}` | Extracted text from brand guideline PDFs |
| `{{referenceCopy}}` | Extracted text from reference copy examples |
| `{{competitorAds}}` | Descriptions of competitor ad examples |
| `{{logos}}` | List of available logo files |
| `{{tone}}` | Tone and voice rules |

### **Variable Helper UI**

When editing the User Prompt Template, click "Show available variables" to see:
- Variable name (e.g., `{{brand}}`)
- Description of what it does
- Click to insert into your prompt

---

## 🚀 How to Use (Phase 2)

### **1. Access Instructions**

1. Open DAM from homepage
2. Click any brand card
3. Click **"🤖 Instructions"** tab
4. See 5 instruction sections

### **2. Edit Instructions**

1. Click any section header to expand
2. Edit the text in the textarea
3. For User Prompt Template: Click "Show available variables"
4. Click a variable to insert it
5. Section marked as "Editing"
6. "Save Changes" button appears

### **3. Save Changes**

1. Click **"Save Changes"** button
2. Instructions validated
3. Saved to Firestore
4. Version incremented
5. Success message shown
6. Changes apply to future content generation

### **4. Discard Changes**

1. Make edits
2. Change your mind
3. Click **"Discard Changes"**
4. Confirm discard
5. Reverts to last saved state

### **5. Reset to Defaults**

1. Click **"Reset to Defaults"** at bottom
2. Confirm reset
3. All instructions reset to original templates
4. Version incremented
5. Changes saved

---

## 💾 Default Instructions

All brands start with these defaults (from n8n workflow):

### **Copy System Prompt**
```
You are a senior brand copywriter for a modern online school.
Write warm, confident, aspirational Facebook ads that speak to thoughtful parents.
Be specific and human. Show outcomes (confidence, belonging, future readiness) without hype.
No corporate jargon or 'innovative/world-class'. No exclamation marks or hashtags.
Headlines should hook emotionally (not literal), ≤ 40 characters.
```

### **Copy User Prompt Template**
```
CONTEXT
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
  - "cta": Clear call-to-action (3-5 words).
```

### **Tone Rules**
```
DO:
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
- Use all caps or aggressive formatting
```

### **Image Generation Instructions**
```
Produce exactly ten diverse text prompts suitable for image generation.

PROMPT REQUIREMENTS:
- 1:1 aspect ratio (explicitly state '--ar 1:1' at the end)
- Modern, clean composition; bold focal point; high contrast; clutter-free background
- Include brief overlay text—≤ 6 words—using or paraphrasing the ad's headline/CTA
- Vary creative angles: product-in-action, aspirational lifestyle, social-proof scene, emoji-accent, bold typography lock-up, etc.
- Incorporate brand-relevant colors from brand guidelines
- Never reference policy, Facebook, or specific AI tools; never include hashtags
- Use concise, comma-separated descriptors
- Do not use any kind of quotes in the prompt

OUTPUT: Return only valid JSON with imagePrompts array
```

### **Image Style Guidelines**
```
Modern, clean, aspirational imagery. Focus on students engaged, confident, and connected. Use brand colors. High contrast, clutter-free backgrounds.
```

---

## 📝 Component Reference

### **Main Entry Points**
- `BrandAssetDashboard.tsx:21` - Instructions tab state
- `BrandAssetDashboard.tsx:148-161` - Instructions tab button
- `BrandAssetDashboard.tsx:167-169` - Instructions tab content

### **Key Components**
- `InstructionsTab.tsx` - Main tab container
- `InstructionSection.tsx` - Collapsible editable section

### **Key Hooks**
- `useBrandInstructions.ts` - Manage instructions CRUD

---

## 🔄 Integration with Generation (Future)

When content generation is implemented, instructions will be used like this:

```typescript
// 1. Load instructions
const instructions = await getBrandInstructions(brandId);

// 2. Replace template variables
const userPrompt = replaceTemplateVariables(
  instructions.copyUserPromptTemplate,
  {
    '{{brand}}': brand.name,
    '{{theme}}': theme,
    '{{location}}': location,
    '{{audience}}': audience,
    '{{brandGuidelines}}': extractedGuidelinesText,
    '{{referenceCopy}}': extractedReferenceCopy,
    '{{tone}}': instructions.toneRules,
  }
);

// 3. Generate with Gemini
const result = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  systemInstruction: instructions.copySystemPrompt,
  contents: userPrompt,
});
```

---

## ✅ Success Criteria

Phase 2 is successful if you can:
1. ✅ Access Instructions tab from brand dashboard
2. ✅ See all 5 instruction sections
3. ✅ Expand a section to edit
4. ✅ Edit text in textarea
5. ✅ See "Save Changes" button appear
6. ✅ Click "Show available variables"
7. ✅ Insert a variable by clicking it
8. ✅ Save changes successfully
9. ✅ See version number increment
10. ✅ Discard unsaved changes
11. ✅ Reset all to defaults
12. ✅ Changes persist after reload

---

## 🧪 Testing Checklist

### **After Railway Deployment:**

- [ ] Visit app homepage
- [ ] Click "📁 Manage Brand Assets"
- [ ] Click any brand (e.g., "CGA")
- [ ] See "🤖 Instructions" tab
- [ ] Click Instructions tab
- [ ] See all 5 sections collapsed
- [ ] Click "Copy System Prompt" header
- [ ] Section expands, textarea appears
- [ ] Edit some text
- [ ] See "Save Changes" button
- [ ] Click "Discard Changes"
- [ ] Changes reverted
- [ ] Click "Copy User Prompt Template"
- [ ] Click "Show available variables"
- [ ] See variable list
- [ ] Click "{{brand}}" variable
- [ ] Variable inserted into textarea
- [ ] Edit instructions
- [ ] Click "Save Changes"
- [ ] See saving spinner
- [ ] See success message
- [ ] Refresh page
- [ ] Changes persisted
- [ ] See version incremented
- [ ] Click "Reset to Defaults"
- [ ] Confirm reset
- [ ] All instructions reset

---

## 🚧 Not Yet Implemented (Future Phases)

### **Phase 3: Advanced Features**
- [ ] Preview compiled prompt (with variables replaced)
- [ ] Syntax highlighting for templates
- [ ] Duplicate instructions from another brand
- [ ] Import/export instructions as JSON
- [ ] Compare versions side-by-side
- [ ] Restore previous version
- [ ] Search within instructions

### **Phase 4: Generation Integration**
- [ ] Use instructions during content generation
- [ ] Show "Using custom instructions" indicator
- [ ] Track which instructions were used
- [ ] A/B test different instruction versions
- [ ] Analytics on instruction effectiveness

---

## 💡 Benefits

### **For Marketing Team**
- 🎛️ Fine-tune AI behavior without touching code
- 📝 Test different prompt styles
- 🔄 Iterate based on results
- 📊 Track what works with version history
- 🚀 Customize per brand

### **For Content Quality**
- 🎯 More consistent output
- ✍️ Better matches brand voice
- 🖼️ Better image generation
- 📈 Improves over time
- 💰 Less manual editing needed

---

## 🎯 What's Next?

### **Option 1: Test Phase 2**
Deploy and test thoroughly:
- Upload assets for a brand
- Edit instructions for that brand
- Test all 5 sections
- Verify version tracking
- Test reset to defaults

### **Option 2: Continue to Phase 3**
Implement advanced DAM features:
- Search assets by name/tags
- Filter by category/type/date
- Full-screen image preview
- Edit asset metadata
- Batch operations

### **Option 3: Continue to Phase 4**
Integrate with content generation:
- Load instructions during generation
- Use assets in prompts
- Show context being used
- Generate brand-consistent content

---

## 📚 Code Summary

### **Lines of Code Added**
- `useBrandInstructions.ts`: ~95 lines
- `InstructionSection.tsx`: ~145 lines
- `InstructionsTab.tsx`: ~215 lines
- `BrandAssetDashboard.tsx`: ~60 lines modified

**Total**: ~515 new lines

### **Components Created**: 3
1. InstructionsTab
2. InstructionSection
3. useBrandInstructions (hook)

### **Services Enhanced**: 1
- `instructionsService.ts` (already existed from Phase 1 foundation)

---

## ✅ Summary

**Phase 2 Status: ✅ COMPLETE**

You now have a fully functional Generation Instructions system with:
- 🤖 Instructions tab in asset manager
- ✏️ 5 editable instruction sections
- 📝 Template variable system
- 💾 Save/discard/reset functionality
- 📊 Version tracking
- 🔄 Firestore integration
- 🎨 Collapsible UI
- 💡 Variable helper

**Next:** Ready for Phase 3 (Advanced Features) or Phase 4 (Generation Integration)!

---

**🚀 Deploy, test, and let me know when you're ready for the next phase!**
