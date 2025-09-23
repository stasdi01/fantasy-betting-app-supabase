// Funkcija za dobijanje trenutnog meseca i godine
export const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
};

// Funkcija za dobijanje naziva meseca
export const getMonthName = (monthKey) => {
  const [year, month] = monthKey.split("-");
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

// Funkcija za izračunavanje trenutnog profita (0% start, može ići do -100%)
export const calculateProfit = () => {
  const currentMonth = getCurrentMonthKey();
  const monthData = JSON.parse(
    localStorage.getItem(`month_${currentMonth}`)
  ) || {
    startProfit: 0,
    currentProfit: 0,
    tickets: [],
  };

  return monthData.currentProfit;
};

// Backward compatibility - alias za stari kod
export const calculateBalance = calculateProfit;

// Funkcija za proveru da li korisnik može da se kladi
export const canPlaceBet = () => {
  const profit = calculateProfit();
  return profit > -100; // Ako je profit -100% ili niži, blokiran je
};

// Funkcija za ažuriranje profita nakon tiketa
export const updateProfit = (stakeAmount, potentialWin, isWin) => {
  const currentMonth = getCurrentMonthKey();
  const monthData = JSON.parse(
    localStorage.getItem(`month_${currentMonth}`)
  ) || {
    startProfit: 0,
    currentProfit: 0,
    tickets: [],
  };

  if (isWin) {
    // Ako je dobio, profit se uvećava za (potentialWin - stakeAmount)
    const netWin = potentialWin - stakeAmount;
    monthData.currentProfit += netWin;
  } else {
    // Ako je izgubio, profit se smanjuje za stakeAmount
    monthData.currentProfit -= stakeAmount;
  }

  localStorage.setItem(`month_${currentMonth}`, JSON.stringify(monthData));
  return monthData.currentProfit;
};

// Backward compatibility - alias za stari kod
export const updateBalance = (amount, isWin) => {
  if (isWin) {
    return updateProfit(0, amount, true); // Simplified for old code
  } else {
    return updateProfit(amount, 0, false);
  }
};

// Funkcija za dobijanje svih meseci sa tiketima
export const getAllMonths = () => {
  const months = [];
  const keys = Object.keys(localStorage);

  keys.forEach((key) => {
    if (key.startsWith("month_")) {
      const monthKey = key.replace("month_", "");
      const monthData = JSON.parse(localStorage.getItem(key));
      months.push({
        key: monthKey,
        name: getMonthName(monthKey),
        data: monthData,
      });
    }
  });

  return months.sort((a, b) => b.key.localeCompare(a.key));
};

// Funkcija za dobijanje dostupnog budžeta za klađenje
export const getAvailableBudget = () => {
  const profit = calculateProfit();
  // Dostupni budžet = 100% + trenutni profit
  // Primer: profit +20% → budžet 120%
  // Primer: profit -30% → budžet 70%
  // Primer: profit -100% → budžet 0% (blokiran)
  return Math.max(0, 100 + profit);
};

// Funkcija za dobijanje maksimalnog dozvoljenog uloga (alias za backward compatibility)
export const getMaxStake = getAvailableBudget;

// Funkcija za validaciju da li se tiket može postaviti
export const canPlaceTicket = (stakeAmount) => {
  const availableBudget = getAvailableBudget();
  const profit = calculateProfit();

  // Proveri da li je korisnik blokiran
  if (profit <= -100) {
    return {
      canPlace: false,
      reason: "Account blocked. You've reached -100% profit limit."
    };
  }

  // Proveri da li ima dovoljno budžeta
  if (stakeAmount > availableBudget) {
    return {
      canPlace: false,
      reason: `Insufficient budget. Available: ${availableBudget.toFixed(1)}%, Required: ${stakeAmount}%`
    };
  }

  return { canPlace: true, reason: null };
};

// Funkcija za mesečni reset (pozivati 1. u mesecu)
export const performMonthlyReset = () => {
  const currentMonth = getCurrentMonthKey();

  // Sačuvaj prethodnji mesec u history
  const currentData = JSON.parse(
    localStorage.getItem(`month_${currentMonth}`)
  );

  if (currentData && currentData.currentProfit !== 0) {
    // Premesti u history
    localStorage.setItem(`history_${currentMonth}`, JSON.stringify(currentData));
  }

  // Resetuj trenutni mesec
  const newMonthData = {
    startProfit: 0,
    currentProfit: 0,
    tickets: [],
    resetDate: new Date().toISOString()
  };

  localStorage.setItem(`month_${currentMonth}`, JSON.stringify(newMonthData));

  return newMonthData;
};


// Funkcija za automatski reset ako je potreban
export const checkAndPerformMonthlyReset = () => {
  const currentMonth = getCurrentMonthKey();
  const monthData = JSON.parse(
    localStorage.getItem(`month_${currentMonth}`)
  );

  // Ako nema podataka za trenutni mesec, to znači da je novi mesec
  if (!monthData) {
    return performMonthlyReset();
  }

  // Proveri da li je reset potreban na osnovu datuma
  const now = new Date();
  const resetDate = monthData.resetDate ? new Date(monthData.resetDate) : null;

  if (!resetDate || resetDate.getMonth() !== now.getMonth() || resetDate.getFullYear() !== now.getFullYear()) {
    return performMonthlyReset();
  }

  return monthData;
};
