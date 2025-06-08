import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { InputFormData } from '../components/InputForm';
import { ExplanationFormat, QuizQuestion, GenerationOutput } from "../types";

const constructPrompt = (data: InputFormData): string => {
  let formatSpecificInstructions = "";
  switch (data.format) {
    case ExplanationFormat.PLAIN:
      formatSpecificInstructions = "Provide a clear, simplified explanation with relatable examples appropriate for the child's age.";
      break;
    case ExplanationFormat.ANALOGY:
      formatSpecificInstructions = "Compare the topic to something familiar to a child of that age. Make the analogy easy to understand and directly relevant to the core concept.";
      break;
    case ExplanationFormat.STORY:
      formatSpecificInstructions = "Tell a short, imaginative narrative or scenario featuring the topic. The story should be simple, engaging for a child, and directly related to explaining the concept. Ensure the story has a clear beginning, middle, and end that helps illustrate the topic.";
      break;
    case ExplanationFormat.COMIC:
      formatSpecificInstructions = `Write a script for a short, engaging comic dialogue aimed at children.
The comic should explain the topic: "${data.topic}" in a fun, visual, and easy-to-understand way for a ${data.ageLevel}-year-old.
The script should feature 2-3 simple, friendly characters (e.g., "Pip" the curious mouse, "Sparky" the energetic squirrel, "Professor Whiskers" the wise old owl).
The script must:
- Clearly label speaker turns (e.g., "Pip:", "Sparky:", "Professor Whiskers:").
- Include brief, parenthetical descriptions for simple actions, expressions, or scene settings (e.g., "(Pip scratches head, looking confused)", "(Panel: They are looking at a large diagram of a plant cell)", "(Sparky jumps up and down excitedly)").
- Ensure the language is age-appropriate, engaging, and uses simple vocabulary.
- The main goal is to explain the topic effectively through their dialogue and the described visual cues.
- Keep the overall comic dialogue concise, ideally fitting into a few panels if it were drawn.
- Example snippet:
  Pip: Professor Whiskers, what IS photosynthesis? (Pip looks up, puzzled, at a large green leaf)
  Professor Whiskers: (Smiling gently) Ah, Pip! Photosynthesis is like a plant's way of making its own food! (Panel: Professor Whiskers points to the sun and then to the leaf)
  Sparky: Food? Like nuts and berries? (Sparky holds up an acorn)
  Professor Whiskers: Sort of, Sparky! But they use sunlight, water, and air to make a special sugar. That's their energy!
`;
      break;
    case ExplanationFormat.QUIZ:
      formatSpecificInstructions = `Create an age-appropriate multiple-choice quiz about the topic "${data.topic}".
The quiz should consist of 3 to 4 questions.
For each question, provide:
1.  A "question" text.
2.  An array of "options" (strings), typically 3 or 4 choices.
3.  A "correctAnswerIndex" (a zero-based number indicating which option is correct).
4.  A brief "explanation" for why the answer is correct, to be shown after the user answers.

Return the quiz as a JSON array of objects, where each object represents a question and follows this exact structure:
{
  "question": "string",
  "options": ["string", "string", ...],
  "correctAnswerIndex": number,
  "explanation": "string"
}
Ensure the entire response is a single valid JSON array. The language for the quiz content (questions, options, explanations) should be ${data.language}.`;
      break;
    default:
      // Should not happen if all formats are handled
      console.warn(`Unknown format encountered in constructPrompt: ${data.format}`);
      formatSpecificInstructions = "Provide a clear explanation.";
      break;
  }

  if (data.format === ExplanationFormat.QUIZ) {
    return formatSpecificInstructions; 
  }

  const readAloudInstructions = data.readAloud 
    ? "Craft the explanation to be easily read aloud. Use smooth, natural phrasing, simple vocabulary suitable for the age, and structure sentences with clear pauses or breaks where appropriate (e.g., after sentences or distinct ideas). The goal is a text that sounds good and is easy to follow when spoken."
    : "Ensure the explanation is clear and concise.";

  const wordLimitInstruction = "Keep the explanation concise, ideally under 500 words.";

  return `
Explain the topic: "${data.topic}"
To a child who is ${data.ageLevel} years old.
Use the "${data.format}" format.
The explanation should be in ${data.language}.
${readAloudInstructions}
${wordLimitInstruction}

Specific instructions for the "${data.format}" format:
${formatSpecificInstructions}

Please generate the content now.
  `;
};

const generateSuggestedTopic = async (ai: GoogleGenAI, originalTopic: string, ageLevel: number, language: string): Promise<string | null> => {
  try {
    const prompt = `A child (age ${ageLevel}) just learned about the topic: '${originalTopic}' in ${language}.
Suggest one engaging and closely related STEM topic that this child might be curious to learn about next.
Provide ONLY the name of the suggested topic as a short, concise string (e.g., 'Volcanoes', 'The Life Cycle of a Butterfly', 'Simple Machines').
The suggested topic should also be in ${language}.
Do not add any introductory phrases like 'A good next topic could be:' or any explanation for your suggestion. Just the topic name itself.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        temperature: 0.8, 
        topP: 0.95,
        topK: 40,
      }
    });
    
    const suggestedTopicText = response.text?.trim();
    if (suggestedTopicText) {
      return suggestedTopicText.replace(/^["'`]*(.*?)["'`]*$/, "$1");
    }
    return null;
  } catch (error) {
    console.error("Error generating suggested topic:", error);
    return null; 
  }
};


export const generateExplanation = async (data: InputFormData): Promise<GenerationOutput> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY environment variable is not set.");
    throw new Error("API key is missing. Please ensure the API_KEY environment variable is configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = "You are a friendly, patient, and enthusiastic AI assistant for a children’s STEM learning app. Your goal is to explain scientific and technical concepts to children in an engaging, encouraging, and easily understandable way. Always use a warm, positive, and encouraging tone. Keep sentences short, use simple language, and focus on the main ideas. Avoid complex jargon unless you explain it very simply. For quizzes, strictly adhere to the requested JSON format. For other formats, aim for a maximum of 500 words unless the specific format (like a story or comic) inherently requires more length to be coherent, but still prioritize conciseness.";

  const model = 'gemini-2.5-flash-preview-04-17';
  const promptContent = constructPrompt(data);

  const config: {
      systemInstruction: string;
      temperature: number;
      topP: number;
      topK: number;
      responseMimeType?: "application/json";
  } = {
    systemInstruction: systemInstruction,
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
  };

  if (data.format === ExplanationFormat.QUIZ) {
    config.responseMimeType = "application/json";
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: promptContent,
      config: config
    });
    
    let responseText = response.text; // Original response text from AI
    if (!responseText) {
      throw new Error("Received an empty response from the AI.");
    }

    let explanationResult: string | QuizQuestion[];
    let suggestedTopic: string | null = null;

    if (data.format === ExplanationFormat.QUIZ) {
      let textToParse = responseText; // This will be the string we attempt to parse

      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```lang\nCODE\n```
      const match = responseText.match(fenceRegex);
      
      if (match && match[2]) { // match[2] is the code block content
        textToParse = match[2].trim();
        console.info("Extracted JSON from fenced code block for parsing.");
      } else {
        textToParse = responseText.trim(); // Trim the original response if no fence
        console.info("No fenced JSON block found, attempting to parse trimmed response text as JSON.");
      }

      try {
        const parsedQuiz = JSON.parse(textToParse);
        if (Array.isArray(parsedQuiz) && parsedQuiz.every(q => q.question && Array.isArray(q.options) && typeof q.correctAnswerIndex === 'number' && q.explanation)) {
          explanationResult = parsedQuiz as QuizQuestion[];
        } else {
          console.error("Parsed data does not match QuizQuestion[] structure:", parsedQuiz);
          throw new Error(`AI returned data in an unexpected structure for a quiz. Parsed data preview: ${JSON.stringify(parsedQuiz)?.substring(0, 500)}...`);
        }
      } catch (e) {
        console.error("Failed to parse JSON response for quiz.", e);
        console.error("Original raw response from AI:", responseText); // Log the original, unaltered response
        if (textToParse !== responseText && textToParse !== responseText.trim()) { // Log what was attempted if different
          console.error("Text attempted for parsing (after fence extraction/trimming):", textToParse);
        }
        throw new Error("AI returned an invalid quiz format. Please try generating again. Check console for raw response and parsing details.");
      }
    } else {
      explanationResult = responseText;
      // Generate suggested topic for all non-quiz formats.
      suggestedTopic = await generateSuggestedTopic(ai, data.topic, data.ageLevel, data.language);
    }
    
    return { explanationResult, suggestedTopic };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      // Append more specific message if it's our custom parsing error message
      if (error.message.startsWith("AI returned an invalid quiz format") || error.message.startsWith("AI returned data in an unexpected structure")) {
         throw error; // Re-throw our specific error
      }
      throw new Error(`AI service error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while communicating with the AI service.");
  }
};