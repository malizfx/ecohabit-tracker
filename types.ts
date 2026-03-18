
export enum HabitCategory {
  TRANSPORT = 'Transport',
  FOOD = 'Food',
  ENERGY = 'Energy',
  WASTE = 'Waste',
  WATER = 'Water'
}

export interface UserProfile {
  name: string;
  avatar: string;
  totalCO2Saved: number;
  streak: number;
  badges: Badge[];
  goals: string[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  description: string;
}

export interface HabitLog {
  id: string;
  category: HabitCategory;
  description: string;
  co2Saved: number;
  timestamp: number;
  photoUrl?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  daysRemaining: number;
  joined: boolean;
}

export interface DailyTip {
  title: string;
  content: string;
  category: string;
}
