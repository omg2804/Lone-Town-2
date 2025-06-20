import { User, Match } from '../types';
//import { generateBotProfiles } from './botProfiles';

export async function findDailyMatch(user: User): Promise<Match | null> {
  // Get all users from localStorage
  const allUsers = JSON.parse(localStorage.getItem('lonetonUsers') || '[]') as User[];
  
  // Filter potential matches:
  // 1. Not the current user
  // 2. Has completed questionnaire
  // 3. Doesn't have a current match
  // 4. Not in reflection period
  // 5. User hasn't unpinned them before
  const potentialMatches = allUsers.filter(u => 
    u.id !== user.id && 
    u.hasCompletedQuestionnaire &&
    u.compatibilityAnswers.length > 0 &&
    !u.currentMatch &&
    !u.isInReflectionPeriod &&
    !user.unpinnedMatches?.includes(u.id)
  );

  console.log('Current user:', user.name);
  console.log('Potential matches found:', potentialMatches.length);

  let bestMatch: Match | null = null;
  let highestCompatibility = 0;

  // Find the best compatibility match
  for (const potentialMatch of potentialMatches) {
    const compatibilityScore = calculateCompatibilityScore(
      user.compatibilityAnswers,
      potentialMatch.compatibilityAnswers
    );

    console.log(`Compatibility with ${potentialMatch.name}:`, compatibilityScore);

    // Only consider matches with very high compatibility (85% or higher for daily matches)
    if (compatibilityScore >= 85 && compatibilityScore > highestCompatibility) {
      highestCompatibility = compatibilityScore;
      bestMatch = {
        id: `match_${user.id}_${potentialMatch.id}_${Date.now()}`,
        userId: potentialMatch.id,
        name: potentialMatch.name,
        avatar: potentialMatch.avatar,
        bio: potentialMatch.bio,
        compatibilityScore,
        matchedAt: new Date().toISOString(),
        isBot: false,
        interests: potentialMatch.interests,
        location: potentialMatch.location,
        age: potentialMatch.age,
        lastActive: new Date().toISOString(),
        isPinned: true,
        pinnedBy: [user.id, potentialMatch.id],
        status: 'active',
        messageCount: 0,
        videoCallUnlocked: false
      };
    }
  }

  // If no high-compatibility user match found, create a bot match
  // if (!bestMatch) {
  //   console.log('No suitable user matches found, creating bot match');
  //   const botProfiles = generateBotProfiles(user, 1);
    
  //   if (botProfiles.length > 0) {
  //     const botProfile = botProfiles[0];
  //     bestMatch = {
  //       ...botProfile,
  //       id: `match_${user.id}_bot_${Date.now()}`,
  //       isPinned: true,
  //       pinnedBy: [user.id],
  //       status: 'active',
  //       messageCount: 0,
  //       videoCallUnlocked: false
  //     };
  //   }
  // }

  console.log('Selected match:', bestMatch?.name, 'Compatibility:', bestMatch?.compatibilityScore);
  return bestMatch;
}

function calculateCompatibilityScore(answers1: number[], answers2: number[]): number {
  if (!answers1 || !answers2 || answers1.length === 0 || answers2.length === 0) {
    return 0;
  }

  const minLength = Math.min(answers1.length, answers2.length);
  let totalDifference = 0;
  let maxPossibleDifference = 0;

  for (let i = 0; i < minLength; i++) {
    const difference = Math.abs(answers1[i] - answers2[i]);
    totalDifference += difference;
    maxPossibleDifference += 4; // Maximum difference on a 1-5 scale
  }

  // Convert to percentage (100% = perfect match, 0% = worst match)
  const similarity = 1 - (totalDifference / maxPossibleDifference);
  return Math.round(similarity * 100);
}

// Helper function to check if two users are compatible for daily matching
export function areUsersCompatibleForDailyMatch(user1: User, user2: User): boolean {
  if (!user1.compatibilityAnswers || !user2.compatibilityAnswers) return false;
  
  const compatibility = calculateCompatibilityScore(
    user1.compatibilityAnswers,
    user2.compatibilityAnswers
  );
  
  return compatibility >= 85; // High threshold for daily matches
}