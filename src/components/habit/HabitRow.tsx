import { Habit, CompletionStatus } from '@/types/habit';
import { CompletionCell } from './CompletionCell';
import { format, isToday, isFuture } from 'date-fns';
import { MoreHorizontal, Trash2, Pencil, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HabitRowProps {
  habit: Habit;
  dates: Date[];
  visibleDays: number;
  getCompletionDetails: (habitId: string, date: string) => { status: CompletionStatus; opacity: number };
  onToggleCompletion: (habitId: string, date: string, status: CompletionStatus) => void;
  streak: { current: number; best: number; total: number };
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

export function HabitRow({
  habit,
  dates,
  visibleDays,
  getCompletionDetails,
  onToggleCompletion,
  streak,
  onEdit,
  onDelete,
  onArchive,
}: HabitRowProps) {
  return (
    <div className="flex items-center group min-h-[var(--habit-row-height)]">
      {/* Sticky left panel - Streak count and habit name */}
      <div className="sticky left-0 z-10 bg-background flex items-center flex-shrink-0">
        {/* Streak count */}
        <div className="w-12 flex-shrink-0 flex items-center justify-end pr-2">
          {streak.current > 0 ? (
            <span className="text-sm font-semibold text-muted-foreground">{streak.current}</span>
          ) : (
            <span className="text-sm text-muted-foreground/50">—</span>
          )}
        </div>

        {/* Habit name in habit color */}
        <div className="w-40 flex-shrink-0 flex items-center justify-between pr-2">
          <div className="flex items-center gap-2 min-w-0">
            <span 
              className="font-medium text-sm truncate"
              style={{ color: habit.color }}
            >
              {habit.name}
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onEdit} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive} className="gap-2">
                <Archive className="h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete} 
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Timeline - no scrolling, only shown if there's room */}
      {visibleDays > 0 && (
        <div className="flex items-center gap-[var(--habit-cell-gap)] py-2 ml-2 flex-shrink-0">
          {dates.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const { status, opacity } = getCompletionDetails(habit.id, dateStr);
            
            return (
              <div key={dateStr}>
                <CompletionCell
                  status={status}
                  color={habit.color}
                  opacity={opacity}
                  isToday={isToday(date)}
                  isFuture={isFuture(date)}
                  onToggle={(newStatus) => onToggleCompletion(habit.id, dateStr, newStatus)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
