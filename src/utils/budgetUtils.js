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

// Funkcija za izračunavanje trenutnog balansa
export const calculateBalance = () => {
  const currentMonth = getCurrentMonthKey();
  const monthData = JSON.parse(
    localStorage.getItem(`month_${currentMonth}`)
  ) || {
    startBalance: 0,
    currentBalance: 0,
    tickets: [],
  };

  return monthData.currentBalance;
};

// Funkcija za proveru da li korisnik može da se kladi
export const canPlaceBet = () => {
  const balance = calculateBalance();
  return balance > -100;
};

// Funkcija za ažuriranje balansa nakon tiketa
export const updateBalance = (amount, isWin) => {
  const currentMonth = getCurrentMonthKey();
  const monthData = JSON.parse(
    localStorage.getItem(`month_${currentMonth}`)
  ) || {
    startBalance: 0,
    currentBalance: 0,
    tickets: [],
  };

  if (isWin) {
    monthData.currentBalance += amount;
  } else {
    monthData.currentBalance -= amount;
  }

  localStorage.setItem(`month_${currentMonth}`, JSON.stringify(monthData));
  return monthData.currentBalance;
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

// Funkcija za dobijanje maksimalnog dozvoljenog uloga
export const getMaxStake = () => {
  const balance = calculateBalance();
  // Maksimalni ulog je koliko još može da ode u minus (do -100)
  const maxStake = 100 + balance; // Ako je na -80, max je 20
  return Math.max(0, maxStake); // Ne može biti negativno
};
