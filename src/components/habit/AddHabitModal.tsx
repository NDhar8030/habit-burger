import { useState } from 'react';
import { Habit } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#64748b', // slate
];

interface AddHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (habit: Partial<Habit>) => Promise<void>;
  editingHabit?: Habit | null;
}

export function AddHabitModal({ 
  open, 
  onOpenChange, 
  onSubmit,
  editingHabit 
}: AddHabitModalProps) {
  const [name, setName] = useState(editingHabit?.name || '');
  const [color, setColor] = useState(editingHabit?.color || '#3b82f6');
  const [isReverse, setIsReverse] = useState(editingHabit?.is_reverse || false);
  const [skipWeekends, setSkipWeekends] = useState(editingHabit?.skip_weekends || false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        id: editingHabit?.id,
        name: name.trim(),
        color,
        is_reverse: isReverse,
        skip_weekends: skipWeekends,
      });
      setName('');
      setColor('#3b82f6');
      setIsReverse(false);
      setSkipWeekends(false);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName(editingHabit?.name || '');
      setColor(editingHabit?.color || '#3b82f6');
      setIsReverse(editingHabit?.is_reverse || false);
      setSkipWeekends(editingHabit?.skip_weekends || false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingHabit ? 'Edit Habit' : 'New Habit'}
          </DialogTitle>
          <DialogDescription>
            {editingHabit 
              ? 'Update your habit details below.'
              : 'Create a habit you want to track every day.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 🏃 Exercise, 📚 Read, 💧 Drink water"
              className="h-11"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    color === presetColor 
                      ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110" 
                      : "hover:scale-105"
                  )}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
              <label className="w-8 h-8 rounded-full border-2 border-dashed border-border cursor-pointer flex items-center justify-center hover:border-muted-foreground transition-colors overflow-hidden">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 cursor-pointer opacity-0 absolute"
                />
                <span className="text-xs text-muted-foreground">+</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reverse">Reverse habit</Label>
                <p className="text-xs text-muted-foreground">
                  Color fades as streak grows (for habits to break)
                </p>
              </div>
              <Switch
                id="reverse"
                checked={isReverse}
                onCheckedChange={setIsReverse}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekends">Skip weekends</Label>
                <p className="text-xs text-muted-foreground">
                  Only track on weekdays
                </p>
              </div>
              <Switch
                id="weekends"
                checked={skipWeekends}
                onCheckedChange={setSkipWeekends}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingHabit ? (
                'Save Changes'
              ) : (
                'Create Habit'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
