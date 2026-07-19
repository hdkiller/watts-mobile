export type StarterPrompt = {
  id: string;
  label: string;
  text: string;
};

/** Brand-aligned empty-state prompts for the Coach tab. */
export const COACH_STARTER_PROMPTS: StarterPrompt[] = [
  {
    id: 'why-recommendation',
    label: 'Why this recommendation?',
    text: 'Why is this today’s recommendation, and what should I focus on?',
  },
  {
    id: 'sore-adjust',
    label: 'Adjust if I’m sore',
    text: 'How should I adjust today if I’m feeling sore or under-recovered?',
  },
  {
    id: 'session-intent',
    label: 'Session intent',
    text: 'What’s the intent of today’s planned session in plain language?',
  },
  {
    id: 'recovery-focus',
    label: 'Recovery focus',
    text: 'Given my recent recovery notes, what should I watch for today?',
  },
];
