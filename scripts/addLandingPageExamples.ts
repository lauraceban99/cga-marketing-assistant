/**
 * Script to add landing page examples to the system
 * Based on the performance data provided in the Claude Code Instructions
 *
 * Run this script to populate your brand with high-performing landing page examples
 */

import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import type { CampaignExample, Market, Platform, CampaignStage } from '../types';

// Landing Page Examples from instructions
const landingPageExamples: Array<{
  name: string;
  market: Market;
  platform: 'META' | 'GOOGLE';
  stage: CampaignStage;
  conversions: number;
  conversionRate: string;
  costPerConversion: string;
  campaign: string;
  url: string;
  fullPageText: string;
  whatWorks: string;
  targetAudience: string;
  tone: string;
}> = [
  {
    name: 'UAE Global Brand Campaign (BOFU)',
    market: 'EMEA',
    platform: 'META',
    stage: 'bofu',
    conversions: 14,
    conversionRate: '5.80%',
    costPerConversion: '$60.70',
    campaign: 'AE_cgahq_2025-07-30_global-brand-campaign-ptc_contact',
    url: 'https://www.crimsonglobalacademy.school/ae-en/campaigns/global-brand-campaign-fy26-enrollments-bofu-lp/',
    fullPageText: `ACCEPTING LATE TRANSFERS NOW - START NEXT TERM!
ACCEPTING LATE TRANSFERS NOW - START NEXT TERM!
ACCEPTING LATE TRANSFERS NOW - START NEXT TERM!
ACCEPTING LATE TRANSFERS NOW - START NEXT TERM!

Is Your Child's School Limiting Their Potential?

Pursue excellence with education that moves at their pace. Enrolments for next term are now open - give your child the CGA advantage today with personalised, online, private school education.

Speak to An Advisor

Launch their Future with CGA

From student-athletes needing flexibility, to global families on the move, to students with unique learning needs, and those aiming for the best universities - CGA delivers tailored education that empowers your child to achieve their goals.

Secure their place for next term now before it's too late.

Speak to An Advisor

Act Fast - Discuss Enrolment Today

Please provide the information below and an academic advisor will be in touch to discuss enrolment options, and answer your questions.

Are you a student or a guardian?
Student / Guardian
First Name
Last Name
Email
Next

Why Join Crimson Global Academy?

2,000+ Students across 70 Countries
A growing global community of diverse students, from Australia to Japan, and USA to the UK.

161+ University Offers
Students received offers from the Ivy League, Oxbridge, and the Top 50 universities in the world.

Highest Marks in the World
CGA students have won 18 x titles for the Highest Marks in World, Country, or Region in their Pearson Edexcel exams.

Exceptional Exam Results
39% earn perfect AP 5s - three times the global average - and nearly half of A Level exams taken by students result in A - A* grades.

#3 Best Online Private School
And #25 Best Private School in America, ranked by Niche.com

Turn Passions Into Impact
Students launch global clubs, step into student leadership roles, and enjoy a range of extracurriculars. Develop leadership skills while exploring career and university pathways.

Speak To An Advisor

Meet CGA's Future Leaders
- Future Entrepreneur: Mia
- Aspiring Musician: Konoka
- Future Astronaut: Robert
- Riding Champion: Hattie
- Tech Innovator: Henry

CGA: The Launchpad for your Ambitions

Your child's ambition deserves more than ordinary schooling. Let their dreams take flight - take the first step by speaking to an Academic Advisor about enrolment options.

Speak to An Advisor`,
    whatWorks: `**Urgency Strategy:**
- Scrolling banner "ACCEPTING LATE TRANSFERS NOW" repeated 4x creates immediate urgency
- "before it's too late" reinforces scarcity
- "Act Fast" section heading pushes immediate action

**Headline Psychology:**
- Question format: "Is Your Child's School Limiting Their Potential?" activates parent pain point
- Implies current school is inadequate → creates emotional trigger
- Not attacking parents' choice, but questioning the system

**Audience Segmentation:**
- Lists 4 specific personas: "student-athletes, global families, unique learning needs, aiming for best universities"
- Parents can self-identify → "This is for ME"
- Shows understanding of diverse needs

**Social Proof Strategy:**
- 6 distinct proof points (2000+ students, 161+ offers, highest marks, exam results, rankings, student stories)
- Mix of volume (2000+), outcome (161+ offers), and prestige (#3 ranking)
- Student profiles provide aspirational identification

**CTA Strategy:**
- Single consistent CTA: "Speak to An Advisor" (appears 6x)
- Low-friction: just talk, not commit
- Repeated at natural decision points (after value prop, after social proof, after student stories, final push)`,
    targetAudience: 'Parents dissatisfied with current school, seeking immediate change',
    tone: 'Urgent but supportive, aspirational, parent-focused'
  },

  {
    name: 'Singapore IB Webinar (MOFU) - 24.6% Conversion',
    market: 'ASIA',
    platform: 'META',
    stage: 'mofu',
    conversions: 58,
    conversionRate: '24.6%',
    costPerConversion: '$17.24',
    campaign: 'ASIA_cgahq_2025-09-18_sg-ib-webinar_event-online',
    url: 'https://www.crimsonglobalacademy.school/sg/campaigns/asia/20251809-ib-webinar-asia/',
    fullPageText: `Is the IB Really the Right Fit for Your Child's Path to Top Universities?

FREE WEBINAR FOR FAMILIES ACROSS ASIA
18th September, 8.00PM GMT+8

REGISTER HERE

Many families choose the IB because it sounds global, holistic, and prestigious.

But behind the IB brand, more and more parents are asking:

Is this curriculum truly the best pathway to Oxbridge, the Ivy League, and other top universities?

🔑 Join our exclusive webinar to discover:

* Why the breadth-over-depth model, heavy workload (EE, TOK, CAS), and tough grading scale leave many students exhausted and disadvantaged.

* The truth about admissions: why Oxbridge values A Level subject mastery, and why US universities prefer the clarity of AP results.

* How ambitious students across Singapore, Hong Kong, Taiwan, and Vietnam hit roadblocks with the IB — and what happened when they switched.

* How families are choosing sharper, more strategic routes that align directly with their child's goals — without unnecessary stress.

The IB is respected worldwide, but it isn't always the best pathway for ambitious students. This webinar will help you decide if A Levels or AP may be the sharper, safer choice for your child's university dreams.

Register Now

Don't Miss Out — Spaces Are Filling Fast!

Use the form below to secure your place, and we'll email you the link to join this exclusive webinar.

Are you a student or a guardian?
Student / Guardian
First Name
Last Name
Email
Next

MEET YOUR EXPERT SPEAKER

Lyn Han
🎓 Senior US Strategy Consultant, Crimson Education
🎓 Graduate of the University of Chicago (Political Science)
🎓 Public Service Scholarship recipient and Raffles Institution alumna
🎓 Former University of Chicago alumni interviewer and admissions office staff
🌟 Her students have gained admission to Stanford, Princeton, UPenn, Cornell, Oxford, and more`,
    whatWorks: `**Contrarian Positioning (24.6% - EXCEPTIONAL):**
- Challenges popular belief: "Is the IB Really the Right Fit?"
- Not bashing IB, but questioning conventional wisdom
- Creates cognitive dissonance → must attend to resolve
- "Behind the IB brand, more and more parents are asking..." → social proof of doubt

**Specificity Wins:**
- Names exact IB components (EE, TOK, CAS) → shows deep understanding
- Lists specific universities (Oxbridge, Ivy League)
- Names specific countries (Singapore, Hong Kong, Taiwan, Vietnam)
- Regional specificity creates relevance

**Problem Agitation:**
- Lists concrete IB problems: "exhausted and disadvantaged"
- Describes why it fails: "breadth-over-depth", "tough grading scale"
- Uses emotive language: "roadblocks", "unnecessary stress"
- Makes parents question their current path

**Authority Credibility:**
- Speaker bio is DETAILED: specific schools (Raffles, UChicago), specific role (alumni interviewer)
- Name-drops results: Stanford, Princeton, UPenn, Cornell, Oxford
- Regional credibility: Raffles Institution (top Singapore school)
- Not generic corporate speaker → real expert

**Exclusivity Framing:**
- "exclusive webinar" → special access
- "Spaces Are Filling Fast" → scarcity
- FREE but valuable → high perceived value
- Clear date/time → creates commitment`,
    targetAudience: 'Asian families currently in IB, questioning curriculum choice',
    tone: 'Educational, contrarian, empowering, specific'
  },

  {
    name: 'NZ Switching Schools (GOOGLE) - 15.75% Conversion',
    market: 'ANZ',
    platform: 'GOOGLE',
    stage: 'bofu',
    conversions: 81,
    conversionRate: '15.75%',
    costPerConversion: '$49.63',
    campaign: 'NZ_cgahq_2024-01-22_search_switching-schools-consult_contact',
    url: 'https://www.crimsonglobalacademy.school/nz/switching-schools/',
    fullPageText: `New Zealand's Leading Online Learning Program

Give your child a world-class education from anywhere with Crimson Global Academy's live, interactive online classrooms and top-tier educators. CGA offers internationally accredited online learning for students across New Zealand.

START YOUR CGA JOURNEY

What to expect at CGA:
* Effective, challenging and transformative online learning.
* Access to cutting-edge educational technologies to provide a rich online experience.
* Connection to a global learning environment and network.
* Flexibility of location, scheduling and pathway options.
* Instruction from the best educators around the world.
* Rigorous, reputable and internationally recognised curriculum.
* A diverse programme of extracurricular activities.
* A 'whole person' approach and positive learning environment.

Download our Prospectus

Complete the form below to access our prospectus and discover more about online education with CGA.

Are you a student or a guardian?
Student / Guardian
First Name
Last Name
Email
Next

Meet some our Students
[Student profiles: Kiani, Emma, Max, Jade]`,
    whatWorks: `**Direct Value Prop for Switchers (15.75% - Highest Overall!):**
- "New Zealand's Leading Online Learning Program"
- Not "is your school failing?" question
- For people actively searching "switching schools" - they've already decided

**Simple Bullet List (No Tables, No Data):**
- 8 bullet points covering all benefits
- Scannable, clear, no cognitive load
- Unlike EMEA GOOGLE with trust signals, this is benefit-focused

**Low-Friction CTA:**
- "Download our Prospectus" (not "speak to admissions")
- Very low commitment for explorers
- Perfect for GOOGLE high-intent but not ready to commit

**"World-class" but Humble:**
- Not aggressive rankings like ASIA
- "world-class" mentioned but not #3 ranking
- ANZ culture: tall poppy syndrome (don't boast too much)

**Student Profiles (Local Social Proof):**
- Named NZ students: Kiani, Emma, Max, Jade
- Kiwi names = relatable
- Not Ivy League focus, just "our students"

**Search Intent Match:**
- Searching "switching schools" = problem with current school
- Page offers solution immediately
- No need to create problem awareness`,
    targetAudience: 'NZ families actively searching to switch schools',
    tone: 'Simple, humble, benefit-focused, locally grounded'
  }
];

/**
 * Add examples to a brand's landing page instructions
 */
export async function addExamplesToBrand(brandId: string) {
  try {
    console.log(`📚 Adding ${landingPageExamples.length} landing page examples to brand ${brandId}...`);

    // Get current brand instructions
    const brandDocRef = doc(db, 'brands', brandId, 'instructions', 'main');
    const brandDoc = await getDoc(brandDocRef);

    if (!brandDoc.exists()) {
      throw new Error(`Brand instructions not found for ${brandId}`);
    }

    const instructions = brandDoc.data();
    const currentExamples = instructions.landingPageInstructions?.examples || [];

    // Convert to CampaignExample format
    const newExamples: CampaignExample[] = landingPageExamples.map(ex => ({
      type: 'landing-page' as const,
      stage: ex.stage,
      market: ex.market,
      platform: ex.platform,
      headline: ex.fullPageText.split('\n')[0], // First line as headline
      copy: ex.fullPageText,
      cta: 'Speak to An Advisor', // Default, extracted from content
      notes: `Performance: ${ex.conversionRate} conversion (${ex.conversions} conversions), ${ex.costPerConversion} CPC
Campaign: ${ex.campaign}
URL: ${ex.url}
Target Audience: ${ex.targetAudience}
Tone: ${ex.tone}`,
      whatWorks: ex.whatWorks
    }));

    // Merge with existing
    const updatedExamples = [...currentExamples, ...newExamples];

    // Update Firestore
    await updateDoc(brandDocRef, {
      'landingPageInstructions.examples': updatedExamples
    });

    console.log(`✅ Successfully added ${newExamples.length} examples`);
    console.log(`📊 Total examples now: ${updatedExamples.length}`);

    return updatedExamples;
  } catch (error) {
    console.error('❌ Error adding examples:', error);
    throw error;
  }
}

// Export for use in other scripts or components
export { landingPageExamples };
