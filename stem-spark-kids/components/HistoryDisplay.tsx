
import React from 'react';
import { HistoryEntry, ExplanationFormat } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';

interface HistoryDisplayProps {
  history: HistoryEntry[];
  onViewEntry: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
}

const getFormatLabel = (format: ExplanationFormat): string => {
  switch (format) {
    case ExplanationFormat.PLAIN: return "Plain";
    case ExplanationFormat.ANALOGY: return "Analogy";
    case ExplanationFormat.STORY: return "Story";
    case ExplanationFormat.COMIC: return "Comic";
    case ExplanationFormat.QUIZ: return "Quiz";
    default: 
      // This case should ideally not be reached if `format` is always a valid ExplanationFormat
      // However, to be safe and handle potential future states or type mismatches:
      const exhaustiveCheck: never = format; 
      // If new formats are added to enum but not here, TS will warn about exhaustiveCheck
      // For runtime, return the format as string or a default.
      console.warn(`Unknown format in getFormatLabel: ${exhaustiveCheck}`);
      return String(format);
  }
};

export const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onViewEntry, onClearHistory }) => {
  if (history.length === 0) {
    return null; 
  }

  return (
    <section className="mt-12 p-6 sm:p-8 bg-white rounded-xl shadow-lg" aria-labelledby="history-heading"> {/* Changed shadow-2xl to shadow-lg */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <h2 id="history-heading" className="text-2xl sm:text-3xl font-bold text-indigo-700 flex items-center mb-4 sm:mb-0">
          <HistoryIcon className="w-7 h-7 sm:w-8 sm:h-8 mr-2.5 text-indigo-600" />
          Your Learning Journey
        </h2>
        <button
          onClick={onClearHistory}
          className="flex items-center self-start sm:self-center px-4 py-2 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          aria-label="Clear all history entries"
        >
          <TrashIcon className="w-4 h-4 mr-1.5" />
          Clear History
        </button>
      </div>
      <ul className="space-y-4">
        {history.map((entry) => (
          <li key={entry.id} className="p-3.5 sm:p-4 bg-slate-50 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
              <div className="mb-3 sm:mb-0 flex-grow mr-4">
                <h3 className="text-md sm:text-lg font-semibold text-slate-800 truncate" title={entry.topic}>
                  {entry.topic}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Format: <span className="font-medium text-slate-700">{getFormatLabel(entry.format)}</span> | Age: <span className="font-medium text-slate-700">{entry.ageLevel}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => onViewEntry(entry)}
                className="flex items-center justify-center sm:justify-start w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 whitespace-nowrap"
                aria-label={`View history entry for ${entry.topic}`}
              >
                <EyeIcon className="w-5 h-5 mr-1.5 -ml-0.5" /> 
                View
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};