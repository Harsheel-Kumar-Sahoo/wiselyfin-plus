export type SeedQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number; // position of the right option, starting from 0
  explanation: string;
};

export type SeedLesson = {
  slug: string;
  order: number;
  title: string;
  body: string; // plain text; a blank line starts a new paragraph
  rewardCoins?: number;
  rewardXp?: number;
  questions: SeedQuestion[];
};

export type SeedPath = {
  slug: string;
  order: number;
  icon: string;
  title: string;
  description: string;
  completionCoins: number;
  lessons: SeedLesson[];
};