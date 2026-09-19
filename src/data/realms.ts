export type Chakra =
  | "earthStar"
  | "root"
  | "sacral"
  | "solar"
  | "heart"
  | "throat"
  | "thirdEye"
  | "crown"
  | "soulStar";

export const chakraPages: Record<Chakra, { name: string; slug: string; number: number }> = {
  earthStar: { name: "Earth Star", slug: "earth-star", number: 0 },
  root: { name: "Root", slug: "root", number: 1 },
  sacral: { name: "Sacral", slug: "sacral", number: 2 },
  solar: { name: "Solar Plexus", slug: "solar-plexus", number: 3 },
  heart: { name: "Heart", slug: "heart", number: 4 },
  throat: { name: "Throat", slug: "throat", number: 5 },
  thirdEye: { name: "Third Eye", slug: "third-eye", number: 6 },
  crown: { name: "Crown", slug: "crown", number: 7 },
  soulStar: { name: "Soul Star", slug: "soul-star", number: 8 },
};

export interface Realm {
  id: string;
  name: string;
  chakra: Chakra;
  color: string;
  secondaryColor?: string;
  subjects: string[];
}

export const realms: Realm[] = [
  {
    id: "earth-star",
    name: "Earth Star",
    chakra: "earthStar",
    color: "#79604a",
    subjects: ["Earth Connection", "Belonging", "Ancestral Reflection", "Embodiment"]
  },
  {
    id: "earth",
    name: "Earth",
    chakra: "root",
    color: "#8f2638",
    subjects: [
      "Grounding",
      "Protection",
      "Presence",
      "Energy Hygiene"
    ]
  },
  {
    id: "flow",
    name: "Flow",
    chakra: "sacral",
    color: "#c66a2b",
    subjects: [
      "Emotion",
      "Creativity",
      "Energy",
      "Movement"
    ]
  },
  {
    id: "alchemy",
    name: "Alchemy",
    chakra: "solar",
    color: "#d4a72c",
    subjects: [
      "Transformation",
      "Will",
      "Shadow Work",
      "Alchemy"
    ]
  },
  {
    id: "healing",
    name: "Healing",
    chakra: "heart",
    color: "#3f8f68",
    subjects: [
      "Healing",
      "Compassion",
      "Integration",
      "Reiki"
    ]
  },
  {
    id: "knowledge",
    name: "Knowledge",
    chakra: "throat",
    color: "#3c91a8",
    subjects: [
      "Mysticism",
      "Hermeticism",
      "Symbolism",
      "Spiritual Study"
    ]
  },
  {
    id: "oracle",
    name: "Oracle",
    chakra: "thirdEye",
    color: "#4c438c",
    subjects: [
      "Tarot",
      "Divination",
      "Dreams",
      "Intuition",
      "Astral Exploration"
    ]
  },
  {
    id: "celestial",
    name: "Celestial",
    chakra: "crown",
    color: "#8669b8",
    subjects: [
      "Angels",
      "Seraphim",
      "Mysticism",
      "Higher Consciousness"
    ]
  },
  {
    id: "soul-star",
    name: "Soul Star",
    chakra: "soulStar",
    color: "#b38a43",
    subjects: ["Soul Purpose", "Higher Self", "Spiritual Connection", "Integration"]
  }
];

// Shared order for the homepage, page navigation, and site menu.
export const chakraNavigation = realms.map(realm => ({
  ...chakraPages[realm.chakra], color: realm.color,
}));
