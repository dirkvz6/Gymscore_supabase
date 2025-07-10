import { useQuery } from '@tanstack/react-query';
import { supabase, Event } from '../lib/supabase';

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('gender', { ascending: true })
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useEventsByGender(gender: 'male' | 'female') {
  return useQuery({
    queryKey: ['events', gender],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('gender', gender)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Event[];
    },
  });
}