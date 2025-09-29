// Mock data za fudbalske, košarkaške i tenis utakmice
export const matchesData = {
  football: [
    {
      id: 1,
      homeTeam: "Manchester United",
      awayTeam: "Liverpool",
      league: "Premier League",
      date: "2024-12-15",
      time: "16:30",
      status: "upcoming", // upcoming, live, finished
      odds: {
        home: 2.45,
        draw: 3.1,
        away: 2.9,
      },
      markets: {
        overUnder: {
          "over0.5": 1.05,
          "under0.5": 9.5,
          "over1.5": 1.25,
          "under1.5": 3.8,
          "over2.5": 1.85,
          "under2.5": 1.95,
          "over3.5": 2.9,
          "under3.5": 1.4,
          "over4.5": 5.2,
          "under4.5": 1.15,
        },
        bothTeamsToScore: {
          yes: 1.65,
          no: 2.25,
        },
        doubleChance: {
          "1X": 1.55,
          "12": 1.4,
          "X2": 1.75,
        },
        correctScore: {
          "0-0": 9.5,
          "1-0": 8.2,
          "0-1": 11.5,
          "1-1": 6.8,
          "2-0": 12.0,
          "0-2": 18.5,
          "2-1": 9.2,
          "1-2": 13.5,
          "2-2": 14.0,
          "3-0": 22.0,
          "0-3": 38.0,
          "3-1": 18.5,
          "1-3": 28.0,
          "other": 4.5,
        },
        corners: {
          "over8.5": 1.75,
          "under8.5": 2.05,
          "over10.5": 2.2,
          "under10.5": 1.65,
        },
        cards: {
          "over3.5": 1.9,
          "under3.5": 1.9,
          "over5.5": 3.2,
          "under5.5": 1.3,
        },
      },
    },
    {
      id: 2,
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      league: "La Liga",
      date: "2024-12-15",
      time: "21:00",
      status: "live",
      odds: {
        home: 2.2,
        draw: 3.4,
        away: 3.1,
      },
      markets: {
        overUnder: {
          "over0.5": 1.03,
          "under0.5": 12.0,
          "over1.5": 1.2,
          "under1.5": 4.5,
          "over2.5": 1.8,
          "under2.5": 2.0,
          "over3.5": 2.8,
          "under3.5": 1.42,
          "over4.5": 5.0,
          "under4.5": 1.17,
        },
        bothTeamsToScore: {
          yes: 1.7,
          no: 2.1,
        },
        doubleChance: {
          "1X": 1.4,
          "12": 1.3,
          "X2": 1.85,
        },
        correctScore: {
          "0-0": 11.0,
          "1-0": 7.5,
          "0-1": 9.5,
          "1-1": 6.5,
          "2-0": 11.5,
          "0-2": 14.5,
          "2-1": 8.8,
          "1-2": 11.0,
          "2-2": 12.5,
          "3-0": 20.0,
          "0-3": 28.0,
          "3-1": 16.5,
          "1-3": 22.0,
          "other": 4.2,
        },
        corners: {
          "over8.5": 1.8,
          "under8.5": 2.0,
          "over10.5": 2.3,
          "under10.5": 1.6,
        },
        cards: {
          "over3.5": 2.0,
          "under3.5": 1.8,
          "over5.5": 3.5,
          "under5.5": 1.25,
        },
      },
    },
    {
      id: 3,
      homeTeam: "Bayern Munich",
      awayTeam: "Borussia Dortmund",
      league: "Bundesliga",
      date: "2024-12-16",
      time: "18:30",
      status: "upcoming",
      odds: {
        home: 1.85,
        draw: 3.6,
        away: 4.2,
      },
      markets: {
        overUnder: {
          "over0.5": 1.08,
          "under0.5": 7.5,
          "over1.5": 1.3,
          "under1.5": 3.4,
          "over2.5": 1.9,
          "under2.5": 1.9,
          "over3.5": 3.1,
          "under3.5": 1.35,
          "over4.5": 5.8,
          "under4.5": 1.12,
        },
        bothTeamsToScore: {
          yes: 1.6,
          no: 2.35,
        },
        doubleChance: {
          "1X": 1.25,
          "12": 1.2,
          "X2": 2.2,
        },
        handicap: {
          "home-1": 3.2,
          "draw-1": 3.8,
          "away+1": 2.1,
          "home+1": 1.2,
          "draw+1": 6.0,
          "away-1": 9.5,
        },
        correctScore: {
          "0-0": 12.5,
          "1-0": 6.8,
          "0-1": 13.5,
          "1-1": 7.2,
          "2-0": 9.5,
          "0-2": 22.0,
          "2-1": 7.8,
          "1-2": 15.5,
          "2-2": 15.0,
          "3-0": 16.0,
          "0-3": 45.0,
          "3-1": 14.5,
          "1-3": 32.0,
          "other": 4.8,
        },
        corners: {
          "over8.5": 1.7,
          "under8.5": 2.1,
          "over10.5": 2.1,
          "under10.5": 1.7,
        },
        cards: {
          "over3.5": 1.85,
          "under3.5": 1.95,
          "over5.5": 3.0,
          "under5.5": 1.35,
        },
      },
    },
    {
      id: 4,
      homeTeam: "PSG",
      awayTeam: "Marseille",
      league: "Ligue 1",
      date: "2024-12-16",
      time: "20:45",
      status: "upcoming",
      odds: {
        home: 1.7,
        draw: 3.8,
        away: 4.9,
      },
      markets: {
        overUnder: {
          "over0.5": 1.06,
          "under0.5": 8.5,
          "over1.5": 1.28,
          "under1.5": 3.6,
          "over2.5": 1.88,
          "under2.5": 1.92,
          "over3.5": 3.0,
          "under3.5": 1.38,
          "over4.5": 5.5,
          "under4.5": 1.14,
        },
        bothTeamsToScore: {
          yes: 1.58,
          no: 2.4,
        },
        doubleChance: {
          "1X": 1.18,
          "12": 1.15,
          "X2": 2.45,
        },
        handicap: {
          "home-1": 2.8,
          "draw-1": 4.2,
          "away+1": 2.3,
          "home+1": 1.12,
          "draw+1": 7.5,
          "away-1": 12.0,
        },
        correctScore: {
          "0-0": 13.5,
          "1-0": 6.2,
          "0-1": 16.0,
          "1-1": 7.8,
          "2-0": 8.5,
          "0-2": 28.0,
          "2-1": 7.2,
          "1-2": 18.5,
          "2-2": 16.5,
          "3-0": 14.0,
          "0-3": 55.0,
          "3-1": 12.5,
          "1-3": 38.0,
          "other": 5.2,
        },
        corners: {
          "over8.5": 1.75,
          "under8.5": 2.05,
          "over10.5": 2.2,
          "under10.5": 1.65,
        },
        cards: {
          "over3.5": 1.9,
          "under3.5": 1.9,
          "over5.5": 3.2,
          "under5.5": 1.3,
        },
      },
    },
    {
      id: 5,
      homeTeam: "Juventus",
      awayTeam: "AC Milan",
      league: "Serie A",
      date: "2024-12-17",
      time: "19:00",
      status: "upcoming",
      odds: {
        home: 2.6,
        draw: 3.2,
        away: 2.7,
      },
      markets: {
        overUnder: {
          "over0.5": 1.04,
          "under0.5": 10.5,
          "over1.5": 1.22,
          "under1.5": 4.2,
          "over2.5": 1.82,
          "under2.5": 1.98,
          "over3.5": 2.75,
          "under3.5": 1.45,
          "over4.5": 4.8,
          "under4.5": 1.18,
        },
        bothTeamsToScore: {
          yes: 1.72,
          no: 2.08,
        },
        doubleChance: {
          "1X": 1.6,
          "12": 1.45,
          "X2": 1.65,
        },
        handicap: {
          "home-1": 4.5,
          "draw-1": 3.2,
          "away+1": 1.78,
          "home+1": 1.45,
          "draw+1": 4.2,
          "away-1": 5.8,
        },
        correctScore: {
          "0-0": 10.5,
          "1-0": 8.5,
          "0-1": 8.8,
          "1-1": 6.2,
          "2-0": 13.0,
          "0-2": 13.5,
          "2-1": 9.5,
          "1-2": 9.8,
          "2-2": 12.0,
          "3-0": 24.0,
          "0-3": 25.0,
          "3-1": 19.5,
          "1-3": 20.0,
          "other": 4.0,
        },
        corners: {
          "over8.5": 1.85,
          "under8.5": 1.95,
          "over10.5": 2.4,
          "under10.5": 1.55,
        },
        cards: {
          "over3.5": 2.1,
          "under3.5": 1.75,
          "over5.5": 3.8,
          "under5.5": 1.22,
        },
      },
    },
  ],
  basketball: [
    {
      id: 101,
      homeTeam: "Los Angeles Lakers",
      awayTeam: "Golden State Warriors",
      league: "NBA",
      date: "2024-12-15",
      time: "02:30",
      status: "upcoming",
      odds: {
        home: 1.95,
        away: 1.85,
      },
      markets: {
        overUnder: {
          "over215.5": 1.9,
          "under215.5": 1.9,
          "over220.5": 2.1,
          "under220.5": 1.75,
          "over225.5": 2.4,
          "under225.5": 1.55,
          "over230.5": 2.8,
          "under230.5": 1.42,
        },
        handicap: {
          "home-2.5": 1.9,
          "away+2.5": 1.9,
          "home-5.5": 2.2,
          "away+5.5": 1.65,
          "home+2.5": 1.65,
          "away-2.5": 2.2,
        },
        quarters: {
          "1Q_over52.5": 1.85,
          "1Q_under52.5": 1.95,
          "2Q_over54.5": 1.9,
          "2Q_under54.5": 1.9,
          "3Q_over55.5": 1.88,
          "3Q_under55.5": 1.92,
          "4Q_over53.5": 1.9,
          "4Q_under53.5": 1.9,
        },
        teamTotals: {
          "home_over110.5": 1.85,
          "home_under110.5": 1.95,
          "away_over105.5": 1.9,
          "away_under105.5": 1.9,
        },
      },
    },
    {
      id: 102,
      homeTeam: "Boston Celtics",
      awayTeam: "Miami Heat",
      league: "NBA",
      date: "2024-12-15",
      time: "03:00",
      status: "live",
      odds: {
        home: 2.1,
        away: 1.75,
      },
      markets: {
        overUnder: {
          "over210.5": 1.85,
          "under210.5": 1.95,
          "over215.5": 2.0,
          "under215.5": 1.8,
          "over220.5": 2.3,
          "under220.5": 1.6,
          "over225.5": 2.7,
          "under225.5": 1.45,
        },
        handicap: {
          "home-4.5": 1.9,
          "away+4.5": 1.9,
          "home-7.5": 2.3,
          "away+7.5": 1.6,
          "home+4.5": 1.6,
          "away-4.5": 2.3,
        },
        quarters: {
          "1Q_over51.5": 1.9,
          "1Q_under51.5": 1.9,
          "2Q_over53.5": 1.85,
          "2Q_under53.5": 1.95,
          "3Q_over54.5": 1.88,
          "3Q_under54.5": 1.92,
          "4Q_over52.5": 1.9,
          "4Q_under52.5": 1.9,
        },
        teamTotals: {
          "home_over108.5": 1.9,
          "home_under108.5": 1.9,
          "away_over102.5": 1.85,
          "away_under102.5": 1.95,
        },
      },
    },
    {
      id: 103,
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      league: "EuroLeague",
      date: "2024-12-16",
      time: "20:00",
      status: "upcoming",
      odds: {
        home: 1.65,
        away: 2.25,
      },
      markets: {
        overUnder: {
          "over155.5": 1.9,
          "under155.5": 1.9,
          "over160.5": 2.1,
          "under160.5": 1.75,
          "over165.5": 2.4,
          "under165.5": 1.55,
          "over170.5": 2.8,
          "under170.5": 1.42,
        },
        handicap: {
          "home-6.5": 1.9,
          "away+6.5": 1.9,
          "home-9.5": 2.2,
          "away+9.5": 1.65,
          "home+6.5": 1.45,
          "away-6.5": 2.65,
        },
        quarters: {
          "1Q_over38.5": 1.85,
          "1Q_under38.5": 1.95,
          "2Q_over40.5": 1.9,
          "2Q_under40.5": 1.9,
          "3Q_over39.5": 1.88,
          "3Q_under39.5": 1.92,
          "4Q_over37.5": 1.9,
          "4Q_under37.5": 1.9,
        },
        teamTotals: {
          "home_over82.5": 1.8,
          "home_under82.5": 2.0,
          "away_over73.5": 1.95,
          "away_under73.5": 1.85,
        },
      },
    },
    {
      id: 104,
      homeTeam: "Crvena Zvezda",
      awayTeam: "Partizan",
      league: "ABA Liga",
      date: "2024-12-17",
      time: "19:00",
      status: "upcoming",
      odds: {
        home: 1.9,
        away: 1.9,
      },
      markets: {
        overUnder: {
          "over150.5": 1.85,
          "under150.5": 1.95,
          "over155.5": 2.0,
          "under155.5": 1.8,
          "over160.5": 2.3,
          "under160.5": 1.6,
          "over165.5": 2.7,
          "under165.5": 1.45,
        },
        handicap: {
          "home-1.5": 1.9,
          "away+1.5": 1.9,
          "home-4.5": 2.1,
          "away+4.5": 1.75,
          "home+1.5": 1.75,
          "away-1.5": 2.1,
        },
        quarters: {
          "1Q_over37.5": 1.9,
          "1Q_under37.5": 1.9,
          "2Q_over38.5": 1.85,
          "2Q_under38.5": 1.95,
          "3Q_over39.5": 1.88,
          "3Q_under39.5": 1.92,
          "4Q_over36.5": 1.9,
          "4Q_under36.5": 1.9,
        },
        teamTotals: {
          "home_over76.5": 1.9,
          "home_under76.5": 1.9,
          "away_over75.5": 1.85,
          "away_under75.5": 1.95,
        },
      },
    },
  ],
  tennis: [
    {
      id: 201,
      homeTeam: "Novak Djokovic",
      awayTeam: "Carlos Alcaraz",
      league: "ATP Finals",
      date: "2024-12-15",
      time: "14:00",
      status: "upcoming",
      odds: {
        home: 1.75,
        away: 2.05,
      },
      markets: {
        sets: {
          "2-0": 2.8,
          "2-1": 3.2,
          "0-2": 3.6,
          "1-2": 4.1,
        },
        totalGames: {
          "over21.5": 1.85,
          "under21.5": 1.95,
          "over23.5": 2.1,
          "under23.5": 1.75,
          "over25.5": 2.4,
          "under25.5": 1.55,
        },
        firstSet: {
          "home": 1.8,
          "away": 2.0,
          "over9.5": 1.9,
          "under9.5": 1.9,
          "over10.5": 2.2,
          "under10.5": 1.65,
        },
        tiebreak: {
          "yes": 2.8,
          "no": 1.42,
        },
        aces: {
          "home_over10.5": 1.9,
          "home_under10.5": 1.9,
          "away_over8.5": 1.85,
          "away_under8.5": 1.95,
        },
      }
    },
    {
      id: 202,
      homeTeam: "Iga Swiatek",
      awayTeam: "Aryna Sabalenka",
      league: "WTA Finals",
      date: "2024-12-15",
      time: "16:30",
      status: "live",
      odds: {
        home: 1.95,
        away: 1.85,
      },
      markets: {
        sets: {
          "2-0": 3.1,
          "2-1": 3.4,
          "0-2": 3.0,
          "1-2": 3.8,
        },
        totalGames: {
          "over20.5": 1.9,
          "under20.5": 1.9,
          "over22.5": 2.2,
          "under22.5": 1.65,
          "over24.5": 2.6,
          "under24.5": 1.48,
        },
        firstSet: {
          "home": 1.95,
          "away": 1.85,
          "over9.5": 1.85,
          "under9.5": 1.95,
          "over10.5": 2.1,
          "under10.5": 1.75,
        },
        tiebreak: {
          "yes": 2.6,
          "no": 1.48,
        },
        aces: {
          "home_over6.5": 1.85,
          "home_under6.5": 1.95,
          "away_over8.5": 1.9,
          "away_under8.5": 1.9,
        },
      }
    },
    {
      id: 203,
      homeTeam: "Jannik Sinner",
      awayTeam: "Daniil Medvedev",
      league: "ATP Masters 1000",
      date: "2024-12-16",
      time: "15:00",
      status: "upcoming",
      odds: {
        home: 1.65,
        away: 2.25,
      },
      markets: {
        sets: {
          "2-0": 2.6,
          "2-1": 3.0,
          "0-2": 4.2,
          "1-2": 4.8,
        },
        totalGames: {
          "over22.5": 1.8,
          "under22.5": 2.0,
          "over24.5": 2.0,
          "under24.5": 1.8,
          "over26.5": 2.3,
          "under26.5": 1.6,
        },
        firstSet: {
          "home": 1.7,
          "away": 2.1,
          "over9.5": 1.95,
          "under9.5": 1.85,
          "over10.5": 2.3,
          "under10.5": 1.6,
        },
        tiebreak: {
          "yes": 3.0,
          "no": 1.38,
        },
        aces: {
          "home_over12.5": 1.85,
          "home_under12.5": 1.95,
          "away_over14.5": 1.9,
          "away_under14.5": 1.9,
        },
      }
    },
    {
      id: 204,
      homeTeam: "Coco Gauff",
      awayTeam: "Jessica Pegula",
      league: "WTA 1000",
      date: "2024-12-16",
      time: "18:00",
      status: "upcoming",
      odds: {
        home: 2.1,
        away: 1.75,
      },
      markets: {
        sets: {
          "2-0": 3.4,
          "2-1": 3.8,
          "0-2": 2.9,
          "1-2": 3.6,
        },
        totalGames: {
          "over21.5": 1.75,
          "under21.5": 2.05,
          "over23.5": 1.95,
          "under23.5": 1.85,
          "over25.5": 2.2,
          "under25.5": 1.65,
        },
        firstSet: {
          "home": 2.0,
          "away": 1.8,
          "over9.5": 1.8,
          "under9.5": 2.0,
          "over10.5": 2.0,
          "under10.5": 1.8,
        },
        tiebreak: {
          "yes": 2.4,
          "no": 1.55,
        },
        aces: {
          "home_over5.5": 1.9,
          "home_under5.5": 1.9,
          "away_over7.5": 1.85,
          "away_under7.5": 1.95,
        },
      }
    },
    {
      id: 205,
      homeTeam: "Rafael Nadal",
      awayTeam: "Stefanos Tsitsipas",
      league: "ATP 500",
      date: "2024-12-17",
      time: "13:30",
      status: "upcoming",
      odds: {
        home: 1.85,
        away: 1.95,
      },
      markets: {
        sets: {
          "2-0": 3.0,
          "2-1": 3.3,
          "0-2": 3.1,
          "1-2": 3.7,
        },
        totalGames: {
          "over22.5": 1.85,
          "under22.5": 1.95,
          "over24.5": 2.1,
          "under24.5": 1.75,
          "over26.5": 2.4,
          "under26.5": 1.55,
        },
        firstSet: {
          "home": 1.85,
          "away": 1.95,
          "over9.5": 1.9,
          "under9.5": 1.9,
          "over10.5": 2.2,
          "under10.5": 1.65,
        },
        tiebreak: {
          "yes": 2.7,
          "no": 1.45,
        },
        aces: {
          "home_over9.5": 1.9,
          "home_under9.5": 1.9,
          "away_over11.5": 1.85,
          "away_under11.5": 1.95,
        },
      }
    },
    {
      id: 206,
      homeTeam: "Elena Rybakina",
      awayTeam: "Barbora Krejcikova",
      league: "WTA 500",
      date: "2024-12-17",
      time: "17:00",
      status: "upcoming",
      odds: {
        home: 1.55,
        away: 2.45,
      },
      markets: {
        sets: {
          "2-0": 2.4,
          "2-1": 2.9,
          "0-2": 4.8,
          "1-2": 5.2,
        },
        totalGames: {
          "over20.5": 1.9,
          "under20.5": 1.9,
          "over22.5": 2.1,
          "under22.5": 1.75,
          "over24.5": 2.4,
          "under24.5": 1.55,
        },
        firstSet: {
          "home": 1.6,
          "away": 2.3,
          "over9.5": 1.85,
          "under9.5": 1.95,
          "over10.5": 2.1,
          "under10.5": 1.75,
        },
        tiebreak: {
          "yes": 2.5,
          "no": 1.52,
        },
        aces: {
          "home_over8.5": 1.8,
          "home_under8.5": 2.0,
          "away_over5.5": 1.95,
          "away_under5.5": 1.85,
        },
      }
    },
  ],
};

// Funkcija koja random menja kvote za ±0.05
export const randomizeOdds = (originalOdds) => {
  const randomChange = () => {
    const change = (Math.random() - 0.5) * 0.1; // -0.05 do +0.05
    return Math.round(change * 100) / 100;
  };

  const roundToTwo = (num) => {
    return Math.round(num * 100) / 100;
  };

  if (originalOdds.draw) {
    // Football
    return {
      home: roundToTwo(Math.max(1.01, originalOdds.home + randomChange())),
      draw: roundToTwo(Math.max(1.01, originalOdds.draw + randomChange())),
      away: roundToTwo(Math.max(1.01, originalOdds.away + randomChange())),
    };
  } else {
    // Basketball or Tennis
    return {
      home: roundToTwo(Math.max(1.01, originalOdds.home + randomChange())),
      away: roundToTwo(Math.max(1.01, originalOdds.away + randomChange())),
    };
  }
};

// Function to randomize all markets for a match
export const randomizeAllMarkets = (match) => {
  const randomChange = () => {
    const change = (Math.random() - 0.5) * 0.1; // -0.05 do +0.05
    return Math.round(change * 100) / 100;
  };

  const roundToTwo = (num) => {
    return Math.round(num * 100) / 100;
  };

  const randomizeMarket = (market) => {
    const randomizedMarket = {};
    for (const [key, value] of Object.entries(market)) {
      if (typeof value === 'number') {
        randomizedMarket[key] = roundToTwo(Math.max(1.01, value + randomChange()));
      } else if (typeof value === 'object') {
        randomizedMarket[key] = randomizeMarket(value);
      } else {
        randomizedMarket[key] = value;
      }
    }
    return randomizedMarket;
  };

  const newMatch = {
    ...match,
    odds: randomizeOdds(match.odds)
  };

  if (match.markets) {
    newMatch.markets = randomizeMarket(match.markets);
  }

  return newMatch;
};
