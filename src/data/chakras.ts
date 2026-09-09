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
};

// Editorial content supplied by Seraph. These describe symbolic correspondences.
const content: Record<Chakra, ChakraContent> = {
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
};

export const chakraContext = 'These are spiritual and symbolic correspondences, not medical assessments. The listed Solfeggio frequencies are modern associations rather than scientifically established chakra treatments, and the musical note systems vary by tradition. Crystals and color-themed foods can support ritual intention, but they are not proven to correct chakra imbalances.';

export const chakras = realms.map((realm, index) => ({
  ...chakraPages[realm.chakra], ...content[realm.chakra],
  number: index+1, color: realm.color, realmId: realm.id, realmName: realm.name,
}));

export function findChakra(slug: string) {
  return chakras.find(chakra => chakra.slug === slug);
}
