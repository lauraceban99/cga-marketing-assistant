# 🚀 Quick Start Guide - Full DAM + Instructions System

## 🎯 What You Have

A complete Digital Asset Management system with Generation Instructions, featuring:
- Asset upload/management (Phase 1)
- Custom generation instructions (Phase 2)
- Advanced search/filter/preview (Phase 3)
- Full generation integration (Phase 4)

---

## ⚡ Quick Setup (5 minutes)

### **1. Set Environment Variables**

Add to Railway or `.env.local`:

```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### **2. Enable Firebase Services**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Enable **Firestore Database**
3. Enable **Storage**
4. Copy security rules from `FULL_INTEGRATION_COMPLETE.md`

### **3. Deploy**

```bash
git add .
git commit -m "Add full DAM + Instructions system"
git push origin main
```

Railway auto-deploys!

---

## 📱 Using the System

### **Upload Assets**
1. Click "📁 Manage Brand Assets"
2. Select brand → Choose category
3. Click "+ Add Assets"
4. Upload files → Add tags → Upload

### **Customize Instructions**
1. In brand dashboard → Click "🤖 Instructions"
2. Expand any section → Edit text
3. Use variables: `{{brand}}`, `{{theme}}`, etc.
4. Save changes

### **Search & Filter**
1. Use search bar in any category
2. Filter by type (Images/Documents/Videos)
3. Sort by date/name/size
4. Click asset to preview

### **Generate Content**
```typescript
// Build context with assets + instructions
const context = await buildGenerationContext(brand, {
  theme: 'Open Day',
  location: 'Auckland'
});

// Get prompts
const { systemPrompt, userPrompt } = await buildPromptFromContext(context);

// Show what's being used
<GenerationContextDisplay context={context} />

// Generate with Gemini
const result = await ai.models.generateContent({
  systemInstruction: systemPrompt,
  contents: userPrompt
});
```

---

## 🔧 Key Services

### **Asset Management**
```typescript
import { uploadAsset, getAssetsByCategory, deleteAsset, updateAssetMetadata } from './services/assetService';
```

### **Instructions**
```typescript
import { getBrandInstructions, saveBrandInstructions } from './services/instructionsService';
```

### **Generation**
```typescript
import { buildGenerationContext, buildPromptFromContext, getContextSummary } from './services/generationService';
```

### **Text Extraction**
```typescript
import { extractTextFromAssets } from './services/assetExtractionService';
```

---

## 📂 File Locations

### **Main Components**
- `/components/dam/BrandAssetManager.tsx` - Main entry point
- `/components/dam/BrandAssetDashboard.tsx` - Brand dashboard (all features)
- `/components/dam/instructions/InstructionsTab.tsx` - Instructions editor
- `/components/GenerationContextDisplay.tsx` - Context display

### **Services**
- `/services/assetService.ts` - Asset CRUD
- `/services/instructionsService.ts` - Instructions CRUD
- `/services/generationService.ts` - Generation integration
- `/services/assetExtractionService.ts` - Text extraction

### **Hooks**
- `/hooks/useAssets.ts` - Asset management
- `/hooks/useBrandInstructions.ts` - Instructions management

---

## 🎨 Key Features

### **Asset Management**
- ✅ Multi-file upload
- ✅ 5 categories
- ✅ Search by name/tags
- ✅ Filter by type
- ✅ Sort options
- ✅ Full-screen preview
- ✅ Edit metadata
- ✅ Grid/List views

### **Instructions**
- ✅ 5 editable sections
- ✅ Template variables
- ✅ Variable helper
- ✅ Version tracking
- ✅ Save/Reset
- ✅ Default templates

### **Integration**
- ✅ Auto-load assets
- ✅ Auto-load instructions
- ✅ Text extraction
- ✅ Variable replacement
- ✅ Context display

---

## 📊 Data Structure

### **Assets** (`brandAssets` collection)
```typescript
{
  id: string
  brandId: string
  category: 'brand-guidelines' | 'competitor-ads' | 'reference-copy' | 'logos' | 'other'
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedAt: Date
  metadata: {
    description?: string
    tags?: string[]
  }
}
```

### **Instructions** (`brandInstructions` collection)
```typescript
{
  brandId: string
  copySystemPrompt: string
  copyUserPromptTemplate: string
  toneRules: string
  imageGenerationInstructions: string
  imageStyleGuidelines: string
  version: number
}
```

---

## 🐛 Troubleshooting

### **Assets not loading**
- Check Firebase Storage rules
- Check Firestore rules
- Verify environment variables

### **Upload fails**
- Check file size limits
- Check file type restrictions
- Check Firebase Storage bucket

### **Instructions not saving**
- Check Firestore rules
- Check network tab for errors
- Verify brandId exists

### **Text extraction fails**
- Check Gemini API key
- Check PDF is not password-protected
- Check file is accessible via URL

---

## 📚 Documentation

- **Full Integration**: See `FULL_INTEGRATION_COMPLETE.md`
- **Phase 1 Details**: See `PHASE_1_COMPLETE.md`
- **Phase 2 Details**: See `PHASE_2_COMPLETE.md`
- **Architecture**: See `DAM_ARCHITECTURE.md`
- **Instructions Design**: See `GENERATION_INSTRUCTIONS_DESIGN.md`

---

## 💡 Quick Tips

1. **Upload brand guidelines first** - PDFs work best
2. **Add tags to assets** - Makes searching easier
3. **Customize instructions per brand** - Each brand can have unique voice
4. **Use template variables** - They auto-populate from assets
5. **Preview assets before use** - Check what's being loaded
6. **Version your instructions** - Track what works best

---

## ✅ Testing Checklist

- [ ] Upload an asset
- [ ] Search for it
- [ ] Preview it
- [ ] Edit its metadata
- [ ] Create custom instructions
- [ ] Use template variables
- [ ] Build generation context
- [ ] See context display

---

## 🚀 Next Steps

1. **Deploy** to Railway
2. **Upload** brand assets for all 6 brands
3. **Customize** instructions for each brand
4. **Test** generation with context
5. **Iterate** on instructions based on results

---

**Need help?** See `FULL_INTEGRATION_COMPLETE.md` for detailed documentation.

**Ready to generate!** 🎉
