// The text of one lesson in one language. Questions and options must be in the SAME ORDER as the English.
export type LessonTranslation = {
  title: string;
  body: string;
  questions: Array<{
    prompt: string;
    options: string[];
    explanation: string;
  }>;
};

export type PathTranslation = {
  title: string;
  description: string;
  lessons: Record<string, LessonTranslation>; // the key is the lesson slug
};