import React, { useState, useCallback } from 'react';
import { QuizQuestion } from '../types';

interface QuizViewProps {
  quizTitle: string;
  questions: QuizQuestion[];
}

export const QuizView: React.FC<QuizViewProps> = ({ quizTitle, questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = useCallback((selectedIndex: number) => {
    if (showFeedback) return; 

    setSelectedAnswerIndex(selectedIndex);
    setShowFeedback(true);
    if (selectedIndex === currentQuestion.correctAnswerIndex) {
      setScore(prevScore => prevScore + 1);
    }
  }, [currentQuestion, showFeedback]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswerIndex(null);
      setShowFeedback(false);
    } else {
      setIsQuizFinished(true);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleRestartQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setShowFeedback(false);
    setScore(0);
    setIsQuizFinished(false);
  }, []);

  if (!questions || questions.length === 0) {
    return (
      <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg text-yellow-700">
        <p>No quiz questions available for this topic. Try generating again!</p>
      </div>
    );
  }
  
  if (isQuizFinished) {
    return (
      <div className="mt-8 p-8 bg-sky-100 rounded-xl shadow-xl text-center">
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">{quizTitle} - Results!</h2>
        <p className="text-xl text-slate-700 mb-6">
          You scored <span className="font-bold text-2xl text-indigo-600">{score}</span> out of <span className="font-bold text-2xl text-indigo-600">{questions.length}</span>!
        </p>
        <button
          onClick={handleRestartQuiz}
          className="px-8 py-3.5 border border-transparent text-lg font-semibold rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 sm:p-8 bg-slate-100 rounded-xl shadow-xl">
      <h2 className="text-3xl font-bold text-indigo-700 mb-2">{quizTitle}</h2>
      <p className="text-base text-slate-600 mb-6">Question {currentQuestionIndex + 1} of {questions.length}</p>
      
      <div className="mb-6 p-5 bg-white rounded-lg shadow-md">
        <p className="text-xl font-semibold text-slate-800">{currentQuestion.question}</p>
      </div>

      <div className="space-y-3.5 mb-6">
        {currentQuestion.options.map((option, index) => {
          let buttonClass = "w-full text-left px-5 py-3.5 border rounded-lg transition-all duration-150 ease-in-out text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500";
          if (showFeedback) {
            if (index === currentQuestion.correctAnswerIndex) {
              buttonClass += " bg-green-200 border-green-400 text-green-800 font-semibold";
            } else if (index === selectedAnswerIndex) {
              buttonClass += " bg-red-200 border-red-400 text-red-800";
            } else {
               buttonClass += " border-slate-300 bg-slate-50 opacity-60 cursor-not-allowed";
            }
          } else {
             buttonClass += " border-slate-300 bg-white hover:bg-indigo-50 hover:border-indigo-400";
          }
           if (selectedAnswerIndex === index && !showFeedback) { // Highlight selection before feedback
            buttonClass += " ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50";
          }


          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showFeedback}
              className={buttonClass}
              aria-pressed={selectedAnswerIndex === index}
            >
              <span className="font-medium mr-2.5">{String.fromCharCode(65 + index)}.</span> {option}
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className={`p-4 rounded-md mb-6 text-base ${selectedAnswerIndex === currentQuestion.correctAnswerIndex ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
          <p className="font-bold mb-1.5 text-lg">
            {selectedAnswerIndex === currentQuestion.correctAnswerIndex ? 'Correct! 🎉' : 'Not quite! 🤔'}
          </p>
          <p>{currentQuestion.explanation}</p>
        </div>
      )}

      {showFeedback && (
        <button
          onClick={handleNextQuestion}
          className="w-full px-6 py-3.5 border border-transparent text-lg font-semibold rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Show Results'}
        </button>
      )}
    </div>
  );
};