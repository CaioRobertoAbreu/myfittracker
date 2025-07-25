export interface ExerciseSet {
  setNumber: number;
  weight: number | null;
  reps: number | null;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g., "3-5" or "8-12"
  rpe: number; // Rate of Perceived Exertion
  progressionType: string;
  technique?: string;
  techniqueDescription?: string;
  observations?: string;
  weekProgress?: WeekProgress[];
  performedSets?: ExerciseSet[];
}

export interface WeekProgress {
  week: number;
  isDeload: boolean;
  weight?: number;
  completed?: boolean;
  notes?: string;
}

export interface TrainingDay {
  id: string;
  dayNumber: number;
  name: string;
  exercises: Exercise[];
}

export interface TrainingWeek {
  id: string;
  weekNumber: number;
  isDeload: boolean;
  days: TrainingDay[];
}

export interface TrainingPlan {
  id: string;
  name: string;
  description?: string;
  totalWeeks: number;
  currentWeek: number;
  startDate: Date;
  endDate: Date;
  isExpired: boolean;
  weeks: TrainingWeek[];
  createdAt: Date;
  updatedAt: Date;
}