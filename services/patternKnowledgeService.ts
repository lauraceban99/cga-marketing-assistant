import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  PatternKnowledgeBase,
  Market,
  Platform,
  TaskType,
  CampaignExample,
} from '../types';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseService';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

/**
 * Get pattern knowledge base for a specific market + platform + content type
 */
export async function getPatternKnowledge(
  brandId: string,
  market: Market,
  platform: Platform,
  contentType: TaskType
): Promise<PatternKnowledgeBase | null> {
  try {
    const patternsRef = collection(db, 'brands', brandId, 'patternKnowledge');
    const q = query(
      patternsRef,
      where('market', '==', market),
      where('platform', '==', platform),
      where('contentType', '==', contentType)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      lastUpdated: doc.data().lastUpdated?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    } as PatternKnowledgeBase;
  } catch (error) {
    console.error('Error loading pattern knowledge:', error);
    return null;
  }
}

/**
 * Get all pattern knowledge bases for a brand
 */
export async function getAllPatternKnowledge(brandId: string): Promise<PatternKnowledgeBase[]> {
  try {
    const patternsRef = collection(db, 'brands', brandId, 'patternKnowledge');
    const querySnapshot = await getDocs(patternsRef);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      lastUpdated: doc.data().lastUpdated?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    } as PatternKnowledgeBase));
  } catch (error) {
    console.error('Error loading all pattern knowledge:', error);
    return [];
  }
}

/**
 * Auto-extract patterns from examples using AI
 * This is called when new examples are added to analyze and update patterns
 */
export async function extractPatternsFromExamples(
  examples: CampaignExample[],
  market: Market,
  platform: Platform,
  contentType: TaskType
): Promise<{
  patterns: PatternKnowledgeBase['patterns'];
  insights: string;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = `You are an expert marketing analyst. Analyze these ${contentType} examples from the ${market} market with ${platform} traffic source and extract key patterns that make them successful.

EXAMPLES TO ANALYZE:
${examples
  .map(
    (ex, i) => `
Example ${i + 1}:
Headline: ${ex.headline || 'N/A'}
Copy: ${ex.copy}
CTA: ${ex.cta}
Funnel Stage: ${ex.stage}
${ex.whatWorks ? `What Works: ${ex.whatWorks}` : ''}
${ex.notes ? `Notes: ${ex.notes}` : ''}
---
`
  )
  .join('\n')}

Extract patterns in the following categories:

1. **Headline Styles**: What types of headlines are used? (e.g., "question-based", "direct value prop", "contrarian", "urgency-focused")

2. **Structure Patterns**: How is the content organized? (e.g., "problem-agitate-solve", "trust signals first", "social proof stacking")

3. **Tone Characteristics**: What's the overall tone? (e.g., "urgent and aspirational", "intellectual and data-driven", "friendly and casual")

4. **CTA Strategies**: How are calls-to-action used? (e.g., "single CTA repeated", "low-friction lead magnet", "high-commitment consultation")

5. **Conversion Techniques**: What specific techniques drive conversions? (e.g., "contrarian positioning", "scarcity messaging", "audience segmentation")

6. **Social Proof Approaches**: How is credibility established? (e.g., "student testimonials", "university logos", "performance data")

Return ONLY valid JSON in this exact format:
{
  "patterns": {
    "headlineStyles": ["pattern 1", "pattern 2", ...],
    "structurePatterns": ["pattern 1", "pattern 2", ...],
    "toneCharacteristics": ["pattern 1", "pattern 2", ...],
    "ctaStrategies": ["pattern 1", "pattern 2", ...],
    "conversionTechniques": ["pattern 1", "pattern 2", ...],
    "socialProofApproaches": ["pattern 1", "pattern 2", ...]
  },
  "insights": "A comprehensive paragraph summarizing why these patterns work for this market + platform combination, including specific performance insights and recommendations for future content."
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Extract JSON from response (handle code blocks)
    let jsonText = response;
    if (response.includes('```json')) {
      jsonText = response.split('```json')[1].split('```')[0].trim();
    } else if (response.includes('```')) {
      jsonText = response.split('```')[1].split('```')[0].trim();
    }

    const parsed = JSON.parse(jsonText);

    return {
      patterns: parsed.patterns,
      insights: parsed.insights,
    };
  } catch (error) {
    console.error('Error extracting patterns:', error);

    // Return empty patterns if AI fails
    return {
      patterns: {
        headlineStyles: [],
        structurePatterns: [],
        toneCharacteristics: [],
        ctaStrategies: [],
        conversionTechniques: [],
        socialProofApproaches: [],
      },
      insights: 'Pattern extraction failed. Please add patterns manually.',
    };
  }
}

/**
 * Create or update pattern knowledge base
 */
export async function updatePatternKnowledge(
  brandId: string,
  market: Market,
  platform: Platform,
  contentType: TaskType,
  examples: CampaignExample[],
  manualLearnings: string = ''
): Promise<PatternKnowledgeBase> {
  // Get existing pattern knowledge or create new
  let existing = await getPatternKnowledge(brandId, market, platform, contentType);

  // Auto-extract patterns from examples
  const { patterns, insights } = await extractPatternsFromExamples(
    examples,
    market,
    platform,
    contentType
  );

  // Calculate performance summary
  const performanceSummary = {
    totalExamples: examples.length,
  };

  const patternKnowledge: Omit<PatternKnowledgeBase, 'id'> = {
    brandId,
    market,
    platform,
    contentType,
    patterns,
    manualLearnings: manualLearnings || existing?.manualLearnings || '',
    autoExtractedInsights: insights,
    exampleIds: examples.map((_, i) => `example-${i}`), // TODO: Use real IDs when examples have them
    performanceSummary,
    lastUpdated: new Date(),
    createdAt: existing?.createdAt || new Date(),
  };

  // Save to Firestore
  const docId =
    existing?.id || `${market}-${platform}-${contentType}`.toLowerCase().replace(/\s+/g, '-');
  const docRef = doc(db, 'brands', brandId, 'patternKnowledge', docId);

  await setDoc(docRef, patternKnowledge, { merge: true });

  return {
    id: docId,
    ...patternKnowledge,
  };
}

/**
 * Manually update pattern learnings (for marketers to add insights)
 */
export async function updateManualLearnings(
  brandId: string,
  patternId: string,
  manualLearnings: string
): Promise<void> {
  const docRef = doc(db, 'brands', brandId, 'patternKnowledge', patternId);

  await setDoc(
    docRef,
    {
      manualLearnings,
      lastUpdated: new Date(),
    },
    { merge: true }
  );
}

/**
 * Delete pattern knowledge base
 */
export async function deletePatternKnowledge(brandId: string, patternId: string): Promise<void> {
  const docRef = doc(db, 'brands', brandId, 'patternKnowledge', patternId);
  await setDoc(docRef, { deleted: true }, { merge: true });
}

/**
 * Get general patterns (fallback for new markets without specific data)
 * This returns patterns from all markets to provide baseline knowledge
 */
export async function getGeneralPatterns(
  brandId: string,
  platform: Platform,
  contentType: TaskType
): Promise<PatternKnowledgeBase | null> {
  try {
    const allPatterns = await getAllPatternKnowledge(brandId);

    // Filter by platform and content type
    const relevantPatterns = allPatterns.filter(
      (p) => p.platform === platform && p.contentType === contentType
    );

    if (relevantPatterns.length === 0) {
      return null;
    }

    // Merge all patterns from different markets
    const mergedPatterns: PatternKnowledgeBase['patterns'] = {
      headlineStyles: [],
      structurePatterns: [],
      toneCharacteristics: [],
      ctaStrategies: [],
      conversionTechniques: [],
      socialProofApproaches: [],
    };

    relevantPatterns.forEach((p) => {
      Object.keys(mergedPatterns).forEach((key) => {
        const k = key as keyof PatternKnowledgeBase['patterns'];
        mergedPatterns[k] = [...new Set([...mergedPatterns[k], ...p.patterns[k]])];
      });
    });

    return {
      id: 'general',
      brandId,
      market: 'EMEA', // Default
      platform,
      contentType,
      patterns: mergedPatterns,
      manualLearnings: 'General patterns merged from all markets',
      autoExtractedInsights:
        'These patterns are aggregated from multiple markets. Use as baseline when specific market data is unavailable.',
      exampleIds: [],
      performanceSummary: {
        totalExamples: relevantPatterns.reduce(
          (sum, p) => sum + (p.performanceSummary?.totalExamples || 0),
          0
        ),
      },
      lastUpdated: new Date(),
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error loading general patterns:', error);
    return null;
  }
}
