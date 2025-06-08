
import React, { useState, useEffect, useCallback } from 'react';
import { LoadingIcon } from './icons/LoadingIcon';
import { QuizQuestion, ExplanationFormat } from '../types';
import { QuizView } from './QuizView';
import * as speechService from '../services/speechService';
import { SpeakerPlayIcon } from './icons/SpeakerPlayIcon';
import { SpeakerStopIcon } from './icons/SpeakerStopIcon';
import { SpeakerPauseIcon } from './icons/SpeakerPauseIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
// import { MicrophoneIcon } from './icons/MicrophoneIcon'; // Not currently used

interface OutputDisplayProps {
  output: string | QuizQuestion[] | null;
  suggestedTopic: string | null;
  isLoading: boolean;
  error: string | null;
  topic: string;
  format: ExplanationFormat;
  language: string; 
  selectedVoiceURI: string | null;
  onSuggestTopicClick: (topic: string) => void;
}

type SpeechState = 'stopped' | 'playing' | 'paused';

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ 
  output, 
  suggestedTopic,
  isLoading, 
  error, 
  topic, 
  format, 
  language,
  selectedVoiceURI,
  onSuggestTopicClick
}) => {
  const [speechState, setSpeechState] = useState<SpeechState>('stopped');
  const [ttsError, setTtsError] = useState<string | null>(null);

  const handleSpeechEnd = useCallback(() => {
    setSpeechState('stopped');
  }, []);
  
  const handleSpeechError = useCallback((errorMessage: string) => {
    setSpeechState('stopped');
    console.error("TTS Error in OutputDisplay:", errorMessage);
    setTtsError(errorMessage || "An unexpected error occurred while trying to read the text aloud.");
  }, []);

  const handlePlayText = useCallback(async () => {
    if (typeof output !== 'string' || !output) return;
    setTtsError(null);
    setSpeechState('playing');
    await speechService.speak(output, language, handleSpeechEnd, handleSpeechError, selectedVoiceURI);
  }, [output, language, handleSpeechEnd, handleSpeechError, selectedVoiceURI]);
  
  const handlePause = useCallback(() => {
    speechService.pause();
    setSpeechState('paused');
  }, []);

  const handleResume = useCallback(() => {
    speechService.resume();
    setSpeechState('playing');
  }, []);

  const handleStop = useCallback(() => {
    speechService.stop();
    setSpeechState('stopped');
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const speaking = speechService.isSpeaking();
      const paused = speechService.isPaused();

      if (speaking && speechState !== 'playing') {
        setSpeechState('playing');
      } else if (paused && speechState !== 'paused') {
        setSpeechState('paused');
      } else if (!speaking && !paused && speechState !== 'stopped') {
        if (speechState === 'playing' || speechState === 'paused') { 
          setSpeechState('stopped');
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [speechState]);


  useEffect(() => {
    return () => {
      speechService.stop(); 
      setSpeechState('stopped'); 
    };
  }, [output]); 

  if (isLoading) {
    return (
      <div className="mt-6 p-6 bg-sky-50 rounded-lg shadow-md text-center text-sky-700">
        <LoadingIcon className="animate-spin mx-auto h-8 w-8 text-indigo-500 mb-3" />
        <p className="font-semibold text-md">Hold tight, little explorer! Crafting your explanation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-lg shadow-md text-red-700">
        <h3 className="font-bold text-lg mb-1.5">Oh no, a cosmic hiccup!</h3>
        <p className="text-sm">{error}</p>
        <p className="mt-2 text-xs">Please check your inputs, API key configuration, or try generating again.</p>
      </div>
    );
  }

  if (!output && !isLoading && !error) {
    return (
      <div className="mt-6 p-8 bg-slate-100 rounded-lg shadow-inner text-center text-slate-500">
        <p className="text-md">Your amazing explanation will appear here!</p>
      </div>
    );
  }

  const renderSuggestedTopic = () => {
    if (!suggestedTopic || format === ExplanationFormat.QUIZ) return null;

    return (
      <div className="mt-6 pt-5 border-t border-dashed border-slate-300">
        <h3 className="text-lg font-semibold text-indigo-600 mb-2.5 flex items-center">
          <LightbulbIcon className="w-5 h-5 mr-2 text-yellow-400" />
          Explore Next:
        </h3>
        <button
          onClick={() => onSuggestTopicClick(suggestedTopic)}
          className="inline-block px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-150 ease-in-out transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
          title={`Learn about: ${suggestedTopic}`}
        >
          {suggestedTopic}
        </button>
      </div>
    );
  };
  
  const renderGenericSpeechControls = (playHandler: () => void) => {
    return (
      <div className="flex items-center space-x-1.5">
        {speechState === 'stopped' && (
          <button
            onClick={playHandler}
            className="p-2 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
            aria-label={"Read aloud"} 
            title={"Read aloud"}
          >
            <SpeakerPlayIcon className="w-6 h-6" />
          </button>
        )}
        {speechState === 'playing' && (
          <>
            <button
              onClick={handlePause}
              className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
              aria-label="Pause reading"
              title="Pause reading"
            >
              <SpeakerPauseIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleStop}
              className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
              aria-label="Stop reading"
              title="Stop reading"
            >
              <SpeakerStopIcon className="w-6 h-6" />
            </button>
          </>
        )}
        {speechState === 'paused' && (
          <>
            <button
              onClick={handleResume}
              className="p-2 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
              aria-label="Resume reading"
              title="Resume reading"
            >
              <SpeakerPlayIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleStop}
              className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
              aria-label="Stop reading"
              title="Stop reading"
            >
              <SpeakerStopIcon className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    );
  };


  if (format === ExplanationFormat.QUIZ && Array.isArray(output)) {
    return (
      <>
        <QuizView quizTitle={`Quiz on: ${topic}`} questions={output as QuizQuestion[]} />
      </>
    );
  }
  
  if (typeof output === 'string') { // Handles Plain, Analogy, Story, Comic
    const wordCount = output.split(/\s+/).filter(Boolean).length;
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-indigo-700">Here's Your Explanation!</h2>
          {output && renderGenericSpeechControls(handlePlayText)}
        </div>
        {ttsError && (
          <p className="text-xs text-red-600 mb-2.5 p-2.5 bg-red-50 border border-red-200 rounded-md" role="alert">{ttsError}</p>
        )}
        <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-lg shadow-md prose max-w-none whitespace-pre-wrap hover:shadow-lg transition-shadow duration-200">
          {output}
        </div>
        <div className="text-right text-xs text-slate-500 mt-1.5 pr-1" aria-label={`Word count: ${wordCount}`}>
          Word count: {wordCount}
        </div>
        {renderSuggestedTopic()}
      </div>
    );
  }

  return null; 
};