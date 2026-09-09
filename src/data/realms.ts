export type Chakra =
  | "root"
  | "sacral"
  | "solar"
  | "heart"
  | "throat"
  | "thirdEye"
  | "crown";

export const chakraPages: Record<Chakra, { name: string; slug: string }> = {
  root: { name: "Root", slug: "root" },
  sacral: { name: "Sacral", slug: "sacral" },
  solar: { name: "Solar Plexus", slug: "solar-plexus" },
  heart: { name: "Heart", slug: "heart" },
  throat: { name: "Throat", slug: "throat" },
  thirdEye: { name: "Third Eye", slug: "third-eye" },
  crown: { name: "Crown", slug: "crown" },
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
  }
];
