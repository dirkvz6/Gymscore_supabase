import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Competition {
  id: string;
  name: string;
  location?: string;
  start_date: string;
  end_date?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  user_id?: string;
  created_at: string;
}

export interface Athlete {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female';
  club?: string;
  level?: string;
  created_at: string;
  age: numeric;
}

export interface Judge {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  certification_level?: string;
  specialization?: string[];
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  code: string;
  gender: 'male' | 'female';
  display_order: number;
  max_score: number;
}

export interface Routine {
  id: string;
  competition_id: string;
  athlete_id: string;
  event_id: string;
  judge_id?: string;
  difficulty_score: number;
  execution_score: number;
  neutral_deductions: number;
  final_score: number;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  performed_at: string;
  created_at: string;
}

export interface Score {
  id: string;
  routine_id: string;
  judge_id: string;
  score_type: 'difficulty' | 'execution' | 'neutral_deduction';
  value: number;
  notes?: string;
  created_at: string;
}