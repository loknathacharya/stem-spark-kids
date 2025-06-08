
export enum ExplanationFormat {
  PLAIN = "plain",
  ANALOGY = "analogy",
  STORY = "story",
  COMIC = "comic", 
  QUIZ = "quiz",
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface GenerationOutput {
  explanationResult: string | QuizQuestion[];
  suggestedTopic: string | null;
}

export interface HistoryEntry {
  id: string;
  topic: string;
  ageLevel: number;
  format: ExplanationFormat;
  language: string;
  readAloud: boolean;
  output: string | QuizQuestion[];
  timestamp: number;
  suggestedTopic: string | null; // Added suggested topic
}

// Defines the structure for an available speech voice object
export interface AvailableVoice {
  name: string;
  lang: string;
  default: boolean;
  voiceURI: string;
}


// Defines the structure for a segment of a podcast script
// export interface PodcastSegment {
//   speaker: 'Techy Tia' | 'Curious Chris' | 'Narrator' | 'SFX';
//   text: string;
// }