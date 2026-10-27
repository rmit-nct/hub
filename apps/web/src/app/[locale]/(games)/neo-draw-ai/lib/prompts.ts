/** The word the player has to draw. Kept in one place so the mock guesser,
 *  the scoring check and the prompt card all agree on the vocabulary. */
export const DRAWING_PROMPTS = [
  'cat',
  'dog',
  'house',
  'tree',
  'car',
  'sun',
  'star',
  'flower',
  'fish',
  'bird',
  'cloud',
  'mountain',
  'boat',
  'umbrella',
  'bicycle',
  'guitar',
  'rocket',
  'clock',
  'key',
  'cup',
  'hat',
  'ladder',
  'butterfly',
  'snowman',
  'pizza',
  'eye',
  'bridge',
  'candle',
  'envelope',
  'lightbulb',
];

/** Words the AI might reasonably confuse a prompt with — used by the mock guesser
 *  so its "wrong" answers look like plausible misreadings instead of noise. */
export const CONFUSION_SETS: Record<string, string[]> = {
  cat: ['dog', 'rabbit', 'tiger'],
  dog: ['cat', 'horse', 'fox'],
  house: ['barn', 'church', 'box'],
  tree: ['broccoli', 'bush', 'mushroom'],
  car: ['bus', 'truck', 'van'],
  sun: ['star', 'flower', 'wheel'],
  star: ['sun', 'snowflake', 'flower'],
  flower: ['sun', 'star', 'tree'],
  fish: ['whale', 'shark', 'leaf'],
  bird: ['airplane', 'butterfly', 'leaf'],
  cloud: ['sheep', 'smoke', 'bush'],
  mountain: ['triangle', 'tent', 'pyramid'],
  boat: ['banana', 'shoe', 'canoe'],
  umbrella: ['mushroom', 'parachute', 'jellyfish'],
  bicycle: ['glasses', 'motorcycle', 'wheel'],
  guitar: ['violin', 'banjo', 'spoon'],
  rocket: ['pencil', 'carrot', 'tower'],
  clock: ['wheel', 'plate', 'sun'],
  key: ['spoon', 'screwdriver', 'fork'],
  cup: ['bucket', 'mug', 'pot'],
  hat: ['boat', 'mushroom', 'bowl'],
  ladder: ['fence', 'railway', 'grid'],
  butterfly: ['bird', 'bowtie', 'flower'],
  snowman: ['bowling pin', 'cactus', 'person'],
  pizza: ['triangle', 'cake slice', 'cheese'],
  eye: ['fish', 'leaf', 'almond'],
  bridge: ['rainbow', 'tunnel', 'fence'],
  candle: ['pencil', 'tower', 'rocket'],
  envelope: ['house', 'book', 'flag'],
  lightbulb: ['balloon', 'pear', 'egg'],
};

export function getRandomPrompt(exclude?: string | null): string {
  const pool = exclude
    ? DRAWING_PROMPTS.filter((p) => p !== exclude)
    : DRAWING_PROMPTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Loose match so "a cat" / "Cat" / "cats" all count as guessing "cat". */
export function labelMatchesPrompt(label: string, prompt: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z ]/g, '')
      .trim();
  const a = norm(label);
  const b = norm(prompt);
  if (!a || !b) return false;
  return a === b || a === `${b}s` || a.split(' ').includes(b);
}
