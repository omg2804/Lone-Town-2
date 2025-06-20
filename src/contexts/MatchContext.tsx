import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Match, Message, MatchContextType } from '../types';
import { useAuth } from './AuthContext';
import { findDailyMatch } from '../utils/matchingAlgorithm';

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function useMatch() {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
}

interface MatchProviderProps {
  children: ReactNode;
}

export function MatchProvider({ children }: MatchProviderProps) {
  const { user, updateUser } = useAuth();
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<{ [matchId: string]: Message[] }>({});
  const [loading, setLoading] = useState(false);
  const [canGetNewMatch, setCanGetNewMatch] = useState(false);
  const [timeUntilNewMatch, setTimeUntilNewMatch] = useState(0);
  const [isInReflectionPeriod, setIsInReflectionPeriod] = useState(false);
  const [reflectionTimeRemaining, setReflectionTimeRemaining] = useState(0);

  useEffect(() => {
    if (user?.hasCompletedQuestionnaire) {
      loadCurrentMatch();
      checkMatchEligibility();
      checkReflectionPeriod();
    }
  }, [user]);

  useEffect(() => {
    // Update timers every minute
    const interval = setInterval(() => {
      checkMatchEligibility();
      checkReflectionPeriod();
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const checkReflectionPeriod = () => {
    if (!user) return;

    if (user.isInReflectionPeriod && user.reflectionEndsAt) {
      const now = new Date().getTime();
      const reflectionEnd = new Date(user.reflectionEndsAt).getTime();
      
      if (now < reflectionEnd) {
        setIsInReflectionPeriod(true);
        setReflectionTimeRemaining(Math.ceil((reflectionEnd - now) / (1000 * 60 * 60))); // Hours remaining
      } else {
        // Reflection period ended
        setIsInReflectionPeriod(false);
        setReflectionTimeRemaining(0);
        
        // Update user to remove reflection period
        const updatedUser = {
          ...user,
          isInReflectionPeriod: false,
          reflectionEndsAt: undefined
        };
        updateUser(updatedUser);
      }
    } else {
      setIsInReflectionPeriod(false);
      setReflectionTimeRemaining(0);
    }
  };

  const checkMatchEligibility = () => {
    if (!user) return;

    // If user is in reflection period, they can't get new matches
    if (user.isInReflectionPeriod && user.reflectionEndsAt) {
      const now = new Date().getTime();
      const reflectionEnd = new Date(user.reflectionEndsAt).getTime();
      
      if (now < reflectionEnd) {
        setCanGetNewMatch(false);
        setTimeUntilNewMatch(Math.ceil((reflectionEnd - now) / (1000 * 60 * 60)));
        return;
      }
    }

    // Check if user already has an active match
    if (user.currentMatch) {
      setCanGetNewMatch(false);
      setTimeUntilNewMatch(0);
      return;
    }

    // Check if user can get a new match (24 hours since last match)
    if (user.lastMatchDate) {
      const lastMatch = new Date(user.lastMatchDate).getTime();
      const now = new Date().getTime();
      const hoursSinceLastMatch = (now - lastMatch) / (1000 * 60 * 60);
      
      if (hoursSinceLastMatch < 24) {
        setCanGetNewMatch(false);
        setTimeUntilNewMatch(Math.ceil(24 - hoursSinceLastMatch));
      } else {
        setCanGetNewMatch(true);
        setTimeUntilNewMatch(0);
      }
    } else {
      // First time user, can get match immediately
      setCanGetNewMatch(true);
      setTimeUntilNewMatch(0);
    }
  };

  const loadCurrentMatch = async () => {
    if (!user?.currentMatch) {
      setCurrentMatch(null);
      return;
    }
    
    setLoading(true);
    try {
      // Load current match from localStorage
      const savedMatch = localStorage.getItem(`match_${user.currentMatch}`);
      const savedMessages = JSON.parse(localStorage.getItem(`messages_${user.id}`) || '{}');
      
      if (savedMatch) {
        const match = JSON.parse(savedMatch);
        
        // Check if match has expired (48 hours)
        const matchCreated = new Date(match.matchedAt).getTime();
        const now = new Date().getTime();
        const hoursElapsed = (now - matchCreated) / (1000 * 60 * 60);
        
        if (hoursElapsed >= 48 && match.status === 'active') {
          // Match expired
          match.status = 'expired';
          localStorage.setItem(`match_${match.id}`, JSON.stringify(match));
          
          // Remove current match from user
          const updatedUser = { ...user, currentMatch: undefined };
          updateUser(updatedUser);
          setCurrentMatch(null);
        } else {
          setCurrentMatch(match);
        }
      }
      
      setMessages(savedMessages);
    } catch (error) {
      console.error('Error loading current match:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyMatch = async () => {
    if (!user || !canGetNewMatch) return;
    
    setLoading(true);
    try {
      const newMatch = await findDailyMatch(user);
      
      if (newMatch) {
        // Set match expiration to 48 hours from now
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 48);
        newMatch.matchExpiresAt = expirationTime.toISOString();
        
        setCurrentMatch(newMatch);
        
        // Save match to localStorage
        localStorage.setItem(`match_${newMatch.id}`, JSON.stringify(newMatch));
        
        // Update user with current match and last match date
        const updatedUser = {
          ...user,
          currentMatch: newMatch.id,
          lastMatchDate: new Date().toISOString()
        };
        updateUser(updatedUser);
        
        // Update the other user if it's a real user
        if (!newMatch.isBot) {
          const allUsers = JSON.parse(localStorage.getItem('lonetonUsers') || '[]');
          const otherUserIndex = allUsers.findIndex((u: any) => u.id === newMatch.userId);
          
          if (otherUserIndex !== -1) {
            allUsers[otherUserIndex].currentMatch = newMatch.id;
            allUsers[otherUserIndex].lastMatchDate = new Date().toISOString();
            localStorage.setItem('lonetonUsers', JSON.stringify(allUsers));
          }
        }
      }
    } catch (error) {
      console.error('Error generating daily match:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (matchId: string, content: string) => {
    if (!user || !currentMatch) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const updatedMessages = {
      ...messages,
      [matchId]: [...(messages[matchId] || []), newMessage]
    };
    
    setMessages(updatedMessages);
    localStorage.setItem(`messages_${user.id}`, JSON.stringify(updatedMessages));
    
    // Update message count and check for video call unlock
    const updatedMatch = {
      ...currentMatch,
      messageCount: currentMatch.messageCount + 1,
      videoCallUnlocked: currentMatch.messageCount + 1 >= 100
    };
    
    setCurrentMatch(updatedMatch);
    localStorage.setItem(`match_${matchId}`, JSON.stringify(updatedMatch));
    
    // Simulate bot response for bot matches
    if (currentMatch.isBot) {
      setTimeout(() => {
        simulateBotResponse(matchId);
      }, 1000 + Math.random() * 2000);
    }
  };

  const simulateBotResponse = (matchId: string) => {
    if (!currentMatch?.isBot) return;
    
    const botResponses = [
      "That's really interesting! Tell me more about that.",
      "I completely understand what you mean.",
      "That sounds like a great experience!",
      "I've always been curious about that topic too.",
      "You seem like such a thoughtful person.",
      "I love your perspective on this!",
      "That's exactly how I feel about it.",
      "Thanks for sharing that with me.",
      "What made you feel that way?",
      "I'd love to hear more about your thoughts on this."
    ];
    
    const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
    
    const botMessage: Message = {
      id: Date.now().toString(),
      senderId: currentMatch.userId,
      content: randomResponse,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const updatedMessages = {
      ...messages,
      [matchId]: [...(messages[matchId] || []), botMessage]
    };
    
    setMessages(updatedMessages);
    localStorage.setItem(`messages_${user?.id}`, JSON.stringify(updatedMessages));
    
    // Update message count
    const updatedMatch = {
      ...currentMatch,
      messageCount: currentMatch.messageCount + 1,
      videoCallUnlocked: currentMatch.messageCount + 1 >= 100
    };
    
    setCurrentMatch(updatedMatch);
    localStorage.setItem(`match_${matchId}`, JSON.stringify(updatedMatch));
  };

  const unpinMatch = async (matchId: string, reason: string) => {
    if (!user || !currentMatch) return;
    
    // Update match status
    const updatedMatch = {
      ...currentMatch,
      status: 'unpinned' as const,
      unpinnedBy: user.id,
      unpinnedAt: new Date().toISOString(),
      isPinned: false
    };
    
    setCurrentMatch(null);
    localStorage.setItem(`match_${matchId}`, JSON.stringify(updatedMatch));
    
    // Start 24-hour reflection period for the user who unpinned
    const reflectionEnd = new Date();
    reflectionEnd.setHours(reflectionEnd.getHours() + 24);
    
    const updatedUser = {
      ...user,
      currentMatch: undefined,
      isInReflectionPeriod: true,
      reflectionEndsAt: reflectionEnd.toISOString(),
      unpinnedMatches: [...(user.unpinnedMatches || []), matchId]
    };
    
    updateUser(updatedUser);
    
    // If it's a real user match, give the other person a new match in 2 hours
    if (!currentMatch.isBot) {
      const allUsers = JSON.parse(localStorage.getItem('lonetonUsers') || '[]');
      const otherUserIndex = allUsers.findIndex((u: any) => u.id === currentMatch.userId);
      
      if (otherUserIndex !== -1) {
        const newMatchTime = new Date();
        newMatchTime.setHours(newMatchTime.getHours() + 2);
        
        allUsers[otherUserIndex].currentMatch = undefined;
        allUsers[otherUserIndex].lastMatchDate = newMatchTime.toISOString();
        localStorage.setItem('lonetonUsers', JSON.stringify(allUsers));
        
        // Store feedback for the other user
        const feedback = {
          matchId,
          reason,
          timestamp: new Date().toISOString(),
          fromUser: user.name
        };
        
        const existingFeedback = JSON.parse(localStorage.getItem(`feedback_${currentMatch.userId}`) || '[]');
        existingFeedback.push(feedback);
        localStorage.setItem(`feedback_${currentMatch.userId}`, JSON.stringify(existingFeedback));
      }
    }
  };

  const markMessagesAsRead = (matchId: string) => {
    const matchMessages = messages[matchId] || [];
    const updatedMatchMessages = matchMessages.map(msg => ({ ...msg, read: true }));
    
    const updatedMessages = {
      ...messages,
      [matchId]: updatedMatchMessages
    };
    
    setMessages(updatedMessages);
    localStorage.setItem(`messages_${user?.id}`, JSON.stringify(updatedMessages));
  };

  const value: MatchContextType = {
    currentMatch,
    messages,
    loading,
    canGetNewMatch,
    timeUntilNewMatch,
    generateDailyMatch,
    sendMessage,
    markMessagesAsRead,
    unpinMatch,
    isInReflectionPeriod,
    reflectionTimeRemaining
  };

  return (
    <MatchContext.Provider value={value}>
      {children}
    </MatchContext.Provider>
  );
}