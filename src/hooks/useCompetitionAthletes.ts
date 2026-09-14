import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Athlete } from '../lib/supabase';

export function useCompetitionAthletes(competitionId: string) {
  return useQuery({
    queryKey: ['competition-athletes', competitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_athletes')
        .select(`
          athlete_id,
          athlete:athletes(*)
        `)
        .eq('competition_id', competitionId);

      if (error) throw error;
      return (data || []).map((row: any) => row.athlete as Athlete);
    },
    enabled: !!competitionId,
  });
}

export function useCompetitionAthleteIds(competitionId: string) {
  return useQuery({
    queryKey: ['competition-athlete-ids', competitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_athletes')
        .select('athlete_id')
        .eq('competition_id', competitionId);

      if (error) throw error;
      return new Set((data || []).map((row: any) => row.athlete_id as string));
    },
    enabled: !!competitionId,
  });
}

export function useRegisterAthleteForCompetition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ competitionId, athleteId }: { competitionId: string; athleteId: string }) => {
      const { data, error } = await supabase
        .from('competition_athletes')
        .insert([{ competition_id: competitionId, athlete_id: athleteId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competition-athletes'] });
      queryClient.invalidateQueries({ queryKey: ['competition-athlete-ids'] });
    },
  });
}

export function useUnregisterAthleteFromCompetition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ competitionId, athleteId }: { competitionId: string; athleteId: string }) => {
      const { error } = await supabase
        .from('competition_athletes')
        .delete()
        .eq('competition_id', competitionId)
        .eq('athlete_id', athleteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competition-athletes'] });
      queryClient.invalidateQueries({ queryKey: ['competition-athlete-ids'] });
    },
  });
}

export function useRegisterAllAthletesForCompetition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ competitionId, athleteIds }: { competitionId: string; athleteIds: string[] }) => {
      const rows = athleteIds.map(athleteId => ({
        competition_id: competitionId,
        athlete_id: athleteId,
      }));

      const { error } = await supabase
        .from('competition_athletes')
        .insert(rows);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competition-athletes'] });
      queryClient.invalidateQueries({ queryKey: ['competition-athlete-ids'] });
    },
  });
}
