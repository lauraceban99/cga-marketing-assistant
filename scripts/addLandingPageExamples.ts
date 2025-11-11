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
  },

  {
    name: 'UAE Online High School (GOOGLE) - 85 Conversions',
    market: 'EMEA',
    platform: 'GOOGLE',
    stage: 'tofu',
    conversions: 85,
    conversionRate: '6.0%',
    costPerConversion: '$60.82',
    campaign: 'AE_cgahq_2021-04-14_search_AE-online-high-school-broad-content-target-cpa_lead',
    url: 'https://www.crimsonglobalacademy.school/ae-en/campaigns/cga-uae/',
    fullPageText: `THE UAE'S LEADING ONLINE SCHOOL

CGA is a world-class private high school — without the campus. Trusted by families across the UAE, we provide personalised, flexible online education for students aged 7-18, led by expert teachers and backed by internationally recognised qualifications. Give your child access to a truly global learning experience, designed to fit your family's lifestyle, wherever you are. Enrolment for 1:1 classes in 2025–2026 is closing soon. Secure your child's place today by contacting our Admissions Team.

START YOUR CHILD'S JOURNEY

transfers open. speak to our admissions team NOW

Get Started - Speak to Admissions Today

Fill out the form to speak with Admissions and receive a personalised academic plan for your child, plus our prospectus!

Are you a student or a guardian?
First Name
Last Name
Email
Next

Why Families from the UAE Choose CGA

With over 2000 students and 250 teachers, our mission at CGA is to build futures together with families through global online schooling, fostering a collaborative environment where students can thrive academically and personally.

Accredited, Award-Winning Online School
CGA is accredited by WASC, Pearson Edexcel, Cambridge, AP CollegeBoard, COBIS and NCAA. We are ranked #5 by NICHE and Top 100 Private Schools in the World by Spears School Index 2025.

161+ University Offers
This year alone, our students received offers from Oxford, Cambridge, King's College London, Princeton, Harvard, Columbia and many more.

Flexibility without Compromising Quality
Students can access CGA from anywhere in the UAE, or even when you travel. Learn in small live group classes (average 10 - 12 students) or via 1:1 instruction with an experienced, qualified teacher.

Highest Marks in the World
CGA students have won 18 x titles for the Highest Marks in World, Country, or Region in their Pearson Edexcel IGCSE & A Level exams.

Study based on Ability, not Age
Over 40% of our students are studying at least 1 subject at an accelerated level. With no limits on learning, students from the UAE have the opportunity to stand out to top universities.

Extracurriculars, Clubs and Meet-Ups
Students launch global clubs, step into student leadership roles, and enjoy a wide range of extracurriculars. Our in-person meet-ups provide students with the chance to connect around the world.

ACCEPTING LATE TRANSFERS NOW - START NEXT TERM!

Is Online Schooling Legal in the UAE?

Homeschooling in the UAE usually requires you to register with your relevant educational authority.

As an internationally accredited online school, Crimson Global Academy (CGA) allows families to personalise their child's education without registering as homeschoolers.

Many UAE families choose CGA for its flexibility, global recognition, and high academic standards. For parents, our accreditation by COBIS, Pearson Edexcel, Cambridge, and the CollegeBoard ensures world-class teaching, strong academic support, and trusted safeguarding — all delivered online, wherever you are.

talk to admissions

Hear about CGA from our UAE Students

Don't take our word for it, hear from our CGA students based in the UAE.

Suhaila: "CGA classrooms are built to be super engaging and discussion based. Having that opportunity to have academic discussions in an online classroom is so helpful for my future career as a diplomat or professor. The teachers at CGA are so engaging, such experts in their field."

Fatima: "When I think of CGA, I think of a fluid spectrum, where all factors combine to help you create an amazing profile for admissions. The teachers, great friends and all factors give you an overall better experience."

Ibrahim: "I expected CGA to help me in managing my time better as a student, however CGA exceeded my expectations. Not only that, but it has also allowed me to focus on my extracurricular activities better, exposed me to internships at a young age."

Ishaaq: "My favourite thing about CGA is the time management element. I structure my day accordingly to start classes in the afternoon. This allows me to do internships, run a business, and tutor on the side."

Our Accreditations and Rankings

Our Students Secure Admission to the World's Top Universities
Cambridge, Oxford, Harvard, Yale, Columbia, Stanford, NYU, Imperial College London, King's College London, Cornell, UC Berkeley, UCLA, UPenn Wharton, and more.`,
    whatWorks: `**Trust Signal Stacking (GOOGLE Organic TOFU):**
- Lists 6+ accreditations upfront: WASC, Pearson Edexcel, Cambridge, AP CollegeBoard, COBIS, NCAA
- Rankings prominently displayed: #5 by NICHE, Top 100 Private Schools
- Highest Marks in World (18x titles) → competitive edge
- GOOGLE searchers need credibility before commitment → stacking builds trust

**Objection Handling Embedded:**
- "Is Online Schooling Legal in the UAE?" section addresses key blocker
- Explains homeschooling registration concern
- Positions CGA as "internationally accredited" = no registration needed
- Removes friction before it becomes a reason to bounce

**Local Social Proof:**
- 4 UAE student testimonials with Arabic/local names (Suhaila, Fatima, Ibrahim, Ishaaq)
- Specific career aspirations (diplomat, professor) → aspirational
- Real student voices, not marketing copy
- Geographic specificity: "families across the UAE", "when you travel"

**Urgency Without Aggression:**
- "Enrolment for 1:1 classes in 2025–2026 is closing soon"
- Scrolling banner: "transfers open. speak to our admissions team NOW"
- Softer than META's "ACCEPTING LATE TRANSFERS" all-caps repeat
- GOOGLE = educational search → gentler urgency works better

**Structured Benefit Hierarchy:**
- 6 distinct benefit cards (accreditation, university offers, flexibility, exam results, acceleration, extracurriculars)
- Scannable format for GOOGLE organic visitors
- Each addresses different parent concern
- Not narrative-driven like META, more information architecture`,
    targetAudience: 'UAE families researching online schooling options (early awareness)',
    tone: 'Professional, credibility-focused, structured, locally tailored'
  },

  {
    name: 'GCC Brand Campaign 2025 (GOOGLE) - 8.2% Conversion',
    market: 'EMEA',
    platform: 'GOOGLE',
    stage: 'bofu',
    conversions: 51,
    conversionRate: '8.2%',
    costPerConversion: '$37.02',
    campaign: 'AE_cgahq_2024-09-30_search-gcc-cga-brand-anz-lp_contact',
    url: 'https://www.crimsonglobalacademy.school/ae/campaigns/enrol-for-2025/',
    fullPageText: `Join NOW For 2025: Tailored Online Learning from Anywhere

Experience a world-class education tailored to your family's needs. At Crimson Global Academy (CGA), we provide GCC based families with high-quality, online learning designed to empower ambitious students to reach their full potential and build bright futures.

JOIN TODAY

Trusted by 2200+ Families Globally

Discover a learning solution that aligns with your child's goals and fits your family's lifestyle. We partner with families across the GCC daily to create customised learning plans. Reach out today to start your journey.

Talk to us to learn more

Accelerated Learning - Full-time student
As a full-time CGA student, your child studies 20+ hours per week during regular school hours and has full access to extracurricular activities, clubs, and counselling services.
Learn more

After-School Online
This online program offers small group classes after school, helping students catch up or advance in their studies. Students will also enjoy access to clubs, community activities, and events at CGA.
Learn more

1:1 Private Lessons
Study one-on-one with our experienced teachers, covering the full curriculum of your child's chosen subjects at a pace that suits their needs. Available for students aged 8-18.
Learn more

Contact Us to Find the Best Learning Solution for Your Child

Fill out the form below, and one of our expert team members will get in touch to discuss the best learning options for your child's level and schedule.

Are you a student or a guardian?
First Name
Last Name
Email
Next

How to Get Started

There are four steps to joining CGA with the whole process typically taking 2-3 days.

JOIN NOW

Step 1: Book a Call
During this call, we'll explore your child's academic interests, scheduling needs and suitability for online learning. The session can be conducted either via Zoom or a phone call and typically lasts for 15-30 minutes. We recommend that both students and parents participate in the call to ensure that all your questions are answered.

Step 2: Complete Academic Assessment
Students complete a brief online academic assessment in subjects such as mathematics, reading, and science. This, coupled with a recent school report (if available), helps us to suggest the most suitable classes for your child.

Step 3: Pathway Strategy and Academic Planning
We'll go over the class details, timetable options, and pricing with you.

Step 4: Onboarding
Students must complete onboarding and induction prior to joining. Once completed, we are now ready to welcome you to CGA!

2200+ STUDENTS
A class of diverse, international students and a community of like-minded peers.

60+ Countries
A 24/7 global timetable to suit multiple timezones worldwide.

200+ TEACHERS
Top-tier teachers selected for engagement, inspiration and results.`,
    whatWorks: `**Product Menu for Different Buyer Types (8.2% - BOFU Winner):**
- 3 distinct offerings: Full-time, After-School, 1:1 Private
- Each with clear description and "Learn more" CTA
- Addresses different needs: full curriculum vs. supplemental vs. ultra-custom
- BOFU buyers know they want online learning, but need help choosing format

**Process Transparency (Trust Builder):**
- "4 steps to joining" → removes mystery
- "typically taking 2-3 days" → sets expectation
- Details each step (Book Call → Assessment → Planning → Onboarding)
- 15-30 minute call duration → shows respect for parent time
- GOOGLE BOFU = high intent but need reassurance about "what happens next"

**Geographic Specificity Without Limits:**
- "GCC based families" in headline → targeted
- But also "60+ Countries" and "24/7 global timetable" → shows scale
- Balances local relevance with global credibility
- Not trapped in single-country positioning

**Social Proof Volume Over Prestige:**
- "2200+ Families Globally" leads
- "200+ Teachers" emphasized
- "60+ Countries" for diversity
- No Ivy League mentions, no #5 ranking
- BOFU buyers care more about operational credibility than awards

**Collaborative Language (Not Salesy):**
- "We partner with families" (not "enroll your child")
- "discuss the best learning options" (not "book a consultation")
- "reach out today to start your journey" (invitational)
- Softer, partnership-focused tone vs. META's urgency
- EMEA GOOGLE culture = less aggressive sales language

**No Urgency Tactics:**
- Unlike META EMEA with "ACCEPTING LATE TRANSFERS"
- No scarcity messaging
- Just clear value and process
- GOOGLE BOFU = already decided, don't need pressure`,
    targetAudience: 'GCC families actively searching for online schooling, comparing options',
    tone: 'Collaborative, transparent, service-focused, operationally detailed'
  },

  {
    name: 'UK Pearson Results Blog (GOOGLE MOFU) - $20.11 CPC',
    market: 'EMEA',
    platform: 'GOOGLE',
    stage: 'mofu',
    conversions: 28,
    conversionRate: '4.3%',
    costPerConversion: '$20.11',
    campaign: 'EU_cgahq_2025-05-27_mofu-pearson-results-tier1-perfmax_contact',
    url: 'https://www.crimsonglobalacademy.school/uk/blog/cga-students-outperform-uk-averages-in-2025-pearson-edexcel-gcse-and-a-level-results/',
    fullPageText: `CGA Students Outperform UK Averages in 2025 Pearson Edexcel GCSE and A Level Results

Crimson Global Academy (CGA) is proud to announce our Pearson Edexcel May/June 2025 exam results for both International GCSEs (iGCSEs) and A Levels. Our students have once again delivered exceptional outcomes that surpass benchmarks, proving that online learning with world-class teachers and flexible pathways empowers students to achieve academic excellence.

CGA's Pearson Edexcel iGCSE Results 2025: Outperforming UK Averages

Grade range | % of CGA students | UK average 2025
9-8 (top grades) | 23% | -
9-7 | 39% | 21.8%
9-6 | 56% | -
9-4 | 87% | 67.4%

English Language iGCSE Results
28% achieved grades 9–7, compared to 15.5% in England.
81% secured grades 9–4, compared to 59.7% in England.

Mathematics iGCSE Results
42% achieved grades 9–7, compared to 16.5% in England.
95% achieved grades 9–4, compared to 58.2% in England.

These outcomes demonstrate the strength of CGA's academic delivery, especially in STEM subjects, where students consistently achieve results well above UK benchmarks.

Pearson Edexcel A Level Results 2025: Preparing Students for Top Universities

Grade range | % of CGA students | UK average 2025
A* | 16% | 9.4%
A* - A | 36% | 28.3%
A* - B | 67% | -
A* - E | 98% | 97.5%

Remote Invigilation: Making Pearson Exams Accessible Worldwide

One of the innovations behind CGA's success is remote invigilation, allowing students to sit Pearson Edexcel exams securely online, wherever they are in the world.

This ensures:
- Accessibility – No need to travel to test centres.
- Integrity – Standards match those of in-person exam halls.

Why Crimson Global Academy Students Excel

CGA's consistent exam success can be attributed to three key factors:
- World-class teachers – Subject experts with deep teaching experience.
- Personalised learning pathways – Students can accelerate, choose the learning mode that best suits their goals, and study rigorous international curricula.
- Global peer community – our global community of students from 70+ countries build an international outlook while striving for excellence.

Ready for your child to achieve top GCSE or A Level results?

Speak to an Academic Advisor today or download the UK Prospectus to see how CGA can support your child's path to top universities.

First Name
Last Name
Email
Phone Number
Next`,
    whatWorks: `**Data-Driven Proof Content ($20.11 - LOWEST CPC!):**
- Blog post format, not traditional landing page
- Tables comparing CGA vs. UK averages
- Specific data: 39% vs 21.8% for grades 9-7
- Maths: 95% vs 58.2% for passing grades
- UK parents = data-oriented, skeptical of claims without evidence
- Blog content = lower CPC because it's educational, not salesy

**Addresses Hidden Objection (Remote Invigilation):**
- Parents wonder: "Are online exams legitimate?"
- Entire section on remote invigilation
- "Standards match those of in-person exam halls"
- UK market = strong exam culture, need reassurance about integrity

**Comparative Positioning:**
- Not "we're great" but "we outperform UK averages"
- Every claim has benchmark comparison
- UK families already know UK averages → instant context
- Makes online school results tangible vs. brick-and-mortar

**STEM Performance Emphasis:**
- "especially in STEM subjects"
- Maths results highlighted (95% vs 58.2%)
- UK = STEM career focus, university competition
- Shows CGA not just "flexible" but academically rigorous

**Blog-to-Lead Funnel (MOFU Winner):**
- Educational content attracts searchers looking for "GCSE results", "A Level performance"
- Not searching for CGA specifically → discovery mode
- CTA at bottom: "Speak to an Academic Advisor"
- Low-friction: download prospectus OR speak to advisor
- Blog format = lower intent traffic, but cheaper and scales

**No Hard Selling:**
- Most of page is pure information (exam results, tables, explanations)
- Only 1 form at bottom
- UK GOOGLE MOFU = informational search, need education before conversion
- Content marketing > direct response for this audience`,
    targetAudience: 'UK parents researching online school academic quality, comparing exam results',
    tone: 'Data-driven, transparent, educational, evidence-based'
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
