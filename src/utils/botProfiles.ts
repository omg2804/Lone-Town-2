// import { User, Match } from '../types';

// const BOT_PROFILES = [
//   {
//     name: "Emma",
//     bio: "I believe in deep conversations and meaningful connections. Love exploring philosophy, art, and the mysteries of human nature.",
//     avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
//     interests: ["philosophy", "art", "reading", "meditation"],
//     location: "San Francisco, CA",
//     age: 26
//   },
//   {
//     name: "Alex",
//     bio: "Thoughtful soul who values authentic connections. I enjoy quiet moments, deep discussions, and understanding what makes people tick.",
//     avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
//     interests: ["psychology", "music", "writing", "nature"],
//     location: "Austin, TX",
//     age: 29
//   },
//   {
//     name: "Maya",
//     bio: "I believe every person has a unique story worth discovering. Love meaningful conversations that go beyond the surface.",
//     avatar: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
//     interests: ["storytelling", "yoga", "traveling", "cooking"],
//     location: "Portland, OR",
//     age: 24
//   },
//   {
//     name: "Jordan",
//     bio: "Seeking genuine connections built on mutual understanding and respect. I value emotional intelligence and authentic communication.",
//     avatar: "https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
//     interests: ["mindfulness", "hiking", "photography", "volunteering"],
//     location: "Denver, CO",
//     age: 31
//   },
//   {
//     name: "Sofia",
//     bio: "Life is about the connections we make and the growth we experience together. Looking for someone who values depth over surface.",
//     avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
//     interests: ["literature", "coffee", "learning", "empathy"],
//     location: "Seattle, WA",
//     age: 27
//   },
//   {
//     name: "Ryan",
//     bio: "Believer in slow, intentional relationships. I think the best connections develop naturally through genuine understanding and patience.",
//     avatar: "https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
//     interests: ["mindful living", "gardening", "music", "reflection"],
//     location: "New York, NY",
//     age: 33
//   }
// ];

// export function generateBotProfiles(user: User, count: number): Match[] {
//   const shuffled = [...BOT_PROFILES].sort(() => 0.5 - Math.random());
//   const selected = shuffled.slice(0, count);
  
//   return selected.map((bot, index) => ({
//     id: `bot_${user.id}_${index}_${Date.now()}`,
//     userId: `bot_${bot.name.toLowerCase()}_${Date.now()}`,
//     name: bot.name,
//     avatar: bot.avatar,
//     bio: bot.bio,
//     compatibilityScore: Math.floor(Math.random() * 15) + 85, // 85-99% compatibility for bots
//     matchedAt: new Date().toISOString(),
//     isBot: true,
//     interests: bot.interests,
//     location: bot.location,
//     age: bot.age,
//     lastActive: new Date().toISOString(),
//     isPinned: true,
//     pinnedBy: [user.id],
//     status: 'active' as const,
//     messageCount: 0,
//     videoCallUnlocked: false
//   }));
// }