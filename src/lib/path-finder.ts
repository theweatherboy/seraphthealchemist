import type { Service } from '@/data/services';

type Option = { label: string; category?: Service['category'] };
export const pathQuestions: { title: string; hint: string; options: Option[] }[] = [
  { title: 'What is calling you here?', hint: 'Choose what matters most right now.', options: [
    { label: 'Clarity around a question or decision', category: 'seer' },
    { label: 'Space to release and reconnect', category: 'healer' },
    { label: 'Understanding myself and my patterns', category: 'alchemist' },
    { label: 'Spiritual connection and intuitive exploration', category: 'oracle' },
    { label: 'A guided journey into something new', category: 'journey' },
    { label: 'I am not sure yet' },
  ] },
  { title: 'How are you arriving today?', hint: 'There is no right answer. Pick the closest fit.', options: [
    { label: 'Pulled in different directions; looking for perspective', category: 'seer' },
    { label: 'Ready for a pause and a little grounding', category: 'healer' },
    { label: 'At a turning point; ready to explore change', category: 'alchemist' },
    { label: 'Curious about my intuition and spiritual connection', category: 'oracle' },
    { label: 'Open and curious about a new experience', category: 'journey' },
    { label: 'I would rather skip this question' },
  ] },
  { title: 'How familiar is this kind of exploration?', hint: 'We will shape your starting point around your experience.', options: [
    { label: 'This is new to me' }, { label: 'I have explored a little' }, { label: 'It is already part of my practice' },
  ] },
  { title: 'What feels like a comfortable next step?', hint: 'You can start small. There is no pressure to book.', options: [
    { label: 'Explore something on my own first' }, { label: 'Talk it through before choosing' }, { label: 'Find a session that fits' },
  ] },
];

const paths: Record<Service['category'], { title: string; practice: string; reason: string }> = {
  seer: { title: 'Begin with clarity', practice: 'Write down one open-ended question and what you hope to understand about it.', reason: 'Offers an intuitive perspective on the questions you want to explore.' },
  healer: { title: 'Make room to reconnect', practice: 'Take a quiet moment to notice your surroundings, then name one thing you would like more space for.', reason: 'Offers space for intentional release and energetic reflection.' },
  alchemist: { title: 'Meet yourself with curiosity', practice: 'Journal about a pattern you have noticed and one small change you would like to try.', reason: 'Centers self-exploration, personal patterns, and intentions for change.' },
  oracle: { title: 'Listen to your curiosity', practice: 'Note what spiritual connection means to you and one question you would like to bring into a conversation.', reason: 'Makes room for intuitive exploration and spiritual connection.' },
  journey: { title: 'Give exploration a little space', practice: 'Set aside a quiet moment to write an intention for a new experience, without needing a particular outcome.', reason: 'Offers a guided experience for reflection and discovery.' },
};

export function findPath(answers: number[], services: Service[]) {
  const intention = pathQuestions[0].options[answers[0]]?.category;
  const feeling = pathQuestions[1].options[answers[1]]?.category;
  const category = intention ?? feeling;
  const ranked = services.map(service => ({ service, score: (service.category === intention ? 4 : 0) + (service.category === feeling ? 2 : 0) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.service.price - b.service.price)
    .slice(0, 2)
    .map(({ service }) => ({ service, reason: paths[service.category].reason }));
  return {
    title: category ? paths[category].title : 'Start with a little curiosity',
    practice: category ? paths[category].practice : 'Write down what brought you here and what you would like to learn. You do not need a clear intention to begin.',
    experience: answers[2] === 0 ? 'Start with one question. If you choose a session, let Seraph know this is your first experience so you can discuss what to expect.' : answers[2] === 1 ? 'Notice what has felt useful in your past explorations and what you would like to approach differently this time.' : 'Bring an intention from your existing practice and consider how you would like to integrate a new perspective.',
    next: answers[3] === 0 ? { href: '/grimoire', label: 'Explore the Grimoire', copy: 'Begin at your own pace with the teachings and reflections in the Grimoire.' } : answers[3] === 1 || !ranked.length ? { href: '/contact', label: 'Talk with Seraph', copy: 'Share your intention with Seraph and ask about a starting point that feels comfortable.' } : { href: `/services/${ranked[0].service.slug}`, label: 'Explore your first match', copy: 'Read the session details, preparation, and pricing before deciding whether to request a booking.' },
    matches: ranked,
  };
}
