import { format, isToday, getDate, getMonth } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimelineHeaderProps {
  dates: Date[];
  visibleDays: number;
}

export function TimelineHeader({ dates, visibleDays }: TimelineHeaderProps) {
  const showMonthLabel = (date: Date, index: number): boolean => {
    if (index === 0) return true;
    const prevDate = dates[index - 1];
    return getMonth(date) !== getMonth(prevDate);
  };

  return (
    <div className="flex items-end mb-2 bg-background z-10 pb-2">
      {/* Sticky left panel - Streak header and habit name spacer */}
      <div className="sticky left-0 z-20 bg-background flex items-end flex-shrink-0">
        <div className="w-12 flex-shrink-0 flex justify-end pr-2">
          <span className="text-[10px] text-muted-foreground font-medium uppercase">Streak</span>
        </div>
        <div className="w-40 flex-shrink-0" />
      </div>
      
      {/* Date headers - only shown if there's room */}
      {visibleDays > 0 && (
        <div className="flex items-end gap-[var(--habit-cell-gap)] ml-2 flex-shrink-0">
          {dates.map((date, index) => {
            const dayNum = getDate(date);
            const showMonth = showMonthLabel(date, index);
            const today = isToday(date);
            
            return (
              <div 
                key={date.toISOString()}
                className={cn(
                  "flex flex-col items-center justify-end",
                  "habit-cell"
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
      )}
    </div>
  );
}
