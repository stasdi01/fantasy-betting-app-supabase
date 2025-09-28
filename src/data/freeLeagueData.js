// Free League System Data

// League ranks configuration
export const LEAGUE_RANKS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond'
};

// Rank display configuration
export const RANK_CONFIG = {
  [LEAGUE_RANKS.BRONZE]: {
    name: 'Bronze',
    icon: '🥉',
    color: '#cd7f32',
    gradient: 'linear-gradient(135deg, #cd7f32 0%, #b8732d 100%)'
  },
  [LEAGUE_RANKS.SILVER]: {
    name: 'Silver',
    icon: '🥈',
    color: '#c0c0c0',
    gradient: 'linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)'
  },
  [LEAGUE_RANKS.GOLD]: {
    name: 'Gold',
    icon: '🥇',
    color: '#ffd700',
    gradient: 'linear-gradient(135deg, #ffd700 0%, #ffcc00 100%)'
  },
  [LEAGUE_RANKS.PLATINUM]: {
    name: 'Platinum',
    icon: '💎',
    color: '#e5e4e2',
    gradient: 'linear-gradient(135deg, #e5e4e2 0%, #d3d3d3 100%)'
  },
  [LEAGUE_RANKS.DIAMOND]: {
    name: 'Diamond',
    icon: '💍',
    color: '#b9f2ff',
    gradient: 'linear-gradient(135deg, #b9f2ff 0%, #87ceeb 100%)'
  }
};

// Mock league statistics (broj korisnika po rangu)
export const mockLeagueStats = {
  bronze: 1247,
  silver: 623,
  gold: 234,
  platinum: 89,
  diamond: 34,
  total: 2227
};

// Mock monthly winners history
export const mockMonthlyWinners = {
  "2024-01": "Marko_Petrovic",
  "2024-02": "Ana_Milic",
  "2024-03": "Stefan_Jovanovic",
  "2024-04": "Milica_Stojanovic",
  "2024-05": "Nikola_Radovic",
  "2024-06": "Jovana_Nikolic",
  "2024-07": "Milos_Popovic",
  "2024-08": "Tamara_Stankovic",
  "2024-09": "Pera_Peric"
};

// Mock leaderboard data for current month (Top 3 from each rank)
export const mockFreeLeagueLeaderboard = [
  // Diamond League - Top 3
  {
    id: 1,
    username: "ProBetter23",
    profit: 245.7,
    rank: LEAGUE_RANKS.DIAMOND,
    bets: 128,
    winRate: 68.5,
    avatar: "🏆",
    rankPosition: 1
  },
  {
    id: 2,
    username: "DiamondKing",
    profit: 198.3,
    rank: LEAGUE_RANKS.DIAMOND,
    bets: 94,
    winRate: 61.2,
    avatar: "💎",
    rankPosition: 2
  },
  {
    id: 3,
    username: "EliteTrader",
    profit: 187.6,
    rank: LEAGUE_RANKS.DIAMOND,
    bets: 102,
    winRate: 59.8,
    avatar: "✨",
    rankPosition: 3
  },

  // Platinum League - Top 3
  {
    id: 4,
    username: "PlatinumAce",
    profit: 167.8,
    rank: LEAGUE_RANKS.PLATINUM,
    bets: 156,
    winRate: 55.8,
    avatar: "⭐",
    rankPosition: 1
  },
  {
    id: 5,
    username: "RiskTaker_Pro",
    profit: 134.2,
    rank: LEAGUE_RANKS.PLATINUM,
    bets: 87,
    winRate: 64.4,
    avatar: "⚡",
    rankPosition: 2
  },
  {
    id: 6,
    username: "PlatinumStar",
    profit: 125.9,
    rank: LEAGUE_RANKS.PLATINUM,
    bets: 143,
    winRate: 56.6,
    avatar: "🌟",
    rankPosition: 3
  },

  // Gold League - Top 3
  {
    id: 7,
    username: "GoldRush_99",
    profit: 128.9,
    rank: LEAGUE_RANKS.GOLD,
    bets: 203,
    winRate: 52.2,
    avatar: "🔥",
    rankPosition: 1
  },
  {
    id: 8,
    username: "ChampionBet",
    profit: 97.6,
    rank: LEAGUE_RANKS.GOLD,
    bets: 76,
    winRate: 71.1,
    avatar: "👑",
    rankPosition: 2
  },
  {
    id: 9,
    username: "GoldMiner",
    profit: 86.4,
    rank: LEAGUE_RANKS.GOLD,
    bets: 134,
    winRate: 53.7,
    avatar: "⚡",
    rankPosition: 3
  },

  // Silver League - Top 3
  {
    id: 7,
    username: "WinStreak_12",
    profit: 89.4,
    rank: LEAGUE_RANKS.SILVER,
    bets: 112,
    winRate: 58.9,
    avatar: "💪",
    rankPosition: 1
  },
  {
    id: 11,
    username: "BigWinner",
    profit: 76.3,
    rank: LEAGUE_RANKS.SILVER,
    bets: 145,
    winRate: 49.7,
    avatar: "🎲",
    rankPosition: 2
  },
  {
    id: 12,
    username: "SilverBullet",
    profit: 68.7,
    rank: LEAGUE_RANKS.SILVER,
    bets: 98,
    winRate: 61.2,
    avatar: "🚀",
    rankPosition: 3
  },

  // Bronze League - Top 3
  {
    id: 9,
    username: "SmartBets_21",
    profit: 65.1,
    rank: LEAGUE_RANKS.BRONZE,
    bets: 89,
    winRate: 63.4,
    avatar: "🧠",
    rankPosition: 1
  },
  {
    id: 13,
    username: "CleverPlay",
    profit: 54.2,
    rank: LEAGUE_RANKS.BRONZE,
    bets: 134,
    winRate: 51.2,
    avatar: "🎯",
    rankPosition: 2
  },
  {
    id: 14,
    username: "BronzeStar",
    profit: 47.8,
    rank: LEAGUE_RANKS.BRONZE,
    bets: 76,
    winRate: 57.9,
    avatar: "⭐",
    rankPosition: 3
  }
];

// Helper functions
export const getRankConfig = (rank) => {
  return RANK_CONFIG[rank] || RANK_CONFIG[LEAGUE_RANKS.BRONZE];
};

export const getNextRank = (currentRank) => {
  const ranks = Object.values(LEAGUE_RANKS);
  const currentIndex = ranks.indexOf(currentRank);
  return currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : null;
};

export const getPreviousRank = (currentRank) => {
  const ranks = Object.values(LEAGUE_RANKS);
  const currentIndex = ranks.indexOf(currentRank);
  return currentIndex > 0 ? ranks[currentIndex - 1] : null;
};

// Get current month name for display
export const getCurrentMonthName = () => {
  const months = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];
  return months[new Date().getMonth()];
};

// Get current month key for data
export const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};