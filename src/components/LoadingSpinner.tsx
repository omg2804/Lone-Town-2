import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin animation-delay-150"></div>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading Lone Town...</h2>
        <p className="mt-2 text-gray-500">Finding your perfect matches</p>
      </div>
    </div>
  );
}