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
    // EMEA META Examples
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
    },

    // Hong Kong IB Webinar (ASIA, META, MOFU)
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
      notes: `Performance: 24.4% conversion (53 conversions), $16.03 CPC - LOWEST COST!
Campaign: ASIA_cgahq_2025-09-18_hk-ib-webinar_event-online
URL: https://www.crimsonglobalacademy.school/hk-en/campaigns/asia/20251809-ib-webinar-asia/
Region: ASIA (Hong Kong)
Target Audience: Hong Kong families in IB, considering alternatives
Tone: Educational, contrarian, specific`,
      whatWorks: `**Same High-Converting Content as Singapore:**
- Contrarian positioning: "Is the IB Really the Right Fit?"
- Extreme specificity: EE, TOK, CAS components named
- Regional relevance: Hong Kong specifically mentioned
- Authority credibility: Raffles Institution (regional school)
- Educational framing: webinar, not sales

**Why $16.03 CPC is Lowest Cost:**
- Hong Kong market has strong IB questioning sentiment
- High relevance = high click-through and conversion
- Same proven content, different market = efficiency
- Template approach allows market testing`
    },

    // NZ Maths Webinar (ANZ, META, MOFU)
    {
      type: 'landing-page',
      stage: 'mofu',
      market: 'ANZ',
      platform: 'META',
      headline: 'Advanced Maths Pathways for New Zealand Students',
      copy: `Download our highly-watched webinar recording

Advanced Maths Pathways for New Zealand Students

Go beyond the traditional classroom with advanced maths for students aged 7-18

WATCH NOW

What If Your Child's Maths Potential Isn't Being Fully Realised?

Download our highly-watched webinar recording and hear from our Auckland-based School Principal and Christchurch-based Maths Teacher as they share how CGA helps bright Kiwi students thrive in advanced maths.

You'll learn:
• Why learning by ability rather than age gives your child the challenge they need.
• How small class sizes and 1 to 1 lessons provide personalised focus and support.
• How an international curriculum differs from NCEA and offers greater opportunities.

If your child isn't being challenged enough in maths, this webinar is for you. Download now and discover how far their potential can go.

FREE DOWNLOAD

Access Your Free Webinar Recording and Prospectus Now

Complete the form below, and we'll send it straight to your email inbox.`,
      cta: 'Free Download',
      notes: `Performance: 12.61% conversion (4 conversions), $107.19 CPC
Campaign: NZ_cgahq_2025-XX-XX_tier12-cga-maths-webinar-reel-ptc_contact
Region: ANZ (New Zealand)
Target Audience: Parents of gifted/advanced students in maths
Tone: Friendly, local, challenging traditional but not aggressive`,
      whatWorks: `**Local Language & References:**
- "Kiwi students" (New Zealand colloquialism - shows local understanding)
- "Auckland-based Principal", "Christchurch-based Teacher" (major NZ cities)
- "NCEA" curriculum mentioned (NZ national curriculum)
- Speaks in local voice, not generic international

**Question-Based Challenge (Softer than ASIA):**
- "What If Your Child's Maths Potential Isn't Being Fully Realised?"
- Not attacking system, but questioning if child is challenged enough
- Gentler than ASIA's direct IB critique
- Appeals to ambitious parents without being confrontational

**"Ability vs Age" Positioning (Unique to ANZ):**
- "learning by ability rather than age"
- Not mentioned in other markets prominently
- Appeals to gifted/advanced students specifically
- Differentiates from age-based traditional schooling

**Social Proof "Recording":**
- "highly-watched webinar recording"
- Implies popularity without exact numbers
- "On-demand" format = even lower commitment than live webinar
- Can consume at their own pace`
    },

    // AU High School Webinar (ANZ, META, MOFU)
    {
      type: 'landing-page',
      stage: 'mofu',
      market: 'ANZ',
      platform: 'META',
      headline: 'Is Traditional Schooling NOT Working for Your Child?',
      copy: `Is Traditional Schooling NOT Working for Your Child?
See how Australian Families are Thriving with Online Schooling

Over 5000 families worldwide have trusted Crimson Global Academy. We offer flexible online learning with a proven track record of getting students into top universities worldwide, including Ivy League schools. Connect with us at our Q&A to learn how we can help your child thrive.

Register Today!

Wednesday 19th November
Wed, 19 Nov
6.00 PM
6.00 pm AEDT
Online

Why is this webinar for you?

* A Leader in Australian Online Education: We're at the forefront of online high school education in Australia, with a proven track record of helping students gain admission to top universities, including Ivy League schools.

* Flexible & Focused Learning: Our 4-day timetable lets students design their schedules around what's important to them, whether that's training, competitions, or family travel.

* Personalised Learning: Our ability-based approach means your child can accelerate their studies and master subjects without being limited by age.

* Flexible Enrolment Options: We offer a range of options, from after-school classes to full-time enrolment, in both one-on-one and small group formats.

* World-Class Qualifications: Your child can earn globally recognised qualifications, including Cambridge, Pearson, and the US Diploma.

* It's only 30 minutes. What have you got to lose?

Register Now`,
      cta: 'Register Today',
      notes: `Performance: 13.86% conversion (5 conversions), $52.78 CPC
Campaign: AU_cgahq_2025-XX-XX_tier12-cga-high-school-webinar_event
Region: ANZ (Australia)
Target Audience: Australian families frustrated with traditional schooling
Tone: Direct but friendly, casual, flexibility-focused, locally relevant`,
      whatWorks: `**Direct Challenge to Traditional Schooling:**
- "Is Traditional Schooling NOT Working for Your Child?"
- Stronger question than NZ maths page
- Activates parent frustration with current system
- Similar to ASIA contrarian approach but local focus

**"Australian Families" Social Proof:**
- "See how Australian Families are Thriving"
- Localizes the global 5000 families stat
- Makes it relevant: "people like you"
- Not just international, but local success

**Casualization of Commitment:**
- "It's only 30 minutes. What have you got to lose?"
- Removes objection with humor/casualness
- Very Australian communication style
- Makes decision feel low-risk

**Flexibility Focus (ANZ Priority):**
- "4-day timetable" (unique differentiator)
- "training, competitions, or family travel" (specific use cases)
- "after-school to full-time" (range of options)
- Flexibility emphasized more than academic excellence

**Specific Timezone (Local Touch):**
- "6.00 pm AEDT" (Australian Eastern Daylight Time)
- Shows scheduling consideration
- Makes it feel tailored to Aussies
- Not generic global time`
    },

    // Japan University Webinar (Japan, META, MOFU)
    {
      type: 'landing-page',
      stage: 'mofu',
      market: 'Japan',
      platform: 'META',
      headline: '海外・国内大学併願を成功させる秘訣とは',
      copy: `海外・国内大学併願を成功させる秘訣とは
(Secrets to Successfully Applying to Both Overseas and Domestic Universities)

東京大学、UCLといった日英トップ大学に合格した卒業生が登壇！併願を成功させたリアルな体験談をお届けします。
(CGA graduates who were accepted to top UK and Japan universities like University of Tokyo and UCL will speak! Hear their real experiences of successfully applying to both.)

ウェビナーに申し込む (Register for Webinar)
Sunday, November 9, 2025
1:00 AM GMT
オンライン (無料) (Online - Free)

海外も日本も「どちらも諦めない」国際カリキュラムの選び方
(How to Choose an International Curriculum Where You "Don't Give Up on Either" Overseas or Japan)

現在、国際カリキュラムで出願できる日本の大学が増加しています。そのため、どの国に住んでいても、国際カリキュラムを学ぶことで日本・海外どちらの大学も目指すことが可能に。
(Currently, Japanese universities accepting international curriculum applications are increasing. Therefore, no matter which country you live in, by studying an international curriculum you can aim for universities in both Japan and overseas.)

今回のウェビナーでは、東京大学＆UCL、一橋大学＆オックスフォード大学に合格したCGA卒業生2名を迎え、実際にどのように国内外併願を実現したのか、そのプロセスを語っていただきます。
(In this webinar, we welcome 2 CGA graduates who were accepted to University of Tokyo & UCL, and Hitotsubashi University & Oxford University, and they will share the process of how they actually realized applying to both domestic and overseas universities.)

"どちらの進路も諦めない"ためのヒントが見つかるこの機会をお見逃しなく。
(Don't miss this opportunity to find hints for "not giving up on either path.")

スピーカーのご紹介：松田悠介
(Speaker Introduction: Matsuda Yusuke)

* Crimson Global Academy日本代表 / Crimson Education Japan代表取締役社長
  (CGA Japan Representative / Crimson Education Japan CEO)
* ハーバード大学教育大学院（修士）を修了 (Harvard Graduate School of Education - Master's)
* スタンフォードビジネススクール（修士）修了 (Stanford Business School - Master's)
* 認定NPO法人 Teach For Japan 創立者・元理事 (Certified NPO Teach For Japan Founder & Former Director)`,
      cta: 'ウェビナーに申し込む (Register for Webinar)',
      notes: `Performance: 11.2% conversion, $37.62 CPC
Campaign: ASIA_cgahq_2025-XX-XX_jp-university-webinar_event-online
Region: Japan
Target Audience: Japanese families considering international curriculum
Tone: Reassuring, respectful of local options, both/and philosophy, process-focused`,
      whatWorks: `**"Both/And" Philosophy (Cultural Fit):**
- "どちらも諦めない" = "Don't give up on either"
- Japanese families fear closing doors → this keeps both open
- Reduces perceived risk of international curriculum
- Not rejecting Japanese system, but expanding options

**Specific University Pairings (Proof of Possibility):**
- Tokyo University (東京大学) + UCL = Japan #1 + UK top tier
- Hitotsubashi (一橋大学) + Oxford = prestigious Japanese + global elite
- Shows it's actually achievable, not theoretical
- Addresses skepticism: "Can you really do both?"

**Graduate Testimonials (Authentic Proof):**
- Real CGA graduates as speakers
- 対談 format (dialogue/conversation) = authentic, not sales pitch
- "Real experiences" (実体験) emphasized
- Japanese value authentic testimonials over marketing claims

**Authority with Deep Local Credentials:**
- Matsuda Yusuke: Not just international degrees (Harvard, Stanford)
- Founded major Japanese NPOs (Teach For Japan, Learning for All)
- Government role: Ministry of Education committee member
- Media validation: NHK, Nikkei, Asahi (Japan's most respected media)
- Bridges international + local credibility`
    },

    // EMEA GOOGLE Examples

    // UAE Main Landing Page (EMEA, GOOGLE, MOFU)
    {
      type: 'landing-page',
      stage: 'mofu',
      market: 'EMEA',
      platform: 'GOOGLE',
      headline: 'THE UAE\'S LEADING ONLINE SCHOOL',
      copy: `Fully REGISTERED, Award-Winning online school

THE UAE'S LEADING ONLINE SCHOOL

CGA is a world-class private high school — without the campus. Trusted by families across the UAE, we provide personalised, flexible online education for students aged 7-18, led by expert teachers and backed by internationally recognised qualifications.

Give your child access to a truly global learning experience, designed to fit your family's lifestyle, wherever you are.

START YOUR CHILD'S JOURNEY

[SCROLLING BANNER]
transfers open. speak to our admissions team NOW

Why Families from the UAE Choose CGA

✓ Accredited, Award-Winning Online School
CGA is accredited by WASC, Pearson Edexcel, Cambridge, AP CollegeBoard, COBIS and NCAA. We are ranked #5 by NICHE and Top 100 Private Schools in the World by Spears School Index 2025.

✓ 161+ University Offers
This year alone, our students received offers from Oxford, Cambridge, King's College London, Princeton, Harvard, Columbia and many more.

✓ Flexibility without Compromising Quality
Students can access CGA from anywhere in the UAE, or even when you travel. Learn in small live group classes (average 10 - 12 students) or via 1:1 instruction with an experienced, qualified teacher.

✓ Highest Marks in the World
CGA students have won 18 x titles for the Highest Marks in World, Country, or Region in their Pearson Edexcel IGCSE & A Level exams.

Is Online Schooling Legal in the UAE?

As an internationally accredited online school, Crimson Global Academy (CGA) allows families to personalise their child's education without registering as homeschoolers. Many UAE families choose CGA for its flexibility, global recognition, and high academic standards.`,
      cta: 'Start Your Child\'s Journey',
      notes: `Performance: 6.0% conversion (85 conversions), $60.82 CPC
Campaign: AE_cgahq_2021-04-14_search_AE-online-high-school-broad-content-target-cpa_lead
Keywords: "online school UAE", "online high school Dubai", "international school online UAE"
Region: EMEA (UAE)
Target Audience: UAE families actively searching for online school options
Tone: Confident, credible, factual, structured`,
      whatWorks: `**Direct Value Proposition Headline:**
- Not a question like META ("Is Your Child's School...")
- Declaration: "THE UAE'S LEADING ONLINE SCHOOL"
- Matches search intent immediately
- No curiosity gap needed - they're already interested

**Trust Signals Upfront (First Screen):**
- "Fully REGISTERED, Award-Winning" in header
- Accreditations listed immediately (WASC, Pearson, Cambridge, AP, COBIS, NCAA)
- Rankings front and center (#5 NICHE, Top 100 World)
- For GOOGLE users comparing options, this is critical

**Structured, Scannable Format:**
- Bullet points with checkmarks ✓
- Clear benefit headers
- Easy to compare vs competitors
- GOOGLE users are comparing, make it easy

**Objection Handling Proactively:**
- "Is Online Schooling Legal in the UAE?" section
- Addresses common GOOGLE search query directly
- Shows understanding of UAE context

**Shorter Overall Copy:**
- ~60% shorter than META pages
- High-intent users don't need full education
- Just proof points and differentiation`
    },

    // Enrol for 2025 (EMEA, GOOGLE, BOFU)
    {
      type: 'landing-page',
      stage: 'bofu',
      market: 'EMEA',
      platform: 'GOOGLE',
      headline: 'Join NOW For 2025: Tailored Online Learning from Anywhere',
      copy: `Join NOW For 2025: Tailored Online Learning from Anywhere

Experience a world-class education tailored to your family's needs. At Crimson Global Academy (CGA), we provide GCC based families with high-quality, online learning designed to empower ambitious students to reach their full potential and build bright futures.

JOIN TODAY

Trusted by 2200+ Families Globally

[THREE LEARNING OPTIONS]

Full-time student*
As a full-time CGA student, your child studies 20+ hours per week during regular school hours and has full access to extracurricular activities, clubs, and counselling services.
Learn more

After-School Online
This online program offers small group classes after school, helping students catch up or advance in their studies. Students will also enjoy access to clubs, community activities, and events at CGA.
Learn more

1:1 Private Lessons
Study one-on-one with our experienced teachers, covering the full curriculum of your child's chosen subjects at a pace that suits their needs. Available for students aged 8-18.
Learn more

How to Get Started

There are four steps to joining CGA with the whole process typically taking 2-3 days.

JOIN NOW

Step 1: Book a Call (15-30 minutes)
Step 2: Complete Academic Assessment
Step 3: Pathway Strategy and Academic Planning
Step 4: Onboarding

2200+ STUDENTS
60+ Countries
200+ TEACHERS`,
      cta: 'Join Today',
      notes: `Performance: 8.2% conversion (51 conversions), $37.02 CPC - HIGHEST GOOGLE CONVERSION!
Campaign: AE_cgahq_2024-09-30_search-gcc-cga-brand-anz-lp_contact
Keywords: "enrol online school 2025", "join CGA", "online school enrollment UAE"
Region: EMEA (UAE)
Target Audience: GCC families ready to enroll for 2025
Tone: Clear, helpful, process-oriented, specific`,
      whatWorks: `**Time-Specific Urgency:**
- "Join NOW For 2025" in headline
- Matches search intent if searching "enrol 2025"
- Creates deadline without being pushy

**Clear Choice Architecture:**
- Three distinct options: Full-time, After-school, 1:1
- Helps user self-select
- Removes "is this for me?" question

**Removes Friction with Process Clarity:**
- "4 steps... typically taking 2-3 days"
- Sets expectations
- Makes it feel easy and fast

**Specific Timelines:**
- "15-30 minutes" for call
- "2-3 days" for process
- Reduces uncertainty

**GCC-Specific:**
- "GCC based families" (Gulf Cooperation Council)
- Regional specificity builds relevance
- Shows understanding of market

**Multiple CTAs with Different Commitment Levels:**
- "JOIN TODAY" (high commitment)
- "Talk to us to learn more" (medium)
- "Learn more" buttons (low)
- Catches users at different readiness levels`
    },

    // Pearson Results Blog (EMEA, GOOGLE, MOFU)
    {
      type: 'landing-page',
      stage: 'mofu',
      market: 'EMEA',
      platform: 'GOOGLE',
      headline: 'CGA Students Outperform UK Averages in 2025 Pearson Edexcel Results',
      copy: `CGA Students Outperform UK Averages in 2025 Pearson Edexcel GCSE and A Level Results

18/09/2025
16 minute read
Academic Success

Crimson Global Academy (CGA) is proud to announce our Pearson Edexcel May/June 2025 exam results for both International GCSEs (iGCSEs) and A Levels. Our students have once again delivered exceptional outcomes that surpass benchmarks, proving that online learning with world-class teachers and flexible pathways empowers students to achieve academic excellence.

CGA's Pearson Edexcel iGCSE Results 2025: Outperforming UK Averages

[DATA TABLE]
Grade range | % of CGA students | UK average 2025
9-8 | 23% | -
9-7 | 39% | 21.8%
9-4 | 87% | 67.4%

English Language iGCSE Results
- 13% achieved grades 9–8
- 28% achieved grades 9–7, compared to 15.5% in England
- 81% secured grades 9–4, compared to 59.7% in England

Mathematics iGCSE Results
- 33% achieved grades 9–8
- 42% achieved grades 9–7, compared to 16.5% in England
- 95% achieved grades 9–4, compared to 58.2% in England

Why Crimson Global Academy Students Excel

CGA's consistent exam success can be attributed to three key factors:
1. World-class teachers – Subject experts with deep teaching experience
2. Personalised learning pathways – Students can accelerate and choose learning mode
3. Global peer community – from 70+ countries

Ready for your child to achieve top GCSE or A Level results?

Speak to an Academic Advisor today or download the UK Prospectus to see how CGA can support your child's path to top universities.`,
      cta: 'Speak to an Academic Advisor',
      notes: `Performance: 4.3% conversion (28 conversions), $20.11 CPC - LOWEST COST!
Campaign: EU_cgahq_2025-05-27_mofu-pearson-results-tier1-perfmax_contact
Keywords: "GCSE results 2025", "A-level results UK", "Pearson Edexcel results", "online school exam results"
Region: EMEA (UK focus)
Target Audience: Families researching schools based on exam results
Tone: Educational, data-driven, transparent, newsworthy`,
      whatWorks: `**Content Marketing Strategy:**
- Not a landing page - it's a blog post that ranks organically
- Newsworthy: "2025 exam results announced"
- Specific, data-driven, SEO-friendly

**High Search Intent Keywords:**
- People searching "GCSE results 2025" are researching schools
- High-intent education shoppers
- Already in consideration phase

**Data Proves Quality:**
- Tables comparing CGA vs UK average
- Specific percentages (87% vs 67.4%)
- Objective proof, not marketing claims

**Educational Content, Not Sales:**
- 16-minute read
- Detailed analysis
- Builds trust through transparency

**Soft CTA (Not Pushy):**
- CTA at very end after full content
- "Ready for your child to achieve..." conditional
- Offers advisor talk OR prospectus (options)

**Organic + Paid Traffic:**
- Ranks organically for result-related searches
- Also promoted via PPC (PerformanceMax campaign)
- Dual traffic source = efficiency`
    },

    // ASIA GOOGLE Examples

    // Vietnam Online School (ASIA, GOOGLE, MOFU)
    {
      type: 'landing-page',
      stage: 'mofu',
      market: 'ASIA',
      platform: 'GOOGLE',
      headline: 'Trường học trực tuyến hàng đầu dành cho học sinh châu Á',
      copy: `Trường học trực tuyến hàng đầu dành cho học sinh châu Á
(Leading online school for Asian students)

Được xếp hạng Top 5 trường trực tuyến tốt nhất tại Mỹ, CGA tự hào với đội ngũ giáo viên trên 15 năm kinh nghiệm, giúp học sinh trúng tuyển vào các đại học danh tiếng như Princeton, Columbia, Stanford và Oxbridge.
(Ranked Top 5 online schools in America, CGA is proud of its teaching staff with over 15 years of experience, helping students gain admission to prestigious universities like Princeton, Columbia, Stanford and Oxbridge.)

Download file giới thiệu về CGA để hiểu vì sao CGA là lựa chọn hàng đầu cho các gia đình châu Á.
(Download CGA's introduction to understand why CGA is the top choice for Asian families.)

Tải xuống miễn phí (Free Download)

[SCROLLING BANNER]
Mở kỳ tuyển sinh mùa Xuân Tháng 2 - 2026
(Spring enrollment opening February 2026)

Đăng ký ngay (Register Now)

2000+ Học Sinh (Students)
70+ Quốc Gia (Countries)
250+ Giáo Viên (Teachers)

Chương trình học trực tuyến được cá nhân hóa
(Personalized online learning program)

Crimson Global Academy (CGA) là trường quốc tế trực tuyến dành cho học sinh từ 7-18 tuổi, với phương pháp giáo dục độc đáo. Chúng tôi tin rằng học tập không phải là một khuôn mẫu chung cho tất cả, mỗi học sinh cần một môi trường học tập phù hợp với mục tiêu và thế mạnh của mình, mà vẫn đảm bảo chất lượng giáo dục.
(CGA is an international online school for students 7-18 with a unique educational method. We believe learning is not one-size-fits-all, each student needs a learning environment suited to their goals and strengths, while ensuring educational quality.)

[5 CURRICULUM OPTIONS]
- Pre-IGCSE (10-14 tuổi)
- IGCSE (14-16 tuổi)
- A-Levels (16-18 tuổi)
- Advanced Placement / AP (14+ tuổi)
- Tú tài Mỹ / US Diploma (13-18 tuổi)`,
      cta: 'Tải xuống miễn phí (Free Download)',
      notes: `Performance: 7.0% conversion (118 conversions), $9.10 CPC - LOWEST COST OVERALL!
Campaign: ASIA_cgahq_2025-05-21_search-vn_school-types_contact
Keywords: "trường học trực tuyến việt nam", "online school Vietnam", "international school online"
Region: ASIA (Vietnam)
Target Audience: Vietnamese families searching for online school options
Tone: Prestige-focused, detailed, local language, personalized`,
      whatWorks: `**Local Language = Trust + SEO:**
- Entire page in Vietnamese
- Shows commitment to local market
- Ranks for Vietnamese search terms
- Not just English with Vietnamese translation

**Rankings + University Prestige (Still Important in ASIA):**
- "Top 5 trường trực tuyến tốt nhất tại Mỹ" (Top 5 in America)
- Princeton, Columbia, Stanford, Oxbridge mentioned immediately
- ASIA GOOGLE still emphasizes prestige (unlike EMEA GOOGLE which emphasizes process)

**Enrollment Urgency Banner:**
- Scrolling banner like META
- But enrollment-focused, not "late transfers"
- "Spring enrollment February 2026" creates deadline

**Curriculum Detail (More than EMEA GOOGLE):**
- Lists all 5 programs with age ranges
- IGCSE, A-Levels, AP, US Diploma
- Asian families want curriculum specifics upfront

**"Personalized" Emphasized:**
- "được cá nhân hóa" (personalized)
- "không phải là một khuôn mẫu chung" (not one-size-fits-all)
- Addresses Vietnamese education system pain point

**Why $9.10 CPC is SO Low:**
- Vietnamese search volume lower than English
- Less competition for Vietnamese keywords
- Local language page ranks organically
- High intent (searching in Vietnamese = serious consideration)`
    },

    // ANZ GOOGLE Examples

    // NZ What is CGA (ANZ, GOOGLE, BOFU)
    {
      type: 'landing-page',
      stage: 'bofu',
      market: 'ANZ',
      platform: 'GOOGLE',
      headline: 'New Zealand\'s Leading Online Private School',
      copy: `For students aged 6-18

New Zealand's Leading Online Private School

Join over 750 Kiwi families who have trusted Crimson Global Academy to provide a world-class education from anywhere.

START YOUR CGA JOURNEY

The CGA Difference
* International Curriculum: (IGCSE, A-Levels, US Diploma), recognised by top universities worldwide.
* Accelerated Learning: Progress by ability, not age, allowing students to accelerate and achieve their full potential faster.
* Outstanding results securing admission to top global and NZ universities and worldwide opportunities.
* Global Community: Gain international exposure from expert teachers and diverse peers, all from the comfort of home.

Flexible Options
Choose an enrolment option that suits your child's academic goals, and your family's schedule. Enrol as a full-time, part-time, hybrid or student, or simply study a single subject or join our after-school classes.

Speak to An Advisor Today

Full-time student
As a full-time student at CGA, the school is your primary education provider. Your child studies during regular school hours, which includes 20+ hours of classes per week. They get full access to extracurricular activities, clubs, and wider counselling services.

Part-time & After-school
After-school classes for students in existing schools. Accelerate learning or take additional subjects. Choose evening group classes, or flexible 1-on-1 sessions that suit your schedule, including weekends.

Hybrid
Use online classes to add structure, expert teaching, and a collaborative student community to your existing homeschool schedule. Or Auckland Families have the option of attending our Physical School, Crimson Age.

Download our Prospectus

Experience the CGA difference for yourself with a live online trial class

Try a Class`,
      cta: 'Try a Class',
      notes: `Performance: 4.26% conversion (57 conversions), $57.15 CPC
Campaign: NZ_cgahq_2023-09-26_branded_contact
Keywords: "what is CGA", "Crimson Global Academy NZ", "CGA online school"
Region: ANZ (New Zealand)
Target Audience: Families researching CGA specifically (branded search)
Tone: Friendly, local, choice-focused, low-pressure`,
      whatWorks: `**Local Social Proof First:**
- "750 Kiwi families" (not global 2000+)
- Local > global for ANZ GOOGLE
- Makes it feel relevant, not distant

**Clear Choice Architecture:**
- Full-time, Part-time, Hybrid explained
- Helps user self-select quickly
- Removes "is this for me?" friction

**"Try a Class" CTA (Very Low Friction):**
- Lowest commitment possible
- "Experience for yourself" = no risk
- Perfect for branded search (already interested)

**Physical Option Mentioned:**
- "Auckland Families: Crimson Age school"
- Shows local presence
- Not just remote international company

**"Ability not Age" Positioning:**
- Mentioned in both NZ pages
- Unique ANZ differentiator for GOOGLE
- Appeals to gifted/advanced students`
    },

    // NZ Primary Program (ANZ, GOOGLE, MOFU)
    {
      type: 'landing-page',
      stage: 'mofu',
      market: 'ANZ',
      platform: 'GOOGLE',
      headline: 'PRIMARY: Online Classes, Personalised Learning',
      copy: `PRIMARY: Online Classes, Personalised Learning

Benefit from flexible online classes led by a registered teacher for primary students aged 6–12.

[SCROLLING BANNER]
Online Group Classes (6-8) Launching 2026!
express your interest today

Why join our CGA Online Primary School:
* Personalised Education
* Registered Teachers (not learning assistants!)
* Real-Time Progress Monitoring
* Distraction-Free Accelerated Learning

[Q&A Webinar Info]
Primary Information Session
Thursday 20th November, 6.00 pm NZST

Frequently Asked Questions:
- How involved do parents need to be?
- How can classes work with my child's schedule?
- How do teachers keep students engaged?
- When can my child start?
- What is a PEC?`,
      cta: 'Express Your Interest',
      notes: `Performance: 6.97% conversion (32 conversions), $141.00 CPC
Campaign: NZ_cgahq_2024-06-13_search_primary-school-consult_contact
Keywords: "online primary school NZ", "primary homeschool NZ", "registered teacher online NZ"
Region: ANZ (New Zealand)
Target Audience: NZ families looking for online primary education
Tone: Reassuring, detailed, parent-focused`,
      whatWorks: `**"Registered Teacher" Emphasized:**
- NZ regulatory concern
- "not a learning assistant, ensuring premium teaching"
- Legal/quality assurance focus

**Upcoming Group Classes Banner:**
- Creates urgency: "Launching 2026"
- "Express interest today" = early access feel
- Generates leads before product fully ready

**Parent Involvement FAQ:**
- Primary school parents worry about involvement
- Addresses directly in FAQ
- Removes objection proactively

**Webinar as Mid-Funnel:**
- Q&A session for exploration
- Lower commitment than consultation
- Perfect for primary (newer, more questions)`
    }
  ];

  const addExamples = async () => {
    setAdding(true);
    setStatus('Adding examples...');

    try {
      // Use correct Firebase path: brandInstructions/{brandId}
      const brandDocRef = doc(db, 'brandInstructions', brandId);
      const brandDoc = await getDoc(brandDocRef);

      if (!brandDoc.exists()) {
        throw new Error('Brand instructions not found. Please save your brand instructions first.');
      }

      const instructions = brandDoc.data();
      const currentExamples = instructions.landingPageInstructions?.examples || [];

      // Prevent adding duplicates
      if (currentExamples.length >= 14) {
        setStatus('⚠️ Examples already added. No changes made.');
        setTimeout(() => setAdding(false), 2000);
        return;
      }

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
          🚀 Quick Setup: Populate Knowledge Base Below
        </h3>
        <p className="text-sm text-[#9b9b9b] mb-3">
          Click the button below to add 14 high-performing landing page examples to the organized knowledge base. They'll appear in the Platform → Market grid below, ready for the AI to learn from:
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm text-[#4b0f0d] mb-4">
          <div>
            <strong>META Examples:</strong>
            <ul className="space-y-1 mt-1">
              <li>• EMEA: UAE Global Brand (5.8% conv), UAE Traveling Family (1.6%)</li>
              <li>• ASIA: Singapore IB (<strong>24.6%</strong>), Hong Kong IB (24.4%, $16.03)</li>
              <li>• ANZ: NZ Maths (12.61%), AU High School (13.86%)</li>
              <li>• Japan: University Webinar (11.2%)</li>
            </ul>
          </div>
          <div>
            <strong>GOOGLE Examples:</strong>
            <ul className="space-y-1 mt-1">
              <li>• EMEA: UAE Main (6.0%), Enrol 2025 (<strong>8.2%</strong>), Pearson Blog ($20.11)</li>
              <li>• ASIA: Vietnam (<strong>$9.10 CPC</strong>)</li>
              <li>• ANZ: NZ Switching (<strong>15.75%</strong>), NZ What is CGA (4.26%), NZ Primary (6.97%)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <button
          onClick={addExamples}
          disabled={adding}
          className="px-6 py-3 bg-[#780817] text-white font-semibold rounded-md hover:bg-[#4b0f0d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? 'Adding Examples...' : '✨ Add All Examples Now'}
        </button>

        {!adding && !status && (
          <div className="mt-4 flex flex-col items-center text-[#9b9b9b]">
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-xs mt-1">Examples will appear in the Knowledge Base below</span>
          </div>
        )}

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
    </div>
  );
};

export default AddExamplesButton;
