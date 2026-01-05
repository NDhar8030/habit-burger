import { Habit } from '@/types/habit';
import { ArchiveRestore, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface ArchivedHabitsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archivedHabits: Habit[];
  onRestore: (id: string) => void;
  onDelete: (habit: Habit) => void;
}

export function ArchivedHabitsSheet({
  open,
  onOpenChange,
  archivedHabits,
  onRestore,
  onDelete,
}: ArchivedHabitsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Archived Habits</SheetTitle>
          <SheetDescription>
            Habits you've archived. Restore them to continue tracking.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-2">
          {archivedHabits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No archived habits
            </p>
          ) : (
            archivedHabits.map((habit) => (
              <div 
                key={habit.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className="font-medium text-sm">{habit.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onRestore(habit.id)}
                  >
                    <ArchiveRestore className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(habit)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
