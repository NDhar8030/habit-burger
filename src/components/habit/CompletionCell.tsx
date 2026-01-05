import { useState } from 'react';
import { CompletionStatus } from '@/types/habit';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Check, X, SkipForward } from 'lucide-react';

interface CompletionCellProps {
  status: CompletionStatus;
  color: string;
  opacity: number;
  isToday: boolean;
  isFuture: boolean;
  onToggle: (status: CompletionStatus) => void;
}

export function CompletionCell({ 
  status, 
  color, 
  opacity,
  isToday, 
  isFuture,
  onToggle 
}: CompletionCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isFuture) return;
    
    if (status === 'incomplete') {
      onToggle('completed');
    } else if (status === 'completed') {
      onToggle('incomplete');
    } else if (status === 'skipped') {
      onToggle('completed');
    }
  };

  const cellStyle = status === 'completed' || status === 'skipped'
    ? { backgroundColor: color, opacity }
    : {};

  return (
    <ContextMenu>
      <ContextMenuTrigger disabled={isFuture}>
        <button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isFuture}
          className={cn(
            'habit-cell relative transition-all duration-150',
            status === 'incomplete' && 'habit-cell-empty',
            status === 'completed' && 'habit-cell-filled',
            status === 'skipped' && 'habit-cell-skipped',
            isToday && 'ring-2 ring-offset-1 ring-offset-background ring-today-indicator',
            isFuture && 'opacity-30 cursor-not-allowed',
            !isFuture && 'cursor-pointer hover:scale-110'
          )}
          style={cellStyle}
          aria-label={`${status} - ${isToday ? 'Today' : ''}`}
        />
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40">
        <ContextMenuItem 
          onClick={() => onToggle('completed')}
          className="gap-2"
        >
          <Check className="h-4 w-4 text-emerald-500" />
          Complete
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onToggle('skipped')}
          className="gap-2"
        >
          <SkipForward className="h-4 w-4 text-amber-500" />
          Skip
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onToggle('incomplete')}
          className="gap-2"
        >
          <X className="h-4 w-4 text-muted-foreground" />
          Clear
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
