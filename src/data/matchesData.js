// Mock data za fudbalske i košarkaške utakmice
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
    // Basketball
    return {
      home: roundToTwo(Math.max(1.01, originalOdds.home + randomChange())),
      away: roundToTwo(Math.max(1.01, originalOdds.away + randomChange())),
    };
  }
};
