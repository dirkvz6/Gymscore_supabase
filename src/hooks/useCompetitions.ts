import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Competition } from '../lib/supabase';

export function useCompetitions() {
  return useQuery({
    queryKey: ['competitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select('id, name, location, start_date, end_date, status, user_id, created_at')
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data as Competition[];
    },
  });
}

export function useCreateCompetition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (competition: Omit<Competition, 'id' | 'created_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('competitions')
        .insert([{ ...competition, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
  });
}