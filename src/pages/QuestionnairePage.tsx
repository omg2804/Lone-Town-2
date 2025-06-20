import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Question } from '../types';

const COMPATIBILITY_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'How important is career ambition in a partner?',
    type: 'scale',
    weight: 1
  },
  {
    id: 'q2',
    text: 'How much do you value spending time outdoors?',
    type: 'scale',
    weight: 1
  },
  {
    id: 'q3',
    text: 'How important is having similar political views?',
    type: 'scale',
    weight: 1
  },
  {
    id: 'q4',
    text: 'How much do you enjoy social gatherings and parties?',
    type: 'scale',
    weight: 1
  },
  {
    id: 'q5',
    text: 'How important is physical fitness in your daily life?',
    type: 'scale',
    weight: 1
  },
  {
    id: 'q6',
    text: 'How much do you value intellectual conversations?',
    type: 'scale',
    weight: 1
  },
  {
    id: 'q7',
    text: 'How important is financial stability?',
    type: 'scale',
    weight: 1
  },
  {
    id: 'q8',
    text: 'How much do you enjoy trying new experiences?',
    type: 'scale',
    weight: 1
  },
  {
    id: 'q9',
    text: 'How important is having a similar sense of humor?',
    type: 'scale',
    weight: 1
  },
  {
    id: 'q10',
    text: 'How much do you value quiet, intimate moments?',
    type: 'scale',
    weight: 1
  }
];

export default function QuestionnairePage() {
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < COMPATIBILITY_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    
    // Convert answers to array format
    const answersArray = COMPATIBILITY_QUESTIONS.map(q => answers[q.id] || 3);
    
    const updatedUser = {
      ...user,
      hasCompletedQuestionnaire: true,
      compatibilityAnswers: answersArray
    };
    
    updateUser(updatedUser);
    setLoading(false);
  };

  const question = COMPATIBILITY_QUESTIONS[currentQuestion];
  const isCurrentAnswered = answers[question.id] !== undefined;
  const allAnswered = COMPATIBILITY_QUESTIONS.every(q => answers[q.id] !== undefined);
  const progress = ((currentQuestion + 1) / COMPATIBILITY_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Compatibility Questionnaire</h1>
          <p className="mt-2 text-gray-600">
            Help us find your perfect matches by answering these questions honestly
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {COMPATIBILITY_QUESTIONS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {question.text}
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>Not Important</span>
                <span>Very Important</span>
              </div>
              <div className="flex justify-center space-x-4">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    onClick={() => handleAnswer(question.id, value)}
                    className={`w-12 h-12 rounded-full border-2 font-medium transition-all ${
                      answers[question.id] === value
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {currentQuestion < COMPATIBILITY_QUESTIONS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!isCurrentAnswered}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Processing...' : 'Complete Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}