
import React, { useState, useEffect, FormEvent } from 'react';
import { ExplanationFormat } from '../types';
import { FORMAT_OPTIONS, MIN_AGE_LEVEL, MAX_AGE_LEVEL } from '../constants';
import { LoadingIcon } from './icons/LoadingIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ComicBubbleIcon } from './icons/ComicBubbleIcon'; // Import the new icon

export interface InputFormData {
  topic: string;
  ageLevel: number;
  format: ExplanationFormat;
  language: string;
  readAloud: boolean;
}

interface InputFormProps {
  initialValues: InputFormData;
  onSubmit: (data: InputFormData) => Promise<void>;
  onFormChange: (newValues: Partial<InputFormData>) => void;
  isLoading: boolean;
  onToggleVoiceSettings: () => void;
}

const formatBlockStyles: Partial<Record<ExplanationFormat, { base: string; text: string; hover: string; selectedRing: string; selectedBg?: string; icon?: React.ElementType }>> = {
  [ExplanationFormat.PLAIN]: { base: 'bg-sky-100', text: 'text-sky-700', hover: 'hover:bg-sky-200', selectedRing: 'ring-sky-500', selectedBg: 'bg-sky-200' },
  [ExplanationFormat.ANALOGY]: { base: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:bg-emerald-200', selectedRing: 'ring-emerald-500', selectedBg: 'bg-emerald-200' },
  [ExplanationFormat.STORY]: { base: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:bg-amber-200', selectedRing: 'ring-amber-500', selectedBg: 'bg-amber-200' },
  [ExplanationFormat.COMIC]: { base: 'bg-violet-100', text: 'text-violet-700', hover: 'hover:bg-violet-200', selectedRing: 'ring-violet-500', selectedBg: 'bg-violet-200', icon: ComicBubbleIcon },
  [ExplanationFormat.QUIZ]: { base: 'bg-pink-100', text: 'text-pink-700', hover: 'hover:bg-pink-200', selectedRing: 'ring-pink-500', selectedBg: 'bg-pink-200' },
};


export const InputForm: React.FC<InputFormProps> = ({ initialValues, onSubmit, onFormChange, isLoading, onToggleVoiceSettings }) => {
  const [topic, setTopic] = useState(initialValues.topic);
  const [ageLevel, setAgeLevel] = useState(initialValues.ageLevel);
  const [format, setFormat] = useState(initialValues.format);
  const [language, setLanguage] = useState(initialValues.language);
  const [readAloud, setReadAloud] = useState(initialValues.readAloud);

  useEffect(() => {
    setTopic(initialValues.topic);
    setAgeLevel(initialValues.ageLevel);
    setFormat(initialValues.format);
    setLanguage(initialValues.language);
    setReadAloud(initialValues.readAloud);
  }, [initialValues]);
  
  const handleInputChange = <K extends keyof InputFormData,>(key: K, value: InputFormData[K]) => {
    onFormChange({ [key]: value });
  };

  const handleFormatChange = (selectedFormat: ExplanationFormat) => {
    setFormat(selectedFormat);
    handleInputChange('format', selectedFormat);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ topic, ageLevel, format, language, readAloud });
  };
  
  const inputBaseClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 text-slate-700 placeholder-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-150 ease-in-out";
  const labelBaseClass = "block text-base font-medium text-slate-600 mb-1";
  const blockButtonBaseClass = `p-3 rounded-lg shadow-sm font-medium text-center transition-all duration-150 ease-in-out transform focus:outline-none w-full flex items-center justify-center space-x-2`; // Added flex for icon


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {/* Left Column */}
        <div className="space-y-6 flex flex-col">
          <div>
            <label htmlFor="topic" className={labelBaseClass}>
              What to learn? <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => {setTopic(e.target.value); handleInputChange('topic', e.target.value);}}
              className={inputBaseClass}
              placeholder="e.g., Black Holes, Dinosaurs"
              required
              disabled={isLoading}
              aria-required="true"
            />
          </div>
          
          <div>
            <label htmlFor="ageLevel" className={labelBaseClass}>
              Explain for age: <span className="font-semibold text-indigo-600">{ageLevel}</span>
            </label>
            <input
              type="range"
              id="ageLevel"
              min={MIN_AGE_LEVEL}
              max={MAX_AGE_LEVEL}
              step="1"
              value={ageLevel}
              onChange={(e) => {
                const newAge = parseInt(e.target.value, 10);
                setAgeLevel(newAge);
                handleInputChange('ageLevel', newAge);
              }}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 mt-1.5"
              disabled={isLoading}
              aria-label={`Age level slider, current value ${ageLevel} years old`}
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1 px-0.5">
              <span>{MIN_AGE_LEVEL} yrs</span>
              <span>{MAX_AGE_LEVEL} yrs</span>
            </div>
          </div>

          <div>
            <label htmlFor="language" className={labelBaseClass}>
              Language
            </label>
            <input
              type="text"
              id="language"
              value={language}
              onChange={(e) => {setLanguage(e.target.value); handleInputChange('language', e.target.value);}}
              className={inputBaseClass}
              placeholder="e.g., English"
              disabled={isLoading}
            />
          </div>
           {/* Submit Button in the left column, smaller */}
          <div className="mt-auto pt-4"> {/* Pushes button to bottom of this column if space allows */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              aria-live="polite"
            >
              {isLoading ? (
                <>
                  <LoadingIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Generating...
                </>
              ) : (
                'Spark Explanation!'
              )}
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <label id="explanation-style-label" className={`${labelBaseClass} mb-1.5`}>
                Explanation Style <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col space-y-2.5" role="group" aria-labelledby="explanation-style-label"> {/* Changed from grid to flex flex-col */}
                {FORMAT_OPTIONS.map((option) => {
                  const styles = formatBlockStyles[option.value];
                  if (!styles) return null; 
                  const isSelected = format === option.value;
                  const IconComponent = styles.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleFormatChange(option.value)}
                      disabled={isLoading}
                      className={`
                        ${blockButtonBaseClass}
                        ${styles.base} ${styles.text} ${styles.hover}
                        ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-102 hover:shadow-sm'}
                        ${isSelected ? `ring-2 ring-offset-1 ${styles.selectedRing} scale-102 shadow-md ${styles.selectedBg || styles.base.replace('100', '200')}` : 'ring-1 ring-slate-300'}
                      `}
                      aria-pressed={isSelected}
                      aria-label={option.label}
                    >
                      {IconComponent && <IconComponent className="w-5 h-5" />}
                      <span>{option.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>
          
          <div className="flex items-center pt-1">
              <input
                  id="readAloud"
                  type="checkbox"
                  checked={readAloud}
                  onChange={(e) => {setReadAloud(e.target.checked); handleInputChange('readAloud', e.target.checked);}}
                  className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                  disabled={isLoading}
              />
              <label htmlFor="readAloud" className="ml-2 block text-sm text-slate-700">
                  Make it easy to read aloud?
              </label>
              <button 
                type="button" 
                onClick={onToggleVoiceSettings} 
                className="ml-3 p-1.5 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1 transition-colors"
                aria-label="Voice settings"
                title="Voice settings"
                disabled={isLoading}
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
          </div>
        </div>
      </div>
    </form>
  );
};