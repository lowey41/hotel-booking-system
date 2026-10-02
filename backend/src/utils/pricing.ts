/**
 * Dynamic Pricing Engine
 * Adjusts hotel room prices based on demand, seasonality, and occupancy
 */

interface PricingFactors {
  basePrice: number;
  checkIn: Date;
  checkOut: Date;
  occupancyRate: number; // 0-1
  daysUntilCheckIn: number;
  isWeekend: boolean;
  season: 'peak' | 'high' | 'mid' | 'low';
}

const SEASON_MULTIPLIERS = {
  peak: 1.4,
  high: 1.2,
  mid: 1.0,
  low: 0.8,
};

const getSeason = (date: Date): 'peak' | 'high' | 'mid' | 'low' => {
  const month = date.getMonth() + 1; // 1-12
  if ([7, 8, 12].includes(month)) return 'peak';      // Summer + December
  if ([6, 11].includes(month)) return 'high';          // June + November
  if ([3, 4, 5, 9, 10].includes(month)) return 'mid'; // Spring + Fall
  return 'low';                                         // Jan, Feb
};

export const calculateDynamicPrice = (factors: PricingFactors): number => {
  let price = factors.basePrice;

  // Season adjustment
  price *= SEASON_MULTIPLIERS[factors.season];

  // Weekend premium
  if (factors.isWeekend) price *= 1.15;

  // Occupancy-based pricing
  if (factors.occupancyRate > 0.9) price *= 1.3;
  else if (factors.occupancyRate > 0.75) price *= 1.15;
  else if (factors.occupancyRate < 0.3) price *= 0.85;

  // Last-minute discount (within 3 days)
  if (factors.daysUntilCheckIn <= 3 && factors.occupancyRate < 0.5) {
    price *= 0.9;
  }

  // Early bird discount (60+ days out)
  if (factors.daysUntilCheckIn >= 60) {
    price *= 0.95;
  }

  return Math.round(price * 100) / 100;
};

export const getPriceSuggestion = (
  basePrice: number,
  checkIn: Date,
  currentBookings: number,
  totalRooms: number
): { suggestedPrice: number; reason: string; saving?: number } => {
  const daysUntilCheckIn = Math.ceil(
    (checkIn.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const occupancyRate = currentBookings / totalRooms;
  const isWeekend = [0, 5, 6].includes(checkIn.getDay());
  const season = getSeason(checkIn);

  const suggestedPrice = calculateDynamicPrice({
    basePrice,
    checkIn,
    checkOut: checkIn,
    occupancyRate,
    daysUntilCheckIn,
    isWeekend,
    season,
  });

  let reason = '';
  if (suggestedPrice > basePrice * 1.1) {
    reason = `High demand period — ${season} season${isWeekend ? ' + weekend' : ''}`;
  } else if (suggestedPrice < basePrice * 0.9) {
    reason = `Low demand — consider discount to fill vacancy`;
  } else {
    reason = 'Standard pricing for this period';
  }

  const saving = basePrice - suggestedPrice > 0 ? basePrice - suggestedPrice : undefined;

  return { suggestedPrice, reason, saving };
};
