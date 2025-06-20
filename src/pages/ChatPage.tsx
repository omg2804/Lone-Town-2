import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMatch } from '../contexts/MatchContext';
import { useAuth } from '../contexts/AuthContext';
import { Send, ArrowLeft, MoreVertical, Heart, Pin, PinOff, Video, Clock, AlertTriangle } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentMatch, messages, sendMessage, markMessagesAsRead, unpinMatch } = useMatch();
  const [newMessage, setNewMessage] = useState('');
  const [showUnpinModal, setShowUnpinModal] = useState(false);
  const [unpinReason, setUnpinReason] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMessages = messages[matchId || ''] || [];

  useEffect(() => {
    if (matchId) {
      markMessagesAsRead(matchId);
    }
  }, [matchId, markMessagesAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !matchId) return;
    
    sendMessage(matchId, newMessage.trim());
    setNewMessage('');
  };

  const handleUnpinMatch = async () => {
    if (!matchId || !unpinReason.trim()) return;
    
    await unpinMatch(matchId, unpinReason);
    setShowUnpinModal(false);
    navigate('/dashboard');
  };

  const getTimeUntilExpiration = () => {
    if (!currentMatch?.matchExpiresAt) return null;
    
    const now = new Date().getTime();
    const expiration = new Date(currentMatch.matchExpiresAt).getTime();
    const hoursRemaining = Math.ceil((expiration - now) / (1000 * 60 * 60));
    
    return Math.max(0, hoursRemaining);
  };

  const hoursUntilExpiration = getTimeUntilExpiration();

  if (!currentMatch || currentMatch.id !== matchId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Match not found or no longer active</p>
          <Link to="/dashboard" className="text-purple-600 hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              to="/dashboard"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <img
              src={currentMatch.avatar || `https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2`}
              alt={currentMatch.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            
            <div>
              <h1 className="font-semibold text-gray-900 flex items-center space-x-2">
                <span>{currentMatch.name}</span>
                {currentMatch.isBot && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    AI
                  </span>
                )}
                <Pin className="w-4 h-4 text-purple-600" title="Pinned Match" />
              </h1>
              <p className="text-sm text-gray-600">
                {currentMatch.compatibilityScore}% compatibility • {currentMatch.location}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {hoursUntilExpiration !== null && (
              <div className="flex items-center space-x-1 text-amber-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{hoursUntilExpiration}h</span>
              </div>
            )}
            
            {currentMatch.videoCallUnlocked && (
              <button className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Video call available">
                <Video className="w-5 h-5" />
              </button>
            )}
            
            <button 
              onClick={() => setShowUnpinModal(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Unpin match"
            >
              <PinOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Match Info Banner */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-center space-x-2">
          <Heart className="w-4 h-4 text-purple-600" />
          <p className="text-sm text-gray-700">
            Daily match • {currentMatch.messageCount}/100 messages • 
            {currentMatch.videoCallUnlocked ? ' Video calling unlocked!' : ` ${100 - currentMatch.messageCount} until video calling`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Daily Match!</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              You and {currentMatch.name} have {currentMatch.compatibilityScore}% compatibility. 
              This is your exclusive match for today - take time to get to know each other.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-2 text-amber-700">
                <Pin className="w-4 h-4" />
                <span className="text-sm font-medium">This match is pinned by default</span>
              </div>
              <p className="text-xs text-amber-600 mt-1">
                Invest in meaningful conversation or consciously choose to move on
              </p>
            </div>
          </div>
        ) : (
          chatMessages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.senderId === user?.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderId === user?.id ? 'text-purple-100' : 'text-gray-500'
                  }`}
                >
                  {formatDate(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${currentMatch.name}...`}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Unpin Modal */}
      {showUnpinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">Unpin Match</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Unpinning will end this match and start a 24-hour reflection period. 
              {!currentMatch.isBot && ` ${currentMatch.name} will receive feedback and get a new match in 2 hours.`}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are you unpinning? (This helps us improve matches)
              </label>
              <textarea
                value={unpinReason}
                onChange={(e) => setUnpinReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Different life goals, lack of chemistry, communication style..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUnpinModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Keep Match
              </button>
              <button
                onClick={handleUnpinMatch}
                disabled={!unpinReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Unpin Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}