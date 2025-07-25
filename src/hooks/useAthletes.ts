import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Athlete } from '../lib/supabase';

export function useAthletes() {
  return useQuery({
    queryKey: ['athletes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .order('last_name', { ascending: true });
      
      if (error) throw error;
      return data as Athlete[];
    },
  });
}

export function useCreateAthlete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (athlete: Omit<Athlete, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('athletes')
        .insert([athlete])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
}

export function useDeleteAthlete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (athleteId: string) => {
      const { error } = await supabase
        .from('athletes')
        .delete()
        .eq('id', athleteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
}

export function useUpdateAthlete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Athlete> & { id: string }) => {
      const { data, error } = await supabase
        .from('athletes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
}