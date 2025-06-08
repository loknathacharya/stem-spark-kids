
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm, InputFormData } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { HistoryDisplay } from './components/HistoryDisplay';
import { Footer } from './components/Footer';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { generateExplanation } from './services/geminiService';
import * as speechService from './services/speechService'; 
import { DEFAULT_TOPIC, DEFAULT_AGE_LEVEL, DEFAULT_FORMAT, DEFAULT_LANGUAGE, DEFAULT_READ_ALOUD, MAX_HISTORY_ITEMS } from './constants';
import { ExplanationFormat, QuizQuestion, HistoryEntry, AvailableVoice } from './types';


const LOCAL_STORAGE_HISTORY_KEY = 'stemSparkHistory';
const LOCAL_STORAGE_VOICE_URI_KEY = 'stemSparkSelectedVoiceURI';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>(DEFAULT_TOPIC);
  const [ageLevel, setAgeLevel] = useState<number>(DEFAULT_AGE_LEVEL);
  const [format, setFormat] = useState<ExplanationFormat>(DEFAULT_FORMAT);
  const [language, setLanguage] = useState<string>(DEFAULT_LANGUAGE);
  const [readAloud, setReadAloud] = useState<boolean>(DEFAULT_READ_ALOUD);

  const [output, setOutput] = useState<string | QuizQuestion[] | null>(null);
  const [suggestedTopic, setSuggestedTopic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<AvailableVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);

  useEffect(() => {
    const storedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory) as HistoryEntry[];
        setHistory(parsedHistory);
      } catch (e) {
        console.error("Failed to parse history from localStorage", e);
        localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
      }
    }
    
    const storedVoiceURI = localStorage.getItem(LOCAL_STORAGE_VOICE_URI_KEY);
    if (storedVoiceURI) {
      setSelectedVoiceURI(storedVoiceURI);
    }

    setAvailableVoices(speechService.getAvailableVoices()); 
    return () => {
      speechService.stop();
    };
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } else {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (storedHistory) {
         localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
      }
    }
  }, [history]);

  useEffect(() => {
    if (selectedVoiceURI) {
      localStorage.setItem(LOCAL_STORAGE_VOICE_URI_KEY, selectedVoiceURI);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_VOICE_URI_KEY);
    }
  }, [selectedVoiceURI]);


  const handleSubmit = useCallback(async (data: InputFormData) => {
    speechService.stop(); 
    setIsLoading(true);
    setError(null);
    setOutput(null); 
    setSuggestedTopic(null);
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY is not configured. Please set the API_KEY environment variable.");
      }
      const { explanationResult, suggestedTopic: newSuggestedTopic } = await generateExplanation(data);
      setOutput(explanationResult);
      setSuggestedTopic(newSuggestedTopic);
      
      const newHistoryEntry: HistoryEntry = {
        id: Date.now().toString(),
        topic: data.topic,
        ageLevel: data.ageLevel,
        format: data.format,
        language: data.language,
        readAloud: data.readAloud,
        output: explanationResult,
        suggestedTopic: newSuggestedTopic,
        timestamp: Date.now(),
      };
      setHistory(prevHistory => [newHistoryEntry, ...prevHistory].slice(0, MAX_HISTORY_ITEMS));
      
      setTopic(data.topic);
      setAgeLevel(data.ageLevel);
      setFormat(data.format);
      setLanguage(data.language);
      setReadAloud(data.readAloud);

    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to generate explanation: ${err.message}`);
      } else {
        setError('An unknown error occurred.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const currentInputData: InputFormData = {
    topic,
    ageLevel,
    format,
    language,
    readAloud,
  };
  
  const handleFormChange = useCallback((newValues: Partial<InputFormData>) => {
    if (newValues.topic !== undefined) setTopic(newValues.topic);
    if (newValues.ageLevel !== undefined) setAgeLevel(newValues.ageLevel);
    if (newValues.format !== undefined) setFormat(newValues.format);
    if (newValues.language !== undefined) setLanguage(newValues.language);
    if (newValues.readAloud !== undefined) setReadAloud(newValues.readAloud);
  }, []);

  const handleViewHistoryEntry = useCallback((entry: HistoryEntry) => {
    speechService.stop(); 
    setTopic(entry.topic);
    setAgeLevel(entry.ageLevel);
    setFormat(entry.format);
    setLanguage(entry.language);
    setReadAloud(entry.readAloud);
    setOutput(entry.output);
    setSuggestedTopic(entry.suggestedTopic);
    setError(null);
    setIsLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClearHistory = useCallback(() => {
    speechService.stop(); 
    setHistory([]);
    setOutput(null); 
    setSuggestedTopic(null);
    setError(null);
  }, []);

  const handleSuggestTopicClick = useCallback((newTopic: string) => {
    setTopic(newTopic); 
    setOutput(null);    
    setSuggestedTopic(null); 
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleToggleVoiceSettings = useCallback(() => {
    setAvailableVoices(speechService.getAvailableVoices());
    setShowVoiceSettings(prevShow => !prevShow);
  }, []);

  const handleSelectVoice = useCallback((voiceURI: string) => {
    setSelectedVoiceURI(voiceURI);
    // Optionally, could close modal here: setShowVoiceSettings(false);
  }, []);


  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-8 mb-12">
          <InputForm
            initialValues={currentInputData}
            onSubmit={handleSubmit}
            onFormChange={handleFormChange}
            isLoading={isLoading}
            onToggleVoiceSettings={handleToggleVoiceSettings}
          />
          <OutputDisplay 
            output={output} 
            suggestedTopic={suggestedTopic}
            isLoading={isLoading} 
            error={error} 
            topic={topic}
            format={format}
            language={language}
            selectedVoiceURI={selectedVoiceURI}
            onSuggestTopicClick={handleSuggestTopicClick}
          />
        </div>
        
        <HistoryDisplay
          history={history}
          onViewEntry={handleViewHistoryEntry}
          onClearHistory={handleClearHistory}
        />
        
        <VoiceSettingsModal
          isOpen={showVoiceSettings}
          onClose={() => setShowVoiceSettings(false)}
          voices={availableVoices}
          selectedVoiceURI={selectedVoiceURI}
          onSelectVoice={handleSelectVoice}
        />

      </main>
      <Footer />
    </div>
  );
};

export default App;
