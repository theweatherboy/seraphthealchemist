import { chakraPages, realms, type Chakra } from './realms';

type ChakraContent = {
  states: { underactive: string; balanced: string; overactive: string };
  crystals: string;
  foods: string;
  frequency: number;
  note: string;
  practices: string;
  underactivePractice: string;
  overactivePractice: string;
  overview?: string;
  frequencyContext?: string;
  editorialNote?: string;
  sources?: { label: string; href: string; description: string }[];
};

// Original seven entries supplied by Seraph. Extended entries are researched
// spiritual correspondences with sources; state/food prompts are editorial.
const content: Record<Chakra, ChakraContent> = {
  earthStar: {
    overview: 'In modern extended chakra systems, Earth Star is visualized beneath the feet, often around 15–30 cm below them. It symbolizes a deeper connection to the land, ancestry, and belonging: a foundation for bringing spiritual insight into everyday life. Brown, black, and earthy tones are common symbolic colors.',
    states: {
      underactive: 'Feeling scattered, disconnected from nature or your surroundings, or uncertain about where you belong.',
      balanced: 'Steady presence, a sense of belonging, respect for the land, and the ability to turn reflection into practical action.',
      overactive: 'Clinging to familiar surroundings or inherited beliefs, resisting change, or trying to control everything to feel secure.',
    },
    crystals: 'Black tourmaline, hematite, smoky quartz, black obsidian',
    foods: 'Root vegetables, lentils, whole grains, and seasonal produce. Choose a nourishing meal as a mindful reminder of your connection to the land.',
    frequency: 68.05, note: 'C♯2 (approx.)',
    frequencyContext: 'A lower OM octave used in some modern tuning-fork systems. This optional association is distinct from the Solfeggio sequence; there is no universally agreed Earth Star tone.',
    practices: 'Spend unhurried time outdoors, garden, notice the support beneath your feet, or visualize roots extending into the earth. Reflect on family stories while choosing which values to carry forward.',
    underactivePractice: 'Begin with a short nature walk or a few minutes of noticing your surroundings. Establish one steady daily routine and choose a small act of care for the place you live.',
    overactivePractice: 'Introduce a gentle change to a familiar routine. Reflect on inherited expectations, make room for your own choices, and balance practical commitments with rest and curiosity.',
    editorialNote: 'Earth Star belongs to modern extended chakra frameworks, which differ in location, numbering, and correspondences. The state descriptions and food ideas here are reflection prompts created for this guide, rather than a standardized assessment or prescribed diet.',
    sources: [
      { label: 'Sacred Gems: Earth Star guide', href: 'https://www.sacredgems.com.au/pages/earth-star-chakra-meaning', description: 'Location, colors, crystals, and nature-based practices.' },
      { label: 'Two Spirits, One Soul: Earth Star and Soul Star', href: 'https://twospiritsonesoul.com/articles/articles-i-have-written/soul-star-and-earth-star-chakras/', description: 'How these extended centers are distinguished from Root and Crown.' },
      { label: 'Myriad Melodies: OM-octave sound associations', href: 'https://myriadmelodies.com/products/myriad-melodies-professionally-tuned-25-52615', description: 'A practitioner sound system using 68.05 Hz for Earth Star and 272.20 Hz for Soul Star.' },
    ],
  },
  root: {
    states: {
      underactive: 'Insecurity, feeling ungrounded, fear, difficulty maintaining routines or feeling safe.',
      balanced: 'Stability, belonging, presence, practical confidence, and healthy routines.',
      overactive: 'Rigidity, material attachment, resistance to change, excessive need for control or security.',
    },
    crystals: 'Red jasper, smoky quartz, hematite, black tourmaline',
    foods: 'Root vegetables, potatoes, beets, carrots, lentils, beans, warm nourishing meals',
    frequency: 396, note: 'C',
    practices: 'Grounding walks, slow breathing, organizing your space, consistent routines.',
    underactivePractice: 'Build safety through routines, grounding, and practical support.',
    overactivePractice: 'Practice flexibility, release control, and become comfortable with change.',
  },
  sacral: {
    states: {
      underactive: 'Creative blocks, emotional numbness, shame around pleasure, difficulty connecting with desires.',
      balanced: 'Emotional flow, creativity, healthy pleasure, intimacy with boundaries, adaptability.',
      overactive: 'Emotional volatility, impulsive pleasure-seeking, dependency, weak relational boundaries.',
    },
    crystals: 'Carnelian, orange calcite, moonstone, sunstone',
    foods: 'Oranges, mangoes, sweet potatoes, pumpkin, seeds, hydrating foods',
    frequency: 417, note: 'D',
    practices: 'Creative play, dance, emotional journaling, gentle hip movement.',
    underactivePractice: 'Give yourself permission to feel, create, and experience pleasure.',
    overactivePractice: 'Strengthen boundaries, regulate emotions, and avoid using pleasure as escape.',
  },
  solar: {
    states: {
      underactive: 'Low confidence, indecision, people-pleasing, fear of taking initiative.',
      balanced: 'Self-worth, healthy ambition, clear decisions, personal responsibility, confident action.',
      overactive: 'Perfectionism, domination, excessive competitiveness, anger when challenged, achievement-based self-worth.',
    },
    crystals: "Citrine, tiger's eye, yellow calcite, pyrite",
    foods: 'Oats, whole grains, bananas, yellow peppers, corn, balanced protein meals',
    frequency: 528, note: 'E',
    practices: 'Assertiveness, achievable goals, core-strengthening movement, following through on commitments.',
    underactivePractice: 'Build agency through small decisions and achievable commitments.',
    overactivePractice: 'Practice humility, rest, collaboration, and allowing others autonomy.',
  },
  heart: {
    states: {
      underactive: 'Difficulty trusting, emotional withdrawal, resentment, fear of vulnerability or receiving love.',
      balanced: 'Compassion, reciprocity, self-love, forgiveness, and healthy boundaries.',
      overactive: "Overgiving, rescuing others, jealousy, self-sacrifice, feeling responsible for others' emotions.",
    },
    crystals: 'Rose quartz, green aventurine, rhodonite, emerald',
    foods: 'Leafy greens, broccoli, avocado, green apples, herbs',
    frequency: 639, note: 'F',
    practices: 'Loving-kindness meditation, gratitude, compassionate boundaries, gentle chest-opening stretches.',
    underactivePractice: 'Cultivate safe connection, self-compassion, and gradual vulnerability.',
    overactivePractice: 'Practice discernment, reciprocity, and saying no without guilt.',
  },
  throat: {
    states: {
      underactive: 'Fear of speaking up, withholding needs, difficulty expressing truth or feeling heard.',
      balanced: 'Honest expression, clear communication, active listening, and appropriate silence.',
      overactive: 'Dominating conversations, interrupting, oversharing, harsh speech, needing to be heard.',
    },
    crystals: 'Blue lace agate, aquamarine, sodalite, lapis lazuli',
    foods: 'Blueberries, blackberries, pears, soups, adequate hydration',
    frequency: 741, note: 'G',
    practices: 'Humming, singing, journaling, honest communication, active listening.',
    underactivePractice: 'Express needs and truth in safe, manageable ways.',
    overactivePractice: 'Pause, listen, and speak with intention rather than urgency.',
  },
  thirdEye: {
    states: {
      underactive: 'Difficulty trusting judgment, lack of imagination, rigid thinking, reliance on external opinions.',
      balanced: 'Intuition, imagination, self-awareness, discernment, and grounded insight.',
      overactive: 'Obsessive meaning-making, overanalyzing signs, excessive fantasy, treating intuition as unquestionable fact.',
    },
    crystals: 'Amethyst, lapis lazuli, labradorite, sodalite',
    foods: 'Blueberries, blackberries, purple cabbage, eggplant, antioxidant-rich foods',
    frequency: 852, note: 'A',
    practices: 'Dream journaling, visualization, quiet meditation, checking intuition against observable reality.',
    underactivePractice: 'Develop imagination, reflection, and trust in your judgment.',
    overactivePractice: 'Ground yourself, reduce overstimulation, and allow uncertainty.',
  },
  crown: {
    states: {
      underactive: 'Disconnection from meaning, lack of purpose, spiritual cynicism, feeling isolated from something larger.',
      balanced: 'Spiritual connection, humility, openness to mystery, meaning, and embodied integration.',
      overactive: 'Spiritual superiority, neglecting practical needs, detachment, using spirituality to avoid difficult emotions.',
    },
    crystals: 'Clear quartz, amethyst, selenite, howlite',
    foods: 'Balanced nourishing meals; white or purple foods may be used symbolically',
    frequency: 963, note: 'B',
    practices: 'Contemplation, prayer, meditation, nature, integrating spiritual insights into daily life.',
    underactivePractice: 'Explore meaning, contemplation, and connection to something larger.',
    overactivePractice: 'Return to embodiment, relationships, and ordinary responsibilities.',
  },
  soulStar: {
    overview: 'In modern extended chakra systems, Soul Star is visualized above the crown, often around 15–30 cm above the head. It symbolizes a relationship with the higher self, a wider sense of purpose, and spiritual integration. White, gold, and luminous tones are common associations, though traditions differ.',
    states: {
      underactive: 'Feeling distant from personal meaning, finding it difficult to reflect on purpose, or looking to others to define your spiritual path.',
      balanced: 'A grounded sense of purpose, openness to mystery, compassion, and the willingness to express spiritual values through everyday choices.',
      overactive: 'Chasing signs or extraordinary experiences, identifying with a special spiritual status, or letting spiritual pursuits displace ordinary responsibilities.',
    },
    crystals: 'Clear quartz, selenite, apophyllite, scolecite',
    foods: 'Balanced, nourishing meals and adequate hydration. White foods such as pears, cauliflower, or rice can be used symbolically as part of a mindful meal.',
    frequency: 272.20, note: 'C♯4 (approx.)',
    frequencyContext: 'An upper OM octave used in some modern tuning-fork systems. This optional association is distinct from the Solfeggio sequence; there is no universally agreed Soul Star tone.',
    practices: 'Quiet contemplation, prayer, or a brief visualization of gentle light above the head. Journal about your values and purpose, then choose one practical way to express them.',
    underactivePractice: 'Reflect on what gives your life meaning without forcing a revelation. Try a short contemplative practice, notice moments of connection, and take a small step toward a value you care about.',
    overactivePractice: 'Shorten intense spiritual practices and return attention to the body, daily routines, and relationships. Treat impressions as possibilities to reflect on, and leave room for uncertainty.',
    editorialNote: 'Soul Star belongs to modern extended chakra frameworks, which differ in location, numbering, and correspondences. The state descriptions and food ideas here are reflection prompts created for this guide, rather than a standardized assessment or prescribed diet.',
    sources: [
      { label: 'Sacred Gems: Soul Star guide', href: 'https://www.sacredgems.com.au/pages/soul-star-chakra-meaning', description: 'Location, spiritual themes, and crystal correspondences.' },
      { label: 'Soulstar Stories: selenite symbolism', href: 'https://www.soulstarstories.com/crystal-healing/selenite/', description: 'Selenite and white or transparent crystals in Soul Star practice.' },
      { label: 'Sage Goddess: quartz symbolism', href: 'https://www.sagegoddess.com/product/gemstones-peace-and-clearing-selenite-and-amethyst-double-terminated-wand/', description: 'The association of clear quartz with Soul Star in contemporary crystal practice.' },
      { label: 'Myriad Melodies: OM-octave sound associations', href: 'https://myriadmelodies.com/products/myriad-melodies-professionally-tuned-25-52615', description: 'A practitioner sound system using 68.05 Hz for Earth Star and 272.20 Hz for Soul Star.' },
    ],
  },
};

export const chakraContext = 'These are spiritual and symbolic correspondences, not medical assessments. The sound frequencies are modern associations rather than scientifically established chakra treatments, and musical note systems vary by tradition. The seven central chakra pages use Solfeggio associations; Earth Star and Soul Star offer an OM-octave alternative, with approximate nearest notes in A=440 Hz tuning. Crystals and color-themed foods can support ritual intention, but they are not proven to correct chakra imbalances.';

export const chakras = realms.map(realm => ({
  ...chakraPages[realm.chakra], ...content[realm.chakra],
  color: realm.color, realmId: realm.id, realmName: realm.name,
}));

export function findChakra(slug: string) {
  return chakras.find(chakra => chakra.slug === slug);
}
