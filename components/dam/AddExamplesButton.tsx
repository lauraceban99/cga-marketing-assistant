import React, { useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import type { CampaignExample } from '../../types';

interface AddExamplesButtonProps {
  brandId: string;
  onComplete: () => void;
}

const AddExamplesButton: React.FC<AddExamplesButtonProps> = ({ brandId, onComplete }) => {
  const [adding, setAdding] = useState(false);
  const [status, setStatus] = useState('');

  const landingPageExamples: CampaignExample[] = [
    {
      type: 'landing-page',
      stage: 'bofu',
      market: 'EMEA',
      platform: 'META',
      headline: 'Is Your Child\'s School Limiting Their Potential?',
      copy: `ACCEPTING LATE TRANSFERS NOW - START NEXT TERM!
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
Students launch global clubs, step into student leadership roles, and enjoy a range of extracurriculars.

Meet CGA's Future Leaders
Future Entrepreneur: Mia, Aspiring Musician: Konoka, Future Astronaut: Robert, Riding Champion: Hattie, Tech Innovator: Henry

CGA: The Launchpad for your Ambitions

Your child's ambition deserves more than ordinary schooling. Let their dreams take flight.

Speak to An Advisor`,
      cta: 'Speak to An Advisor',
      notes: `Performance: 5.80% conversion (14 conversions), $60.70 CPC
Campaign: AE_cgahq_2025-07-30_global-brand-campaign-ptc_contact
URL: https://www.crimsonglobalacademy.school/ae-en/campaigns/global-brand-campaign-fy26-enrollments-bofu-lp/
Region: EMEA (UAE)
Target Audience: Parents dissatisfied with current school, seeking immediate change
Tone: Urgent but supportive, aspirational, parent-focused`,
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
- Repeated at natural decision points (after value prop, after social proof, after student stories, final push)`
    },

    {
      type: 'landing-page',
      stage: 'mofu',
      market: 'EMEA',
      platform: 'META',
      headline: 'THE online school THAT MOVES WITH YOUR FAMILY',
      copy: `THE online school THAT MOVES WITH YOUR FAMILY

Need a flexible, high-quality education wherever you travel? Our online learning environment erases traditional boundaries, empowering you to take your education with you!

DOWNLOAD OUR PROSPECTUS

Top-Rated High School For World-Travellers

Wondering how to maintain your child's education while on the go? Crimson Global Academy offers the perfect solution for travelling families.

From Primary to High School, learn how we can help families who want to travel long-term or be on the go.

* Discover how Crimson Global Academy ensures our students can stay on top or even get ahead with their education amid a mobile lifestyle!
* Learn about our experienced faculty and their commitment to providing a world-class education that prepares students for top universities.

At CGA, we are committed to helping your child achieve their academic dreams.

Get Your Free Prospectus

"The adaptability and comprehension that CGA has with knowing what our lifestyle is and being willing to work with us throughout those challenges because sometimes we are in different time zones. And so CGA has been very understanding when it comes to that and it's been super helpful for our girls."
- CGA Parent, Chantal

FREQUENTLY ASKED QUESTIONS
- How does CGA accommodate students who travel frequently?
- What happens if we're in a location with limited internet access?
- How can my child stay connected with teachers and peers?

2000 STUDENTS studying with CGA worldwide
200+ TEACHERS Delivering live group and 1:1 classes
87% STUDENTS scored a 3+ on their AP exams as of this year`,
      cta: 'Download Our Prospectus',
      notes: `Performance: 1.6% conversion (4 conversions), $84.26 CPC
Campaign: AE_cgahq_2025-10-14_tier12-cga-traveling-family-reel-ptc_contact
URL: https://www.crimsonglobalacademy.school/ae-en/campaigns/traveling-family-ptc/
Region: EMEA (UAE)
Target Audience: Digital nomad families, frequent travelers, expat families
Tone: Understanding, supportive, solution-focused (not urgent)`,
      whatWorks: `**Niche Positioning:**
- Addresses one specific pain point: education while traveling
- Not trying to appeal to everyone → clear audience
- Headline directly speaks to their situation: "MOVES WITH YOUR FAMILY"

**Benefit-Focused Headline:**
- "erases traditional boundaries" → freedom framing
- "empowering you to take your education with you" → control/autonomy
- Emotionally resonant for families who value flexibility

**Objection Handling:**
- FAQ section addresses specific concerns (limited internet, time zones, connection)
- Parent testimonial mentions time zones → proves it works
- Anticipates and resolves doubts before they arise

**CTA Strategy:**
- Lead magnet: "Download Prospectus" (lower commitment than consultation)
- MOFU appropriate: education phase, not ready to buy yet
- Repeats CTA after value explanation

**Social Proof:**
- Testimonial from named parent (Chantal) with specific detail (time zones, daughters)
- Stats relevant to this audience (2000 students worldwide, 200+ teachers)
- Proof of quality: 87% AP success`
    },

    {
      type: 'landing-page',
      stage: 'mofu',
      market: 'ASIA',
      platform: 'META',
      headline: 'Is the IB Really the Right Fit for Your Child\'s Path to Top Universities?',
      copy: `Is the IB Really the Right Fit for Your Child's Path to Top Universities?

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

MEET YOUR EXPERT SPEAKER

Lyn Han
🎓 Senior US Strategy Consultant, Crimson Education
🎓 Graduate of the University of Chicago (Political Science)
🎓 Public Service Scholarship recipient and Raffles Institution alumna
🎓 Former University of Chicago alumni interviewer and admissions office staff
🌟 Her students have gained admission to Stanford, Princeton, UPenn, Cornell, Oxford, and more`,
      cta: 'Register Now',
      notes: `Performance: 24.6% conversion (58 conversions), $17.24 CPC - HIGHEST CONVERSION!
Campaign: ASIA_cgahq_2025-09-18_sg-ib-webinar_event-online
URL: https://www.crimsonglobalacademy.school/sg/campaigns/asia/20251809-ib-webinar-asia/
Region: ASIA (Singapore)
Target Audience: Asian families currently in IB, questioning curriculum choice
Tone: Educational, contrarian, empowering, specific`,
      whatWorks: `**Contrarian Positioning (24.6% - EXCEPTIONAL!):**
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
- Clear date/time → creates commitment

**Educational Approach:**
- Promises "truth" and "discover" → educational framing
- Not selling product, selling knowledge
- "This webinar will help you decide" → empowers parents
- MOFU perfect: considering options, not ready to buy`
    },

    {
      type: 'landing-page',
      stage: 'bofu',
      market: 'ANZ',
      platform: 'GOOGLE',
      headline: 'New Zealand\'s Leading Online Learning Program',
      copy: `New Zealand's Leading Online Learning Program

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

Meet some our Students: Kiani, Emma, Max, Jade`,
      cta: 'Download our Prospectus',
      notes: `Performance: 15.75% conversion (81 conversions), $49.63 CPC - HIGHEST OVERALL!
Campaign: NZ_cgahq_2024-01-22_search_switching-schools-consult_contact
URL: https://www.crimsonglobalacademy.school/nz/switching-schools/
Region: ANZ (New Zealand)
Traffic: GOOGLE Search
Keywords likely: "switching schools NZ", "change high school", "transfer schools New Zealand"
Target Audience: NZ families actively searching to switch schools
Tone: Simple, humble, benefit-focused, locally grounded`,
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
- No need to create problem awareness`
    }
  ];

  const addExamples = async () => {
    setAdding(true);
    setStatus('Adding examples...');

    try {
      const brandDocRef = doc(db, 'brands', brandId, 'instructions', 'main');
      const brandDoc = await getDoc(brandDocRef);

      if (!brandDoc.exists()) {
        throw new Error('Brand instructions not found');
      }

      const instructions = brandDoc.data();
      const currentExamples = instructions.landingPageInstructions?.examples || [];

      // Add new examples
      const updatedExamples = [...currentExamples, ...landingPageExamples];

      await updateDoc(brandDocRef, {
        'landingPageInstructions.examples': updatedExamples
      });

      setStatus(`✅ Success! Added ${landingPageExamples.length} landing page examples.`);

      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Error adding examples:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#4b0f0d] mb-2">
          🚀 Quick Setup: Add High-Performing Examples
        </h3>
        <p className="text-sm text-[#9b9b9b] mb-3">
          Add 4 proven landing page examples from real campaigns with performance data:
        </p>
        <ul className="text-sm text-[#4b0f0d] space-y-1 mb-4">
          <li>• UAE Global Brand (META) - 5.8% conversion, BOFU</li>
          <li>• UAE Traveling Family (META) - 1.6% conversion, MOFU</li>
          <li>• Singapore IB Webinar (META) - <strong>24.6% conversion</strong>, MOFU</li>
          <li>• NZ Switching Schools (GOOGLE) - <strong>15.75% conversion</strong>, BOFU</li>
        </ul>
      </div>

      <button
        onClick={addExamples}
        disabled={adding}
        className="px-6 py-3 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {adding ? 'Adding Examples...' : '✨ Add All Examples Now'}
      </button>

      {status && (
        <div className={`mt-4 p-3 rounded-md ${
          status.includes('✅') ? 'bg-green-50 text-green-700' :
          status.includes('❌') ? 'bg-red-50 text-red-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default AddExamplesButton;
