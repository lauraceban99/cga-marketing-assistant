
import type { Brand } from './types';

export const BRANDS: Brand[] = [
  {
    id: 'aia',
    name: 'American Infinite Academy',
    color: 'bg-cyan-400',
    logoUrl: '/logos/American%20Infinite%20Academy_Blue%20%284%29.png',
    guidelines: {
      toneOfVoice: 'Aspirational, encouraging, and professional. Focus on student potential and future success.',
      keyMessaging: '"Unlock Your Potential," "A Foundation for Life," "Excellence in Education."',
      targetAudience: 'Ambitious parents seeking a rigorous academic environment for their children (ages 12-18).',
      values: 'Integrity, Leadership, Community.',
      imageryStyle: 'Professional photos of students engaged in academic and extracurricular activities. Bright, clean, and optimistic feel.'
    },
    inspiration: [
        "Your future starts here. At AIA, we don't just teach subjects; we build leaders. Discover our advanced curriculum. Apply now!",
        "Excellence is not an act, but a habit. Join a community of high-achievers at American Infinite Academy."
    ]
  },
  {
    id: 'aoa',
    name: 'Aotearoa Infinite Academy',
    color: 'bg-green-400',
    logoUrl: '/logos/Aotearoa%20Blue%20Navy%20Logo.svg',
    guidelines: {
      toneOfVoice: 'Inclusive, community-oriented, and connected to nature. Emphasizes cultural heritage and environmental stewardship.',
      keyMessaging: '"Learning for a Sustainable Future," "Connected to Our Land," "Community of Learners."',
      targetAudience: 'Families in New Zealand seeking an education that blends modern learning with local culture and environmental values.',
      values: 'Community, Sustainability, Respect.',
      imageryStyle: 'Images showcasing students learning outdoors, engaging with local culture, and participating in community projects. Natural lighting and authentic moments are key.'
    },
    inspiration: [
        "Learn from the land, grow with the community. Aotearoa Infinite Academy offers an education rooted in Kiwi values. Enrol today.",
        "Kaitiakitanga in action! Our students learn to be guardians of the future through hands-on environmental projects."
    ]
  },
  {
    id: 'cga',
    name: 'CGA',
    color: 'bg-blue-400',
    logoUrl: '/logos/CGA%20Burgundy%20Logo.svg',
    guidelines: {
      toneOfVoice: 'Innovative, tech-forward, and collaborative. Highlight flexibility and global connectivity.',
      keyMessaging: '"The Future of Learning," "Education Without Borders," "Personalized Pathways."',
      targetAudience: 'Tech-savvy families and students (ages 10-18) looking for a flexible, online-first educational model.',
      values: 'Innovation, Flexibility, Global Citizenship.',
      palette: 'Primary color palette includes a burgundy palette (HEX #5B000B, #770A17, #98151C, #BA1F22), a secondary blue palette (HEX #0D1B52, #1B307B, #2945A3, #375ACC), and a highlight gold palette (HEX #E87205, #FA8B1B, #FDA002, #FFB829).',
      logoRules: 'The CGA logo should always be displayed in its primary color palette. Avoid using busy backgrounds, color clashes, low contrast, stretching or distortions, cropping, and mismatching combinations.',
      fonts: 'Primary font is Styrene (sans-serif) for headlines. Secondary font is Tiempos (serif) for subheadings and body text. Styrene in uppercase is recommended for call-to-actions.',
      imageryStyle: 'Features real students, teachers, and situations. If CGA student/staff photos are not available, stock images representing the CGA student cohort can be used. Style should be aspirational, empowering, and informed.',
      dosAndDonts: "Do: Use approved palettes and fonts consistently. Ensure proper alignment and readability. Represent the brand personality. Don't: Use busy backgrounds, color clashes, low contrast, or distortions."
    },
    inspiration: [
        "World-class education, from anywhere in the world. CGA's online campus brings top teachers and a global peer group to you. Learn more.",
        "Don't just keep up with the future, build it. CGA offers a flexible, innovative curriculum for tomorrow's leaders."
    ]
  },
  {
    id: 'crimson_age',
    name: 'Crimson Age',
    color: 'bg-yellow-400',
    logoUrl: '/logos/Crimson%20Age%20Blue%20Colour%20Stacked.svg',
    guidelines: {
      toneOfVoice: 'Prestigious, exclusive, and results-driven. Focus on elite university pathways and academic rigor.',
      keyMessaging: '"Your Pathway to the Ivy League," "Excellence Redefined," "Join the Top 1%."',
      targetAudience: 'High-achieving students and affluent families aiming for admission into top-tier global universities.',
      values: 'Excellence, Ambition, Prestige.',
      imageryStyle: 'Polished, high-production-value images of students in iconic university settings or professional environments. Focus on success and achievement.'
    },
    inspiration: [
        "The path to Harvard, Oxford, and Cambridge starts at Crimson Age. Our bespoke mentorship has a proven track record of success.",
        "Ambition deserves opportunity. We provide the tools, strategy, and network to help you reach the world's best universities."
    ]
  },
  {
    id: 'emi',
    name: 'EMI',
    color: 'bg-orange-300',
    logoUrl: '/logos/EMI%20Logo.png',
    guidelines: {
      toneOfVoice: 'Playful, creative, and foundational. English, Maths, Innovation.',
      keyMessaging: '"Building the Core Foundations," "Learn, Create, Innovate," "A Playful Approach to Learning."',
      targetAudience: 'Parents of younger children (ages 6-12) looking for a creative and engaging supplement to traditional education.',
      values: 'Creativity, Curiosity, Foundational Skills.',
      imageryStyle: 'Vibrant and colorful images of young children engaged in hands-on, creative learning activities. Fun, energetic, and engaging.'
    },
    inspiration: [
        "English, Maths, Innovation! EMI makes learning the fundamentals fun. Watch your child's creativity soar.",
        "Who said learning can't be a game? Our playful approach to core subjects builds skills and a lifelong love of learning."
    ]
  },
  {
    id: 'mt_hobson',
    name: 'Mt Hobson',
    color: 'bg-pink-400',
    logoUrl: '/logos/mt%20hobson.svg',
    guidelines: {
      toneOfVoice: 'Nurturing, supportive, and boutique. Emphasizes small class sizes and personalized attention.',
      keyMessaging: '"Where Every Student is Known," "A Boutique School Experience," "Personalized Learning, Exceptional Care."',
      targetAudience: 'Parents seeking a smaller, more intimate school environment for their children who may benefit from individualized support.',
      values: 'Care, Personalization, Support.',
      imageryStyle: 'Warm, inviting photos of small groups of students interacting closely with teachers. Focus on supportive relationships and a cozy atmosphere.'
    },
     inspiration: [
        "In a class of their own. At Mt Hobson, small class sizes mean big opportunities for personalized growth.",
        "We see the potential in every student. Discover a nurturing, supportive school environment where your child can truly thrive."
    ]
  }
];
