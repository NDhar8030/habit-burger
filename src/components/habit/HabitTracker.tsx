import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { Habit } from '@/types/habit';
import { HabitRow } from './HabitRow';
import { TimelineHeader } from './TimelineHeader';
import { AddHabitModal } from './AddHabitModal';
import { ArchivedHabitsSheet } from './ArchivedHabitsSheet';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Archive } from 'lucide-react';
import { subDays } from 'date-fns';
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

// Fixed dimensions - must match CSS variables
const CELL_SIZE = 20;
const CELL_GAP = 3;
const LEFT_PANEL_WIDTH = 208; // streak (48px) + habit name (160px)

export function HabitTracker() {
  const {
    habits,
    archivedHabits,
    isLoading,
    createHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    unarchiveHabit,
    toggleCompletion,
    getCompletionStatus,
    calculateStreak,
    getStreakOpacity,
  } = useHabits();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [archivedSheetOpen, setArchivedSheetOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleDays, setVisibleDays] = useState(0);

  // Calculate how many days can fit in the available width
  const calculateVisibleDays = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const availableWidth = containerWidth - LEFT_PANEL_WIDTH - 16; // 16px for padding
    
    if (availableWidth <= 0) {
      setVisibleDays(0);
      return;
    }
    
    // Each cell takes CELL_SIZE + CELL_GAP (except last one has no gap)
    // Formula: n * CELL_SIZE + (n-1) * CELL_GAP <= availableWidth
    // n * (CELL_SIZE + CELL_GAP) - CELL_GAP <= availableWidth
    // n <= (availableWidth + CELL_GAP) / (CELL_SIZE + CELL_GAP)
    const maxDays = Math.floor((availableWidth + CELL_GAP) / (CELL_SIZE + CELL_GAP));
    setVisibleDays(Math.max(0, maxDays));
  }, []);

  // Recalculate on mount and resize
  useEffect(() => {
    calculateVisibleDays();
    
    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleDays();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [calculateVisibleDays]);

  // Generate dates for the timeline - today is at the right, previous days to the left
  const dates = useMemo(() => {
    if (visibleDays === 0) return [];
    
    const today = new Date();
    const result: Date[] = [];
    
    // Start from (visibleDays - 1) days ago, ending with today
    for (let i = visibleDays - 1; i >= 0; i--) {
      result.push(subDays(today, i));
    }
    
    return result;
  }, [visibleDays]);

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

  const handleArchiveHabit = async (id: string) => {
    await archiveHabit.mutateAsync(id);
  };

  const handleUnarchiveHabit = async (id: string) => {
    await unarchiveHabit.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full overflow-hidden">
      {/* Timeline header and grid - no scrolling */}
      <div className="flex-1">
        <TimelineHeader dates={dates} visibleDays={visibleDays} />
        
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex gap-1 mb-4">
              <div className="w-5 h-5 rounded-sm bg-emerald-500/20" />
              <div className="w-5 h-5 rounded-sm bg-emerald-500/40" />
              <div className="w-5 h-5 rounded-sm bg-emerald-500/70" />
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
                visibleDays={visibleDays}
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
                onArchive={() => handleArchiveHabit(habit.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="border-t border-border/50 pt-4 mt-4 flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setAddModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add habit
        </Button>
        
        {archivedHabits.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setArchivedSheetOpen(true)}
          >
            <Archive className="h-4 w-4 mr-2" />
            Archived ({archivedHabits.length})
          </Button>
        )}
      </div>

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

      {/* Archived habits sheet */}
      <ArchivedHabitsSheet
        open={archivedSheetOpen}
        onOpenChange={setArchivedSheetOpen}
        archivedHabits={archivedHabits}
        onRestore={handleUnarchiveHabit}
        onDelete={(habit) => {
          setArchivedSheetOpen(false);
          setDeletingHabit(habit);
        }}
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
