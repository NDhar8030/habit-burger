export interface Habit {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position: number;
  skip_weekends: boolean;
  is_reverse: boolean;
  reminder_time: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Completion {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  status: 'completed' | 'skipped';
  notes: string | null;
  created_at: string;
}

export type CompletionStatus = 'completed' | 'skipped' | 'incomplete';

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
}
