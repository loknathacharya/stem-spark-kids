import { ExplanationFormat } from './types';

export const APP_TITLE = "STEM Spark Kids";

export const DEFAULT_TOPIC = "Photosynthesis";
export const MIN_AGE_LEVEL = 4;
export const MAX_AGE_LEVEL = 12;
export const DEFAULT_AGE_LEVEL = 8; 
export const DEFAULT_FORMAT = ExplanationFormat.STORY;
export const DEFAULT_LANGUAGE = "English";
export const DEFAULT_READ_ALOUD = true;

// AGE_OPTIONS is removed as we are using a slider

export const FORMAT_OPTIONS = [
  { value: ExplanationFormat.PLAIN, label: "Plain Explanation" },
  { value: ExplanationFormat.ANALOGY, label: "Analogy" },
  { value: ExplanationFormat.STORY, label: "Story Time" },
  { value: ExplanationFormat.COMIC, label: "Comic Dialogue" },
  { value: ExplanationFormat.QUIZ, label: "Quick Quiz" },
];

export const MAX_HISTORY_ITEMS = 20;