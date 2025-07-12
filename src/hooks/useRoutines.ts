import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Routine } from '../lib/supabase';

export function useRoutines(competitionId?: string) {
  return useQuery({
    queryKey: ['routines', competitionId],
    queryFn: async () => {
      let query = supabase
        .from('routines')
        .select(`
          *,
          athletes!inner(*),
          events!inner(*)
        `)
        .order('performed_at', { ascending: false });
      
      if (competitionId) {
        query = query.eq('competition_id', competitionId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log('Fetched routines with relations:', data);
      return data;
    },
    enabled: true,
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (routine: Omit<Routine, 'id' | 'created_at' | 'performed_at'>) => {
      const { data, error } = await supabase
        .from('routines')
        .insert([routine])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Routine> & { id: string }) => {
      const { data, error } = await supabase
        .from('routines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}