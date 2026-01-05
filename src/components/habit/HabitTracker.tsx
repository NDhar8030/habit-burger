import { useState, useRef, useEffect, useMemo } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { Habit } from '@/types/habit';
import { HabitRow } from './HabitRow';
import { TimelineHeader } from './TimelineHeader';
import { AddHabitModal } from './AddHabitModal';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { subDays, addDays, format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const VISIBLE_DAYS = 60;

export function HabitTracker() {
  const {
    habits,
    isLoading,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    getCompletionStatus,
    calculateStreak,
    getStreakOpacity,
  } = useHabits();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate dates for the timeline
  const dates = useMemo(() => {
    const today = new Date();
    const result: Date[] = [];
    for (let i = VISIBLE_DAYS - 1; i >= -3; i--) {
      result.push(i > 0 ? subDays(today, i) : addDays(today, Math.abs(i)));
    }
    return result;
  }, []);

  // Scroll to today on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const todayIndex = dates.findIndex(d => 
        format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
      );
      const cellWidth = 20 + 3; // cell size + gap
      const scrollPosition = todayIndex * cellWidth - container.clientWidth / 2;
      container.scrollLeft = Math.max(0, scrollPosition);
    }
  }, [dates, habits.length]);

  const handleSubmitHabit = async (habit: Partial<Habit>) => {
    if (habit.id) {
      await updateHabit.mutateAsync({ id: habit.id, ...habit });
    } else {
      await createHabit.mutateAsync(habit);
    }
  };

  const handleDeleteHabit = async () => {
    if (deletingHabit) {
      await deleteHabit.mutateAsync(deletingHabit.id);
      setDeletingHabit(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Timeline header and grid */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto scrollbar-thin"
      >
        <div className="min-w-max">
          <TimelineHeader dates={dates} />
          
          {habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex gap-1 mb-4">
                <div className="w-5 h-5 rounded-sm bg-emerald-500/40" />
                <div className="w-5 h-5 rounded-sm bg-emerald-500/60" />
                <div className="w-5 h-5 rounded-sm bg-emerald-500/80" />
                <div className="w-5 h-5 rounded-sm bg-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Create your first habit and start building your streak. 
                Don't break the chain!
              </p>
              <Button onClick={() => setAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Habit
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {habits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  dates={dates}
                  getCompletionStatus={getCompletionStatus}
                  onToggleCompletion={(habitId, date, status) => 
                    toggleCompletion.mutate({ habitId, date, status })
                  }
                  streak={calculateStreak(habit.id)}
                  opacity={getStreakOpacity(habit.id, habit.is_reverse)}
                  onEdit={() => {
                    setEditingHabit(habit);
                    setAddModalOpen(true);
                  }}
                  onDelete={() => setDeletingHabit(habit)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add habit button */}
      {habits.length > 0 && (
        <div className="border-t border-border/50 pt-4 mt-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add habit
          </Button>
        </div>
      )}

      {/* Add/Edit modal */}
      <AddHabitModal
        open={addModalOpen}
        onOpenChange={(open) => {
          setAddModalOpen(open);
          if (!open) setEditingHabit(null);
        }}
        onSubmit={handleSubmitHabit}
        editingHabit={editingHabit}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingHabit} onOpenChange={() => setDeletingHabit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete habit?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingHabit?.name}" and all its completion history. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteHabit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
