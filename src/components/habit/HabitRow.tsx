import { Habit, CompletionStatus } from '@/types/habit';
import { CompletionCell } from './CompletionCell';
import { format, isToday, isFuture } from 'date-fns';
import { MoreHorizontal, Flame, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HabitRowProps {
  habit: Habit;
  dates: Date[];
  getCompletionStatus: (habitId: string, date: string) => CompletionStatus;
  onToggleCompletion: (habitId: string, date: string, status: CompletionStatus) => void;
  streak: { current: number; best: number; total: number };
  opacity: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function HabitRow({
  habit,
  dates,
  getCompletionStatus,
  onToggleCompletion,
  streak,
  opacity,
  onEdit,
  onDelete,
}: HabitRowProps) {
  return (
    <div className="flex items-center gap-2 group min-h-[var(--habit-row-height)]">
      {/* Habit name */}
      <div className="w-48 flex-shrink-0 flex items-center justify-between pr-2">
        <div className="flex items-center gap-2 min-w-0">
          <div 
            className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
            style={{ backgroundColor: habit.color }}
          />
          <span className="font-medium text-sm truncate">{habit.name}</span>
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

      {/* Timeline */}
      <div className="flex items-center gap-[var(--habit-cell-gap)] overflow-x-auto scrollbar-thin py-2">
        {dates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const status = getCompletionStatus(habit.id, dateStr);
          
          return (
            <div 
              key={dateStr}
              className={cn(isToday(date) && 'today-column')}
            >
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

      {/* Streak indicator */}
      <div className="w-20 flex-shrink-0 flex items-center gap-1 pl-3 border-l border-border/50">
        {streak.current > 0 && (
          <>
            <Flame 
              className={cn(
                "h-4 w-4",
                streak.current >= 7 ? "text-orange-500" : "text-muted-foreground"
              )} 
            />
            <span className="text-sm font-medium">{streak.current}</span>
          </>
        )}
        {streak.current === 0 && (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}
