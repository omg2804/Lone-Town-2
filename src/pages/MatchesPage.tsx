import React from 'react';
import { useMatch } from '../contexts/MatchContext';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Clock, Pin, AlertCircle } from 'lucide-react';

export default function MatchesPage() {
  const { currentMatch, isInReflectionPeriod, reflectionTimeRemaining } = useMatch();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Matches</h1>
        <p className="text-gray-600">
          Thoughtful, intentional connections - one at a time
        </p>
      </div>

      {/* Reflection Period Notice */}
      {isInReflectionPeriod && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-900">Reflection Period Active</h3>
              <p className="text-amber-700">
                Take time to reflect on your last match. New matches available in {reflectionTimeRemaining} hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Match */}
      {currentMatch ? (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Pin className="w-5 h-5 text-purple-600" />
              <span>Your Current Match</span>
            </h2>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
              Active
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <img
              src={currentMatch.avatar || `https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2`}
              alt={currentMatch.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <span>{currentMatch.name}</span>
                {currentMatch.isBot && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    AI Companion
                  </span>
                )}
              </h3>
              <p className="text-gray-600 mb-2">{currentMatch.age} • {currentMatch.location}</p>
              
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">
                    {currentMatch.compatibilityScore}% compatibility
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {currentMatch.messageCount} messages
                  </span>
                </div>
                
                {currentMatch.matchExpiresAt && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-amber-600">
                      {Math.ceil((new Date(currentMatch.matchExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60))}h remaining
                    </span>
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {currentMatch.bio || 'No bio available'}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {currentMatch.interests.slice(0, 5).map(interest => (
                  <span
                    key={interest}
                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <Link
              to={`/chat/${currentMatch.id}`}
              className="flex-1 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
            >
              Continue Conversation
            </Link>
          </div>
        </div>
      ) : (
        /* No Current Match */
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Match</h2>
          <p className="text-gray-600 mb-6">
            {isInReflectionPeriod 
              ? 'You\'re in a reflection period. Use this time to think about what you\'re looking for.'
              : 'Visit your dashboard to get your daily match when available.'
            }
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Lone Town Matching Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🎯 One Match Per Day</h4>
            <p className="text-sm text-gray-600 mb-4">
              Receive one carefully chosen match every 24 hours based on deep compatibility analysis.
            </p>
            
            <h4 className="font-medium text-gray-900 mb-2">📌 Pinned by Default</h4>
            <p className="text-sm text-gray-600 mb-4">
              Matches are automatically pinned, encouraging intentional conversation before any decisions.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">💬 Unlock Video Calling</h4>
            <p className="text-sm text-gray-600 mb-4">
              Exchange 100 messages within 48 hours to unlock video calling features.
            </p>
            
            <h4 className="font-medium text-gray-900 mb-2">🤔 Reflection Period</h4>
            <p className="text-sm text-gray-600">
              Unpinning triggers a 24-hour reflection period, while your match gets feedback and a new connection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}