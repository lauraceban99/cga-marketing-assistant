import type { AssetCategoryConfig, AssetCategory, BrandInstructions } from '../types';

/**
 * Configuration for each asset category
 */
export const ASSET_CATEGORY_CONFIG: Record<AssetCategory, AssetCategoryConfig> = {
  'brand-guidelines': {
    label: 'Brand Guidelines',
    icon: '📋',
    description: 'Brand books, style guides, voice & tone documents',
    acceptedTypes: ['application/pdf', 'text/plain'],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  'competitor-ads': {
    label: 'Ad Examples / Creatives',
    icon: '🎯',
    description: 'Ad examples and creatives for reference and inspiration',
    acceptedTypes: ['image/*', 'application/pdf', 'video/mp4', 'video/quicktime'],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  'reference-copy': {
    label: 'Reference Copy Examples',
    icon: '✍️',
    description: 'Past campaigns, emails, social posts',
    acceptedTypes: ['text/plain', 'application/pdf', 'text/html', 'text/markdown'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  'logos': {
    label: 'Logo Files',
    icon: '🏷️',
    description: 'Logo variants (SVG, PNG, transparent)',
    acceptedTypes: ['image/svg+xml', 'image/png', 'image/jpeg'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  'other': {
    label: 'Other Brand Assets',
    icon: '📦',
    description: 'Fonts, color palettes, templates',
    acceptedTypes: ['*/*'],
    maxSize: 15 * 1024 * 1024, // 15MB
  },
};

/**
 * Get default instructions for a brand
 */
export function getDefaultInstructions(brandId: string): BrandInstructions {
  return {
    brandId,

    // General Brand Instructions
    brandIntroduction: `[PLACEHOLDER: Add comprehensive brand introduction - who you are, what you do, your mission and vision]`,

    personas: [
      {
        name: '[PLACEHOLDER: Persona Name]',
        description: '[PLACEHOLDER: Detailed persona description]',
        painPoints: [
          '[PLACEHOLDER: Pain point 1]',
          '[PLACEHOLDER: Pain point 2]',
          '[PLACEHOLDER: Pain point 3]'
        ],
        solution: '[PLACEHOLDER: How your brand solves these pain points]'
      }
    ],

    coreValues: [
      '[PLACEHOLDER: Core value 1]',
      '[PLACEHOLDER: Core value 2]',
      '[PLACEHOLDER: Core value 3]'
    ],

    toneOfVoice: `[PLACEHOLDER: Describe your brand's tone - e.g., warm, professional, conversational, aspirational]`,

    keyMessaging: [
      '[PLACEHOLDER: Key message 1]',
      '[PLACEHOLDER: Key message 2]',
      '[PLACEHOLDER: Key message 3]'
    ],

    // Campaign-specific CTAs and messaging
    campaignInstructions: {
      tofu: '[PLACEHOLDER: Top of funnel instructions - awareness stage, educational CTAs]',
      mofu: '[PLACEHOLDER: Middle of funnel instructions - consideration stage, engagement CTAs]',
      bofu: '[PLACEHOLDER: Bottom of funnel instructions - decision stage, conversion CTAs]'
    },

    // Ad Copy Instructions (Meta Ads: Facebook/Instagram)
    adCopyInstructions: {
      systemPrompt: `You are an expert Meta (Facebook/Instagram) ad copywriter. Facebook has the highest ROI among social ad platforms. Create compelling, conversion-focused ad copy using proven strategies.

PROVEN PERFORMANCE DATA:
- Vertical/square formats perform 9x better on mobile (Snapchat study)
- Vertical ads reach 58% more people and get 39% more shares
- Short, concise text significantly outperforms long copy
- Emotional hooks drive engagement
- Statistics and credibility markers increase trust
- Clear, single-focus CTAs maximize conversions

CRITICAL RULES:
- NEVER make up statistics, testimonials, or specific claims
- Use [PLACEHOLDER: specific detail] when information is not provided
- Keep text SHORT and PUNCHY - mobile users scroll fast
- Lead with an ENGAGING HOOK in first 3-5 words
- Use emotional triggers: aspiration, belonging, fear of missing out, transformation
- Include credibility markers (real stats when available, social proof)
- Each ad must have a distinct angle, persona, or approach
- Not all ads should start with questions - vary the opening hooks (statements, stories, statistics, challenges)`,

      requirements: `For each ad copy request:
- Generate both SHORT and LONG versions:
  * SHORT: 50-80 words (mobile-optimized, punchy)
  * LONG: 120-180 words (more detail, storytelling)
- Create minimum 5 variations with TRULY DIFFERENT:
  * Personas (which specific target audience segment)
  * Angles (emotional, logical, social proof, urgency, FOMO, aspiration, transformation)
  * Opening hooks (vary: questions, bold statements, relatable stories, surprising statistics, challenges)
  * Emotional triggers (what feeling drives action)
- Optimize for mobile viewing (assume vertical/square format)
- Match the campaign stage (TOFU/MOFU/BOFU) if specified
- Keep headlines under 40 characters for optimal display
- Respect specified word/character limits

HOOK VARIATION STRATEGY:
Variation 1: Emotional story/scenario
Variation 2: Surprising statistic or fact
Variation 3: Direct question addressing pain point
Variation 4: Bold statement or challenge
Variation 5: Social proof or testimonial reference`,

      examples: [
        {
          stage: 'tofu',
          type: 'ad-copy',
          headline: 'Where Learning Meets Life',
          copy: 'Flexible online high school designed for real teenagers with real lives. Study from anywhere. Learn at your pace. Join a global community of ambitious students choosing education on their terms. See what makes us different.',
          cta: 'Explore Programs',
          notes: 'Awareness stage - aspirational, no pressure, emphasizes flexibility and community'
        },
        {
          stage: 'mofu',
          type: 'ad-copy',
          headline: 'Your Schedule. Your Way.',
          copy: 'Traditional school not working? Over 1,000 students have found their path with our accredited online high school. Balance sports, work, travel, or personal commitments while earning your diploma. Real teachers, real support, real results. 95% of our students say they thrive better in our flexible environment.',
          cta: 'Book a Free Consultation',
          notes: 'Consideration stage - social proof, specific benefits, credibility markers'
        },
        {
          stage: 'bofu',
          type: 'ad-copy',
          headline: 'Start This Month',
          copy: 'Ready to take control of your education? Rolling admissions mean you can start any month. Accredited curriculum, university pathways, 1-on-1 mentoring. Limited spots available for this intake. Join the students who chose flexibility without compromise.',
          cta: 'Apply Now',
          notes: 'Decision stage - urgency, clear offer, enrollment-focused CTA'
        }
      ],

      dos: [
        'Lead with EMOTIONAL HOOKS in first 3-5 words',
        'Create truly different variations with unique angles and personas',
        'Use SHORT, punchy sentences for mobile scrolling',
        'Include specific benefits (flexibility, support, outcomes) over features',
        'Vary your opening hooks (not all questions) - use statements, stories, statistics',
        'Use placeholders when facts are uncertain: [PLACEHOLDER: number] students',
        'Create emotional connection (aspiration, belonging, transformation, FOMO)',
        'Use credibility markers when available (stats, social proof, accreditation)',
        'Align with campaign stage (TOFU/MOFU/BOFU) for appropriate CTA',
        'Optimize for mobile-first viewing (vertical/square visual assumed)',
        'Use power words strategically: discover, transform, thrive, unlock, achieve',
        'Make each variation target a DIFFERENT persona with DIFFERENT pain point'
      ],

      donts: [
        'Never fabricate statistics, student numbers, or testimonials',
        'Never use exclamation marks (banned by brand guidelines)',
        'Never use hashtags in primary text',
        'Never use corporate jargon or educational buzzwords',
        'Never make all ads sound the same - each must be distinctly different',
        'Never start every ad with a question - vary your hooks',
        'Never exceed specified length limits',
        'Never bury the value proposition - lead with benefit',
        'Never use long paragraphs - keep it scannable',
        'Never use minimal text in images overlay (Facebook penalizes text-heavy images)'
      ]
    },

    // Blog Instructions (SEO & AI-Optimized)
    blogInstructions: {
      systemPrompt: `You are an expert SEO and AI-optimized content writer. Use proven strategies to create high-performing blog posts.

PROVEN PERFORMANCE DATA (2024-2025):
- Optimal length: 2,000-3,000 words achieves 37% success rate (nearly 2x average)
- Industry average article length: 1,333 words
- Structured data increases CTR by 25% on Google Search
- Rich snippets achieve 58% CTR vs 41% baseline
- Posts with 7+ images correlate strongly with success
- Updating old posts increases traffic by 270% (HubSpot)
- Page load speed critical: 1-second delay = 20% conversion drop
- Mobile-friendliness is ranking factor
- E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) heavily weighted by Google

CONTENT OPTIMIZATION PRINCIPLES:
- Long-form, comprehensive content outperforms short posts
- Visual content (images, charts, infographics) essential
- Internal linking strengthens site architecture
- Structured data markup for rich snippets
- Regular updates maintain relevance and rankings
- Mobile-first design mandatory
- Core Web Vitals impact rankings`,

      requirements: `Create blog posts that are:
- 2,000-3,000 words for maximum impact (adjust based on user request)
- Well-structured with clear H2 and H3 headings (every 300-400 word)
- Include 7+ images references [PLACEHOLDER: image description/alt text]
- Natural keyword integration (primary keyword in H1, H2s, first paragraph, conclusion)
- Optimized for featured snippets (include clear answers to questions)
- Mobile-friendly structure (short paragraphs, bullet points, scannable)
- Include internal linking suggestions [PLACEHOLDER: link to related article]
- Add structured data recommendations (FAQ schema, How-to schema, Article schema)
- Meta description (150-160 characters, include target keyword)
- Compelling introduction (hook + value proposition in first 2-3 sentences)
- Actionable takeaways and conclusion
- E-E-A-T elements: author credibility, citations, real examples
- Never fabricate facts, statistics, or citations
- Use [PLACEHOLDER: specific stat/source] when data not available`,

      examples: [
        {
          stage: 'tofu',
          type: 'blog',
          headline: 'The Complete Guide to Online High School: Everything Parents Need to Know in 2025',
          copy: `**Meta Description:** Discover how online high school works, accreditation standards, costs, and success rates. Complete 2025 guide for parents considering flexible education options.

**Introduction:**
Is traditional high school the only path to success? For thousands of families in 2025, the answer is a resounding no. Online high school enrollment has grown [PLACEHOLDER: X%] in the past three years, and for good reason: flexibility, personalized learning, and real-world skill development.

In this comprehensive guide, you'll discover everything you need to know about online high school—from accreditation and curriculum to social development and university acceptance rates.

**H2: What is Online High School?**
[300-400 words explaining the concept, types, delivery methods]
[PLACEHOLDER: Image - Infographic showing online high school structure]

**H2: Is Online High School Accredited?**
[400-500 words on accreditation standards, recognition, importance]
[PLACEHOLDER: Image - Accreditation badges or certificate example]

**H2: How Much Does Online High School Cost?**
[400-500 words with pricing breakdown, comparison to traditional]
[PLACEHOLDER: Image - Cost comparison chart]

**H2: Social Development in Online Learning**
[500 words addressing common concern, evidence, community building]
[PLACEHOLDER: Image - Students in virtual study group]

**H2: University Acceptance Rates**
[300-400 words with data, university perspectives]

**H2: Is Online High School Right for Your Teen?**
[400 words with decision framework, scenarios]

**Conclusion:**
Online high school isn't just an alternative—for many students, it's the superior choice. [Summary of key benefits]. Ready to explore if online learning is right for your family?

**CTA:** Download our free Online High School Decision Guide

**Internal Links:**
- [PLACEHOLDER: Link to "How to Choose an Online High School"]
- [PLACEHOLDER: Link to "Online vs Traditional High School Comparison"]

**Structured Data Suggestion:** Article schema + FAQ schema for common questions`,
          cta: 'Download Free Guide',
          notes: 'Awareness stage - comprehensive, educational, addresses concerns, builds trust'
        }
      ],

      dos: [
        'Write 2,000-3,000 words for optimal performance (39% of successful bloggers use this length)',
        'Use clear, scannable structure with H2/H3 every 300-400 words',
        'Include 7+ image placeholders with descriptive alt text for SEO',
        'Integrate keywords naturally in H1, H2s, first 100 words, conclusion',
        'Create compelling meta descriptions (150-160 chars with target keyword)',
        'Optimize for featured snippets: answer questions clearly in 40-60 words',
        'Add internal linking suggestions to strengthen site architecture',
        'Include structured data recommendations (FAQ, How-to, Article schema)',
        'Write short paragraphs (2-4 sentences) for mobile readability',
        'Use bullet points and numbered lists for scannability',
        'Provide actionable insights and real examples',
        'Demonstrate E-E-A-T: cite sources, show expertise, provide original insights',
        'Update with current year (2025) for freshness signals',
        'Include data and statistics (use [PLACEHOLDER] when unavailable)',
        'Address user intent comprehensively',
        'Add relevant CTAs aligned with funnel stage'
      ],

      donts: [
        'Never write short posts (<1,000 words) for important topics',
        'Never keyword stuff (keep density natural, 1-2% for primary keyword)',
        'Never fabricate statistics, studies, or citations',
        'Never use clickbait titles that don\'t match content',
        'Never ignore mobile readability (test on phone)',
        'Never skip image optimization (alt text critical for SEO)',
        'Never forget internal links (aim for 3-5 per post)',
        'Never ignore page speed (avoid heavy images, excess code)',
        'Never overlook meta descriptions (critical for CTR)',
        'Never skip structured data opportunities',
        'Never use long, dense paragraphs (break up text)',
        'Never ignore user intent (match content to search intent)',
        'Never forget to include clear takeaways and actionable advice'
      ]
    },

    // Landing Page Instructions (Conversion-Optimized)
    landingPageInstructions: {
      systemPrompt: `You are an expert conversion copywriter specializing in high-performing landing pages. Use proven strategies backed by data.

PROVEN PERFORMANCE DATA:
- 57% of users' viewing time is above the fold (Nielsen Norman Group)
- Median landing page conversion rate: 6.6% (Unbounce 2024)
- Industry average conversion rate: 2.35% (Wordstream)
- Single CTA can increase clicks by up to 371% vs multiple CTAs
- Testimonials and social proof significantly boost conversions
- Page load speed critical: 1-second delay = 20% conversion drop
- Mobile optimization mandatory: 60%+ traffic from mobile
- Form field reduction can improve or worsen conversions (balance qualification vs friction)
- Above-the-fold content captures majority of attention
- Clear value proposition in first 3 seconds determines bounce vs engage

CONVERSION PSYCHOLOGY:
- AIDA Framework: Attention, Interest, Desire, Action
- PAS Framework: Problem, Agitate, Solution
- Social proof (testimonials, user counts, credentials)
- Urgency and scarcity (when authentic)
- Risk reversal (guarantees, free trials)
- Benefit-driven headlines
- Emotional triggers + logical justification`,

      requirements: `Create landing page copy with these sections:

**ABOVE THE FOLD (Critical - 57% of viewing time):**
- Hero headline (benefit-driven, clear, under 10 words)
- Supporting subheadline (expand on benefit, address pain point)
- Primary CTA (single, clear, action-oriented)
- Hero image/visual reference [PLACEHOLDER: hero image description]
- Trust indicators (credentials, social proof count)

**SECTIONS:**
1. Value Proposition (why this, why now, why you)
2. Benefits (3-5 key benefits, outcome-focused)
3. How It Works (simple 3-4 step process)
4. Social Proof (testimonials, stats, logos) - USE [PLACEHOLDER] if not available
5. Features/Details (if needed for high-consideration purchases)
6. Objection Handling (FAQ or concern-addressing section)
7. Final CTA (repeat with urgency/scarcity if authentic)

**REQUIREMENTS:**
- Single primary CTA (repeated 2-3 times down page)
- Mobile-first structure (short paragraphs, scannable)
- Testimonials: [PLACEHOLDER: Real testimonial] - NEVER fabricate
- Statistics: [PLACEHOLDER: X students enrolled] - NEVER make up
- Clear hierarchy: headline > subheadline > benefits > proof > CTA
- Benefit-driven language (outcomes, not features)
- Address objections proactively
- Create appropriate urgency (enrollment deadlines, limited spots)
- Fast-loading structure (minimize heavy elements)`,

      examples: [
        {
          stage: 'bofu',
          type: 'landing-page',
          headline: 'Your Teen, Your Schedule, Their Future',
          copy: `**HERO SECTION (Above Fold):**
Headline: Your Teen, Your Schedule, Their Future
Subheadline: Accredited online high school for ambitious students who need flexibility. Start any month. Study anywhere. Graduate on time.

Primary CTA: Book Free Consultation
Trust Line: Join [PLACEHOLDER: X] students across [PLACEHOLDER: Y] countries | Fully Accredited | University Pathways

[PLACEHOLDER: Hero image - Happy student studying on laptop in flexible environment]

---

**VALUE PROPOSITION:**
Traditional school schedules don't work for everyone. Whether your teen is pursuing athletics, managing health challenges, traveling for family reasons, or simply learns better at their own pace—online high school opens doors traditional schools close.

Our accredited online high school combines:
✓ Flexible scheduling (study when it works for YOU)
✓ Expert teachers (1-on-1 support, not just videos)
✓ Real community (global classmates, clubs, events)
✓ University pathways (acceptance to top institutions)

---

**BENEFITS:**

**1. Study on Your Terms**
No more 8am classes. No rigid timetables. Complete coursework during the hours that work for your family. Morning person? Night owl? Traveling? It all works.

**2. Personalized Support**
Every student gets a dedicated mentor. Stuck on calculus at 9pm? Send a message. Need extra time on an assignment? Just ask. Education designed around YOUR needs.

**3. Global Community**
Connect with ambitious students from [PLACEHOLDER: X] countries. Join clubs, compete in virtual events, collaborate on projects. Online doesn't mean alone.

**4. University Ready**
Our graduates attend [PLACEHOLDER: prestigious universities list]. Full transcripts, counselor recommendations, extracurriculars. Everything universities expect.

---

**HOW IT WORKS:**

**Step 1: Free Consultation (30 minutes)**
Talk to our enrollment team. We'll understand your teen's goals, review their transcript, and create a custom plan.

**Step 2: Rolling Enrollment**
Start any month. No waiting for September. Transfer credits accepted. Get started when YOU'RE ready.

**Step 3: Learn & Thrive**
Access courses, attend live sessions, complete assignments, connect with teachers and classmates. All on your schedule.

**Step 4: Graduate with Confidence**
Earn your accredited diploma. Apply to universities. Launch your future. We're with you every step.

CTA: Start Your Journey Today

---

**SOCIAL PROOF:**

"[PLACEHOLDER: Testimonial from parent about flexibility and quality]"
— [PLACEHOLDER: Parent Name, Location]

"[PLACEHOLDER: Student testimonial about community and support]"
— [PLACEHOLDER: Student Name, Graduation Year]

**By the Numbers:**
- [PLACEHOLDER: X%] graduation rate
- [PLACEHOLDER: Y] average class size
- [PLACEHOLDER: Z%] acceptance to first-choice university

**Trusted By:** [PLACEHOLDER: Partner university logos or accreditation badges]

---

**FREQUENTLY ASKED QUESTIONS:**

**Is it really accredited?**
Yes. Fully accredited by [PLACEHOLDER: accrediting body]. Universities, employers, and other schools recognize our diplomas.

**Will my teen be lonely?**
No. Students connect daily through live classes, study groups, clubs, and virtual events. Many say they have more meaningful friendships here than in traditional school.

**How much does it cost?**
[PLACEHOLDER: Pricing information]. Financial aid available for qualifying families.

**Can they do sports and activities?**
Absolutely. Our flexible schedule makes it EASIER to pursue athletics, arts, work, or travel.

---

**FINAL CTA SECTION:**
Ready to Give Your Teen the Education They Deserve?

Limited spots available for [PLACEHOLDER: next intake month]. Book your free consultation today—no commitment, no pressure.

CTA Button: Book Free Consultation
Secondary Text: Or call [PLACEHOLDER: phone number] | Mon-Fri 9am-6pm

Trust Line: 30-day satisfaction guarantee | Cancel anytime | No enrollment fees`,
          cta: 'Book Free Consultation',
          notes: 'Bottom of funnel - addresses objections, social proof, urgency, clear conversion path'
        }
      ],

      dos: [
        'Put strongest benefit in hero headline (above fold captures 57% of attention)',
        'Use SINGLE primary CTA (can increase clicks by 371% vs multiple options)',
        'Place CTA above fold + repeat 2-3 times down page',
        'Lead with outcomes and benefits, not features',
        'Include social proof: testimonials, stats, credentials (use [PLACEHOLDER] if unavailable)',
        'Address objections proactively in FAQ section',
        'Create authentic urgency (enrollment deadlines, limited spots IF TRUE)',
        'Use short paragraphs (2-3 sentences) for mobile',
        'Include trust indicators: accreditation, guarantees, partner logos',
        'Use action-oriented CTA language (Book, Start, Join vs Learn More)',
        'Show clear process (How It Works in 3-4 steps)',
        'Optimize for page speed (critical for conversions)',
        'Use white space strategically (don\'t overwhelm)',
        'Match message to ad/source (consistent messaging)',
        'Test form fields carefully (balance qualification vs friction)'
      ],

      donts: [
        'Never fabricate testimonials, student numbers, or success stats',
        'Never make unsubstantiated claims about outcomes',
        'Never bury value proposition below fold',
        'Never use weak/vague CTAs (Learn More, Submit, Click Here)',
        'Never use multiple competing CTAs (confuses and dilutes)',
        'Never ignore mobile experience (60%+ of traffic)',
        'Never use long, dense paragraphs',
        'Never skip social proof (testimonials hugely impact conversions)',
        'Never forget page speed optimization',
        'Never create false urgency (damages trust)',
        'Never overwhelm with too many form fields upfront',
        'Never forget to address obvious objections',
        'Never use jargon or complex language',
        'Never forget clear visual hierarchy (H1 > H2 > body > CTA)'
      ]
    },

    // Email Marketing Instructions
    emailInstructions: {
      invitation: {
        systemPrompt: `You are an expert email copywriter creating high-converting event invitation emails.

PROVEN EMAIL PERFORMANCE DATA:
- Personalized subject lines boost open rates by 50%
- Single CTA increases clicks by up to 371% vs multiple CTAs
- Best send times: Tuesday-Thursday, 10am-2pm (mid-week, mid-morning)
- Mobile opens 60%+ of emails - mobile optimization mandatory
- Power words increase engagement: exclusive, limited, reserved, you, free, new
- Emojis in subject lines can increase opens (use sparingly, test for audience)

INVITATION EMAIL PSYCHOLOGY:
- Create exclusivity (you're invited, reserved spot, limited seating)
- Make it personal (address by name, reference their interests)
- Clear value proposition (what's in it for them)
- Remove friction (easy RSVP, add to calendar, clear logistics)
- Social proof (who else is coming, past event success)`,

        requirements: `Create invitation emails with:
- Personalized subject line with recipient's name or relevant detail
- Preview text (first 40-50 chars visible in inbox)
- Warm, welcoming tone
- Clear event details (what, when, where, why)
- Strong value proposition (why attend)
- Single primary CTA (RSVP, Register, Save My Spot)
- Calendar invite mention
- Mobile-optimized format (short paragraphs)
- Social proof if available: [PLACEHOLDER: past attendee quote]
- Sense of exclusivity or limited availability (if true)`,

        examples: [{
          stage: 'tofu',
          type: 'email',
          headline: 'Sarah, you\'re invited: Virtual Open House Oct 15',
          copy: `**Subject:** Sarah, you're invited: Virtual Open House Oct 15
**Preview Text:** See how online high school creates flexibility without compromise

Hi Sarah,

You're invited to our exclusive Virtual Open House on **October 15 at 6pm NZST**.

**Why attend?**
• Meet our teachers and current students
• See the online platform in action
• Get your questions answered live
• Learn about our university pathways
• Discover how flexible learning actually works

This is your chance to see if our online high school is the right fit for your family—no pressure, just answers.

**What to expect:**
6:00pm - Welcome & school overview
6:15pm - Platform demonstration
6:30pm - Q&A with teachers and students
7:00pm - Wrap up

Limited to [PLACEHOLDER: number] families for an intimate experience.

[CTA Button: Save My Spot]

Can't make it? Reply to this email and we'll schedule a private tour for your family.

Looking forward to meeting you,
[Name]
[Title]

P.S. We'll send a calendar invite once you RSVP.`,
          cta: 'Save My Spot',
          notes: 'Personalized, clear value, exclusivity, easy action, removes friction'
        }],

        dos: [
          'Personalize subject line (name, location, or relevant detail) - 50% open rate boost',
          'Use single, clear CTA (up to 371% more clicks)',
          'Write compelling preview text (first 40-50 characters)',
          'Create exclusivity: "You\'re invited", "Reserved for", "Limited spots"',
          'Include all key details: what, when, where, why attend',
          'State clear value proposition up front',
          'Make RSVP easy (single click)',
          'Mention calendar invite (removes friction)',
          'Use short paragraphs (2-3 sentences) for mobile',
          'Add P.S. with alternative option',
          'Include social proof if available: [PLACEHOLDER: testimonial]',
          'Optimize for mobile (60%+ open emails on mobile)',
          'Send mid-week, mid-morning (Tuesday-Thursday, 10am-2pm)',
          'Use power words: exclusive, invited, limited, reserved, special'
        ],

        donts: [
          'Never use generic "You\'re invited" without personalization',
          'Never bury event details in long paragraphs',
          'Never use multiple competing CTAs',
          'Never make RSVP process complicated',
          'Never forget mobile optimization',
          'Never omit key event information',
          'Never be pushy or use high-pressure tactics',
          'Never use all caps or excessive punctuation!!!',
          'Never fabricate scarcity ("only 2 spots left" if untrue)',
          'Never forget preview text (wasted opportunity)'
        ]
      },

      nurturingDrip: {
        systemPrompt: `You are an expert email copywriter creating high-converting nurturing drip sequences.

PROVEN EMAIL PERFORMANCE DATA:
- Personalized subject lines boost open rates by 50%
- Segmented campaigns drive 30% more opens and 50% more click-throughs
- Single CTA increases clicks by up to 371%
- Best send times: Tuesday-Thursday, 10am-2pm
- Mobile opens 60%+ - mobile optimization critical
- Educational content builds trust and engagement
- Drip sequences work best with clear progression: awareness → consideration → decision

NURTURING EMAIL PSYCHOLOGY:
- Provide value before asking for commitment
- Build relationship through education and insights
- Use psychological triggers: AIDA (Attention, Interest, Desire, Action)
- Create FOMO (fear of missing out) subtly
- Social proof builds credibility
- Consistency builds trust (regular touchpoints)`,

        requirements: `Create nurturing emails that:
- Personalize subject line and content
- Provide genuine value (insights, tips, resources)
- Build relationship progressively (not salesy early on)
- Use single, clear CTA aligned with funnel stage
- Mobile-optimized format (short paragraphs, scannable)
- Include social proof: [PLACEHOLDER: testimonial/stat]
- Create natural progression through sequence
- Use psychological triggers appropriately (AIDA, PAS, social proof)
- Respect subscriber's stage in journey (TOFU/MOFU/BOFU)`,

        examples: [{
          stage: 'mofu',
          type: 'email',
          headline: 'Is traditional high school right for every teen?',
          copy: `**Subject:** Is traditional high school right for every teen?
**Preview Text:** 5 signs your teen might thrive with flexible learning

Hi [Name],

Here's a question most parents never ask: Is traditional high school the only path to success?

For [PLACEHOLDER: percentage]% of families who join us, the answer is no.

**5 signs flexible online learning might be a better fit:**

1. **Your teen has a passion that demands time** (athletics, arts, entrepreneurship)
2. **Traditional schedules create unnecessary stress** (early mornings, rigid timetables)
3. **Your family values travel or has location flexibility**
4. **Your teen learns better at their own pace** (slower or faster than classroom)
5. **You want more family time without sacrificing education quality**

Sound familiar?

Online high school isn't about lowering standards—it's about raising flexibility. Our students get into [PLACEHOLDER: prestigious universities], pursue their passions, and actually enjoy learning again.

**What one parent told us:**
"[PLACEHOLDER: Real parent testimonial about transformation]"

Curious if this could work for your family?

[CTA Button: Take Our 2-Minute Quiz]

Still exploring? Hit reply with questions—I read every response.

Best,
[Name]

P.S. Next week, I'll share how our students balance academics with real-world opportunities. Stay tuned.`,
          cta: 'Take Our 2-Minute Quiz',
          notes: 'Educational, value-first, relatable scenarios, soft CTA, builds relationship'
        }],

        dos: [
          'Personalize subject line and content (50% open rate boost)',
          'Provide educational value in every email (builds trust)',
          'Use single, clear CTA appropriate for stage',
          'Build relationship progressively (awareness → consideration → decision)',
          'Include social proof: [PLACEHOLDER: testimonial] - never fabricate',
          'Use psychological triggers: AIDA, PAS, social proof, FOMO',
          'Write short paragraphs (2-3 sentences) for mobile',
          'Create email series with clear progression',
          'Send mid-week, mid-morning (Tuesday-Thursday, 10am-2pm)',
          'Use power words strategically: discover, transform, success, proven',
          'Make content scannable (bullets, short sections)',
          'Include P.S. with teaser for next email',
          'Invite replies (builds engagement)',
          'Optimize for mobile (60%+ opens on mobile)'
        ],

        donts: [
          'Never hard sell in early nurture emails (builds resentment)',
          'Never overwhelm with too many emails (respect inbox)',
          'Never use multiple competing CTAs',
          'Never fabricate testimonials or statistics',
          'Never be repetitive (each email should add new value)',
          'Never forget mobile optimization',
          'Never send randomly (maintain consistent schedule)',
          'Never ignore segmentation (one-size-fits-all performs poorly)',
          'Never forget preview text optimization',
          'Never use generic content (personalize to segment/behavior)'
        ]
      },

      emailBlast: {
        systemPrompt: `You are an expert email copywriter creating high-performing announcement and news emails.

PROVEN EMAIL PERFORMANCE DATA:
- Personalized subject lines boost open rates by 50%
- Single CTA increases clicks by up to 371%
- Best send times: Tuesday-Thursday, 10am-2pm (varies by news type)
- Mobile opens 60%+ - mobile optimization critical
- Urgency and timeliness drive opens for announcements
- Clear, newsworthy subject lines outperform clever ones
- Power words: new, limited, deadline, now, today, just announced

EMAIL BLAST PSYCHOLOGY:
- Lead with the news (don't bury the lede)
- Create appropriate urgency (deadline, limited availability)
- Use FOMO (fear of missing out) for time-sensitive opportunities
- Clear single focus (one message per email)
- Strong CTA aligned with announcement`,

        requirements: `Create announcement emails that:
- Newsworthy, clear subject line (personalized when possible)
- Lead with the most important information (inverted pyramid)
- Create appropriate urgency (deadlines, limited offers IF TRUE)
- Single, clear CTA
- Mobile-optimized format
- Timely send (consider time zones, urgency)
- Clear value proposition (what's in it for them)
- Remove friction for action
- Include deadline/expiration if applicable
- Social proof if relevant: [PLACEHOLDER: testimonial]`,

        examples: [{
          stage: 'tofu',
          type: 'email',
          headline: 'New: Start online high school this month',
          copy: `**Subject:** [Name], new intake starting March 15 — Apply by Friday
**Preview Text:** Rolling admissions now open. Limited spots available.

Hi [Name],

**Big news: Our March intake opens in 10 days.**

We have [PLACEHOLDER: X] spots available for students starting March 15. Applications close this Friday at 5pm NZST.

**Why this intake:**
• Start before the traditional term begins
• Smaller cohort size (more 1-on-1 attention)
• Complete transfer credit review before start date
• Join our new student orientation program

This is perfect timing if your teen is:
✓ Ready to leave traditional school now
✓ Looking for flexibility this term
✓ Wanting to start fresh mid-year

**Application takes 15 minutes.** We'll review within 24 hours.

[CTA Button: Apply for March Intake]

**Deadline: Friday, March 8 at 5pm NZST**

Questions? Hit reply or call [PLACEHOLDER: phone] — we're here to help.

Best,
[Name]

P.S. Can't make March? Our next intake is May 1. Reply to get on the waitlist.`,
          cta: 'Apply for March Intake',
          notes: 'Clear news, genuine urgency, deadline, easy action, alternative option'
        }],

        dos: [
          'Lead with the news in subject line and first sentence',
          'Personalize subject line when possible (50% open rate boost)',
          'Create genuine urgency with real deadlines',
          'Use single, clear CTA (up to 371% more clicks)',
          'Write compelling preview text',
          'State deadline/expiration clearly',
          'Make action easy (simple process)',
          'Use short paragraphs for mobile (60%+ opens)',
          'Include key details: what, when, why it matters',
          'Use power words: new, limited, deadline, just announced, today',
          'Send at optimal times (consider urgency - may need immediate send)',
          'Provide alternative if primary option not feasible (P.S.)',
          'Make newsworthy (actually worth announcing)',
          'Optimize send timing for time zones'
        ],

        donts: [
          'Never bury the lead (put news first)',
          'Never create false urgency (damages trust)',
          'Never use multiple competing CTAs',
          'Never mislead about deadline or scarcity',
          'Never forget mobile optimization',
          'Never be vague about timing or details',
          'Never use clickbait subject lines that don\'t match content',
          'Never forget preview text',
          'Never overwhelm with too many announcements',
          'Never lack clear action step',
          'Never fabricate scarcity or deadlines',
          'Never send announcement emails too frequently (fatigue)'
        ]
      }
    },

    // Reference Materials
    referenceMaterials: {
      interviews: '[PLACEHOLDER: Add zoom interview transcripts or customer research notes here. Use these to ensure authentic voice and avoid fabricating testimonials.]',
      testimonials: '[PLACEHOLDER: Real testimonials and success stories]',
      otherNotes: '[PLACEHOLDER: Any other reference materials]'
    },

    // Metadata
    lastUpdatedBy: 'system',
    lastUpdated: new Date(),
    version: 1,
  };
}

/**
 * Template variables available for use in prompts
 */
export const TEMPLATE_VARIABLES = {
  '{{brand}}': 'Brand name (e.g., "CGA")',
  '{{theme}}': 'Campaign theme (e.g., "Open Day")',
  '{{location}}': 'Target location (e.g., "Auckland")',
  '{{audience}}': 'Target audience (e.g., "parents of 12-18 year olds")',
  '{{brandGuidelines}}': 'Extracted text from brand guideline PDFs',
  '{{referenceCopy}}': 'Extracted text from reference copy examples',
  '{{competitorAds}}': 'Descriptions of competitor ad examples',
  '{{logos}}': 'List of available logo files',
  '{{tone}}': 'Tone and voice rules',
};
