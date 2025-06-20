import React, { useEffect } from 'react';
import { useMatch } from '../contexts/MatchContext';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Clock, Video, Pin, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const { 
    currentMatch, 
    messages, 
    loading, 
    canGetNewMatch, 
    timeUntilNewMatch,
    generateDailyMatch,
    isInReflectionPeriod,
    reflectionTimeRemaining
  } = useMatch();

  const currentMessages = currentMatch ? messages[currentMatch.id] || [] : [];
  const unreadCount = currentMessages.filter(msg => !msg.read && msg.senderId !== user?.id).length;

  const getTimeUntilExpiration = () => {
    if (!currentMatch?.matchExpiresAt) return null;
    
    const now = new Date().getTime();
    const expiration = new Date(currentMatch.matchExpiresAt).getTime();
    const hoursRemaining = Math.ceil((expiration - now) / (1000 * 60 * 60));
    
    return Math.max(0, hoursRemaining);
  };

  const hoursUntilExpiration = getTimeUntilExpiration();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your match...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 💜
        </h1>
        <p className="text-gray-600">
          Your thoughtful dating journey continues
        </p>
      </div>

      {/* Reflection Period Warning */}
      {isInReflectionPeriod && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-900">Reflection Period Active</h3>
              <p className="text-amber-700">
                You're in a 24-hour reflection period after unpinning your last match. 
                New matches will be available in {reflectionTimeRemaining} hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Match Section */}
      {currentMatch ? (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Pin className="w-5 h-5 text-purple-600" />
              <span>Your Daily Match</span>
            </h2>
            {hoursUntilExpiration !== null && (
              <div className="flex items-center space-x-2 text-amber-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {hoursUntilExpiration}h remaining
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Match Profile */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={currentMatch.avatar || `https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2`}
                  alt={currentMatch.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <span>{currentMatch.name}</span>
                    {currentMatch.isBot && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        AI Companion
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600">{currentMatch.age} • {currentMatch.location}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Compatibility</span>
                  <span className="font-medium text-purple-600">{currentMatch.compatibilityScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                    style={{ width: `${currentMatch.compatibilityScore}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {currentMatch.bio || 'No bio available'}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {currentMatch.interests.slice(0, 4).map(interest => (
                  <span
                    key={interest}
                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Match Stats */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{currentMatch.messageCount}</p>
                    <p className="text-gray-600">Messages Exchanged</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-purple-600" />
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: `${Math.min((currentMatch.messageCount / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {100 - currentMatch.messageCount} messages until video calling unlocks
                  </p>
                </div>
              </div>

              {currentMatch.videoCallUnlocked && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Video className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Video Calling Unlocked!</p>
                      <p className="text-green-700 text-sm">You can now start video calls</p>
                    </div>
                  </div>
                </div>
              )}

              {unreadCount > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900">{unreadCount} New Messages</p>
                      <p className="text-blue-700 text-sm">Continue your conversation</p>
                    </div>
                  </div>
                </div>
              )}

              <Link
                to={`/chat/${currentMatch.id}`}
                className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
              >
                Continue Conversation
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              <Pin className="w-4 h-4 inline mr-1" />
              This match is pinned by default. Take time to get to know each other before making any decisions.
            </p>
          </div>
        </div>
      ) : (
        /* No Current Match */
        <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-8">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          
          {canGetNewMatch ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready for Your Daily Match?</h2>
              <p className="text-gray-600 mb-6">
                We'll find you one carefully chosen person based on deep compatibility.
              </p>
              <button
                onClick={generateDailyMatch}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50"
              >
                {loading ? 'Finding Your Match...' : 'Get My Daily Match'}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {isInReflectionPeriod ? 'Reflection Period' : 'Next Match Coming Soon'}
              </h2>
              <p className="text-gray-600 mb-4">
                {isInReflectionPeriod 
                  ? 'Take time to reflect on your last match experience.'
                  : 'Your next daily match will be available soon.'
                }
              </p>
              <div className="flex items-center justify-center space-x-2 text-purple-600">
                <Clock className="w-5 h-5" />
                <span className="font-medium">
                  {timeUntilNewMatch} hours remaining
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Lone Town Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">One Match Per Day</h4>
            <p className="text-sm text-gray-600">
              Receive one carefully chosen match based on deep compatibility
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-pink-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Meaningful Conversations</h4>
            <p className="text-sm text-gray-600">
              100 messages in 48 hours unlocks video calling
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Pin className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Intentional Dating</h4>
            <p className="text-sm text-gray-600">
              Matches are pinned by default - invest or consciously move on
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}