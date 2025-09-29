// EuroLeague MyTeam League Data

// Current EuroLeague teams for 2024-25 season
export const euroLeagueTeams = [
  'Real Madrid', 'Barcelona', 'Fenerbahçe', 'Panathinaikos', 'Olympiacos',
  'Anadolu Efes', 'CSKA Moscow', 'Zalgiris', 'Bayern Munich', 'Red Star',
  'ALBA Berlin', 'Virtus Bologna', 'Monaco', 'Baskonia', 'Maccabi Tel Aviv',
  'ASVEL', 'Paris Basketball', 'Partizan'
];

// Mock EuroLeague players with realistic names and stats
export const mockEuroLeaguePlayers = [
  // Point Guards
  {
    id: 'pg1',
    name: 'Mike James',
    team: 'Monaco',
    position: 'PG',
    nationality: 'USA',
    photo_url: null,
    season_averages: { points: 16.2, assists: 4.8, rebounds: 3.1 }
  },
  {
    id: 'pg2',
    name: 'Nigel Williams-Goss',
    team: 'Olympiacos',
    position: 'PG',
    nationality: 'USA',
    photo_url: null,
    season_averages: { points: 12.5, assists: 5.2, rebounds: 2.8 }
  },
  {
    id: 'pg3',
    name: 'Sergio Llull',
    team: 'Real Madrid',
    position: 'PG',
    nationality: 'Spain',
    photo_url: null,
    season_averages: { points: 9.8, assists: 3.4, rebounds: 2.1 }
  },
  {
    id: 'pg4',
    name: 'Georgios Papagiannis',
    team: 'Panathinaikos',
    position: 'PG',
    nationality: 'Greece',
    photo_url: null,
    season_averages: { points: 11.2, assists: 4.1, rebounds: 2.5 }
  },
  {
    id: 'pg5',
    name: 'Scottie Wilbekin',
    team: 'Fenerbahçe',
    position: 'PG',
    nationality: 'USA',
    photo_url: null,
    season_averages: { points: 14.7, assists: 4.9, rebounds: 2.9 }
  },

  // Shooting Guards
  {
    id: 'sg1',
    name: 'Luca Vildoza',
    team: 'Crvena Zvezda',
    position: 'SG',
    nationality: 'Argentina',
    photo_url: null,
    season_averages: { points: 13.8, assists: 3.2, rebounds: 2.4 }
  },
  {
    id: 'sg2',
    name: 'Kostas Sloukas',
    team: 'Fenerbahçe',
    position: 'SG',
    nationality: 'Greece',
    photo_url: null,
    season_averages: { points: 10.1, assists: 5.8, rebounds: 2.1 }
  },
  {
    id: 'sg3',
    name: 'Thomas Walkup',
    team: 'Zalgiris',
    position: 'SG',
    nationality: 'USA',
    photo_url: null,
    season_averages: { points: 12.4, assists: 4.1, rebounds: 3.8 }
  },
  {
    id: 'sg4',
    name: 'Jabari Parker',
    team: 'Barcelona',
    position: 'SG',
    nationality: 'USA',
    photo_url: null,
    season_averages: { points: 15.2, assists: 2.8, rebounds: 4.1 }
  },
  {
    id: 'sg5',
    name: 'Wade Baldwin',
    team: 'Maccabi Tel Aviv',
    position: 'SG',
    nationality: 'USA',
    photo_url: null,
    season_averages: { points: 14.9, assists: 4.7, rebounds: 3.2 }
  },

  // Small Forwards
  {
    id: 'sf1',
    name: 'Mario Hezonja',
    team: 'Real Madrid',
    position: 'SF',
    nationality: 'Croatia',
    photo_url: null,
    season_averages: { points: 12.7, assists: 2.9, rebounds: 4.2 }
  },
  {
    id: 'sf2',
    name: 'Jan Vesely',
    team: 'Fenerbahçe',
    position: 'SF',
    nationality: 'Czech Republic',
    photo_url: null,
    season_averages: { points: 13.1, assists: 2.4, rebounds: 5.8 }
  },
  {
    id: 'sf3',
    name: 'Tornike Shengelia',
    team: 'Virtus Bologna',
    position: 'SF',
    nationality: 'Georgia',
    photo_url: null,
    season_averages: { points: 11.8, assists: 3.1, rebounds: 4.9 }
  },
  {
    id: 'sf4',
    name: 'Mathias Lessort',
    team: 'Panathinaikos',
    position: 'SF',
    nationality: 'France',
    photo_url: null,
    season_averages: { points: 9.4, assists: 1.8, rebounds: 6.1 }
  },
  {
    id: 'sf5',
    name: 'Shane Larkin',
    team: 'Anadolu Efes',
    position: 'SF',
    nationality: 'USA',
    photo_url: null,
    season_averages: { points: 16.8, assists: 3.9, rebounds: 2.7 }
  },

  // Power Forwards
  {
    id: 'pf1',
    name: 'Nikola Milutinov',
    team: 'Olympiacos',
    position: 'PF',
    nationality: 'Serbia',
    photo_url: null,
    season_averages: { points: 8.9, assists: 1.2, rebounds: 6.8 }
  },
  {
    id: 'pf2',
    name: 'Johannes Voigtmann',
    team: 'Bayern Munich',
    position: 'PF',
    nationality: 'Germany',
    photo_url: null,
    season_averages: { points: 7.1, assists: 2.8, rebounds: 4.9 }
  },
  {
    id: 'pf3',
    name: 'Ante Zizic',
    team: 'Maccabi Tel Aviv',
    position: 'PF',
    nationality: 'Croatia',
    photo_url: null,
    season_averages: { points: 10.8, assists: 1.4, rebounds: 5.7 }
  },
  {
    id: 'pf4',
    name: 'Alex Abrines',
    team: 'Barcelona',
    position: 'PF',
    nationality: 'Spain',
    photo_url: null,
    season_averages: { points: 9.2, assists: 1.7, rebounds: 2.8 }
  },
  {
    id: 'pf5',
    name: 'Bryant Dunston',
    team: 'Anadolu Efes',
    position: 'PF',
    nationality: 'USA',
    photo_url: null,
    season_averages: { points: 6.4, assists: 0.9, rebounds: 4.2 }
  },

  // Centers
  {
    id: 'c1',
    name: 'Walter Tavares',
    team: 'Real Madrid',
    position: 'C',
    nationality: 'Cape Verde',
    photo_url: null,
    season_averages: { points: 8.1, assists: 0.8, rebounds: 5.9 }
  },
  {
    id: 'c2',
    name: 'Nikola Kalinic',
    team: 'Fenerbahçe',
    position: 'C',
    nationality: 'Serbia',
    photo_url: null,
    season_averages: { points: 12.4, assists: 2.1, rebounds: 4.8 }
  },
  {
    id: 'c3',
    name: 'Sasha Vezenkov',
    team: 'Olympiacos',
    position: 'C',
    nationality: 'Bulgaria',
    photo_url: null,
    season_averages: { points: 17.2, assists: 2.4, rebounds: 6.8 }
  },
  {
    id: 'c4',
    name: 'Georgios Papagiannis',
    team: 'Panathinaikos',
    position: 'C',
    nationality: 'Greece',
    photo_url: null,
    season_averages: { points: 6.7, assists: 0.7, rebounds: 4.1 }
  },
  {
    id: 'c5',
    name: 'Tibor Pleiss',
    team: 'Anadolu Efes',
    position: 'C',
    nationality: 'Germany',
    photo_url: null,
    season_averages: { points: 7.8, assists: 1.1, rebounds: 5.2 }
  },

  // Additional Point Guards for depth
  {
    id: 'pg6',
    name: 'Kostas Sloukas',
    team: 'Panathinaikos',
    position: 'PG',
    nationality: 'Greece',
    photo_url: null,
    season_averages: { points: 10.5, assists: 6.2, rebounds: 2.4 }
  },
  {
    id: 'pg7',
    name: 'Nick Calathes',
    team: 'Fenerbahçe',
    position: 'PG',
    nationality: 'Greece/USA',
    photo_url: null,
    season_averages: { points: 8.9, assists: 7.1, rebounds: 3.1 }
  },
  {
    id: 'pg8',
    name: 'Kyle Kuric',
    team: 'Barcelona',
    position: 'PG',
    nationality: 'USA',
    photo_url: null,
    season_averages: { points: 9.2, assists: 2.8, rebounds: 2.5 }
  },

  // Additional Shooting Guards for depth
  {
    id: 'sg6',
    name: 'Alex Abrines',
    team: 'Barcelona',
    position: 'SG',
    nationality: 'Spain',
    photo_url: null,
    season_averages: { points: 12.1, assists: 1.9, rebounds: 2.8 }
  },
  {
    id: 'sg7',
    name: 'Yogi Ferrell',
    team: 'ALBA Berlin',
    position: 'SG',
    nationality: 'USA',
    photo_url: null,
    season_averages: { points: 14.6, assists: 4.2, rebounds: 2.1 }
  },
  {
    id: 'sg8',
    name: 'Tarik Black',
    team: 'Maccabi Tel Aviv',
    position: 'SG',
    nationality: 'USA',
    photo_url: null,
    season_averages: { points: 11.8, assists: 2.1, rebounds: 4.2 }
  },

  // Additional Small Forwards for depth
  {
    id: 'sf6',
    name: 'Kevin Punter',
    team: 'Partizan',
    position: 'SF',
    nationality: 'USA',
    photo_url: null,
    season_averages: { points: 16.3, assists: 3.1, rebounds: 3.9 }
  },
  {
    id: 'sf7',
    name: 'Mathias Lessort',
    team: 'Panathinaikos',
    position: 'SF',
    nationality: 'France',
    photo_url: null,
    season_averages: { points: 10.2, assists: 1.8, rebounds: 5.5 }
  },
  {
    id: 'sf8',
    name: 'Darius Thompson',
    team: 'Red Star',
    position: 'SF',
    nationality: 'USA',
    photo_url: null,
    season_averages: { points: 13.7, assists: 3.5, rebounds: 4.1 }
  },

  // Additional Power Forwards for depth
  {
    id: 'pf6',
    name: 'Johannes Voigtmann',
    team: 'Bayern Munich',
    position: 'PF',
    nationality: 'Germany',
    photo_url: null,
    season_averages: { points: 9.4, assists: 2.7, rebounds: 4.8 }
  },
  {
    id: 'pf7',
    name: 'Tornike Shengelia',
    team: 'Virtus Bologna',
    position: 'PF',
    nationality: 'Georgia',
    photo_url: null,
    season_averages: { points: 14.1, assists: 2.9, rebounds: 5.6 }
  },
  {
    id: 'pf8',
    name: 'Livio Jean-Charles',
    team: 'ASVEL',
    position: 'PF',
    nationality: 'France',
    photo_url: null,
    season_averages: { points: 8.7, assists: 1.5, rebounds: 4.9 }
  },

  // Additional Centers for depth
  {
    id: 'c6',
    name: 'Bryant Dunston',
    team: 'Anadolu Efes',
    position: 'C',
    nationality: 'USA',
    photo_url: null,
    season_averages: { points: 6.9, assists: 1.1, rebounds: 4.7 }
  },
  {
    id: 'c7',
    name: 'Georgios Papagiannis',
    team: 'Panathinaikos',
    position: 'C',
    nationality: 'Greece',
    photo_url: null,
    season_averages: { points: 8.3, assists: 0.9, rebounds: 5.1 }
  },
  {
    id: 'c8',
    name: 'Vincent Poirier',
    team: 'Real Madrid',
    position: 'C',
    nationality: 'France',
    photo_url: null,
    season_averages: { points: 7.1, assists: 1.3, rebounds: 4.8 }
  }
];

// Current EuroLeague round (2024-25 season)
// EuroLeague 2024-25 Season Rounds
export const euroLeagueRounds = [
  {
    id: 'round1',
    round_number: 1,
    season_year: 2024,
    start_date: '2024-10-03',
    end_date: '2024-10-06',
    submission_deadline: '2024-10-03T18:00:00Z',
    status: 'active',
    is_current: true
  },
  {
    id: 'round2',
    round_number: 2,
    season_year: 2024,
    start_date: '2024-10-10',
    end_date: '2024-10-13',
    submission_deadline: '2024-10-10T18:00:00Z',
    status: 'upcoming',
    is_current: false
  },
  {
    id: 'round3',
    round_number: 3,
    season_year: 2024,
    start_date: '2024-10-17',
    end_date: '2024-10-20',
    submission_deadline: '2024-10-17T18:00:00Z',
    status: 'upcoming',
    is_current: false
  },
  {
    id: 'round4',
    round_number: 4,
    season_year: 2024,
    start_date: '2024-10-24',
    end_date: '2024-10-27',
    submission_deadline: '2024-10-24T18:00:00Z',
    status: 'upcoming',
    is_current: false
  },
  {
    id: 'round5',
    round_number: 5,
    season_year: 2024,
    start_date: '2024-10-31',
    end_date: '2024-11-03',
    submission_deadline: '2024-10-31T18:00:00Z',
    status: 'upcoming',
    is_current: false
  }
];

// Get current active round
export const getCurrentEuroLeagueRound = () => {
  return euroLeagueRounds.find(round => round.is_current) || euroLeagueRounds[0];
};

// Get round by ID
export const getRoundById = (roundId) => {
  return euroLeagueRounds.find(round => round.id === roundId);
};

// Legacy export for backwards compatibility
export const currentEuroLeagueRound = getCurrentEuroLeagueRound();

// Mock player predictions with odds for current round
export const mockPlayerRoundPredictions = mockEuroLeaguePlayers.map(player => ({
  id: `pred_${player.id}`,
  player_id: player.id,
  round_id: currentEuroLeagueRound.id,
  // Points predictions (based on season averages with some variance)
  points_line: player.season_averages.points + (Math.random() * 4 - 2),
  points_over_odds: 1.8 + (Math.random() * 0.4),
  points_under_odds: 1.8 + (Math.random() * 0.4),
  // Assists predictions
  assists_line: player.season_averages.assists + (Math.random() * 2 - 1),
  assists_over_odds: 1.9 + (Math.random() * 0.3),
  assists_under_odds: 1.9 + (Math.random() * 0.3),
  // Rebounds predictions
  rebounds_line: player.season_averages.rebounds + (Math.random() * 2 - 1),
  rebounds_over_odds: 1.85 + (Math.random() * 0.35),
  rebounds_under_odds: 1.85 + (Math.random() * 0.35)
}));

// Helper functions
export const getPlayersByPosition = (position) => {
  return mockEuroLeaguePlayers.filter(player => player.position === position);
};

export const getPlayerById = (playerId) => {
  return mockEuroLeaguePlayers.find(player => player.id === playerId);
};

export const getPlayerPredictions = (playerId) => {
  return mockPlayerRoundPredictions.find(pred => pred.player_id === playerId);
};

export const positions = [
  { key: 'PG', name: 'Point Guard', shortName: 'PG' },
  { key: 'SG', name: 'Shooting Guard', shortName: 'SG' },
  { key: 'SF', name: 'Small Forward', shortName: 'SF' },
  { key: 'PF', name: 'Power Forward', shortName: 'PF' },
  { key: 'C', name: 'Center', shortName: 'C' }
];

// Team formation template
export const emptyRoster = {
  starters: {
    PG: null,
    SG: null,
    SF: null,
    PF: null,
    C: null
  },
  bench: {
    PG: null,
    SG: null,
    SF: null,
    PF: null,
    C: null
  },
  predictions: {}, // Will store predictions for each selected player
  totalBudgetUsed: 0,
  teamName: ''
};