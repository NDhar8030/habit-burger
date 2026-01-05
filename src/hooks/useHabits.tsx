import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Habit, Completion, CompletionStatus } from '@/types/habit';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export function useHabits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const habitsQuery = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data as Habit[];
    },
    enabled: !!user,
  });

  const completionsQuery = useQuery({
    queryKey: ['completions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('completions')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as Completion[];
    },
    enabled: !!user,
  });

  const createHabit = useMutation({
    mutationFn: async (habit: Partial<Habit>) => {
      if (!user) throw new Error('Not authenticated');
      
      const habits = habitsQuery.data || [];
      const maxPosition = habits.length > 0 
        ? Math.max(...habits.map(h => h.position)) + 1 
        : 0;

      const { data, error } = await supabase
        .from('habits')
        .insert({
          name: habit.name!,
          color: habit.color || '#3b82f6',
          is_reverse: habit.is_reverse || false,
          skip_weekends: habit.skip_weekends || false,
          user_id: user.id,
          position: maxPosition,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit created');
    },
    onError: (error) => {
      toast.error('Failed to create habit: ' + error.message);
    },
  });

  const updateHabit = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Habit> & { id: string }) => {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit updated');
    },
    onError: (error) => {
      toast.error('Failed to update habit: ' + error.message);
    },
  });

  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['completions'] });
      toast.success('Habit deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete habit: ' + error.message);
    },
  });

  const toggleCompletion = useMutation({
    mutationFn: async ({ 
      habitId, 
      date, 
      status 
    }: { 
      habitId: string; 
      date: string; 
      status: CompletionStatus;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const existingCompletion = completionsQuery.data?.find(
        c => c.habit_id === habitId && c.date === date
      );

      if (status === 'incomplete' && existingCompletion) {
        const { error } = await supabase
          .from('completions')
          .delete()
          .eq('id', existingCompletion.id);
        if (error) throw error;
        return null;
      }

      if (existingCompletion) {
        const { data, error } = await supabase
          .from('completions')
          .update({ status })
          .eq('id', existingCompletion.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from('completions')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          date,
          status,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completions'] });
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });

  const getCompletionStatus = (habitId: string, date: string): CompletionStatus => {
    const completion = completionsQuery.data?.find(
      c => c.habit_id === habitId && c.date === date
    );
    return completion?.status || 'incomplete';
  };

  const calculateStreak = (habitId: string): { current: number; best: number; total: number } => {
    const habitCompletions = completionsQuery.data?.filter(c => c.habit_id === habitId) || [];
    const completionMap = new Map(habitCompletions.map(c => [c.date, c.status]));
    
    const today = format(new Date(), 'yyyy-MM-dd');
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let totalCompletions = habitCompletions.filter(c => c.status === 'completed').length;

    // Calculate current streak (backwards from today)
    let checkDate = new Date();
    let consecutiveSkips = 0;
    
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const status = completionMap.get(dateStr);
      
      if (status === 'completed') {
        currentStreak++;
        consecutiveSkips = 0;
      } else if (status === 'skipped') {
        consecutiveSkips++;
        if (consecutiveSkips >= 2) break;
      } else {
        break;
      }
      
      checkDate = subDays(checkDate, 1);
    }

    // Calculate best streak
    const sortedDates = [...habitCompletions]
      .sort((a, b) => a.date.localeCompare(b.date));
    
    consecutiveSkips = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      const current = sortedDates[i];
      
      if (current.status === 'completed') {
        tempStreak++;
        consecutiveSkips = 0;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else if (current.status === 'skipped') {
        consecutiveSkips++;
        if (consecutiveSkips >= 2) {
          tempStreak = 0;
          consecutiveSkips = 0;
        }
      }

      if (i < sortedDates.length - 1) {
        const nextDate = sortedDates[i + 1];
        const daysDiff = differenceInDays(parseISO(nextDate.date), parseISO(current.date));
        if (daysDiff > 1) {
          tempStreak = 0;
          consecutiveSkips = 0;
        }
      }
    }

    return { current: currentStreak, best: bestStreak, total: totalCompletions };
  };

  const getStreakOpacity = (habitId: string, isReverse: boolean): number => {
    const { current } = calculateStreak(habitId);
    const baseOpacity = 0.4;
    const maxOpacity = 1;
    const streakFactor = Math.min(current / 30, 1); // Max out at 30 days
    
    if (isReverse) {
      return Math.max(maxOpacity - (streakFactor * 0.6), baseOpacity);
    }
    return baseOpacity + (streakFactor * (maxOpacity - baseOpacity));
  };

  return {
    habits: habitsQuery.data || [],
    completions: completionsQuery.data || [],
    isLoading: habitsQuery.isLoading || completionsQuery.isLoading,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    getCompletionStatus,
    calculateStreak,
    getStreakOpacity,
  };
}
