export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  interests: string[];
  location: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  createdAt: string;
  hasCompletedQuestionnaire: boolean;
  compatibilityAnswers: number[];
  currentMatch?: string; // Current active match ID
  lastMatchDate?: string; // Last time they received a match
  isInReflectionPeriod?: boolean;
  reflectionEndsAt?: string;
  unpinnedMatches: string[]; // Matches they've unpinned
}

export interface Match {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  bio?: string;
  compatibilityScore: number;
  matchedAt: string;
  isBot: boolean;
  interests: string[];
  location: string;
  age: number;
  lastActive?: string;
  isPinned: boolean;
  pinnedBy: string[]; // Array of user IDs who have this match pinned
  unpinnedBy?: string; // User ID who unpinned (if any)
  unpinnedAt?: string;
  status: 'active' | 'unpinned' | 'completed' | 'expired';
  messageCount: number;
  videoCallUnlocked: boolean;
  matchExpiresAt?: string; // 48 hours from match creation
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: 'scale' | 'multiple-choice' | 'boolean';
  options?: string[];
  weight: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'hasCompletedQuestionnaire' | 'compatibilityAnswers' | 'currentMatch' | 'unpinnedMatches'>) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  loading: boolean;
}

export interface MatchContextType {
  currentMatch: Match | null;
  messages: { [matchId: string]: Message[] };
  loading: boolean;
  canGetNewMatch: boolean;
  timeUntilNewMatch: number;
  generateDailyMatch: () => Promise<void>;
  sendMessage: (matchId: string, content: string) => void;
  markMessagesAsRead: (matchId: string) => void;
  unpinMatch: (matchId: string, reason: string) => Promise<void>;
  isInReflectionPeriod: boolean;
  reflectionTimeRemaining: number;
}