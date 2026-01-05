import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Header() {
  const { signOut, user } = useAuth();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Default to dark mode
    const saved = localStorage.getItem('theme');
    const prefersDark = saved === 'dark' || (!saved && true);
    setIsDark(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 opacity-50" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 opacity-70" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 opacity-85" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          </div>
          <h1 className="font-semibold text-lg">Habit Tracker</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
