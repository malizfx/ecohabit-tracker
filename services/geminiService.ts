/**
 * habitService.ts (formerly geminiService.ts)
 *
 * Gemini AI has been removed. analyzeHabit now uses a
 * simple rule-based estimator so the rest of the app
 * (LogHabit component, etc.) continues to work without
 * any API key or network call.
 */

/* ── CO2 estimates by category (kg per action) ──────── */
const CO2_BY_CATEGORY: Record<string, number> = {
  transport: 1.2,
  food: 2.5,
  energy: 0.8,
  waste: 0.4,
  water: 0.3,
  nature: 1.0,
};

const ENCOURAGEMENTS = [
  'Amazing — every action adds up to real change! 🌿',
  'You\'re making the planet a little greener today! 🌍',
  'Small steps, big impact. Keep it up! ♻️',
  'Fantastic habit — you\'re an eco champion! ☀️',
  'The Earth thanks you for this! 🌱',
];

const FACTS: Record<string, string> = {
  transport: 'Transport accounts for around 24% of global CO2 emissions from fuel combustion.',
  food: 'A plant-based diet can reduce your food-related carbon footprint by up to 73%.',
  energy: 'Switching to LED bulbs uses at least 75% less energy than traditional incandescent bulbs.',
  waste: 'Recycling one aluminium can saves enough energy to run a TV for three hours.',
  water: 'Only 3% of Earth\'s water is fresh — conserving it matters more than ever.',
  nature: 'Forests absorb about 2.6 billion tonnes of CO2 every year.',
};

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const analyzeHabit = async (
  category: string,
  description: string,
  _photoBase64?: string   // kept for API compatibility; unused without AI
): Promise<{ co2Saved: number; encouragement: string; fact: string }> => {
  const key = category.toLowerCase();

  // Simple length-based multiplier: longer descriptions imply bigger actions
  const wordCount = description.trim().split(/\s+/).length;
  const multiplier = wordCount > 10 ? 1.3 : wordCount > 5 ? 1.0 : 0.7;

  const base = CO2_BY_CATEGORY[key] ?? 0.5;
  const co2Saved = Math.round(base * multiplier * 100) / 100;

  return {
    co2Saved,
    encouragement: pickRandom(ENCOURAGEMENTS),
    fact: FACTS[key] ?? 'Every eco-friendly action helps protect our planet for future generations.',
  };
};

// getEcoTip has been removed — tips are now hardcoded in App.tsx