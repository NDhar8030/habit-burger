import { format, isToday, getDate, getMonth } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimelineHeaderProps {
  dates: Date[];
}

export function TimelineHeader({ dates }: TimelineHeaderProps) {
  const showMonthLabel = (date: Date, index: number): boolean => {
    if (index === 0) return true;
    const prevDate = dates[index - 1];
    return getMonth(date) !== getMonth(prevDate);
  };

  return (
    <div className="flex items-end gap-2 mb-2 sticky top-0 bg-background z-10 pb-2">
      {/* Spacer for habit names */}
      <div className="w-48 flex-shrink-0" />
      
      {/* Date headers */}
      <div className="flex items-end gap-[var(--habit-cell-gap)]">
        {dates.map((date, index) => {
          const dayNum = getDate(date);
          const showMonth = showMonthLabel(date, index);
          const today = isToday(date);
          
          return (
            <div 
              key={date.toISOString()}
              className={cn(
                "flex flex-col items-center justify-end",
                "habit-cell",
                today && 'today-column'
              )}
            >
              {showMonth && (
                <span className="text-[10px] font-medium text-muted-foreground uppercase mb-0.5">
                  {format(date, 'MMM')}
                </span>
              )}
              <span 
                className={cn(
                  "text-[11px]",
                  today ? "font-bold text-today-indicator" : "text-muted-foreground",
                  (dayNum === 1 || dayNum % 5 === 0 || today) ? "opacity-100" : "opacity-0"
                )}
              >
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* Streak header spacer */}
      <div className="w-20 flex-shrink-0 pl-3 border-l border-border/50">
        <span className="text-xs text-muted-foreground font-medium">Streak</span>
      </div>
    </div>
  );
}
