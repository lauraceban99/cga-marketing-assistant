// This script shows what fields are likely missing from CGA brand instructions
// Based on the errors you've been experiencing

console.log('🔍 CGA BRAND INSTRUCTIONS - MISSING FIELDS ANALYSIS');
console.log('═══════════════════════════════════════════════════\n');

console.log('Based on the errors you encountered, these fields are MISSING or EMPTY:\n');

const likelyMissing = [
  { field: 'coreValues', reason: 'Caused .join() error', impact: 'HIGH' },
  { field: 'keyMessaging', reason: 'Caused .join() error', impact: 'HIGH' },
  { field: 'personas[].painPoints', reason: 'Caused .join() error in personas', impact: 'HIGH' },
  { field: 'emailInstructions', reason: 'Caused .nurturingDrip error', impact: 'CRITICAL' },
  { field: 'adCopyInstructions.requirements', reason: 'Caused .requirements error', impact: 'MEDIUM' },
  { field: 'adCopyInstructions.dos', reason: 'Likely empty', impact: 'MEDIUM' },
  { field: 'adCopyInstructions.donts', reason: 'Likely empty', impact: 'MEDIUM' },
  { field: 'blogInstructions.requirements', reason: 'Caused .requirements error', impact: 'MEDIUM' },
  { field: 'blogInstructions.dos', reason: 'Likely empty', impact: 'MEDIUM' },
  { field: 'blogInstructions.donts', reason: 'Likely empty', impact: 'MEDIUM' },
  { field: 'landingPageInstructions.requirements', reason: 'Caused .requirements error', impact: 'MEDIUM' },
  { field: 'landingPageInstructions.dos', reason: 'Likely empty', impact: 'MEDIUM' },
  { field: 'landingPageInstructions.donts', reason: 'Likely empty', impact: 'MEDIUM' },
  { field: 'referenceMaterials', reason: 'Caused .interviews error', impact: 'MEDIUM' },
];

console.log('❌ CRITICAL ISSUES (Will cause errors):');
likelyMissing.filter(f => f.impact === 'CRITICAL').forEach(({ field, reason }) => {
  console.log(`   🔴 ${field}`);
  console.log(`      → ${reason}`);
});

console.log('\n⚠️  HIGH PRIORITY (Degrades AI quality):');
likelyMissing.filter(f => f.impact === 'HIGH').forEach(({ field, reason }) => {
  console.log(`   🟠 ${field}`);
  console.log(`      → ${reason}`);
});

console.log('\n⚡ MEDIUM PRIORITY (Nice to have):');
likelyMissing.filter(f => f.impact === 'MEDIUM').forEach(({ field, reason }) => {
  console.log(`   🟡 ${field}`);
  console.log(`      → ${reason}`);
});

console.log('\n\n📋 HOW TO VIEW YOUR ACTUAL DATA:');
console.log('─────────────────────────────────────────────────\n');

console.log('Option 1: Firebase Console (Easiest)');
console.log('→ https://console.firebase.google.com/project/ai-marketing-assistant-3ec42/firestore');
console.log('→ Navigate to: brandInstructions → cga\n');

console.log('Option 2: In Your App');
console.log('→ Go to Brand Assets → CGA → Brand Instructions tab');
console.log('→ You\'ll see empty text fields for missing data\n');

console.log('\n💡 HOW TO FIX:');
console.log('─────────────────────────────────────────────────\n');
console.log('1. Open your app (Railway URL)');
console.log('2. Navigate to: Brand Assets → CGA');
console.log('3. Click "Brand Instructions" tab');
console.log('4. Fill in the empty sections:');
console.log('   • General Brand Info → Core Values (add 3-5 values)');
console.log('   • General Brand Info → Key Messaging (add 3-5 messages)');
console.log('   • General Brand Info → Personas (add 2-3 personas with pain points)');
console.log('   • Email Tab → All three email types (system prompts, dos, donts)');
console.log('   • Ad Copy/Blog/Landing Page tabs → Requirements, dos, donts');
console.log('   • Reference Materials → Add interview transcripts if you have them');
console.log('5. Click "Save All Changes"\n');

console.log('✅ BENEFITS OF FILLING THESE IN:');
console.log('─────────────────────────────────────────────────\n');
console.log('• No more "Cannot read properties of undefined" errors');
console.log('• AI generates much better, on-brand content');
console.log('• Pattern extraction works properly');
console.log('• Consistent messaging across all content types');
console.log('• Personas are used to create targeted variations\n');

console.log('\n🎯 WHAT YOU HAVE SO FAR:');
console.log('─────────────────────────────────────────────────\n');
console.log('✅ brandIntroduction - EXISTS (used for context)');
console.log('✅ toneOfVoice - EXISTS (used for style)');
console.log('✅ landingPageInstructions.examples - 14 examples added!');
console.log('✅ landingPageInstructions.systemPrompt - EXISTS');
console.log('✅ campaignInstructions (tofu/mofu/bofu) - EXISTS\n');

console.log('These are working well! The errors only happen with the missing fields above.\n');
