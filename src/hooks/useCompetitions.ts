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

export function useUpdateCompetition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Competition> & { id: string }) => {
      const { data, error } = await supabase
        .from('competitions')
        .update(updates)
        .eq('id', id)
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

export function useDeleteCompetition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (competitionId: string) => {
      const { error } = await supabase
        .from('competitions')
        .delete()
        .eq('id', competitionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
  });
}
export function useCreateCompetition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (competition: Omit<Competition, 'id' | 'created_at' | 'user_id'>) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('You must be logged in to create a competition');
      }

      // Ensure user profile exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingUser) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              email: user.email,
            },
          ])
          .select()
          .single();

        if (profileError) {
          throw new Error('Failed to create user profile');
        }
      }

      const { data, error } = await supabase
        .from('competitions')
        .insert([{ ...competition, user_id: user.id }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to create competition');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
  });
}