
import React, { useState } from 'react';
import { AvailableVoice } from '../types';
import { VolumeIcon } from './icons/VolumeIcon'; 
import { CloseIcon } from './icons/CloseIcon'; 
import { SpeakerPlayIcon } from './icons/SpeakerPlayIcon';
import * as speechService from '../services/speechService';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: AvailableVoice[];
  selectedVoiceURI: string | null;
  onSelectVoice: (voiceURI: string) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  voices, 
  selectedVoiceURI, 
  onSelectVoice 
}) => {
  if (!isOpen) return null;

  const [testError, setTestError] = useState<string | null>(null);

  const handleTestVoice = (voice: AvailableVoice) => {
    setTestError(null); // Clear previous test error
    const testPhrase = "Hello, this is a test.";
    speechService.testVoice(
      voice.voiceURI, 
      testPhrase,
      voice.lang, // Pass the voice's specific language
      (error) => {
        // If the error is 'interrupted' or 'canceled', it's often due to
        // rapid clicks starting a new test (which calls stop()) or other
        // normal speech interruptions. We'll log it but not show it as a UI error.
        if (error === 'interrupted' || error === 'canceled') {
          console.info(`Test voice playback for "${voice.name}" was ${error}. This is often due to rapid user actions or normal speech cancellation.`);
          // testError state is already cleared at the start of handleTestVoice.
        } else {
          console.error(`Test voice error for "${voice.name}":`, error);
          setTestError(`Could not play test for ${voice.name}: ${error}`);
        }
      }
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-settings-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col p-0"
        onClick={(e) => e.stopPropagation()} 
      >
        <header className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200">
          <h2 id="voice-settings-title" className="text-xl font-semibold text-indigo-700 flex items-center">
            <VolumeIcon className="w-6 h-6 mr-2.5 text-indigo-600" />
            Select Speech Voice
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close voice settings"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </header>

        <div className="p-4 sm:p-5 overflow-y-auto">
          {testError && (
            <div className="mb-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm" role="alert">
              {testError}
            </div>
          )}
          {voices.length > 0 ? (
            <ul className="space-y-2.5">
              {voices.map((voice) => {
                const isSelected = voice.voiceURI === selectedVoiceURI;
                return (
                  <li key={voice.voiceURI || `${voice.name}-${voice.lang}`}>
                    <button
                      onClick={() => onSelectVoice(voice.voiceURI)}
                      className={`
                        w-full text-left p-3 rounded-md border transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400
                        flex items-center justify-between
                        ${isSelected 
                          ? 'bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-500' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }
                      `}
                      aria-pressed={isSelected}
                    >
                      <div className="flex-grow">
                        <p className={`font-semibold ${isSelected ? 'text-indigo-800' : 'text-slate-800'}`}>{voice.name}</p>
                        <p className={`text-xs ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>
                          Language: <span className="font-medium">{voice.lang}</span>{voice.default ? ' (Default)' : ''}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent voice selection when clicking test
                          handleTestVoice(voice);
                        }}
                        className={`p-1.5 rounded-full hover:bg-sky-200 transition-colors
                                    ${isSelected ? 'text-indigo-600 hover:text-indigo-700' : 'text-sky-600 hover:text-sky-700'}`}
                        aria-label={`Test voice ${voice.name}`}
                        title={`Test voice ${voice.name}`}
                      >
                        <SpeakerPlayIcon className="w-5 h-5" />
                      </button>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-slate-600 text-center py-6">
              No voices found, or your browser is still loading them.
              If your browser supports Web Speech API, voices should appear here. Try reopening this dialog.
            </p>
          )}
        </div>
        <footer className="p-4 sm:p-5 border-t border-slate-200 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              Close
            </button>
        </footer>
      </div>
    </div>
  );
};
