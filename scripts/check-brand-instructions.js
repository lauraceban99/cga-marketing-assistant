/**
 * Check Brand Instructions for Missing Fields
 *
 * This script analyzes Firebase brand instructions and reports:
 * - Missing required fields
 * - Missing optional fields that would improve output quality
 * - Placeholder values that need to be filled
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import { existsSync } from 'fs';

// Load environment variables
dotenv.config();

// Check if .env file exists
if (!existsSync('.env')) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('❌ ERROR: .env file not found!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🔧 SETUP REQUIRED:\n');
  console.log('   1. Copy the example file:');
  console.log('      cp .env.example .env\n');
  console.log('   2. Edit .env and fill in your Firebase credentials');
  console.log('      (Get them from Firebase Console → Project Settings)\n');
  console.log('   3. Run this script again\n');
  process.exit(1);
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase config
const missingVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('❌ ERROR: Missing Firebase configuration!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Missing values in .env file:\n');
  missingVars.forEach(v => console.log(`   - VITE_${v.toUpperCase()}`));
  console.log('\n🔧 Edit your .env file and add these values.\n');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Expected structure for brand instructions
 */
const expectedStructure = {
  // General brand fields
  brandIntroduction: { type: 'string', required: true },
  personas: { type: 'array', required: true },
  coreValues: { type: 'array', required: true },
  toneOfVoice: { type: 'string', required: true },
  keyMessaging: { type: 'array', required: true },

  // Campaign instructions
  campaignInstructions: {
    type: 'object',
    required: false,
    fields: {
      tofu: { type: 'string', required: true },
      mofu: { type: 'string', required: true },
      bofu: { type: 'string', required: true },
    }
  },

  // Content type instructions
  adCopyInstructions: {
    type: 'object',
    required: false,
    fields: {
      systemPrompt: { type: 'string', required: true },
      requirements: { type: 'string', required: false },
      examples: { type: 'array', required: true },
      dos: { type: 'array', required: false },
      donts: { type: 'array', required: false },
    }
  },

  blogInstructions: {
    type: 'object',
    required: false,
    fields: {
      systemPrompt: { type: 'string', required: true },
      requirements: { type: 'string', required: false },
      examples: { type: 'array', required: true },
      dos: { type: 'array', required: false },
      donts: { type: 'array', required: false },
    }
  },

  landingPageInstructions: {
    type: 'object',
    required: false,
    fields: {
      systemPrompt: { type: 'string', required: true },
      requirements: { type: 'string', required: false },
      examples: { type: 'array', required: true },
      dos: { type: 'array', required: false },
      donts: { type: 'array', required: false },
    }
  },

  emailInstructions: {
    type: 'object',
    required: false,
    fields: {
      invitation: {
        type: 'object',
        required: false,
        fields: {
          systemPrompt: { type: 'string', required: true },
          requirements: { type: 'string', required: false },
          examples: { type: 'array', required: true },
          dos: { type: 'array', required: false },
          donts: { type: 'array', required: false },
        }
      },
      nurturingDrip: {
        type: 'object',
        required: false,
        fields: {
          systemPrompt: { type: 'string', required: true },
          requirements: { type: 'string', required: false },
          examples: { type: 'array', required: true },
          dos: { type: 'array', required: false },
          donts: { type: 'array', required: false },
        }
      },
      emailBlast: {
        type: 'object',
        required: false,
        fields: {
          systemPrompt: { type: 'string', required: true },
          requirements: { type: 'string', required: false },
          examples: { type: 'array', required: true },
          dos: { type: 'array', required: false },
          donts: { type: 'array', required: false },
        }
      }
    }
  }
};

/**
 * Check if a value is a placeholder
 */
function isPlaceholder(value) {
  if (typeof value === 'string') {
    return value.includes('[PLACEHOLDER');
  }
  if (Array.isArray(value)) {
    return value.some(item => typeof item === 'string' && item.includes('[PLACEHOLDER'));
  }
  return false;
}

/**
 * Check if value is empty/missing
 */
function isEmpty(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Recursively check structure
 */
function checkStructure(data, structure, path = '', issues = { critical: [], warnings: [], placeholders: [] }) {
  for (const [key, spec] of Object.entries(structure)) {
    const fullPath = path ? `${path}.${key}` : key;
    const value = data?.[key];

    // Check if field exists
    if (isEmpty(value)) {
      if (spec.required) {
        issues.critical.push(`❌ MISSING CRITICAL FIELD: ${fullPath}`);
      } else {
        issues.warnings.push(`⚠️  Missing optional field: ${fullPath} (will use generic fallback)`);
      }
      continue;
    }

    // Check for placeholder values
    if (isPlaceholder(value)) {
      issues.placeholders.push(`📝 Has placeholder: ${fullPath} (needs real content)`);
    }

    // Check nested fields
    if (spec.type === 'object' && spec.fields) {
      checkStructure(value, spec.fields, fullPath, issues);
    }

    // Check array contents
    if (spec.type === 'array' && Array.isArray(value)) {
      if (value.length === 0) {
        issues.warnings.push(`⚠️  Empty array: ${fullPath} (consider adding examples)`);
      }
    }
  }

  return issues;
}

/**
 * Main function
 */
async function checkBrandInstructions(brandId = 'cga') {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🔍 Checking Brand Instructions for: ${brandId}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Fetch brand instructions from Firestore
    const docRef = doc(db, 'brandInstructions', brandId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log('❌ ERROR: Brand instructions document does not exist!');
      console.log(`\nTo fix: Create a document in Firestore at: brandInstructions/${brandId}`);
      process.exit(1);
    }

    const data = docSnap.data();
    console.log('✅ Brand instructions document found\n');

    // Check structure
    const issues = checkStructure(data, expectedStructure);

    // Display results
    if (issues.critical.length > 0) {
      console.log('🚨 CRITICAL ISSUES (Will cause crashes):\n');
      issues.critical.forEach(issue => console.log(`   ${issue}`));
      console.log('');
    }

    if (issues.warnings.length > 0) {
      console.log('⚠️  WARNINGS (Will use generic fallbacks):\n');
      issues.warnings.forEach(issue => console.log(`   ${issue}`));
      console.log('');
    }

    if (issues.placeholders.length > 0) {
      console.log('📝 PLACEHOLDER VALUES (Need real content):\n');
      issues.placeholders.forEach(issue => console.log(`   ${issue}`));
      console.log('');
    }

    if (issues.critical.length === 0 && issues.warnings.length === 0 && issues.placeholders.length === 0) {
      console.log('🎉 Perfect! All brand instructions are complete.\n');
    } else {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 SUMMARY\n');
      console.log(`   Critical Issues: ${issues.critical.length}`);
      console.log(`   Warnings: ${issues.warnings.length}`);
      console.log(`   Placeholders: ${issues.placeholders.length}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      if (issues.critical.length > 0) {
        console.log('🔧 NEXT STEPS:\n');
        console.log('   1. Go to Firebase Console:');
        console.log('      https://console.firebase.google.com/project/ai-marketing-assistant-3ec42/firestore/data\n');
        console.log('   2. Navigate to: brandInstructions → cga\n');
        console.log('   3. Add the missing critical fields listed above\n');
      } else if (issues.warnings.length > 0) {
        console.log('💡 RECOMMENDATIONS:\n');
        console.log('   The app will work with generic fallbacks, but output quality');
        console.log('   will improve significantly if you configure missing fields.\n');
        console.log('   Configure instructions through the DAM UI:\n');
        console.log('   App → DAM → Brand Instructions → Fill missing sections\n');
      }
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the check
const brandId = process.argv[2] || 'cga';
checkBrandInstructions(brandId);
